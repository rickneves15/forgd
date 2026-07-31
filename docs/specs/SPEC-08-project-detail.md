# SPEC-08: Project detail

**Status:** Ready
**Screen(s):** Project detail
**Related docs:** `prd.md` §5, `domain-model.md` §Project

---

## 1. Context

Full detail view for a single project — photos/pdf, description, stipend/responsibilities (if open), owner/admin info, and the Apply entry point.

## 2. Out of Scope

- Applying itself (SPEC-09)
- Issues/comments on the project (separate spec, next batch)

## 3. Scenarios

### 3.1 Happy Path

```gherkin
Given a project (portfolio or open) exists and the requesting user is logged in
When GET /v1/projects/:id
Then full project details are returned, including whether the current user has already applied/bookmarked it
```

### 3.2 Error Cases

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Nonexistent project | bad/deleted id | GET /v1/projects/:id | 404 `PROJECT_NOT_FOUND` |

### 3.3 Edge Cases

- A portfolio-only project is fully viewable by anyone (not just the owner) — it's still a public-within-the-app showcase, it just doesn't show an Apply button (no openings) and doesn't appear in the feed.

## 4. Contract

### 4.1 Endpoint

```
GET /v1/projects/:id
```

### 4.2 Auth

- Requires auth: yes
- Extra check: none (any logged-in user can view any project)

### 4.3 Request

_(no body — `:id` path param only)_

### 4.4 Response (Success)

```json
{
  "id": "...", "title": "...", "description": "...", "category": "...", "topic": "...",
  "photoUrls": ["..."], "pdfUrls": ["..."],
  "isOpen": true, "stipend": 3000, "durationMonths": 2, "responsibilities": "...", "openings": 4,
  "applicationsCount": 182,
  "owner": { "id": "...", "username": "...", "college": "..." },
  "hasApplied": false, "isBookmarked": false
}
```

### 4.5 Response (Errors)

| HTTP | Code | When |
|------|------|------|
| 404 | PROJECT_NOT_FOUND | id doesn't exist |

## 5. Acceptance Criteria

- [ ] Portfolio project → no stipend/duration/openings/applicationsCount fields shown (null/omitted), no Apply button on the client
- [ ] Open project → all recruiting fields present
- [ ] `hasApplied`/`isBookmarked` correctly reflect the requesting user's own state
- [ ] Covers all scenarios in §3

## 6. Implementation Notes

- `applicationsCount` is a simple `COUNT(*)` on applications for this project — fine at V1 scale, no need for a denormalized counter column yet.
