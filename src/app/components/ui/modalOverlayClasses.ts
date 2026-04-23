/**
 * Shared visual for modal scrims (Dialog, Sheet, AlertDialog, Drawer overlays).
 * Prefer **light backdrop blur + low-opacity semantic tint** over heavy `bg-black/*`
 * so the shell stays visible and the UI feels native to Aero.
 */
export const MODAL_OVERLAY_VISUAL_CLASS =
  "bg-background/35 backdrop-blur-sm dark:bg-background/45";
