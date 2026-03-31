/**
 * App shell chrome — shared by `App.tsx` and App Shell stories so corners stay consistent.
 * L2 panel: top-left 8px — `PANEL` in `L2NavLayout.tsx` / Sidebar (`rounded-tl-lg`).
 * Top bar: top-right 8px — `TopBar.tsx` (`rounded-tr-lg`).
 * Main canvas: white fill, top-left + top-right 8px (`rounded-tl-lg rounded-tr-lg`) via overflow clip.
 */
export const APP_MAIN_CONTENT_SHELL_CLASS =
  "flex-1 flex flex-col min-w-0 overflow-hidden rounded-tl-lg rounded-tr-lg bg-white dark:bg-[#1e2229]";
