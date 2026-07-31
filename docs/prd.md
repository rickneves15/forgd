# Forgd — Product Requirements Document
## forgd/docs/prd.md

> Product-level feature list and user flows. For entities/rules see `domain-model.md`; for terminology see `glossary.md`; for stack/architecture see `CONTEXT.md` and `adr/`.

---

## 1. Vision

Forgd is a discovery-and-collaboration app for **engineering students** working on hardware projects (electronics, electrical, mechanical, civil, aerospace, chemical). Post a project, find collaborators (with or without a paid stipend), run the group's work inside the app, and build a track record other students can see.

## 2. Users

V1 has a single user type: **Student**. There are no fixed platform-wide roles — "owner", "member", "applicant" are all *relationships to a specific Project/Group*, not account-level roles.

## 3. Feature List

| Area | Features (V1) | Explicitly V2 |
|---|---|---|
| **Auth & Onboarding** | Email/password signup+login, Google OAuth, choose-interests onboarding | Apple/Facebook login |
| **Projects** | Create (portfolio-only or open/recruiting), browse/search/filter feed, project detail, bookmark, download photos/pdf | — |
| **Applications** | Apply with resume to an open project, owner views/accepts/rejects applications | — |
| **Groups** | Auto-created for every open project, tasks, issues (shared with project), group chat (real-time), members list, invite member directly by username | — |
| **Issues & Comments** | Report an issue on any project, open comment thread (any logged-in user can comment) | — |
| **Profile** | Active/done project counts + lists, resume upload, Regards (peer likes), settings | Papers/journals |
| **Notifications** | In-app fetched list (general + application-status), unread count | Native OS push (Expo Push Service) |

## 4. Core User Flows

### 4.1 Sign up → onboarding → browse
1. User signs up (email/password or Google) → lands on "choose your interests" (department tags) → skippable.
2. Lands on **Projects** feed, optionally pre-filtered by chosen interests (filter still fully editable).

### 4.2 Post an open project → receive applications → group formed automatically
1. User taps **Add Project**, fills category/topic/title/description/photos/pdfs.
2. Optionally fills stipend/duration/responsibilities/openings → this makes it "open" and it appears in the discovery feed.
3. A **Group** is created automatically at this moment (owner is the first/admin member) — no separate step, no checkbox.
4. Other students **Apply** (submit resume) from the project detail screen.
5. Owner reviews applications, accepts/rejects. Accepted applicants are added to the Group immediately.

### 4.3 Post a portfolio-only project
1. Same **Add Project** form, recruiting fields left blank.
2. Project shows on the owner's profile (Done/Active project lists) but never appears in the discovery feed and has no Group.
3. It can still receive Issues/Comments from any logged-in user (feedback on the design), even with no collaborators.

### 4.4 Invite someone directly to a group
1. From inside a Group's members screen, admin searches a username and adds them directly.
2. Bypasses the formal Apply-with-resume flow entirely — for when you already know who you want.

### 4.5 Report an issue / discuss a project
1. From a project detail screen, any logged-in user opens **Issues**, taps **Add issue** (short text).
2. Tapping an issue opens its **Comments** thread; any logged-in user can reply.

### 4.6 Give a Regard
1. From another user's profile, tap the Regards button → increments their counter. No list of who gave it (V1).

## 5. Screens Inventory (old mockups → new structure)

| Original mock screen(s) | New screen | Notes |
|---|---|---|
| Sign in / Sign up | Sign in / Sign up | Google + email/password only in V1 |
| Choose your interests | Choose your interests | unchanged in spirit |
| Projects (feed) + Apply (feed) | **Projects** (single feed) | merged, see CONTEXT.md |
| Filter (x4 near-duplicate mocks) | **Filter** (one sheet) | department, topic, college, stipend range, duration, has-openings toggle |
| Project detail (x2 near-duplicate variants) | **Project detail** | one screen, Apply button only shown if project is open |
| Notifications (general/applications tabs) | **Notifications** | kept as two tabs (cheap, matches existing mental model) |
| Add new project + Contact people for project | **Add Project** | merged into one form, see CONTEXT.md |
| Group (list) + Group detail | **Groups** (list) + **Group detail** | unchanged in spirit |
| Group tasks / Group issues / Group chat / Group members | same, nested under Group detail | Issues screen here is a shortcut into the project's Issues |
| *(none — new)* | **Invite member to group** | new V1 screen, see §4.4 |
| Issues + comments | **Issues** (list) → **Issue thread** (comments) | confirmed as 1 feature, not 2 |
| Profile | **Profile** | drop "Own papers and journal" entry point (V2) |
| Settings | **Settings** | unchanged in spirit |
| Resume | **Resume** | unchanged |
| Bookmark | **Bookmark** | unchanged |
| Own paper and journal | *(removed for V1)* | see CONTEXT.md |

## 6. Non-Goals (V1)

- Non-student users (makers, companies) — not designed against, just not targeted.
- Institutional email/college verification.
- Apple/Facebook login.
- Research paper/journal portfolio feature.
- Native OS push notifications.
- Any role/permission system beyond "owner of this project" / "member of this group" — no admin panel, no moderation tooling.
