# ADR-001: Expo (React Native) Mobile App + Separate Fastify API

**Status:** Accepted
**Date:** 2026-07-25

## Context

The original mockups (`project.pdf`, `project-h.pen`) are native mobile screens (phone-shaped, bottom tab bar), not a web layout. Rick confirmed the app will be built with **Expo (React Native)**, with the API on **Fastify**.

## Decision

- Client: Expo / React Native mobile app.
- API: Fastify, as a separate service/repo — not folded into any frontend framework.
- Two repos (app + api), not a monorepo — this split is structural, not a stylistic choice, since a mobile client cannot host server-side route handlers the way a Next.js app could.

## Rationale

- A mobile client always needs an external HTTP API; there is no "single app does both" option like there would be for a web frontend.
- Fastify + Zod matches Rick's established, familiar stack (seen consistently across his prior projects), which is faster to build with than adopting something new.

## Consequences

- No shared-package type generation between app and API is assumed for V1 (types duplicated or hand-synced) — revisit only if drift becomes a real recurring bug source.
- This supersedes an earlier proposal (single Next.js monolith) made before the mobile platform was confirmed.
