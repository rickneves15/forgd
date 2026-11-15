# APP-03: Google OAuth login/signup

**Status:** Draft
**Pairs with:** `specs/api/SPEC-03-google-oauth.md`
**Screen(s):** Sign in, Sign up (same "Continue with Google" button on both)
**Related docs:** `prd.md` §4.1, `flows/auth-flows.md`, `redesign/01-auth-onboarding.md`, `adr/ADR-006-oauth-identities.md`, `adr/ADR-007-fastify-passport.md`

---

## 1. Context

One button, present on both Sign in and Sign up, that covers signup-or-login in a single tap. The whole OAuth dance is server-owned (ADR-007) — the app's job is just to open a browser session, catch the deep-link redirect, and exchange the one-time code it contains for real tokens.

## 2. Out of Scope

- Email/password signup (APP-01) and login (APP-02) — same screens, different button
- The actual Google authorization page content — that's Google's own UI, not ours to design

## 3. Entry & Navigation

- **Entered from:** "Continue with Google" button on either Sign in or Sign up
- **On success, `isNewUser: true`:** Choose your interests (APP-05)
- **On success, `isNewUser: false`:** Projects feed
- **On cancel / dismiss:** back to whichever screen (Sign in or Sign up) the button was tapped from — see §7 for why this path can't currently distinguish a real user-cancel from a server-side failure
- **Route (Expo Router):** no dedicated route — an in-app browser session (`expo-web-browser`'s `openAuthSessionAsync`) launched from `/(auth)/sign-in` or `/(auth)/sign-up`, catching the `forgd://auth-callback` deep link

## 4. Data

### 4.1 Reads (queries)

None.

### 4.2 Writes (mutations)

| Calls (SPEC-03 §4.1/§4.4) | Invalidates | Optimistic? | Notes |
|---|---|---|---|
| `POST /auth/oauth/exchange` (with the one-time code read from the deep link) | — | No | Only fires after the browser session resolves with the `forgd://auth-callback?code=...` URL. On success: seed `['me']` cache with `user`, persist tokens (§8), branch navigation on `isNewUser`. |

## 5. Screen States

| State | Trigger | UI |
|---|---|---|
| Loading | Browser session open, or the exchange mutation in flight after it closes | Button shows a spinner; the system browser overlay covers the screen while open |
| Error | `POST /auth/oauth/exchange` rejects (400 `INVALID_OR_EXPIRED_CODE`) | Banner — see §7 |
| Success | Exchange returns 200 | No visible state — immediate navigation branched on `isNewUser` |

## 6. Client-side Validation

None — no form on this screen.

## 7. Error Mapping

| Source | User-facing behavior |
|---|---|
| Browser session dismissed without hitting the deep link (`WebBrowser` result type `dismiss`/`cancel`) | No error shown — return to the originating screen silently. **Known limitation:** per SPEC-03 §4.5, a server-side callback failure (bad/expired Google state, `email_verified: false`, etc.) currently renders as an error page *inside* the browser session rather than redirecting to the deep link — so the app cannot tell a genuine backend failure apart from the user just backing out of the Google account picker. Both look identical: the browser closes, no deep link fires. Revisit if SPEC-03 adds the noted "redirect errors to the app via deep link" refinement. |
| `POST /auth/oauth/exchange` → 400 `INVALID_OR_EXPIRED_CODE` | Generic banner: "Couldn't complete sign-in with Google. Try again." This case IS distinguishable (a real JSON error response), unlike the callback-level failures above. |

## 8. Local/Device State

- On success: `accessToken` + `refreshToken` → `expo-secure-store` (global rule, CONTEXT.md).

## 9. Acceptance Criteria

- [ ] `isNewUser: true` → tokens stored, lands on Choose your interests
- [ ] `isNewUser: false` → tokens stored, lands on Projects feed
- [ ] Browser dismissed without a deep link → silently back to origin screen, no banner
- [ ] Expired/reused one-time code → banner, user can retry from scratch (re-tap the button, new browser session)
- [ ] Covers all states in §5
