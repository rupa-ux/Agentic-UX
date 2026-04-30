---
name: aero-ds
description: "Aero DS: design intelligence for this repo only—ShareConsolidated (Bird AI) SaaS shell (dashboards, agents, settings, workflows, in-app surfaces). Stack: React, Vite, Tailwind, shadcn-style primitives. Verify in Storybook (Design System/Tokens) and theme.css. Data-heavy grids: use AppDataTable (TanStack Table + table.v1 + column sheet); verify **UI/AppDataTable** in Storybook. Auth/shell loading copy: **BootInsightsLoader** + [`bootInsightsDefaultSlides.ts`](../../../src/app/components/layout/bootInsightsDefaultSlides.ts); post-login [`AppBootShimmer.tsx`](../../../src/app/components/layout/AppBootShimmer.tsx); verify **UI/BootInsightsLoader**. User/agent triggers: *bring this custom loader*, *boot insights loader*. Main canvas header: `MainCanvasViewHeader` + `mainViewTitleClasses.ts` — **no** `border-b` on the header band (title row stays open into the body; use inner cards/toolbars for dividers). **Main canvas + bordered widgets:** same horizontal band on header and body (e.g. `px-8` + `!px-8` on header), card interior `px-6`, column `items-stretch`; Design Tokens story **Main canvas + bordered widgets** + [`Dashboard.v1.tsx`](../../../src/app/components/Dashboard.v1.tsx). Same primary heading tokens on Dialog/Sheet/Drawer/AlertDialog titles. Modal scrims: `MODAL_OVERLAY_VISUAL_CLASS` in `modalOverlayClasses.ts`. Modal + floating menu surfaces: no perimeter border on Dialog/Sheet/AlertDialog/Drawer content or on `FLOATING_PANEL_SURFACE_CLASSNAME` (Popover, DropdownMenu, Select, profile popover)—shadow for depth. For full page builds from Figma or screenshots, follow Build a Full Page. For floating right drawers, Storybook UI/Sheet + FloatingSheetFrame. Not for generic websites, portfolios, or marketing landing systems unless explicitly requested."
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

### Main canvas + bordered widget bands (dashboard-style)

Use this pattern when a view stacks a **page title** with **one or more bordered cards** (KPIs, charts, tables) in the main canvas — reference **[`Dashboard.v1.tsx`](../../../src/app/components/Dashboard.v1.tsx)**.

| Layer | Rule |
| --- | --- |
| **Horizontal band** | Same **`px-*`** on **`MainCanvasViewHeader`** and the scroll body below. Default header band is **`px-6`** (`MAIN_VIEW_HEADER_BAND_CLASS`); **dense chart dashboards** may use **`px-8`** on both — pass **`className="!px-8"`** on `MainCanvasViewHeader` to override. |
| **Titles** | Page: **`MainCanvasViewHeader`** + **`MAIN_VIEW_PRIMARY_HEADING_CLASS`**. Cards: same heading token on **`h3`**; sublines **`MAIN_VIEW_SUBHEADING_CLASS`** ([`mainViewTitleClasses.ts`](../../../src/app/components/layout/mainViewTitleClasses.ts)). |
| **Card shell** | Bordered surface (`rounded-lg`, `border-border`, `bg-card` or product hex where legacy). **Inside the border:** **`px-6`** horizontal padding so titles and body never touch the stroke. |
| **Flex** | Card wrapper: **`flex flex-col items-stretch`** — do **not** use **`items-center`** on the column (it shrink-wraps children and misaligns titles vs the page `h1`). |

**Storybook:** **Design System/Tokens → Main canvas + bordered widgets** in [`DesignTokens.stories.tsx`](../../../src/stories/DesignTokens.stories.tsx).

### Data tables (`AppDataTable`)

Use this stack for **sortable, resizable directory-style grids** in product views (campaigns, contacts, listings, payments, **ticketing**, and similar).

| Piece | Role |
| --- | --- |
| **`@tanstack/react-table`** | Column model: sorting, sizing, visibility, order. |
| **[`table.v1.tsx`](../../../src/app/components/ui/table.v1.tsx)** (`Table`, `TableHead`, …) | Visual layer only — same Aero tokens as the rest of the shell. |
| **[`AppDataTable.tsx`](../../../src/app/components/ui/AppDataTable.tsx)** | Wires TanStack to `table.v1`, resize handles, toolbar **Columns** control, and [`ColumnSettingsSheet.tsx`](../../../src/app/components/ui/ColumnSettingsSheet.tsx) (reorder, show/hide, reset). Optional **`stickyToolbar`** pins the toolbar row inside a vertical scroll parent (see Surveys). |
| **[`appDataTableTypes.ts`](../../../src/app/components/ui/appDataTableTypes.ts)** | Persisted slice: `columnOrder`, `columnVisibility`, `columnSizing`. |

**Sticky first column (default):** The first **visible** column (after reorder/hide) is `position: sticky; left: 0` with `bg-background`, transparent right border, and row hover/selection tint so the primary label column (e.g. survey name, contact name) stays fixed during horizontal scroll. A **right-edge shadow + border** animates in (`transition` ~200ms) only while **`scrollLeft > 0`**, so the cue is invisible at rest and appears when the user scrolls horizontally. Scrolling columns use **`relative z-0`** so they paint **under** the sticky column (later `td`s would otherwise paint on top). Sticky header/body cells use **`overflow-visible`** so the shadow is not clipped. Implemented once in **`AppDataTable`**; optional prop **`stickyFirstColumn={false}`** only for rare conflicts. **`Table`** from [`table.v1.tsx`](../../../src/app/components/ui/table.v1.tsx) accepts **`withScrollContainer={false}`** when a parent already provides horizontal scroll — **`AppDataTable`** uses this so sticky targets a **single** scrollport.

