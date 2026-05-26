import type { Meta, StoryObj } from "@storybook/react";
import { AppointmentsManagementAgentsPage } from "@/app/components/appointments/AppointmentsManagementAgentsPage";

const meta: Meta<typeof AppointmentsManagementAgentsPage> = {
  title: "App/Appointments/AppointmentsManagementAgentsPage",
  component: AppointmentsManagementAgentsPage,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof AppointmentsManagementAgentsPage>;

export const Default: Story = {};

export const ProceduresTab: Story = {
  name: "Procedures tab (healthcare)",
};

export const PoliciesTab: Story = {
  name: "Policies tab (healthcare)",
};
