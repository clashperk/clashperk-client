# Decisions

## 2026-10-11 — No overscroll lock on the page
`html` and `body` keep the browser's default `overscroll-behavior`, so phone browsers offer pull-to-refresh and the bounce shows `bg-background`. Data reloads from the server on every load, so a page reload is the refresh; no custom pull-to-refresh.

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
