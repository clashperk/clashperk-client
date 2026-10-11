import { NextResponse } from "next/server";
import { auth } from "./lib/auth";
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

  // Keep this in the proxy: redirect() from the (app) layout during client navigation loops the router.
  if (req.auth?.user?.guild.id === NO_GUILD_ID && isServerRoute(pathname)) {
    return NextResponse.redirect(new URL("/servers", req.url));
  }

  // Set the API cookie here too: the page's first API calls run before LoginProvider's effect.
  const response = NextResponse.next();
  const accessToken = req.auth?.accessToken;
  if (accessToken && req.cookies.get("x-access-token")?.value !== accessToken) {
    response.cookies.set("x-access-token", accessToken, { path: "/" });
  }
  return response;
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|robots.txt|icons|static|api|_vercel).*)",
  ],
};
