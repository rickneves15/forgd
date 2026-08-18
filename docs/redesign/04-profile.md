# Profile & Settings — Redesign Plan

> Visual redesign guide for the Profile & Settings flow in `docs/design.pen`.
> Each screen entry covers: **References**, **Components**, **Layout**, **Micro-interactions**, **Forgd Visual Notes**.
> Status tracking lives in `00-screen-checklist.md`.

## 1. Main / Other

**References**
- [AniUI Profile Block](https://www.aniui.dev/blocks/profile)

**Components**
- `Avatar` (photo/initials)
- `StatCard` row (projects, recognition, groups)
- `Badge` for domain/role
- Bio `Text`
- Edit button on Main (hidden on Other)
- Tab/list navigation to Projects / Publications / Bookmarks

**Layout**
- Hero block: avatar centered/left, name, handle, college, badges
- Stats row: 3 `StatCard`s
- Content list below

## 2. Edit

**Components**
- `Avatar` with edit trigger (upload placeholder)
- `Input` name, handle, college
- `Textarea` bio
- Save button (`btnPrimary`)

**Micro-interactions**
- Save disabled until valid; success toast on save

## 3. Projects Active / Done / Empty

**Components**
- `cardProjectCompact` list
- Status filter (`SegmentedControl`)
- `emptyState` when none

## 4. Publications (+ Empty)

**Components**
- Publication rows (`listItemDefault`)
- `emptyState` when none

## 5. Bookmarks

**Components**
- `cardProjectCompact` list of saved projects
- Un-bookmark action per row

## 6. Settings Main / Feedback / DeleteAccount

**References**
- [AniUI Settings Block](https://www.aniui.dev/blocks/settings)

**Components**
- `listItemDefault` rows with icon + chevron (profile, notifications, privacy, about)
- `Switch` for notification toggles
- Feedback: `Textarea` + submit
- DeleteAccount: `alertDialog` / confirm modal (destructive)

**Micro-interactions**
- Switch toggles persist immediately
- Delete requires explicit destructive confirmation

## Cross-cutting

- Tokenize all colors; instantiate components; keep dark base + weld-orange accent.
