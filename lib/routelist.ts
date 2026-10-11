export const unauthenticatedRoutes = [
  "/login",
  "/handoff",
  "/",
  "/terms",
  "/privacy",
];

/** Public pages linked from Discord messages (war history, charts, etc.). */
const unauthenticatedPrefixes = ["/web/"];

export const isUnauthenticatedRoute = (pathname: string) =>
  unauthenticatedRoutes.includes(pathname) ||
  unauthenticatedPrefixes.some((prefix) => pathname.startsWith(prefix));

/** Marketing pages always render in the light brand theme. */
const lightOnlyRoutes = ["/", "/terms", "/privacy"];

export const isLightOnlyRoute = (pathname: string) =>
  lightOnlyRoutes.includes(pathname);

/** Pages that only make sense for a selected Discord server. */
const serverRoutes = [
  "/dashboard",
  "/clans",
  "/activity",
  "/rosters",
  "/links",
  "/reminders",
];

export const isServerRoute = (pathname: string) =>
  serverRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
