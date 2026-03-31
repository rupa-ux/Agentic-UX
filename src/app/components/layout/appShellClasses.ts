/**
 * App shell chrome — shared by `App.tsx` and App Shell stories so corners stay consistent.
 * L2 column: top-left 8px — `PANEL` in `L2NavLayout.tsx` (`rounded-tl-lg`).
 * Top bar: top-right 8px — `TopBar.tsx` (`rounded-tr-lg`).
 * Main canvas: white fill, top-right 8px (`rounded-tr-lg`) via overflow clip.
 */
export const APP_MAIN_CONTENT_SHELL_CLASS =
  "flex-1 flex flex-col min-w-0 overflow-hidden rounded-tr-lg bg-white dark:bg-[#1e2229]";
