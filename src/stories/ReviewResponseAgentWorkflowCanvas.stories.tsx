import type { Meta, StoryObj } from "@storybook/react";
import { ReviewResponseAgentWorkflowCanvas } from "@/app/components/reviews/ReviewResponseAgentWorkflowCanvas";

const meta: Meta<typeof ReviewResponseAgentWorkflowCanvas> = {
  title: "App/ReviewResponseAgentWorkflowCanvas",
  component: ReviewResponseAgentWorkflowCanvas,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="flex h-screen flex-col p-6 bg-background">
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof ReviewResponseAgentWorkflowCanvas>;

export const Default: Story = {};

export const AgentPanelOpen: Story = {
  name: "Agent panel open",
};

export const TriggerPanelOpen: Story = {
  name: "Trigger panel open",
};
