# Forgd — Project Context
## forgd/docs/CONTEXT.md

> Primary context document for any AI assistant or dev working on this project.
> Read this first, then `prd.md`, `domain-model.md`, and `glossary.md`.
>
> **Priority for this project: ship fast.** The owner has been procrastinating on this for a long time — every decision here is optimized to unblock building, not to maximize architectural purity. Prefer the boring, fast-to-implement option unless there's a concrete reason not to.

---

## What is this?

A collaboration and discovery platform for **hardware engineering projects** (electronics, electrical, mechanical, civil, aerospace, chemical). Students can browse/apply to join projects (some paid via stipend), form groups, track tasks/issues inside those groups, and build a track record (project history, peer recognition) other students can see.

It is **not** a general job board and **not** a generic Trello clone — the wedge is discovery + collaboration specific to hardware/engineering student projects.

## Language Convention

All persisted files in `docs/` (and any future `api/docs/`, `web/docs/`, specs) must be written in **English**, regardless of the conversation language. Rick works day-to-day in Brazilian Portuguese — chat replies stay in Portuguese, but committed file content is always English.

## Origin

Based on an earlier concept ("Project H") pitched as an academic project, now renamed **Forgd**. The original PDF pitch and screen mockups (`project-h.pen`) are being used as a *reference*, not a spec to preserve as-is — this is a from-scratch rebuild.

---

## Resolved Decisions

### Naming
- **Project renamed to "Forgd"** (from "Project H"). Chosen for: short, brandable, works as a verb, and rooted in "forge" (building/crafting) rather than anything electronics-specific — matters since the domain covers electrical, mechanical, civil, aerospace, and chemical engineering too, not just electronics.
- Physical folder rename (`project-h` → `forgd`) pending — blocked by a local filesystem MCP timeout, not a decision issue. Retry when the MCP server is restarted.

### Visual Direction
- **Minimalist + maker/hobby, not corporate.** Dark neutral base (matches original mocks), one saturated accent color (candidates: weld-orange, circuit-green), geometric-but-not-monospace type, room for a few playful/illustrative touches. Explicitly avoiding a sterile "LinkedIn clean" look.

### V1 Scope & Audience
- **V1 targets engineering students only.** Independent makers, hobbyists, and small companies are explicitly out of scope for V1 — not designed around, not blocked, just not a target.
- **"College" is a free-text optional field.** No institutional email verification, no closed list of universities. Verification is friction that doesn't pay off given the timeline; can be revisited later if trust/spam becomes a real problem.

### Navigation & Duplicate-Screen Cuts
- **"Projects" and "Apply" merged into a single tab, named "Projects".** The original mockups had two near-identical browse/filter/list screens. Bottom nav is now: **Projects, Group, Profile** (3 tabs, not 4). "Apply" is now only an action (button on a project card/detail), not a section.

