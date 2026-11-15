# Archived Specifications

This directory contains specifications whose API contracts are **implemented and verified** (SPEC-01 through SPEC-04). They have been moved out of the active `docs/specs/api/` and `docs/specs/app/` directories to keep the active development view focused on remaining work.

## What's archived

| Spec | Title | API status | App status | Reason |
|------|-------|-----------|------------|--------|
| `archive/api/SPEC-01-register.md` | Email/password signup | Done (implemented + tested) | Draft (screen not built) | Auth complete |
| `archive/api/SPEC-02-login.md` | Email/password login | Done (implemented + tested) | Draft (screen not built) | Auth complete |
| `archive/api/SPEC-03-google-oauth.md` | Google OAuth | Done (implemented + tested) | Draft (screen not built) | Auth complete |
| `archive/api/SPEC-04-refresh-logout.md` | Refresh token + logout | Done (implemented + tested) | Draft (screen not built) | Auth complete |
| `archive/app/APP-01-register.md` | Sign up | — | Draft | Pair with SPEC-01 |
| `archive/app/APP-02-login.md` | Sign in | — | Draft | Pair with SPEC-02 |
| `archive/app/APP-03-google-oauth.md` | Google OAuth | — | Draft | Pair with SPEC-03 |
| `archive/app/APP-04-refresh-logout.md` | Refresh + logout | — | Draft | Pair with SPEC-04 |

## Status notes

- **API contracts (SPEC-01–04):** All four are implemented with integration tests passing against real Postgres (`72 tests, 17 files`). Marked `Done` in their source.
- **App screens (APP-01–04):** All four are marked `Draft` — the Expo screens are not yet built. The API contracts they consume are complete and stable.

## Where to find them

These files remain in the repository under `docs/specs/archive/`. They are preserved for historical value and reference; their identifiers (`SPEC-01`–`SPEC-04`, `APP-01`–`APP-04`) are **not** reused for new specs.

## Active specs

Remaining (unimplemented) specs live in:
- `docs/specs/api/` — SPEC-05 through SPEC-26 (all `Ready`)
- `docs/specs/app/` — APP-05 through APP-25 (all `Draft`)

See `docs/roadmap.md` for the prioritized implementation plan.
