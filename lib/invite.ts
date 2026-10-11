export const CLIENT_ID = "526971716711350273";

/** Discord's add-bot page; with a server id it skips Discord's own server picker. */
export const inviteUrl = (guildId?: string) =>
  guildId
    ? `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&guild_id=${guildId}&disable_guild_select=true`
    : `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}`;