**New directory tables:** Keep the **primary human-readable identifier** as the **first column definition** in the column array (default order); users may reorder in the column sheet, but the default should match product language (“name”, “Survey name”, etc.).

**Persistence:** Pass a stable **`tableId`** (e.g. `contacts.directory`). Session state is stored under **`appdt:v1:${tableId}`** via [`usePersistedState`](../../../src/app/hooks/usePersistedState.ts). Set **`persist={false}`** in Storybook-only demos.

**Storybook-first:** Land or update behaviour in **[`src/stories/AppDataTable.stories.tsx`](../../../src/stories/AppDataTable.stories.tsx)** (**UI/AppDataTable**) before shipping new table UX only inside a view. Use the Storybook theme toolbar to check light/dark against **Design System/Tokens**.

**When not to use `AppDataTable`:** Static print/report layouts, token typography tables, or tiny two-row demos can stay on plain `<table>` or static **`UI/Table`** stories. **Dashboard chart footers** (channels × metrics under area charts) use **`ChartSummaryTable`** ([`ChartSummaryTable.tsx`](../../../src/app/components/ChartSummaryTable.tsx)) — composes **`table.v1`** with fixed **13px** type, **no top border**, **right-aligned** metric columns; verify **UI/ChartSummaryTable** in Storybook.

**Bespoke grids not yet on `AppDataTable`:** Some views still use **native `<table>`** or custom flex grids for **wide matrix layouts**, **legacy section styling**, or **print-style output**. Examples: [`SearchAIView.v1.tsx`](../../../src/app/components/SearchAIView.v1.tsx) (dynamic brand columns + expandable theme rows), [`BirdAIReportsView.v1.tsx`](../../../src/app/components/BirdAIReportsView.v1.tsx), [`AgentConfigView.v1.tsx`](../../../src/app/components/AgentConfigView.v1.tsx), [`ScheduledDeliveriesView.v1.tsx`](../../../src/app/components/ScheduledDeliveriesView.v1.tsx), [`SharedByMe.v1.tsx`](../../../src/app/components/SharedByMe.v1.tsx), [`BusinessOverviewDashboard.v1.tsx`](../../../src/app/components/BusinessOverviewDashboard.v1.tsx). **[`ReportPages.v1.tsx`](../../../src/app/components/ReportPages.v1.tsx)** should generally stay on controlled `<table>` + inline typography for **export / WYSIWYG** parity unless product explicitly wants AppDataTable there.

**Row UX defaults in `AppDataTable`:** Row dividers (`border-b border-border`), optional **`onRowClick`**, **`isRowSelected`** for keyed selection, **`actions`** column id (and `meta.stopRowClick`) so interactive cells do not bubble row clicks.

### Ticketing directory (`TicketingView.v1.tsx`)

- Mirror **`CampaignsView.v1.tsx`**: **`AppDataTable`** + header **`AppDataTableColumnSettingsTrigger`**, `createColumnHelper`, stable **`tableId`** (e.g. `ticketing.directory`), **`hideColumnsButton`** with controlled **`columnSheetOpen`**. Pin **`stickyLeadingColumnCount={2}`** when select + label columns should freeze together.
- **Status:** **`Badge variant="outline"`** + semantic tinted **`className`** (**label only**—no status dot/icon inside the badge). Reuse the **Campaigns** `STATUS_CONFIG`-style palette (emerald / amber / slate / blue / purple families with dark variants).
- **Channel:** Neutral publisher chip (**slate** outline + muted icon)—**not** Google/Facebook/etc. brand colours in the directory grid.
- **Do not** add a **left priority colour stripe** on rows; avoid “unread” row fills that read like **selection**.

### Social calendar (`SocialView.v1.tsx`)

- **List / week / month** share one **calendar shell** (e.g. `mx-6 mb-6`, **`rounded-xl border border-border bg-background`**, **`shadow-sm`**, **`flex-1 min-h-0`**) so height and chrome stay consistent when toggling **`SegmentedToggle`** modes.
- **Typography:** **`text-[13px]`** base for **list** and **week** body; month cells may use **`text-xs`** for dense chips.
- **List / week cards:** **`bg-background`** + **`border-border`** (and light shadow)—avoid grey “tub” wells behind every card.
- **Month grid (Sprout / Later–style):** **equal row heights** with **`gridTemplateRows: repeat(rowCount, minmax(0, 1fr))`** under a definite-height flex child; **per-cell borders** instead of a heavy **`gap-px`** matrix; stacked **chips** (icon + time + clamped copy) + **“+N more”**.

### Shared by me (`SharedByMe.v1.tsx`) — wide `<table>` hygiene

- **Left alignment:** Drop decorative **leading empty** `<th>` / `<td>` columns so the first real column aligns with the table edge.
- **Icons:** Omit **KPI card icons** unless the spec requires them (label + value is cleaner). In rows, avoid **report-type avatars**, **channel row icons**, and **extra Lucide** when **`text-muted-foreground`** metadata is enough.
- **Column design:** Put **expiry** in its **own column**, not under status. Split **last activity** into **time** vs **viewer email** columns instead of one stacked “Last accessed” cell.
- **Row actions:** **`⋯`** menu **`opacity-0`** by default; reveal on **`group-hover:`** and **`group-focus-within:`** so the grid stays quiet until interaction.
- **Time formatting:** One **Gmail-style** helper—**“Just now”**, **“N minutes ago”**, **hours / days** spelled out, **“1 week ago”** in a bounded window, then **`Mar 7, 2026`**—avoid **`1d ago`** plus a second absolute line in the same cell.
- **Views column:** Show **total views only** unless the product explicitly asks for **unique viewers** in the same cell.

