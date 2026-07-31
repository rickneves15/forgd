# ADR-002: Plain JWT Auth Instead of Better Auth

**Status:** Accepted
**Date:** 2026-07-25

## Context

Rick had considered **Better Auth** in a past (unrelated) project, and it does support mobile via a bearer-token plugin. For this project V1, auth requirements are simple: email/password + Google OAuth, single user role (no complex permission system yet).

## Decision

Use **plain JWT** (`@fastify/jwt`): short-lived access token + refresh token stored in the database. Google OAuth exchanges Google's token server-side for our own JWT, so the app only ever handles one token shape.

## Rationale

- Better Auth's surface area (plugins, adapters, session/org/permission concepts) is built for a broader range of cases than V1 needs — the learning curve doesn't pay off yet.
- Plain JWT is a pattern Rick already has working knowledge of (recurring across his prior projects), which is faster to implement and debug than integrating a new library.

## Consequences

- If roles/permissions grow significantly more complex later (multiple role types, fine-grained resource permissions), revisit — that's exactly the case Better Auth (or a CASL-based layer, also seen in Rick's prior projects) is good at.
- No built-in session management UI/tooling that a library like Better Auth would provide for free — acceptable tradeoff for V1's simple auth needs.
