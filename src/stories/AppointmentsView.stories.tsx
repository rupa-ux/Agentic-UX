import type { Meta, StoryObj } from "@storybook/react";
import { AppointmentsView } from "@/app/components/AppointmentsView";

const meta: Meta<typeof AppointmentsView> = {
  title: "App/Views/AppointmentsView",
  component: AppointmentsView,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Appointments product view. Canvas header uses `MainCanvasViewHeader`: calendar navigation + Today in `title`, " +
          "and a right cluster with Status `DropdownMenu`, then a three-item `SegmentedToggle` (Day / Week / By doctor), then `FilterPaneTriggerButton` last (see **Layout/Main canvas view header**). " +
          "Cards show patient name (bold) + doctor name (provider-color tinted) + service + time. Status dot removed. " +
          "By-doctor view shows 4 doctor columns for a single day. Detail Sheet uses `FloatingSheetFrame`. Mock data only.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AppointmentsView>;

export const Default: Story = {};
export const WeekCalendarView: Story = { name: "Week calendar" };
export const DayCalendarView: Story = {
  name: "Day calendar",
  args: { defaultCalendarView: "day" },
};
export const ByDoctorView: Story = {
  name: "By doctor — columns per provider",
  args: { defaultCalendarView: "by-doctor" },
};
export const CleanWeekHeaders: Story = {
  name: "Week headers — no appt count",
  args: { defaultCalendarView: "week" },
};
