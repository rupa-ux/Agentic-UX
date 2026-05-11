import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { ResponseAgentLibraryTemplateCard } from "@/app/components/reviews/ResponseAgentLibraryTemplateCard";
import { RESPONSE_AGENT_LIBRARY_TEMPLATES } from "@/app/components/reviews/responseAgentLibraryTemplates";

const template = RESPONSE_AGENT_LIBRARY_TEMPLATES[1]!;

const meta: Meta<typeof ResponseAgentLibraryTemplateCard> = {
  title: "App/Reviews/Response agent library template card",
  component: ResponseAgentLibraryTemplateCard,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof ResponseAgentLibraryTemplateCard>;

export const Default: Story = {
  args: {
    template,
    onUseAgent: fn(),
  },
  decorators: [
    (StoryEl) => (
      <div className="w-[320px]">
        <StoryEl />
      </div>
    ),
  ],
};
