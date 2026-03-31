import { Sparkles } from "lucide-react";
import type { AppView } from "../App";
import { getAppViewTitle } from "../appViewTitle";
import { MYNA_CHAT_HEADER_TITLE } from "../myna/mynaChatChrome";

interface TopBarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  mynaChatOpen?: boolean;
  onToggleMynaChat?: () => void;
}

export function TopBar({ currentView, onToggleMynaChat }: TopBarProps) {
  return (
    <div className="h-[56px] bg-[#e0e5eb] dark:bg-[#181b22] flex items-center justify-between px-4 shrink-0 transition-colors duration-300 rounded-tr-lg" data-no-print>
      {/* Left: current area (aligned with L1 rail / route) */}
      <p className="text-[16px] text-[#212121] dark:text-[#e4e4e4] tracking-[-0.31px]" style={{ fontWeight: 400 }}>
        {getAppViewTitle(currentView)}
      </p>

      {/* Right: BirdAI button */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onToggleMynaChat}
          className="flex items-center gap-1 px-2 py-1 rounded-[8px] border border-[#e5e9f0] dark:border-[#333a47] bg-[#f0f1f5] dark:bg-[#252a3a] ml-1"
        >
          <Sparkles className="w-[14px] h-[14px] text-[#9970D7]" />
          <span className="text-[12px] bg-gradient-to-r from-[#9970D7] to-[#2552ED] bg-clip-text text-transparent">
            {MYNA_CHAT_HEADER_TITLE}
          </span>
        </button>
      </div>
    </div>
  );
}