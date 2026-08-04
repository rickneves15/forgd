# SPEC-21: Edit profile

**Status:** Ready
**Screen(s):** Edit profile
**Related docs:** `prd.md` §3, `domain-model.md` §User

---

## 1. Context

Edit username, college, and avatar. Also covers the "mark project active/done" toggle mentioned in SPEC-20, since it lives on the same screen/area conceptually (profile self-management).

## 2. Out of Scope

- Email/password change — not in the original mock, not added for V1 (a real gap for later, but out of scope now).
- Resume (SPEC-22), interests (SPEC-05, already built).

## 3. Scenarios

### 3.1 Happy Path

```gherkin
Given the caller is editing their own profile
When PUT /users/me with username, college, and/or avatarUrl
Then the profile is updated and returned
```

```gherkin
Given the caller owns a project
When PUT /projects/:id with { status: "done" }
Then the project's status flips and it moves between the Active/Done lists on their profile
```

### 3.2 Error Cases

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Username taken | new username collides with another user | PUT /users/me | 409 `USERNAME_TAKEN` |
| Not the owner | caller doesn't own the project | PUT /projects/:id | 403 `FORBIDDEN` |

### 3.3 Edge Cases

- `avatarUrl` is an already-uploaded R2 URL (same pattern as project photos — upload first, then reference).

## 4. Contract

### 4.1 Endpoint

```
PUT /users/me
PUT /projects/:id       (status field only, for this spec's purposes)
```

### 4.2 Auth

- Requires auth: yes
- Extra check: `/projects/:id` requires caller to be the project owner

### 4.3 Request

```typescript
// PUT /users/me
{ username?: string, college?: string, avatarUrl?: string }

// PUT /projects/:id
{ status?: "active" | "done" }
```

### 4.4 Response (Success)

```json
{ "id": "...", "username": "...", "college": "...", "avatarUrl": "..." }
```

### 4.5 Response (Errors)

| HTTP | Code | When |
|------|------|------|
| 409 | USERNAME_TAKEN | new username collides |
| 403 | FORBIDDEN | not the project owner |

## 5. Acceptance Criteria

- [ ] Partial updates work (only send the field you're changing)
- [ ] Username collision → 409, nothing changed
- [ ] Non-owner toggling project status → 403
- [ ] Covers all scenarios in §3

## 6. Implementation Notes

- Reuse the same `PUT /projects/:id` endpoint for future project-editing needs beyond just `status` — don't build a status-only endpoint that would need replacing later.
