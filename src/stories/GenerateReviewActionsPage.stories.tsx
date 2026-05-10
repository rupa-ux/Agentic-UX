import type { Meta, StoryObj } from "@storybook/react";
import { GenerateReviewActionsPage } from "@/app/components/reviews/GenerateReviewActionsPage";

const meta: Meta<typeof GenerateReviewActionsPage> = {
  title: "App/Reviews/GenerateReviewActionsPage",
  component: GenerateReviewActionsPage,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof GenerateReviewActionsPage>;

export const Default: Story = {};
