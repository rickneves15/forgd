# Engineering Workflow

How the installed Matt Pocock skills fit this repository. This is a guide, not a mandate: pick the smallest flow that fits the work. The skills live in `~/.agents/skills/`; this doc records the ones that matter here and when to reach for them.

**Who starts a skill:** most skills here are user-invoked slash commands. `grill-with-docs`, `grill-me`, `to-spec`, `to-tickets`, `implement`, `implement-spec`, `retro`, `triage`, `wayfinder`, `to-questionnaire`, `improve-codebase-architecture`, and `handoff` declare `disable-model-invocation: true`, so an agent cannot start them on its own — the user runs them. The rest (`research`, `prototype`, `domain-modeling`, `codebase-design`, `tdd`, `code-review`, `diagnosing-bugs`, `pr`, `writing-for-agents`) can be invoked when the task matches.

## The default flow

For work that spans more than one session:

```
grill-with-docs → to-spec → to-tickets → implement (per ticket)
                                      ↘ implement-spec (whole spec)
                                                   ↓
                                              code-review → pr → retro
```

For work that fits one session, skip the ceremony:

```
grill-with-docs → implement → code-review
```

- **One context window** through `grill-with-docs` → `to-spec` → `to-tickets`, so the interview, spec, and tickets share the same thinking.
- **Fresh context per ticket** for `implement`, working from the ticket only.
- **`retro`** runs in the session it reviews, before clearing, and proposes environment changes (checks, standards, pointers) rather than code changes.

## Skill map

### Discovery and requirements

| Skill | Use when |
|---|---|
| `grill-with-docs` | Default entry point for a new idea or a fuzzy requirement. Interviews you and writes glossary/ADR updates as decisions land. |
| `grilling` | The interview primitive alone, without the doc side effects. Rarely needed directly. |
| `grill-me` | The interview alone (`grilling`), with no doc writes. Prefer `grill-with-docs` here so the decisions land in the glossary and ADRs. |
| `research` | A fact must be gathered from primary sources before deciding. Produces a cited Markdown note. |
| `prototype` | A design question needs runnable code to answer. Throwaway; when captured, commit it to a throwaway branch out of `main` and link it from the issue. |
| `to-questionnaire` | The missing information is in someone else's head, not the codebase. |
| `wayfinder` | A large, foggy effort too big for one session: a map of decision tickets, resolved one at a time. Plan only. |

### Architecture and domain

| Skill | Use when |
|---|---|
| `domain-modeling` | Sharpening a term, resolving overloaded language, or recording an ADR. Pulled in by `grill-with-docs`, `triage`, and `wayfinder`; call directly when only the language is wrong. |
| `codebase-design` | Designing a module's shape (deep modules, seams). Vocabulary layer, not a process. |
| `improve-codebase-architecture` | Periodic upkeep: scan for deepening opportunities and grill the chosen one. Generates ideas for the main flow. |

### Specification and tickets

| Skill | Use when |
|---|---|
| `to-spec` | Multi-session work, after the grilling. Synthesises the conversation into an issue-tracker spec. No interview. |
| `to-tickets` | A spec or plan exists and needs tracer-bullet tickets with blocking edges. One vertical slice per ticket. |
| `triage` | Incoming bugs/requests you did **not** create. Never triage tickets produced by `to-tickets`. |

### Implementation and review

| Skill | Use when |
|---|---|
| `tdd` | Inside `implement`: one red-green slice at a time. |
| `implement` | One ticket or one small piece of work, in a fresh context. Runs `tdd`, typechecks, tests, then `code-review`. |
| `implement-spec` | A whole spec should land on one integration branch, with subagents working the ticket frontier in parallel. |
| `code-review` | Two-axis review (Standards + Spec) of `git diff <fixed-point>...HEAD`; needs a fixed point and the spec source. |
| `diagnosing-bugs` | A hard bug or performance regression. Builds a tight red-capable feedback loop before theorising. |
| `pr` | Writing a PR body: Summary, Evidence, Merge Danger. |

### Close-out

| Skill | Use when |
|---|---|
| `retro` | After a build, especially one that went sideways. Suggests environment improvements. |
| `handoff` | Context must move to a new harness, directory, or colleague mid-work. |
| `writing-for-agents` | Writing or editing skills, `AGENTS.md`, or docs agents consume. |

## `implement` vs `implement-spec`

- **`implement`** — one ticket at a time, fresh context each. Best for a linear dependency chain, a solo dev staying in the loop, or a single-session feature. It commits to the current branch.
- **`implement-spec`** — the whole spec as a task graph on one integration branch, with implementer subagents per ticket and a merger step. Best when the tickets are genuinely independent and the spec is large enough that parallel work pays off. It expects an issue tracker it can resolve tickets against.

Default here: **`implement` per ticket.** Forgd is a solo project; parallel subagents add coordination cost that rarely pays back on a 1–2 ticket feature. Reach for `implement-spec` when a spec produces 4+ mostly independent tickets.

## Issue tracker and the label gap

Issues live on GitHub (`rickneves15/forgd`); see `docs/agents/issue-tracker.md`.

**Triage labels are intentionally not configured** (decided 2026-11-14). `to-spec` and `to-tickets` normally apply `ready-for-agent`, and `triage` expects the five canonical roles. Until the labels exist:

- Tell `to-spec` / `to-tickets` explicitly: "do not apply labels."
- Do not run `triage`; it has no vocabulary to apply.
- If you change your mind, create `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix` on GitHub and add `docs/agents/triage-labels.md` mapping each role to its label.

## Temporary specs become permanent docs

The issue tracker is the working surface. `docs/` is the durable record. When work lands, promote it:

| Durable knowledge | Destination |
|---|---|
| Product behaviour, flow, screen, user story | `docs/prd.md` |
| Entity, relationship, invariant | `docs/domain-model.md` |
| Domain term | `docs/glossary.md` |
| Hard-to-reverse decision | `docs/adr/` (next number) |
| Cross-service sequence | `docs/flows/` |
| API contract | `docs/specs/api/SPEC-XX.md` |
| Mobile contract | `docs/specs/app/APP-XX.md` |

A GitHub issue is closed, not copied into `docs/`. The durable files absorb what survives. Full conventions: `docs/agents/specs.md`.

## Guardrails and verification

The workflow assumes these checks exist. Run them; do not claim them without output:

- `pnpm --filter api test` — integration tests against real Postgres.
- `pnpm --filter api exec tsc --noEmit` — API typecheck.
- `pnpm --filter app typecheck` — app typecheck.
- Biome via the Husky pre-commit hook for staged `api/src` files (app is not wired into the hook yet).
- `/code-review` before merging anything non-trivial.

## Anti-patterns

- Running `to-spec` for a one-session change.
- Running `triage` on tickets you created with `to-tickets`.
- Running both `grill-me` and `grill-with-docs`.
- Letting `implement` carry context between tickets — each ticket gets a fresh window.
- Treating a spec as done without checked acceptance criteria and passing tests.
- Copying a spec into `docs/` alongside the GitHub issue. One source, one owner.
