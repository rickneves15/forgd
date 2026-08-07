# APP-{ID}: {Title}

**Status:** Draft | Ready | Done
**Pairs with:** `specs/api/SPEC-{ID}-{slug}.md`
**Screen(s):** {which app screen(s) this covers — see prd.md §5 / redesign/}
**Related docs:** `prd.md` §{section}, `redesign/{NN}-{name}.md`

---

## 1. Context

<!-- Why this screen/flow exists, 1-3 sentences. Link back to the PRD flow it's part of. -->

## 2. Out of Scope

<!-- What this spec deliberately does NOT cover, even if related (link the spec that does, if it exists). -->

-

## 3. Entry & Navigation

- **Entered from:** {screen/action that navigates here}
- **On success:** {where it navigates to}
- **On cancel / back:** {where it navigates to}
- **Route (Expo Router):** {file-based route path}

## 4. Data

### 4.1 Reads (queries)

| Calls (SPEC-XX §4.1) | Query key | staleTime | Notes |
|---|---|---|---|
| | | | |

### 4.2 Writes (mutations)

| Calls (SPEC-XX §4.1) | Invalidates | Optimistic? | Notes |
|---|---|---|---|
| | | | |

## 5. Screen States

<!-- Every state the screen can be in and what the user sees. Don't pad — only states that actually apply. -->

| State | Trigger | UI |
|---|---|---|
| Loading | | |
| Empty | | |
| Error | | |
| Success | | |

## 6. Client-side Validation

<!-- Only checks that run BEFORE hitting the API (inline field validation, disabled-state rules). Don't repeat what SPEC-XX §4.3 already validates server-side — link to it instead. -->

-

## 7. Error Mapping

<!-- Every error code from SPEC-XX §4.5, mapped to what the user actually sees/what happens on screen. -->

| Code (SPEC-XX §4.5) | User-facing behavior |
|---|---|
| | |

## 8. Local/Device State

<!-- Anything persisted on-device beyond the global token rule in CONTEXT.md: form state, draft content, SecureStore/AsyncStorage keys. Most screens: "none." -->

-

## 9. Acceptance Criteria

- [ ]
- [ ] Covers all states in §5
