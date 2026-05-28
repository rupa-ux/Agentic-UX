import { L2_FLAT_NAV_KEY_PREFIX } from "@/app/components/L2NavLayout";

/** L2 key for the review appointments table view (default appointments L2 selection). */
export const APPOINTMENTS_L2_REVIEW_KEY = "Human actions/Review appointments";

/** Persisted nav may still reference the former label. */
const APPOINTMENTS_L2_REVIEW_KEY_LEGACY = "Human actions/View all appointments";

/** @deprecated Prefer `APPOINTMENTS_L2_REVIEW_KEY`; alias kept for existing imports. */
export const APPOINTMENTS_L2_CALENDAR_KEY = APPOINTMENTS_L2_REVIEW_KEY;

/** L2 key for the schedule view — renders the calendar canvas. */
export const APPOINTMENTS_L2_SCHEDULE_KEY = "Human actions/View schedule";

export function appointmentsL2IsReviewKey(activeKey: string | undefined): boolean {
  return (
    activeKey === APPOINTMENTS_L2_REVIEW_KEY ||
    activeKey === APPOINTMENTS_L2_REVIEW_KEY_LEGACY
  );
}

/** L2 key for the waitlist management view. */
export const APPOINTMENTS_L2_WAITLIST_KEY = "Human actions/Manage waitlist";

/** L2 key for the appointment management agents list (matches Reviews response agents pattern). */
export const APPOINTMENTS_L2_APPOINTMENT_AGENT_KEY = "Agents/Appointment agent";

function titleCaseWords(s: string): string {
  return s
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** `productLabel` for `AppShellContentPlaceholder` when an L2 row has no dedicated canvas yet. */
export function appointmentsL2PlaceholderProductLabel(activeKey: string): string {
  if (activeKey.startsWith(`${L2_FLAT_NAV_KEY_PREFIX}/`)) {
    const raw = activeKey.slice(L2_FLAT_NAV_KEY_PREFIX.length + 1);
    return `Appointments · ${titleCaseWords(raw)}`;
  }
  const i = activeKey.lastIndexOf("/");
  const child = i >= 0 ? activeKey.slice(i + 1) : activeKey;
  return `Appointments · ${child}`;
}

const APPOINTMENTS_L2_CALENDAR_KEY_LEGACY = "Human actions/Calendar";

export function appointmentsL2ShowsCalendarCanvas(activeKey: string): boolean {
  return (
    activeKey === APPOINTMENTS_L2_SCHEDULE_KEY ||
    activeKey === APPOINTMENTS_L2_CALENDAR_KEY_LEGACY
  );
}
