# APP-20: View profile (own or another user's)

**Status:** Draft
**Pairs with:** `specs/api/SPEC-20-view-profile.md`
**Screen(s):** Profile
**Related docs:** `prd.md` §3, `redesign/04-profile.md`

---

## 1. Context

Same screen for viewing your own profile (Profile tab) and someone else's (tapping a username/avatar elsewhere in the app) — `isSelf` in the response drives which action rows render (SPEC-20 §4.4).

## 2. Out of Scope

- Editing (APP-21), Resume (APP-22), giving Regards (APP-23) — this spec is read-only viewing; the entry points to those live here but their behavior is specced separately

## 3. Entry & Navigation

- **Entered from:** Profile tab (own profile, `:id` = current user); tapping a username/avatar anywhere else in the app (Project detail owner, Group member row, Application row, etc. — another user's profile)
- **On tapping "Message" (own-profile-only when viewing someone else):** Direct message (APP-25)
- **On tapping "Regards" (someone else's profile only):** fires APP-23's mutation inline, doesn't navigate
- **On tapping "Add new project" / "Upload resume" / "Bookmark" / "Settings" (own profile only):** APP-06 / APP-22 / APP-11 / APP-24 respectively
- **On tapping an Active/Done project card:** Project detail (APP-08)
- **Route (Expo Router):** `/(tabs)/profile` (own, tab root) — `/users/[id]` (another user's, pushed on top of whichever tab, outside the tab-root stack)

## 4. Data

### 4.1 Reads (queries)

| Calls (SPEC-20 §4.1) | Query key | staleTime | Notes |
|---|---|---|---|
| `GET /users/:id/profile` | `['profile', id]` | 30s, refetch on screen focus (own profile especially, since edits/regards should reflect promptly) | |
| `GET /users/:id/profile/projects?status=active` | `['profile', id, 'projects', 'active']` | 30s | Separate paginated endpoint per SPEC-20 §6, fetched lazily (e.g. only when that tab/section is scrolled into view) rather than eagerly with the main profile call. |
| `GET /users/:id/profile/projects?status=done` | `['profile', id, 'projects', 'done']` | 30s | |

### 4.2 Writes (mutations)

None directly — Regards (§3 above) is its own mutation, fully specced in APP-23, just triggered from a button on this screen.

## 5. Screen States

| State | Trigger | UI |
|---|---|---|
| Loading | Initial fetch | Skeleton header + stat row |
| Error | 404 `USER_NOT_FOUND` | Full-screen not-found + back |
| Error (other) | Fetch rejected | Retry banner |
| Success | Normal render | Avatar/username/college, 3-stat row (Done/Active/Regards), action rows conditional on `isSelf`, Active/Done project list toggle |

## 6. Client-side Validation

None — fully read-only aside from the Regards trigger (validated in APP-23, not here).

## 7. Error Mapping

| Code (SPEC-20 §4.5) | User-facing behavior |
|---|---|
| 404 `USER_NOT_FOUND` | Full-screen not-found state, see §5 |

## 8. Local/Device State

- Which of Active/Done is the currently selected tab: local UI state, defaults to Active, not persisted across visits.

## 9. Acceptance Criteria

- [ ] Own profile (`isSelf: true`) → shows edit/settings/upload-resume/bookmark entry points
- [ ] Another user's profile (`isSelf: false`) → shows Regards button + Message entry point instead, no edit/settings access
- [ ] Active/Done toggle switches which project list is shown, lazily fetching each on first access
- [ ] Covers all states in §5
