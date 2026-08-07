# SPEC-05: Choose-interests onboarding

**Status:** Ready
**Screen(s):** Choose your interests
**Related docs:** `prd.md` §4.1

---

## 1. Context

Right after signup (email/password or Google), the user picks department/topic tags used to pre-filter their Projects feed. Skippable.

## 2. Out of Scope

- The actual feed filtering logic itself (that's part of the Projects feed spec, not this one) — this spec is only about persisting the selection.

## 3. Scenarios

### 3.1 Happy Path

```gherkin
Given a logged-in user who just signed up
When PUT /users/me/interests with a list of interest tags
Then the tags are saved to their profile and used as the default Projects feed filter (editable later any time)
```

### 3.2 Error Cases

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Unknown tag sent | tag not in the fixed enum list | PUT interests | 400 `VALIDATION_ERROR` |

### 3.3 Edge Cases

- Skipping onboarding = calling this endpoint with an empty array (or just never calling it) — both are valid, feed simply shows everything unfiltered.
- Same endpoint is reused later from Settings → "Change my interests".

## 4. Contract

### 4.1 Endpoint

```
PUT /users/me/interests
```

### 4.2 Auth

- Requires auth: yes
- Extra check: none (always operates on the caller's own profile)

### 4.3 Request

```typescript
{
  interests: string[]  // enum: engineering, btech, mtech, it_cs, ente, electrical, mechanical, civil
}
```

### 4.4 Response (Success)

```json
{ "interests": ["ente", "mechanical"] }
```

### 4.5 Response (Errors)

| HTTP | Code | When |
|------|------|------|
| 400 | VALIDATION_ERROR | any tag not in the fixed enum |

## 5. Acceptance Criteria

- [ ] Valid tags → saved, returned back
- [ ] Empty array → allowed (means "no filter")
- [ ] Unknown tag → 400
- [ ] Covers all scenarios in §3

## 6. Implementation Notes

- Store as a Postgres text array column (`interests text[]`) on `users` — no need for a separate join table for a fixed, small enum in V1.
