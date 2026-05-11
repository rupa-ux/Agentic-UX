import type { Meta, StoryObj } from "@storybook/react";
import { AgentsBuilderView } from "@/app/components/AgentsBuilderView.v1";

const meta: Meta<typeof AgentsBuilderView> = {
  title: "App/Reviews/AgentsBuilderView",
  component: AgentsBuilderView,
  parameters: { layout: "fullscreen" },
  args: { onBack: () => {} },
};
export default meta;
type Story = StoryObj<typeof AgentsBuilderView>;

export const Default: Story = {};

export const LibraryPicker: Story = { args: { initialPhase: "library" } };

export const WithAgentName: Story = {
  args: {
    agentName: "Review response agent replying autonomously",
    initialPhase: "building",
  },
};
