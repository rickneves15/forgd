# APP-07: Projects feed + Filter

**Status:** Draft
**Pairs with:** `specs/api/SPEC-07-projects-feed.md`
**Screen(s):** Projects (feed), Filter
**Related docs:** `prd.md` §4.1/§5, `redesign/02-projects.md`

---

## 1. Context

The app's default landing tab. Shows open projects, optionally pre-filtered by the interests chosen at onboarding (APP-05) — that pre-filter is fully editable from the Filter sheet, not a locked-in state.

## 2. Out of Scope

- Project detail (APP-08)
- Portfolio-only projects — never appear here by design (SPEC-07 §2)

## 3. Entry & Navigation

- **Entered from:** default tab on app launch (once authenticated); also the landing point after signup/onboarding
- **On tapping a card:** Project detail (APP-08)
- **On tapping the filter icon:** Filter bottom sheet (same route, presented as a modal, not a full navigation push)
- **On tapping the notification bell:** Notifications (APP-12)
- **Route (Expo Router):** `/(tabs)/projects` (feed), `/(tabs)/projects/filter` (modal presentation)

## 4. Data

### 4.1 Reads (queries)

| Calls (SPEC-07 §4.1) | Query key | staleTime | Notes |
|---|---|---|---|
| `GET /projects` | `['projects', 'feed', filters]` (filters object as part of the key so each distinct filter combination caches separately) | 30s | Infinite/paginated query (React Query `useInfiniteQuery`) keyed off `page`/`pageSize`; on onboarding-derived default filters, the initial `filters` value is seeded from the cached `['me']` user's `interests`, still fully editable from here on. |

### 4.2 Writes (mutations)

None on this screen — Filter only ever changes local query params, it doesn't call a separate "save filter" endpoint.

## 5. Screen States

| State | Trigger | UI |
|---|---|---|
| Loading | Initial fetch, or any filter change (new query key) | Skeleton project cards |
| Loading more | Scrolling near the end of the list, next page fetching | Small spinner at list bottom, existing cards stay in place |
| Empty | `items: []` for the current filter combination | Empty state: "No projects match these filters" + a "Clear filters" affordance |
| Error | Fetch rejected | Retry banner/button, existing (stale) cards stay visible if this was a refetch rather than the first load |
| Success | Normal render | Project cards, infinite scroll |

## 6. Client-side Validation

- Filter sheet fields are all optional; "Apply filters" is always enabled regardless of how many are set.
- Department/Topic/College render as multi-select chip lists (SPEC-07 §4.3 now takes comma-separated values for each) — the client joins selected chips with commas before sending, one param per field.
- "Has openings" renders as a simple toggle, mapped directly to the `hasOpenings` boolean param.
- `stipendMin`/`stipendMax`/`durationMonths` are numeric inputs (slider/stepper UI, not free text) — so a non-numeric value per SPEC-07 §4.5 isn't constructible from this UI in the first place.

## 7. Error Mapping

| Code (SPEC-07 §4.5) | User-facing behavior |
|---|---|
| 400 `VALIDATION_ERROR` | Shouldn't be reachable given §6's constrained inputs — generic retry banner if it somehow occurs |

## 8. Local/Device State

- Current filter selection: local screen state (not persisted across app restarts — reopening the app resets to the onboarding-interests default, not the last-used filter).

## 9. Acceptance Criteria

- [ ] Default load shows open projects, optionally pre-filtered by onboarding interests
- [ ] Changing any filter field and tapping "Apply filters" refetches with the new params
- [ ] Scrolling to the bottom loads the next page without resetting scroll position
- [ ] Empty result set shows the empty state, not an error
- [ ] Covers all states in §5
