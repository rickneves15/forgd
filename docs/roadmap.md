# Forgd Implementation Roadmap

Prioritized list of remaining work, based on the implementation audit (all specs read against actual source code, schema, migrations, and tests).

## Current state summary

| Category | Count | Status |
|----------|-------|--------|
| API specs | 26 | SPEC-01–05: Done + archived (implemented, tested). SPEC-06–26: Ready (not implemented). |
| App specs | 25 | APP-01–04: Draft + archived (screen not built). APP-05: Done + archived (implemented, tested). APP-06–25: Draft (not implemented). |
| GitHub issues | 0 | No tickets exist yet. |
| Tests | 76 passing | All auth (SPEC-01–04) + interests (SPEC-05) + small utilities. Zero tests for SPEC-06–26. |
| App screens | 0 | Only `_layout.tsx` and `index.tsx` exist. No feature screens built. |

Archived (completed): `docs/specs/archive/` — SPEC-01–05 (API) and APP-01–05 (app).

## Prioritization principles

1. Critical correctness, security, and data integrity issues first.
2. Architectural prerequisites that block other work.
3. Core API and domain functionality.
4. Mobile application functionality.
5. Integration and end-to-end testing.
6. Secondary features and improvements.

Do not prioritize solely by spec number.

## Phase 1 — Core API functionality (unblock the user flow)

These build the signup → onboarding → create-project → apply → group core loop. Each ticket can be implemented independently once auth (done) is in place.

| # | Ticket | Spec | Why first | Dependencies | Files affected | Acceptance criteria | Required tests |
|---|--------|------|-----------|--------------|----------------|---------------------|----------------|
| 1 | Choose-interests onboarding | SPEC-05 + APP-05 | First `Ready` spec after auth; completes signup → onboarding → home flow; simple PUT endpoint; `users.interests` column already exists | Auth done; DB `users.interests` column exists | New: `api/src/http/routes/auth/interests.ts`, `interests.test.ts`; possibly `users-repository.ts` | Valid tags saved + returned; empty array allowed; unknown tag → 400 | Integration tests through `app.inject()` + real Postgres |
| 2 | Presigned upload (shared infra) | SPEC-26 | Foundation for SPEC-06 (project photos), SPEC-21 (avatar), SPEC-22 (resume). No app pair needed. | Auth done | New: `api/src/http/routes/uploads.ts`, `uploads.test.ts` | Valid purpose+contentType → uploadUrl + fileUrl; disallowed contentType → 400 | Integration tests |
| 3 | Create Project | SPEC-06 + APP-06 | Core creator flow; enables open projects which feed applications, groups, feed | SPEC-26; auth done | New: `api/src/http/routes/projects/create.ts` + test; app screen `app/src/app/(tabs)/projects/add/` | Base fields → portfolio project; openings>0 → open project + Group auto-created | Integration tests |
| 4 | Projects feed | SPEC-07 + APP-07 | Main discovery tab; read-only; can be built early | SPEC-06 helpful but not required | New: `api/src/http/routes/projects/feed.ts` + test; app screen `app/src/app/(tabs)/projects/` | Recent open projects paginated; `q` search; multi-value filters; `hasOpenings` | Integration tests |
| 5 | Project detail | SPEC-08 + APP-08 | Needed for Apply entry point | SPEC-06/07 | New: `api/src/http/routes/projects/[id].ts` + test; app screen `app/src/app/(tabs)/projects/[id]/` | Portfolio → no recruiting block; open → all fields; `hasApplied`/`isBookmarked` | Integration tests |
| 6 | Apply to project | SPEC-09 + APP-09 | Core collaboration flow | SPEC-08; resume (SPEC-22) | New: `api/src/http/routes/projects/[id]/applications.ts` + test; app screen | Valid apply → Application created; duplicate → 409; portfolio → 400; no resume → 400 | Integration tests |

## Phase 2 — Group collaboration

Builds on Phase 1 (groups are auto-created for open projects).

