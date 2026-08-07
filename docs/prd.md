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
| **Direct Messages** | 1:1 real-time messaging between any two users | Thread list screen (no "my DM inbox" view yet — SPEC-25) |

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
| "Varad07 you message" style screen | **Message [username]** | 1:1 DM, opened from a user's profile or a group member's name (SPEC-25) |
| Own paper and journal | *(removed for V1)* | see CONTEXT.md |

## 6. Non-Goals (V1)

- Non-student users (makers, companies) — not designed against, just not targeted.
- Institutional email/college verification.
- Apple/Facebook login.
- Research paper/journal portfolio feature.
- Native OS push notifications.
- Any role/permission system beyond "owner of this project" / "member of this group" — no admin panel, no moderation tooling.

## 7. User Stories

Atomic, one story per user-value chunk. Each links forward to the spec(s) that operationalize it — acceptance criteria live there (`SPEC-XX` §5, `APP-XX` §9), not duplicated here. Format: *As a [who], I want [what], so that [why]*.

### 7.1 Auth & Onboarding

- **US-1** — As a prospective Student, I want to create an account with email and password, so that I can start using Forgd without needing a third-party account. _(→ SPEC-01, APP-01)_
- **US-2** — As a registered Student, I want to log in with email and password, so that I can access my account again. _(→ SPEC-02, APP-02)_
- **US-3** — As a Student, I want to sign up or log in with my Google account, so that I don't have to create and remember another password. _(→ SPEC-03, APP-03)_
- **US-4** — As a logged-in Student, I want my session to stay active for a while without logging in again, so that I'm not interrupted during day-to-day use. _(→ SPEC-04, APP-04)_
- **US-5** — As a Student, I want to log out of my account, so that I can protect my access on a shared or borrowed device. _(→ SPEC-04, APP-04)_
- **US-6** — As a new Student, I want to choose my areas of interest right after signing up, so that my Projects feed starts out relevant to me. _(→ SPEC-05, APP-05)_
- **US-7** — As a new Student, I want to skip choosing interests if I'm not sure yet, so that I'm not blocked from using the app. _(→ SPEC-05, APP-05)_

### 7.2 Projects

- **US-8** — As a Student, I want to create a project with category/topic/title/description/photos or pdf, so that I can showcase my work even without needing collaborators. _(→ SPEC-06, APP-06)_
- **US-9** — As a Student, I want to optionally add stipend/duration/responsibilities/openings when creating a project, so that it opens for applications and shows up in the discovery feed. _(→ SPEC-06, APP-06)_
- **US-10** — As a Student, I want to browse the feed of open projects, so that I can discover opportunities to collaborate. _(→ SPEC-07, APP-07)_
- **US-11** — As a Student, I want to filter the feed by department, topic, college, stipend range, duration, and "has openings," so that I find relevant projects faster. _(→ SPEC-07, APP-07)_
- **US-12** — As a Student, I want to open a project's detail screen, so that I can see everything before deciding to apply. _(→ SPEC-08, APP-08)_
- **US-13** — As a Student, I want to bookmark a project, so that I can find it again later without searching. _(→ SPEC-11, APP-11)_
- **US-14** — As a Student, I want to download a project's photos/pdfs, so that I can review the material offline. _(→ SPEC-08, APP-08)_

### 7.3 Applications

- **US-15** — As a Student, I want to apply to an open project with my resume, so that I can try to join the team. _(→ SPEC-09, APP-09)_
- **US-16** — As a project owner, I want to see the list of applications I've received, so that I can decide who joins my group. _(→ SPEC-10, APP-10)_
- **US-17** — As a project owner, I want to accept or reject an application, so that I can form my team — accepting automatically adds the applicant to the Group. _(→ SPEC-10, APP-10)_

### 7.4 Groups

- **US-18** — As a Student, I want to see the list of groups I'm part of, so that I can keep track of my ongoing projects. _(→ SPEC-13, APP-13)_
- **US-19** — As a group member, I want to see the group's percent-complete, so that I understand overall progress at a glance. _(→ SPEC-13, APP-13)_
- **US-20** — As a group member, I want to create and check off tasks, so that the team's work stays organized. _(→ SPEC-14, APP-14)_
- **US-21** — As a group member, I want to chat in real time with my group, so that I can communicate with the team without leaving the app. _(→ SPEC-17, APP-17)_
- **US-22** — As a group member, I want to see the members list, so that I know who's on the team. _(→ SPEC-18, APP-18)_
- **US-23** — As a group admin, I want to invite someone directly by username, so that I can add someone I already know without the formal apply flow. _(→ SPEC-19, APP-19)_

### 7.5 Issues & Comments

- **US-24** — As a Student, I want to open an issue on any project (even one I'm not part of), so that I can give feedback or report a problem. _(→ SPEC-15, APP-15)_
- **US-25** — As a Student, I want to comment on an issue, so that I can discuss the problem with whoever raised it. _(→ SPEC-16, APP-16)_

### 7.6 Profile

- **US-26** — As a Student, I want to see my profile with my active and done projects, so that I have a portfolio of what I've built. _(→ SPEC-20, APP-20)_
- **US-27** — As a Student, I want to mark one of my projects as done, so that it moves from my active list to my done list. _(→ SPEC-21, APP-21)_
- **US-28** — As a Student, I want to edit my username, college, and avatar, so that I can keep my profile current. _(→ SPEC-21, APP-21)_
- **US-29** — As a Student, I want to upload/replace my resume, so that it's used automatically whenever I apply to a project. _(→ SPEC-22, APP-22)_
- **US-30** — As a Student, I want to give a Regard on someone else's profile, so that I can publicly acknowledge a good collaboration. _(→ SPEC-23, APP-23)_
- **US-31** — As a Student, I want to reach account settings (notifications, logout, send feedback), so that I can manage my account. _(→ SPEC-24, APP-24)_

### 7.7 Notifications

- **US-32** — As a Student, I want to see a list of general and application-status notifications, so that I know what happened with my projects and applications. _(→ SPEC-12, APP-12)_
- **US-33** — As a Student, I want to see an unread notification count, so that I know at a glance whether there's something new to check. _(→ SPEC-12, APP-12)_

### 7.8 Direct Messages

- **US-34** — As a Student, I want to send a direct 1:1 message to any other user, so that I can talk outside the context of a shared group. _(→ SPEC-25, APP-25)_
- **US-35** — As a Student, I want to see a direct conversation's history even if I was offline when a message was sent, so that I don't lose context. _(→ SPEC-25, APP-25)_
