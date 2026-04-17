import { Sparkles } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { VersionSwitcher } from "@/app/components/VersionSwitcher";
import { APP_SHELL_RAIL_SURFACE_CLASS } from "@/app/components/layout/appShellClasses";
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
    <div
      className={`h-[48px] flex items-center justify-between px-4 shrink-0 rounded-tr-lg ${APP_SHELL_RAIL_SURFACE_CLASS}`}
      data-no-print
    >
      {/* Left: current area (aligned with L1 rail / route) */}
      <p className="text-[16px] text-[#212121] dark:text-[#e4e4e4] tracking-[-0.31px]" style={{ fontWeight: 400 }}>
        {getAppViewTitle(currentView)}
      </p>

      {/* Right: design version (dev) + BirdAI */}
      <div className="flex items-center gap-2">
        {/* <VersionSwitcher /> */}
        <Button
          type="button"
          variant="outline"
          onClick={onToggleMynaChat}
          className="ml-1 h-[30px] min-h-[30px] gap-1 rounded-lg border-[#e5e9f0] bg-app-shell-l2-surface px-2 py-0 text-[12px] leading-none dark:border-[#333a47] dark:bg-[#252a3a]"
        >
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#9970D7]" />
          <span className="bg-gradient-to-r from-[#9970D7] to-[#2552ED] bg-clip-text text-transparent leading-none">
            {MYNA_CHAT_HEADER_TITLE}
          </span>
        </Button>
      </div>
    </div>
  );
}