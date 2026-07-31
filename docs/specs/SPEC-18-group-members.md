# SPEC-18: Group Members list

**Status:** Ready
**Screen(s):** Group members
**Related docs:** `prd.md` §4.2, `domain-model.md` §GroupMember

---

## 1. Context

Roster of everyone in a Group, admin marked distinctly (matches original mock's "(admin) Varad07, AISSMS IOIT").

## 2. Out of Scope

- Adding members — that's either the Application-accept path (SPEC-10) or the direct-invite path (SPEC-19), not this spec.
- Removing/kicking a member — not in the original mock, not added for V1.

## 3. Scenarios

### 3.1 Happy Path

```gherkin
Given the caller is a member of the group
When GET /v1/groups/:id/members
Then all members are listed (admin first), each with username and college
```

### 3.2 Error Cases

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Not a member | caller not in the group | GET members | 403 `FORBIDDEN` |

### 3.3 Edge Cases

- None beyond the standard membership check.

## 4. Contract

### 4.1 Endpoint

```
GET /v1/groups/:id/members
```

### 4.2 Auth

- Requires auth: yes
- Extra check: caller must be a member of the group

### 4.3 Request

_(no body)_

### 4.4 Response (Success)

```json
{ "items": [ { "id": "...", "username": "...", "college": "...", "role": "admin" } ] }
```

### 4.5 Response (Errors)

| HTTP | Code | When |
|------|------|------|
| 403 | FORBIDDEN | caller not a member |

## 5. Acceptance Criteria

- [ ] Admin listed first, then members (any consistent secondary order, e.g. joinedAt)
- [ ] Non-member → 403
- [ ] Covers all scenarios in §3

## 6. Implementation Notes

- Trivial join query on `group_members` + `users`.
