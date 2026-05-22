export {
  ApptCard,
  AppointmentsView as AppointmentsCalendarView,
  type AppointmentsViewProps,
} from "./AppointmentsView.v1";

import {
  AppointmentsView as AppointmentsCalendarView,
  type AppointmentsViewProps,
} from "./AppointmentsView.v1";
import { AppointmentsManagementAgentsPage } from "@/app/components/appointments/AppointmentsManagementAgentsPage";
import { AppointmentsReviewPage } from "@/app/components/appointments/AppointmentsReviewPage";
import { AppointmentsWaitlistPage } from "@/app/components/appointments/AppointmentsWaitlistPage";
import {
  APPOINTMENTS_L2_APPOINTMENT_AGENT_KEY,
  APPOINTMENTS_L2_REVIEW_KEY,
  APPOINTMENTS_L2_WAITLIST_KEY,
  appointmentsL2PlaceholderProductLabel,
  appointmentsL2ShowsCalendarCanvas,
} from "@/app/components/appointmentsL2Nav";
import { AppShellContentPlaceholder } from "@/app/components/layout/AppShellContentPlaceholder";

export type AppointmentsViewRouterProps = AppointmentsViewProps & {
  appointmentsL2ActiveItem?: string;
};

export function AppointmentsView({
  appointmentsL2ActiveItem,
  ...calendarProps
}: AppointmentsViewRouterProps = {}) {
  if (appointmentsL2ActiveItem === APPOINTMENTS_L2_APPOINTMENT_AGENT_KEY) {
    return <AppointmentsManagementAgentsPage />;
  }

  if (appointmentsL2ActiveItem === APPOINTMENTS_L2_REVIEW_KEY) {
    return <AppointmentsReviewPage />;
  }

  if (appointmentsL2ActiveItem === APPOINTMENTS_L2_WAITLIST_KEY) {
    return <AppointmentsWaitlistPage />;
  }

  if (appointmentsL2ActiveItem && !appointmentsL2ShowsCalendarCanvas(appointmentsL2ActiveItem)) {
    return (
      <AppShellContentPlaceholder
        view="appointments"
        productLabel={appointmentsL2PlaceholderProductLabel(appointmentsL2ActiveItem)}
      />
    );
  }

  return <AppointmentsCalendarView {...calendarProps} />;
}
