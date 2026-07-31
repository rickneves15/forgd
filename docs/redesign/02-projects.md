# Redesign 02: Projects (feed, filter, detail, create, apply, notifications)

**Screens:** Projects feed, Filter, Project detail, Add Project, Apply confirmation, Applications (admin review), Bookmark, Notifications
**Specs:** SPEC-06 through SPEC-12
**Original mocks:** "Projects"/"Apply" tabs, the 4 near-duplicate Filter screens, both Project detail variants, both "Add project" variants, Notifications, Bookmark

---

## What changes from the original mocks

- **One "Projects" tab**, not two (Projects + Apply merged — CONTEXT.md).
- **One Filter sheet**, not four near-duplicates. Fields: department, topic, college (chip-add pattern like the original), stipend range, duration, plus a **"Has openings" toggle** replacing the dropped "number of applications received" range slider (that filter was cut — low value, odd UX; see SPEC-07 §3.3).
- **One Project detail layout** for both portfolio and open projects — the stipend/openings/responsibilities block and Apply button simply don't render when the project is portfolio-only, instead of having two separate screen variants.
- **One "Add Project" form**, not two — recruiting fields (stipend, duration, responsibilities, openings) are always visible but optional, no "create group" checkbox (SPEC-06).
- Applications admin screen: keep the resume-preview + "Add to group" pattern from the original mock, just rename the action to **"Accept"** (clearer than "Add to group" once you know Group creation is automatic — the applicant lands in the group as a side effect, not as the thing you're choosing to do).
- Notifications: keep the two-tab structure (General / Applications) from the original mock — cheap to keep, matches the existing mental model, no reason to change it.

## Visual direction (continuing from Redesign 01)

Same system: dark graphite base, weld-orange accent, geometric sans, 8-12px corners.
- **Project cards** (feed): title, small department tag (colored chip, department-specific hue is fine as a secondary color, accent stays reserved for actions), college + posted-date as muted secondary text, stipend badge only shown when the project is open.
- **Filter sheet:** bottom sheet (not full screen), chip-style multi-select for department/topic/college, a proper dual-handle range slider for stipend (skip the awkward "0 1000 1000 2000..." segmented-label style from the original mock — a real slider with a live value label reads better).
- **Add Project form:** group the recruiting fields under a visually distinct "Looking for collaborators? (optional)" section, so it's clear at a glance that skipping it is completely fine.

---

## Prompt for opencode

```
Implement SPEC-06 through SPEC-12 from docs/specs/ in the Fastify API.

Context:
- Read docs/CONTEXT.md and docs/domain-model.md first.
- Endpoints: POST /v1/projects, GET /v1/projects, GET /v1/projects/:id, POST /v1/projects/:id/applications,
  GET /v1/projects/:id/applications, POST /v1/applications/:applicationId/accept,
  POST /v1/applications/:applicationId/reject, PUT+DELETE /v1/projects/:id/bookmark, GET /v1/bookmarks,
  GET /v1/notifications, PUT /v1/notifications/read-all.
- Add Drizzle schema/migrations for: projects, applications, groups, group_members, bookmarks, notifications
  (see domain-model.md for fields — projects need an `isOpen` boolean column set at insert time, not computed on read).
- SPEC-06: creating a project with openings>0 must, in the same DB transaction, create its Group and add the
  owner as the first member.
- SPEC-10: accepting an application must, in one transaction, update the application status, insert the
  group_members row, and insert a notification row.
- File uploads (photos/pdfs/resume) are assumed already-uploaded R2 URLs by the time these endpoints are
  called — if there's no upload endpoint yet, stub a simple presigned-URL endpoint for R2 first and note it.
- Write tests from each spec's §3 Scenarios.
- Ask me if anything is ambiguous rather than guessing — especially around the notification message wording,
  which isn't fully specified.
```

## Prompt for Pencil

```
Design the following Forgd (Expo/React Native, dark theme, weld-orange accent — same style as the Auth
screens already designed) screens:

1. Projects feed: search bar at top, filter icon button, notification bell icon (with unread badge),
   scrollable list of project cards. Each card: title, department tag (small colored chip), college name +
   posted date (muted secondary text), a stipend badge (only when the project is open, e.g. "₹3000"), and a
   subtle bookmark icon in the corner.

2. Filter (bottom sheet, not full screen): department multi-select chips with a "+" to add more, topic
   chips, college chips, a dual-handle stipend range slider with a live value label, a duration multi-select
   (2/3/6/9/12 months), and a "Has openings" toggle switch. "Apply filters" primary button pinned at the
   bottom.

3. Project detail: photo gallery/carousel at top, title, description, a "Looking for collaborators" card
   (stipend, duration, responsibilities, openings count) — this card and the "Apply now" button below it
   should visually not exist at all when the project is portfolio-only (design both states). Buttons for
   "Download all photos" / "Download pdf" and "Admin info". A bookmark toggle icon in the header.

4. Add Project form: title, description, category dropdown, topic input, photo/pdf upload buttons, then a
   visually separated section titled "Looking for collaborators? (optional)" containing stipend, duration,
   responsibilities, and number of openings fields. Primary button: "Add Project".

5. Apply confirmation screen: project title as the header, the user's resume filename shown as a card,
   "Apply now" primary button.

6. Applications (admin) list: for a project you own, a list of applicant cards (username, college, a
   "View resume" link), each with "Accept" and "Reject" buttons.

7. Bookmark list: same project-card style as the feed, just a filtered list.

8. Notifications: two tabs at the top ("General", "Applications"), list of notification rows below (icon +
   message text + relative timestamp), unread ones have a subtle accent-colored dot/left-border.

Keep all components/spacing consistent with the Auth screens already in this file.
```
