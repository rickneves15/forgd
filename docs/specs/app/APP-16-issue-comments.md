# APP-16: Comments on an Issue

**Status:** Draft
**Pairs with:** `specs/api/SPEC-16-issue-comments.md`
**Screen(s):** Issue thread ("comments" screen)
**Related docs:** `prd.md` §4.5, `redesign/03-groups.md`

---

## 1. Context

Flat reply thread under one Issue — the original issue text pinned at top, chronological comments below (oldest first — thread-reading order, per SPEC-16 §5, notably the *opposite* order from the Issues list itself which is newest-first).

## 2. Out of Scope

- Editing/deleting comments, nested replies — neither exists (SPEC-16 §2)

## 3. Entry & Navigation

- **Entered from:** tapping an issue row on the Issues list (APP-15)
- **On back:** Issues list
- **Route (Expo Router):** `/(tabs)/projects/[id]/issues/[issueId]`

## 4. Data

### 4.1 Reads (queries)

| Calls (SPEC-16 §4.1) | Query key | staleTime | Notes |
|---|---|---|---|
| `GET /issues/:issueId/comments` | `['issues', issueId, 'comments']` | 15s, refetch on screen focus | The pinned issue text itself is passed in via navigation params from the Issues list rather than re-fetched — it's already fully loaded there, no need for a second round trip just to show the same text again. |

### 4.2 Writes (mutations)

| Calls (SPEC-16 §4.1) | Invalidates | Optimistic? | Notes |
|---|---|---|---|
| `POST /issues/:issueId/comments` | `['issues', issueId, 'comments']`, `['projects', projectId, 'issues']` (comment count on the parent list) | No — a comment is content the user is putting their name on, worth confirming server-side before showing it as posted | |

## 5. Screen States

| State | Trigger | UI |
|---|---|---|
| Loading | Initial fetch | Skeleton bubbles |
| Empty | Zero comments | Just the pinned issue text + an empty thread + the input — "No replies yet" isn't really needed, an empty thread reads fine on its own |
| Error | 404 `ISSUE_NOT_FOUND` | Full-screen not-found + back |
| Error (other) | Fetch/mutation rejected | Retry banner / inline error on the comment input |
| Success | Normal render | Pinned issue text at top, chronological comment bubbles (username + text + timestamp), input pinned at bottom |

## 6. Client-side Validation

- Comment text: required, 1-500 chars (mirrors SPEC-16 §4.3), send button disabled outside that range.

## 7. Error Mapping

| Code (SPEC-16 §4.5) | User-facing behavior |
|---|---|
| 400 `VALIDATION_ERROR` | Shouldn't be reachable given §6 — generic banner fallback |
| 404 `ISSUE_NOT_FOUND` | Full-screen not-found, see §5 |

## 8. Local/Device State

- Comment input text: local state, cleared on successful send.

## 9. Acceptance Criteria

- [ ] Comments render oldest-first (thread order), distinct from the Issues list's newest-first order
- [ ] Any logged-in user can comment, including the issue's own author
- [ ] Sending a comment updates the parent Issues list's comment count on next visit
- [ ] Covers all states in §5