| # | Ticket | Spec | Dependencies |
|---|--------|------|--------------|
| 7 | Groups list/overview | SPEC-13 + APP-13 | SPEC-06 |
| 8 | Group tasks | SPEC-14 + APP-14 | SPEC-13 |
| 9 | Project issues | SPEC-15 + APP-15 | SPEC-06/08 |
| 10 | Issue comments | SPEC-16 + APP-16 | SPEC-15 |
| 11 | Group chat | SPEC-17 + APP-17 | SPEC-13 (WebSocket infra) |
| 12 | Group members | SPEC-18 + APP-18 | SPEC-13 |
| 13 | Invite member | SPEC-19 + APP-19 | SPEC-18 |

## Phase 3 — Profile and settings

| # | Ticket | Spec | Dependencies |
|---|--------|------|--------------|
| 14 | View profile | SPEC-20 + APP-20 | Auth done |
| 15 | Edit profile | SPEC-21 + APP-21 | SPEC-20, SPEC-26 (avatar) |
| 16 | Resume upload | SPEC-22 + APP-22 | SPEC-26 |
| 17 | Give regard | SPEC-23 + APP-23 | SPEC-20 |
| 18 | Settings | SPEC-24 + APP-24 | SPEC-04 (logout), SPEC-05 (interests), SPEC-22 (delete account) |

## Phase 4 — Secondary features

| # | Ticket | Spec | Dependencies |
|---|--------|------|--------------|
| 19 | Direct messages | SPEC-25 + APP-25 | WebSocket infra (shared with SPEC-17) |
| 20 | Bookmarks | SPEC-11 + APP-11 | SPEC-06/08 |
| 21 | Notifications | SPEC-12 + APP-12 | SPEC-10/15/19 (notification generators) |
| 22 | Home feed | SPEC-27 + APP-26 | **Contracts not yet written** — blocker |

## Phase 5 — Testing and verification

| # | Work | Notes |
|---|------|-------|
| 23 | Write integration tests for each newly implemented API spec | Follow existing auth test patterns (`app.inject()` + real Postgres) |
| 24 | Configure app test runner (jest-expo) | Per CODING_STANDARDS: "do not invent a framework in a feature change; propose it separately" |
| 25 | E2E flow tests (signup → onboarding → create project → apply → group) | Cross-spec verification |

## Architectural prerequisites that block other work

None currently blocking — auth layer is complete and tested. The only spec-level blocker is **Home feed contracts (SPEC-27 / APP-26)**, which do not exist yet and cannot be implemented from redesign notes alone (per CONTEXT.md §88).

## Single best ticket to implement next

**SPEC-05: Choose-interests onboarding** (`PUT /users/me/interests`)

- First `Ready` spec after the auth batch
- Completes the primary user flow (signup → onboarding → home)
- Simple, self-contained: one endpoint, one table column (`users.interests` already exists)
- No dependencies on other unimplemented specs
- Directly unblocks `APP-05` (onboarding screen)
- Clear, testable acceptance criteria

## Decisions requiring your approval

1. **Next ticket:** Proceed with SPEC-05 (Choose-interests onboarding) as the first implementation ticket?
2. **Home feed contracts:** `SPEC-27` / `APP-26` do not exist despite Home being confirmed product direction. Draft them before any Home implementation?
3. **GitHub issues/tickets:** Issue tracker is empty. Create GitHub issues for the prioritized roadmap tickets? (Triage labels `ready-for-agent` etc. don't exist yet — see `docs/agents/issue-tracker.md`. Would need to create labels or run `to-spec`/`to-tickets` with explicit "do not apply labels".)
4. **Local Postgres:** Docker container is running now but won't persist across sessions. Add a `docker-compose.yml` at repo root (api/ has one) or document setup for local Postgres so tests can run?

## Notes

- No existing project knowledge was lost. Completed specs (SPEC-01–04, APP-01–04) are preserved under `docs/specs/archive/`.
- Spec identifiers are permanent and not reused (per `docs/agents/specs.md`).
- The app package has no test runner configured; do not claim app test coverage (per CODING_STANDARDS.md).
- `@forgd/api` and `@forgd/app` are now the scoped package names (renamed from `api` and `app`).