### Boot insights loader (`BootInsightsLoader`)

Use this pattern when the user wants **meaningful copy during auth delay or post-login shell boot** (metrics-style columns, shortcuts, automation, product positioning) instead of a blank shimmer or spinner-only state.

| Piece | Role |
| --- | --- |
| **[`bootInsightTypes.ts`](../../../src/app/components/layout/bootInsightTypes.ts)** | `BootInsightSlide` union: **`metrics`** (up to three columns: `label`, `value`, optional `hint`) and **`message`** (`title`, optional `body`); optional **`tag`** (`shortcut` \| `automation` \| `product` or custom string) for the chip. |
| **[`bootInsightsDefaultSlides.ts`](../../../src/app/components/layout/bootInsightsDefaultSlides.ts)** | Demo **`bootInsightsDefaultSlides`** preset (reviews, social, shortcuts, auto-admin, product pitch). Swap or extend for other flows without changing the loader. |
| **[`BootInsightsLoader.tsx`](../../../src/app/components/layout/BootInsightsLoader.tsx)** | Rotating slides with **`motion/react`** crossfade, dot navigation, `role="status"` + **`aria-live="polite"`**, and **`prefers-reduced-motion`** (instant swap / no fade). Props: **`slides`**, **`intervalMs`**, optional controlled **`activeIndex`** / **`onIndexChange`**. |
| **[`AppBootShimmer.tsx`](../../../src/app/components/layout/AppBootShimmer.tsx)** | Post-login shell placeholder; composes **`BootInsightsLoader`** in the main canvas. Optional prop **`bootInsightsIntervalMs`** (default **560**). [`App.tsx`](../../../src/app/App.tsx) passes **`max(400, floor(POST_LOGIN_BOOT_MS / 2))`** so slide cadence stays tied to the boot window (~two slides per boot). |
| **[`BirdAILoginPage.tsx`](../../../src/app/components/auth/BirdAILoginPage.tsx)** | Optional full-screen overlay during simulated sign-in / continue delays (**`SHOW_BOOT_INSIGHTS_ON_LOGIN_LOADING`**); scrim uses **`MODAL_OVERLAY_VISUAL_CLASS`**. |

**Agent / user triggers:** When someone says **“bring this custom loader”**, **“boot insights loader”**, or similar, add or reuse **`BootInsightsLoader`**: import **`bootInsightsDefaultSlides`** or pass a custom **`slides`** array; prefer **`AppBootShimmer`** for post-login and the login overlay pattern for in-form delays.

**Storybook:** **[`src/stories/BootInsightsLoader.stories.tsx`](../../../src/stories/BootInsightsLoader.stories.tsx)** — **UI/BootInsightsLoader** (default preset, custom slides, controlled index, **Embedded in App boot shimmer** fullscreen). Check light/dark with the theme toolbar.

---

### Keyboard shortcuts help

- **Single source of truth:** [`src/app/shortcuts/shortcuts.ts`](../../../src/app/shortcuts/shortcuts.ts) — `SHORTCUT_REGISTRY`. Each entry defines `scope`, `modalGroup` (`navigation` | `current-view`), keys / `keySequences`, and the strings shown in the modal. All **global** rows appear under the single **Navigation** column in the modal.
- **UI:** [`src/app/shortcuts/ShortcutsModal.tsx`](../../../src/app/shortcuts/ShortcutsModal.tsx) — Radix `Dialog`; **Navigation** + optional view-specific column (active `scope` label). Row layout is **label left**, **keycaps right**; use semantic Tailwind tokens (`border-border`, `bg-muted`, …).
- **Verify in Storybook:** **App/Shortcuts/Keyboard shortcuts** — [`src/stories/App/Shortcuts/ShortcutsModal.stories.tsx`](../../../src/stories/App/Shortcuts/ShortcutsModal.stories.tsx).

### Modal overlays (dialogs, sheets, alert dialogs, drawers)

- **Principle:** Blocking scrims should use a **light backdrop blur** plus a **low-opacity semantic tint** on `background`—not a heavy black wash (`bg-black/50`, `bg-black/40`, …). Dark grey veils read as generic marketing modals and bury the product shell; Aero keeps context readable behind the layer.
- **Shared class:** [`src/app/components/ui/modalOverlayClasses.ts`](../../../src/app/components/ui/modalOverlayClasses.ts) exports **`MODAL_OVERLAY_VISUAL_CLASS`**. Radix **`Dialog`**, **`Sheet`**, **`AlertDialog`**, and Vaul **`Drawer`** overlays in the `*.v1.tsx` primitives import it—do not revert those files to `bg-black/*` without an explicit design exception.
- **Custom popovers / portaled UI:** For bespoke full-screen or `fixed inset-0` dismiss layers, reuse **`MODAL_OVERLAY_VISUAL_CLASS`** (or the same token recipe: light `backdrop-blur-[2px]` with `bg-background/35` and `dark:bg-background/45`) so new work matches **UI/Dialog**, **UI/Sheet**, and **UI/AlertDialog** in Storybook.
- **Exceptions:** Immersive surfaces (e.g. full-screen photo viewers) may need a stronger dimmer; call that out in the feature story or flow doc so it does not become the default pattern.
- **Modal surfaces (content panes):** Radix **`DialogContent`**, **`SheetContent`**, **`AlertDialogContent`**, and Vaul **`DrawerContent`** are **borderless** by default—use **`shadow-lg`** (or drawer’s edge treatment) for separation from the scrim, not `border` / `ring` on the outer pane unless a spec explicitly requires it.

