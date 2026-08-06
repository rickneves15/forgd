# Screen Checklist — every original mock screen, tracked

This file exists so nothing from the original mockups (`project.pdf`, `project-h.pen`) gets silently dropped. Every screen gets an explicit status: **Kept as-is (restyle only)**, **Changed** (see its redesign doc), **Merged**, **Cut**, or **New**.

Legend: 🎨 = needs a visual pass in the new style even though nothing functional changes.

---

## Auth & Onboarding — see `01-auth-onboarding.md`

| Original screen | Status |
|---|---|
| Sign in | Changed (Google-only social login) |
| Sign up | Changed (Google-only social login) |
| Choose your interests | 🎨 Kept as-is |

## Projects — see `02-projects.md`

| Original screen | Status |
|---|---|
| Projects (feed) | Changed (merged) |
| Apply (feed) | Merged into Projects |
| Filter (4 near-identical variants in the mock) | Changed (consolidated into 1 sheet, dropped the applications-count range) |
| Project detail (Motion Controlled Pick & Place variant) | Changed (unified into 1 layout) |
| Project detail (Gesture Control / stipend variant) | Merged into the same unified layout |
| Project detail — portfolio-only variant (owner profile → project, no Apply button) | 🎨 Kept as-is — now `Screen/Projects.Detail.Portfolio`, full-height 812px, direct child of the Projects frame |
| Add new project (portfolio) | Merged into Add Project |
| Add new one (project category form) | Merged into Add Project |
| Contact people for new project | **Cut** — confusing duplicate, see CONTEXT.md |
| Add new one (project-to-platform form) | Merged into Add Project |
| Apply confirmation ("Apply for Gesture Control...") | 🎨 Kept as-is |
| Notifications (general/applications tabs) | 🎨 Kept as-is |
| Bookmark | 🎨 Kept as-is |

## Groups — see `03-groups.md`

| Original screen | Status |
|---|---|
| Group (list) | 🎨 Kept as-is |
| Group detail (Gesture Control group, % complete) | 🎨 Kept as-is |
| Group tasks | 🎨 Kept as-is |
| Group chat | 🎨 Kept as-is visually (backend becomes real WebSocket) |
| Group members | 🎨 Kept as-is |
| *(none in original)* | **New** — Invite member to group |
| Add issues / Issues list | 🎨 Kept as-is (confirmed: feeds from Project, not Group — see domain-model.md) |
| Comments (both examples — "strain on fingers" thread, "STM32 controller" thread) | 🎨 Kept as-is (this is the Issue thread screen) |
| Group tasks — "Add tasks title here" | 🎨 Kept as-is |

## Profile — see `04-profile.md`

| Original screen | Status |
|---|---|
| Profile (Siddhesh47 / yashraj67 variants) | 🎨 Kept as-is |
| Edit profile | Changed (adds the new "mark project done" control) |
| *(not a separate screen)* | **New** — Profile quick-links (My Projects / My Groups / My Reputation), built from the `listItemWithSubtitle` component (see `style-guide.md` §4) |
| Siddhesh47 / yashraj67 active projects (list) | 🎨 Kept as-is |
| Siddhesh47 / yashraj67 done projects (list) | 🎨 Kept as-is |
| Resume | 🎨 Kept as-is |
| Own paper and journal | **Cut** — V2, see CONTEXT.md |
| Settings | 🎨 Kept as-is |
| Feedback | 🎨 Kept as-is |
| Sign out (confirm) | 🎨 Kept as-is — copy finalized: title "Sign Out", destructive button "Log Out", secondary "Cancel" |
| Delete account (confirm) | 🎨 Kept as-is |
| message [username] (1:1 DM — Varad07, yashraj67 examples) | 🎨 Kept as-is (backend becomes real WebSocket, same as Group Chat) |

## Newly found on full audit (not previously addressed)

| Original screen | Recommendation |
|---|---|
| **"Search" screen with "College shot" + "College top projects"** (shows a college-based leaderboard of top projects, e.g. "Privacy Preserving Ranked Multi-Keyword Search...") | **Recommend cutting for V1.** This depends on grouping/ranking projects by `college` — but `college` is free text and unverified (CONTEXT.md decision), so "AISSMS IOIT" vs "aissms ioit" vs "Aissms Ioit" would never group correctly. Building a leaderboard on top of dirty data undermines itself. Revisit in V2 only if college becomes a normalized/enum field. |
| **Terms of Service / Privacy Policy** (referenced from Settings, but no actual screen content ever appeared in the mock) | Needs an actual screen (simple scrollable text view) — **don't** let me or anyone generate real legal text for these; that's genuine legal advice territory. Screen should exist and look right, content should come from an actual lawyer or a proper generator later. |
| **A near-blank early mock labeled "Reminder"** | Unclear original intent — very little content in that screen, possibly a duplicate/placeholder of Settings from early iteration. **Recommend dropping it as a distinct screen** unless you remember specifically what it was meant to do — flag me if you do. |
| **"This is no page" placeholder screen** (with an illustration) | Recommend treating this as a single **reusable empty-state component** (used for "no projects yet," "no messages yet," "no notifications yet," etc.) rather than one specific screen — cheaper to design once, more consistent. |

---

## Cross-cutting recommendations (apply to multiple screens, not one specific mock)

- **Empty states:** design the reusable empty-state component above and actually use it on: Projects feed (no results), Bookmark (nothing saved), Notifications (nothing yet), Group Chat / DM (no messages yet), Applications admin (no applicants yet).
- **Avatars:** fall back to a generated initials-based avatar (not a blank gray circle) for any user without an uploaded photo — shows up in Profile, Group Members, Chat, Comments.
- **College filter autocomplete:** since `college` is free text, make the Filter sheet's college field autocomplete against colleges already used by real projects in the DB (simple `SELECT DISTINCT`), instead of a fixed hardcoded list. Cheap, avoids the "type the exact string or it won't match" trap.
- **Moderation, deferred but flagged:** Issues/Comments/Chat are open to any logged-in user with no report/flag mechanism. Not blocking V1, but worth being aware of before a wider release — a "report" button that just emails you the content+reporter is a cheap V1.5 addition if abuse becomes a real problem.
