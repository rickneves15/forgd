# SPEC-11: Bookmark / unbookmark a project

**Status:** Ready
**Screen(s):** Bookmark (list), bookmark toggle on Project detail
**Related docs:** `prd.md` §5, `domain-model.md` §Bookmark

---

## 1. Context

Lets a user save a project to revisit later, and view their saved list.

## 2. Out of Scope

- Nothing else — this is a deliberately tiny feature.

## 3. Scenarios

### 3.1 Happy Path

```gherkin
Given a project exists
When PUT /v1/projects/:id/bookmark
Then a Bookmark row is created for the caller (idempotent — calling it again while already bookmarked is a no-op, not an error)
```

```gherkin
Given the caller has bookmarks
When GET /v1/bookmarks
Then their bookmarked projects are listed, newest-bookmarked first
```

### 3.2 Error Cases

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Nonexistent project | bad id | PUT bookmark | 404 `PROJECT_NOT_FOUND` |

### 3.3 Edge Cases

- Unbookmarking a project that was never bookmarked → also a no-op success, not an error (`DELETE /v1/projects/:id/bookmark` is idempotent too).

## 4. Contract

### 4.1 Endpoint

```
PUT    /v1/projects/:id/bookmark
DELETE /v1/projects/:id/bookmark
GET    /v1/bookmarks
```

### 4.2 Auth

- Requires auth: yes
- Extra check: none

### 4.3 Request

_(no body)_

### 4.4 Response (Success)

```json
// PUT/DELETE
{ "bookmarked": true }   // or false after DELETE

// GET /v1/bookmarks
{ "items": [ { "id": "...", "title": "...", "postedAt": "...", "college": "..." } ] }
```

### 4.5 Response (Errors)

| HTTP | Code | When |
|------|------|------|
| 404 | PROJECT_NOT_FOUND | id doesn't exist (PUT only — DELETE on a nonexistent bookmark row is still a no-op 200) |

## 5. Acceptance Criteria

- [ ] Bookmark then bookmark again → still just one row, no error
- [ ] Unbookmark (never bookmarked) → 200, no error
- [ ] List returns newest-bookmarked-first
- [ ] Covers all scenarios in §3

## 6. Implementation Notes

- Unique constraint on `(userId, projectId)`; use `ON CONFLICT DO NOTHING` for the idempotent PUT.
