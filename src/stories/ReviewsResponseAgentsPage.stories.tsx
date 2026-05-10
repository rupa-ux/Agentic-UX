import type { Meta, StoryObj } from "@storybook/react";
import { ReviewsResponseAgentsPage } from "@/app/components/reviews/ReviewsResponseAgentsPage";

const meta: Meta<typeof ReviewsResponseAgentsPage> = {
  title: "App/Reviews/ReviewsResponseAgentsPage",
  component: ReviewsResponseAgentsPage,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof ReviewsResponseAgentsPage>;

export const Default: Story = {};
