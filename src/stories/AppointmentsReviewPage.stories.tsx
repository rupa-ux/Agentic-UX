import type { Meta, StoryObj } from "@storybook/react";
import { AppointmentsReviewPage } from "@/app/components/appointments/AppointmentsReviewPage";

const meta: Meta<typeof AppointmentsReviewPage> = {
  title: "App/Appointments/AppointmentsReviewPage",
  component: AppointmentsReviewPage,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="h-screen bg-background">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AppointmentsReviewPage>;

export const Default: Story = {};
