# SPEC-13: List joined Groups + Group detail overview

**Status:** Ready
**Screen(s):** Group (list), Group detail (overview)
**Related docs:** `prd.md` §4.2, `domain-model.md` §Group, §Task

---

## 1. Context

Lists the Groups a user belongs to (as owner or accepted member), and the overview screen for one Group (% complete, last update, entry points to Tasks/Issues/Chat/Members).

## 2. Out of Scope

- Tasks (SPEC-14), Issues (SPEC-15), Chat (SPEC-17), Members (SPEC-18) — this spec is only the list + the overview shell.

## 3. Scenarios

### 3.1 Happy Path

```gherkin
Given a logged-in user belongs to 1+ Groups
When GET /groups
Then their Groups are returned, each with title, % complete, and a preview of the last update
```

```gherkin
Given the caller is a member of the group
When GET /groups/:id
Then the group's overview (title, % complete, task/issue counts, last update) is returned
```

### 3.2 Error Cases

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Not a member | caller isn't in this group | GET /groups/:id | 403 `FORBIDDEN` |
| Nonexistent group | bad id | GET /groups/:id | 404 `GROUP_NOT_FOUND` |

### 3.3 Edge Cases

- "Last update" is whichever of {task completed, issue raised, member joined} happened most recently — computed, not a separate stored feed (V1 doesn't need a full activity log, just the single most recent line shown in the original mock).

## 4. Contract

### 4.1 Endpoint

```
GET /groups
GET /groups/:id
```

### 4.2 Auth

- Requires auth: yes
- Extra check: `/groups/:id` requires the caller to be a member (any role) of that group

### 4.3 Request

_(no body)_

### 4.4 Response (Success)

```json
// GET /groups
{ "items": [ { "id": "...", "projectTitle": "...", "percentComplete": 56, "lastUpdate": "..." } ] }

// GET /groups/:id
{ "id": "...", "projectTitle": "...", "percentComplete": 56, "taskCount": 17, "issueCount": 8, "memberCount": 45, "lastUpdate": "..." }
```

### 4.5 Response (Errors)

| HTTP | Code | When |
|------|------|------|
| 403 | FORBIDDEN | caller not a member |
| 404 | GROUP_NOT_FOUND | id doesn't exist |

## 5. Acceptance Criteria

- [ ] List only returns groups the caller belongs to
- [ ] `percentComplete` = done tasks / total tasks (0 if no tasks yet, not a divide-by-zero error)
- [ ] Non-member requesting detail → 403
- [ ] Covers all scenarios in §3

## 6. Implementation Notes

- `percentComplete` computed at query time (simple aggregate query) — no need to denormalize/cache it at V1 scale.
