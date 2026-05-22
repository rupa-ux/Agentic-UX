import type { Meta, StoryObj } from "@storybook/react";
import { AppointmentRecommendationTab } from "@/app/components/appointments/AppointmentRecommendationTab";

const meta: Meta<typeof AppointmentRecommendationTab> = {
  title: "App/Appointments/AppointmentRecommendationTab",
  component: AppointmentRecommendationTab,
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
type Story = StoryObj<typeof AppointmentRecommendationTab>;

export const Default: Story = {};

export const SameDayPolicySelected: Story = {
  name: "Same-day & urgent policy selected",
};
