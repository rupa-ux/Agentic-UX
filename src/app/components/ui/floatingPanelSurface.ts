/**
 * Shared visual shell for floating overlays (Popover, DropdownMenu, Select, custom menus).
 * Matches the L1 profile menu: large corner radius, **no perimeter border** — depth comes from
 * the elevation shadow only (same idea as borderless Dialog/Sheet surfaces).
 * Import in primitives and stories; override with `className` only when necessary.
 */
const FLOATING_PANEL_CHROME_CLASSNAME =
  "rounded-2xl bg-popover text-popover-foreground";

export const FLOATING_PANEL_SURFACE_CLASSNAME = `${FLOATING_PANEL_CHROME_CLASSNAME} shadow-[0_12px_48px_-12px_rgba(15,23,42,0.12)] dark:shadow-[0_12px_48px_-12px_rgba(0,0,0,0.45)]`;

/**
 * Same chrome as {@link FLOATING_PANEL_SURFACE_CLASSNAME} but a smaller, softer shadow — for
 * large docked panels (e.g. agents builder properties) where the default overlay shadow feels heavy.
 */
export const FLOATING_PANEL_DOCKED_SURFACE_CLASSNAME = `${FLOATING_PANEL_CHROME_CLASSNAME} shadow-[0_6px_24px_-8px_rgba(15,23,42,0.08)] dark:shadow-[0_6px_24px_-8px_rgba(0,0,0,0.28)]`;

/** Default inset padding for list-style content inside the shell (8px grid). */
export const FLOATING_PANEL_LIST_PADDING_CLASSNAME = "p-2";
