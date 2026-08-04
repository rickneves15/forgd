# Redesign 03: Groups (list, detail, tasks, issues, chat, members, invite)

**Screens:** Group list, Group detail, Group tasks, Issues + Issue thread, Group chat, Group members, Invite member (new)
**Specs:** SPEC-13 through SPEC-19
**Original mocks:** "Group" tab, Group detail, Tasks, Issues, Chat, Members

---

## What changes from the original mocks

- Structurally very close to the original — this section held up well. Main changes:
  - **"Issues" inside Group detail is a shortcut into the Project's Issues**, not a Group-owned list (SPEC-15) — same data whether you get there from the Group or from the Project detail screen.
  - **New screen: Invite member to group** — username search + add, admin-only (SPEC-19). Lives one tap from the Group members screen (e.g. a "+" button in its header).
  - Chat: same look as the original mock, but now backed by a real WebSocket — no visual change, just note for whoever builds it that a connection-status indicator (subtle "reconnecting..." state) is worth designing in, since real-time UI should show its own health.

## Visual direction (continuing from Redesign 01/02)

- **Group detail:** the % complete could use a simple horizontal progress bar (small, top of the screen) instead of just a percentage number — a bit more "maker/hobby" tactile than a bare number, still minimal.
- **Chat:** bubble-style messages, sender's username as small label above/beside their bubble (this is a group chat with many people, not a 1:1 — usernames need to stay visible, unlike a typical 2-person chat UI).
- **Tasks:** checkbox-style row (tap to toggle done), assignee shown as a small avatar/initial chip on the right of each row.
- **Members:** admin row visually distinguished (small "admin" tag in the accent color), rest of the list plain.
- **Invite member (new screen):** a single search input + result row with an "Add" button — keep this screen deliberately tiny, it's a utility, not a destination.

---

## Prompt for opencode

```
Implement SPEC-13 through SPEC-19 from docs/specs/ in the Fastify API.

Context:
- Read docs/CONTEXT.md and docs/domain-model.md first.
- REST endpoints: GET /groups, GET /groups/:id, GET+POST /groups/:id/tasks, PUT /tasks/:taskId,
  GET+POST /projects/:id/issues, GET+POST /issues/:issueId/comments, GET /groups/:id/chat/messages,
  GET /groups/:id/members, POST /groups/:id/members (invite).
- WebSocket: WS /groups/:id/chat — use @fastify/websocket per SPEC-17. Keep the connected-clients map
  in-memory (Map<groupId, Set<connection>>), no Redis pub/sub for V1 (single API instance).
- Add Drizzle schema/migrations for: tasks, issues, comments, chat_messages (group_members already added in
  the previous batch if you're following these in order — check first).
- Auth middleware for group-scoped routes should have one reusable "is member of :groupId" check, and a
  separate "is admin of :groupId" check for invite (SPEC-19) — don't duplicate this logic per-route.
- SPEC-15/16: issues and comments are NOT group-scoped, they're project-scoped, and open to any logged-in
  user, not just group members — don't accidentally gate these behind group membership.
- Write tests from each spec's §3 Scenarios, including a WebSocket integration test for SPEC-17 (connect two
  clients, send from one, assert the other receives it).
- Ask me if anything is ambiguous rather than guessing.
```

## Prompt for Pencil

```
Design the following Forgd (Expo/React Native, dark theme, weld-orange accent, same style as prior screens)
screens:

1. Group list: list of joined groups, each row showing project title, a small horizontal progress bar
   (% complete), and a one-line preview of the last update.

2. Group detail: project title as header, the progress bar again (larger), then four entry rows/buttons:
   "Tasks (17)", "Issues (8)", "Group Chat", "Group Members". Below that, a "Last update" card showing the
   single most recent activity line.

3. Group tasks: list of task rows, each with a checkbox (tap to toggle done, done rows show strikethrough
   text and a dimmed look), task text, and a small avatar/initial chip on the right for the assignee (or
   empty state if unassigned). A "+" floating or header button to add a new task (simple text input).

4. Issues list: list of issue rows (short text + comment count + relative time), "+ Add issue" button.
   Tapping an issue opens the Issue thread screen: the original issue text pinned at top, then a chronological
   list of comment bubbles (username + text + timestamp), a text input pinned at the bottom to add a comment.

5. Group chat: standard chat bubble UI, but since this is a *group* chat (many members, not 1:1), show the
   sender's username as a small label above/beside each bubble (not just avatar). Include a subtle small
   "reconnecting..." status state design for when the realtime connection drops.

6. Group members: list of member rows (avatar/initial, username, college), the admin's row has a small
   "admin" tag in the accent color. A "+" button in the header goes to the new Invite screen.

7. Invite member (NEW screen, no original reference — keep it small/utility-feeling): a single search input
   ("Search by username"), and as the admin types, a result row appears with the found user's username +
   college and an "Add" button.

Keep all components/spacing consistent with the previously designed screens.
```
