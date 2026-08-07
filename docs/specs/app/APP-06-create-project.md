# APP-06: Create Project

**Status:** Draft
**Pairs with:** `specs/api/SPEC-06-create-project.md`
**Screen(s):** Add Project
**Related docs:** `prd.md` §4.2/§4.3, `flows/file-upload-flow.md`, `redesign/02-projects.md`

---

## 1. Context

Single form for both portfolio-only and open/recruiting projects — recruiting fields are visually grouped under an optional "Looking for collaborators?" section (redesign/02) rather than being a separate flow.

## 2. Out of Scope

- Editing an existing project (not modeled — SPEC-06 §2)
- Applying to a project (APP-09)
- The presigned-upload mechanics themselves (`SPEC-26`, `flows/file-upload-flow.md`) — this spec just covers the form around it

## 3. Entry & Navigation

- **Entered from:** "Add new project" action (Profile screen action row, per redesign/04)
- **On success:** Project detail (APP-08) for the newly created project
- **On cancel / back:** Profile, with a confirm-discard prompt if any field has content (avoid silently losing a filled-out form)
- **Route (Expo Router):** `/(tabs)/projects/add`

## 4. Data

### 4.1 Reads (queries)

None.

### 4.2 Writes (mutations)

| Calls | Invalidates | Optimistic? | Notes |
|---|---|---|---|
| `POST /uploads/presigned-url` (SPEC-26, per photo/pdf, `purpose: "project-photo"` or `"project-pdf"`) → direct `PUT` to R2 | — | No | One request pair per attached file, fired as each file is picked, not all at once at final submit — lets the user see individual upload progress/failure per attachment before committing to Create. |
| `POST /projects` (SPEC-06 §4.1) | `['projects', 'feed']` (only when the created project is open — a portfolio project never appears there so there's nothing to invalidate); `['profile', userId, 'projects']` always | No | Only fires once all attached files have resolved to `fileUrl`s. |

## 5. Screen States

| State | Trigger | UI |
|---|---|---|
| Loading (per-file) | An individual photo/pdf upload in flight | Small inline progress indicator on that attachment's thumbnail/row; other fields remain editable |
| Loading (submit) | `POST /projects` in flight | Submit button disabled + spinner; per-file uploads must all be settled by this point |
| Error | Submit rejected, or any individual file upload fails | See §7 |
| Success | 201 response | No visible state — navigates to the new Project detail |

## 6. Client-side Validation

- Title, description, category, topic: required (mirrors SPEC-06 §4.3), submit disabled until present.
- At least one photo or pdf attached: required (SPEC-06 §3.2) — submit stays disabled with zero attachments, mirrored client-side for instant feedback even though the API also enforces it.
- Recruiting section ("Looking for collaborators?"): entirely optional; if `openings` is filled it must be a non-negative integer (client-side guard mirroring SPEC-06 §3.2's "negative openings" rejection) — no need to also require stipend/duration/responsibilities together, they're each independently optional per SPEC-06 §4.3.
- File size/type guard before requesting a presigned URL at all (SPEC-26 §6 notes there's no server-side max-size enforcement in V1) — client checks against the `contentType` allow-list from SPEC-26 §4.3 (`image/jpeg`, `image/png`, `image/webp` for photos; `application/pdf` for pdfs) and a sane max size (e.g. 10MB) before ever calling the presigned-url endpoint.

## 7. Error Mapping

| Code | User-facing behavior |
|---|---|
| 400 `VALIDATION_ERROR` (SPEC-06 §4.5) | Should be rare given §6 mirrors the same rules — generic banner + keep the form filled if it does happen |
| Individual file upload failure (network drop mid-`PUT` to R2, or presigned URL expired — `flows/file-upload-flow.md`) | Inline retry affordance on that specific attachment's row, doesn't block editing the rest of the form; Create stays disabled while any attachment is in a failed/retry-needed state |

## 8. Local/Device State

- Form field values + attachment picker state: local component state, not persisted — no draft recovery (ship-fast, matches APP-01's precedent).

## 9. Acceptance Criteria

- [ ] Base fields + 1 photo, no recruiting fields → portfolio project created, lands on its detail
- [ ] Base fields + `openings > 0` → open project created, group implied server-side, lands on its detail
- [ ] Zero attachments → Create stays disabled
- [ ] A failed individual upload doesn't block editing/removing other fields, and blocks only the final submit until resolved
- [ ] Covers all states in §5
