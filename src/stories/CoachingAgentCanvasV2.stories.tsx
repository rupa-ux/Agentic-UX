import type { Meta, StoryObj } from "@storybook/react";
import { CoachingAgentCanvasV2 } from "@/app/components/reviews/CoachingAgentCanvas.v2";
import {
  AGENTS_BUILDER_NORTH_AUTONOMOUS_PRESET_ID,
  AGENTS_BUILDER_NORTH_AUTONOMOUS_DISPLAY_NAME,
} from "@/app/components/AgentsBuilderView.v1";

const northAgent = {
  id: AGENTS_BUILDER_NORTH_AUTONOMOUS_PRESET_ID,
  name: AGENTS_BUILDER_NORTH_AUTONOMOUS_DISPLAY_NAME,
};

const meta: Meta<typeof CoachingAgentCanvasV2> = {
  title: "App/CoachingAgentCanvasV2",
  component: CoachingAgentCanvasV2,
  parameters: { layout: "fullscreen" },
  args: {
    agent: northAgent,
    onBack: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof CoachingAgentCanvasV2>;

export const Default: Story = {};
