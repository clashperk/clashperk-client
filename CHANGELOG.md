# Changelog

## 2026-10-12
- Footer and account menu link to Buy Me a Coffee instead of Ko-fi; the footer tile has a "Recommended" badge.

## 2026-10-10
- War history and war pages keep each attack's stars on the same line as the war or player name on phones.
- Logging in from the landing page without a server selected opens the server picker instead of a blank page.
- Footer copyright shows only the current year.
- Footer Patreon and Ko-fi tiles use the official full-color logos.
- Site font is now Poppins, matching the docs.

## 2026-10-11
- Server picker: when Discord isn't connected, a full-width prompt explains why the list is missing and shows your current server with a link back to its dashboard.
- Theme switcher in the account menu: the selected option is a pill that fits the track's rounded corners.
- Dashboard no longer shows "Unauthorized" right after logging in until you refresh, and stays signed in to the API past an hour without a reload.
- Landing page subtitle now reads "The Clash of Clans Discord bot for every clan."
- Landing page: the orange glow at the top is back to full strength under the header.
- Pull down at the top of any page on a phone to reload it (Safari and Chrome's own pull-to-refresh, which the site had switched off).
- Headers stay put when you pull down or overscroll; only the page under them moves.
- War history on phones shows the opponent's name on its own line instead of cutting it off.
- Dashboard: Clans and Rosters sit in matching cards with same-height headers, so both columns line up; category filters and clan rows live inside the Clans card, and rosters are rows in one card. Phone width no longer scrolls sideways by a few pixels.
- Pinned filter bars on links, rosters, reminders and the server picker get a bottom edge and soft shadow once content scrolls under them, so table headers no longer look like part of the bar.
- Login page: ClashPerk logo, "Continue with Discord" with a short note on what happens next, friendly messages when sign-in fails, and after sign-in you land on the page you were trying to open. Signed-in visitors see Continue and Sign out instead of a role chip.
- Handoff links without a token show "This sign-in link doesn't work" with a way to sign in, instead of spinning forever.
- Public pages linked from Discord (war history, single war, capital contributions, activity charts) use the landing page header and footer with the Supercell fan content notice, a theme toggle, the dashboard style, and an error state with Try again.
- War page shows a scoreboard for both clans with Clan / Opponent tabs; war history adds totals, working Town Hall images and CWL seasons that fit on phones (repeated CWLs in a month are labelled "1 of 2"); capital contributions add totals and a per-player ranking; activity charts fit on phones with a legend that hides or shows each clan.
- Links page no longer logs a hydration mismatch for the clan picker.
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
- Admin section in the sidebar, visible only to ClashPerk admins: a Command usage page lists every bot command run across all servers, newest first, with its arguments, user and server. Filter by command, Discord user ID and server ID together, with the last 24h / 7 days / 30 days switch at the right; clicking a user or server in a row fills its field. Each row opens to the full log record as JSON (locale, interaction type, application ID and the parsed arguments included) with a copy button; "Expand all JSON" opens every row at once, including rows loaded later. Loads 100 at a time. Non-admins get a 404 at `/admin`.
- Admin: the Command usage page is now called Usage, in the sidebar and its title.
- Activity page (sidebar, after Clans): pick a clan to see each member's Town Hall, when they were last seen and how active they've been today and over 30 days. Filter by Today / 1–7 days / 7+ days, search by name or tag, and sort by last seen, activity or Town Hall. Least recently seen comes first. `/activity?tag=…` opens a clan directly.
- Profile: an Account stats section for each linked account (tabs when you have more than one): wars, attacks, 3-star rate and missed attacks over the last 6 months with a row per season; each CWL season's stars, rounds played and average destruction (two CWLs in a month show as "1 of 2"); and the clans ClashPerk has seen the account in. Each part loads on its own with its own Try again, and "Full war history" opens the public war page.
- The dashboard works without a Discord server. After signing in you land on Home, which shows your clans (the clans your linked accounts are in, plus any clan you add by tag) and your linked accounts. Activity works for any of those clans, or any clan tag pasted into the clan picker.
- Sidebar: the switcher at the top shows your default player (first linked account) when no server is open, and the server when one is. Its menu lists your servers with ClashPerk, "Add ClashPerk to a server", "See all servers" and "Use without a server". Clans, Rosters, Links and Reminders appear under it only while a server is open; leaving a server from one of those pages takes you to Home.
- Settings and the server picker no longer say a server is required.
- Admin pages have their own sidebar (Usage, Back to dashboard). Admins reach them from "Admin" in the account menu; the Admin group is gone from the dashboard sidebar. `/admin` opens Usage, and `/admin/*` is a 404 for everyone else.
- Profile: "Make default" in an account's menu makes it your default account, the one the sidebar shows when no server is open and the bot uses when no account is named. The default is labelled "Default" when you have more than one account; if saving fails, the order goes back and the page says why. Linking another account no longer changes your default; new accounts go to the end of the list.
- Phones: a floating tab bar at the bottom replaces the menu button. It holds Home, Activity and Profile (Home, Clans, Rosters and Activity with a server open), plus More, which opens a sheet with the server switcher, the other pages and the account menu. The header shows the page title and a chip for the open server or your default player, which also opens More. Admin pages keep their sidebar.
- Settings: the "No server open" card no longer squeezes its text beside the button on phones.
- Phones: the tab bar is gone. The menu button next to the page title, or the server/player chip, opens one sheet with every page (You, Server when one is open, Account), the server switcher and the account menu. Nothing floats over the page any more. Opening or closing your account menu in the sheet keeps it in view instead of jumping. The server menu's list scrolls on its own, so "Add ClashPerk to a server", "See all servers" and "Use without a server" stay visible on short screens. Tapping the page title next to the menu icon also opens the menu.
