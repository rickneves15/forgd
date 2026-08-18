# Projects & Apply — Redesign Plan

> Visual redesign guide for the Projects & Apply flow in `docs/design.pen`.
> Each screen entry covers: **References**, **Components**, **Layout**, **Micro-interactions**, **Forgd Visual Notes**.
> Status tracking lives in `00-screen-checklist.md`.

## 1. Home (feed)

**References**
- [AniUI Home Screen Block](https://www.aniui.dev/blocks/home)
- [AniUI Product List Block](https://www.aniui.dev/blocks/product-list)

**Components**
- `navHeaderDefault` (greeting + notifications bell with unread Badge)
- `Search Bar` (input + filter trigger)
- `Chip` row (domain filters)
- `cardProjectDefault` feed (badge, title, meta, stats row)
- `Skeleton` for loading state
- `emptyState` for empty state

**Layout**
- Sticky header row, then search, then filter chips, then vertical card feed
- Cards full-width with 12px radius, 16px padding

**Micro-interactions**
- Pull-to-refresh
- Filter chip toggles re-query the feed

## 2. Detail (+ Loading, + Portfolio)

**References**
- [AniUI Product Detail Block](https://www.aniui.dev/blocks/product-detail)

**Components**
- `ImageGallery` for project photos
- `Badge` for domain/status
- Meta rows (author, date, spots, stipend)
- Primary "Apply" button (hidden on Portfolio variant)
- `Skeleton` for loading state

**Layout**
- Gallery top, content below (title, badge, description, meta, actions)
- Sticky bottom action bar on apply variant

**Micro-interactions**
- Like/bookmark toggle
- Apply routes to Apply.Submit

## 3. Search

**Reference**
- [AniUI Search Block](https://www.aniui.dev/blocks/search)

**Components**
- `SearchBar`
- Result list (`cardProjectCompact`) / recent searches
- `Skeleton` + `emptyState`

## 4. Filter

**Components**
- Bottom sheet (`modalDefault`)
- `Chip` grid for domains
- `Slider` for stipend range
- `Switch` for "open positions only"
- Apply / Reset buttons

**Layout**
- Sheet slides from bottom, rounded 20px top corners
- Sectioned: Domain, Stipend, Availability

## 5. AddProject / Create wizard (Step 1–5 + Success)

> **2026-08-14 revision:** bottom button bar (Back + Continue) removed from Steps 1–4. Navigation is now swipe + auto-advance. Step 5 keeps a single full-width Create button.

**Components**
- `ProgressSteps` / `Stepper` (5 dots + labels, top) — progress indicator only, not tappable
- Swipe glyph (‹ ›) below content, pulsing softly while a next step exists; one-time highlight on first visit
- Step forms: title/desc (`Input`, `Textarea`), photos (`FilePicker` placeholder), domain (`Chip`), recruiting (stipend/duration/openings), review
- `Button` — single primary "Create Project" on Step 5 only (disabled while uploads pending)
- Success screen with confirmation (unchanged)

**Layout**
- Stepper on top, single field-group per step, swipe glyph at the base
- No bottom action bar on Steps 1–4

**Micro-interactions**
- **Auto-advance (Steps 1–3):** when all required fields of the current step become valid, advance to the next step after ~600ms of inactivity, with an animated slide. Debounce prevents firing mid-typing (e.g., Description becomes valid on its 1st char).
- **Swipe navigation:** horizontal pager with per-step snap. Forward swipe only advances when the current step is valid; backward swipe is always free; only adjacent steps are reachable (no jumping).
- **Step 4 (recruiting, all-optional):** advances only by swipe — auto-advance never fires (nothing is required). Caption "Optional — swipe to continue" below the fields.
- **Header back (X):** still exits the whole wizard with a confirm-discard prompt when the form is dirty. Step navigation is swipe-only.
- Keyboard blurs before an auto-advance slide fires.
- Validation error inline per field; leaving recruiting blank → portfolio-only project (per CONTEXT)

## 6. Applicants / Admin

> **2026-08-14 revision:** Applicants rebuilt from scratch — one card per applicant, no visible action buttons (all actions in a ⋮ overflow menu).

**Components**
- Segmented tabs `tabsSegmentedDefault` (Pending / All)
- `applicantCard` — one card per application, `bg-surface`, 12px radius, 16px padding, 12px gap between cards; everything lives inside the card:
  - Header row: avatar (photo, ~48px) left, name beside it, school below name (`$muted-foreground`)
  - Status pill overlaid on the avatar's bottom-left corner (amber = pending, green = accepted, red = rejected)
  - `⋮` overflow menu (top-right of card) → action sheet (`modalDefault`) with: View profile, View resume, Accept (accent), Reject (danger)
  - Decided applications: sheet shows only View profile / View resume; status pill remains; no accept/reject
- `Skeleton` rows for loading; `emptyState` ("No applications yet")
- Status `Badge` (pending/accepted/rejected)

**Layout**
- Header (back) + segmented tabs + vertical list of `applicantCard`s

**Micro-interactions**
- Accept: tap in sheet → sheet switches to an inline confirm ("Accept [username]?" → Confirm/Cancel) before firing — creates group membership server-side, irreversible from this screen
- Reject: fires directly from the sheet (no extra confirm)
- View resume: single action that opens the file (external viewer / in-app PDF viewer)
- View profile: links to Profile.Other (screen not yet built — navigation wired when it exists)
- Row-level loading: sheet actions disabled + spinner while in flight; other rows stay interactive

## 7. Apply List / Detail / Submit / Success

**Components**
- `cardProjectCompact` with status badges in Apply.List
- `emptyState` + `Skeleton` for states
- Submit form: resume (`FilePicker` placeholder) + cover (`Textarea`)
- Success state with confirmation block

**Micro-interactions**
- Submit disabled until resume attached
- Status transitions reflected in Apply.List badges
