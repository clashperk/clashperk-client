# Decisions

## 2026-10-11 — API token read from the session, not a cookie
The browser `api` client takes its token from `useSession()` (set by `ApiTokenProvider` during render, so a page's first requests have it) instead of a JS-readable `x-access-token` cookie. One source of truth: no copy to drift from the session or outlive sign-out. The session is refetched every 5 minutes and the token is reissued in its last 10, so it renews before it expires; a 401 still triggers one session fetch and retry. `api` is browser-only; server code uses `serverApi`.

## 2026-10-11 — No overscroll lock on the page
`html` and `body` keep the browser's default `overscroll-behavior`, so phone browsers offer pull-to-refresh and the bounce shows `bg-background`. Data reloads from the server on every load, so a page reload is the refresh; no custom pull-to-refresh.
The site header and the phone dashboard header are `fixed` with a same-height spacer, not `sticky`, because sticky headers move with the page during the bounce. The landing hero glow starts behind the header and fades in there, so it keeps full strength below the header and the bounce shows no hard edge.

## 2026-10-10 — New design tokens
Decided by: Suvajit. Visual style only — ClashPerk keeps its name, logo and copy.
- Dashboard tokens live in `:root` / `.dark`; marketing tokens are scoped under `.landing`.
- `--primary` is the brand orange so buttons and selected states match the landing: `#c44800` in light (white text passes 4.5:1; the logo's `#d14c00` does not) and `#ee7d2b` with near-black text in dark. `--brand` stays the logo orange (`#d14c00` to `#de8f28`) for accents. Success states stay green.
- The site font is Poppins, the closest match to Google Sans among the docs site's built-in fonts, so the site and docs.clashperk.com look alike. It loads through `next/font/google`, which downloads it at build time and serves it from our domain.

## 2026-10-10 — Light-only marketing routes via next-themes `forcedTheme`
`/`, `/terms`, `/privacy` force `light` in `ThemeProvider`, so the user's saved dashboard theme is untouched. Chosen over overriding variables with a nested class, which would still trigger `dark:` variants on those pages.

## 2026-10-10 — Game-meaning colors kept, shaded per theme
Stars, losses, map position and Town Hall keep their hues; `-400` shades become `-600` in light mode (`dark:` keeps `-400`). Chart series palettes and the Discord login button are unchanged.

## 2026-10-10 — Marketing routes split into a `(marketing)` route group
`/`, `/terms`, `/privacy` live in `app/(marketing)` with no session fetch so they prerender; every other route sits in `app/(app)`, whose layout keeps `getSession`, `SessionProvider` and the app shell. Chosen over keeping one root layout, which forced every page to render per request. The proxy still decodes the auth cookie on all routes because it also handles `handoff_token` redirects.

## 2026-10-10 — Hero embeds are illustrative HTML, not screenshots
The hero's Discord messages are built in HTML with invented clan and player names, so they stay sharp, theme-consistent and free of real user data.

## 2026-10-11 — Opt-in dev proxy for the API
The production API's CORS allowlist excludes localhost. `next.config.ts` adds a `/api-proxy/*` rewrite only when `API_PROXY_TARGET` is set, so local dev can point `NEXT_PUBLIC_API_BASE_URL` at `http://localhost:<port>/api-proxy/v1`. Chosen over adding localhost to the production allowlist. Note: local runs then read and write live data.

## 2026-10-11 — Sidebar server subtitle shows the clan count
The subtitle counts clans from `GET /guilds/:id/clans`. It does not show players: that endpoint returns a placeholder `members: 50` for every clan, so a sum would be fake. Add players back once the API returns real member counts. The server ID is in the block's tooltip.

## 2026-10-11 — Dashboard shows only fields the API fills in
`GET /guilds/:id/clans` returns placeholder `members` (50), `level` (10) and `league` ("Unknown") for every clan, so clan cards show only name, tag and category. Category icons and colors are matched by keyword on the server-defined category name (CWL, war, esports, events, farming, feeder), with a neutral shield otherwise. No subscription or plan content until there is a real billing API.

## 2026-10-11 — Server picker verifies on the server, not the browser
Discord sign-in keeps the user's OAuth access token inside the encrypted session cookie (never in the session JSON sent to the browser). Switching servers goes through next-auth's session `update({ guildId })`; the `jwt` callback re-fetches `/users/@me/guilds`, requires owner, Manage Server or Administrator, and checks ClashPerk is in the server via the backend's API-key `POST /auth/bot-guilds` before issuing an API token for it. A forged `guildId` is ignored. Sessions from a bot handoff link have no Discord token, so the picker asks them to sign in with Discord.

## 2026-10-11 — Reminders stay read-only
The backend only has `GET /guilds/:id/reminders`, so the page shows reminders and their runs but has no create, edit or toggle controls. "Failing" means the reminder's latest run failed (channel missing, missing permissions, bot not in server); the summary counts only the runs the API returns, which cover the last 3 days. The clan filter loads the server's categories just to group clans and falls back to a flat list if that request fails.

## 2026-10-11 — Rosters filter row uses container queries
The member column's width depends on the app sidebar and the roster list as much as the window, so the filter row breaks on the column's own width (`@container` on the roster `main`). Roster create, edit, delete, clone, add-members and refresh stay out of the UI: those backend endpoints are still stubs. CSV export runs in the browser on the members currently shown.

## 2026-10-10 — Official Patreon and Ko-fi logos in the footer
The footer uses the official brand marks (Patreon's symbol path from its CDN app icon, without the black app-icon square so it matches the other tiles' size; Ko-fi's symbol from its brand kit), not single-color Simple Icons. They live in `public/icons/` because the proxy matcher only skips `icons/` and `static/`; any other public folder redirects to `/login`.

## 2026-10-11 — Public /web pages share the landing chrome
Pages opened from Discord links use `SiteHeader` (plus a theme toggle) and the footer's legal row, which carries Supercell's fan content notice required for pages showing game assets. The four community tiles stay on the landing page only. Stars keep their gold colour because players read them as the game's stars; everything else follows the neutral dashboard style. Town Hall images come from `assets.clashperk.com`.

## 2026-10-11 — Links page renders without a Suspense wrapper
The `(app)` layout reads request headers, so every page there is dynamic and `useSearchParams` needs no Suspense boundary. The extra boundary shifted React's generated IDs between server and client and caused a hydration mismatch on the clan picker.

## 2026-10-11 — Sign-in redirects are same-site paths only
`/login` and `/handoff` read `?redirect=` through `safeRedirect` (`lib/redirect.ts`): only paths starting with a single `/` are kept, `/login` itself falls back to `/dashboard`, so the parameter cannot send people to another site or loop. The Discord sign-in button keeps Discord's blue instead of the brand orange because people recognise it as the Discord button.

## 2026-10-11 — No preview deployments
Every branch push deployed twice (the preview workflow and Vercel's Git integration) and used up the free plan's 100 deployments a day. Production deploys only from `main` through `release-prod.yaml` with the Vercel CLI, so `vercel.json` turns off Git-triggered deployments and the preview workflow is gone.

## 2026-10-11 — main is the working branch
`main` replaces `dev` as the branch work starts from and PRs target. `release-prod.yaml` deploys every push to `main` with the Vercel CLI; no other branch deploys.

## 2026-10-10 — No-server redirect lives in the proxy
Server-only pages (`/dashboard`, `/clans`, `/rosters`, `/links`, `/reminders`) send sessions without a selected server to `/servers` from `proxy.ts`. Calling `redirect()` from the `(app)` layout did the same on a full page load, but during client navigation (landing page "Log In" → `/dashboard`) the router refetched `/servers` in an endless loop and rendered a blank page.

## 2026-10-11 — Vercel Web Analytics
Default `<Analytics />` from `@vercel/analytics/next` in the root layout, no custom events. The proxy matcher skips `_vercel` so the analytics script and page-view beacons are not redirected to `/login` for signed-out visitors.

## 2026-10-11 — Admin pages gated on the server, inputs cleaned for the metrics API
`/admin/*` checks the session's `admin` role in `app/(app)/admin/layout.tsx` and returns a 404 otherwise; the sidebar only hides the link. The API also requires the role, so this keeps non-admins from seeing an empty page shell.
`GET /metrics/commands-usage-logs` is excluded from the generated client, so the page calls it through `httpClient.request` with a local `CommandLog` type matching the bot's `bot_command_logs` columns. The endpoint pastes `query`, `userId` and `guildId` straight into its SQL, so the page strips `' \ % _` from the search and only sends numeric IDs. The real fix is parameterising that query in the backend.

## 2026-10-11 — Activity page buckets and data
Members are grouped by last seen: under 24 hours, 1–7 days, and 7+ days ("inactive"). Seven days is the point where leaders usually follow up; it's one constant (`INACTIVE_AFTER`) in `app/(app)/activity/page.tsx`. Data comes from `GET /clans/:tag/lastseen`, which only lists members ClashPerk has a player record for and leaves out `scores` for members with no activity in 30 days, so the page treats a missing score as 0. It doesn't show `leagueId` or the player record's `clan`, which can lag behind the live clan.

## 2026-10-11 — Profile account stats
Uses `GET /players/:tag/wars/aggregate`, `/clan-war-leagues/aggregate` (both from 6 months back, the same window as the public war page) and `/history`. The wars summary covers regular, friendly and CWL wars together, so it's labelled "All wars". Its `totalStars` counts only new stars (stars that improved on earlier hits on that base), so the page shows 3-star rate and missed attacks instead of a star total. CWL shows rounds played out of the group's rounds, not attacks, because sitting out a round isn't a missed attack. Clan history shows month ranges only: `lastSeen` isn't refreshed often enough to call a clan "current". The tag `#00000` is the tracker's "no clan" and shows as "Not in a clan".

