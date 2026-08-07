# SPEC-20: View profile (own or another user's)

**Status:** Ready
**Screen(s):** Profile
**Related docs:** `prd.md` §3, `domain-model.md` §User

---

## 1. Context

Shows a user's public profile: counts (done/active projects, regards), and the actual project lists.

## 2. Out of Scope

- Editing (SPEC-21), Resume (SPEC-22), Regards giving (SPEC-23) — this spec is read-only viewing.

## 3. Scenarios

### 3.1 Happy Path

```gherkin
Given any user id (self or another)
When GET /users/:id/profile
Then username, college, doneProjectsCount, activeProjectsCount, regardsCount, and both project lists are
returned
```

### 3.2 Error Cases

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Nonexistent user | bad id | GET profile | 404 `USER_NOT_FOUND` |

### 3.3 Edge Cases

- **"Active" vs "Done" project** = a project the user is/was a Group member of (owner or accepted applicant) — "done" needs an explicit signal, since nothing in the domain model currently marks a project as finished. See Implementation Notes.
- A **portfolio-only project owned by this user** also counts toward "done"/"active" the same way — it's still "their project," recruiting status doesn't matter for this count.

## 4. Contract

### 4.1 Endpoint

```
GET /users/:id/profile
```

### 4.2 Auth

- Requires auth: yes
- Extra check: none (any logged-in user can view any profile)

### 4.3 Request

_(no body)_

### 4.4 Response (Success)

```json
{
  "id": "...", "username": "...", "college": "...",
  "doneProjectsCount": 36, "activeProjectsCount": 4, "regardsCount": 573,
  "isSelf": false, "hasRegarded": false
}
```
_(project lists themselves are separate paginated endpoints — see Implementation Notes. `hasRegarded` mirrors the `hasApplied`/`isBookmarked` pattern from SPEC-08 — always `false` when `isSelf: true`, since self-regard is impossible.)_

### 4.5 Response (Errors)

| HTTP | Code | When |
|------|------|------|
| 404 | USER_NOT_FOUND | bad id |

## 5. Acceptance Criteria

- [ ] Counts and `isSelf` correct for both self-view and other-view
- [ ] `hasRegarded` correctly reflects whether the caller has already regarded this profile; always `false` on self-view
- [ ] Covers all scenarios in §3

## 6. Implementation Notes

- **New field needed on Project (or GroupMember): `status: "active" | "done"`.** The original mocks show this distinction (e.g. "Project Done: 36") but nothing earlier in this session defined what marks a project "done" — simplest V1 rule: the project owner can manually mark their own project "done" from their profile (a tiny toggle), defaulting to "active" otherwise. Add this as a small explicit action, not an automatic/inferred status.
- `GET /users/:id/profile/projects?status=active|done` — separate paginated endpoint for the actual lists, reusing the project-card shape from SPEC-07.
