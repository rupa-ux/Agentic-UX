import type { Meta, StoryObj } from "@storybook/react";
import {
  AppointmentPoliciesTab,
  APPOINTMENT_DEFAULT_POLICIES,
} from "@/app/components/appointments/AppointmentPoliciesTab";

const meta: Meta<typeof AppointmentPoliciesTab> = {
  title: "App/Appointments/AppointmentPoliciesTab",
  component: AppointmentPoliciesTab,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="flex h-screen flex-col bg-background pt-6">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AppointmentPoliciesTab>;

export const Default: Story = {};

export const Empty: Story = {
  name: "Empty state",
  args: {
    initialPolicies: [],
  },
};

export const SinglePolicy: Story = {
  name: "Single policy",
  args: {
    initialPolicies: APPOINTMENT_DEFAULT_POLICIES.slice(0, 1),
  },
};
