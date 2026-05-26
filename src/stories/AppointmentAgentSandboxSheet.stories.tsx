import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/app/components/ui/button";
import {
  APPOINTMENT_AGENT_SANDBOX_PANEL_WIDTH,
  AppointmentAgentSandboxPanel,
} from "@/app/components/appointments/AppointmentAgentSandboxSheet";
import { SlidingSidePanel } from "@/app/components/layout/SlidingSidePanel";

const meta: Meta<typeof AppointmentAgentSandboxPanel> = {
  title: "App/Appointments/AppointmentAgentSandboxSheet",
  component: AppointmentAgentSandboxPanel,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof AppointmentAgentSandboxPanel>;

function PushLayoutDemo({ initialOpen = true }: { initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center p-8 text-[13px] text-muted-foreground">
        Main recommendation content (pushed when sandbox opens)
      </div>
      <SlidingSidePanel
        side="right"
        open={open}
        widthPx={APPOINTMENT_AGENT_SANDBOX_PANEL_WIDTH}
        innerClassName="border-l border-border bg-background"
      >
        <AppointmentAgentSandboxPanel onClose={() => setOpen(false)} />
      </SlidingSidePanel>
      {!open ? (
        <Button
          type="button"
          className="absolute bottom-8 right-8"
          onClick={() => setOpen(true)}
        >
          Open sandbox
        </Button>
      ) : null}
    </div>
  );
}

export const Default: Story = {
  render: () => <PushLayoutDemo />,
};

export const Closed: Story = {
  name: "Panel closed",
  render: () => <PushLayoutDemo initialOpen={false} />,
};
