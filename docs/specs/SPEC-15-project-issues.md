# SPEC-15: Issues on a Project

**Status:** Ready
**Screen(s):** Issues (list + add issue) — reachable from Project detail directly, and as a shortcut from Group detail
**Related docs:** `prd.md` §4.5, `domain-model.md` §Issue

---

## 1. Context

Any logged-in user can report an Issue on any Project (portfolio or open) — confirmed reading of the original mock (CONTEXT.md decision). Each Issue has its own Comment thread (SPEC-16).

## 2. Out of Scope

- Comments themselves (SPEC-16)
- Any triage/status workflow for issues (open/closed) — not in the original mock, not added (an issue is just a flat reported item + its discussion)

## 3. Scenarios

### 3.1 Happy Path

```gherkin
Given a project exists (any type)
When POST /projects/:id/issues with a short text
Then an Issue is created, and the project owner gets a "general" notification
```

```gherkin
When GET /projects/:id/issues
Then all issues for that project are listed, newest first, each with its comment count
```

### 3.2 Error Cases

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Empty text | blank/whitespace-only text | POST issue | 400 `VALIDATION_ERROR` |
| Nonexistent project | bad id | POST/GET issues | 404 `PROJECT_NOT_FOUND` |

### 3.3 Edge Cases

- The project owner can also raise an issue on their own project (self-notes / self-reported TODOs) — not blocked, no reason to.

## 4. Contract

### 4.1 Endpoint

```
GET  /projects/:id/issues
POST /projects/:id/issues
```

### 4.2 Auth

- Requires auth: yes
- Extra check: none — any logged-in user may read or create issues on any project

### 4.3 Request

```typescript
// POST
{ text: string }  // 1-500 chars
```

### 4.4 Response (Success)

```json
{ "items": [ { "id": "...", "text": "...", "author": { "id": "...", "username": "..." }, "commentCount": 2, "createdAt": "..." } ] }
```

### 4.5 Response (Errors)

| HTTP | Code | When |
|------|------|------|
| 400 | VALIDATION_ERROR | empty text |
| 404 | PROJECT_NOT_FOUND | bad project id |

## 5. Acceptance Criteria

- [ ] Any logged-in user (including the owner) can create an issue on any project
- [ ] Owner gets notified on new issue
- [ ] List shows comment count per issue
- [ ] Covers all scenarios in §3

## 6. Implementation Notes

- `commentCount` via simple aggregate join — fine at V1 scale.
