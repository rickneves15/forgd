# APP-18: Group Members list

**Status:** Draft
**Pairs with:** `specs/api/SPEC-18-group-members.md`
**Screen(s):** Group members
**Related docs:** `prd.md` §4.2, `redesign/03-groups.md`

---

## 1. Context

Roster screen, admin visually distinguished with a small tag (redesign/03). Header "+" button leads to Invite (APP-19), admin-only.

## 2. Out of Scope

- Adding members — that's APP-10 (application accept) or APP-19 (direct invite), not this screen
- Removing/kicking a member — no such endpoint exists (SPEC-18 §2)

## 3. Entry & Navigation

- **Entered from:** "Group Members" row on Group detail (APP-13)
- **On tapping the header "+" (admin only):** Invite member (APP-19)
- **On back:** Group detail
- **Route (Expo Router):** `/(tabs)/groups/[id]/members`

## 4. Data

### 4.1 Reads (queries)

| Calls (SPEC-18 §4.1) | Query key | staleTime | Notes |
|---|---|---|---|
| `GET /groups/:id/members` | `['groups', id, 'members']` | 30s, refetch on screen focus | Same query key reused by APP-14's task-assignee picker rather than a second fetch. |

### 4.2 Writes (mutations)

None on this screen — adding happens on APP-19.

## 5. Screen States

| State | Trigger | UI |
|---|---|---|
| Loading | Initial fetch | Skeleton rows |
| Error | 403 `FORBIDDEN` | Full-screen not-a-member state — shouldn't be reachable given entry is gated by APP-13, defensive only |
| Success | Normal render | Admin row first (with accent-colored "admin" tag), then members in a consistent secondary order |

*(No "Empty" state — every group has at least its owner/admin, so an empty member list can't occur.)*

## 6. Client-side Validation

None — read-only. The "+" invite button itself is only rendered when `currentUser.id === group's admin id` (derived from this same response) — a non-admin never sees the entry point into APP-19 in the first place.

## 7. Error Mapping

| Code (SPEC-18 §4.5) | User-facing behavior |
|---|---|
| 403 `FORBIDDEN` | Full-screen not-a-member state, see §5 |

## 8. Local/Device State

None.

## 9. Acceptance Criteria

- [ ] Admin always listed first, visually distinguished
- [ ] "+" invite entry point only visible to the admin
- [ ] Covers all states in §5
