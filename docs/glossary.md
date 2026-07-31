# Forgd — Glossary
## forgd/docs/glossary.md

> Official terminology. Use these terms consistently across code, docs, and conversation.
> If a term here conflicts with an older document (e.g. the original PDF pitch), this glossary wins.

---

## Core Terms

| Term | Definition |
|------|-----------|
| **Project** | A unit of work created via the single "Add Project" flow. Either **portfolio-only** (no openings set, shown only on the owner's profile) or **open** (openings set, appears in the discovery feed and accepts Applications). |
| **Application** | The act of a User applying to join someone else's **open Project**, submitting a resume. _Avoid: "Apply" as a noun/section name — it's an action, not a tab (see CONTEXT.md nav decision)._ |
| **Group** | The collaboration space for an open Project's accepted team (tasks, issues shortcut, chat, members, % complete). |
| **Issue** | A reported topic/problem tied to a **Project** (portfolio or open — not Group-exclusive). Has many **Comments**. |
| **Comment** | A reply within an Issue's thread. Any logged-in user may comment, not just Group members. |
| **Regard** | A peer-appreciation "like" on a User's profile. Counter only, no attribution list, in V1. |
| **College** | Free-text, optional, unverified field on User. _Avoid: implying any institutional verification exists._ |
| **Group Chat** | Real-time messaging scoped to all members of one Group (many-to-many). _Distinct from **Direct Message**._ |
| **Direct Message** | Real-time 1:1 messaging between any two Users, independent of shared Group membership. _Distinct from **Group Chat**._ |
| **Task** | A to-do item belonging to a Group, optionally assigned to a member, with a `done` boolean. Drives a Group's % complete. |
| **Project status** (`active`/`done`) | Manually toggled by the project owner — there is no automatic "finished" detection. Distinct from `isOpen` (whether it's recruiting). |

---

## Flagged ambiguities (resolved)

- The original PDF used **"Apply"** as both a section name and an action. Resolved: it's only an action now; the section was merged into **Projects**.
- The original PDF had two separate-looking creation buttons, **"Add new project"** and **"Contact people for project"**, that turned out (on re-reading the source) to be the same form. Resolved: one **"Add Project"** flow; recruiting fields are optional on it.
- The original PDF showed **"Issues"** and **"comments"** as what looked like two features. Resolved: one feature — Issue (the item) → Comments (its thread).
