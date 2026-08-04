# SPEC-17: Group Chat (real-time)

**Status:** Ready
**Screen(s):** Group chat
**Related docs:** `prd.md` §3, `domain-model.md` §Group, ADR-001 (mobile+Fastify), CONTEXT.md ("Group Chat: real WebSocket from V1")

---

## 1. Context

Real-time chat scoped to a single Group. This is the one feature in V1 explicitly built with proper real-time infra from day one (not a polling stand-in) — see CONTEXT.md's "no throwaway version" rule.

## 2. Out of Scope

- Typing indicators, read receipts, reactions — not in the original mock, not added.
- Cross-group chat / DMs between users — not modeled (the original mock's "message Varad07" personal chat is a **separate, smaller** feature — see SPEC-20 in the Profile batch — don't conflate the two).

## 3. Scenarios

### 3.1 Happy Path

```gherkin
Given the caller is a member of the group
When they connect to WS /groups/:id/chat and send a message frame { text }
Then the message is persisted and broadcast to every other connected member of that same group in real time
```

```gherkin
Given a member opens the chat screen
When GET /groups/:id/chat/messages (paginated, most recent page first)
Then message history loads before the live connection is established
```

### 3.2 Error Cases

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Not a member | caller not in the group | WS connect | connection rejected (close code 4403) |
| Empty message | blank text frame | send | frame ignored, no broadcast, no persistence |

### 3.3 Edge Cases

- Reconnection: if the socket drops (e.g. app backgrounded), client reconnects and calls the history endpoint with `after: lastSeenMessageId` to backfill anything missed — the WS itself doesn't attempt message-replay-on-reconnect server-side, keep that logic client-side and simple.

## 4. Contract

### 4.1 Endpoint / Event

```
WS  /groups/:id/chat            (upgrade, auth via query param or initial auth frame)
GET /groups/:id/chat/messages
```

### 4.2 Auth

- Requires auth: yes (WS connection must carry the access token; reject upgrade if invalid/expired)
- Extra check: caller must be a member of the group

### 4.3 Request

```typescript
// WS outgoing frame (client -> server)
{ text: string }

// GET query params
{ before?: string /* message id, for pagination */, limit?: number /* default 50 */ }
```

### 4.4 Response (Success)

```json
// WS incoming frame (server -> all connected members)
{ "id": "...", "groupId": "...", "author": { "id": "...", "username": "..." }, "text": "...", "createdAt": "..." }

// GET history
{ "items": [ /* same shape as above */ ], "hasMore": true }
```

### 4.5 Response (Errors)

| HTTP/Close code | Code | When |
|------|------|------|
| 4403 (WS close) | FORBIDDEN | not a group member |
| 404 | GROUP_NOT_FOUND | bad group id (REST history endpoint) |

## 5. Acceptance Criteria

- [ ] Message sent by member A appears in real time for member B connected to the same group's socket
- [ ] Non-member cannot open the socket
- [ ] History endpoint paginates correctly, newest-first, `before` cursor works
- [ ] Messages persisted even if no one else is currently connected (asynchronous chat, not just live-only)
- [ ] Covers all scenarios in §3

## 6. Implementation Notes

- Use `@fastify/websocket` — one Fastify process holding an in-memory map of `groupId -> Set<connection>` is sufficient at V1 scale (single API instance on Railway). **Do not** reach for Redis pub/sub or a dedicated realtime service yet — that's premature for the expected V1 traffic, revisit only if/when running multiple API instances.
- Persist every message to Postgres synchronously before broadcasting (never broadcast-only / fire-and-forget) — chat history must survive a reconnect or a server restart.