### Floating anchored panels (Popover, menus, selects, profile popover)

- **Principle:** Small anchored overlays (profile menu, **Popover**, **DropdownMenu**, **Select**, **HoverCard**, **ContextMenu**, **Menubar**, notification panels) should read as **floating cards**: semantic **`bg-popover`** + **soft shadow**, **without** a thin grey **perimeter border** on the shell—borders belong on **rows/items inside** the panel (e.g. `border-b` on list sections), not around the whole floating box.
- **Shared class:** [`src/app/components/ui/floatingPanelSurface.ts`](../../../src/app/components/ui/floatingPanelSurface.ts) exports **`FLOATING_PANEL_SURFACE_CLASSNAME`** (`rounded-2xl`, shadow tokens, `text-popover-foreground`) and **`FLOATING_PANEL_LIST_PADDING_CLASSNAME`**. Primitives under `src/app/components/ui/*.v1.tsx` that render portaled menus import it—reuse it for **custom** portaled menus (e.g. L1 profile dropdown and the **⋯ overflow nav** panel in [`Sidebar.v2.tsx`](../../../src/app/components/Sidebar.v2.tsx)) instead of inventing `border border-border/80` shells. Overflow **More** uses the **same anchored pattern** as profile (`absolute`, `left-[calc(100%+8px)]`, `w-[260px]`)—**not** a Radix **Sheet** drawer.
- **Verify in Storybook:** **UI/Popover**, **UI/DropdownMenu**, **UI/Select**, **UI/HoverCard**, **UI/ContextMenu**, **UI/Menubar** — docs describe the borderless shell.

### Status / type tags (`Badge` + table chips)

- **Typography:** **`text-[12px]`** on the shared [`Badge`](../../../src/app/components/ui/badge.v1.tsx) primitive (`src/app/components/ui/badge.v1.tsx` via `badge.tsx`). Do **not** override with `text-xs`, `text-[10px]`, or `text-[length:var(--font-size)]` on status/type/role chips unless a spec explicitly requires a different size.
- **Shape & stroke:** **No perimeter border** on semantic tags—use **tinted background + matching text** only (`bg-*-50` / `dark:bg-*-950/40` patterns). Avoid `border-*-200` / `dark:border-*-800` on `Badge variant="outline"` config maps (Campaigns, Surveys, Appointments, Ticketing, Payments, Listings, etc.) and on inline `span` chips (Inbox outcomes, Agent activity “Active”, policy kind pills on **Agent config**).
- **Verify in Storybook:** **UI/Badge** after changing the primitive.

### Main canvas titles (view header + modals)

- **Shared header row:** [`src/app/components/layout/MainCanvasViewHeader.tsx`](../../../src/app/components/layout/MainCanvasViewHeader.tsx) — `title`, optional `description`, optional `actions` (right column). Outer band uses **`MAIN_VIEW_HEADER_BAND_CLASS`** (`px-6 pt-5 pb-4`, `flex`, `justify-between`).
- **Tokens:** [`src/app/components/layout/mainViewTitleClasses.ts`](../../../src/app/components/layout/mainViewTitleClasses.ts) — **`MAIN_VIEW_PRIMARY_HEADING_CLASS`** (`text-lg font-semibold tracking-tight text-foreground`) and **`MAIN_VIEW_SUBHEADING_CLASS`** (`text-xs` muted subline). The same primary heading is the **default** on Radix **`DialogTitle`**, **`SheetTitle`**, **`DrawerTitle`**, and **`AlertDialogTitle`** in [`dialog.v1.tsx`](../../../src/app/components/ui/dialog.v1.tsx), [`sheet.v1.tsx`](../../../src/app/components/ui/sheet.v1.tsx), [`drawer.v1.tsx`](../../../src/app/components/ui/drawer.v1.tsx), [`alert-dialog.v1.tsx`](../../../src/app/components/ui/alert-dialog.v1.tsx)—override with `className` only when a design doc specifies an exception.
- **New / updated full-width canvas views:** Use **`MainCanvasViewHeader`** (or the same three exports from `mainViewTitleClasses.ts` composed manually **only** when layout cannot wrap the shared row). Do **not** hand-roll primary canvas titles with `text-xl`, arbitrary `text-[Npx]`, or one-off `h1` weights for the module name.
- **No divider under the title band:** Do **not** pass `className` on `MainCanvasViewHeader` that adds **`border-b`** / **`border-b border-border`**. The title row is visually open into the scrollable body; horizontal rules belong on **inner** surfaces (data cards, sticky table toolbars, tabs), not on the shared canvas header strip.
- **Product views using `MainCanvasViewHeader` (non-exhaustive):** Appointments, Payments, Referrals, Surveys, Ticketing, Campaigns, Listings (default + All sites), Agents Monitor, Reviews (list), Competitors (main column), Contacts (directory + lists), Business overview, Dashboard shell, Shared by me, Scheduled deliveries, Search AI (visibility + recommendations panel), Inbox (canvas title), Schedule builder, BirdAI reports, Journeys placeholder, Agent detail, Agents builder, Agent library, listings citations / Google suggestions, and similar. Add the component for any **new** full-width canvas view instead of hand-rolling `px-6 pt-5 pb-4` + bespoke `h1` classes.
- **Floating sheets:** [`FloatingSheetFrame`](../../../src/app/components/layout/FloatingSheetFrame.tsx) — `title` renders as **`SheetTitle`** (inherits the same default heading class). Keep header padding aligned (`pt-5 pb-4` on the frame header).
- **“Drawer” / right detail rail → `Sheet` (floating):** When a prompt asks for a **drawer**, **side panel**, or **slide-over detail** for row/record context, implement it with **Radix `Sheet`** from [`sheet.v1.tsx`](../../../src/app/components/ui/sheet.v1.tsx), not a bespoke `fixed` panel and not Vaul **`Drawer`** unless the spec explicitly requires bottom drawer UX. Use **`inset="floating"`**, pass **`FLOATING_SHEET_FRAME_CONTENT_CLASS`** on **`SheetContent`**, and compose **[`FloatingSheetFrame`](../../../src/app/components/layout/FloatingSheetFrame.tsx)** when the layout needs a fixed header/footer and a scrolling body (Campaigns campaign detail, Surveys reports, **Payments invoice**, Call recording, Agent trace, Ticketing reply, etc.). Verify **UI/Sheet** in Storybook.
- **Choosing `floatingSize` when the user does not specify width:** Ask **one** clarifying question, then set **`SheetContent` `floatingSize`** (see `SheetFloatingSize` in `sheet.v1.tsx`—do not invent ad hoc `max-w-*` for floating rails):
  1. **Small** → `sm` (~340px) — minimal copy, narrow confirmations.
  2. **Medium** → `md` (~480px) — **default** for typical row detail (invoices, campaign/survey summaries, social preview).
  3. **Large** → `lg` (~640px) — denser forms, more columns, long threaded content.
  4. **Large with preview / split canvas** → `xl` (~85vw max) — when they need maximum floating width for a preview pane, comparison, or wide matrix beside fields—not the same as **edge** full-bleed `inset="edge"` (reserve edge sheets for explicit full-height / mobile-first specs).
