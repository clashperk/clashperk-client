// Server-only: uses the user's Discord OAuth token and the service API key.

const DISCORD_API = "https://discord.com/api/v10";
const MANAGE_GUILD = BigInt(1 << 5);
const ADMINISTRATOR = BigInt(1 << 3);

export type ServerOption = {
  id: string;
  name: string;
  iconUrl: string | null;
  hasBot: boolean;
};

type DiscordGuild = {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
};

/** Discord rejected the stored OAuth token (expired or revoked); the user must sign in again. */
export class DiscordTokenError extends Error {}

const canManage = (guild: DiscordGuild) =>
  guild.owner ||
  (BigInt(guild.permissions) & (MANAGE_GUILD | ADMINISTRATOR)) !== BigInt(0);

const iconUrl = (guild: DiscordGuild) =>
  guild.icon
    ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`
    : null;

async function botGuildIds(guildIds: string[]) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/bot-guilds`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.SERVICE_API_KEY!,
      },
      body: JSON.stringify({ guildIds }),
      cache: "no-store",
    },
  );
  if (!res.ok) throw new Error(`Bot server lookup failed (${res.status})`);
  const { guilds } = (await res.json()) as { guilds: { id: string }[] };
  return new Set(guilds.map((guild) => guild.id));
}

/** Servers the user can manage on Discord, flagged with whether ClashPerk is in each. */
export async function listManageableServers(
  discordAccessToken: string,
): Promise<ServerOption[]> {
  const res = await fetch(`${DISCORD_API}/users/@me/guilds`, {
    headers: { Authorization: `Bearer ${discordAccessToken}` },
    cache: "no-store",
  });
  if (res.status === 401) throw new DiscordTokenError();
  if (!res.ok) throw new Error(`Discord returned ${res.status}`);

  const manageable = ((await res.json()) as DiscordGuild[]).filter(canManage);
  if (manageable.length === 0) return [];

  const withBot = await botGuildIds(manageable.map((guild) => guild.id));
  return manageable
    .map((guild) => ({
      id: guild.id,
      name: guild.name,
      iconUrl: iconUrl(guild),
      hasBot: withBot.has(guild.id),
    }))
    .sort(
      (a, b) =>
        Number(b.hasBot) - Number(a.hasBot) || a.name.localeCompare(b.name),
    );
}
