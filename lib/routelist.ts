export const unauthenticatedRoutes = [
  "/login",
  "/handoff",
  "/",
  "/battlelog",
  "/terms",
  "/privacy",
];

/** Public pages linked from Discord messages (war history, charts, etc.). */
const unauthenticatedPrefixes = ["/web/"];

export const isUnauthenticatedRoute = (pathname: string) =>
  unauthenticatedRoutes.includes(pathname) ||
  unauthenticatedPrefixes.some((prefix) => pathname.startsWith(prefix));
