import { HandoffUserDto, JwtUserInput, UserRoles } from "@/hooks/api/generated";
import { isAxiosError } from "axios";
import { JWTPayload, SignJWT } from "jose";
import NextAuth, { CredentialsSignin, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import Discord from "next-auth/providers/discord";
import { v4 as uuid } from "uuid";
import { listManageableServers } from "./discord-servers";
import { NO_GUILD_ID } from "./guild";
import { serverApi } from "./server-api";

const EXPIRES_IN_SECONDS = 60 * 60;
// Reissued this long before expiry; the client refetches the session more often than this.
const REFRESH_BEFORE_EXPIRY_SECONDS = 10 * 60;

const defaultGuild = {
  id: NO_GUILD_ID,
  name: "CLASHPERK",
  iconUrl: "/icons/icon-192x192.png",
};

const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

class LoginError extends CredentialsSignin {
  constructor(message: string) {
    super();
    this.code = message;
  }
}

const generateToken = async (payload: JWTPayload) => {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(new Date(Date.now() + EXPIRES_IN_SECONDS * 1000))
    .sign(secret);

  return {
    token,
    expiresIn: Math.floor(Date.now() / 1000) + EXPIRES_IN_SECONDS,
  };
};

const issueApiToken = async (token: JWT) => {
  const generated = await generateToken({
    userId: token.userId as string,
    jti: token.jti as string,
    roles: token.roles as string[],
    // "No server yet" sessions carry the NO_GUILD_ID placeholder, which isn't a server to grant.
    guildIds:
      token.guildId && token.guildId !== NO_GUILD_ID
        ? [token.guildId as string]
        : [],
    username: token.username as string,
    version: "1",
    applicationId: token.applicationId as string,
  } satisfies JwtUserInput);

  token.accessToken = generated.token;
  token.expiresIn = generated.expiresIn;
};

/** Switches the session to `guildId` only if Discord says the user manages it and ClashPerk is in it. */
const selectGuild = async (token: JWT, guildId: string) => {
  if (!token.discordAccessToken) return;

  const servers = await listManageableServers(
    token.discordAccessToken as string,
  ).catch(() => []);
  const server = servers.find((s) => s.id === guildId && s.hasBot);
  if (!server) return;

  token.guild = { id: server.id, name: server.name, iconUrl: server.iconUrl };
  token.guildId = server.id;
  // Handoff sessions may carry a custom bot; a server picked here uses the main bot.
  token.applicationId = null;
  await issueApiToken(token);
};

/** "Use without a server": the dashboard keeps working on the user's own accounts and clans. */
const clearGuild = async (token: JWT) => {
  token.guild = defaultGuild;
  token.guildId = NO_GUILD_ID;
  token.applicationId = null;
  await issueApiToken(token);
};

const getUserRoles = async (userId: string) => {
  try {
    const { data } = await serverApi.auth.getAuthUser({ userId });

    return data.roles.includes(UserRoles.ADMIN)
      ? [UserRoles.ADMIN]
      : [UserRoles.USER];
  } catch {
    return [UserRoles.USER];
  }
};

const decodeHandoffToken = async (token: string): Promise<HandoffUserDto> => {
  try {
    const { data } = await serverApi.auth.decodeHandoffToken({ token });
    return data;
  } catch (error) {
    throw new LoginError(
      (isAxiosError(error) && error.response?.data?.message) || error.message,
    );
  }
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Discord({
      // Discord now sends an `iss` param on the OAuth callback (RFC 9207); without a
      // matching issuer Auth.js compares it to its "https://authjs.dev" placeholder and fails.
      issuer: "https://discord.com",
      authorization: {
        params: { scope: "identify guilds", prompt: "none" },
      },
    }),
    Credentials({
      credentials: {
        token: { label: "Token", required: true, type: "text" },
      },
      async authorize({ token }) {
        const user = await decodeHandoffToken(token as string);
        return {
          id: user.userId,
          roles: user.roles,
          name: user.displayName,
          image: user.avatarUrl,
          guild: user.guild,
          username: user.username,
          applicationId: user.applicationId,
        };
      },
    }),
  ],
  callbacks: {
    signIn: async ({ user, account, profile }) => {
      const userId = profile?.id || account?.providerAccountId;
      if (!userId) return false;

      user.id = userId;
      user.roles = user.roles || (await getUserRoles(userId));
      user.username = (profile?.username || user.username) as string;

      return true;
    },
    authorized: ({ auth }) => !!auth,
    jwt: async ({ token, user, account, trigger, session }) => {
      // Sessions without a guild (e.g. written by older code as null) mean "no server".
      if (token.userId && !token.guild) {
        token.guild = defaultGuild;
        token.guildId = NO_GUILD_ID;
      }

      if (trigger === "update" && typeof session?.guildId === "string") {
        if (session.guildId === NO_GUILD_ID) await clearGuild(token);
        else await selectGuild(token, session.guildId);
        return token;
      }

      if (user && account) {
        const userId = account.providerAccountId;

        token.sub = userId;
        token.userId = userId;
        token.jti = uuid();
        token.roles = user.roles;
        token.username = user.username;

        token.guild = user.guild || defaultGuild;
        token.guildId = user.guild?.id || defaultGuild.id;

        token.applicationId = user.applicationId;
        token.discordAccessToken =
          account.provider === "discord" ? account.access_token : undefined;

        await issueApiToken(token);
      }

      if (
        token &&
        Math.floor(Date.now() / 1000) + REFRESH_BEFORE_EXPIRY_SECONDS >
          (token.expiresIn as number)
      ) {
        await issueApiToken(token);
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.sub as string;
        session.user.displayName = token.name as string;
        session.user.roles = token.roles as string[];
        session.user.avatarUrl = token.picture as string;
        session.user.username = token.username as string;
        session.user.guild = (token.guild as User["guild"]) ?? defaultGuild;
        session.accessToken = token.accessToken as string;

        delete session.user.image;
        delete session.user.name;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
    signOut: "/login",
    newUser: "/login",
    verifyRequest: "/login",
  },
});

/** On a server misconfiguration `auth()` resolves to Auth.js' error body (no `user`); treat that as signed out. */
export const getSession = async () => {
  const session = await auth();
  return session?.user ? session : null;
};