- **L2 vs main title:** When the main canvas already shows **`MainCanvasViewHeader`**, **omit** **`L2NavLayout` `panelTitle`** so the module name is not duplicated in the L2 rail. Use **`headerAction`** for a top-of-L2 CTA row (label + plus chip), e.g. **Book an appointment** on Appointments — same pattern as Inbox **New message**.

### Review platform logos (third‑party marks)

- **Single implementation:** [`src/app/components/reviewPlatformLogos.tsx`](../../../src/app/components/reviewPlatformLogos.tsx) — `ReviewSiteLogo`, `YelpLogo`, `GoogleLogo`, `FacebookLogo`, `TripAdvisorLogo`, and shared `ReviewPlatformSite` type.
- **Rules:** Use **vector artwork** (SVG paths), not text glyphs, for marks such as Facebook. Outer ring uses **semantic tokens** (`border-border`, `bg-background`, optional `dark:bg-muted/40`) and fixed **5px** inset so every platform reads at the same outer `size` (e.g. `28` in list rows, `40` in list v1 cards).
- **Consumers:** [`ReviewsView.v2.tsx`](../../../src/app/components/ReviewsView.v2.tsx) (conversation list + detail) and [`ReviewsView.v1.tsx`](../../../src/app/components/ReviewsView.v1.tsx) import from here — do **not** duplicate logo wrappers in those files.

## Build a Full Page (screenshot or Figma)

Use this section whenever the user shares a **screenshot** or **Figma URL** and asks you to build or redesign a page. Skip the `search.py` workflow for in-repo work — Storybook tokens are the ground truth here. Use `search.py` only for greenfield work or exploration **outside this repository**.

### Shell Architecture

Every in-app surface uses the same chrome. Never invent new nav zones or override shell geometry.

```
┌──────────────────────────────────────────────────────────────────┐
│  L1 strip (66px)  │  TopBar (h-48px, full width minus L1)       │
│  APP_SHELL_RAIL   │  APP_SHELL_RAIL · rounded-tr-lg             │
├───────────────────┴──────────────────────────────────────────────┤  ← APP_SHELL_BELOW_TOPBAR_CARD_CLASS (rounded-lg frame)
│  L2 panel (220px)  │  Main canvas                               │
│  PANEL             │  APP_MAIN_CONTENT_SHELL_CLASS              │
│  rounded-tl-lg     │  rounded-tr-lg rounded-br-lg               │
│  rounded-bl-lg     │  bg-app-shell-main                         │
└────────────────────┴───────────────────────────────────────────  ┘
Gutter: APP_SHELL_GUTTER_SURFACE_CLASS — pr-[10px] pb-[10px] around the bottom row
```

| Zone | Import / constant | Key tokens |
|---|---|---|
| **L1 strip** | `w-[66px]` + `APP_SHELL_RAIL_SURFACE_CLASS` | `bg-app-shell-rail` |
| **TopBar** | `h-[48px]` + `rounded-tr-lg` + `APP_SHELL_RAIL_SURFACE_CLASS` | `bg-app-shell-rail` |
| **Frame (below TopBar)** | `APP_SHELL_BELOW_TOPBAR_CARD_CLASS` | `rounded-lg border-app-shell-border` |
| **L2 panel** | `PANEL` from `@/app/components/L2NavLayout.v1` | `w-[220px] bg-app-shell-l2-surface rounded-tl-lg rounded-bl-lg border-r border-app-shell-border` |
| **Main canvas** | `APP_MAIN_CONTENT_SHELL_CLASS` | `bg-app-shell-main rounded-tr-lg rounded-br-lg` |
| **Gutter** | `APP_SHELL_GUTTER_SURFACE_CLASS` | `bg-app-shell-gutter` |

