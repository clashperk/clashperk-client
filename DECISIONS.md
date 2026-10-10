# Decisions

## 2026-10-10 — New design tokens
Decided by: Suvajit. Visual style only — ClashPerk keeps its name, logo and copy.
- Dashboard tokens live in `:root` / `.dark`; marketing tokens are scoped under `.landing`.
- `--primary` is neutral (near-black/white); brand color is `--brand`, the logo orange (`#d14c00` to `#de8f28`), used for accents and focus rings. Success states stay green.
- Google Sans Flex is self-hosted from `public/fonts` instead of Google Fonts.

## 2026-10-10 — Light-only marketing routes via next-themes `forcedTheme`
`/`, `/terms`, `/privacy` force `light` in `ThemeProvider`, so the user's saved dashboard theme is untouched. Chosen over overriding variables with a nested class, which would still trigger `dark:` variants on those pages.

## 2026-10-10 — Game-meaning colors kept, shaded per theme
Stars, losses, map position and Town Hall keep their hues; `-400` shades become `-600` in light mode (`dark:` keeps `-400`). Chart series palettes and the Discord login button are unchanged.

## 2026-10-10 — Marketing routes split into a `(marketing)` route group
`/`, `/terms`, `/privacy` live in `app/(marketing)` with no session fetch so they prerender; every other route sits in `app/(app)`, whose layout keeps `getSession`, `SessionProvider` and the app shell. Chosen over keeping one root layout, which forced every page to render per request. The proxy still decodes the auth cookie on all routes because it also handles `handoff_token` redirects.

## 2026-10-10 — Hero embeds are illustrative HTML, not screenshots
The hero's Discord messages are built in HTML with invented clan and player names, so they stay sharp, theme-consistent and free of real user data.
