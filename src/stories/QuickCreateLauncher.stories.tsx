import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { QuickCreateLauncher } from "@/app/components/QuickCreateLauncher";

const meta: Meta<typeof QuickCreateLauncher> = {
  title: "App/QuickCreateLauncher",
  component: QuickCreateLauncher,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "**Create** launcher (TopBar +). `cardVariant`: **`noSubtext`** (default) — icon + title only; descriptions are folded into each button’s `aria-label`. **`withSubtext`** — two-line cards with the gray description under the title.",
      },
    },
  },
  argTypes: {
    cardVariant: {
      control: "inline-radio",
      options: ["noSubtext", "withSubtext"],
      description: "CTA card density",
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-[460px] w-full max-w-[1200px] p-8">
        <div className="mb-4 flex items-center justify-end gap-2 rounded-lg border border-[#e5e9f0] bg-app-shell-rail p-2">
          <Story />
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof QuickCreateLauncher>;

export const Default: Story = {
  name: "No subtext (default)",
  args: {
    cardVariant: "noSubtext",
    onActionSelect: fn(),
  },
};

export const WithSubtext: Story = {
  name: "With subtext",
  args: {
    cardVariant: "withSubtext",
    onActionSelect: fn(),
  },
};
