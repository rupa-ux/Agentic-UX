import type { Meta, StoryObj } from "@storybook/react";
import { AppointmentsWaitlistPage } from "@/app/components/appointments/AppointmentsWaitlistPage";

const meta: Meta<typeof AppointmentsWaitlistPage> = {
  title: "App/Appointments/AppointmentsWaitlistPage",
  component: AppointmentsWaitlistPage,
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
type Story = StoryObj<typeof AppointmentsWaitlistPage>;

export const Default: Story = {};
