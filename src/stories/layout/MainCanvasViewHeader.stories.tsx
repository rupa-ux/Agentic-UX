import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Calendar, CalendarRange, ChevronLeft, ChevronRight, Filter, List, Plus } from "lucide-react";
import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";
import { Button } from "@/app/components/ui/button";
import { SegmentedToggle } from "@/app/components/ui/segmented-toggle";

const meta: Meta<typeof MainCanvasViewHeader> = {
  title: "Layout/Main canvas view header",
  component: MainCanvasViewHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Shared **title band** for main canvas views (Appointments, Payments, Listings, …): `px-6 pt-5 pb-4`, `text-lg` title, optional `text-xs` muted subline, optional right **actions** (`MAIN_VIEW_HEADER_ACTIONS_CLUSTER_CLASS`: `justify-end`, `gap-2`, wraps). **Policy:** put **`FilterPaneTriggerButton`** or an outline **Filter** icon **last** in `actions` so it sits at the **extreme right** of the band (scope controls → layout toggles → … → filter). Tokens: [`mainViewTitleClasses.ts`](../../app/components/layout/mainViewTitleClasses.ts). Radix **Dialog** / **Sheet** / **Drawer** / **AlertDialog** titles default to the same primary heading class.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof MainCanvasViewHeader>;

export const TitleAndDescription: Story = {
  args: {
    title: "Appointments",
    description: "Schedule, manage, and track patient appointments.",
  },
};

export const WithActions: Story = {
  args: {
    title: "Payments",
    description: "Manage payment requests, track collections, and process refunds.",
    actions: (
      <Button size="sm" className="gap-1.5 text-xs">
        <Plus className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
        Request a payment
      </Button>
    ),
  },
};

/** Same tokens as default, but **`font-normal`** on the title (Profile performance dashboard). */
export const RegularWeightTitle: Story = {
  args: {
    title: "Profile performance",
    titleClassName: "font-normal",
    description: "9 active · 58,386 total sent",
  },
};

/** Same chrome as **App/Social** publish calendar and **App/Views/AppointmentsView**: prev/next ghost icons, range label, Today, `titleClassName="font-normal"`. */
export const CalendarNavigationAsTitle: Story = {
  name: "Calendar navigation as title",
  render: function CalendarNavRender() {
    const [range, setRange] = useState<"day" | "week">("week");
    return (
      <MainCanvasViewHeader
        titleClassName="font-normal"
        title={
          <>
            <span className="sr-only">Appointments · </span>
            <span className="flex min-w-0 flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 font-normal text-muted-foreground hover:text-foreground"
                aria-label="Previous week"
              >
                <ChevronLeft className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
              </Button>
              <span className="min-w-0 max-w-[min(100%,18rem)] shrink truncate px-1 text-center text-base font-medium text-foreground tabular-nums sm:max-w-[24rem]">
                Apr 13 – 19, 2026
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 font-normal text-muted-foreground hover:text-foreground"
                aria-label="Next week"
              >
                <ChevronRight className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="ml-1 shrink-0 px-2 text-lg font-medium text-primary hover:bg-primary/10"
              >
                Today
              </Button>
            </span>
          </>
        }
        actions={
          <>
            <Button type="button" size="sm" variant="outline" className="w-[8.5rem] justify-between font-normal">
              <span>All</span>
              <span className="text-muted-foreground" aria-hidden>
                ▾
              </span>
            </Button>
            <SegmentedToggle<"day" | "week">
              iconOnly
              ariaLabel="Calendar range"
              value={range}
              onChange={setRange}
              items={[
                {
                  value: "day",
                  label: "Day",
                  icon: <Calendar className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />,
                },
                {
                  value: "week",
                  label: "Week",
                  icon: <CalendarRange className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />,
                },
              ]}
            />
            <Button type="button" variant="outline" size="icon" aria-label="Filter">
              <Filter className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
            </Button>
          </>
        }
      />
    );
  },
};

/** Canonical **actions order**: scope control → layout toggles → **Filter last** (extreme right). */
export const FilterRightmostPolicy: Story = {
  name: "Filter rightmost (policy)",
  render: function FilterPolicyRender() {
    const [layout, setLayout] = useState<"list" | "week">("week");
    return (
      <MainCanvasViewHeader
        title="Reviews"
        description="Filter control is always the last action in the band."
        actions={
          <>
            <Button type="button" size="sm" variant="outline" className="font-normal">
              Status
            </Button>
            <SegmentedToggle<"list" | "week">
              iconOnly
              ariaLabel="Layout"
              value={layout}
              onChange={setLayout}
              items={[
                {
                  value: "list",
                  label: "List",
                  icon: <List className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />,
                },
                {
                  value: "week",
                  label: "Week",
                  icon: <CalendarRange className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />,
                },
              ]}
            />
            <Button type="button" variant="outline" size="icon" aria-label="Filter">
              <Filter className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
            </Button>
          </>
        }
      />
    );
  },
};
