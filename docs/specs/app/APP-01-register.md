# APP-01: Email/password signup

**Status:** Draft
**Pairs with:** `specs/api/SPEC-01-register.md`
**Screen(s):** Sign up
**Related docs:** `prd.md` §4.1, `redesign/01-auth-onboarding.md`

---

## 1. Context

Second entry point into the app for a new student — collects account info (plus optional college) and logs the user in immediately, no email verification gate. First screen of the signup → onboarding → browse flow (PRD §4.1).

## 2. Out of Scope

- Google sign-up (APP-03)
- Sign in (APP-02)
- Choose your interests — the screen navigated to on success (APP-05)
- Server-side validation rules — see SPEC-01 §3/§4.3

## 3. Entry & Navigation

- **Entered from:** Sign In screen's "Create an account" link (redesign/01-auth-onboarding.md); also the default landing screen for a signed-out user on first open.
- **On success:** Choose your interests (APP-05)
- **On cancel / back:** Sign In screen
- **Route (Expo Router):** `/(auth)/sign-up`

## 4. Data

### 4.1 Reads (queries)

None — this screen has no data to fetch.

### 4.2 Writes (mutations)

| Calls (SPEC-01 §4.1) | Invalidates | Optimistic? | Notes |
|---|---|---|---|
| `POST /auth/register` | — (nothing cached yet at this point in the flow) | No — must wait for the server-created user + tokens | On success: seed the `['me']` query cache with the returned `user` object via `queryClient.setQueryData` instead of invalidating, so the next screen doesn't do a redundant `GET /me` round trip. |

## 5. Screen States

| State | Trigger | UI |
|---|---|---|
| Loading | Mutation in flight | Form fields + submit button disabled, spinner on the "Sign up" button |
| Error | Mutation rejected | Inline field errors and/or a banner — see §7 |
| Success | 201 response | No visible success state — tokens persisted, immediate navigation to Choose your interests |

*(No "Empty" state — not applicable to a form screen.)*

## 6. Client-side Validation

<!-- Mirrors SPEC-01 §4.3 for instant feedback; the API remains the source of truth and re-validates everything. -->

- Username: 3–30 chars, required
- Email: required, basic format check
- Password: min 8 chars, required — live checklist/counter as the user types
- Confirm password: must match Password — **client-only field, not sent to the API** (SPEC-01 §4.3 has no `confirmPassword`)
- College: optional, no client-side rule beyond a max-length guard (120 chars, matching SPEC-01 §4.3)
- Submit button stays disabled until all required fields pass the above

## 7. Error Mapping

| Code (SPEC-01 §4.5) | User-facing behavior |
|---|---|
| 400 `VALIDATION_ERROR` | Should be rare in practice since §6 mirrors the same rules client-side first. If it still happens (e.g. a rule drifts out of sync), show the API's `message` as a generic banner above the form — the API's error body is `{code, message}` only (no field path, per auth-flows.md), so no field-level highlight is possible for this one. |
| 409 `EMAIL_TAKEN` | Inline error under the Email field: "This email is already registered." Include a link to Sign in. |
| 409 `USERNAME_TAKEN` | Inline error under the Username field: "This username is taken." |

## 8. Local/Device State

- On success: `accessToken` + `refreshToken` → `expo-secure-store` (global rule, see CONTEXT.md).
- Form field values: local component state only, not persisted — no draft-recovery if the app is closed mid-signup (ship-fast, not a V1 need).

## 9. Acceptance Criteria

- [ ] Valid form → submit button enabled; invalid/incomplete form → disabled
- [ ] Successful submit → tokens written to `expo-secure-store`, `['me']` cache seeded, navigates to Choose your interests
- [ ] `EMAIL_TAKEN` / `USERNAME_TAKEN` → correct field-level inline error, form stays filled (no data loss)
- [ ] Password and Confirm password mismatch is caught client-side before any request is sent
- [ ] Covers all states in §5
