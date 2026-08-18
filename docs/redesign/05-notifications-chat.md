# Notifications & Chat/DM — Redesign Plan

> Visual redesign guide for Notifications and direct-message Chat in `docs/design.pen`.
> Each screen entry covers: **References**, **Components**, **Layout**, **Micro-interactions**, **Forgd Visual Notes**.
> Status tracking lives in `00-screen-checklist.md`.

## 1. Notifications List (+ Loading, + Empty)

**Reference**
- [AniUI Notifications Block](https://www.aniui.dev/blocks/notifications)

**Components**
- `navHeaderDefault`
- `SegmentedControl` (General / Applications)
- Notification rows (`listItemDefault`) with icon + unread dot
- `Skeleton` for loading
- `emptyState` for empty

**Layout**
- Header, segmented filter, vertical list
- Unread items: dot + subtle accent bg; read items muted

## 2. Notifications Detail

**Components**
- Notification card (icon, title, body, time)
- Related action button when applicable (e.g. "View application")

## 3. Chat / DM List (+ Loading, + Empty)

**References**
- [AniUI Chat Block](https://www.aniui.dev/blocks/chat)

**Components**
- `listItemWithAvatar` rows (avatar, name, message preview, time, unread `Badge`)
- `Skeleton` for loading
- `emptyState` for empty

**Layout**
- Vertical list of conversations, unread count badge on the right

## 4. Chat / DM Detail

**References**
- [AniUI Chat Block](https://www.aniui.dev/blocks/chat)
- RNR realtime-connection pattern (see CONTEXT: DMs share the Group Chat connection handling)

**Components**
- `ChatBubble` (own / other)
- `TypingIndicator`
- `Input` composer
- Connection status pill (reconnecting/offline)

**Micro-interactions**
- Typing indicator while peer types
- Failed send shows retry affordance

## Cross-cutting

- Tokenize all colors; instantiate components; keep dark base + weld-orange accent.
