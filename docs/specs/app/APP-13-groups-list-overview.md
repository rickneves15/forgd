# APP-13: Groups list + Group detail overview

**Status:** Draft
**Pairs with:** `specs/api/SPEC-13-groups-list-overview.md`
**Screen(s):** Group (list), Group detail (overview)
**Related docs:** `prd.md` §4.2, `redesign/03-groups.md`

---

## 1. Context

The Group tab's landing list plus the overview shell one taps into — four entry rows (Tasks/Issues/Chat/Members) live here, each its own spec/screen.

## 2. Out of Scope

- Tasks (APP-14), Issues (APP-15), Chat (APP-17), Members (APP-18) — this spec is only the list + the overview shell that links to them

## 3. Entry & Navigation

- **Entered from:** Group tab (one of the app's 3 bottom tabs, per CONTEXT.md's navigation consolidation)
- **On tapping a group row (list):** that Group's detail/overview
- **On tapping "Tasks (N)":** APP-14
- **On tapping "Issues (N)":** APP-15
- **On tapping "Group Chat":** APP-17
- **On tapping "Group Members":** APP-18
- **Route (Expo Router):** `/(tabs)/groups` (list), `/(tabs)/groups/[id]` (detail overview)

## 4. Data

### 4.1 Reads (queries)

| Calls (SPEC-13 §4.1) | Query key | staleTime | Notes |
|---|---|---|---|
| `GET /groups` | `['groups']` | 30s, refetch on tab focus | |
| `GET /groups/:id` | `['groups', id]` | 15s, refetch on screen focus | `taskCount`/`issueCount`/`percentComplete` here are read-only summaries — the actual Tasks/Issues screens (APP-14/15) do their own independent fetching, this is just the overview's snapshot. |

### 4.2 Writes (mutations)

None on this screen.

## 5. Screen States

| State | Trigger | UI |
|---|---|---|
| Loading (list) | Initial fetch | Skeleton rows |
| Empty (list) | Caller belongs to zero groups | "You're not in any groups yet — apply to an open project or create your own" (links to Projects feed / Add Project) |
| Loading (detail) | Initial fetch | Skeleton overview |
| Error | 403 `FORBIDDEN` (detail) | Full-screen "You're not a member of this group" + back — shouldn't normally be reachable since the list only ever shows groups the caller belongs to, but the API enforces it regardless |
| Error | 404 `GROUP_NOT_FOUND` (detail) | Full-screen not-found + back |
| Error (other) | Any other fetch failure | Retry banner |
| Success | Normal render | List rows with progress bar + last-update preview (list); overview with progress bar + 4 entry rows + last-update card (detail) |

## 6. Client-side Validation

None — fully read-only.

## 7. Error Mapping

| Code (SPEC-13 §4.5) | User-facing behavior |
|---|---|
| 403 `FORBIDDEN` | Full-screen not-a-member state, see §5 |
| 404 `GROUP_NOT_FOUND` | Full-screen not-found state, see §5 |

## 8. Local/Device State

None.

## 9. Acceptance Criteria

- [ ] List shows only groups the caller belongs to, with progress bar + last-update preview per row
- [ ] Detail shows accurate `percentComplete` (0% renders cleanly, not a divide-by-zero glitch, per SPEC-13 §5)
- [ ] Zero-group state shows helpful next steps, not a bare empty list
- [ ] Covers all states in §5
