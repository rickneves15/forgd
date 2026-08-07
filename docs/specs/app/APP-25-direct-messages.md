# APP-25: Direct message (1:1 chat)

**Status:** Draft
**Pairs with:** `specs/api/SPEC-25-direct-messages.md`
**Screen(s):** Message [username]
**Related docs:** `prd.md` §3/§7.8, `flows/realtime-connection-flow.md`, `redesign/04-profile.md`

---

## 1. Context

Same real-time treatment as Group Chat (APP-17), scoped to a 2-person conversation instead of a group — `flows/realtime-connection-flow.md` covers the shared connection pattern both follow. Visually near-identical to Group Chat but without per-message sender-name labels, since it's just two people (redesign/04).

## 2. Out of Scope

- Group Chat itself (APP-17) — separate socket path, separate screen, not merged
- A "my DM threads" inbox/list screen — not built in V1 (flagged as a gap when adding this feature area to `prd.md` §3); each conversation is only reachable by first visiting that person's profile

## 3. Entry & Navigation

- **Entered from:** "Message" action on another user's Profile (APP-20)
- **On back:** whichever screen led to that user's profile (typically back to the profile itself)
- **Route (Expo Router):** `/dm/[userId]` — top-level, outside the tab structure, matching the API's own `/dm/:userId` naming for clarity

## 4. Data

### 4.1 Reads (queries)

| Calls (SPEC-25 §4.1) | Query key | staleTime | Notes |
|---|---|---|---|
| `GET /dm/:userId/messages` (history, cursor-paginated) | `['dm', userId, 'history']` | infinite (cache-only after first load, same reasoning as APP-17 §4.1) | Same reconnect/backfill pattern as Group Chat, via `flows/realtime-connection-flow.md`. |

### 4.2 Writes (mutations)

Outgoing messages are WS frames, not `useMutation` calls — same pattern as APP-17 §4.2:

| Calls | Effect | Notes |
|---|---|---|
| WS send `{ text }` on `WS /dm/:userId` (SPEC-25 §4.1) | Appends to the local message list optimistically, reconciled against the server-confirmed echo by a client-generated temp id (identical approach to APP-17 §4.2) | |

## 5. Screen States

| State | Trigger | UI |
|---|---|---|
| Loading | Initial history fetch, before the socket connects | Skeleton bubbles |
| Connected | WS handshake succeeded | Normal chat UI, recipient's username in the header, input enabled |
| Reconnecting | Socket dropped | "Reconnecting…" indicator, same as APP-17 §5 |
| Error | WS connection rejected (messaging yourself) | Shouldn't be reachable — the "Message" entry point on APP-20 is never shown on the caller's own profile, so `:userId === callerId` can't be constructed from this UI |
| Error | `:userId` doesn't exist | Full-screen not-found + back |
| Empty | Zero prior messages | Empty thread + enabled input, no special copy needed |

## 6. Client-side Validation

- Outgoing text: non-empty after trim before sending, same as APP-17 §6.

## 7. Error Mapping

| Code (SPEC-25 §4.5) | User-facing behavior |
|---|---|
| WS close, `INVALID_TARGET` | Unreachable given §3/§5 — no dedicated UI |
| 404 `USER_NOT_FOUND` | Full-screen not-found + back |
| WS drops mid-session | "Reconnecting…" indicator, automatic reconnect via the shared handshake (`flows/realtime-connection-flow.md`) |

## 8. Local/Device State

- In-flight optimistic messages: local only, not persisted — same accepted trade-off as APP-17 §8.

## 9. Acceptance Criteria

- [ ] Message sent by the caller appears instantly (optimistic), reconciles with the server-confirmed version
- [ ] Same conversation resolved regardless of which of the two users opened it first (server-side guarantee, SPEC-25 §3.3 — nothing extra needed client-side)
- [ ] History persists and loads even if the recipient wasn't online when a message was sent
- [ ] Nonexistent target user → not-found state, not a silent hang
- [ ] Covers all states in §5
