# APP-14: Group Tasks

**Status:** Draft
**Pairs with:** `specs/api/SPEC-14-group-tasks.md`
**Screen(s):** Group tasks
**Related docs:** `prd.md` §4.2, `redesign/03-groups.md`

---

## 1. Context

Flat checklist for a Group — any member can add and complete tasks, optionally assigning to another member. No due dates/priority (deliberately minimal, SPEC-14 §2).

## 2. Out of Scope

- Deleting tasks — no such endpoint exists (SPEC-14 §3.3), so no delete UI either

## 3. Entry & Navigation

- **Entered from:** "Tasks (N)" row on Group detail (APP-13)
- **On back:** Group detail
- **Route (Expo Router):** `/(tabs)/groups/[id]/tasks`

## 4. Data

### 4.1 Reads (queries)

| Calls (SPEC-14 §4.1) | Query key | staleTime | Notes |
|---|---|---|---|
| `GET /groups/:id/tasks` | `['groups', id, 'tasks']` | 15s, refetch on screen focus (no real-time here per SPEC-14 §6 — plain refetch, unlike Chat) | |

### 4.2 Writes (mutations)

| Calls (SPEC-14 §4.1) | Invalidates | Optimistic? | Notes |
|---|---|---|---|
| `POST /groups/:id/tasks` | `['groups', id, 'tasks']`, `['groups', id]` (percentComplete changes) | No | |
| `PUT /tasks/:taskId` `{ done }` | `['groups', id, 'tasks']`, `['groups', id]` | Yes — toggling a checkbox should feel instant; roll back the row (and its strikethrough styling) on failure | |

## 5. Screen States

| State | Trigger | UI |
|---|---|---|
| Loading | Initial fetch | Skeleton rows |
| Empty | Zero tasks | "No tasks yet — add the first one" |
| Error | Fetch rejected | Retry banner |
| Error (toggle) | `PUT /tasks/:taskId` rejected | Row rolls back to its pre-toggle state, brief inline error | |
| Success | Normal render | Checkbox rows, done rows strikethrough + dimmed, assignee avatar/initial chip on the right (or empty if unassigned) |

## 6. Client-side Validation

- New task text: required, non-empty, submit disabled until present.
- Assignee picker: constrained to the group's own member list (fetched via APP-18's query key, `['groups', id, 'members']`, reused here rather than re-fetched) — so `INVALID_ASSIGNEE` (SPEC-14 §4.5) isn't constructible from this UI, since the picker only ever offers real members.

## 7. Error Mapping

| Code (SPEC-14 §4.5) | User-facing behavior |
|---|---|
| 403 `FORBIDDEN` | Shouldn't be reachable (only members ever reach this screen via APP-13) — full-screen fallback if it somehow occurs |
| 400 `INVALID_ASSIGNEE` | Unreachable given §6's constrained picker — no dedicated UI |

## 8. Local/Device State

- New-task input field: local state, cleared on successful submit.

## 9. Acceptance Criteria

- [ ] Any member can add a task, with or without an assignee
- [ ] Toggling done/undone updates instantly (optimistic) and rolls back cleanly on failure
- [ ] Assignee picker only ever shows real group members
- [ ] Covers all states in §5
