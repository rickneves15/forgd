# APP-04: Session refresh + logout

**Status:** Draft
**Pairs with:** `specs/api/SPEC-04-refresh-logout.md`
**Screen(s):** *(no dedicated screen — background app behavior + the "Sign out" row in Settings, APP-24)*
**Related docs:** `prd.md` §4.1, `flows/auth-flows.md`

---

## 1. Context

Two different concerns bundled in one spec, both implemented here: (1) silently keeping the session alive across app launches without the user noticing, (2) the explicit Sign out action.

## 2. Out of Scope

- Initial token issuance (APP-01/02/03)
- The visual Sign out confirmation screen itself — that's APP-24 §3, this spec only covers what the confirm button triggers

## 3. Entry & Navigation

- **Entered from (refresh):** not user-initiated — runs (a) on app cold start, before deciding whether to route to `/(auth)/sign-in` or the tab root, and (b) automatically after any API call returns 401
- **Entered from (logout):** "Sign out" confirm button in Settings (APP-24)
- **On success (refresh):** stay on whatever screen the user was on; the failed request that triggered the refresh (case b) is retried once with the new access token
- **On failure (refresh):** clear stored tokens, navigate to `/(auth)/sign-in`
- **On success (logout):** clear stored tokens, navigate to `/(auth)/sign-in`
- **Route (Expo Router):** none — this is a cross-cutting behavior, not a screen

## 4. Data

### 4.1 Reads (queries)

None.

### 4.2 Writes (mutations)

| Calls (SPEC-04 §4.1) | Invalidates | Optimistic? | Notes |
|---|---|---|---|
| `POST /auth/refresh` | none directly, but see Implementation Notes | No | Fired (a) once on cold start if a `refreshToken` is present in SecureStore, and (b) once, silently, as a retry wrapper around any request that comes back 401 — never more than once per failed request, to avoid an infinite retry loop if refresh itself is failing. |
| `POST /auth/logout` | **all** React Query cache (`queryClient.clear()`) | No | Nothing meaningful to keep cached once signed out — full clear is simpler and safer than picking individual keys to invalidate. |

## 5. Screen States

Not applicable — no dedicated screen. The only visible effect is which route the user lands on (see §3).

## 6. Client-side Validation

None.

## 7. Error Mapping

| Code (SPEC-04 §4.5) | User-facing behavior |
|---|---|
| 401 `INVALID_REFRESH_TOKEN` (from `/auth/refresh`) | No error banner — this is the expected "session actually expired" case. Clear tokens, route to Sign in. From the user's perspective this just looks like being logged out, not a broken app. |

`/auth/logout` failing (network error mid-request) is handled leniently: clear local tokens and navigate to Sign in regardless — a logout that fails to reach the server for revocation shouldn't trap the user in a signed-in-looking state on their own device. The now-orphaned refresh token on the server just expires naturally at its 30-day TTL.

## 8. Local/Device State

- Refresh success: new `accessToken` + `refreshToken` overwrite the old pair in `expo-secure-store` (rotation — the old refresh token is invalidated server-side per SPEC-04 §3.3, so the app must not keep using it).
- Refresh failure / logout: both tokens deleted from `expo-secure-store`.

## 9. Acceptance Criteria

- [ ] Cold start with a valid stored refresh token → silent refresh, user lands directly on the tab root, never sees Sign in
- [ ] Cold start with no stored tokens, or an invalid/expired refresh token → routes straight to Sign in, no flash of authenticated content first
- [ ] Any API call returning 401 → exactly one silent refresh + retry attempt, then either succeeds transparently or routes to Sign in
- [ ] Sign out → tokens cleared, full cache clear, lands on Sign in — even if the network request itself fails
- [ ] Covers all states in §5 (i.e., no visible loading/error UI leaks to the user during silent refresh)
