# APP-10: Manage applications (list / accept / reject)

**Status:** Draft
**Pairs with:** `specs/api/SPEC-10-manage-applications.md`
**Screen(s):** Applications list (admin view)
**Related docs:** `prd.md` §4.2, `redesign/02-projects.md`

---

## 1. Context

Owner-only review screen. Redesign/02 renames the action button from the original mock's "Add to group" to **"Accept"**, since Group membership is now an automatic side effect rather than the thing being chosen.

## 2. Out of Scope

- Applying itself (APP-09)
- The direct-invite path (APP-19) — a separate, simpler flow for adding someone without a formal application

## 3. Entry & Navigation

- **Entered from:** an owner-only entry point on their own Project detail (APP-08) — e.g. an "View applications" button, only visible when `project.owner.id === currentUser.id`
- **On tapping a resume link:** opens the resume file (external viewer / in-app PDF viewer, not a separate app screen)
- **On back:** Project detail
- **Route (Expo Router):** `/(tabs)/projects/[id]/applications`

## 4. Data

### 4.1 Reads (queries)

| Calls (SPEC-10 §4.1) | Query key | staleTime | Notes |
|---|---|---|---|
| `GET /projects/:id/applications` | `['projects', id, 'applications']` | 15s | |

### 4.2 Writes (mutations)

| Calls (SPEC-10 §4.1) | Invalidates | Optimistic? | Notes |
|---|---|---|---|
| `POST /applications/:applicationId/accept` | `['projects', id, 'applications']`, `['groups']` (a new group membership may now exist), `['projects', id]` (applicationsCount) | No — accepting has real side effects (group membership) worth confirming against the server, not assuming success | Show a brief confirm step before firing (see §6) since this can't be undone from this screen. |
| `POST /applications/:applicationId/reject` | `['projects', id, 'applications']` | No | |

## 5. Screen States

| State | Trigger | UI |
|---|---|---|
| Loading | Initial list fetch | Skeleton rows |
| Loading (row) | Accept/reject in flight for one specific application | That row's buttons disabled + spinner; other rows remain interactive |
| Empty | Zero applications | "No applications yet" |
| Error | List fetch rejected | Retry banner |
| Error (row) | Accept/reject rejected | Inline error on that row — see §7, row returns to its pre-action state |
| Success | Normal render | List of applicant rows with Accept/Reject buttons on pending ones; accepted/rejected rows show their resolved status instead of action buttons |

## 6. Client-side Validation

- A lightweight confirm step (not a full modal, a simple "Accept [username]?" inline confirm) before firing Accept — this action adds someone to a Group immediately and can't be undone from this screen, worth one extra tap of friction.
- Accept/Reject buttons only render on `status: "pending"` rows — already-decided applications show their resolved status as text instead, so a duplicate accept/reject attempt isn't constructible from this UI.

## 7. Error Mapping

| Code (SPEC-10 §4.5) | User-facing behavior |
|---|---|
| 403 `FORBIDDEN` | Shouldn't be reachable (this screen is only ever entered by the owner) — full-screen fallback error if it somehow occurs (e.g. ownership changed underneath, not currently possible but defensive) |
| 400 `NO_OPENINGS_LEFT` | Inline row error: "All openings are filled." Row stays in its pending state, Accept button disabled going forward for this row until the owner frees up a slot (not currently possible in V1 — openings can't be edited after creation, so this is effectively terminal for that application in the given project) |
| 409 `ALREADY_DECIDED` | Refetch the list (someone/something else already resolved it) and show that row's real current status — race condition, not a user-facing error message needed |

## 8. Local/Device State

None.

## 9. Acceptance Criteria

- [ ] List shows all applications with resume links, pending ones show Accept/Reject
- [ ] Accept → row updates to "Accepted", group membership implied server-side, applicationsCount stays consistent on next Project detail visit
- [ ] Reject → row updates to "Rejected", no group side effect
- [ ] `NO_OPENINGS_LEFT` shown inline, doesn't crash or silently fail
- [ ] Non-pending rows never show action buttons
- [ ] Covers all states in §5
