# SPEC-22: Resume upload

**Status:** Ready
**Screen(s):** Resume
**Related docs:** `prd.md` §3, `domain-model.md` §User, ADR (R2 storage decision in CONTEXT.md)

---

## 1. Context

Upload/replace the resume used automatically when applying to a project (SPEC-09).

## 2. Out of Scope

- The generic R2 presigned-upload endpoint is documented once, generically, in `SPEC-26` (also used by project photos/pdfs, avatar) — see `flows/file-upload-flow.md`. This spec just covers attaching the result to the user's profile.

## 3. Scenarios

### 3.1 Happy Path

```gherkin
Given the caller has already uploaded a file to R2 (via the shared presigned-upload flow) and has the resulting URL
When PUT /users/me/resume with { resumeUrl }
Then their profile's resume reference is replaced (old one is simply overwritten, not archived)
```

```gherkin
Given the caller has a resume on file
When DELETE /users/me/resume
Then the reference is cleared — the caller now has no resume, matching a fresh account's state
```

### 3.2 Error Cases

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Invalid URL / not an R2 URL from this bucket | malformed or foreign url | PUT resume | 400 `VALIDATION_ERROR` |
| Nothing to delete | caller has no resume on file | DELETE resume | 404 `NO_RESUME` |

### 3.3 Edge Cases

- Only one resume per user at a time in V1 (no version history) — matches the original mock ("Siddhesh resume.pdf" as a single row with a delete icon).

## 4. Contract

### 4.1 Endpoint

```
PUT /users/me/resume
DELETE /users/me/resume
```

### 4.2 Auth

- Requires auth: yes
- Extra check: none (always the caller's own resume)

### 4.3 Request

```typescript
// PUT /users/me/resume
{ resumeUrl: string }

// DELETE /users/me/resume
(no body)
```

### 4.4 Response (Success)

```json
// PUT /users/me/resume
{ "resumeUrl": "..." }

// DELETE /users/me/resume
{ "resumeUrl": null }
```

### 4.5 Response (Errors)

| HTTP | Code | When |
|------|------|------|
| 400 | VALIDATION_ERROR | malformed/foreign URL (PUT only) |
| 404 | NO_RESUME | nothing to delete (DELETE only) |

## 5. Acceptance Criteria

- [ ] Uploading a new resume replaces the old reference
- [ ] Deleting clears the reference; deleting with nothing on file → 404 `NO_RESUME`
- [ ] Past Applications keep their own snapshotted `resumeUrl` (SPEC-09) — unaffected by either a replace or a delete
- [ ] Covers all scenarios in §3

## 6. Implementation Notes

- Validate the URL's hostname/prefix matches your own R2 bucket domain — a minimal sanity check, not full ownership verification.
