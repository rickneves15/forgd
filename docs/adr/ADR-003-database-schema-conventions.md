# ADR-003: Database Schema Conventions

**Status:** Accepted
**Date:** 2026-07-29

## Context

`api/src/db/schema/` was empty — no schema conventions existed yet for a
project with ~15 entities (`domain-model.md`) and 25 implementation-ready
specs. Several schema-level decisions cut across every table (PK strategy,
enum handling, soft delete, timestamps, cascade behavior) and needed to be
resolved once, consistently, rather than improvised table-by-table.

## Decisions

### Primary keys: UUID v7, generated client-side
Every table (including pure join tables — `bookmarks`, `regards`,
`group_members`) gets a surrogate `id: uuid` primary key, generated in JS via
the `uuid` package's `v7()` export (`$defaultFn`), not a Postgres SQL
default. Postgres has no built-in v7 generator — `gen_random_uuid()` only
produces v4 — and generating v7 client-side is convenient for a mobile app
(Expo) that may want to create an id before round-tripping to the API.
Join tables still get a composite `unique()` constraint on their natural key
(e.g. `unique(userId, projectId)` on `bookmarks`) for idempotency — the
surrogate `id` doesn't replace that.

### Enum-like fields: `text` + Zod validation, not DB enums or CHECK constraints
`Project.status`, `Application.status`, `GroupMember.role`,
`Notification.type`, `ProjectAttachment.kind` are all plain `text` columns.
Valid values live as `as const` arrays in `schema/constants.ts` and are
enforced by Zod at the API boundary (the stack already uses
Fastify+Zod+drizzle-zod). This avoids Postgres native enums' migration pain
(`ALTER TYPE ... ADD VALUE` can't run inside a transaction with other
changes) and needs no CHECK-constraint migration either when a new value is
added — a one-line Zod change is enough.

### Soft delete: `User` only
`users.deletedAt` is the only soft-delete column in the schema (SPEC-24: row
kept, anonymized at the app layer, so other tables referencing a deleted
user don't break). No other entity has a delete flow in V1 at all (Project,
Task, Issue, Comment, GroupMember have no delete endpoint; Bookmark is the
one genuine hard-delete, and it's a trivial row removal).

### Cascade: `NO ACTION` (default/RESTRICT) on every FK
Since `User` is soft-deleted (the row never actually disappears) and nothing
else has a delete flow, no FK in the schema ever needs `ON DELETE CASCADE`
in V1. Left at Postgres's default rather than adding cascade rules that
would never fire, keeping every reference "the safe way" (blocks an
unexpected orphaning) with zero extra syntax.

### Timestamps: uniform `createdAt` + `updatedAt` on every table
No table opts out, even ones that are effectively insert-only today
(`refresh_tokens`, `regards`, `comments`). One rule, no need to remember
which tables "need" `updatedAt` later.

### Counts: computed via aggregate query, not denormalized
`applicationsCount` (SPEC-08) and `percentComplete` (SPEC-13) were already
explicitly decided this way in their specs. Extended the same rule to
`regardsCount`, `doneProjectsCount`, `activeProjectsCount` (SPEC-20,
SPEC-23) for consistency — all `COUNT(*)` at query time, no denormalized
counter columns anywhere. Revisit only if a specific count becomes a
measured hot path.

### Project photos/PDFs: separate `project_attachments` table
Not a `text[]` column on `projects`, unlike `users.interests` (which *is* a
plain array — see below). Attachments are more likely to grow per-file
metadata later (caption, uploader, size) without a rework, at the cost of
one extra table + join on project reads.

### `users.interests`: `text[]` column, no join table
Per SPEC-05's own implementation note — fixed, small enum, no per-tag
metadata ever needed. `projects.category` reuses the same
`constants.ts#INTEREST_TAGS` list; `projects.topic` is free text (not an
enum) since no spec ties it to a fixed list, unlike `category`.

### Direct Messages: dedicated `conversations` table
`direct_messages.conversationId` FKs to a real `conversations` row
(`participant1Id`/`participant2Id`, always sorted so the pair is
deterministic per SPEC-25 §3.3), rather than being a derived string
computed per-message with no backing table. No V1 spec asks for a DM inbox
screen yet, but the feature is real (not a stub), and a dedicated table
keeps a future "list my conversations" query cheap (indexed lookup) instead
of a `DISTINCT ON` over the full message history.

### `group_messages`: new table, not in the original domain model
`domain-model.md` documents `DirectMessage` as its own entity but only
implies Group Chat messages under Group's description, without a matching
entity block. SPEC-17 requires persisting every chat message, so
`group_messages` (`groupId`, `authorId`, `text`) was added to the schema;
`domain-model.md` §Group has been updated to match.

### Naming
Tables: `snake_case`, plural (`users`, `group_members`,
`project_attachments`). Columns: `camelCase` in Drizzle/TS, mapped to
`snake_case` in Postgres via `drizzle.config.ts`'s existing `casing:
'snake_case'` — no manual `text('column_name')` naming needed beyond what
Drizzle infers, though explicit names are still given for clarity.
All foreign-key columns get a plain `index()` — Postgres doesn't auto-index
FK columns the way it does primary keys, and every join in this schema goes
through one.

### File organization
One file per domain under `schema/` (`users.ts`, `projects.ts`, etc.),
re-exported from `schema/index.ts` (which `drizzle.config.ts` already points
at). All `relations()` calls live in a single `schema/relations.ts` instead
of alongside each table, specifically to avoid circular imports between
domain files that reference each other both ways (e.g. `users` ↔
`projects`).

## Consequences

- Adding a new enum-like value (e.g. a third `Notification.type`) is a
  one-line change to `constants.ts` + a Zod schema update, no migration.
- If any entity needs a real delete flow later (e.g. project deletion), its
  FKs will need an explicit cascade/restrict decision at that point — today
  there's deliberately none to get wrong.
- If a specific `COUNT(*)` ever shows up as a real performance problem at
  scale, revisit as a denormalized counter — not expected before V1 traffic
  makes it obvious.
- Requires adding the `uuid` package to `api/package.json` (`pnpm add uuid`)
  — not yet a dependency.
