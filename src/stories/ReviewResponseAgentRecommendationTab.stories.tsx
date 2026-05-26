import type { Meta, StoryObj } from "@storybook/react";
import { ReviewResponseAgentRecommendationTab } from "@/app/components/reviews/ReviewResponseAgentRecommendationTab";

const meta: Meta<typeof ReviewResponseAgentRecommendationTab> = {
  title: "App/ReviewResponseAgentRecommendationTab",
  component: ReviewResponseAgentRecommendationTab,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="h-screen flex flex-col bg-background">
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof ReviewResponseAgentRecommendationTab>;

export const Default: Story = {};
