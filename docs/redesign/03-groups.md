# Groups — Redesign Plan

> Visual redesign guide for the Groups flow in `docs/design.pen`.
> Each screen entry covers: **References**, **Components**, **Layout**, **Micro-interactions**, **Forgd Visual Notes**.
> Status tracking lives in `00-screen-checklist.md`.

## 1. List (+ Empty)

**Components**
- `cardGroupDefault` (name, description, member count)
- Progress bar on joined groups
- `StatusIndicator` (online/offline)
- `emptyState` for empty state

## 2. Detail

**Components**
- `Progress` (% complete toward goal)
- Entry rows with category icon
- Member avatar row (`AvatarGroup`)
- Buttons: open chat, join/leave

## 3. Create

**Components**
- `Input` name, `Textarea` description
- Members section using `listItemWithAvatar` + add/remove
- Primary create button

## 4. Members

**Components**
- `listItemWithAvatar` rows
- `Badge` for admin role
- Remove member action (admin only)

## 5. Tasks

**Components**
- `Checkbox` items
- `Badge` for status/label
- Assignee `Avatar` on each row
- `SegmentedControl` / `Tabs` (open / done)

## 6. Issues + Thread (+ Empty)

**Components**
- Issue list rows (`listItemDefault`)
- Thread: comment rows with `Avatar`, `Input` composer
- `emptyState` when no threads

## 7. Chat (+ Reconnecting)

**References**
- [AniUI Chat Block](https://www.aniui.dev/blocks/chat)
- [RNR auth blocks — connection handling pattern](https://reactnativereusables.com/docs/blocks/authentication)

**Components**
- `ChatBubble` (own / other alignment)
- `TypingIndicator`
- `Input` composer
- Reconnecting state: status pill with pulse

## 8. Invite

**Components**
- `SearchBar`
- Result rows (`listItemWithAvatar`) + Add button
- Invited confirmation state

## Cross-cutting

- Tokenize all colors; instantiate components; keep dark base + weld-orange accent.
