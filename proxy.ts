import { NextResponse } from "next/server";
import { auth } from "./lib/auth";

function redirectTo(searchParams: URLSearchParams, pathname: string) {
  searchParams.delete("handoff_token");
  const redirectParams = searchParams.toString();
  return redirectParams ? `${pathname}?${redirectParams}` : pathname;
}

export default auth((req) => {
  const { pathname, hostname, searchParams } = req.nextUrl;

  const headers = new Headers(req.headers);
  headers.set("x-hostname", hostname);
  headers.set("x-pathname", pathname);

  const handoffToken = searchParams.get("handoff_token");
  if (handoffToken && pathname !== "/handoff") {
    const url = new URL("/handoff", req.url);

    url.searchParams.set("handoff_token", handoffToken);
    url.searchParams.set("redirect", redirectTo(searchParams, pathname));

    return NextResponse.redirect(url);
  }

  if (!req.auth && !["/login", "/handoff", "/"].includes(pathname)) {
    const url = new URL("/login", req.url);
    url.searchParams.set("redirect", pathname);

    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request: { headers } });
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|robots.txt|icons|static|api).*)",
  ],
};
