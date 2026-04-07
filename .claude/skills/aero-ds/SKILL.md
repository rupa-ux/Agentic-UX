---
name: aero-ds
description: "Aero DS: design intelligence for this repo only—ShareConsolidated (Bird AI) SaaS shell (dashboards, agents, settings, workflows, in-app surfaces). Stack: React, Vite, Tailwind, shadcn-style primitives. Verify in Storybook (Design System/Tokens) and theme.css. Not for generic websites, portfolios, or marketing landing systems unless explicitly requested."
---
# Aero DS - Design Intelligence

Searchable design guidance (styles, palettes, UX rules, charts) with priority-based recommendations. **Scope is this product only:** the ShareConsolidated **SaaS application** (shell navigation, agents, tasks, reports, settings, data-heavy views). Do **not** apply generic marketing-site, portfolio, or unrelated product patterns unless the user explicitly asks for out-of-app or non-product UI.

## Project design system (ShareConsolidated)

When working **in this repository**:

1. **Colour source of truth (Aero)** — Figma [Aero Design System](https://www.figma.com/design/xecPAre4cKkeXEdvTig1oI/Aero-Design-System): foundation [node `238:759`](https://www.figma.com/design/xecPAre4cKkeXEdvTig1oI/Aero-Design-System?node-id=238-759), chart series [node `10745:12765`](https://www.figma.com/design/xecPAre4cKkeXEdvTig1oI/Aero-Design-System?node-id=10745-12765).
2. **Implementation** — [`src/styles/theme.css`](../../../src/styles/theme.css): semantic CSS variables (`--primary`, `--chart-1`…`--chart-5`, `--sidebar-*`, …) exposed as Tailwind (`bg-primary`, `text-muted-foreground`, etc.).
3. **Storybook** — [`src/stories/DesignTokens.stories.tsx`](../../../src/stories/DesignTokens.stories.tsx) under **Design System/Tokens** documents the same tokens for review.
4. **Spacing** — Follow the repo [spacing grid rule](../../../.cursor/rules/spacing-grid.mdc): default rhythm 8px (Tailwind `2, 4, 6…`), dense 4px where appropriate.
5. **CSV / `search.py` palettes** — Use for **ideas or greenfield work outside this repo**. For ShareConsolidated code, **do not** override Aero + `theme.css` with ad hoc hex from the CSV database.

## Storybook workflow (verification)

Storybook is the **primary visual verification surface** for UI work in this repository (same Tailwind + theme pipeline as the Vite app).

- **Run** (from repository root): `npm run storybook` — dev server on port **6006** (see [package.json](../../../package.json)).
- **Design tokens:** Use the **Design System/Tokens** story in [`src/stories/DesignTokens.stories.tsx`](../../../src/stories/DesignTokens.stories.tsx) to confirm colours, type scale, and semantic classes match [`src/styles/theme.css`](../../../src/styles/theme.css).
- **Stories:** When adding or changing user-visible UI under `src/app/`, add or update a story under [`src/stories/`](../../../src/stories/) where practical so states are reviewable in isolation.
- **Preview globals:** Follow [`.storybook/preview.tsx`](../../../.storybook/preview.tsx) — light/dark theme toolbar, `DESIGN_VERSION` tokens CSS + [`src/styles/index.css`](../../../src/styles/index.css), story `layout` parameters; backgrounds addon stays disabled in favour of CSS variables.
- **Parity:** Components should look and behave in Storybook the same way they do in the running app (shared CSS entry).

## When to Apply

Reference these guidelines when:

- Designing or extending **in-app** UI: dashboards, settings, admin, onboarding modals, data lists, forms, charts.
- Choosing typography, density, and interaction patterns for **SaaS** workflows.
- Reviewing code for UX, accessibility, or consistency with **Storybook tokens**.
- **Do not** default to marketing-site patterns (hero sections, campaign landing structure) for this codebase.

## Rule Categories by Priority

| Priority | Category | Impact | Domain |
|----------|----------|--------|--------|
| 1 | Accessibility | CRITICAL | `ux` |
| 2 | Touch & Interaction | CRITICAL | `ux` |
| 3 | Performance | HIGH | `ux` |
| 4 | Layout & Responsive | HIGH | `ux` |
| 5 | Typography & Color | MEDIUM | `typography`, `color` |
| 6 | Animation | MEDIUM | `ux` |
| 7 | Style Selection | MEDIUM | `style`, `product` |
| 8 | Charts & Data | LOW | `chart` |

## Quick Reference

### 1. Accessibility (CRITICAL)

- `color-contrast` - Minimum 4.5:1 ratio for normal text
- `focus-states` - Visible focus rings on interactive elements
- `alt-text` - Descriptive alt text for meaningful images
- `aria-labels` - aria-label for icon-only buttons
- `keyboard-nav` - Tab order matches visual order
- `form-labels` - Use label with for attribute

### 2. Touch & Interaction (CRITICAL)

- `touch-target-size` - Minimum 44x44px touch targets
- `hover-vs-tap` - Use click/tap for primary interactions
- `loading-buttons` - Disable button during async operations
- `error-feedback` - Clear error messages near problem
- `cursor-pointer` - Add cursor-pointer to clickable elements

### 3. Performance (HIGH)

- `image-optimization` - Use WebP, srcset, lazy loading
- `reduced-motion` - Check prefers-reduced-motion
- `content-jumping` - Reserve space for async content

### 4. Layout & Responsive (HIGH)

- `viewport-meta` - width=device-width initial-scale=1
- `readable-font-size` - Minimum 16px body text on mobile
- `horizontal-scroll` - Ensure content fits viewport width
- `z-index-management` - Define z-index scale (10, 20, 30, 50)

### 5. Typography & Color (MEDIUM)

- `line-height` - Use 1.5-1.75 for body text
- `line-length` - Limit to 65-75 characters per line
- `font-pairing` - Match heading/body font personalities

### 6. Animation (MEDIUM)

- `duration-timing` - Use 150-300ms for micro-interactions
- `transform-performance` - Use transform/opacity, not width/height
- `loading-states` - Skeleton screens or spinners

### 7. Style Selection (MEDIUM)

- `style-match` - Match style to product type (SaaS: clear, efficient, trustworthy)
- `consistency` - Use same patterns across app surfaces
- `no-emoji-icons` - Use SVG icons, not emojis

### 8. Charts & Data (LOW)

- `chart-type` - Match chart type to data type
- `color-guidance` - Use semantic chart tokens (`--chart-1`…`--chart-5`) from `theme.css`
- `data-table` - Provide table alternative for accessibility

## How to Use

Search specific domains using the CLI tool below.

---


## Prerequisites

All `search.py` commands below assume the **repository root** as the current working directory (paths start with `.claude/skills/...`).

Check if Python is installed:

```bash
python3 --version || python --version
```

If Python is not installed, install it based on user's OS:

**macOS:**
```bash
brew install python3
```

**Ubuntu/Debian:**
```bash
sudo apt update && sudo apt install python3
```

**Windows:**
```powershell
winget install Python.Python.3.12
```

---

## How to Use This Skill

When the user requests UI/UX work (design, build, create, implement, review, fix, improve), follow this workflow:

### Step 1: Analyze User Requirements

Extract key information from the user request:

- **Product surface**: e.g. settings, permissions, billing, reports, data table, wizard, shell navigation (not “landing page” unless explicitly out-of-app marketing).
- **Style keywords**: minimal, dense, professional, dark mode, etc.
- **Industry / domain**: fintech, healthcare, internal tools, etc.
- **Stack for this repo**: **React + Vite + Tailwind + shadcn-style components** — not `html-tailwind` as default here.

### Step 2: Generate Design System (REQUIRED)

**Always start with `--design-system`** to get comprehensive recommendations with reasoning:

```bash
python3 .claude/skills/aero-ds/scripts/search.py "<product_type> <industry> <keywords>" --design-system [-p "Project Name"]
```

This command:

1. Searches multiple domains in parallel (product, style, color, landing, typography)
2. Applies reasoning rules from `ui-reasoning.csv` to select best matches
3. Returns complete design system: pattern, style, colors, typography, effects
4. Includes anti-patterns to avoid

**Map results to ShareConsolidated:** translate any suggested colours into **`theme.css` semantic variables** (or confirm they already match Aero).

**Example (SaaS):**

```bash
python3 .claude/skills/aero-ds/scripts/search.py "B2B SaaS admin dashboard settings permissions" --design-system -p "ShareConsolidated"
```

### Step 2b: Persist Design System (Master + Overrides Pattern)

To save the design system for hierarchical retrieval across sessions, add `--persist`:

```bash
python3 .claude/skills/aero-ds/scripts/search.py "<query>" --design-system --persist -p "Project Name"
```

This creates:

- `design-system/MASTER.md` — Global Source of Truth with all design rules
- `design-system/pages/` — Folder for page-specific overrides

**With page-specific override:**

```bash
python3 .claude/skills/aero-ds/scripts/search.py "<query>" --design-system --persist -p "Project Name" --page "dashboard"
```

This also creates:

- `design-system/pages/dashboard.md` — Page-specific deviations from Master

**How hierarchical retrieval works:**

1. When building a specific page (e.g. "Team settings"), first check `design-system/pages/team-settings.md`
2. If the page file exists, its rules **override** the Master file
3. If not, use `design-system/MASTER.md` exclusively

### Step 3: Supplement with Detailed Searches (as needed)

After getting the design system, use domain searches to get additional details:

```bash
python3 .claude/skills/aero-ds/scripts/search.py "<keyword>" --domain <domain> [-n <max_results>]
```

**When to use detailed searches:**

| Need | Domain | Example |
|------|--------|---------|
| More style options | `style` | `--domain style "minimal dark"` |
| Chart recommendations | `chart` | `--domain chart "time series dashboard"` |
| UX best practices | `ux` | `--domain ux "animation accessibility"` |
| Alternative fonts | `typography` | `--domain typography "professional sans"` |
| Landing / marketing structure | `landing` | **Skip for ShareConsolidated in-app work** — only if building a separate marketing site |

### Step 4: Stack Guidelines (default: `react` + `shadcn`)

Get implementation-specific best practices. For **this repository**, prefer:

```bash
python3 .claude/skills/aero-ds/scripts/search.py "<keyword>" --stack react
python3 .claude/skills/aero-ds/scripts/search.py "<keyword>" --stack shadcn
```

Available stacks: `html-tailwind`, `react`, `nextjs`, `vue`, `svelte`, `swiftui`, `react-native`, `flutter`, `shadcn`, `jetpack-compose`

---

## Search Reference

### Available Domains

| Domain | Use For | Example Keywords |
|--------|---------|------------------|
| `product` | Product type recommendations | B2B SaaS, admin, internal tools, analytics |
| `style` | UI styles, colors, effects | minimalism, dark mode, data-dense |
| `typography` | Font pairings, Google Fonts | professional, readable, compact |
| `color` | Palette ideas | saas, fintech, healthcare (map to `theme.css` in-repo) |
| `landing` | Marketing page structure | **Not used for ShareConsolidated app surfaces** |
| `chart` | Chart types, library recommendations | trend, comparison, funnel |
| `ux` | Best practices, anti-patterns | animation, accessibility, z-index, loading |
| `react` | React performance | memo, rerender, suspense |
| `web` | Web interface guidelines | aria, focus, keyboard, semantic |
| `prompt` | AI prompts, CSS keywords | (style name) |

### Available Stacks

| Stack | Focus |
|-------|-------|
| `react` | State, hooks, performance, patterns (**use for this repo**) |
| `shadcn` | shadcn/ui components, theming, forms, patterns (**use for this repo**) |
| `html-tailwind` | Tailwind utilities, responsive, a11y |
| `nextjs` | SSR, routing, images, API routes |
| `vue` | Composition API, Pinia, Vue Router |
| `svelte` | Runes, stores, SvelteKit |
| `swiftui` | Views, State, Navigation, Animation |
| `react-native` | Components, Navigation, Lists |
| `flutter` | Widgets, State, Layout, Theming |
| `jetpack-compose` | Composables, Modifiers, State Hoisting, Recomposition |

---

## Example Workflow

**User request:** "Add a team permissions table with role badges and bulk actions"

### Step 1: Analyze Requirements

- Product surface: Settings / admin, data table, destructive actions
- Style keywords: clear, scannable, trustworthy
- Industry: B2B SaaS
- Stack: React + shadcn-style primitives in-repo

### Step 2: Generate Design System (REQUIRED)

```bash
python3 .claude/skills/aero-ds/scripts/search.py "B2B SaaS team permissions roles table bulk actions" --design-system -p "ShareConsolidated"
```

**Output:** Design system hints — **implement** using `theme.css` tokens and existing table/button patterns.

### Step 3: Supplement with Detailed Searches (as needed)

```bash
python3 .claude/skills/aero-ds/scripts/search.py "data table keyboard screen reader" --domain ux
python3 .claude/skills/aero-ds/scripts/search.py "role badge status" --domain ux
```

### Step 4: Stack Guidelines

```bash
python3 .claude/skills/aero-ds/scripts/search.py "form layout data grid" --stack shadcn
```

**Then:** Implement with semantic colours (`bg-card`, `border-border`, `text-destructive`, etc.) and verify in Storybook if components are documented there.

---

## Output Formats

The `--design-system` flag supports two output formats:

```bash
# ASCII box (default) - best for terminal display
python3 .claude/skills/aero-ds/scripts/search.py "fintech b2b saas" --design-system

# Markdown - best for documentation
python3 .claude/skills/aero-ds/scripts/search.py "fintech b2b saas" --design-system -f markdown
```

---

## Tips for Better Results

1. **Be specific with keywords** — "healthcare SaaS settings billing" beats "app"
2. **Search multiple times** — Different keywords reveal different insights
3. **Combine domains** — Style + UX + chart for data-heavy screens
4. **Always check UX** — Search "animation", "z-index", "accessibility" for common issues
5. **Use stack `react` / `shadcn`** for this codebase
6. **Iterate** — If first search doesn't match, try different keywords

---

## Common Rules for Professional UI

These are frequently overlooked issues that make UI look unprofessional:

### Icons & Visual Elements

| Rule | Do | Don't |
|------|----|----- |
| **No emoji icons** | Use SVG icons (Heroicons, Lucide, Simple Icons) | Use emojis like 🎨 🚀 ⚙️ as UI icons |
| **Stable hover states** | Use color/opacity transitions on hover | Use scale transforms that shift layout |
| **Correct brand logos** | Research official SVG from Simple Icons | Guess or use incorrect logo paths |
| **Consistent icon sizing** | Use fixed viewBox (24x24) with w-6 h-6 | Mix different icon sizes randomly |

### Interaction & Cursor

| Rule | Do | Don't |
|------|----|----- |
| **Cursor pointer** | Add `cursor-pointer` to all clickable/hoverable cards | Leave default cursor on interactive elements |
| **Hover feedback** | Provide visual feedback (color, shadow, border) | No indication element is interactive |
| **Smooth transitions** | Use `transition-colors duration-200` | Instant state changes or too slow (>500ms) |

### Light/Dark Mode Contrast

| Rule | Do | Don't |
|------|----|----- |
| **ShareConsolidated** | Use semantic tokens from `theme.css` (`text-foreground`, `text-muted-foreground`, `border-border`, `bg-background`) | Hardcode slate/gray hex from examples below when shipping repo code |
| **Glass card light mode** | Use `bg-white/80` or higher opacity | Use `bg-white/10` (too transparent) |
| **Reference neutrals (non-repo)** | `#212121` body, `#555555` secondary | Body text at `#94A3B8` (too light) |
| **Border visibility** | Rely on `border-border` / theme | Invisible borders in light mode |

### Layout & Spacing

| Rule | Do | Don't |
|------|----|----- |
| **Floating navbar** | Add `top-4 left-4 right-4` spacing | Stick navbar to `top-0 left-0 right-0` without margin |
| **Content padding** | Account for fixed navbar height | Let content hide behind fixed elements |
| **Consistent max-width** | Use same `max-w-6xl` or `max-w-7xl` | Mix different container widths |
| **Grid rhythm** | 8px default, 4px dense (see spacing-grid rule) | Arbitrary `gap-3` / `p-3` for layout rhythm |

---

## Pre-Delivery Checklist

Before delivering UI code, verify these items:

### Visual Quality

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] Brand logos are correct (verified from Simple Icons)
- [ ] Hover states don't cause layout shift
- [ ] Use theme colours (`bg-primary`, `text-muted-foreground`, etc.) from `theme.css` / Storybook Tokens

### Interaction

- [ ] All clickable elements have `cursor-pointer`
- [ ] Hover states provide clear visual feedback
- [ ] Transitions are smooth (150-300ms)
- [ ] Focus states visible for keyboard navigation

### Light/Dark Mode

- [ ] Contrast meets 4.5:1 for body text using semantic tokens
- [ ] Glass/transparent elements visible in light mode
- [ ] Borders visible in both modes (`border-border`)
- [ ] Test both modes before delivery

### Layout

- [ ] Floating elements have proper spacing from edges
- [ ] No content hidden behind fixed navbars
- [ ] Responsive at 375px, 768px, 1024px, 1440px
- [ ] No horizontal scroll on mobile

### Accessibility

- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Colour is not the only indicator
- [ ] `prefers-reduced-motion` respected

### ShareConsolidated

- [ ] Colours align with **Aero** + [`theme.css`](../../../src/styles/theme.css); spot-check **Design System/Tokens** in Storybook if the change is user-visible
- [ ] Spacing follows **8px / 4px dense** grid from workspace rules
