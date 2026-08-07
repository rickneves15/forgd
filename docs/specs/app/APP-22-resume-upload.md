# APP-22: Resume upload

**Status:** Draft
**Pairs with:** `specs/api/SPEC-22-resume-upload.md`
**Screen(s):** Resume
**Related docs:** `prd.md` §3, `flows/file-upload-flow.md`, `redesign/04-profile.md`

---

## 1. Context

Single-file resume, no version history — a new upload simply overwrites the reference (SPEC-22 §3.3). Used automatically when applying to a project (APP-09).

## 2. Out of Scope

- The presigned-upload mechanics (`SPEC-26`, `flows/file-upload-flow.md`) — this spec covers attaching the result
- Any resume version history — doesn't exist (SPEC-22 §3.3)

## 3. Entry & Navigation

- **Entered from:** "Upload resume" action row on Profile (APP-20); also the banner link shown by APP-09 when applying without one on file
- **On success:** stays on this screen, now showing the new filename
- **On back:** Profile
- **Route (Expo Router):** `/(tabs)/profile/resume`

## 4. Data

### 4.1 Reads (queries)

None new — current resume filename/URL read from the cached `['me']` object.

### 4.2 Writes (mutations)

| Calls | Invalidates | Optimistic? | Notes |
|---|---|---|---|
| `POST /uploads/presigned-url` (`purpose: "resume"`, SPEC-26) → direct `PUT` to R2 | — | No | Same pattern as APP-06/APP-21's uploads. |
| `PUT /users/me/resume` `{ resumeUrl }` (SPEC-22 §4.1) | `['me']` | No | Fires once the R2 upload resolves to a `fileUrl`. |
| `DELETE /users/me/resume` (SPEC-22 §4.1) | `['me']` | No — removing the resume also disables Applying elsewhere in the app (APP-09), worth confirming server-side first | Triggered by the delete icon next to the filename — the discrepancy flagged in an earlier pass is resolved now that SPEC-22 has a real delete endpoint. |

## 5. Screen States

| State | Trigger | UI |
|---|---|---|
| Empty | No resume on file yet | "No resume uploaded" + "Upload" button |
| Loading | File upload, the `PUT`, or the `DELETE` in flight | Progress indicator, "Upload new one"/delete icon disabled meanwhile |
| Error | Upload, save, or delete rejected | Banner — see §7 |
| Success | Filename row shown | Filename + "Upload new one" button + delete icon |

## 6. Client-side Validation

- Content-type/size guard before requesting a presigned URL, same as APP-06 §6, using SPEC-26's `resume` purpose allow-list (`application/pdf` only).

## 7. Error Mapping

| Code (SPEC-22 §4.5) | User-facing behavior |
|---|---|
| 400 `VALIDATION_ERROR` (malformed/foreign URL, PUT only) | Shouldn't be reachable — the `fileUrl` this screen sends always comes straight from SPEC-26's own response, never hand-typed. Generic banner fallback only. |
| 404 `NO_RESUME` (DELETE only) | Shouldn't be reachable — the delete icon only renders in the Success state (§5), never in Empty. Generic banner fallback only. |

## 8. Local/Device State

None.

## 9. Acceptance Criteria

- [ ] No resume on file → empty state with upload prompt
- [ ] Uploading replaces the reference, shown immediately after
- [ ] Deleting clears the reference, returns to the empty state
- [ ] Past applications' snapshotted resumes are unaffected (server-side guarantee, SPEC-22 §5 — nothing for the client to do here beyond not assuming otherwise)
- [ ] Covers all states in §5
