import type { Meta, StoryObj } from "@storybook/react";
import { AppointmentSettingsTab } from "@/app/components/appointments/AppointmentSettingsTab";

const meta: Meta<typeof AppointmentSettingsTab> = {
  title: "App/AppointmentSettingsTab",
  component: AppointmentSettingsTab,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="flex h-screen flex-col bg-background">
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof AppointmentSettingsTab>;

export const Default: Story = {};

export const VoiceOnly: Story = {
  args: {
    initialSettings: {
      channels: [
        {
          channel: "voice",
          enabled: true,
          conditions: [
            { id: "v1", text: "Schedule appointment" },
            { id: "v2", text: "Reschedule" },
          ],
        },
        { channel: "chat", enabled: false, conditions: [] },
        { channel: "sms", enabled: false, conditions: [] },
      ],
    },
  },
};

export const AllChannelsEnabled: Story = {
  args: {
    initialSettings: {
      channels: [
        {
          channel: "voice",
          enabled: true,
          conditions: [{ id: "v1", text: "Book appointment" }],
        },
        {
          channel: "chat",
          enabled: true,
          conditions: [{ id: "c1", text: "Find available slots" }],
        },
        {
          channel: "sms",
          enabled: true,
          conditions: [{ id: "s1", text: "Confirm appointment" }],
        },
      ],
    },
  },
};

export const NoLocations: Story = {
  args: {
    initialSettings: {
      locations: [],
    },
  },
};
