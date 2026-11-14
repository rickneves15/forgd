# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

Package-specific instructions for `app/`. Repository-wide rules live in the root [`../AGENTS.md`](../AGENTS.md) — read it first. Reviewer-facing standards are in [`../CODING_STANDARDS.md`](../CODING_STANDARDS.md).

## Boundaries

- Expo Router routes live under `src/app/`; file paths are the route contract.
- Visual language comes from [`../docs/style-guide.md`](../docs/style-guide.md) (NativeWind v4 tokens). Do not introduce raw hex values outside brand assets.
- Each screen follows its paired contracts: `APP-XX` in [`../docs/specs/app/`](../docs/specs/app/) for behaviour and `SPEC-XX` in [`../docs/specs/api/`](../docs/specs/api/) for the endpoint it calls.
- Server state belongs to React Query; HTTP goes through `src/http/api-client.ts`. Do not create ad-hoc axios instances.
- Auth tokens live in `expo-secure-store` through `src/utils/storage-keys.ts` — never `AsyncStorage`.

## Commands

Run from the repository root:

| Task | Command |
|---|---|
| Dev server | `pnpm --filter app start` |
| Lint / fix | `pnpm --filter app lint` / `pnpm --filter app lint:fix` |
| Typecheck | `pnpm --filter app typecheck` |

No test runner is wired up yet (jest-expo is installed but there is no test script). Do not claim app test coverage.
