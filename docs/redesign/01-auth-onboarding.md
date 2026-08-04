# Redesign 01: Auth & Onboarding

**Screens:** Sign in, Sign up, Choose your interests
**Specs:** SPEC-01, SPEC-02, SPEC-03, SPEC-04, SPEC-05
**Original mocks:** first 3 screens in `project.pdf` (Sign in / Sign up / Choose your interests)

---

## What changes from the original mock

- **Social login: Google only** (drop the Apple/Facebook icon slots from the layout for V1 — keep the button component generic enough to add them back later, but don't design/build them now).
- Sign up gains no new fields — same set (username, email, college, password, confirm password) — `college` is explicitly labeled/placeholder-hinted as optional.
- No other structural change; this screen group was already close to right in the original mock.

## Visual direction (apply to every screen in the app, not just this one)

- **Base:** dark neutral (near-black graphite, not pure `#000`), following the original mocks.
- **Accent:** one saturated, warm accent color — "weld-orange" (something like `#FF6B35`–`#FF7A3D` range) for primary buttons/active states. This is the maker/hobby signal against an otherwise minimal, technical layout.
- **Type:** a geometric sans (e.g. Inter, Manrope, or Sora) — NOT monospace. Monospace is "too IDE", we want technical-but-approachable.
- **Shape language:** slightly rounded corners (8–12px), not sharp/brutalist, not pill-shaped/soft-SaaS either — keep it feeling like a tool, not a toy.
- **Icons:** simple line icons; the Google "G" logo stays full-color (brand requirement) against the dark button.

## Field/flow reference (for whoever builds this — matches the specs)

- **Sign up:** username, email, college (optional), password, confirm password, Google button, link to Sign in.
- **Sign in:** email, password, Google button, link to Sign up.
- **Choose your interests:** multi-select chips (department/topic tags from SPEC-05's enum), "Skip" top-right, "Done" primary button at the bottom.

---

## Prompt for opencode

```
Implement SPEC-01, SPEC-02, SPEC-03, SPEC-04, and SPEC-05 from docs/specs/ in the Fastify API.

Context:
- Read docs/CONTEXT.md and docs/domain-model.md first for stack/conventions (Fastify, Zod, Drizzle, Postgres, plain JWT — no Better Auth, see ADR-002).
- Auth endpoints: POST /register, POST /login, GET /auth/oauth/google + GET /auth/oauth/google/callback + POST /auth/oauth/exchange (Google OAuth, SPEC-03), POST /refresh, POST /logout, GET /me.
- Use Zod schemas for request validation, matching each spec's §4.3 exactly.
- Passwords: bcrypt hash, never store/return plaintext.
- Refresh tokens: signed JWT (RS256, 30d, separate key pair), registered in a `refresh_tokens` table (userId, tokenHash, expiresAt) as the revocation record, rotate on every use (SPEC-04).
- Google OAuth: the API runs the whole dance with `@fastify/passport` + `passport-google-oauth20` (ADR-007) — OAuth `state` in `oauth_states` (single-use, DB), mobile deep-link redirect, one-time code → `POST /auth/oauth/exchange`, 401 `INVALID_GOOGLE_TOKEN` on any callback failure. No ID-token verification, no `google-auth-library` (SPEC-03).
- Write the Drizzle schema for `users` and `refresh_tokens` if they don't exist yet (see domain-model.md §User for fields, add `interests text[]` per SPEC-05).
- Follow each spec's §3 (Scenarios) as your test cases — write these as actual tests, not just manual checks.
- Stop and ask me if anything in the specs is ambiguous rather than guessing.
```

## Prompt for Pencil

```
Design 3 mobile app screens for "Forgd" (Expo/React Native): Sign in, Sign up, and Choose your interests (onboarding).

Style direction:
- Dark theme, near-black graphite background (not pure black).
- One saturated warm-orange accent color for primary buttons and active/selected states.
- Geometric sans-serif type (Inter/Manrope/Sora family), not monospace.
- Slightly rounded corners (8-12px) — technical but approachable, not sharp/brutalist, not soft/bubbly.
- Simple line icons; full-color Google "G" logo on the Google sign-in button.

Screen 1 - Sign in: email field, password field, "Sign in" primary button, "Sign in with Google" secondary button (Google logo + label), link at the bottom to "Create an account".

Screen 2 - Sign up: username field, email field, college field (label/placeholder should make clear this is optional), password field, confirm password field, "Sign up" primary button, "Sign in with Google" secondary button, link to "Already have an account".

Screen 3 - Choose your interests: title "Choose your interests", "Skip" link top-right, a set of selectable chip/tag buttons for: Engineering related projects, Btech projects, Mtech projects, IT & CS related projects, E&TC related projects, Electrical related projects, Mechanical related projects, Civil related projects (multi-select, selected state uses the accent color), "Done" primary button pinned at the bottom.

Use consistent components/spacing across all 3 screens since they're the same app.
```
