# Forgd — Style Guide

## forgd/docs/style-guide.md

> Visual + brand reference for anyone (or any tool — Pencil, opencode, a future designer) building Forgd screens. Pairs with `redesign/` for screen-specific notes; this file is the cross-cutting source of truth for look & feel.

---

## 1. Brand

- **Name:** Forgd — always this exact casing (lowercase 'g', no "Forge", no "The Forgd"). As a verb in copy it's fine lowercase ("forgd your next project"); as the app name it's capitalized ("Welcome to Forgd").
- **No logo/wordmark designed yet.** Until one exists, use a simple text wordmark: app name in the heading typeface (see §3), weight 700, letter-spacing slightly tightened (-1%).
- **One-line description** (for app store listings, splash screens, etc.): "Find your next hardware project, build it with a team."
- **Tone of voice:** direct, plain, a little informal — like a capable classmate, not a corporate SaaS product. Avoid exclamation-heavy marketing copy ("Unlock your potential!!"). Prefer short, concrete sentences. Error messages state what happened and what to do next, nothing cute.

## 2. Color

Dark, minimal base + one warm accent — "maker/hobby meets minimalist," not corporate-neutral.

| Token | Hex | Usage |
|---|---|---|
| `bg-base` | `#121212` | Screen background (near-black graphite, never pure `#000`) |
| `bg-surface` | `#1C1C1E` | Cards, sheets, input backgrounds |
| `bg-surface-raised` | `#242426` | Modals, elevated sheets (Filter, Invite member) |
| `border-subtle` | `#2E2E30` | Card/input borders, dividers |
| `text-primary` | `#F2F2F2` | Headings, primary body text |
| `text-secondary` | `#9B9B9E` | Metadata (dates, college names, muted labels) |
| `text-disabled` | `#5C5C5E` | Disabled states |
| **`accent` (weld-orange)** | `#FF6B35` | Primary buttons, active/selected states, links, unread indicators |
| `accent-pressed` | `#E85A28` | Pressed/active state of accent elements |
| `accent-subtle-bg` | `#FF6B3520` (15% opacity) | Selected chip backgrounds, subtle highlight fills |
| `success` | `#4CAF7D` | Accepted application, task done, success toasts |
| `danger` | `#E5484D` | Delete account, reject application, destructive confirms — used sparingly, never as a whole-screen tint |
| `warning` | `#E8A23D` | Non-destructive cautions (rarely needed in V1) |

Secondary department/topic tag chips may use additional muted hues (desaturated blue, green, purple) for visual variety in feed cards — but **the accent orange is reserved for actions and selection state only**, never used decoratively on a tag chip, or it loses meaning.

## 3. Typography

- **Typeface:** a geometric sans — **Inter** as the default choice (free, excellent variable-weight support, wide language coverage). Manrope or Sora are acceptable alternatives if a different personality is wanted later. **Not monospace** — that reads as "IDE," which is one notch too technical for the maker/hobby half of the visual direction.
- **Scale:**

| Style | Size | Weight | Usage |
|---|---|---|---|
| Display | 28px | 700 | Screen titles ("Sign in", "Choose your interests") |
| Heading | 20px | 600 | Section headers, card titles (project title in feed) |
| Body | 15px | 400 | Default body text, descriptions |
| Body strong | 15px | 600 | Emphasized inline text, button labels |
| Caption | 13px | 400 | Metadata, timestamps, secondary labels |
| Micro | 11px | 500 | Tags/chips, badge counts |

- Line height: 1.4× for body/caption, 1.2× for display/heading.

## 4. Shape & Spacing

- **Corner radius:** 8px for inputs/small controls, 12px for cards/sheets, 20px for the bottom-sheet top corners (Filter, Invite member). Avoid fully sharp (0px) and avoid fully pill-shaped (999px) — both read as either too harsh or too soft for the intended tone.
- **Spacing scale (px):** 4, 8, 12, 16, 24, 32, 48 — use these steps only, don't introduce arbitrary values.
- **Screen padding:** 16px horizontal margin as the default for all screens.
- **Card padding:** 16px internal padding, 12px gap between stacked cards in a list.

## 5. Iconography

- Simple line icons (1.5-2px stroke), not filled/glyph-style, not skeuomorphic. A set like **Lucide** (open-source, matches React Native ecosystem well via `lucide-react-native`) is a good default.
- Exception: the **Google "G" logo** stays full-color per Google's brand requirements — every other icon in the app follows the line-icon system.
- Icon size: 20px inline (list rows, buttons), 24px for tab bar icons, 16px for inline micro-badges (unread dots, etc.).

## 6. Components (patterns, not exhaustive)

- **Primary button:** accent-orange background, `text-primary`-on-dark label (actually near-black text on the orange for contrast — check contrast ratio, likely `#1C1C1E` text on `#FF6B35` bg), 12px radius, 48px height.
- **Secondary button (e.g. Google sign-in):** `bg-surface` background, 1px `border-subtle` border, icon + label.
- **Chips (filter tags, interests):** unselected = `bg-surface` + `border-subtle`; selected = `accent-subtle-bg` background + `accent` text/border.
- **Cards (project cards, group cards):** `bg-surface`, `border-subtle` 1px border, 12px radius, no drop shadow (shadows read as "light mode" — on a dark base, use a subtle 1px lighter border instead of elevation shadow to differentiate surfaces).
- **Progress bar (Group % complete):** track = `bg-surface`, fill = `accent`, 6px height, fully rounded ends.
- **Empty states:** icon (line-style, `text-secondary` color) + one-line message + optional single action button. Reused across Projects feed / Bookmark / Notifications / Chat / DM / Applications-admin (see `redesign/00-screen-checklist.md`).

## 7. Motion (light touch, not a full animation spec)

- **Regard button:** small scale-pulse (e.g. 1 → 1.15 → 1 over ~200ms) on tap — the one deliberately "fun/maker" micro-interaction called out in Redesign 04.
- **Chat/DM reconnecting state:** a subtle, slow pulse or fade on a small status pill, not a spinner — a spinner implies "loading," reconnecting is a background state, not a blocking one.
- Standard screen transitions: whatever Expo Router provides by default — no custom transition work planned for V1.

## 8. What NOT to do

- No drop shadows (dark-mode elevation = borders, not shadows — see §6).
- No monospace type anywhere in the product UI.
- No decorative use of the accent color outside actions/selection state.
- No stock-photo-style imagery — the only images in the app are user-uploaded project photos; don't add illustrated hero graphics beyond the one shared empty-state icon set.
