import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { BirdAILoginPage } from "@/app/components/auth/BirdAILoginPage";

const meta: Meta<typeof BirdAILoginPage> = {
  title: "App/Auth/Login",
  component: BirdAILoginPage,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Demo **Bird AI** login (ElevenLabs-inspired layout + SSO mock from Implementssologinflow). Primary actions use **design tokens**. In the app, this screen appears after **Sign out**; session is stored in `sessionStorage` under `birdai_demo_authenticated`.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BirdAILoginPage>;

export const Default: Story = {
  render: () => <BirdAILoginPage onAuthenticated={fn()} />,
};
