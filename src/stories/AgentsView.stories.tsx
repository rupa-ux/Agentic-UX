import type { Meta, StoryObj } from "@storybook/react";
import { AgentsView } from "@/app/components/AgentsView";
import { AgentsMonitorView } from "@/app/components/AgentsMonitorView";
import { AgentsBuilderView } from "@/app/components/AgentsBuilderView";

const viewMeta: Meta = {
  title: "App/Views/Agents",
  parameters: { layout: "fullscreen" },
};

export default viewMeta;
type Story = StoryObj;

export const AgentsList: Story = {
  render: () => <AgentsView onViewChange={() => {}} />,
};

export const AgentsMonitor: Story = {
  render: () => <AgentsMonitorView onViewChange={() => {}} />,
};

export const AgentsBuilder: Story = {
  render: () => <AgentsBuilderView onViewChange={() => {}} />,
};
