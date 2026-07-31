# Forgd — Domain Model
## forgd/docs/domain-model.md

> Entities, relationships, and invariants. Business rules only — no implementation/tech details (those live in `specs/`).
> **Status: initial version complete** (covers everything through the V1 screen-by-screen redesign pass). Update as new features are designed.

---

## Core Entities (resolved so far)

### User
- Has: name, email, password (nullable if OAuth-only), `college` (free text, optional, unverified), interests (tags chosen at onboarding), avatar, resume (file, optional until first Apply).
- Can own zero or more **Projects**, submit **Applications**, belong to zero or more **Groups**, post **Issues**/**Comments**, give/receive **Regards**.

### Project
- Created via the single "Add Project" flow. Always has: category, topic, title, description, photos/pdfs.
- **Recruiting fields are optional**: stipend, duration, responsibilities, number of openings.
  - Not set (no openings) → **portfolio project**: visible on owner's profile only, not in the discovery feed.
  - Set (openings > 0) → **open project**: also appears in the Projects discovery feed; accepts Applications.
- Has many **Issues** (see below — open to any logged-in user, not just group members, since even portfolio-only projects can receive outside feedback).
- **`status`: "active" | "done"** (default "active"). Manually toggled by the owner from their profile — there's no automatic "project finished" detection in V1 (see SPEC-20). Drives the Profile screen's Active/Done project lists.

### Application ("Apply")
- Created when a User applies to an **open Project**, submitting their resume.
- Distinct from creating a Project — this is the "join someone else's project" action, not "post your own."
- Fields: `status` (pending | accepted | rejected), `resumeUrl` (snapshot at time of applying — R2 file), `appliedAt`.
- Outcome: owner/admin accepts/rejects. **Resolved:** acceptance adds the User to that Project's Group (which always exists — see below).

### Bookmark
- Simple join row: `userId` + `projectId` (unique pair). No extra fields — just "saved for later," per the original mock.

### Notification
- Fields: `type` (general | application_status), `message`, `targetProjectId` (nullable), `read` (bool), `createdAt`.
- Generated server-side on specific events (project accepted a member → notify them; someone raised an Issue on your project → notify you). No user-configurable rules in V1 beyond the on/off toggle in Settings.

### Group
- Collaboration space for an open Project's accepted team: Tasks, Issues (shortcut into the Project's Issues), Group Chat, Members list, % complete.
- **Resolved: Group creation is automatic, not optional.** Every open Project (openings > 0) gets a Group at creation time, owner included as first/admin member. The old "create group if project added to platform" checkbox is removed — there's no valid state where a project is recruiting but has nowhere for accepted members to land. Every accepted Application adds the user to that Project's Group.

### GroupMessage
- A single message in a Group's real-time chat (SPEC-17). Fields: `groupId`, `authorId`, `text`, `createdAt`. Distinct from **DirectMessage** below — scoped to every member of one Group, not a 1:1 thread. (Broken out as its own entity during DB schema design — SPEC-17 clearly requires persisting these, but earlier passes only implied it under Group's description rather than giving it its own block, the way DirectMessage already had.)

### Task
- Belongs to a Group. Fields: `text` (description), `assigneeId` (nullable, a Group member), `done` (bool).
- Group's "% complete" = `done` tasks / total tasks for that Group.
- Any Group member can create/complete tasks in V1 — no separate "only admin can assign" rule (keeps it simple; revisit if it causes real friction).

### GroupMember
- Join row: `groupId` + `userId` + `role` (`admin` | `member`) + `joinedAt`. The project owner is always the sole `admin` in V1 (no promoting other members to admin yet — not modeled).

### DirectMessage
- 1:1 conversation between two Users — distinct from Group Chat (SPEC-17), which is many-to-many within a Group. Same real-time treatment (WebSocket) applies, per the "no throwaway version" rule: a messaging feature is a messaging feature regardless of scope.
- Fields: `conversationId` (derived from the sorted pair of user ids, so there's always exactly one conversation per pair), `senderId`, `text`, `createdAt`.
- **Conversation** is tracked as its own entity (not just a derived id with no backing row) — `participant1Id`/`participant2Id` (sorted), `lastMessageAt` — so a future "list my DM threads" screen is a cheap query, even though no such screen is specced yet in V1.

### Feedback
- Simple one-way submission from Settings → "Share feedback": `userId`, `text`, `createdAt`. No reply/thread — read by Rick directly (e.g. via a DB query or a basic admin view), not surfaced back in-app.

### Issue → Comment (1:many)
- **Issue**: a reported topic/problem tied to a **Project** (not to a Group — see above, portfolio projects can have them too).
- **Comment**: a reply within an Issue's thread.
- **Any logged-in user can comment** — not restricted to Group members. Only creating/editing the Project itself is restricted to the owner/group.

### Regard
- Peer appreciation on a User's profile. Counter only (no list of who gave it, per the original mocks) — V1 keeps it that simple.

---

## Deferred Entities (V2, not modeled yet)
- Paper/Journal (profile academic uploads) — cut from V1 entirely.
- Apple/Facebook identity providers.