All four constants live in [`src/app/components/layout/appShellClasses.ts`](../../../src/app/components/layout/appShellClasses.ts).

**L2 row geometry** (from `L2NavLayout.v1.tsx` — apply to every new L2 panel):

| State | Class |
|---|---|
| Row base | `px-[8px] py-[6px] text-[13px] rounded-[4px] tracking-[-0.26px]` |
| Hover | `hover:bg-app-shell-l2-row-hover` (`HOVER`) |
| Active child | `bg-app-shell-l2-row-active text-foreground` (`CHILD_ACTIVE`) |
| Inactive child | `text-muted-foreground` (`CHILD_INACTIVE`) |
| Selected (accent) | `text-primary bg-primary/10 ring-1 ring-primary/15 rounded-lg` (`CHILD_FLAT_ACCENT_ACTIVE`) |

**New L2 panel shortcut** — use `<L2NavLayout sections={[...]} />` and pass config only. No custom styling needed; the component owns all geometry.

---

### Typography baseline

| Property | Value | Tailwind |
|---|---|---|
| Font | Inter | `font-sans` / `--font-sans` |
| **Loaded weights** | **300 and 400 only** | `font-light` (300) · `font-normal` (400) |
| Base size | **13px** | `text-base` |
| Body line-height | 1.5 | `leading-normal` |
| Label / caption | 12px | `text-xs` |
| Section heading | 18px | `text-lg` |
| Page title | 24px | `text-2xl` |

`font-medium`, `font-semibold`, and `font-bold` all resolve to weight 400 — they are not visually distinct. Use `font-light` for de-emphasised text only; everything else is `font-normal`.

---

### Spacing rhythm

| Use | Step | Tailwind |
|---|---|---|
| Default between blocks / sections | 8px multiples | `gap-2` = 8px · `gap-4` = 16px · `gap-6` = 24px · `gap-8` = 32px |
| Dense (label-to-control, icon gaps) | 4px | `gap-1` |
| **Avoid for layout** | — | `gap-3` `gap-5` `p-3` `px-3` `px-5` (off-grid) |

---

### Color tokens (quick-ref)

| CSS variable | Tailwind | Use |
|---|---|---|
| `--primary` | `bg-primary` / `text-primary` | CTAs, active indicators, links |
| `--background` | `bg-background` | Page background |
| `--card` | `bg-card` | Card / panel surfaces |
| `--muted` | `bg-muted` | Subtle backgrounds |
| `--foreground` | `text-foreground` | Primary text |
| `--muted-foreground` | `text-muted-foreground` | Labels, secondary text, metadata |
| `--border` | `border-border` | Standard UI borders |
| `--destructive` | `bg-destructive` / `text-destructive` | Error / delete states |
| `--chart-1…5` | `bg-chart-1` … | Data visualisation series |
| `--app-shell-*` | (Shell Architecture table above) | Chrome zones only — not for content cards |

**Hard rule:** never hardcode hex from a screenshot or Figma into component code. Map every colour to a `theme.css` semantic token.

---

### Border radius

| Element type | Class | Value |
|---|---|---|
| Badges, chips | `rounded-sm` | 6px |
| Buttons, inputs, selects | `rounded-md` | 8px |
| Cards, popovers, dropdowns | `rounded-lg` | 10px |
| Modals, dialogs, panels | `rounded-xl` | 14px |
| Large feature cards | `rounded-2xl` | 16px |
| Avatars, pills, toggles | `rounded-full` | — |

L2 column corners: `rounded-tl-lg rounded-bl-lg` (left side only). Main canvas: `rounded-tr-lg rounded-br-lg` (right side only).

---

### Shadow scale

| Class | Use |
|---|---|
| `shadow-sm` | Subtle lift — inputs, tags |
| `shadow` | Default card elevation |
| `shadow-md` | Dropdowns, popovers |
| `shadow-lg` | Floating panels, tooltips |
| `shadow-xl` | Dialogs, modals |
| `shadow-2xl` | Large overlays, drawers |
| `shadow-inner` | Pressed states, inset wells |

---

### Resizable list / detail split panels

For any `<list panel | detail panel>` layout where the user can drag to resize (inbox-style conversation view, reviews conversation view, etc.), reuse the inbox pattern — **do not** introduce `ResizablePanelGroup` / `ResizablePanel` / `ResizableHandle` from `ui/resizable`.

Canonical pieces:

- **Handle component:** `HorizontalResizeHandle` from `src/app/components/layout/HorizontalResizeHandle.tsx`
  - Invisible 8px hit strip positioned at the left or right edge of a panel (`side="left" | "right"`), 2px highlight on hover/drag.
  - Props: `onPointerDown`, `onDoubleClick`, `aria-label`, `aria-valuenow/min/max`.
