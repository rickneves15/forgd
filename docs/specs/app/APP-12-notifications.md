# APP-12: Notifications list + unread count

**Status:** Draft
**Pairs with:** `specs/api/SPEC-12-notifications.md`
**Screen(s):** Notifications
**Related docs:** `prd.md` §3, `redesign/02-projects.md`

---

## 1. Context

Fetch-on-open notification center, two tabs (General / Applications) matching the original mock. No push, no real-time — plain polling per SPEC-12 §6.

## 2. Out of Scope

- Native push notifications — explicit V2 non-goal (prd.md §6)
- Whatever generates each notification (SPEC-10, SPEC-15, SPEC-16, SPEC-19) — this screen only reads and marks-read

## 3. Entry & Navigation

- **Entered from:** bell icon on the Projects feed header (redesign/02)
- **On tapping a notification with a `targetProjectId`:** Project detail (APP-08) for that project
- **On back:** Projects feed
- **Route (Expo Router):** `/(tabs)/projects/notifications`

## 4. Data

### 4.1 Reads (queries)

| Calls (SPEC-12 §4.1) | Query key | staleTime | Notes |
|---|---|---|---|
| `GET /notifications?type=general` | `['notifications', 'general']` | 15s, refetch on screen focus | One query per tab — switching tabs doesn't refetch if the other tab's data is still fresh. |
| `GET /notifications?type=application_status` | `['notifications', 'application_status']` | 15s, refetch on screen focus | |
| `GET /notifications` (no `type`, just for the bell badge) | `['notifications', 'unreadCount']` | 30s | Used by the tab-bar bell icon badge elsewhere in the app, not just this screen — kept as its own lightweight query so the badge doesn't require loading the full list. |

### 4.2 Writes (mutations)

| Calls (SPEC-12 §4.1) | Invalidates | Optimistic? | Notes |
|---|---|---|---|
| `PUT /notifications/read-all` | `['notifications', 'general']`, `['notifications', 'application_status']`, `['notifications', 'unreadCount']` | Yes — zero out the badge and the unread-dot styling immediately on screen open, since re-reading something that's already been visually acknowledged has no real failure cost worth blocking on | Fired automatically on entering this screen (not a button tap) — matching "opens the Notifications screen" in SPEC-12 §3.1. |

## 5. Screen States

| State | Trigger | UI |
|---|---|---|
| Loading | Initial fetch (either tab) | Skeleton rows |
| Empty | Zero notifications for the active tab | "Nothing here yet" |
| Error | Fetch rejected | Retry banner, doesn't block switching to the other tab |
| Success | Normal render | Rows with icon + message + relative timestamp; unread ones get the accent dot/left-border (redesign/02) until `read-all` resolves |

## 6. Client-side Validation

None — `type` is chosen via fixed tabs, not free input, so SPEC-12 §4.5's `VALIDATION_ERROR` for an invalid `type` isn't constructible from this UI.

## 7. Error Mapping

| Code (SPEC-12 §4.5) | User-facing behavior |
|---|---|
| 400 `VALIDATION_ERROR` | Unreachable given §6 — no dedicated UI |

## 8. Local/Device State

None.

## 9. Acceptance Criteria

- [ ] Opening the screen marks everything read (optimistically, then confirmed) and zeroes the bell badge
- [ ] Two tabs load and cache independently
- [ ] Tapping a notification with a project target navigates to that Project detail
- [ ] Empty state per tab shown correctly
- [ ] Covers all states in §5
