import { api } from "@/hooks/api/axios";
import { HandoffUserDto, JwtUserInput, UserRoles } from "@/hooks/api/generated";
import { JWTPayload, SignJWT } from "jose";
import NextAuth, { CredentialsSignin, User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Discord from "next-auth/providers/discord";
import { v4 as uuid } from "uuid";

const EXPIRES_IN_SECONDS = 60 * 60;
const REFRESH_INTERVAL_SECONDS = 60;

const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
const authHeaders = { "x-api-key": process.env.SERVICE_API_KEY };

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
    expiresIn:
      Math.floor(Date.now() / 1000) +
      REFRESH_INTERVAL_SECONDS +
      EXPIRES_IN_SECONDS,
  };
};

const getUserRoles = async (userId: string) => {
  try {
    const { data } = await api.auth.getAuthUser(
      { userId },
      { headers: authHeaders },
    );

    return data.roles.includes(UserRoles.ADMIN)
      ? [UserRoles.ADMIN]
      : [UserRoles.ADMIN];
  } catch {
    return [UserRoles.ADMIN];
  }
};

const decodeHandoffToken = async (token: string): Promise<HandoffUserDto> => {
  try {
    const { data } = await api.auth.decodeHandoffToken(
      { token },
      { headers: authHeaders },
    );
    return data;
  } catch (error) {
    throw new LoginError(error.message);
  }
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Discord({
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
    jwt: async ({ token, user, account }) => {
      if (user && account) {
        const userId = account.providerAccountId;

        token.sub = userId;
        token.userId = userId;
        token.jti = uuid();
        token.roles = user.roles;
        token.username = user.username;

        token.guild = user.guild;
        token.guildId = user.guild.id;

        token.applicationId = user.applicationId;

        const generated = await generateToken({
          userId: token.userId as string,
          jti: token.jti as string,
          roles: token.roles as string[],
          guildIds: token.guildId ? [token.guildId as string] : [],
          username: token.username as string,
          version: "1",
          applicationId: token.applicationId as string,
        } satisfies JwtUserInput);

        token.accessToken = generated.token;
        token.expiresIn = generated.expiresIn;
      }

      if (
        token &&
        Math.floor(Date.now() / 1000) + REFRESH_INTERVAL_SECONDS >
          (token.expiresIn as number)
      ) {
        const generated = await generateToken({
          userId: token.userId as string,
          jti: token.jti as string,
          roles: token.roles as string[],
          guildIds: token.guildId ? [token.guildId as string] : [],
          username: token.username as string,
          version: "1",
          applicationId: token.applicationId as string,
        } satisfies JwtUserInput);

        token.accessToken = generated.token;
        token.expiresIn = generated.expiresIn;
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
        session.user.guild = token.guild as User["guild"];
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
