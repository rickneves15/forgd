# SPEC-10: List / accept / reject applications for your own project

**Status:** Ready
**Screen(s):** Applications list (admin view — "Varad07 Add to group" style screen)
**Related docs:** `prd.md` §4.2, `domain-model.md` §Application, §Group

---

## 1. Context

Lets a project owner review applicants (view resume) and accept/reject. Accepting adds the applicant straight into the project's Group.

## 2. Out of Scope

- Applying itself (SPEC-09)
- The "invite member directly" flow (separate spec, Groups batch) — this is only for reviewing formal Applications

## 3. Scenarios

### 3.1 Happy Path — list

```gherkin
Given the caller owns the project
When GET /v1/projects/:id/applications
Then all Applications for that project are returned (pending/accepted/rejected), each with the applicant's resume link
```

### 3.2 Happy Path — accept

```gherkin
Given a pending Application on a project the caller owns
When POST /v1/applications/:applicationId/accept
Then status becomes "accepted", the applicant is added to the project's Group as a member, and they get a notification
```

### 3.3 Error Cases

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Not the owner | caller doesn't own the project | list/accept/reject | 403 `FORBIDDEN` |
| Already decided | application status isn't "pending" | accept/reject again | 409 `ALREADY_DECIDED` |
| Openings full | `openings` already met by accepted count | accept | 400 `NO_OPENINGS_LEFT` |

### 3.4 Edge Cases

- Rejecting doesn't notify with harsh language — just a neutral status-changed notification (see SPEC-12 for wording, kept generic).

## 4. Contract

### 4.1 Endpoint

```
GET  /v1/projects/:id/applications
POST /v1/applications/:applicationId/accept
POST /v1/applications/:applicationId/reject
```

### 4.2 Auth

- Requires auth: yes
- Extra check: caller must be the owner of the project the application belongs to

### 4.3 Request

_(no body for accept/reject — action is in the verb)_

### 4.4 Response (Success)

```json
// GET list
{ "items": [ { "id": "...", "status": "pending", "applicant": { "id": "...", "username": "...", "college": "..." }, "resumeUrl": "...", "appliedAt": "..." } ] }

// accept/reject
{ "id": "...", "status": "accepted" }
```

### 4.5 Response (Errors)

| HTTP | Code | When |
|------|------|------|
| 403 | FORBIDDEN | caller isn't the project owner |
| 400 | NO_OPENINGS_LEFT | accepting would exceed `openings` |
| 409 | ALREADY_DECIDED | application isn't pending anymore |

## 5. Acceptance Criteria

- [ ] Non-owner → 403 on all three endpoints
- [ ] Accept → status change + Group membership + notification, atomically
- [ ] Accept beyond `openings` → 400, blocked
- [ ] Reject → status change + notification, no Group change
- [ ] Covers all scenarios in §3

## 6. Implementation Notes

- Wrap accept in a transaction: update Application status + insert Group member row + insert Notification row, all-or-nothing.
