# APP-09: Apply to a project

**Status:** Draft
**Pairs with:** `specs/api/SPEC-09-apply-to-project.md`
**Screen(s):** Apply for [project] (resume confirmation screen)
**Related docs:** `prd.md` §4.2, `redesign/02-projects.md`

---

## 1. Context

A lightweight confirmation screen — the resume itself is never picked here, it's pulled automatically from the profile (SPEC-09 §4.3 has no request body at all).

## 2. Out of Scope

- Uploading/changing the resume itself (APP-22)
- Owner reviewing the application (APP-10)

## 3. Entry & Navigation

- **Entered from:** "Apply now" button on Project detail (APP-08), only shown when the project is open and the user hasn't already applied and has a resume on file
- **On success:** back to Project detail, now showing "Applied" state
- **On cancel / back:** Project detail, no side effect
- **Route (Expo Router):** `/(tabs)/projects/[id]/apply`

## 4. Data

### 4.1 Reads (queries)

| Calls | Query key | staleTime | Notes |
|---|---|---|---|
| none new — reads the resume filename from the already-cached `['me']` user object rather than a fresh fetch | — | — | — |

### 4.2 Writes (mutations)

| Calls (SPEC-09 §4.1) | Invalidates | Optimistic? | Notes |
|---|---|---|---|
| `POST /projects/:id/applications` | `['projects', id]` (so the next Project detail read shows `hasApplied: true`) | No — this is a one-shot, non-reversible action from the user's perspective, worth waiting for real confirmation rather than optimistic UI | |

## 5. Screen States

| State | Trigger | UI |
|---|---|---|
| Loading | Mutation in flight | "Apply now" button disabled + spinner |
| Error | Mutation rejected | Banner — see §7 |
| Success | 201 response | No visible state — immediate navigation back to Project detail |

## 6. Client-side Validation

None — there's no form, just a confirmation of pre-existing data (resume filename) plus the submit action. The "no resume" and "already applied" and "own project" cases are all prevented upstream by Project detail (APP-08) hiding/disabling the Apply entry point in those states — this screen shouldn't normally be reachable in an invalid state at all.

## 7. Error Mapping

| Code (SPEC-09 §4.5) | User-facing behavior |
|---|---|
| 400 `PROJECT_NOT_OPEN` | Banner: "This project isn't accepting applications anymore." (race condition — project closed between viewing detail and confirming apply) |
| 400 `NO_RESUME` | Banner + link to Resume upload (APP-22) — shouldn't normally be reachable per §6, but the API enforces it regardless (SPEC-09 §5), so the app should too |
| 400 `CANNOT_APPLY_TO_OWN_PROJECT` | Shouldn't be reachable (Project detail never shows Apply on your own project) — generic banner as a fallback only |
| 409 `ALREADY_APPLIED` | Banner: "You've already applied to this project." + navigate back to Project detail (which will now correctly show the Applied state on its next read) |

## 8. Local/Device State

None.

## 9. Acceptance Criteria

- [ ] Confirm → application created, returns to Project detail showing Applied state
- [ ] Race-condition errors (project closed, already applied) are shown as clear banners, not generic failures
- [ ] Covers all states in §5
