# CLAUDE.md

ClashPerk web: the marketing site and the server dashboard for the ClashPerk Discord bot.

## Commands

pnpm, Next.js 16 (App Router, Turbopack), React 19, Tailwind v4, shadcn/ui.

```bash
pnpm dev --port 3000   # dev server
npx tsc --noEmit -p .  # type check
pnpm lint
pnpm generate:api      # regenerate hooks/api/generated from a backend on :8080
```

The production API only allows `clashperk.com` origins. For local dev set `API_PROXY_TARGET=https://api.clashperk.com` and `NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api-proxy/v1` in `.env.local`. Local runs then read and write live data, so never trigger link/unlink/reorder/roster changes without asking.

## Layout

- `app/(marketing)`: `/`, `/terms`, `/privacy`. Static, no session fetch, always light (`isLightOnlyRoute` in `lib/routelist.ts`).
- `app/(app)`: everything behind login. Its layout holds `getSession`, `SessionProvider` and the sidebar shell.
- `hooks/api/axios.ts`: the browser-only `api` client. Its token comes from the session via `ApiTokenProvider`; server code uses `serverApi` from `lib/server-api.ts`.
- `lib/clan-categories.ts`: icon and color per clan category (matched by keyword on the category name).

## Dashboard style

Follow what the existing `(app)` pages do; don't reintroduce the old look.

- Page: `flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8`. Header is an `h2` with `text-2xl font-medium tracking-tight md:text-4xl` plus a `text-sm md:text-base text-muted-foreground` subtitle. No boxed header bars, no `font-bold` titles, no `text-[10px]`.
- Cards: `rounded-2xl border bg-card` with the soft shadow from `components/ui/card.tsx`. Lists inside cards use `divide-y`; clickable cards lift on hover.
- Color: neutral first. Orange (`primary`) is only for the main action button on a page. Icon tiles, selected states and chips are grey (`bg-muted`, `bg-foreground/[0.06]`, `bg-foreground/[0.07]` for active). No yellow/amber or orange tints. Green = open/verified/sent, red (`destructive`) = errors and failures, blue = upcoming. Clan categories use `categoryTheme()`.
- Controls: use the shared `Input`, `SelectTrigger`, `Button`; don't override their radius. Buttons are pills; focus rings are neutral.
- States: every API-backed section has a skeleton while loading, an inline error with "Try again", and a dashed empty card. Failed writes show a message and roll back.
- Sentence case for UI text ("Link account", not "Link Account").
- Check both light and dark, and phone width (no horizontal scroll).

## Data rules

- Only show data the API really returns. `GET /guilds/:id/clans` returns placeholder `members` (50), `level` (10) and `league` ("Unknown"); never display them.
- No subscription, plan or upgrade UI until a billing API exists.
- Don't ship controls that don't save (fake toggles, buttons with no endpoint).

## Docs and git

- `CHANGELOG.md` gets a line for every user-visible change; non-obvious choices go in `DECISIONS.md`. Code comments state the current WHY only, max 3 lines.
- Branch from `main`, PRs target `main`. Conventional commits.
- Don't use bot slash-command names on the landing page.
