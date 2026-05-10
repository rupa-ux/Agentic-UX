import type { Meta, StoryObj } from "@storybook/react";
import { MetricCard } from "@/app/components/AgentsMonitorView.v1";

const meta: Meta<typeof MetricCard> = {
  title: "UI/MetricCard",
  component: MetricCard,
  parameters: { layout: "centered" },
  args: {
    value: "835",
    label: "Reviews responded",
    delta: "+1.3%",
    tooltip: "Total reviews responded to by the agent this period",
    deltaVariant: "positive",
    valueVariant: "default",
  },
  argTypes: {
    deltaVariant: { control: "radio", options: ["positive", "negative"] },
    valueVariant: { control: "radio", options: ["default", "destructive"] },
    tooltip: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof MetricCard>;

export const Default: Story = {};

export const PositiveDelta: Story = {
  name: "Positive delta",
  args: {
    value: "591h",
    label: "Time saved",
    delta: "+4.2%",
    tooltip: "Cumulative hours saved through agent automation this period",
  },
};

export const NegativeDelta: Story = {
  name: "Negative delta",
  args: {
    value: "2",
    label: "Needs attention",
    delta: "+1",
    deltaVariant: "negative",
    valueVariant: "destructive",
    tooltip: "Agents requiring manual review or configuration changes",
  },
};

export const NoDelta: Story = {
  name: "No delta",
  args: {
    value: "21",
    label: "Running agents",
    delta: undefined,
    tooltip: "Total agents currently active across all personas",
  },
};

export const NoTooltip: Story = {
  name: "No tooltip",
  args: {
    value: "21",
    label: "Running agents",
    delta: "+2.4%",
    tooltip: undefined,
  },
};

export const AllCards: Story = {
  name: "All cards — grid",
  render: () => (
    <div className="grid grid-cols-4 gap-4 w-[800px]">
      <MetricCard
        value="21"
        label="Running agents"
        delta="+2.4%"
        tooltip="Total agents currently active across all personas"
      />
      <MetricCard
        value="591h"
        label="Time saved"
        delta="+4.2%"
        tooltip="Cumulative hours saved through agent automation this period"
      />
      <MetricCard
        value="$41.6K"
        label="Cost saved"
        delta="+8.1%"
        tooltip="Estimated cost savings from automated agent runs this period"
      />
      <MetricCard
        value="2"
        label="Needs attention"
        delta="+1"
        deltaVariant="negative"
        valueVariant="destructive"
        tooltip="Agents requiring manual review or configuration changes"
      />
    </div>
  ),
};
