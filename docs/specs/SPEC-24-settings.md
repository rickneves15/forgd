# SPEC-24: Settings (notification prefs, feedback, sign out, delete account)

**Status:** Ready
**Screen(s):** Settings, Share feedback, Sign out confirm, Delete account confirm
**Related docs:** `prd.md` §3, `domain-model.md` §Feedback

---

## 1. Context

Bundles the small, low-complexity Settings actions into one spec since none of them warrant a full spec on their own. "Change my interests" reuses SPEC-05. "Sign out" reuses SPEC-04's logout endpoint. "Terms of service"/"Privacy policy" are static content (no endpoint — just app-bundled or a static URL).

## 2. Out of Scope

- Interests (SPEC-05), logout (SPEC-04) — reused, not redefined here.

## 3. Scenarios

### 3.1 Happy Path — notification prefs

```gherkin
Given a logged-in user
When PUT /users/me/notification-prefs with { generalEnabled, applicationEnabled }
Then future notifications of a disabled type are simply not created for that user (not created-then-hidden)
```

### 3.2 Happy Path — feedback

```gherkin
When POST /feedback with text
Then a Feedback row is stored, no reply is generated in-app
```

### 3.3 Happy Path — delete account

```gherkin
Given the caller provides a reason (per the original mock's "please share your valuable reason" screen)
When POST /users/me/delete with { reason }
Then the account is soft-deleted (see Implementation Notes) and all active sessions/refresh tokens are revoked
```

### 3.4 Error Cases

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Empty feedback text | blank text | POST feedback | 400 `VALIDATION_ERROR` |

## 4. Contract

### 4.1 Endpoint

```
PUT  /users/me/notification-prefs
POST /feedback
POST /users/me/delete
```

### 4.2 Auth

- Requires auth: yes (all three)

### 4.3 Request

```typescript
// PUT notification-prefs
{ generalEnabled: boolean, applicationEnabled: boolean }

// POST feedback
{ text: string }

// POST delete
{ reason?: string }  // optional per original mock's placeholder wording
```

### 4.4 Response (Success)

```json
{ "success": true }
```

### 4.5 Response (Errors)

| HTTP | Code | When |
|------|------|------|
| 400 | VALIDATION_ERROR | empty feedback text |

## 5. Acceptance Criteria

- [ ] Disabling a notification type stops new notifications of that type from being created (check at creation time, not display time)
- [ ] Feedback stored, reason optional on delete
- [ ] Delete revokes all refresh tokens for that user immediately
- [ ] Covers all scenarios in §3

## 6. Implementation Notes

- **Soft delete**, not a hard row delete: mark `deletedAt`, anonymize `email`/`username` display, but keep rows intact so Groups/Projects/Applications that reference this user don't break for other users still relying on that data (e.g. a Group member list shouldn't 500 because one member deleted their account). Hard-delete/GDPR-style purge is a V2 concern if it ever becomes legally necessary.
