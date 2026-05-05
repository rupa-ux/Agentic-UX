import type { Meta, StoryObj } from "@storybook/react";
import { AppointmentsView, type AppointmentsViewProps } from "@/app/components/AppointmentsView";

/**
 * Remount when anchor / mock-today / layout args change so `useState` initialisers pick up Storybook controls.
 */
function AppointmentsViewStory(args: AppointmentsViewProps) {
  return (
    <AppointmentsView
      key={`${args.initialAnchorDateIso ?? "2026-05-01"}-${args.mockTodayIso ?? "live"}-${args.defaultCalendarView ?? "by-doctor"}`}
      {...args}
    />
  );
}

const meta: Meta<typeof AppointmentsView> = {
  title: "App/Views/AppointmentsView",
  component: AppointmentsView,
  render: (args) => <AppointmentsViewStory {...args} />,
  args: {
    initialAnchorDateIso: "2026-05-01",
    mockTodayIso: "2026-05-01",
    defaultCalendarView: "by-doctor",
  },
  argTypes: {
    initialAnchorDateIso: {
      control: "text",
      description: "yyyy-mm-dd — starting day (prev/next change anchor in-canvas).",
    },
    mockTodayIso: {
      control: "text",
      description: "yyyy-mm-dd — freezes “today” for highlights + Today button (omit in production).",
    },
    defaultCalendarView: {
      control: "select",
      options: ["day", "week", "by-doctor"],
    },
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Appointments product view. Canvas header uses `MainCanvasViewHeader`: calendar navigation + Today in `title`, " +
          "and a right cluster with **Search** (expand-in-place, matches **Reviews** list — filters by doctor name, patient name, and service), then Status `DropdownMenu`, then `SegmentedToggle` (Day / By doctor), then `FilterPaneTriggerButton` last (see **Layout/Main canvas view header**). " +
          "**Storybook:** set `initialAnchorDateIso` + `mockTodayIso` so prev/next/week ranges and “today” styling stay deterministic; the live app uses the real clock. " +
          "Mock data spans **2026-04-07 → 2026-06-02** (past April week, canonical April 14–19 week, dense **May 1**, May 4–8, May 11–14, June). " +
          "Cards show patient name (bold) + doctor name (provider-color tinted) + service + time. By-doctor view shows columns per provider. Detail Sheet uses `FloatingSheetFrame`.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AppointmentsView>;

export const Default: Story = {};

export const WeekCalendarView: Story = {
  name: "Week calendar",
  args: { defaultCalendarView: "week" },
};

export const DayCalendarView: Story = {
  name: "Day calendar",
  args: { defaultCalendarView: "day" },
};

export const ByDoctorView: Story = {
  name: "By doctor — columns per provider",
  args: { defaultCalendarView: "by-doctor" },
};

/** April 14–19 week with “today” pinned to May 1 — navigate the header to see historical data. */
export const AprilWeekHistorical: Story = {
  name: "Week — April sample (today pinned to May 1)",
  args: {
    defaultCalendarView: "week",
    initialAnchorDateIso: "2026-04-15",
    mockTodayIso: "2026-05-01",
  },
};

/** Following week in May — lighter mock load (May 4–8). */
export const MayFollowingWeek: Story = {
  name: "Week — May 4–10",
  args: {
    defaultCalendarView: "week",
    initialAnchorDateIso: "2026-05-04",
    mockTodayIso: "2026-05-01",
  },
};

/** “Today” and anchor both April 16 — week view highlights mid-April. */
export const TodayMidApril: Story = {
  name: "Week — today = April 16",
  args: {
    defaultCalendarView: "week",
    initialAnchorDateIso: "2026-04-14",
    mockTodayIso: "2026-04-16",
  },
};

export const FutureJuneDay: Story = {
  name: "Day — June sample",
  args: {
    defaultCalendarView: "day",
    initialAnchorDateIso: "2026-06-02",
    mockTodayIso: "2026-05-01",
  },
};
