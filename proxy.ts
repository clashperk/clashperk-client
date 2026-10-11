import { NextResponse } from "next/server";
import { auth } from "./lib/auth";
import { UserRoles } from "./hooks/api/generated";
import { NO_GUILD_ID } from "./lib/guild";
import { isServerRoute, isUnauthenticatedRoute } from "./lib/routelist";

function redirectTo(searchParams: URLSearchParams, pathname: string) {
  searchParams.delete("handoff_token");
  const redirectParams = searchParams.toString();
  return redirectParams ? `${pathname}?${redirectParams}` : pathname;
}

export default auth((req) => {
  const { pathname, searchParams } = req.nextUrl;

  const handoffToken = searchParams.get("handoff_token");
  if (handoffToken && pathname !== "/handoff") {
    const url = new URL("/handoff", req.url);

    url.searchParams.set("handoff_token", handoffToken);
    url.searchParams.set("redirect", redirectTo(searchParams, pathname));

    return NextResponse.redirect(url);
  }

  if (!req.auth?.user && !isUnauthenticatedRoute(pathname)) {
    const url = new URL("/login", req.url);
    url.searchParams.set("redirect", pathname);

    return NextResponse.redirect(url);
  }

  // Admin pages 404 for everyone else; the admin layout checks again on render.
  if (
    (pathname === "/admin" || pathname.startsWith("/admin/")) &&
    !req.auth?.user?.roles?.includes(UserRoles.ADMIN)
  ) {
    return NextResponse.rewrite(new URL("/404", req.url), { status: 404 });
  }

  // Keep this in the proxy: redirect() from the (app) layout during client navigation loops the router.
  const guildId = req.auth?.user?.guild?.id ?? NO_GUILD_ID;
  if (req.auth?.user && guildId === NO_GUILD_ID && isServerRoute(pathname)) {
    return NextResponse.redirect(new URL("/servers", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|robots.txt|icons|static|api|_vercel).*)",
  ],
};
