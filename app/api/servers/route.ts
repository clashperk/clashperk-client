import {
  DiscordTokenError,
  listManageableServers,
} from "@/lib/discord-servers";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Lists the signed-in user's manageable Discord servers. `needsDiscord` means sign in with Discord again. */
export async function GET(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    secureCookie: req.nextUrl.protocol === "https:",
  });
  if (!token)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  if (!token.discordAccessToken) {
    return NextResponse.json({ servers: [], needsDiscord: true });
  }

  try {
    const servers = await listManageableServers(
      token.discordAccessToken as string,
    );
    return NextResponse.json({ servers, needsDiscord: false });
  } catch (error) {
    if (error instanceof DiscordTokenError) {
      return NextResponse.json({ servers: [], needsDiscord: true });
    }
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 502 },
    );
  }
}
