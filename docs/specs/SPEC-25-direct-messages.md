# SPEC-25: Direct message (1:1 chat)

**Status:** Ready
**Screen(s):** message [username] ("Varad07 you message" style screen in the original mock)
**Related docs:** `prd.md` §3, `domain-model.md` §DirectMessage, CONTEXT.md ("no throwaway version" rule)

---

## 1. Context

Private 1:1 messaging between any two users — distinct from Group Chat (SPEC-17), which is scoped to a Group's members. Given the same "don't build a throwaway version of something that needs real-time" rule, this gets the same WebSocket treatment as Group Chat, just scoped to a 2-person conversation instead of a group.

## 2. Out of Scope

- Group Chat itself (SPEC-17) — separate feature, separate socket namespace/path, don't merge the two.
- Group conversations of more than 2 people outside a Group context — not modeled (if you're not in a shared Group, you can still DM 1:1, but there's no "create a custom chat room" feature).

## 3. Scenarios

### 3.1 Happy Path

```gherkin
Given two users, A and B
When A connects to WS /v1/dm/:userId (where :userId is B's id) and sends { text }
Then the message is persisted under their shared conversationId and delivered in real time to B if B is
currently connected to the same conversation
```

```gherkin
When GET /v1/dm/:userId/messages
Then message history for the caller's conversation with that user is returned, paginated, most recent first
```

### 3.2 Error Cases

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Messaging yourself | `:userId === callerId` | WS connect | connection rejected |
| Nonexistent user | bad id | WS connect / GET history | 404 `USER_NOT_FOUND` |

### 3.3 Edge Cases

- `conversationId` is deterministic: derive it by sorting the two user ids and hashing/concatenating them, so both users always land on the exact same conversation regardless of who initiated it first.

## 4. Contract

### 4.1 Endpoint / Event

```
WS  /v1/dm/:userId
GET /v1/dm/:userId/messages
```

### 4.2 Auth

- Requires auth: yes
- Extra check: `:userId` must not equal the caller's own id

### 4.3 Request

```typescript
// WS outgoing frame
{ text: string }

// GET query params
{ before?: string, limit?: number }
```

### 4.4 Response (Success)

```json
// WS incoming frame
{ "id": "...", "conversationId": "...", "sender": { "id": "...", "username": "..." }, "text": "...", "createdAt": "..." }

// GET history — same item shape, wrapped in { items: [...], hasMore: boolean }
```

### 4.5 Response (Errors)

| HTTP/Close code | Code | When |
|------|------|------|
| (WS close) | INVALID_TARGET | messaging yourself |
| 404 | USER_NOT_FOUND | bad target user id |

## 5. Acceptance Criteria

- [ ] Message from A reaches B in real time when both connected
- [ ] History persists and is retrievable even when the recipient wasn't online at send time
- [ ] Same conversation resolved regardless of which user initiates
- [ ] Covers all scenarios in §3

## 6. Implementation Notes

- Reuse the exact same `@fastify/websocket` pattern as SPEC-17 (Group Chat) — same connection-map approach, just keyed by `conversationId` instead of `groupId`. Consider sharing one underlying "realtime messaging" module between the two rather than duplicating the connection-handling code.
