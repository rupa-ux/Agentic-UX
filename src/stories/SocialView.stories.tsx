import type { Meta, StoryObj } from "@storybook/react";
import { SocialView } from "@/app/components/SocialView";

const meta: Meta<typeof SocialView> = {
  title: "App/Views/SocialView",
  component: SocialView,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Social shell with L2 navigation. **Publish/Calendar** uses `CalendarView`, whose header includes **Actions**: Share report, Customize & share, and Schedule (same report-actions stack as Insights Dashboard). " +
          "PR QA: verify all three flows from the calendar toolbar; optional cross-check **App/Views/CalendarView** in isolation.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SocialView>;

export const Default: Story = {};
