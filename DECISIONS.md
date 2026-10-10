# Decisions

## 2026-10-10 — New design tokens
Decided by: Suvajit. Visual style only — ClashPerk keeps its name, logo and copy.
- Dashboard tokens live in `:root` / `.dark`; marketing tokens are scoped under `.landing`.
- `--primary` is neutral (near-black/white); brand green is `--brand`, used for accents, focus rings and success states.
- Google Sans Flex is self-hosted from `public/fonts` instead of Google Fonts.

## 2026-10-10 — Light-only marketing routes via next-themes `forcedTheme`
`/`, `/terms`, `/privacy` force `light` in `ThemeProvider`, so the user's saved dashboard theme is untouched. Chosen over overriding variables with a nested class, which would still trigger `dark:` variants on those pages.

## 2026-10-10 — Game-meaning colors kept, shaded per theme
Stars, losses, map position and Town Hall keep their hues; `-400` shades become `-600` in light mode (`dark:` keeps `-400`). Chart series palettes and the Discord login button are unchanged.
