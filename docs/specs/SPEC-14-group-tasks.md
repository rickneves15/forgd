# SPEC-14: Group Tasks

**Status:** Ready
**Screen(s):** Group tasks
**Related docs:** `prd.md` §4.2, `domain-model.md` §Task

---

## 1. Context

Task list for a Group — any member can add a task, optionally assign it to a member, and mark it done. Drives the Group's % complete.

## 2. Out of Scope

- Any notion of due dates/priority — not in the original mock, not added here (keep it minimal).

## 3. Scenarios

### 3.1 Happy Path

```gherkin
Given the caller is a member of the group
When POST /v1/groups/:id/tasks with text and an optional assigneeId
Then a Task is created with done=false
```

```gherkin
Given a Task belonging to a group the caller is a member of
When PUT /v1/tasks/:taskId with { done: true }
Then the task is marked done, and the group's percentComplete recalculates accordingly
```

### 3.2 Error Cases

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Not a member | caller not in the group | POST task | 403 `FORBIDDEN` |
| assigneeId not a member | assignee isn't in this group | POST task | 400 `INVALID_ASSIGNEE` |

### 3.3 Edge Cases

- No delete endpoint in V1 — tasks can be marked done/undone but not removed (matches the simplicity of the original mock, which only showed a flat list with no delete UI).

## 4. Contract

### 4.1 Endpoint

```
GET  /v1/groups/:id/tasks
POST /v1/groups/:id/tasks
PUT  /v1/tasks/:taskId
```

### 4.2 Auth

- Requires auth: yes
- Extra check: caller must be a member of the group (for all 3 endpoints; `:taskId`'s group is resolved server-side)

### 4.3 Request

```typescript
// POST /v1/groups/:id/tasks
{ text: string, assigneeId?: string }

// PUT /v1/tasks/:taskId
{ done: boolean }
```

### 4.4 Response (Success)

```json
// GET list
{ "items": [ { "id": "...", "text": "...", "assignee": { "id": "...", "username": "..." }, "done": false } ] }

// POST / PUT
{ "id": "...", "text": "...", "done": false }
```

### 4.5 Response (Errors)

| HTTP | Code | When |
|------|------|------|
| 403 | FORBIDDEN | caller not a group member |
| 400 | INVALID_ASSIGNEE | assigneeId isn't a member of this group |

## 5. Acceptance Criteria

- [ ] Any member can create a task, with or without an assignee
- [ ] Marking done/undone updates the group's percentComplete on the next fetch
- [ ] Non-member → 403
- [ ] Covers all scenarios in §3

## 6. Implementation Notes

- No real-time push for task updates (unlike Chat) — the client just refetches the list on screen focus, per the same "not everything needs WebSocket" reasoning as Notifications.
