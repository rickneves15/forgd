# SPEC-06: Create Project

**Status:** Ready
**Screen(s):** Add Project
**Related docs:** `prd.md` §4.2/§4.3, `domain-model.md` §Project, §Group

---

## 1. Context

Single creation form replacing the original mock's two separate flows ("Add new project" and "Contact people for project" — see CONTEXT.md). Recruiting fields are optional; filling them makes the project "open" and auto-creates its Group.

## 2. Out of Scope

- Editing an existing project (not modeled yet — treat as a future spec if needed)
- Applying to a project (SPEC-09)

## 3. Scenarios

### 3.1 Happy Path

```gherkin
Given a logged-in user submits title, description, category, topic, and at least one photo or pdf
When POST /projects with openings left unset (0 or omitted)
Then a portfolio-only Project is created, owned by that user, NOT visible in the discovery feed, no Group created
```

```gherkin
Given the same base fields, plus openings > 0 (and optionally stipend, duration, responsibilities)
When POST /projects
Then an open Project is created, visible in the discovery feed, AND a Group is auto-created with the owner as its first/admin member
```

### 3.2 Error Cases

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Missing required base fields | no title/description/category/topic | POST /projects | 400 `VALIDATION_ERROR` |
| No photo or pdf attached | empty `photoUrls` and `pdfUrls` | POST /projects | 400 `VALIDATION_ERROR` (at least one is required) |
| Negative/invalid openings | `openings: -1` | POST /projects | 400 `VALIDATION_ERROR` |

### 3.3 Edge Cases

- `openings: 0` and `openings: null`/omitted are treated identically (portfolio-only) — no special meaning to explicit zero.
- Photos/pdfs are already-uploaded R2 URLs by the time this endpoint is called (separate upload-then-reference flow, not multipart on this endpoint — see Implementation Notes).

## 4. Contract

### 4.1 Endpoint

```
POST /projects
```

### 4.2 Auth

- Requires auth: yes
- Extra check: none (any logged-in user can create a project)

### 4.3 Request

```typescript
{
  title: string,              // required
  description: string,        // required
  category: string,           // required, enum matching interests tags
  topic: string,               // required, free text or tag
  photoUrls?: string[],
  pdfUrls?: string[],
  // recruiting fields — all optional, presence of openings>0 makes it "open"
  stipend?: number,            // in ₹
  durationMonths?: number,
  responsibilities?: string,
  openings?: number
}
```

### 4.4 Response (Success)

```json
{
  "id": "...",
  "title": "...",
  "isOpen": true,
  "groupId": "..." 
}
```
_(`groupId` is `null` when `isOpen` is `false`)_

### 4.5 Response (Errors)

| HTTP | Code | When |
|------|------|------|
| 400 | VALIDATION_ERROR | missing required fields, no photo/pdf, invalid openings |

## 5. Acceptance Criteria

- [ ] Base fields only → portfolio project, `isOpen: false`, `groupId: null`, not in feed
- [ ] + `openings > 0` → open project, `isOpen: true`, Group auto-created, owner is first member
- [ ] Covers all scenarios in §3

## 6. Implementation Notes

- `isOpen` is a derived/computed flag (or a stored boolean set at creation from `openings > 0`) — simplest: store it as a real column, computed once at insert time, since it's never mutated after creation in V1 (no "reopen"/"close" action yet).
- Group creation happens in the same DB transaction as the Project insert — don't leave a window where an open Project exists without its Group.
