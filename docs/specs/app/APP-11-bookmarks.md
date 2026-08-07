# APP-11: Bookmark / unbookmark + Bookmark list

**Status:** Draft
**Pairs with:** `specs/api/SPEC-11-bookmarks.md`
**Screen(s):** Bookmark (list), bookmark toggle on Project detail
**Related docs:** `prd.md` §5, `redesign/04-profile.md`

---

## 1. Context

The toggle itself lives on Project detail (see APP-08 §4.2, which already covers it — not duplicated here). This spec is really about the standalone Bookmark list screen, reachable from Profile.

## 2. Out of Scope

- The bookmark toggle interaction on Project detail — fully covered in APP-08 §4.2, reused here by reference rather than repeated

## 3. Entry & Navigation

- **Entered from:** "Bookmark" action row on Profile (redesign/04)
- **On tapping a card:** Project detail (APP-08)
- **On back:** Profile
- **Route (Expo Router):** `/(tabs)/profile/bookmarks`

## 4. Data

### 4.1 Reads (queries)

| Calls (SPEC-11 §4.1) | Query key | staleTime | Notes |
|---|---|---|---|
| `GET /bookmarks` | `['bookmarks']` | 30s | Same query key invalidated by the Project detail bookmark-toggle mutation (APP-08 §4.2), so unbookmarking from Project detail correctly removes the row here on next visit. |

### 4.2 Writes (mutations)

None directly on this screen — unbookmarking, if offered here too (e.g. a swipe-to-remove), reuses the exact same `DELETE /projects/:id/bookmark` mutation defined in APP-08 §4.2.

## 5. Screen States

| State | Trigger | UI |
|---|---|---|
| Loading | Initial fetch | Skeleton cards (same card style as the Projects feed) |
| Empty | Zero bookmarks | "You haven't bookmarked anything yet" |
| Error | Fetch rejected | Retry banner |
| Success | Normal render | List of project cards, same visual style as the feed (SPEC-11 §4.4 response shape) |

## 6. Client-side Validation

None — read-only list plus an optional remove action that's a pre-validated idempotent call (SPEC-11 §3.1).

## 7. Error Mapping

Nothing specific beyond the generic fetch-retry in §5 — `GET /bookmarks` has no documented error cases beyond auth (SPEC-11 §4.5 only lists a 404 for the PUT toggle, not this list read).

## 8. Local/Device State

None.

## 9. Acceptance Criteria

- [ ] Shows all bookmarked projects, newest-bookmarked first
- [ ] Unbookmarking a project (from here or from Project detail) removes it from this list on next fetch
- [ ] Empty state shown correctly, not confused with an error
- [ ] Covers all states in §5
