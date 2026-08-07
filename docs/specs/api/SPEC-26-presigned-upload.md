# SPEC-26: Presigned file upload (shared infra)

**Status:** Ready
**Screen(s):** *(no dedicated screen — shared backend infra used by Add Project, Edit Profile, Resume)*
**Related docs:** `flows/file-upload-flow.md`, `SPEC-06` (project photos/pdfs), `SPEC-21` (avatar), `SPEC-22` (resume), `CONTEXT.md` ("File storage: Cloudflare R2")

---

## 1. Context

Generic, purpose-agnostic endpoint that hands the client a short-lived presigned R2 upload URL. The client uploads the file bytes directly to R2 (never through the API), then references the resulting URL in the feature-specific endpoint (`POST /projects`, `PUT /users/me`, `PUT /users/me/resume`). Documented once here instead of duplicated per feature — flagged as a gap in SPEC-22 §2, since three specs referenced "already-uploaded R2 URL" without any spec ever defining how that upload happens.

## 2. Out of Scope

- Deleting/cleaning up orphaned uploads (a presigned URL is requested but the file is never referenced by any entity) — not handled in V1, acceptable storage waste at this scale.
- Multipart/chunked upload for large files — V1 files are small (resumes, project photos/pdfs, avatars), a single PUT is enough.

## 3. Scenarios

### 3.1 Happy Path

```gherkin
Given a logged-in user wants to upload a file for a given purpose (project-photo, project-pdf, avatar, resume)
When POST /uploads/presigned-url with { fileName, contentType, purpose }
Then the API returns a short-lived presigned PUT URL and the final fileUrl the client should reference afterward
```

```gherkin
Given a valid presigned URL
When the client PUTs the file bytes directly to that URL with the matching Content-Type
Then R2 stores the file at fileUrl, and the client proceeds to call the feature-specific endpoint with that fileUrl
```

### 3.2 Error Cases

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Disallowed content type for the purpose | e.g. `contentType: "video/mp4"` for `purpose: "avatar"` | POST /uploads/presigned-url | 400 `VALIDATION_ERROR` |
| Unknown purpose | `purpose` not one of the enum values | POST /uploads/presigned-url | 400 `VALIDATION_ERROR` |
| Client never uploads / uploads after expiry | client requests a URL then waits past the TTL | PUT to R2 | R2 rejects directly — not an API response, the API is out of this loop by then |

### 3.3 Edge Cases

- The presigned URL's TTL (5 minutes) is meant for "request URL, upload immediately" — not a general-purpose signed-URL service. A client that requests a URL and never uploads simply leaves an unused, never-referenced object key (see §2).
- `fileUrl` (the permanent reference) is deterministic from the presigned request — the client doesn't need a second round trip to learn it.

## 4. Contract

### 4.1 Endpoint

```
POST /uploads/presigned-url
```

### 4.2 Auth

- Requires auth: yes
- Extra check: none (any logged-in user can request an upload slot; abuse is bounded by normal rate limiting, not a per-purpose permission check)

### 4.3 Request

```typescript
{
  fileName: string,       // original file name, sanitized server-side before use in the object key
  contentType: string,    // must match the allow-list for `purpose`
  purpose: "project-photo" | "project-pdf" | "avatar" | "resume"
}
```

Allow-listed `contentType` per `purpose`:
- `project-photo`, `avatar` → `image/jpeg`, `image/png`, `image/webp`
- `project-pdf`, `resume` → `application/pdf`

### 4.4 Response (Success)

```json
{
  "uploadUrl": "https://<bucket>.r2.cloudflarestorage.com/...(signed, expires in 5 min)",
  "fileUrl": "https://<public-r2-domain>/<purpose>/<userId>/<uuid>-<sanitizedFileName>"
}
```

### 4.5 Response (Errors)

| HTTP | Code | When |
|------|------|------|
| 400 | VALIDATION_ERROR | disallowed `contentType` for the given `purpose`, unknown `purpose`, missing `fileName` |

## 5. Acceptance Criteria

- [ ] Valid request → `uploadUrl` (presigned, R2) + `fileUrl` (permanent reference) returned
- [ ] `contentType` outside the purpose's allow-list → 400 `VALIDATION_ERROR`, no URL generated
- [ ] `fileUrl` returned here is byte-for-byte what a client should later send as `photoUrls[]` / `avatarUrl` / `resumeUrl`
- [ ] Object key includes the caller's `userId` (namespacing — makes cleanup/audit possible later even though not built in V1)
- [ ] Covers all scenarios in §3

## 6. Implementation Notes

- Object key convention: `{purpose}/{userId}/{uuid.v7()}-{sanitizedFileName}` — sanitize `fileName` (strip path separators, limit length) before use.
- Presigned URL TTL: 5 minutes.
- No max-file-size enforcement at the API/presigned-URL level in V1 — rely on a sensible client-side check before requesting a URL at all. Revisit with an R2 bucket policy if abuse becomes real.
- See `flows/file-upload-flow.md` for the full three-hop sequence (App ↔ API ↔ R2).
