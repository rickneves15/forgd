# SPEC-19: Invite member directly to Group

**Status:** Ready
**Screen(s):** Invite member to group (new V1 screen — no equivalent in the original mock)
**Related docs:** `prd.md` §4.4, `domain-model.md` §GroupMember

---

## 1. Context

Lets a group admin add someone by username directly, bypassing the formal Apply-with-resume flow (SPEC-09). New feature, not a mock leftover — decided during the CONTEXT.md grilling session as the correct fix for the confusing old "Contact people for project" button.

## 2. Out of Scope

- The formal Application flow (SPEC-09/10) — this is a deliberately separate, simpler path.

## 3. Scenarios

### 3.1 Happy Path

```gherkin
Given any logged-in caller, and an exact username that exists
When GET /users?username=<value>
Then that user's public lookup info (id, username, college) is returned
```

```gherkin
Given the caller is the admin of the group, and a target username exists and isn't already a member
When POST /groups/:id/members with { username }
Then that user is added to the group as a "member", and they get a "general" notification that they were added
```

### 3.2 Error Cases

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Lookup, no such username | no matching user | GET /users?username= | 404 `USER_NOT_FOUND` |
| Not the admin | caller isn't this group's admin | invite | 403 `FORBIDDEN` |
| Username doesn't exist | no such user | invite | 404 `USER_NOT_FOUND` |
| Already a member | target already in this group | invite | 409 `ALREADY_MEMBER` |

### 3.3 Edge Cases

- No consent step from the invitee in V1 — they're added immediately (matches the "admin invites someone they already know" use case; if this turns out to feel invasive in practice, an accept/decline step is a cheap V2 addition, not a re-architecture).

## 4. Contract

### 4.1 Endpoint

```
GET /users?username=<exact value>
POST /groups/:id/members
```

### 4.2 Auth

- Requires auth: yes (both endpoints)
- Extra check: `POST /groups/:id/members` requires caller to be this group's `admin`; the `GET` lookup has no extra check beyond being logged in (finding a username is not itself sensitive)

### 4.3 Request

```typescript
// GET /users?username=<value> — query param, exact match, case-insensitive

// POST /groups/:id/members
{ username: string }
```

### 4.4 Response (Success)

```json
// GET /users?username=
{ "id": "...", "username": "...", "college": "..." }

// POST /groups/:id/members
{ "id": "...", "username": "...", "role": "member" }
```

### 4.5 Response (Errors)

| HTTP | Code | When |
|------|------|------|
| 404 | USER_NOT_FOUND | no matching username (either endpoint) |
| 403 | FORBIDDEN | caller not the admin (POST only) |
| 409 | ALREADY_MEMBER | already in this group (POST only) |

## 5. Acceptance Criteria

- [ ] Lookup finds an exact-match username, case-insensitive; no match → 404
- [ ] Admin can add an existing, not-yet-member user by username
- [ ] Added user is notified
- [ ] Non-admin caller → 403
- [ ] Covers all scenarios in §3

## 6. Implementation Notes

- Debounced search-as-you-type against the `GET` lookup is a client-side concern (APP-19) — the endpoint itself only ever does one exact-match query, no fuzzy/partial matching in V1.