- **Width hook (per consumer):** each consumer defines a small hook in `src/app/hooks/` following the shape of `useInboxListPanelWidth.ts`. The hook owns: `STORAGE_KEY`, `*_DEFAULT`, `*_MIN`, `*_MAX`, `max*ListWidth(rowWidth)`, `clamp*ListWidth(w, rowWidth)`, `use*ListPanelWidth(rowWidth)` returning `{ width, setWidth, widthRef }`. sessionStorage for persistence.
- **Pointer handler (inline in the view):** `onPointerDown` captures the pointer, attaches window-level `pointermove` / `pointerup` / `pointercancel`, writes the new width directly to the container element's `style.width` during drag, commits to state on release. `onDoubleClick` resets to the default. Use `listContainerRef.current?.parentElement?.clientWidth` for the available row width.

Container pattern:

```tsx
<div className="flex-1 flex min-h-0 overflow-hidden">
  <div ref={listContainerRef} className="relative flex shrink-0 flex-col" style={{ width: listWidth }}>
    <HorizontalResizeHandle side="right" aria-label="Resize list" … onPointerDown={…} onDoubleClick={…} />
    <ListPanel … />
  </div>
  <div className="flex-1 min-w-0">{/* detail */}</div>
</div>
```

Reference implementations: `InboxView.v1.tsx` + `useInboxListPanelWidth.ts`, `ReviewsView.v2.tsx` + `useReviewsListPanelWidth.ts`.

When a third consumer appears, consider lifting the shared pieces (hook skeleton + pointer handler) into a generic `useResizableListWidth(config)` helper in `src/app/hooks/`. Until then, mirror the existing per-consumer hook to keep storage keys and clamp rules explicit.

---

### Segmented toggles (mode/view switchers)

For any two-or-more-option mode/view switcher (AI/Manual, List/Conversation, Day/Week/Month, etc.), use the canonical pill control:

- **Component:** `SegmentedToggle` from `src/app/components/ui/segmented-toggle.tsx`
- **Pattern:** soft gray pill container, active segment becomes a white card with a 1px shadow, inactive segments are muted text-only.
- **Variants:** label mode (default) and `iconOnly` for compact toolbars.
- **Do not** roll your own segmented control with custom borders, ring outlines, or filled-background icon buttons. If a Figma spec shows a different pattern, surface it before building so we can decide whether to update the canonical or keep the spec consistent.

Reference call sites: `AgentsBuilderView.v1.tsx` (label mode, AI/Manual), `ReviewsView.v1.tsx` / `ReviewsView.v2.tsx` (icon-only, List/Conversation).

---

### Copy-paste prompts

**Pre-build analysis prompt** (paste this first with any screenshot or Figma URL — generates the design-specific mapping before any code is written):

```text
Before writing any code, analyze this screenshot and output:
1. Map every major visual zone to its Birdeye shell equivalent: L1 strip (66px) / TopBar (48px) / L2 panel (220px) / Main canvas / FloatingSheetFrame (right drawer) / not applicable
2. Flag anything that would be wrong if copied literally from the screenshot — widths that differ from shell constants, inline panels that should be FloatingSheetFrame drawers, colors that need theme.css token mapping, nav structures wider or different from L2NavLayout
3. Name any existing Birdeye stories or components to read before building (e.g. InboxView.stories.tsx, ReviewsL2Nav.stories.tsx, AppShell.stories.tsx)
Output only this mapping. Do not write any code yet.
```

Then review the mapping output, then paste the build prompt below to proceed.

---

**User prompt** (paste when attaching a screenshot or Figma URL):

```text
Build this page using the repo's shell architecture:
- L1 strip: w-[66px] APP_SHELL_RAIL_SURFACE_CLASS (do not redesign)
- TopBar: h-[48px] rounded-tr-lg APP_SHELL_RAIL_SURFACE_CLASS (extend TopBar.v1.tsx)
- Below-TopBar frame: APP_SHELL_BELOW_TOPBAR_CARD_CLASS
- L2 panel: PANEL from L2NavLayout.v1 (w-[220px] bg-app-shell-l2-surface); use <L2NavLayout sections={[...]} /> for nav items
- Main canvas: APP_MAIN_CONTENT_SHELL_CLASS
Colors: theme.css semantic tokens only — no hardcoded hex. Typography: Inter, font-light or font-normal only, text-base = 13px. Spacing: 8px grid (gap-2/4/6/8), 4px dense (gap-1). Match the design for layout and content. Verify against src/stories/AppShell.stories.tsx in Storybook (npm run storybook, port 6006).
```

**Agent / task prompt** (strict checklist for automation):

```text
Full page build — repo shell pattern only:
- Import APP_SHELL_BELOW_TOPBAR_CARD_CLASS, APP_SHELL_GUTTER_SURFACE_CLASS, APP_SHELL_RAIL_SURFACE_CLASS, APP_MAIN_CONTENT_SHELL_CLASS from @/app/components/layout/appShellClasses.
- Import PANEL from @/app/components/L2NavLayout.v1 for the 220px L2 column.
- L1 strip: w-[66px] APP_SHELL_RAIL_SURFACE_CLASS. Never modify L1 layout.
- TopBar: h-[48px] rounded-tr-lg APP_SHELL_RAIL_SURFACE_CLASS. Extend src/app/components/TopBar.v1.tsx; do not create a parallel TopBar.
- L2 panel: PANEL class (w-[220px] bg-app-shell-l2-surface rounded-tl-lg rounded-bl-lg border-r border-app-shell-border). Row states: px-[8px] py-[6px] text-[13px] rounded-[4px] tracking-[-0.26px] with HOVER / CHILD_ACTIVE / CHILD_INACTIVE constants.
- Main canvas: APP_MAIN_CONTENT_SHELL_CLASS (rounded-tr-lg rounded-br-lg bg-app-shell-main).
- Colors: theme.css semantic tokens only. No hex. Map every design color to the closest token.
- Typography: Inter only. font-light (300) for de-emphasised text; font-normal (400) for everything else. text-base = 13px, text-xs = 12px, text-lg = 18px, text-2xl = 24px.
- Spacing: 8px grid — gap-2 (8px), gap-4 (16px), gap-6 (24px), gap-8 (32px). Dense: gap-1 (4px). Never gap-3, gap-5, p-3, px-5.
- Shadows: shadow for cards, shadow-md for dropdowns, shadow-xl for dialogs.
- Radius: rounded-md buttons/inputs, rounded-lg cards, rounded-xl dialogs, rounded-sm badges.
- After build: re-read src/stories/AppShell.stories.tsx; compare chrome in Storybook (port 6006) with the design reference.
```

