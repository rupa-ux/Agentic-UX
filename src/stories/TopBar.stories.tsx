import type { Meta, StoryObj } from "@storybook/react";
import { TopBar } from "@/app/components/TopBar";
import type { AppView } from "@/app/App";

const meta: Meta<typeof TopBar> = {
  title: "App/TopBar",
  component: TopBar,
  tags: ["autodocs"],
  argTypes: {
    currentView: {
      control: "select",
      options: [
        "dashboard", "reviews", "inbox", "social", "searchai",
        "contacts", "scheduled-deliveries", "agents", "storybook",
      ],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "100%", maxWidth: 900 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TopBar>;

export const Dashboard: Story = {
  args: { currentView: "dashboard" as AppView, onViewChange: () => {} },
};

export const Reviews: Story = {
  args: { currentView: "reviews" as AppView, onViewChange: () => {} },
};

export const Inbox: Story = {
  args: { currentView: "inbox" as AppView, onViewChange: () => {} },
};

export const Agents: Story = {
  args: { currentView: "agents" as AppView, onViewChange: () => {} },
};
