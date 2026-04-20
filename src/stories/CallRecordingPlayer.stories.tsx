import type { Meta, StoryObj } from "@storybook/react";
import { CallRecordingPlayer } from "@/app/components/CallRecordingPlayer";

/**
 * Wraps the player in the same inbox detail-panel shell used by InboxView so
 * the story faithfully matches the in-app appearance.
 */
function InboxDetailShell() {
  return (
    <div className="flex h-screen flex-col bg-[#f5f6f8] dark:bg-[#13161b] transition-colors duration-300">
      {/* Simulated detail header */}
      <div className="flex h-[60px] shrink-0 items-center justify-between bg-[#f5f6f8] px-5 dark:bg-[#13161b] border-b border-[#eaeaea] dark:border-[#333a47]">
        <span className="text-[16px] text-[#212121] dark:text-[#e4e4e4]" style={{ fontWeight: 400 }}>
          Alex K.
        </span>
        <span className="text-[13px] text-[#999] dark:text-[#6b7280]" style={{ fontWeight: 400 }}>
          Assigned: Sarah M.
        </span>
      </div>

      {/* Scrollable messages area — matches InboxView's chatMessagesRef div */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <CallRecordingPlayer />
      </div>

      {/* Simulated composer bar */}
      <div className="bg-transparent px-4 py-4">
        <div className="flex items-center gap-3 rounded-xl border border-[#eaeaea] dark:border-[#333a47] bg-white dark:bg-[#262b35] px-4 py-3">
          <span className="flex-1 text-[14px] text-[#b0b0b0] dark:text-[#4d5568]" style={{ fontWeight: 400 }}>
            Send a follow-up message…
          </span>
        </div>
      </div>
    </div>
  );
}

const meta: Meta = {
  title: "App/Views/CallRecordingPlayer",
  component: InboxDetailShell,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Call recording player embedded inside the Inbox detail panel. " +
          "Sticky audio bar (play/pause, ×1/×2.5/×3 speed, +15s skip, timeline scrubber) " +
          "sits above a transcript that uses the exact same agent/customer bubble styles as InboxView. " +
          "Language switcher (English / French / Spanish) translates all bubbles instantly. " +
          "Create Ticket opens a pre-filled FloatingSheetFrame. " +
          "Dummy transcript: customer support resolving a shoe size dispute (ordered 9, received 8).",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof InboxDetailShell>;

export const Default: Story = {};