---

## Floating drawers / side panels (Figma, screenshots, specs)

Use this when the user attaches a **screenshot**, **Figma frame**, or spec for a **right-rail overlay**: quick view, add/edit flows, settings side panel, or any panel that slides over **dimmed** main content in the SaaS shell.

### Design vs implementation

- **From the reference (Figma / screenshot / PDF):** information hierarchy, copy, field order, density, and visual emphasis (within `theme.css` and spacing grid rules).
- **From the codebase (non-negotiable unless a flow doc records an exception):** use **Radix `Sheet`** with **floating inset** and [`FloatingSheetFrame`](../../../src/app/components/layout/FloatingSheetFrame.tsx)—not a one-off full-bleed edge sheet, not a parallel “drawer” primitive under `UI/Drawer` for this pattern. Layout inside the frame may follow the design; **shell geometry and CTAs** follow Storybook.

### Implementation checklist

1. **`Sheet` / `SheetContent`:** `side="right"`, `inset="floating"`, `floatingSize` one of `sm` | `md` | `lg` | `xl`. Default **`md`** (480px cap) for typical forms and quick views unless the spec names another preset. Reference: [`src/stories/Sheet.stories.tsx`](../../../src/stories/Sheet.stories.tsx) — story **UI/Sheet → Medium**.
2. **`SheetContent` `className`:** include **`FLOATING_SHEET_FRAME_CONTENT_CLASS`** from [`FloatingSheetFrame`](../../../src/app/components/layout/FloatingSheetFrame.tsx) so the frame body owns vertical scroll (`overflow-hidden`, `p-0` on the sheet content).
3. **`FloatingSheetFrame`:** pass `title` (and optional `description`), put scrollable content in **`children`**, put **primary** and **secondary** actions in **`primaryAction` / `secondaryAction`** (sticky footer, scroll-linked header/footer shadows). Match the **Medium** placeholder: fixed chrome, scrolling body only.
4. **Rich footer:** When the flow needs a composer (textarea, attachments, send + secondary actions), use **`footer`** on `FloatingSheetFrame` to replace the default primary/secondary row—keep the same floating sheet shell (`FLOATING_SHEET_FRAME_CONTENT_CLASS` on `SheetContent`).
5. **Dismiss:** rely on the **top-right close** baked into [`sheet.v1`](../../../src/app/components/ui/sheet.v1.tsx) `SheetContent`. Do not add a second “X” in header or footer unless product explicitly requires it.
6. **Verify:** open **UI/Sheet → Medium** in Storybook (default dev port **6006** from `npm run storybook`; screenshots may show another port) and compare to **App/Settings/Account settings** ([`AccountSettingsSheet.tsx`](../../../src/app/components/settings/AccountSettingsSheet.tsx)) for a full product floating sheet.

Cursor guardrail (short pointer): [`.cursor/rules/storybook-new-component.mdc`](../../../.cursor/rules/storybook-new-component.mdc) — “Floating side panels”.

### Copy-paste prompts

**User prompt** (paste when starting work with a design attachment):

```text
Implement this using our product pattern for floating right drawers: Storybook UI/Sheet → Medium (floating inset, md width by default) plus FloatingSheetFrame with fixed header, scrollable body, and primary/secondary CTAs in the footer. Match the screenshot/Figma for layout and copy; use theme.css semantic tokens and existing ui/ primitives. Verify against Storybook and Account settings sheet after.
```

**Agent / task prompt** (stricter checklist):

```text
Floating right panel task — follow repo pattern only:
- Use Sheet + SheetContent from @/app/components/ui/sheet with side="right", inset="floating", floatingSize="md" unless spec says sm/lg/xl.
- Set SheetContent className to FLOATING_SHEET_FRAME_CONTENT_CLASS from @/app/components/layout/FloatingSheetFrame.
- Wrap inner UI in FloatingSheetFrame: title (+ optional description), children = scrollable body, primaryAction + secondaryAction for footer CTAs (default + outline Button variants).
- Do not duplicate the sheet close control; SheetContent already provides top-right dismiss.
- Re-read src/stories/Sheet.stories.tsx (Medium) and src/app/components/settings/AccountSettingsSheet.tsx before finishing.
- Extend an existing story under src/stories/ where practical; do not invent a new Storybook taxonomy without approval.
```

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

### Step 2: Generate Design System

**For in-repo page builds (screenshot or Figma):** skip `search.py` — go directly to the **Build a Full Page** section above. Shell geometry, tokens, and typography are already defined in Storybook.

**For greenfield work or exploration outside this repository**, use `--design-system` to get recommendations with reasoning:

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
