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

export const ApprovePostsState: Story = {
  render: () => <SocialView activeItem="Publish/Approve posts" onActiveItemChange={() => {}} />,
};

export const RejectedPostsState: Story = {
  render: () => <SocialView activeItem="Publish/Fix rejected posts" onActiveItemChange={() => {}} />,
};

export const ExpiredPostsState: Story = {
  render: () => <SocialView activeItem="Publish/Expired posts" onActiveItemChange={() => {}} />,
};

export const PlaceholderReportsState: Story = {
  render: () => <SocialView activeItem="Reports/Post performance" onActiveItemChange={() => {}} />,
};
