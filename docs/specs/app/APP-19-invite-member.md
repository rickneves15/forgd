# APP-19: Invite member directly to Group

**Status:** Draft
**Pairs with:** `specs/api/SPEC-19-invite-member.md`
**Screen(s):** Invite member to group (new V1 screen)
**Related docs:** `prd.md` §4.4, `redesign/03-groups.md`

---

## 1. Context

A deliberately tiny utility screen — one search input, one result, one "Add" button — for a group admin to add someone they already know, bypassing the formal Apply flow entirely (SPEC-19 §1).

## 2. Out of Scope

- The formal Application accept path (APP-10) — a separate, more involved flow
- Any accept/decline step from the invitee — they're added immediately, no consent step in V1 (SPEC-19 §3.3)

## 3. Entry & Navigation

- **Entered from:** "+" header button on Group Members (APP-18), admin-only entry point
- **On success:** back to Group Members, new member now visible in the list
- **On cancel / back:** Group Members, no side effect
- **Route (Expo Router):** `/(tabs)/groups/[id]/members/invite`

## 4. Data

### 4.1 Reads (queries)

| Calls | Query key | staleTime | Notes |
|---|---|---|---|
| `GET /users?username=` (SPEC-19 §4.1, now a formal contract, not just an implementation note) | `['users', 'lookup', usernameInput]` | 0 (always fresh — this is a live search, not cacheable content) | Debounced as the admin types (SPEC-19 §6 explicitly calls this an app-side concern); exact-match only in V1, not fuzzy search. |

### 4.2 Writes (mutations)

| Calls (SPEC-19 §4.1) | Invalidates | Optimistic? | Notes |
|---|---|---|---|
| `POST /groups/:id/members` `{ username }` | `['groups', id, 'members']`, `['groups', id]` (memberCount) | No — adding someone to a group is a real, immediately-visible-to-them action (they get notified per SPEC-19 §3.1), worth confirming against the server rather than assuming success | |

## 5. Screen States

| State | Trigger | UI |
|---|---|---|
| Idle | No input yet | Just the search field, no result row |
| Searching | Debounced lookup in flight | Small inline spinner in/near the input |
| Found | Lookup resolves to a user | Result row: username + college + "Add" button |
| Not found | Lookup resolves to nothing | "No user found with that username" |
| Loading (add) | `POST /groups/:id/members` in flight | "Add" button disabled + spinner |
| Error | Add rejected | Inline error — see §7 |
| Success | 200 response | No visible state — immediate navigation back to Group Members |

## 6. Client-side Validation

- Search only fires once the input is non-empty (no lookup on an empty field).
- "Add" button only renders on a resolved Found result — there's no way to submit an unvalidated/unresolved username from this UI.

## 7. Error Mapping

| Code (SPEC-19 §4.5) | User-facing behavior |
|---|---|
| 403 `FORBIDDEN` | Shouldn't be reachable (entry point only shown to the admin, APP-18 §6) — full-screen fallback if it somehow occurs |
| 404 `USER_NOT_FOUND` | Treated the same as the "Not found" search state, §5 — the add action shouldn't normally reach this since it only fires on an already-resolved result, but the API's own check is the real guard (race condition: user deleted their account between search and add) |
| 409 `ALREADY_MEMBER` | Inline message on the result row: "Already in this group" — Add button disabled for that result |

## 8. Local/Device State

- Search input text: local state, not persisted.

## 9. Acceptance Criteria

- [ ] Typing a username debounces a lookup, shows Found/Not-found accordingly
- [ ] Admin can add a found, not-yet-member user, lands back on Members showing them
- [ ] Already-a-member result shows the inline message, Add disabled
- [ ] Covers all states in §5
