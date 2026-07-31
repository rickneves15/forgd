# SPEC-07: Browse / search / filter Projects feed

**Status:** Ready
**Screen(s):** Projects (feed), Filter
**Related docs:** `prd.md` §4.1/§5, `domain-model.md` §Project

---

## 1. Context

The main discovery feed — merged from the original mock's separate "Projects" and "Apply" tabs (CONTEXT.md). Shows open Projects by default; a Filter sheet narrows results.

## 2. Out of Scope

- Project detail (SPEC-08)
- Portfolio-only projects are NEVER returned here, by design — they only ever show on their owner's profile

## 3. Scenarios

### 3.1 Happy Path

```gherkin
Given open Projects exist in the database
When GET /v1/projects with no query params
Then the most recent open Projects are returned, paginated, newest first
```

```gherkin
Given a `q` search param
When GET /v1/projects?q=gesture
Then results are filtered to projects whose title or topic matches (case-insensitive, partial match)
```

### 3.2 Error Cases

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Invalid filter value | `stipendMax` is not a number | GET /v1/projects?stipendMax=abc | 400 `VALIDATION_ERROR` |

### 3.3 Edge Cases

- **Cut from the original mock:** the "number of applications received" range filter (0-50, 50-100, etc.) is dropped — low value, odd UX (filtering by how many people already applied), replaced by simple `sort=newest|mostApplied` if a sort is needed at all. See CONTEXT.md decision note.
- Empty result set → `200` with an empty `items` array, not a 404.

## 4. Contract

### 4.1 Endpoint

```
GET /v1/projects
```

### 4.2 Auth

- Requires auth: yes (still a logged-in-only app in V1, no public browsing)
- Extra check: none

### 4.3 Request

```typescript
// query params, all optional
{
  q?: string,             // search title/topic
  department?: string,    // e.g. "E&TC", "IT"
  topic?: string,
  college?: string,
  stipendMin?: number,
  stipendMax?: number,
  durationMonths?: number,
  page?: number,           // default 1
  pageSize?: number        // default 20
}
```

### 4.4 Response (Success)

```json
{
  "items": [
    { "id": "...", "title": "...", "postedAt": "...", "college": "...", "regardsCount": 0, "department": "...", "stipend": 3000, "durationMonths": 2 }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 143
}
```

### 4.5 Response (Errors)

| HTTP | Code | When |
|------|------|------|
| 400 | VALIDATION_ERROR | non-numeric stipend/page params |

## 5. Acceptance Criteria

- [ ] No params → recent open projects, paginated
- [ ] `q` filters by title/topic substring match
- [ ] `department`/`topic`/`college`/`stipendMin`/`stipendMax`/`durationMonths` all combine with AND logic
- [ ] Only `isOpen: true` projects ever appear here
- [ ] Covers all scenarios in §3

## 6. Implementation Notes

- Simple `WHERE` clauses via Drizzle, no need for a search engine (Elasticsearch/Meilisearch) at this scale — revisit only if project count gets large enough that `ILIKE` performance actually becomes a problem.
