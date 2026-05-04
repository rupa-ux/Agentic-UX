/**
 * Standard main-canvas view header band (Appointments, Payments, Listings, …).
 * Use with {@link MainCanvasViewHeader} or mirror the same `px-6 pt-5 pb-4` row in bespoke layouts.
 *
 * **Actions order:** use {@link MAIN_VIEW_HEADER_ACTIONS_CLUSTER_CLASS} for the right cluster. Place
 * **`FilterPaneTriggerButton`** (or an outline **Filter** icon control) **last** so it sits at the extreme
 * right of the band — after scope controls (status, search, …), then layout toggles, then any other actions.
 */
export const MAIN_VIEW_HEADER_BAND_CLASS =
  "flex shrink-0 items-center justify-between px-6 pt-5 pb-4";

/**
 * Right-hand **actions** cluster for {@link MainCanvasViewHeader} (`gap-2`, wraps on narrow widths, end-aligned).
 * Compose children in policy order; **filter control must be the last child**.
 */
export const MAIN_VIEW_HEADER_ACTIONS_CLUSTER_CLASS =
  "flex shrink-0 flex-wrap items-center justify-end gap-2";

/**
 * Primary title line: canvas `<h1>`, {@link MainCanvasViewHeader}, and Radix
 * Dialog / Sheet / Drawer / AlertDialog titles (see `dialog.v1`, `sheet.v1`, `drawer.v1`, `alert-dialog.v1`).
 */
export const MAIN_VIEW_PRIMARY_HEADING_CLASS =
  "text-lg font-semibold tracking-tight text-foreground";

/** Optional one-line subtitle under the primary heading in canvas headers. */
export const MAIN_VIEW_SUBHEADING_CLASS = "mt-0.5 text-xs text-muted-foreground";
