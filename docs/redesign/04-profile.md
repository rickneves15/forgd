# Redesign 04: Profile (view, edit, resume, regards, settings, direct messages)

**Screens:** Profile, Edit profile, Resume, Settings, Share feedback, Sign out confirm, Delete account confirm, Direct message (1:1)
**Specs:** SPEC-20 through SPEC-25
**Original mocks:** Profile, Edit profile, Resume, Settings, Feedback, Sign out, Delete account, "message [username]"

---

## What changes from the original mocks

- **Drop "Own papers and journal" entry point entirely** (V2 non-goal, CONTEXT.md).
- **Drop "Contact people for project" entry point** (merged into Add Project, Redesign 02).
- **New, small addition: an Active/Done toggle on your own project cards** (or a switch inside project settings) — the original mock shows Active/Done counts but never actually defines what marks a project "done"; SPEC-20 resolves this with a manual toggle, so the profile-editing screen (or the project detail's owner-only actions) needs a simple "Mark as done" control that wasn't explicitly drawn in the original mock.
- **Direct message screen** stays structurally the same as the original mock ("Varad07 ... Type your message...") — just confirm for whoever builds it that this is a *different* backend feature from Group Chat (SPEC-25 vs SPEC-17), even though the UI looks nearly identical.

## Visual direction (continuing from Redesign 01-03)

- **Profile header:** avatar, username, college as secondary text, then the 3-stat row (Done / Active / Regards) exactly as in the original mock — this row read well, keep it.
- **Regards button:** a single tap target with a small animation/pulse on tap (cheap to add, reinforces the "give appreciation" feeling — a maker/hobby touch, not corporate).
- **Settings list:** plain list rows, no need to reinvent this — the original mock's simple list-with-chevron pattern is already exactly right for a low-frequency screen like this.
- **Delete account:** keep the destructive action visually distinct (red/warning text on the confirm button only — don't tint the whole screen red, that's excessive for something this infrequent).

---

## Prompt for opencode

```
Implement SPEC-20 through SPEC-25 from docs/specs/ in the Fastify API.

Context:
- Read docs/CONTEXT.md and docs/domain-model.md first.
- Endpoints: GET /v1/users/:id/profile, GET /v1/users/:id/profile/projects, PUT /v1/users/me,
  PUT /v1/projects/:id (status field), PUT /v1/users/me/resume, POST /v1/users/:id/regard,
  PUT /v1/users/me/notification-prefs, POST /v1/feedback, POST /v1/users/me/delete,
  WS /v1/dm/:userId, GET /v1/dm/:userId/messages.
- Add Drizzle schema/migrations for: regards, feedback, direct_messages, and a `status` column on `projects`
  (SPEC-20/21), plus notification-preference columns on `users`.
- SPEC-25: reuse the WebSocket connection-handling pattern you built for SPEC-17 (Group Chat) — factor out
  a shared helper if it makes sense, rather than copy-pasting the connection map logic.
- SPEC-24: delete-account must be a soft delete (`deletedAt` + anonymize username/email) and must revoke all
  of that user's refresh tokens in the same transaction.
- Write tests from each spec's §3 Scenarios.
- Ask me if anything is ambiguous rather than guessing.
```

## Prompt for Pencil

```
Design the following Forgd (Expo/React Native, dark theme, weld-orange accent, same style as prior screens)
screens:

1. Profile: avatar + username + college at top, a 3-stat row ("Project Done", "Active projects", "Regards")
   with the Regards stat being tappable (subtle pulse-on-tap interaction note), then a list of action rows:
   "Upload resume", "Add new project", "Own papers and journal" should NOT be included (removed), "Bookmark",
   "Settings". Below the stats, tabs or a toggle for viewing this user's Active vs Done project lists
   (same project-card style as the feed).

2. Edit profile: avatar picker, username field, college field, and (new, not in any original screen) a
   "Mark as done" toggle/switch shown per-project when editing from a project's own settings — design this
   as a small switch on the owner's view of their own Project detail screen, not as a separate page.

3. Resume: single row showing the uploaded filename with a delete icon, "Upload new one" button — matches
   the original mock closely, no real change needed.

4. Settings: plain list rows with chevrons — "Notifications", "Change my interests", "Share feedback",
   "Terms of service", "Privacy policy", "Sign out", "Delete account" (last one in a subtly muted/warning
   tone, not full red, just enough to read as distinct from the rest).

5. Share feedback: large text area, "Send" primary button.

6. Sign out confirm / Delete account confirm: simple confirmation screens, destructive action button in a
   warning-red tone (only this button, not the whole screen).

7. Direct message (1:1): standard chat bubble UI, recipient's username in the header, message list, text
   input pinned at the bottom — same visual language as Group Chat (Redesign 03) but without the sender-name
   labels per bubble, since it's just two people.

Keep all components/spacing consistent with the previously designed screens.
```
