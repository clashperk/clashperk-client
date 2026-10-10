# Changelog

## 2026-10-11
- Removed the redirects for old bot links (`/charts/*`, `/players/:tag`, `/players/:tag/wars`, `/web/players/:tag`, `/members/:tag`, `/capital/:tag`); only the `/web/...` URLs work now.
- Removed the unlinked `/battlelog` page, which only showed bundled sample battles.
- Links, rosters and server picker: the search and filter bar stays pinned at the top while you scroll (tablet and desktop).
- Reminders page: on wide screens a side panel with the summary card and a "Coming up" list of the next runs; a summary card with the next reminder, sent / skipped / failed runs in the last 3 days and a "Needs attention" row that jumps to reminders whose last run failed; reminders grouped by timing in smaller cards; type tabs plus a search, All / Scheduled / Idle / Failing filter and the searchable clan picker from the Links page.
- Rosters page: roster list with search, All / Open / Closed filters and category groups; a roster header with category, signup rules and schedule; member rows with war in/out, hero total, trophies, role and signup time; member search, an All / In war / Out filter, sort by Town Hall, heroes, newest sign-ups or name, and CSV export of the shown members. The filter row fits narrow columns and phones.
- Links page: searchable clan picker grouped by category, a linked-progress bar with All / Linked / Not linked filters, a ×N chip that shows every player one Discord user owns, sortable TH / Player / Role columns (default role then Town Hall), member cards on phones, player names linking to their war history, a lock on links you cannot remove, and Discord avatars in the Link dialog (needs the backend member search to return `avatarUrl`).
- Server picker: after signing in with Discord you choose one of the servers you manage (Manage Server or Administrator). Servers with ClashPerk can be opened; the rest get an Invite button. The list ranks your current and recently used servers first, then by clan and member count, with search, a ClashPerk here / not added filter and sort options. The sidebar server block opens the picker to switch servers. Needs the backend's `POST /auth/bot-guilds`.
- Profile page: header with your Discord avatar and link counts, account cards with a Verified pill or Verify button, unlink moved into a "…" menu, and a "How to verify" guide.
- Settings: theme options show a small light/dark preview, "No server selected" gets its own row with an Invite button, the account row links to Profile, and a new About section links to the guide, Support Discord, Terms and Privacy.
- On mobile, the Link and Verify dialogs stack their submit and Cancel buttons together at the bottom.
- Sidebar highlights the page you're on, and the mobile header shows that page's name instead of always "Dashboard".
- Dashboard uses the brand orange for buttons, progress bars and selected states; buttons are pills and cards have softer corners and shadows.
- Dashboard headings are lighter, stat cards get orange icon tiles, and sidebar labels are no longer all caps.
- Sidebar server and user blocks sit on a soft tint.
- Sidebar user row expands in place into a menu: profile, settings, System/Light/Dark theme switcher, resource links (guide, FAQ, support Discord, invite, Patreon, Ko-fi) and log out.
- Settings theme tabs no longer cause a hydration error on load.
- Settings page shows only what works: your Discord account and current server with log out, and a System/Light/Dark theme picker. The placeholder bot settings (language, maintenance, automation) are gone.
- Profile page lists your real linked accounts and can link, verify (in-game API token) and unlink them; reordering and per-player game stats are gone.
- Sidebar shows the server's clan count under its name instead of the raw server ID.
- Dashboard redesigned around real data: a server banner with clan, roster, signup and linked-account counts; clans as cards filterable by category, each category with its own color and icon; open rosters with clan badges and signup progress. Subscription, plan and placeholder server content are gone.
- Clans page redesigned: category sidebar (pills on mobile) with drag to reorder, clan cards with drag to reorder and a "Move to category" menu, search. A failed save now shows an error and restores the previous order. Fake level/league/member fields, the dead "New Clan" button and local-only "New Category" are gone.
- Links and Rosters pages follow the dashboard style: page headers, rounded cards, neutral Town Hall chips, clan badges in the roster list and a signup progress bar; the rosters mobile menu is now a roster picker.
- Inputs, selects and textareas are taller with softer corners; focus rings are neutral grey instead of orange; disabled primary buttons turn grey instead of faded orange.
- Reminders page redesigned around the server's real reminders (read-only): clan war, capital raid and clan games tabs, clan filter and search, each reminder's timing, targets and channel, plus its upcoming runs and the last 3 days of runs with sent/skipped/failed outcomes. Needs the backend's `GET /guilds/:guildId/reminders`.
- Local development: optional `/api-proxy` rewrite (set `API_PROXY_TARGET`) so the dashboard can call the production API from localhost.

## 2026-10-10
- New visual system: refreshed light and dark colors for the dashboard, a warm light palette for marketing pages, Google Sans Flex font, 12px radius.
- Dashboard follows the OS theme by default; the Settings theme switch (System/Light/Dark) now works.
- Landing, Terms and Privacy pages always render light.
- Landing page restyled in a light style (pill CTAs, logo orange gradient, soft cards).
- Accent colors (stars, losses, map positions) stay legible in light mode.
- Landing hero shows overlapping sample Discord embeds (hover to bring one forward) and a "40,000+ Discord servers" badge.
- Footer is now community tiles (Discord, GitHub, Patreon, Ko-fi) plus a slim legal bar with the Supercell disclaimer; PayPal replaced by Ko-fi.
- Terms and Privacy pages share the landing header and footer.
- Landing, Terms and Privacy are prerendered as static pages and no longer wait on the session lookup.
- Page no longer bounces when scrolled past the top or bottom.
