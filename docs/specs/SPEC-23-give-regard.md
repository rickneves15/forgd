# SPEC-23: Give a Regard

**Status:** Ready
**Screen(s):** Profile (Regards button)
**Related docs:** `prd.md` §4.6, `domain-model.md` §Regard

---

## 1. Context

Peer-appreciation "like" on a user's profile. Counter only, per the original mock (no list of who gave it).

## 2. Out of Scope

- Any list of who gave Regards — deliberately not built (matches original mock, keeps this feature tiny).

## 3. Scenarios

### 3.1 Happy Path

```gherkin
Given the caller is viewing another user's profile
When POST /users/:id/regard
Then that user's regardsCount increments by 1, and the caller cannot regard the same user again
```

### 3.2 Error Cases

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Regarding yourself | `:id === callerId` | POST regard | 400 `CANNOT_REGARD_SELF` |
| Already regarded | caller already regarded this user | POST regard again | 409 `ALREADY_REGARDED` |

### 3.3 Edge Cases

- No "un-regard" action in V1 (matches the original mock — it's a one-directional counter, not a toggle-able like).

## 4. Contract

### 4.1 Endpoint

```
POST /users/:id/regard
```

### 4.2 Auth

- Requires auth: yes
- Extra check: `:id` must not equal the caller's own id

### 4.3 Request

_(no body)_

### 4.4 Response (Success)

```json
{ "regardsCount": 574 }
```

### 4.5 Response (Errors)

| HTTP | Code | When |
|------|------|------|
| 400 | CANNOT_REGARD_SELF | self-regard attempt |
| 409 | ALREADY_REGARDED | duplicate |

## 5. Acceptance Criteria

- [ ] First regard from a given user → count +1
- [ ] Second attempt from the same user → 409, count unchanged
- [ ] Self-regard → 400
- [ ] Covers all scenarios in §3

## 6. Implementation Notes

- Still store individual `(giverId, receiverId)` rows even though no list is shown in V1 — that's what makes "already regarded" enforceable, and it costs nothing to keep the data even if the UI for viewing it comes later.
