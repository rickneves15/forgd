# APP-21: Edit profile + mark project done

**Status:** Draft
**Pairs with:** `specs/api/SPEC-21-edit-profile.md`
**Screen(s):** Edit profile; also a small owner-only toggle on Project detail (APP-08)
**Related docs:** `prd.md` §3, `flows/file-upload-flow.md`, `redesign/04-profile.md`

---

## 1. Context

Two unrelated endpoints share one backend spec (SPEC-21) but live on two different screens: editing username/college/avatar is its own screen, while "mark as done" is a small switch on the project owner's own Project detail view (redesign/04 explicitly calls out that this was never drawn as its own page in the original mock).

## 2. Out of Scope

- Email/password change — not built (SPEC-21 §2)
- Resume (APP-22), interests (APP-05, reused as-is)

## 3. Entry & Navigation

### 3a. Edit profile screen
- **Entered from:** an edit entry point on the Profile screen (APP-20, own profile only)
- **On success:** back to Profile, now showing updated info
- **On cancel / back:** Profile, no side effect
- **Route (Expo Router):** `/(tabs)/profile/edit`

### 3b. Mark-as-done toggle (on Project detail, owner-only)
- **Entered from:** not a separate navigation — a switch rendered inline on Project detail (APP-08) only when `project.owner.id === currentUser.id`
- **On toggle:** no navigation, the switch just reflects the new state once confirmed

## 4. Data

### 4.1 Reads (queries)

None new — Edit profile pre-fills from the already-cached `['me']` object.

### 4.2 Writes (mutations)

| Calls (SPEC-21 §4.1) | Invalidates | Optimistic? | Notes |
|---|---|---|---|
| `PUT /users/me` `{ username?, college?, avatarUrl? }` | `['me']`, `['profile', currentUserId]` | No — username collisions are a real possible failure (§7), worth a real round trip before showing success | Avatar upload itself follows `flows/file-upload-flow.md` / `SPEC-26` (`purpose: "avatar"`) before this call fires, same pattern as APP-06's photo attachments. |
| `PUT /projects/:id` `{ status }` | `['projects', id]`, `['profile', currentUserId, 'projects', 'active']`, `['profile', currentUserId, 'projects', 'done']` | Yes — it's the owner's own project, a simple binary switch, low failure risk; roll back the switch position on failure | Lives on Project detail (APP-08), not this screen — listed here because it's this spec's second endpoint. |

## 5. Screen States

### Edit profile

| State | Trigger | UI |
|---|---|---|
| Loading | Avatar upload in flight, or `PUT /users/me` in flight | Save button disabled + spinner; avatar shows an inline upload progress indicator |
| Error | Save rejected | Banner — see §7 |
| Success | 200 response | No visible state — navigates back to Profile |

### Mark-as-done toggle

| State | Trigger | UI |
|---|---|---|
| Success | Toggle flipped, optimistic | Switch reflects new position instantly |
| Error | Mutation rejected | Switch rolls back, brief inline error near the toggle |

## 6. Client-side Validation

- Username: 3-30 chars if changed (mirrors SPEC-01/SPEC-21's implicit shared username rules) — only validated if the field was actually touched, since all fields here are optional partial updates (SPEC-21 §4.3).
- Avatar: same content-type/size guard as APP-06 §6, reusing SPEC-26's `avatar` purpose allow-list (`image/jpeg`, `image/png`, `image/webp`).

## 7. Error Mapping

| Code (SPEC-21 §4.5) | User-facing behavior |
|---|---|
| 409 `USERNAME_TAKEN` | Inline error under the username field: "This username is taken." Form stays filled, other fields' edits aren't lost. |
| 403 `FORBIDDEN` (on the status toggle) | Shouldn't be reachable (toggle only renders for the project's own owner, §3b) — silently revert the switch if it somehow occurs, no need for a dedicated banner for an unreachable case |

## 8. Local/Device State

None beyond the standard form-field local state (not persisted, no draft recovery — consistent with APP-01/APP-06's precedent).

## 9. Acceptance Criteria

- [ ] Partial update (e.g. only college) doesn't clobber username/avatar
- [ ] Username collision → inline field error, nothing else lost
- [ ] Avatar upload follows the shared presigned-upload flow before the profile update fires
- [ ] Mark-as-done toggle only visible to the project's owner, flips optimistically, rolls back cleanly on failure
- [ ] Covers all states in §5
