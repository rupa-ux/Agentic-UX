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

export const PlaybookTab: Story = {
  name: "Playbook tab (healthcare)",
};

export const RulesTab: Story = {
  name: "Rules tab (healthcare)",
};
