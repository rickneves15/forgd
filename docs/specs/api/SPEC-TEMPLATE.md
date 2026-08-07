# SPEC-{ID}: {Title}

**Status:** Draft | Ready | Done
**Screen(s):** {which app screen(s) this powers — see prd.md §5}
**Related docs:** `prd.md` §{section}, `domain-model.md` §{section}

---

## 1. Context

<!-- Why this exists, 1-3 sentences. Link back to the PRD flow it's part of. -->

## 2. Out of Scope

<!-- What this spec deliberately does NOT cover, even if related (link the spec that does, if it exists). -->

-

## 3. Scenarios

### 3.1 Happy Path

```gherkin
Given {precondition}
When {action}
Then {expected result}
```

### 3.2 Error Cases

| Scenario | Given | When | Then |
|----------|-------|------|------|
| | | | |

### 3.3 Edge Cases

<!-- Only include ones that actually matter for this feature — don't pad this section. -->

-

## 4. Contract

### 4.1 Endpoint

```
{METHOD} /{path}
```

### 4.2 Auth

<!-- Forgd V1 has no roles beyond "owner of X" / "member of Y" — state the check plainly, no role table needed. -->

- Requires auth: yes/no
- Extra check: {e.g. "must be the project owner" / "must be a member of this group" / none}

### 4.3 Request

```typescript
{ field: "type, constraints" }
```

### 4.4 Response (Success)

```json
{ "field": "type" }
```

### 4.5 Response (Errors)

| HTTP | Code | When |
|------|------|------|
| | | |

## 5. Acceptance Criteria

- [ ]
- [ ] Covers all scenarios in §3

## 6. Implementation Notes

<!-- Concrete decisions: table(s)/columns touched, libraries, anything non-obvious. Keep it short. -->

-
