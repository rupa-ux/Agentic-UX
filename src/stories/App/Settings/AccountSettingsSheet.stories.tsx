import { useState, type ChangeEvent } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AccountSettingsSheet } from "@/app/components/settings/AccountSettingsSheet";
import { Button } from "@/app/components/ui/button";

const DEMO_AVATAR =
  "https://images.unsplash.com/photo-1617853701628-bfcf8b81d13d?w=512&h=512&fit=crop";

const meta: Meta<typeof AccountSettingsSheet> = {
  title: "App/Settings/Account settings",
  component: AccountSettingsSheet,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Shared **account** surface: profile and password fields live **inside** a **floating** right `Sheet` (340px wide, inset from the viewport with rounded corners). Open from **My profile** on the L1 profile menu. Primary actions (e.g. **Change password**) align **bottom-right**. Use the Storybook **Theme** toolbar for light/dark checks.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AccountSettingsSheet>;

function AccountSettingsDemo() {
  const [open, setOpen] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(DEMO_AVATAR);

  const onAvatarUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col gap-4">
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        Open account settings
      </Button>
      <AccountSettingsSheet
        open={open}
        onOpenChange={setOpen}
        avatarUrl={avatarUrl}
        onAvatarUpload={onAvatarUpload}
        defaultFirstName="Josef"
        defaultLastName="Albers"
        defaultEmail="josef@subframe.com"
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <AccountSettingsDemo />,
};
