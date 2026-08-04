# SPEC-12: Notifications list + unread count

**Status:** Ready
**Screen(s):** Notifications
**Related docs:** `prd.md` §3, `domain-model.md` §Notification

---

## 1. Context

In-app notification center — fetch-on-open, no push (CONTEXT.md decision). Covers both "general" (someone joined your group, someone raised an issue on your project) and "application_status" (your application was accepted/rejected) types, kept as two tabs matching the original mock.

## 2. Out of Scope

- Native OS push (Expo Push Service) — explicit V2 non-goal
- The events that *generate* notifications live in their respective specs (SPEC-10 for application status, a future Issues spec for the "raised an issue" case) — this spec only covers reading them + marking read.

## 3. Scenarios

### 3.1 Happy Path

```gherkin
Given the caller has notifications
When GET /notifications?type=general (or type=application_status)
Then notifications of that type are returned, newest first, with a top-level unreadCount
```

```gherkin
Given the caller opens the Notifications screen
When PUT /notifications/read-all
Then all their notifications are marked read, unreadCount becomes 0
```

### 3.2 Error Cases

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Invalid type param | `type=foo` | GET /notifications | 400 `VALIDATION_ERROR` |

### 3.3 Edge Cases

- `unreadCount` in the response is always the count across BOTH types combined (for the tab-badge on the bottom nav icon), even when the request filters to one type's list.

## 4. Contract

### 4.1 Endpoint

```
GET /notifications
PUT /notifications/read-all
```

### 4.2 Auth

- Requires auth: yes
- Extra check: none (always the caller's own notifications)

### 4.3 Request

```typescript
// GET query param
{ type?: "general" | "application_status" }  // omit for both combined
```

### 4.4 Response (Success)

```json
{
  "items": [ { "id": "...", "type": "general", "message": "...", "targetProjectId": "...", "read": false, "createdAt": "..." } ],
  "unreadCount": 3
}
```

### 4.5 Response (Errors)

| HTTP | Code | When |
|------|------|------|
| 400 | VALIDATION_ERROR | invalid `type` value |

## 5. Acceptance Criteria

- [ ] List returns newest-first, filterable by type
- [ ] `unreadCount` always reflects both types combined
- [ ] `read-all` zeroes the count
- [ ] Covers all scenarios in §3

## 6. Implementation Notes

- Simple polling from the client (fetch on screen focus / pull-to-refresh) — no WebSocket here (CONTEXT.md: only Group Chat gets real-time in V1).
