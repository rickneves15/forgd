# APP-02: Email/password login

**Status:** Draft
**Pairs with:** `specs/api/SPEC-02-login.md`
**Screen(s):** Sign in
**Related docs:** `prd.md` §4.1, `redesign/01-auth-onboarding.md`

---

## 1. Context

Returning-Student entry point. Same visual family as Sign up, opposite direction of the "Create an account" link.

## 2. Out of Scope

- Signup (APP-01), Google OAuth (APP-03), session refresh/logout (APP-04)

## 3. Entry & Navigation

- **Entered from:** app launch when no valid session is found (after a silent refresh attempt fails — see APP-04); Sign Up screen's "Already have an account? Sign in" link
- **On success:** Projects feed (the app's default landing tab) — not onboarding, since only new signups go through Choose your interests
- **On cancel / back:** Sign Up screen
- **Route (Expo Router):** `/(auth)/sign-in`

## 4. Data

### 4.1 Reads (queries)

None.

### 4.2 Writes (mutations)

| Calls (SPEC-02 §4.1) | Invalidates | Optimistic? | Notes |
|---|---|---|---|
| `POST /auth/login` | — | No | On success: seed `['me']` cache with the returned `user`, persist tokens (see §8), navigate to the tab root. |

## 5. Screen States

| State | Trigger | UI |
|---|---|---|
| Loading | Mutation in flight | Fields + submit disabled, spinner on "Sign in" |
| Error | Mutation rejected | Generic banner — see §7 (API deliberately doesn't say *which* field was wrong) |
| Success | 200 response | No visible state — immediate navigation |

## 6. Client-side Validation

- Email/password both required for the submit button to enable — no format check beyond "non-empty," since the API's `INVALID_CREDENTIALS` is intentionally generic and client-side format-guessing wouldn't reduce round trips meaningfully here.

## 7. Error Mapping

| Code (SPEC-02 §4.5) | User-facing behavior |
|---|---|
| 401 `INVALID_CREDENTIALS` | Single generic banner: "Email or password is incorrect." Never hint which field, and never reveal a Google-only account exists — the API already collapses all three cases into one message on purpose (SPEC-02 §3.3). |

## 8. Local/Device State

- On success: `accessToken` + `refreshToken` → `expo-secure-store` (global rule, CONTEXT.md).

## 9. Acceptance Criteria

- [ ] Valid login → tokens stored, `['me']` seeded, lands on Projects feed
- [ ] Wrong password / unknown email / Google-only account → identical generic banner in all three cases
- [ ] Covers all states in §5
