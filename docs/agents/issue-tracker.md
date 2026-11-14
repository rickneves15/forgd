# Issue tracker: GitHub

Issues and specs for this repo live as GitHub issues in `rickneves15/forgd`. Use the `gh` CLI for all operations. Running `gh` inside this clone resolves the repo automatically.

The installed `gh` is **2.46** (verified 2026-11-14). Commands marked **2.94+** below do not exist in that version; use the REST fallback or upgrade `gh` first. The text-based blocking fallback is the one that works today.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --json number,title,body,labels,comments`.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Make an issue a sub-issue of a parent**: `gh issue create --parent <parent> ...`, or `gh issue edit <parent> --add-sub-issue <child>` afterwards (`gh` 2.94+; not on 2.46). Fallback that works on 2.46: add the child to a task list in the parent body and put `Part of #<parent>` at the top of the child body.
- **Blocking**: the fallback that works on the installed `gh` is a `Blocked by: #<n>, #<n>` line at the top of the child body. When `gh` is 2.94+, prefer GitHub's **native issue dependencies**, the canonical, UI-visible representation: add an edge with `gh issue create --blocked-by <n>,<n> ...` or `gh issue edit <child> --add-blocked-by <blocker>`. Older `gh` can also call the REST API directly: `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`, where `<blocker-db-id>` is the blocker's numeric **database id** (`gh api repos/<owner>/<repo>/issues/<n> --jq .id`, _not_ the `#number` or `node_id`). A ticket is unblocked when every blocker is closed.
- **Count open blockers**: with the text fallback, read the child body (`gh issue view <n> --json body --jq '.body'`) and count the open issues named in its `Blocked by:` line. On `gh` 2.94+, `gh api repos/<owner>/<repo>/issues/<n> --jq .issue_dependencies_summary.blocked_by` returns open blockers only (0 means startable). `gh issue view <n> --json blockedBy` does not exist on 2.46 and lists closed blockers on newer versions, so filter it: `--jq '[.blockedBy.nodes[] | select(.state == "OPEN")] | length'`.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: post the explanation with `gh issue comment <number> --body "..."`, then `gh issue close <number>`. On an already-closed issue, `gh issue close --comment` drops the comment and still exits 0.

File issues only into this repo (`rickneves15/forgd`). Before the first `gh issue create` of a session, confirm the target with `gh repo view --json nameWithOwner` — in a fork, `gh` can default to the upstream parent.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_

When set to `yes`, PRs run through the same labels and states as issues, using the `gh pr` equivalents:

- **Read a PR**: `gh pr view <number>`, then `gh pr view <number> --comments` (off a TTY, `--comments` prints only the comments, not the body), and `gh pr diff <number>` for the diff.
- **List external PRs for triage**: `gh api --paginate 'repos/{owner}/{repo}/pulls?state=open' --jq '.[] | select(.author_association | IN("OWNER","MEMBER","COLLABORATOR") | not) | {number, title, author: .user.login, author_association, labels: [.labels[].name]}'`.
- **Comment / label / close**: `gh pr comment`, `gh pr edit --add-label`/`--remove-label`, `gh pr close`.

GitHub shares one number space across issues and PRs, so a bare `#42` may be either: resolve with `gh pr view 42` and fall back to `gh issue view 42`.

## Triage labels

Triage labels are **intentionally not configured** (decided 2026-11-14). The canonical roles are `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. `wontfix` is a GitHub default label and may already exist; the other four do not.

Consequences until they exist:

- `to-spec` and `to-tickets` normally apply `ready-for-agent`; run them with an explicit "do not apply labels" instruction, or create the labels first.
- Do **not** run `triage` — it has no vocabulary to apply. Triage incoming issues manually until the labels are created.

If this changes, create the five labels on `rickneves15/forgd` and add `docs/agents/triage-labels.md` mapping each role to its label. Do not create labels that nothing consumes.

## Specs and tickets

- A spec produced by `to-spec` is a GitHub issue, not a file in `docs/`. Durable contracts live in `docs/specs/` — see [`specs.md`](./specs.md) for numbering, status, pairing, and the temporary-to-permanent promotion path.
- Tickets produced by `to-tickets` are GitHub issues linked to the parent spec. Use the sub-issue and `Blocked by:` fallbacks above on `gh` 2.46 (native sub-issues and dependency edges need `gh` 2.94+) so the frontier is queryable.
- Never run `triage` on tickets you created with `to-tickets`; they are already agent-ready.

The end-to-end sequence lives in [`workflow.md`](./workflow.md).

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Read it as in **Read an issue** above.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue with **child** issues as tickets.

`wayfinder:map` and `wayfinder:<type>` are **not created yet** in `rickneves15/forgd`. Create them (`gh label create wayfinder:map`, `gh label create wayfinder:research`, etc.) before the first `/wayfinder` run. Until then, prefix the map title with `[wayfinder]` and write the ticket type at the top of each child body.

- **Map**: after creating the label, a single issue labelled `wayfinder:map`, holding the Notes / Decisions-so-far / Fog body. `gh issue create --label wayfinder:map`.
- **Child ticket**: an issue linked to the map as a GitHub sub-issue (see **Make an issue a sub-issue of a parent**). Where sub-issues aren't enabled, add the child to a task list in the map body and put `Part of #<map>` at the top of the child body. Labels: `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`). Once claimed, the ticket is assigned to the driving dev.
- **Blocking**: see **Blocking** under Conventions.
- **Frontier query**: list the map's open children (`gh issue list --state open`, scoped to the map's sub-issues / task list), drop any with an open blocker (see **Count open blockers**, or an open issue in the `Blocked by` line) or an assignee; first in map order wins.
- **Claim**: `gh issue edit <n> --add-assignee @me`, the session's first write.
- **Resolve**: `gh issue comment <n> --body "<answer>"`, then `gh issue close <n>`, then append a context pointer (gist + link) to the map's Decisions-so-far.
