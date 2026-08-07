# SPEC-09: Apply to a project

**Status:** Ready
**Screen(s):** Apply for [project] (resume confirmation screen)
**Related docs:** `prd.md` §4.2, `domain-model.md` §Application

---

## 1. Context

A Student applies to an **open** Project, submitting their resume (already uploaded once to their profile — SPEC for resume upload is in the Profile batch).

## 2. Out of Scope

- Owner accepting/rejecting (SPEC-10)
- Uploading the resume itself (Profile batch)

## 3. Scenarios

### 3.1 Happy Path

```gherkin
Given an open project, a logged-in user who has a resume on file and hasn't already applied
When POST /projects/:id/applications
Then an Application is created with status "pending", and the project owner gets a notification
```

### 3.2 Error Cases

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Project is portfolio-only | `isOpen: false` | apply | 400 `PROJECT_NOT_OPEN` |
| Already applied | existing Application from this user for this project | apply | 409 `ALREADY_APPLIED` |
| No resume on file | user has never uploaded a resume | apply | 400 `NO_RESUME` |
| Applying to your own project | `project.ownerId === userId` | apply | 400 `CANNOT_APPLY_TO_OWN_PROJECT` |

### 3.3 Edge Cases

- Resume is snapshotted at apply-time (`resumeUrl` copied onto the Application row) — if the user updates their profile resume later, past applications still show what was submitted then.

## 4. Contract

### 4.1 Endpoint

```
POST /projects/:id/applications
```

### 4.2 Auth

- Requires auth: yes
- Extra check: caller must not be the project owner

### 4.3 Request

_(no body — resume is pulled from the user's profile automatically)_

### 4.4 Response (Success)

```json
{ "id": "...", "status": "pending", "appliedAt": "..." }
```

### 4.5 Response (Errors)

| HTTP | Code | When |
|------|------|------|
| 400 | PROJECT_NOT_OPEN | project has no openings |
| 400 | NO_RESUME | user has no resume uploaded |
| 400 | CANNOT_APPLY_TO_OWN_PROJECT | self-apply attempt |
| 409 | ALREADY_APPLIED | duplicate application |

## 5. Acceptance Criteria

- [ ] Valid apply → Application created, owner notified
- [ ] Duplicate apply → 409
- [ ] Portfolio project → 400
- [ ] No resume → 400 (client should prevent this by disabling the Apply button, but the API enforces it too)
- [ ] Covers all scenarios in §3

## 6. Implementation Notes

- Unique constraint on `(projectId, applicantId)` at the DB level — don't only rely on an app-level check for the duplicate-apply case.
