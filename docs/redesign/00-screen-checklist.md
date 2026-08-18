# Screen Checklist

> Master inventory of every screen in `docs/design.pen` and its redesign status.
> Status legend: `pending` (not touched) · `review` (draft done, waiting on Rick) · `approved` (signed off) · `skipped` (no change needed).
>
> V2 rebuild approach: new screens are built from scratch as fresh layers named `Screen/V2.*`, kept alongside the originals (never edit originals in place).
>
> Design System (node `YEJvP`, "Forgd — Token Reference v2.0") and Component Library (node `YiHsp`, "Forgd — Production Design System") rebuilt 2026-08-13: all swatches/components tokenized to `$var` refs, text ramp aligned to `$foreground`/`$muted-foreground`/`$placeholder`/`$primary-foreground`, semantic `-foreground` pairs, `*-subtle` tokens added (success/warning/destructive/info), buttons 12px radius, cards + 1px `$border` stroke. AUTH section added with reusable `logoMark`, `buttonPrimary`, `divider`, `inputEmail`, `inputPassword`, `googleButton` (instances `googleIcon`, which now carries the Google logo paths). CHAT section added 2026-08-14 with reusable `chatBubbleDefault` (sender / bubble `$input` radius12 / text / time) and `typingIndicatorDefault` (pill `$input` with 3 dots + "is typing") — used by Groups.Chat screens and reserved for Chat/DMs. PROFILE section rebuilt 2026-08-15: 12 screens Profile & Settings (`Screen/V2.*`, chain to the right of Notifications at y=-350) using `listItemWithSubtitle`, `listItemDefault`, `cardProjectDefault`, `inputText`, `inputTextareaField`, `emptyState`, `btnDangerMedium`, `btnSecondaryMedium`; Settings.Main destructive rows use `$destructive-subtle` + `$destructive` stroke (no btnDanger row exists in the library). HOME section added 2026-08-15: 4 screens (`Screen/V2.Home*`) with personalized feed (HomeHeader, NotificationBanner, SectionHeader, ActivityBlock, PersonCard components); `navBottomTab` updated to 4 tabs (Home, Projects, Group, Profile).
>
> Reference keys — the two libraries we use as visual patterns:
> - **AniUI blocks**: [aniui.dev/blocks](https://www.aniui.dev/blocks) (Login, Sign Up, Forgot Password, Home, Bottom Tabs, Drawer Nav, Profile, Settings, Onboarding, Chat, Product List, Product Detail, Notifications, Pricing, Search)
> - **RNR auth blocks**: [reactnativereusables.com/docs/blocks/authentication](https://reactnativereusables.com/docs/blocks/authentication) (Sign in, Sign up, Verify email, Reset/Forgot password, Social connections)

## Cross-cutting rules (apply to every screen)

1. **Colors only**: layout may change and components may be added, but spacing/typography stay concrete — only fills/strokes become variables.
2. **Tokenization**: every fill/stroke uses a shadcn-named variable mapped to the Forgd palette. No raw hex except brand assets (Forgd logo, Google logo).
3. **Component-first**: screens instantiate components from the Component Library (create the component if missing, then instance it). No duplicated raw geometry.
4. **Identity**: dark neutral base, weld-orange accent, geometric type — playful/maker, never "corporate".

---

## Auth & Onboarding

| Screen | Status | Reference | Notes |
|---|---|---|---|
| Auth.Splash | review | RNR + logoMark | V2 layer `Screen/V2.Auth.Splash`; logoMark ref 96 + "Forgd" 32/700 + "Hardware Collaboration Platform" $muted-foreground |
| Auth.Onboarding.1 | review | AniUI Onboarding | V2 layer `Screen/V2.Auth.Onboarding.1`; illustration block ($muted, circuit-board accent 64) + título 28/700 + dots (pill accent ativo) + buttonPrimary h48 "Continue", Skip top-right |
| Auth.Onboarding.2 | review | AniUI Onboarding | V2 layer `Screen/V2.Auth.Onboarding.2`; users icon, "Build Together", dots dot2 ativo, buttonPrimary "Continue", Skip top-right |
| Auth.Onboarding.3 | review | AniUI Onboarding | V2 layer `Screen/V2.Auth.Onboarding.3`; zap icon, "Get Started", dots dot3 ativo, buttonPrimary "Get started", Skip top-right + "Already have an account? Sign In" |
| Auth.ChooseInterests | review | AniUI chips | V2 layer `Screen/V2.Auth.ChooseInterests`; grid 2 col `tagSelected` (Electronics) + 8 `tagDefault` h36, "What are you interested in?" 24/700, Skip, buttonPrimary h48 "Continue" |
| Auth.ChooseInterests.Disabled | review | AniUI chips | V2 layer `Screen/V2.Auth.ChooseInterests.Disabled`; 9 chips `tagDefault` (nenhum selecionado), btnPrimaryDisabled h48 "Continue" |
| Auth.SignIn | review | AniUI Login + RNR Sign in | V2 layer `Screen/V2.Auth.SignIn` built from scratch; refactored to component instances (logoMark, inputEmail, inputPassword, buttonPrimary, divider, googleButton) |
| Auth.SignIn.Loading | review | AniUI Login | V2 layer `Screen/V2.Auth.SignIn.Loading`; btnPrimaryLoading h48 "Signing in…", fields prefilled |
| Auth.SignIn.Error | review | AniUI Login | V2 layer `Screen/V2.Auth.SignIn.Error`; alertError banner + prefilled fields |
| Auth.SignIn.Success | review | AniUI Login | V2 layer `Screen/V2.Auth.SignIn.Success`; alertSuccess banner + prefilled fields |
| Auth.SignIn.Disabled | review | AniUI Login | V2 layer `Screen/V2.Auth.SignIn.Disabled`; btnPrimaryDisabled h48, empty fields |
| Auth.SignIn.Offline | review | AniUI Login | V2 layer `Screen/V2.Auth.SignIn.Offline`; warning offline banner (wifi-off) + btnPrimaryDisabled |
| Auth.SignUp | review | AniUI Sign Up + RNR Sign up | V2 layer `Screen/V2.Auth.SignUp` built from scratch; title "Join Forgd", username/email/college/password/confirm via `inputText`/`inputEmail`/`inputPassword`, live password checklist (`passwordChecklist`), buttonPrimary h48 "Create account", divider + googleButton, "Already have an account? Sign in", terms 2-line balanced |
| Auth.SignUp.Loading | review | AniUI Sign Up | V2 layer `Screen/V2.Auth.SignUp.Loading`; btnPrimaryLoading h48 "Creating account…", fields prefilled, checklist $success |
| Auth.SignUp.Error | review | AniUI Sign Up | V2 layer `Screen/V2.Auth.SignUp.Error`; alertError banner top + username inline error "$destructive" + prefilled fields; gaps tightened (formCol 6, main 8) to fit |
| Auth.SignUp.Success | review | AniUI Sign Up | V2 layer `Screen/V2.Auth.SignUp.Success`; alertSuccess banner bottom + prefilled fields |
| Auth.SignUp.Disabled | review | AniUI Sign Up | V2 layer `Screen/V2.Auth.SignUp.Disabled`; btnPrimaryDisabled h48, empty fields (default placeholders), checklist muted |
| Auth.SignOut | review | RNR + btnDangerMedium + btnSecondaryMedium | V2 layer `Screen/V2.Auth.SignOut`; confirm modal tokenized — overlay 0.6, $card modal, ícone 56 $destructive (log-out), título 20/700, msg $muted-foreground, ações `btnDangerMedium` "Log Out" + `btnSecondaryMedium` "Cancel" (fill_container h44) |
| Auth.ForgotPassword | review | AniUI Forgot Password + RNR Forgot | V2 layer `Screen/V2.Auth.ForgotPassword`; condensed mark (logoMark 48) + "Recover access" 28/700 + subtitle, `inputEmail` + buttonPrimary h48 "Send reset link", backLink footer (arrow-left + "Back to sign in") |
| Auth.ForgotPassword.Loading | review | AniUI Forgot Password | V2 layer `Screen/V2.Auth.ForgotPassword.Loading`; btnPrimaryLoading h48 "Sending reset link…", email prefilled |
| Auth.ForgotPassword.Error | review | AniUI Forgot Password | V2 layer `Screen/V2.Auth.ForgotPassword.Error`; alertError "Couldn't send reset link." + email inline error "No account found with that email." + field $destructive |
| Auth.ForgotPassword.Disabled | review | AniUI Forgot Password | V2 layer `Screen/V2.Auth.ForgotPassword.Disabled`; btnPrimaryDisabled h48 "Send reset link", email empty |
| Auth.ForgotPassword.Success | review | RNR Forgot | V2 layer `Screen/V2.Auth.ForgotPassword.Success`; check block 64 (primary) + "Check your email" + desc with email + resend row ("Didn't receive it? Resend") + buttonPrimary h48 "Back to Sign In" |
| Auth.VerifyEmail | review | RNR Verify email + AniUI Input OTP | V2 layer `Screen/V2.Auth.VerifyEmail`; OTP flow replaces V1 link flow; condensed mark + "Check your email" 28/700 + desc with email highlighted (2 lines); new `inputOTP` component (6 boxes 44×48, focus $primary, otpError inline); resend row + buttonPrimary h48 "Verify"; backLink footer |
| Auth.VerifyEmail.Loading | review | RNR Verify email | V2 layer `Screen/V2.Auth.VerifyEmail.Loading`; OTP filled 4 8 2 9 0 6, btnPrimaryLoading "Verifying…", resend muted |
| Auth.VerifyEmail.Error | review | RNR Verify email | V2 layer `Screen/V2.Auth.VerifyEmail.Error`; all boxes $destructive + otpError "That code didn't work. Try again." |
| Auth.VerifyEmail.Disabled | review | RNR Verify email | V2 layer `Screen/V2.Auth.VerifyEmail.Disabled`; OTP empty no focus, btnPrimaryDisabled "Verify", resend shows countdown "Resend code in 30s" |
| Auth.Terms | review | RNR + navHeaderWithBack | V2 layer `Screen/V2.Auth.Terms`; header = `navHeaderWithBack` ref (title "Terms of Service"), content V1 texto tokenizado ($foreground headings / $muted-foreground body), 5 seções, scroll |
| Auth.Privacy | review | RNR + navHeaderWithBack | V2 layer `Screen/V2.Auth.Privacy`; header = `navHeaderWithBack` ref (title "Privacy Policy"), content V1 texto tokenizado, 5 seções, scroll |

## Home Feed

| Screen | Status | Reference | Notes |
|---|---|---|---|
| Home | review | — | V2 layer `Screen/V2.Home`; **2026-08-15: new** — HomeHeader (avatar 40 `$primary` DS + greeting + bell badge) + NotificationBanner `$info-subtle` + "Suggested for you" 2× cardProjectDefault + "Recent activity" 4× ActivityBlock (icon circle + text + timestamp) + "People you may know" 2× PersonCard + "Your bookmarks" 1× cardProjectDefault + navBottomTab (Home active); feed scrollável, conteúdo extende além de 812 |
| Home.Loading | review | — | V2 layer `Screen/V2.Home.Loading`; **2026-08-15: new** — HomeHeader + 3× cardSkeletonDefault (h140) + 3× activity skeleton (circle 32 + rectangles) + navBottomTab |
| Home.Empty | review | — | V2 layer `Screen/V2.Home.Empty`; **2026-08-15: new** — HomeHeader + emptyState "Nothing here yet" + buttonPrimary "Browse Projects" + navBottomTab |
| Home.Error | review | — | V2 layer `Screen/V2.Home.Error`; **2026-08-15: new** — HomeHeader + alertError "Couldn't load your feed" + buttonPrimary "Try again" + navBottomTab |

## Projects & Apply

| Screen | Status | Reference | Notes |
|---|---|---|---|
| Projects.Home | review | AniUI Home + Product List | V2 layer `Screen/V2.Projects.Home`; navHeaderDefault + inpSearchDefault (h44) + filter trigger 44 `$input` + chips (tagSelected "All" + tagDefault) + feed 4× cardProjectDefault (4º parcial = scroll) + navBottomTab |
| Projects.Home.Loading | review | AniUI Skeleton | V2 layer `Screen/V2.Projects.Home.Loading`; header + search + 3× cardSkeletonDefault + navBottomTab |
| Projects.Home.Empty | review | AniUI Empty State | V2 layer `Screen/V2.Projects.Home.Empty`; header + search + chips + emptyState ref (titulo "No projects yet" / CTA "Create Project") + navBottomTab |
| Projects.Home.Error | review | AniUI Error | V2 layer `Screen/V2.Projects.Home.Error`; **2026-08-14: new** — header + search + chips + centered alertError banner "Couldn't load projects…" + primary "Try again" + navBottomTab |
| Projects.Detail | review | AniUI Product Detail | V2 layer `Screen/V2.Projects.Detail`; navHeaderWithBack (w220) + bookmark/share, galeria 180 `$card` + dots, badgeDefault `$primary` "Electronics" + badgeSuccess "2 spots left", title/desc, meta (users/calendar), collabCard (Stipend $300 / month accent), downloads, apply bar `$card` + buttonPrimary "Apply Now" |
| Projects.Detail.Loading | review | AniUI Skeleton | V2 layer `Screen/V2.Projects.Detail.Loading`; header + galeria `$muted` 180 + barras skeleton |
| Projects.Detail.Error | review | AniUI Error | V2 layer `Screen/V2.Projects.Detail.Error`; **2026-08-14: new** — header + centered alertError banner "Couldn't load this project…" + primary "Try again"; apply bar disabled (no action in error state) |
| Projects.Detail.Error.NotFound | review | AniUI Error | V2 layer `Screen/V2.Projects.Detail.Error.NotFound`; **2026-08-14: new** — header (back) + centered search-x icon + "This project isn't available anymore" + outline "Go back" (no retry, per APP-08 404) |
| Projects.Detail.Portfolio | review | AniUI Product Detail | V2 layer `Screen/V2.Projects.Detail.Portfolio`; sem collabCard/apply, + badge "Completed" + owner row |
| Projects.Search | review | AniUI Search | V2 layer `Screen/V2.Projects.Search`; header back + inpSearchDefault, "RECENT" + 3 rows (history icon), 3× cardProjectCompact (badge/stipend/title/meta) |
| Projects.Search.Loading | review | AniUI Skeleton | V2 layer `Screen/V2.Projects.Search.Loading`; **2026-08-14: new** — header + 3× cardSkeletonDefault (h140, **fix overflow — conteúdo intrínseco 140**) |
| Projects.Search.Empty | review | AniUI Empty State | V2 layer `Screen/V2.Projects.Search.Empty`; **2026-08-14: new** — header + emptyState ref (search icon, "No results found", CTA hidden) |
| Projects.Search.Error | review | AniUI Error | V2 layer `Screen/V2.Projects.Search.Error`; **2026-08-14: new** — header + centered alertError banner "Couldn't search projects…" + primary "Try again" |
| Projects.Filter | review | — | V2 layer `Screen/V2.Projects.Filter`; bottom sheet $card radius top 20 + overlay 0.5, DEPT chips (tagSelected Electronics), TOPIC chips, STIPEND slider ($0–$300, $primary fill) + scale, "Has openings" + switchOn, buttonPrimary "Apply Filters" |
| Projects.AddProject | review | — | V2 layer `Screen/V2.Projects.AddProject`; navHeaderWithBack + icon circle (hammer) + 2 info cards (Portfolio only / Open opportunity) + buttonPrimary "Create Project" |
| Projects.Create.Step1 | review | — | V2 layer `Screen/V2.Projects.Create.Step1`; navHeaderWithBack "Step 1 of 5: Basic Info" + stepper (5 dots) + inpTextDefault (Title) + inpTextareaDefault (Description) + **2026-08-14: bottom button bar removed** — auto-advance on valid + swipe nav + swipe glyph base |
| Projects.Create.Step2 | review | — | V2 layer `Screen/V2.Projects.Create.Step2`; stepper + upload block (image-plus) + 3 thumbnails + **2026-08-14: no buttons** — auto-advance (~600ms debounce) after ≥1 attachment |
| Projects.Create.Step3 | review | — | V2 layer `Screen/V2.Projects.Create.Step3`; stepper + chips domain (tagSelected Electronics) + **2026-08-14: no buttons** — auto-advance on selection |
| Projects.Create.Step4 | review | — | V2 layer `Screen/V2.Projects.Create.Step4`; stepper + openings/stipend inputs + duration chips + note portfolio-only + **2026-08-14: swipe-only advance** + caption "Optional — swipe to continue" |
| Projects.Create.Step5 | review | — | V2 layer `Screen/V2.Projects.Create.Step5`; stepper + review card (rows label/value) + **2026-08-14: single full-width "Create Project" button** (Back/Continue pair removed), disabled while uploads pending |
| Projects.Create.Success | review | — | V2 layer `Screen/V2.Projects.Create.Success`; check circle $success + title + buttonPrimary "Go to Project" |
| Projects.Applicants | review | — | V2 layer `Screen/V2.Projects.Applicants`; **2026-08-14: rebuilt** — tabsSegmentedDefault (Pending/All) + 1 `applicantCard` per applicant (avatar + name + school below + status pill on avatar corner + ⋮ top-right → action sheet: View profile / View resume / Accept / Reject; decided rows show only View profile/View resume; accept has inline sheet confirm) |
| Projects.Applicants.Loading | review | AniUI Skeleton | V2 layer `Screen/V2.Projects.Applicants.Loading`; **2026-08-14: new** — header + tabs + 3× cardSkeletonDefault (h140, **fix overflow — conteúdo intrínseco 140**) |
| Projects.Applicants.Empty | review | AniUI Empty State | V2 layer `Screen/V2.Projects.Applicants.Empty`; **2026-08-14: new** — header + tabs + emptyState ref (users icon, "No applications yet", CTA hidden) |
| Projects.Applicants.Error | review | AniUI Error | V2 layer `Screen/V2.Projects.Applicants.Error`; **2026-08-14: new** — header + tabs + centered alertError banner "Couldn't load applications…" + primary "Try again" |
| Projects.Admin | review | — | V2 layer `Screen/V2.Projects.Admin`; owner card (avatar+name+Contact btnSecondaryMedium), details card (Created/Status badgeSuccess/Openings/Stipend/Duration), controls card (2 switches), listItemWithAction "View applicants" |
| Apply.List | review | — | V2 layer `Screen/V2.Apply.List`; **2026-08-14: rebuilt** — navHeaderWithBack "My Applications" + inpSearchDefault + filter + tabsSegmentedDefault (Pending/All) + 3× cardProjectCompact com status badge (warning Pending / success Accepted / error Rejected) e meta (calendar + college · Applied date, rel time no slot stipend) |
| Apply.List.Loading | review | AniUI Skeleton | V2 layer `Screen/V2.Apply.List.Loading`; **2026-08-14: rebuilt** — header + search + tabs + 3× cardSkeletonDefault (h140, **fix overflow — conteúdo intrínseco 140**) |
| Apply.List.Empty | review | AniUI Empty State | V2 layer `Screen/V2.Apply.List.Empty`; **2026-08-14: rebuilt** — header + search + tabs + emptyState ref (folder-open, "No applications yet", CTA "Explore Projects") centralizado |
| Apply.Detail | review | AniUI Product Detail | V2 layer `Screen/V2.Apply.Detail`; **2026-08-14: rebuilt** — navHeaderWithBack "Application Details" + galeria 180 `$card` + badgeDefault "Electronics" + badgeWarning "Pending" + title/desc/meta (users/clock); barra inferior sem botão: status pill + "Applied Dec 10" (já aplicado) |
| Apply.Submit | review | — | V2 layer `Screen/V2.Apply.Submit`; **2026-08-14: rebuilt** — navHeaderWithBack (nome do projeto) + seção Resume (card `$card` border com file-text + resume_rickneves15.pdf + link "Change" $primary) + inpTextareaDefault "Cover Letter (Optional)" + barra com buttonPrimary "Apply Now" (resume já anexado → habilitado) |
| Apply.Submit.Success | review | — | V2 layer `Screen/V2.Apply.Submit.Success`; **2026-08-14: rebuilt** — check circle 72 `$muted`/`$success` + "Application Sent!" + desc + buttonPrimary "Go to Home" + btnSecondaryMedium "Browse Projects" |

## Groups

| Screen | Status | Reference | Notes |
|---|---|---|---|
| Groups.List | review | — | V2 layer `Screen/V2.Groups.List`; **2026-08-14: rebuilt** — navHeaderDefault "Groups" + plus (create) + 2× cardGroupDefault + status dot $success "Active" + progress bar + preview (rel time) + navBottomTab (Group ativo) |
| Groups.List.Empty | review | AniUI Empty State | V2 layer `Screen/V2.Groups.List.Empty`; **2026-08-14: rebuilt** — navHeaderDefault "Groups" + plus + emptyState ref centralizado (V1 texts) + navBottomTab (Group ativo) |
| Groups.Detail | review | — | V2 layer `Screen/V2.Groups.Detail`; **2026-08-14: rebuilt** — navHeaderWithBack "Group Details" + Progress 67% + 4 entry rows (square-check/triangle-alert/message-square/users, ícone 32 `$bg-surface`) + Last update card |
| Groups.Create | review | — | V2 layer `Screen/V2.Groups.Create`; **2026-08-14: rebuilt** — navHeaderWithBack + 2× inpTextDefault + inpTextareaDefault (V1 texts incl. rótulos "Email" duplicados) + Add Members + **btnSecondaryMedium "Add Members"** (abre o sheet) + 2× listItemWithAvatar (DS/David Smith) + buttonPrimary "Create Group" |
| Groups.Create.Members | review | — | V2 layer `Screen/V2.Groups.Create.Members`; **2026-08-14: new** — bottom sheet `$card` radius top 20 + overlay 0.5 + handle + header ("Add Members" + close X) + inpSearchDefault "Search members..." + hint + 6× rows (avatarInitialsMedium colorido + nome + school + checkboxChecked/Unchecked, DS pré-selecionado) + buttonPrimary "Add Members" |
| Groups.Members | review | — | V2 layer `Screen/V2.Groups.Members`; **2026-08-14: rebuilt** — header custom (back + count "6 members" + invite 32) + 3× listItemWithAvatar (DS/David Smith) + **badge admin `$primary-subtle` inline após o nome** (dentro do item) + navBottomTab (Group ativo) |
| Groups.Tasks | review | — | V2 layer `Screen/V2.Groups.Tasks`; **2026-08-14: rebuilt** — header (back + "8 tasks") + tabsSegmentedDefault (Pending/All) + Progress 67% + 3× checkbox items (checked/unchecked) + assignee badge 28 `$info` "ET" + navBottomTab (**fix: body fill_container — nav ancorado no rodapé**) |
| Groups.Issues | review | — | V2 layer `Screen/V2.Groups.Issues`; **2026-08-14: rebuilt** — header (back + plus) + 3× issue rows (dot `$warning` + title + desc `$muted-foreground` — **fix do texto invisível #000000** + comments 3 · 2 days ago) + navBottomTab |
| Groups.Issues.Thread | review | — | V2 layer `Screen/V2.Groups.Issues.Thread`; **2026-08-14: rebuilt** — header (back + "12 comments") + comment row (avatarInitialsMedium "Y" `$primary` + name + text wrap + time) + composer (**input pad [12,12], placeholder com respiro à direita; send 36 na altura do campo**) |
| Groups.Issues.Thread.Empty | review | AniUI Empty State | V2 layer `Screen/V2.Groups.Issues.Thread.Empty`; **2026-08-14: rebuilt** — header (back + "Comments") + emptyState ref centralizado (V1 texts) + composer (**pad fix igual ao Thread**) |
| Groups.Chat | review | AniUI Chat | V2 layer `Screen/V2.Groups.Chat`; **2026-08-14: rebuilt** — header custom (back + título + online dot) + 3× novo componente `chatBubbleDefault` (David Smith / Emily Turner own $primary / James Robinson) + `typingIndicatorDefault` "Emily is typing" + composer (**input pad [12,12]; send 40 na altura do campo**) |
| Groups.Chat.Reconnecting | review | — | V2 layer `Screen/V2.Groups.Chat.Reconnecting`; **2026-08-14: rebuilt** — msgs + pill `$primary-subtle` (wifi-off + "Reconnecting…") + composer (**pad fix igual ao Chat**) |
| Groups.Invite | review | — | V2 layer `Screen/V2.Groups.Invite`; **2026-08-14: rebuilt** — navHeaderWithBack "Invite member" + hint + inpSearchDefault ("Search by username") + result row (avatar JR + james_robinson + sub) + **botão "Add" small (btnPrimarySmall 56×32)** |

## Profile & Settings

| Screen | Status | Reference | Notes |
|---|---|---|---|
| Profile.Main | review | AniUI Profile | V2 layer `Screen/V2.Profile.Main`; **2026-08-15: rebuilt** — navHeaderDefault "Profile" + hero compacto (avatar 80 `$primary` DS + nome + college + 3 stats gap32: 4/Active 36/Completed 573/Reputation) + 3× listItemWithSubtitle (My Projects/My Groups/My Reputation) + 5 rows (Upload resume/Add new project/Bookmark/Settings/Share feedback) + navBottomTab (Profile ativo); hero compacted para caber em 812 |
| Profile.Other | review | AniUI Profile | V2 layer `Screen/V2.Profile.Other`; **2026-08-15: rebuilt enriched** — navHeaderWithBack "Profile" + hero (avatar 64 `$success` R + Robert Clark + college + stats gap24 8/24/312) + **action bar** (buttonPrimary "Message" + btnSecondaryMedium "312 Regards") + **About** card (bio text) + **Interests** chips (Electronics/Robotics/Automation/IoT) + **Badges** horizontal row (5 mini-cards: domain/milestone/achievement/collab) + **Projects** 2× cardProjectDefault + **Groups** horizontal carousel (3 mini-cards: Team Alpha/Robotics Lab/EE Club); **sem navBottomTab** — tela empurrada; gap12 entre seções; bio/badges = aspiracional (futuro domain-model/API) |
| Profile.Edit | review | — | V2 layer `Screen/V2.Profile.Edit`; **2026-08-15: rebuilt** — header custom (back + "Edit Profile" + "Save" `$primary`) + avatar 80 `$primary` DS + camera badge 24 (posição absoluta canto inferior direito, **fix flexbox**) + 2× inputText (label "Email" duplicado V1 preservado, field h44, ícone desabilitado) + bio textarea (label "Description", field h100) + buttonPrimary "Save" |
| Profile.Projects.Active | review | — | V2 layer `Screen/V2.Profile.Projects.Active`; **2026-08-15: rebuilt** — navHeaderWithBack "Active Projects" + 2× cardProjectDefault (badge "Electronics", title, david_smith/Apr 25 2023, 354/24) + navBottomTab |
| Profile.Projects.Done | review | — | V2 layer `Screen/V2.Profile.Projects.Done`; **2026-08-15: rebuilt** — navHeaderWithBack "Completed Projects" + 3× cardProjectDefault (mesmo conteúdo V1) + navBottomTab |
| Profile.Projects.Empty | review | AniUI Empty State | V2 layer `Screen/V2.Profile.Projects.Empty`; **2026-08-15: rebuilt** — navHeaderWithBack "Projects" + emptyState ref centralizado (folder-open, "No projects yet" / "Start by exploring or creating your first project" / CTA "Explore Projects") + navBottomTab |
| Profile.Publications | review | — | V2 layer `Screen/V2.Profile.Publications`; **2026-08-15: rebuilt** — navHeaderWithBack "Publications" + 1 row custom (`$input`: título 14/600 + journal + "Published: March 2023") + navBottomTab |
| Profile.Publications.Empty | review | AniUI Empty State | V2 layer `Screen/V2.Profile.Publications.Empty`; **2026-08-15: rebuilt** — navHeaderWithBack "Publications" + emptyState ref (book-open, "No publications yet" / "Your published research will appear here" — **fix copy-paste V1 "No projects yet"** / CTA "Explore Projects") + navBottomTab |
| Profile.Bookmarks | review | — | V2 layer `Screen/V2.Profile.Bookmarks`; **2026-08-15: rebuilt** — navHeaderWithBack "Bookmarks" + 2× cardProjectDefault + navBottomTab |
| Settings.Main | review | AniUI Settings | V2 layer `Screen/V2.Settings.Main`; **2026-08-15: rebuilt** — navHeaderWithBack "Settings" + 4 rows ($input: Notifications/Change my interests/Share feedback/Terms of service) + Privacy policy + Sign Out (`$destructive-subtle` + stroke `$destructive` + log-out) + Delete account (`$destructive-subtle`, sem stroke) + navBottomTab |
| Settings.Feedback | review | — | V2 layer `Screen/V2.Settings.Feedback`; **2026-08-15: rebuilt** — navHeaderWithBack "Share feedback" (**fix V1 "Project Details"**) + "How can we improve?" 14/600 + textarea (label "Description" + field h100) + buttonPrimary "Send" |
| Settings.DeleteAccount | review | — | V2 layer `Screen/V2.Settings.DeleteAccount`; **2026-08-15: rebuilt** — centered: icon 80 `$destructive` (trash-2) + "Delete Account?" 24/700 + desc lh1.5 `$muted-foreground` + `btnSecondaryMedium` "Cancel" + `btnDangerMedium` "Delete" (ambos fill_container h44) |

## Notifications

| Screen | Status | Reference | Notes |
|---|---|---|---|
| Notifications.List | review | AniUI Notifications | V2 layer `Screen/V2.Notifications.List`; **2026-08-15: rebuilt** — header "Notifications" + "Mark all read" `$primary` + tabsSegmentedDefault (General/Applications) + 2 rows custom (`$card`+border: dot unread `$primary` no não-lido + icon circle 40 `$primary-subtle`/`$success-subtle` + título/desc 2 linhas/time) + navBottomTab (Projects ativo) |
| Notifications.List.Loading | review | AniUI Skeleton | V2 layer `Screen/V2.Notifications.List.Loading`; **2026-08-15: new** — header + 3× cardSkeletonDefault (h140) + nav |
| Notifications.List.Empty | review | AniUI Empty State | V2 layer `Screen/V2.Notifications.List.Empty`; **2026-08-15: new** — header + emptyState ref centralizado (bell, "No notifications yet" / "Updates about your projects and applications will appear here" / CTA "Explore Projects") + nav |
| Notifications.Detail | review | — | V2 layer `Screen/V2.Notifications.Detail`; **2026-08-15: new** — navHeaderWithBack "Notification" + icon frame 64 `$primary-subtle` (check) + título 24/700 + desc lh1.5 + time + project card (`$card`+border: label/name/badge "Electronics") + buttonPrimary "View Project" + nav |

## Chat / DMs

| Screen | Status | Reference | Notes |
|---|---|---|---|
| Chat.List | review | AniUI Chat | V2 layer `Screen/V2.Chat.List`; **2026-08-15: rebuilt** — header "Chat" + search + 2× listItemWithAvatar (avatar 48 colorido ET/JR + nome + time rel + preview `$muted-foreground` truncado + unread badge `$primary` "3" em Emily; **sem nav — DMs ficam fora das tabs**); info column via Replace do `laInfo` (row fix: `layout` explícito no ref) |
| Chat.List.Loading | review | AniUI Skeleton | V2 layer `Screen/V2.Chat.List.Loading`; **2026-08-15: new** — header + 3× cardSkeletonDefault (h140) |
| Chat.List.Empty | review | AniUI Empty State | V2 layer `Screen/V2.Chat.List.Empty`; **2026-08-15: new** — header + emptyState ref centralizado (message-circle, "No messages yet" / "Message someone from a project or group" / CTA "Find people") |
| Chat.Detail | review | AniUI Chat + RNR | V2 layer `Screen/V2.Chat.Detail`; **2026-08-15: new** — header custom (back + avatar ET + "Emily Turner" + "Online" `$success`) + 4× chatBubbleDefault **sem sender label** (`L9vaC` disabled — DM não mostra nome do remetente) + typingIndicatorDefault "Emily is typing" + composer (input pad [12,12]; send 40) |
| Chat.Detail.Reconnecting | review | — | V2 layer `Screen/V2.Chat.Detail.Reconnecting`; **2026-08-15: new** — msgs + pill `$primary-subtle` (wifi-off + "Reconnecting…") + composer (igual ao Chat.Detail) |
