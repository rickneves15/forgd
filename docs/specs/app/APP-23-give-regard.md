# APP-23: Give a Regard

**Status:** Draft
**Pairs with:** `specs/api/SPEC-23-give-regard.md`
**Screen(s):** Profile (Regards button, no dedicated screen)
**Related docs:** `prd.md` §4.6, `redesign/04-profile.md`

---

## 1. Context

A single tap target on another user's profile (APP-20) — counter-only, no list of who gave it, one-directional (no un-regard).

## 2. Out of Scope

- Any list of who gave Regards — deliberately not built (SPEC-23 §2)

## 3. Entry & Navigation

- **Entered from:** Regards stat on another user's Profile (APP-20) — not shown at all on your own profile
- **On success:** no navigation, stays on Profile with the updated count
- **Route (Expo Router):** none — inline action on `/users/[id]`

## 4. Data

### 4.1 Reads (queries)

None new — reuses APP-20's already-loaded profile data for the current count.

### 4.2 Writes (mutations)

| Calls (SPEC-23 §4.1) | Invalidates | Optimistic? | Notes |
|---|---|---|---|
| `POST /users/:id/regard` | `['profile', id]` | Yes — increment the local count and trigger the small pulse animation (redesign/04) immediately on tap, before the server confirms | Rollback on failure: decrement back, no error banner needed for this one (matches the low-stakes precedent set in APP-08's bookmark toggle) — a failed regard can just be retried on the next tap. |

## 5. Screen States

Not applicable — no dedicated screen, just a button state on Profile (APP-20):

| State | Trigger | UI |
|---|---|---|
| Idle | Not yet regarded by the caller | Button enabled, tappable |
| Regarded | Caller has already regarded this user (this session or a prior one) | Button disabled/shown as already-given — see §6 for how this is known client-side |

## 6. Client-side Validation

- Button starts in the correct state directly from `SPEC-20`'s `hasRegarded` field on profile load — no more guessing or waiting for a failed attempt to find out.

## 7. Error Mapping

| Code (SPEC-23 §4.5) | User-facing behavior |
|---|---|
| 400 `CANNOT_REGARD_SELF` | Unreachable — the button is never rendered on the caller's own profile (§3) |
| 409 `ALREADY_REGARDED` | Roll back the optimistic increment, mark the button as already-given for the rest of this session (§6), no visible error banner — this isn't really a failure from the user's point of view |

## 8. Local/Device State

None — `hasRegarded` from `SPEC-20` is authoritative, no local session tracking needed.

## 9. Acceptance Criteria

- [ ] Tapping Regards on another user's profile increments the count instantly (optimistic) with the pulse animation
- [ ] A second tap in the same session doesn't fire a redundant request
- [ ] Regards button never appears on the caller's own profile
- [ ] Covers all states in §5
