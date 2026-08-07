# Realtime Connection Flow (WebSocket)

The shared WebSocket connection pattern used by Group Chat (SPEC-17) and Direct Messages (SPEC-25). Same `@fastify/websocket` connection-map approach in both — Group Chat keys by `groupId`, DMs key by `conversationId` (derived deterministically from the sorted pair of user ids). Documented once here; each spec's own §3/§4 covers what's specific to it (membership check vs. self-message check, `groupId` vs `conversationId`).

## Connect, send, broadcast

```mermaid
sequenceDiagram
    participant A as Expo app (sender)
    participant API as Forgd API
    participant DB as Postgres
    participant B as Expo app (other member(s))

    A->>API: WS connect (access token in query param / initial auth frame)
    API->>API: verify access JWT
    alt token invalid/expired
        API-->>A: reject upgrade
    else token ok
        API->>API: resolve room (groupId membership check, OR conversationId from sorted user ids + reject self-message)
        alt not allowed (not a member / messaging self)
            API-->>A: reject connection (close code, e.g. 4403)
        else allowed
            API->>API: add connection to in-memory map (roomId -> Set<connection>)
            A->>API: send frame { text }
            alt blank text
                API->>API: ignore frame, no persist, no broadcast
            else non-empty
                API->>DB: INSERT message (persisted before broadcasting)
                API->>B: broadcast frame to every other connection in the same room
            end
        end
    end
```

## Reconnect / backfill

```mermaid
sequenceDiagram
    participant A as Expo app
    participant API as Forgd API

    Note over A: socket dropped (e.g. app backgrounded)
    A->>API: WS reconnect (same auth + room resolution as above)
    A->>API: GET history?after=<lastSeenMessageId>
    API-->>A: 200 { items, hasMore }
    Note over A: client merges backfilled items with what's already rendered
```

## Notes

- Persistence always happens before broadcast (never fire-and-forget) — chat history must survive a reconnect or a server restart, per both SPEC-17 and SPEC-25's Implementation Notes.
- The connection map is in-memory, single Fastify process (fine at V1 scale — see SPEC-17 §6). No Redis pub/sub, no dedicated realtime service. If Forgd ever runs multiple API instances, this whole flow needs revisiting — flagged as the same kind of risk as the Vercel/WebSocket note in `CONTEXT.md`.
- The server does **not** replay missed messages automatically on reconnect — that's the client's job, via the `after`/`before` cursor on the REST history endpoint. Keep that logic client-side and simple (SPEC-17 §3.3).
