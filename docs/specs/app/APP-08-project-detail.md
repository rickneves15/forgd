# APP-08: Project detail

**Status:** Draft
**Pairs with:** `specs/api/SPEC-08-project-detail.md`
**Screen(s):** Project detail
**Related docs:** `prd.md` §5, `redesign/02-projects.md`

---

## 1. Context

Full view of one project — the recruiting block (stipend/duration/responsibilities/openings) and the Apply button only render when `isOpen: true`, one screen layout for both portfolio and open projects (SPEC-08 §3.3).

## 2. Out of Scope

- Applying itself (APP-09)
- Issues/comments (APP-15/APP-16) — reachable from here but their own spec pairing

## 3. Entry & Navigation

- **Entered from:** tapping a card in the Projects feed (APP-07), a Bookmark list row (APP-11), or a user's profile project list (APP-20)
- **On tapping Apply (open projects only):** Apply confirmation (APP-09)
- **On tapping Issues:** Issues list (APP-15)
- **On tapping the owner's name/avatar:** that user's profile (APP-20, viewed as "another user")
- **On back:** whichever screen it was entered from
- **Route (Expo Router):** `/(tabs)/projects/[id]`

## 4. Data

### 4.1 Reads (queries)

| Calls (SPEC-08 §4.1) | Query key | staleTime | Notes |
|---|---|---|---|
| `GET /projects/:id` | `['projects', id]` | 30s | Includes `hasApplied`/`isBookmarked` scoped to the caller — refetch on screen focus so these stay accurate after returning from Apply or toggling a bookmark elsewhere. |

### 4.2 Writes (mutations)

| Calls (SPEC-11 §4.1, bookmark toggle lives on this screen per redesign/02) | Invalidates | Optimistic? | Notes |
|---|---|---|---|
| `PUT`/`DELETE /projects/:id/bookmark` | `['projects', id]`, `['bookmarks']` | Yes — flip the bookmark icon instantly, both endpoints are idempotent (SPEC-11 §3) so a double-tap race is harmless | Rollback on failure is low-stakes (just flip the icon back), no error banner needed for this one — a failed bookmark toggle can just silently retry on the next tap. |

## 5. Screen States

| State | Trigger | UI |
|---|---|---|
| Loading | Initial fetch | Skeleton layout |
| Error | 404 `PROJECT_NOT_FOUND` | Full-screen "This project isn't available anymore" + back action (no retry — a 404 isn't transient) |
| Error (other) | Any other fetch failure | Retry banner |
| Success | Normal render | Photo/pdf gallery, description, recruiting block (conditional), Apply button (conditional on `isOpen` and `!hasApplied`) |

## 6. Client-side Validation

None — read-only screen aside from the bookmark toggle, which has no validatable input.

## 7. Error Mapping

| Code (SPEC-08 §4.5) | User-facing behavior |
|---|---|
| 404 `PROJECT_NOT_FOUND` | Full-screen not-found state, see §5 |

## 8. Local/Device State

- "Download all photos" / "Download pdf" (redesign/02 §Visual direction) write to the device's file system / media library via `expo-file-system` + `expo-media-library` — not a server-side concern, purely local to this screen. No state to persist beyond the download itself.

## 9. Acceptance Criteria

- [ ] Portfolio project → no recruiting block, no Apply button
- [ ] Open project, not yet applied → recruiting block + enabled Apply button
- [ ] Open project, already applied (`hasApplied: true`) → Apply button hidden or shown as "Applied" (disabled), never lets a duplicate apply attempt reach APP-09
- [ ] Bookmark icon reflects and toggles `isBookmarked` optimistically
- [ ] Nonexistent project id → not-found state, not a generic error
- [ ] Covers all states in §5
