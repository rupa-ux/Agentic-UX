import { Sparkles } from "lucide-react";
import type { AppView } from "../App";

interface TopBarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

export function TopBar({ currentView, onViewChange }: TopBarProps) {
  return (
    <div className="h-[56px] bg-[#e0e5eb] dark:bg-[#181b22] flex items-center justify-between px-4 shrink-0 transition-colors duration-300" data-no-print>
      {/* Left: Reports heading */}
      <p className="text-[16px] text-[#212121] dark:text-[#e4e4e4] tracking-[-0.31px]" style={{ fontWeight: 400 }}>
        {currentView === "inbox" ? "Inbox" : currentView === "storybook" ? "Component showcase" : currentView === "reviews" ? "Reviews" : currentView === "social" ? "Social AI" : currentView === "searchai" ? "Search AI" : currentView === "contacts" ? "Contacts" : currentView === "scheduled-deliveries" ? "Scheduled deliveries" : currentView === "agents" ? "Myna AI" : currentView === "agents-monitor" ? "Myna AI" : currentView === "agents-builder" ? "Myna AI" : currentView === "agents-onboarding" ? "BirdAI setup" : currentView === "agent-detail" ? "Myna AI" : currentView === "schedule-builder" ? "Scheduled deliveries" : currentView === "birdai-reports" ? "Myna AI" : "Reports"}
      </p>

      {/* Right: BirdAI button */}
      <div className="flex items-center gap-1">
        <button className="flex items-center gap-1 px-2 py-1 rounded-[8px] border border-[#e5e9f0] dark:border-[#333a47] bg-[#f0f1f5] dark:bg-[#252a3a] ml-1">
          <Sparkles className="w-[14px] h-[14px] text-[#9970D7]" />
          <span className="text-[12px] bg-gradient-to-r from-[#9970D7] to-[#2552ED] bg-clip-text text-transparent">Ask Myna AI</span>
        </button>
      </div>
    </div>
  );
}