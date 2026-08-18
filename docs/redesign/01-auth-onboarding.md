# Auth & Onboarding — Redesign Plan

> Visual redesign guide for the Auth & Onboarding flow in `docs/design.pen`.
> Each screen entry covers: **References**, **Components**, **Layout**, **Micro-interactions**, **Forgd Visual Notes**.
> See `00-screen-checklist.md` for status tracking.

## 1. Sign In

**References**
- [AniUI Login Block](https://www.aniui.dev/blocks/login)
- [RNR Sign In Form](https://reactnativereusables.com/docs/blocks/authentication#sign-in-form)

**Components**
- `Input` with leading mail icon (left)
- `PasswordInput` with eye-toggle
- `InputGroup` (vertical stack, unified spacing)
- `Button` — primary (large) + outline (social)
- `Label`, `Divider`, `Text` (muted), `Link`

**Layout**
- Centered logo at top (rounded square, weld-orange bg, lucide `cpu` icon)
- Title: "Welcome back" (Display 28/700, centered)
- Subtitle: "Sign in to your account" (muted, centered)
- Email field (icon left, placeholder "name@example.com")
- Password field with label row: label left + "Forgot password?" link right
- Primary "Sign In" button, full-width, tall (48–52px)
- Divider: "or continue with" with hairline separators both sides
- Social row: Google outline button full-width (Apple only if it enters V1 scope)
- "Don't have an account? Sign up" link centered, generous top margin
- Footer microcopy: Terms / Privacy links, small and muted

**Micro-interactions**
- Button disabled until fields are valid
- Inline error message below the offending field
- Spinner inside button while authenticating
- Eye-toggle flips icon (eye/eye-off) on password field

**Forgd Visual Notes**
- Dark neutral base, weld-orange accent, geometric Inter type
- Not "enterprise" — friendly and maker-flavored

## 2. Sign Up

**References**
- [AniUI Sign Up Block](https://www.aniui.dev/blocks/signup)
- [RNR Sign Up Form](https://reactnativereusables.com/docs/blocks/authentication#sign-up-form)

**Components**
- `InputGroup`: name (optional), email, college (optional), password, confirm password
- `PasswordInput` ×2 (password + confirm)
- `Button` — primary "Create account", full-width
- Social divider + Google outline button (same as Sign In)
- Link: "Already have an account? Sign in"
- Inline `Error` message components

**Layout**
- Mirrors Sign In structure; only field order/labels differ
- Title: "Join Forgd" / subtitle "Start building your next project"
- Consistent vertical rhythm (16–24px gaps), fields stacked full-width

**Micro-interactions**
- Inline validation: weak password, password mismatch, email already registered
- Disabled button until form is valid

**Forgd Visual Notes**
- Same identity as Sign In; optional fields visually marked (not starred)

## 3. Forgot Password

**References**
- [AniUI Forgot Password Block](https://www.aniui.dev/blocks/forgot-password)
- [RNR Forgot Password Form](https://reactnativereusables.com/docs/blocks/authentication#forgot-password-form)

**Components**
- `Input` (email, mail icon)
- `Button` — primary "Send reset link"
- Instructional copy, inline success/error states
- "Back to sign in" link

**Layout**
- Smaller logo / condensed branding block
- Title: "Recover access"
- One-line description: "Enter your email and we'll send you a reset link."
- Single-action form, centered column

**Micro-interactions**
- Success feedback after send (screen swaps to success state)
- Error if email not registered

**Forgd Visual Notes**
- Focused, minimal — one field, one button

## 4. Verify Email

**References**
- [RNR Verify Email Form](https://reactnativereusables.com/docs/blocks/authentication#verify-email-form)
- [AniUI Input OTP](https://www.aniui.dev/docs/input-otp)

**Components**
- `InputOTP` — 6-digit boxes (~32×44px), focus ring on active box
- "Resend code" link with countdown timer
- Primary button "Verify"
- Inline success/error states

**Layout**
- Icon or illustration block at top
- Title: "Check your email"
- Description with the destination email highlighted
- OTP row centered, generous spacing
- Resend line below the OTP row

**Micro-interactions**
- Auto-advance between boxes
- Error shake/inline message on wrong code
- Resend disabled while countdown runs

**Forgd Visual Notes**
- Weld-orange focus state on the active box

## 5. Onboarding (3 screens)

**Reference**
- [AniUI Onboarding Block](https://www.aniui.dev/blocks/onboarding)

**Components**
- Illustration block (SVG, maker/hardware vibe)
- Title + subtitle, centered
- Progress dots (always visible, active dot highlighted)
- Primary CTA button ("Continue" / "Get started")
- "Skip" text link top-right (discreet)

**Layout**
- Illustration at top (2/3 height), copy + controls below
- One message per screen (short, benefit-led)
- CTA full-width near bottom, dots above it

**Micro-interactions**
- Skip jumps straight to auth
- Last screen CTA becomes "Get started" and routes to Sign Up

**Forgd Visual Notes**
- Playful, illustrated, warm — sets the maker tone before login

## 6. Choose Interests

**References**
- Chips from AniUI component set
- Keeps current structure

**Components**
- `Chip` grid (single-select or multi-select)
- Primary "Continue" button
- Title + subtitle

**Layout**
- Title: "What are you interested in?"
- 2-column chip grid (Electronics, Electrical, Mechanical, IoT, AI/ML, Civil, Aerospace, Chemical, General)
- Continue disabled until at least one chip selected

**Micro-interactions**
- Chip toggle feedback (selected state = weld-orange subtle bg + accent text)

## 7. Minor screens (Splash, SignOut, Terms, Privacy)

- **Splash**: keep minimal — logo + wordmark on background, nothing else.
- **SignOut**: keep existing confirm modal ("Sign Out" title, destructive "Log Out", Cancel). Only tokenize colors.
- **Terms / Privacy**: keep text screens; tokenize colors and align header to `navHeaderDefault` if present.

## Cross-cutting rules

1. All fills/strokes → shadcn-named variables mapped to the Forgd palette (no raw hex except Google logo).
2. Every control uses a Component Library component; create the missing ones first (e.g. `InputOTP`, `PasswordInput`, `Divider`, `Link`).
3. Follow AniUI/RNR vertical rhythm, centered alignment, generous whitespace.
4. Dark neutral base, weld-orange accent, geometric type, playful-not-corporate.
