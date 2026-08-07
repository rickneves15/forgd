# APP-05: Choose-interests onboarding

**Status:** Draft
**Pairs with:** `specs/api/SPEC-05-onboarding-interests.md`
**Screen(s):** Choose your interests
**Related docs:** `prd.md` §4.1, `redesign/01-auth-onboarding.md`

---

## 1. Context

Shown right after a fresh signup (email/password, or Google with `isNewUser: true`) to pre-filter the Projects feed. Fully skippable, and the same endpoint/screen content is reused later from Settings → "Change my interests" (APP-24).

## 2. Out of Scope

- The Projects feed filtering logic that actually consumes these interests (APP-07)
- Settings' entry point into this same screen (APP-24) — this spec covers the screen itself, reused in both contexts

## 3. Entry & Navigation

- **Entered from:** immediately after a successful signup (APP-01, or APP-03 with `isNewUser: true`); also reachable later from Settings → "Change my interests" (APP-24)
- **On success / skip:** Projects feed when entered from signup; back to Settings when entered from "Change my interests"
- **On cancel / back:** not offered during the signup path (no back button — skip is the escape hatch, per §5/§6); back arrow available when entered from Settings
- **Route (Expo Router):** `/(auth)/choose-interests` (signup path) — the Settings entry point pushes the same screen component onto the Profile stack instead of the auth stack, so back behaves correctly in each context

## 4. Data

### 4.1 Reads (queries)

| Calls | Query key | staleTime | Notes |
|---|---|---|---|
| none required to render — when entered from Settings, pre-populate the chip selection from the already-cached `['me']` user object's `interests` field rather than issuing a fresh fetch | — | — | — |

### 4.2 Writes (mutations)

| Calls (SPEC-05 §4.1) | Invalidates | Optimistic? | Notes |
|---|---|---|---|
| `PUT /users/me/interests` | `['me']` | Yes — update the local `['me']` cache's `interests` field immediately on tap-to-select before the request resolves, since this is a simple, low-stakes toggle list with no realistic failure mode beyond a network drop | On failure of an optimistic update: roll back the local selection and show a lightweight inline error (§7) rather than a full-screen error state |

## 5. Screen States

| State | Trigger | UI |
|---|---|---|
| Loading | Mutation in flight (only briefly visible if the optimistic update above is skipped, e.g. on the final "Done"/"Skip" tap) | Continue/Skip button shows a spinner |
| Error | Mutation rejected | Inline banner — see §7; selection state is preserved, nothing is lost |
| Success | 200 response | No dedicated success state — immediate navigation |

## 6. Client-side Validation

- Chip selection is constrained to the fixed enum from SPEC-05 §4.3 (`engineering`, `btech`, `mtech`, `it_cs`, `ente`, `electrical`, `mechanical`, `civil`) — rendered as a fixed chip list, so there's no free-text input and no way to construct an invalid tag from this screen.
- "Skip" is always enabled regardless of selection state (calling the endpoint with an empty array is a valid, documented case per SPEC-05 §3.3).

## 7. Error Mapping

| Code (SPEC-05 §4.5) | User-facing behavior |
|---|---|
| 400 `VALIDATION_ERROR` | Shouldn't be reachable from this screen's fixed chip list (§6) — treat as an unexpected-state banner ("Something went wrong, try again") if it somehow occurs, rather than designing dedicated UI for an unreachable case. |

## 8. Local/Device State

None beyond the optimistic `['me']` cache update in §4.2.

## 9. Acceptance Criteria

- [ ] Selecting/deselecting chips updates the UI instantly (optimistic), no spinner per-tap
- [ ] "Skip" with zero selections → valid, proceeds exactly like a non-empty selection
- [ ] Entered from signup → lands on Projects feed after save/skip
- [ ] Entered from Settings → returns to Settings after save, back arrow available throughout
- [ ] Reopening from Settings shows the previously saved interests pre-selected
- [ ] Covers all states in §5
