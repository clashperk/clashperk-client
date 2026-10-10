# Changelog

## 2026-10-11
- Dashboard uses the brand orange for buttons, progress bars and selected states; buttons are pills and cards have softer corners and shadows.
- Dashboard headings are lighter, stat cards get orange icon tiles, and sidebar labels are no longer all caps.
- Sidebar server and user blocks sit on a soft tint.
- Sidebar user row expands in place into a menu: profile, settings, System/Light/Dark theme switcher, resource links (guide, FAQ, support Discord, invite, Patreon, Ko-fi) and log out.
- Settings theme tabs no longer cause a hydration error on load.
- Settings page shows only what works: your Discord account and current server with log out, and a System/Light/Dark theme picker. The placeholder bot settings (language, maintenance, automation) are gone.
- Profile page lists your real linked accounts and can link, verify (in-game API token) and unlink them; reordering and per-player game stats are gone.
- Sidebar shows the server's clan and player counts under its name instead of the raw server ID.
- Dashboard subscription and server cards stack until large screens, so the upgrade button no longer overflows.
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
