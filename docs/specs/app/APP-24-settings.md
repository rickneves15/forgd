# APP-24: Settings (notification prefs, feedback, sign out, delete account)

**Status:** Draft
**Pairs with:** `specs/api/SPEC-24-settings.md`
**Screen(s):** Settings, Share feedback, Sign out confirm, Delete account confirm
**Related docs:** `prd.md` §3, `redesign/04-profile.md`

---

## 1. Context

Bundles several low-complexity screens, mirroring SPEC-24's own bundling. "Change my interests" reuses APP-05's screen; "Sign out" reuses APP-04's logout mutation; "Terms of service"/"Privacy policy" are static content, no endpoint at all.

## 2. Out of Scope

- Interests screen itself (APP-05, reused as-is)
- Logout mutation itself (APP-04, reused as-is) — this spec only covers the confirm screen around it

## 3. Entry & Navigation

- **Entered from:** "Settings" action row on Profile (APP-20)
- **On tapping "Notifications":** stays on Settings, expands/opens the two toggle switches inline (no separate screen needed for two booleans)
- **On tapping "Change my interests":** pushes APP-05's screen onto the Profile stack
- **On tapping "Share feedback":** Share feedback screen
- **On tapping "Terms of service" / "Privacy policy":** static in-app content or an external link — no API call either way
- **On tapping "Sign out":** Sign out confirm
- **On tapping "Delete account":** Delete account confirm
- **On back (from Settings):** Profile
- **Route (Expo Router):** `/(tabs)/profile/settings`, `/(tabs)/profile/settings/feedback`, `/(tabs)/profile/settings/delete-account`. Sign out confirm is a lightweight inline dialog, not its own route.

## 4. Data

### 4.1 Reads (queries)

None new — notification-pref toggle states read from the cached `['me']` object.

### 4.2 Writes (mutations)

| Calls (SPEC-24 §4.1) | Invalidates | Optimistic? | Notes |
|---|---|---|---|
| `PUT /users/me/notification-prefs` `{ generalEnabled, applicationEnabled }` | `['me']` | Yes — toggles should feel instant; roll back on failure | |
| `POST /feedback` `{ text }` | none | No | One-way submission, no reply expected (SPEC-24 §3.2) |
| `POST /users/me/delete` `{ reason? }` | `queryClient.clear()` (full cache clear, same as logout — APP-04 §4.2) | No | On success: clear tokens from `expo-secure-store` (same as logout) and navigate to Sign in, same as APP-04's logout success path |

Sign out itself reuses APP-04's `POST /auth/logout` mutation unchanged — not re-defined here.

## 5. Screen States

### Settings (list)
| State | Trigger | UI |
|---|---|---|
| Success | Normal render | Plain list rows with chevrons; notification toggles inline |
| Error (toggle) | Notification-pref save rejected | Toggle rolls back, brief inline error |

### Share feedback
| State | Trigger | UI |
|---|---|---|
| Loading | Submit in flight | Send button disabled + spinner |
| Error | 400 `VALIDATION_ERROR` | Inline error — see §7 |
| Success | 200 response | Brief confirmation (e.g. a toast), then back to Settings |

### Sign out confirm
| State | Trigger | UI |
|---|---|---|
| Loading | Logout in flight | Confirm button disabled + spinner |
| Success | Always treated as success per APP-04 §7's lenient handling | Navigates to Sign in |

### Delete account confirm
| State | Trigger | UI |
|---|---|---|
| Loading | Delete in flight | Confirm button disabled + spinner |
| Error | Delete rejected (network only — no documented validation error on this endpoint) | Inline error, stays on the confirm screen |
| Success | 200 response | Tokens cleared, navigates to Sign in |

## 6. Client-side Validation

- Feedback text: required, non-empty, submit disabled until present (mirrors SPEC-24 §3.4).
- Delete-account `reason`: optional per SPEC-24 §4.3, no validation needed — the confirm button is never blocked by this field.

## 7. Error Mapping

| Code (SPEC-24 §4.5) | User-facing behavior |
|---|---|
| 400 `VALIDATION_ERROR` (feedback only) | Inline error under the text area: "Please write something before sending." |

## 8. Local/Device State

- Feedback text input: local state, cleared on successful submit.
- Delete-account `reason` input: local state, not persisted.

## 9. Acceptance Criteria

- [ ] Notification toggles flip instantly, roll back cleanly on failure
- [ ] Feedback requires non-empty text, clears the field on success
- [ ] Sign out always ends on the Sign in screen, even on a network failure (matches APP-04's lenient logout handling)
- [ ] Delete account revokes the session and lands on Sign in, same as sign out
- [ ] Covers all states in §5
