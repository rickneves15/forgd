# ADR-006: OAuth Identities Modeled Per-Provider

**Status:** Accepted
**Date:** 2026-08-03

## Context

SPEC-03 originally shipped with "no separate linked accounts concept in V1 — treat an email match as the same account." During planning we decided that treating Google as an opaque email-matching login wasn't good enough: the app's long-term shape is the "connect accounts" model (one Forgd account, several external identities — like Discord), and Apple/Facebook are already on the V2 roadmap.

## Decision

Model OAuth login through a dedicated `oauth_accounts` table instead of email-only matching:

- One row per `(provider, providerAccountId)` identity, linked to a User. A User can have many identities; at most **one per provider** (`UNIQUE(userId, provider)`).
- The table stores provider snapshots (`email`, `name`, `pictureUrl`) for future "connected accounts" UI — never used for matching.
- **Login resolution order:** (1) find the identity by `(provider, sub)` and log in that User; (2) if no identity row, **auto-link** to the User whose email matches (Google emails are globally unique, so this can never merge two distinct Google users); (3) otherwise create the User (no password) + identity row.
- Once an identity row exists, its `providerAccountId` **wins over email** — a user who changes Gmail still logs into the same account.
- No explicit connect/disconnect endpoint in V1; linking happens only via auto-link at login. The table is groundwork for when Settings → "connected accounts" appears with a second provider.

## Rationale

- The identity's `sub` is stable forever; email is not. Matching by email alone would create a duplicate account whenever a Google user changes their Gmail address.
- Email-only matching also records *nothing* about how an account was created, making `passwordHash = null` unanswerable ("why can't this user log in with a password?").
- Rejected alternative: **email-only matching, no table.** Fastest to build (zero migration) but fails the duplicate-account case and records no provider provenance. Rejected also: a bare `googleId` column on `users` — it generalizes poorly to Apple/Facebook (would need a `provider` discriminator anyway).

## Consequences

- New `oauth_accounts` table + migration; `users` itself is untouched (its `passwordHash` was already nullable for OAuth-only accounts).
- Login resolution adds an email auto-link step that the original SPEC-03 treated as an unmodeled side effect — now it's explicit and recorded.
- The one-per-provider rule means a second Google identity matching an already-linked User's email logs in but is not recorded (unreachable in practice, since two Google accounts cannot share an email).
- A future Settings → "connected accounts" screen reads `oauth_accounts` directly; connect/disconnect endpoints can be built on top without a schema change.