### Project Creation
- **Single "Add Project" flow**, replacing the two separate buttons/forms from the original mockups ("Add new project" and "Contact people for project" — confirmed via source re-read to be the same underlying form, just a confusingly-named duplicate entry point. "Contact people for project" is removed entirely).
  - Recruiting fields (stipend, duration, responsibilities, number of openings, "create group") are **optional** on this one form.
  - Left blank → project is portfolio-only (shows in the owner's profile, not in the discovery feed).
  - Filled in (at minimum: openings > 0) → project appears in the Projects discovery feed as an open opportunity.
- **New V1 screen: "Invite member directly to group."** Distinct feature (not a mock leftover) — lets a group admin add someone by username straight into their group, bypassing the formal Apply-with-resume flow. Lives inside the Group section.

### Auth Providers
- **V1: Google OAuth + email/password only.** Apple/Facebook icons already exist in `assets/icons/` but are deferred to V2 — each OAuth provider is real backend setup (Apple requires a paid Developer Program enrollment), not worth it for a fast V1.

### Platform & Stack
- **Platform: Expo (React Native) mobile app**, not a web app. (In hindsight, this was already obvious from the mockups being phone-shaped screens with a bottom tab bar — corrected after initially proposing a web-only Next.js monolith.)
- **API: Fastify**, a separate service/repo (mobile clients always need an external API — there's no "put it all in one Next.js app" option here). See ADR-001.
- **Two repos**, mirroring the forced split: the Expo app and the Fastify API. Not a monorepo decision to revisit — it's structurally required by having a mobile client.
- **Auth: plain JWT with `@fastify/jwt`** (short-lived access token + DB-stored refresh token), not Better Auth. See ADR-002. Google OAuth exchanges Google's token for our own JWT, same shape as email/password login.
- **File storage: Cloudflare R2** (S3-compatible, no egress cost) for project photos/PDFs, resumes, avatars.
- **Database: Postgres + Drizzle ORM** (Rick's established default from prior projects, no reason found to deviate).
- **Group Chat: real WebSocket from V1** (`@fastify/websocket`, one channel per Group — no need for Socket.io's broader feature set for this simple a fan-out). Rule applied: don't build a throwaway version of a feature that genuinely needs real-time; chat is one of those.
- **Direct Messages (1:1) get the same real-time treatment as Group Chat** — same rule applies, a messaging feature is a messaging feature regardless of scope. See SPEC-25 (reuses the Group Chat connection-handling pattern).
- **In-app Notifications: simple fetch-on-open list + unread count.** This is NOT a stopgap for push — it's a legitimate permanent pattern on its own. Real OS-level push (Expo Push Service, alerts while app is closed) is a distinct, separate feature, deferred to V2 (it was never a V1 need, so this isn't "redoing" anything).
- **Navigation: Expo Router** (file-based, official Expo default). **Server state: React Query.**
- **Hosting (for now): Railway (API) + Neon (Postgres).** Both support long-running Fastify processes and persistent WebSocket connections.
  - **⚠️ Flagged risk:** Rick mentioned possibly moving to **Vercel** later. Vercel's serverless model does not support a persistent Fastify + WebSocket server the way Railway does — moving there would force reworking the Group Chat mechanism (e.g. to a third-party realtime service). Given the "no throwaway/redo" rule above, this should be weighed consciously before switching, not discovered mid-migration.

### Deferred to V2 (explicit non-goals for V1)
- **"Own papers and journal" (research paper/journal uploads on profile).** Disconnected CRUD feature with no dependency from the rest of the flow (nothing else reads/links to it). Cut entirely from V1; revisit as part of a future "academic portfolio" push.

---

## Open Threads

The initial grilling session (scope, domain model, stack, naming, screen-by-screen redesign) is complete as of 2026-07-26 — no unresolved threads from that pass. New threads get added here as they come up in future work.

Known gaps intentionally left for later (not blocking, just not designed yet):
- Email/password change (only signup/login/reset via re-registration exists — no "change my password" flow).
- Any project-editing beyond `status` (title/description/photos edits after creation aren't specified).
- Multi-admin groups (only the original owner is ever `admin`).

---

## Document Map

- `prd.md` — features, user flows, screens inventory
- `domain-model.md` — entities, fields, relationships
- `glossary.md` — terminology
- `style-guide.md` — brand, colors, type, spacing, components, motion
- `adr/` — ADR-001 (Expo+Fastify), ADR-002 (JWT over Better Auth)
- `specs/` — SPEC-01 through SPEC-25, implementation-ready contracts (Auth: 01-05, Projects: 06-12, Groups: 13-19, Profile: 20-25)
- `redesign/` — `00-screen-checklist.md` (every original screen, tracked) + 01-auth-onboarding, 02-projects, 03-groups, 04-profile (screen-by-screen notes + copy-paste prompts for opencode and Pencil)

---

## What NOT to Do

- Don't add verification/approval flows "just in case" — every gate must justify itself against the ship-fast priority.
- Don't copy the original PDF's scope 1:1 — treat every screen/section as a candidate for cutting or merging.
- **Don't build a throwaway/simplified version of a feature that genuinely needs real-time or other "proper" infra, planning to redo it later.** If a feature needs it, build it right the first time. "Ship fast" means cutting scope/features, not shipping a worse version of something that's actually in scope.
