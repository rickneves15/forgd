# APP-15: Issues on a Project

**Status:** Draft
**Pairs with:** `specs/api/SPEC-15-project-issues.md`
**Screen(s):** Issues (list + add issue)
**Related docs:** `prd.md` §4.5, `redesign/03-groups.md`

---

## 1. Context

Reachable two ways to the same data: directly from Project detail, or as a shortcut from Group detail (SPEC-15 §1, redesign/03) — one screen, one query key, regardless of entry point.

## 2. Out of Scope

- Comments (APP-16) — this screen is only the flat issue list + creating a new one
- Any open/closed triage status — doesn't exist (SPEC-15 §2)

## 3. Entry & Navigation

- **Entered from:** Project detail (APP-08) directly, or Group detail's "Issues (N)" shortcut (APP-13) — both land on the exact same screen/data for the underlying project
- **On tapping an issue row:** Issue thread (APP-16)
- **On back:** whichever screen it was entered from
- **Route (Expo Router):** `/(tabs)/projects/[id]/issues` — the Group detail shortcut pushes this same route (resolving the group's underlying `projectId` first), it doesn't duplicate the screen under a `/groups/...` path

## 4. Data

### 4.1 Reads (queries)

| Calls (SPEC-15 §4.1) | Query key | staleTime | Notes |
|---|---|---|---|
| `GET /projects/:id/issues` | `['projects', id, 'issues']` | 15s, refetch on screen focus | Same key regardless of whether the user arrived via Project detail or the Group shortcut, since it's genuinely the same data (SPEC-15 §1). |

### 4.2 Writes (mutations)

| Calls (SPEC-15 §4.1) | Invalidates | Optimistic? | Notes |
|---|---|---|---|
| `POST /projects/:id/issues` | `['projects', id, 'issues']` | No | |

## 5. Screen States

| State | Trigger | UI |
|---|---|---|
| Loading | Initial fetch | Skeleton rows |
| Empty | Zero issues | "No issues reported yet — add the first one" |
| Error | 404 `PROJECT_NOT_FOUND` | Full-screen not-found + back |
| Error (other) | Fetch/mutation rejected | Retry banner / inline error on the add-issue form |
| Success | Normal render | Rows: short text + comment count + relative time; "+ Add issue" entry point |

## 6. Client-side Validation

- New issue text: required, 1-500 chars (mirrors SPEC-15 §4.3), submit disabled outside that range, live character count as the user approaches the limit.

## 7. Error Mapping

| Code (SPEC-15 §4.5) | User-facing behavior |
|---|---|
| 400 `VALIDATION_ERROR` | Shouldn't be reachable given §6 — generic banner fallback |
| 404 `PROJECT_NOT_FOUND` | Full-screen not-found, see §5 |

## 8. Local/Device State

- New-issue text input: local state, cleared on successful submit.

## 9. Acceptance Criteria

- [ ] Any logged-in user (including the project owner) can view and add issues, not just group members
- [ ] List shows comment count per issue
- [ ] Reaching this screen via Group detail's shortcut shows identical data to reaching it via Project detail
- [ ] Covers all states in §5
