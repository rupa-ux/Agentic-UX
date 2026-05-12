import type { Meta, StoryObj } from "@storybook/react";
import { CoachingAgentCanvas } from "@/app/components/reviews/CoachingAgentCanvas";
import {
  AGENTS_BUILDER_NORTH_AUTONOMOUS_PRESET_ID,
  AGENTS_BUILDER_NORTH_AUTONOMOUS_DISPLAY_NAME,
} from "@/app/components/AgentsBuilderView.v1";

const northAgent = {
  id: AGENTS_BUILDER_NORTH_AUTONOMOUS_PRESET_ID,
  name: AGENTS_BUILDER_NORTH_AUTONOMOUS_DISPLAY_NAME,
};

const meta: Meta<typeof CoachingAgentCanvas> = {
  title: "App/CoachingAgentCanvas",
  component: CoachingAgentCanvas,
  parameters: { layout: "fullscreen" },
  args: {
    agent: northAgent,
    highlightNodeIds: ["north-node-response-generation", "north-node-review-details"],
    onBack: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof CoachingAgentCanvas>;

export const Default: Story = {};

export const SingleNodeHighlighted: Story = {
  name: "Single node highlighted",
  args: {
    highlightNodeIds: ["north-node-response-generation"],
  },
};

export const AllNodesHighlighted: Story = {
  name: "All nodes highlighted",
  args: {
    highlightNodeIds: ["north-node-response-generation", "north-node-review-details"],
  },
};
