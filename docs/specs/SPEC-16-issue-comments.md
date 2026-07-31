# SPEC-16: Comments on an Issue

**Status:** Ready
**Screen(s):** Issue thread ("comments" screen in the original mock)
**Related docs:** `prd.md` §4.5, `domain-model.md` §Issue

---

## 1. Context

The reply thread under a single Issue. Any logged-in user can comment (confirmed reading — CONTEXT.md).

## 2. Out of Scope

- Editing/deleting comments — not in the original mock, not added.
- Nested replies (reply-to-a-reply) — original mock only shows a flat list of comments under one issue.

## 3. Scenarios

### 3.1 Happy Path

```gherkin
Given an issue exists
When POST /v1/issues/:issueId/comments with text
Then a Comment is created, and the issue's author gets a notification (unless they're commenting on their own issue)
```

### 3.2 Error Cases

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Empty text | blank text | POST comment | 400 `VALIDATION_ERROR` |
| Nonexistent issue | bad id | POST/GET comments | 404 `ISSUE_NOT_FOUND` |

### 3.3 Edge Cases

- Commenting on your own issue doesn't self-notify.

## 4. Contract

### 4.1 Endpoint

```
GET  /v1/issues/:issueId/comments
POST /v1/issues/:issueId/comments
```

### 4.2 Auth

- Requires auth: yes
- Extra check: none — any logged-in user may read/comment

### 4.3 Request

```typescript
{ text: string }  // 1-500 chars
```

### 4.4 Response (Success)

```json
{ "items": [ { "id": "...", "text": "...", "author": { "id": "...", "username": "..." }, "createdAt": "..." } ] }
```

### 4.5 Response (Errors)

| HTTP | Code | When |
|------|------|------|
| 400 | VALIDATION_ERROR | empty text |
| 404 | ISSUE_NOT_FOUND | bad issue id |

## 5. Acceptance Criteria

- [ ] Any logged-in user can comment on any issue
- [ ] Issue author notified on new comment (except their own)
- [ ] Chronological order, oldest first (thread-reading order, not feed order)
- [ ] Covers all scenarios in §3

## 6. Implementation Notes

- Plain polling/fetch-on-open, no WebSocket (only Group Chat gets real-time — CONTEXT.md).
