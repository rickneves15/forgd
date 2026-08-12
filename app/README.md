# Forgd App

Expo (React Native) client for [Forgd](https://github.com/rickneves15/forgd) — find your next hardware project, build it with a team.

## Prereqs

- Node >= 22, pnpm
- For the API, run the `api/` workspace in this repo (Railway URL also works)

## Run

```sh
pnpm install

# dev build (required: expo-dev-client, reanimated, nativewind)
pnpm --filter app run android   # or: ios / web
```

Copy `.env.example` to `.env.local` and set `EXPO_PUBLIC_API_URL`:

```sh
# Android emulator
EXPO_PUBLIC_API_URL=http://10.0.2.2:3333
# Physical device (same LAN)
EXPO_PUBLIC_API_URL=http://192.168.x.x:3333
```

## Stack

- Expo SDK 57, Expo Router (file-based), TypeScript
- NativeWind v4 (Tailwind) with the tokens from `../docs/style-guide.md`
- React Query, react-hook-form + zod, axios
- Biome for lint/format; jest-expo for tests

## Scripts

| Script | Description |
| --- | --- |
| `pnpm start` | Start Metro / dev server |
| `pnpm android` / `ios` / `web` | Start on a given platform |
| `pnpm lint` | Biome check |
| `pnpm lint:fix` | Biome check with auto-fixes |
| `pnpm format` | Biome format |
| `pnpm typecheck` | `tsc --noEmit` |
