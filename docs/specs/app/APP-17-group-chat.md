# APP-17: Group Chat (real-time)

**Status:** Draft
**Pairs with:** `specs/api/SPEC-17-group-chat.md`
**Screen(s):** Group chat
**Related docs:** `prd.md` §3, `flows/realtime-connection-flow.md`, `redesign/03-groups.md`

---

## 1. Context

Real WebSocket chat from day one — no polling throwaway version (CONTEXT.md's explicit "no throwaway version of real-time features" rule). Group Chat and Direct Messages (APP-25) share the exact same connection-handling pattern; see `flows/realtime-connection-flow.md` for the sequence both follow.

## 2. Out of Scope

- Direct Messages (APP-25) — separate socket, separate screen, same underlying pattern
- Read receipts, typing indicators — not in the original mock, not added

## 3. Entry & Navigation

- **Entered from:** "Group Chat" row on Group detail (APP-13)
- **On back:** Group detail — WS connection closes cleanly on unmount, doesn't linger in the background
- **Route (Expo Router):** `/(tabs)/groups/[id]/chat`

## 4. Data

### 4.1 Reads (queries)

| Calls | Query key | staleTime | Notes |
|---|---|---|---|
| `GET /groups/:id/chat/messages` (history, cursor-paginated) | `['groups', id, 'chat', 'history']` | infinite (cache-only after first load — new messages arrive via the socket, not by refetching this) | Used for (a) initial load before the socket connects, and (b) backfill after a reconnect, per `flows/realtime-connection-flow.md` §Reconnect/backfill — fetched with `after: <lastSeenMessageId>` in that case, not from the start. |

### 4.2 Writes (mutations)

Not a REST mutation — outgoing messages are WS frames, not `useMutation` calls:

| Calls | Effect | Notes |
|---|---|---|
| WS send `{ text }` on `WS /groups/:id/chat` (SPEC-17 §4.1) | Appends to the local message list optimistically (own message shown immediately, before the server echoes it back or any other member's client receives it) | Reconcile the optimistic local entry with the server-confirmed one when it arrives (match by a client-generated temp id, replace with the real server id) rather than showing a duplicate. |

## 5. Screen States

| State | Trigger | UI |
|---|---|---|
| Loading | Initial history fetch, before the socket has connected | Skeleton bubbles |
| Connected | WS handshake succeeded (per `flows/realtime-connection-flow.md`) | Normal chat UI, input enabled |
| Reconnecting | Socket dropped (app backgrounded, network blip) | Subtle "reconnecting…" status indicator (redesign/03 explicitly calls this out as worth designing in) — input stays enabled, queued sends retry once reconnected rather than being silently dropped |
| Error | Connection rejected outright (not a member) | Full-screen "You're not a member of this group" — shouldn't be reachable given entry is gated by APP-13, but the server enforces membership at the WS layer too (SPEC-17 §4.2) |
| Empty | Zero prior messages | Just an empty thread + enabled input, no special empty-state copy needed for a chat |

## 6. Client-side Validation

- Outgoing text: non-empty after trim before sending a frame at all — an all-whitespace send is dropped client-side rather than round-tripped to the server just to be silently ignored there too (SPEC-17's shared realtime pattern ignores blank frames server-side, per `flows/realtime-connection-flow.md`).

## 7. Error Mapping

| Source | User-facing behavior |
|---|---|
| WS connection rejected (not a member, close code 4403) | Full-screen not-a-member state, see §5 |
| `GET /groups/:id/chat/messages` → 404 `GROUP_NOT_FOUND` | Full-screen not-found + back — shouldn't be reachable given entry is gated by APP-13, defensive only |
| WS drops mid-session | "Reconnecting…" indicator, automatic reconnect attempt using the same auth+room-resolution handshake (`flows/realtime-connection-flow.md`) |
| Reconnect itself fails repeatedly | After a few attempts, switch the indicator to "Can't connect — check your connection" with a manual retry action, rather than retrying silently forever |

## 8. Local/Device State

- In-flight optimistic messages (sent but not yet server-confirmed): held in local component/query state only, not persisted — if the app is force-closed before confirmation, an unsent message is simply lost (acceptable for V1, matches the "no throwaway version" rule being about *building real-time*, not about guaranteeing offline delivery).

## 9. Acceptance Criteria

- [ ] Message sent by the caller appears instantly (optimistic), then reconciles with the server-confirmed version without duplicating
- [ ] Messages from other members arrive in real time while the screen is open
- [ ] Backgrounding and returning to the app reconnects and backfills any missed messages via history, not via replaying everything from scratch
- [ ] Non-member connection attempt shows the not-a-member state, not a silent hang
- [ ] Covers all states in §5
