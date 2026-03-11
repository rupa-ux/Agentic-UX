import { useState, useRef, useEffect } from "react";
import { HelpCircle, Settings, Plus, Sparkles, ChevronDown, Share2, User, LogOut } from "lucide-react";
import type { AppView } from "../App";

interface TopBarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

export function TopBar({ currentView, onViewChange }: TopBarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="h-[56px] bg-[#e0e5eb] border-b border-[#e5e9f0] flex items-center justify-between px-4 shrink-0" data-no-print>
      {/* Left: Reports heading (positioned over the L2 nav column) */}
      <p className="text-[16px] text-[#212121] tracking-[-0.31px]" style={{ fontWeight: 400 }}>Reports</p>

      {/* Right: Action buttons */}
      <div className="flex items-center gap-1">
        <button className="p-1.5 rounded-full hover:bg-[#f5f5f5]">
          
        </button>
        <button className="p-1.5 rounded-full hover:bg-[#f5f5f5]">
          
        </button>
        <button className="p-1.5 rounded-full hover:bg-[#f5f5f5]">
          <Settings className="w-5 h-5 text-[#555]" />
        </button>

        {/* Profile avatar with dropdown */}
        <div className="relative ml-1" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-1 hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#9970D7] to-[#2552ED] flex items-center justify-center">
              <span className="text-white text-[11px]" style={{ fontWeight: 400 }}>JD</span>
            </div>
            <ChevronDown className="w-3 h-3 text-[#999]" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full mt-1.5 bg-white rounded-xl shadow-[0px_4px_24px_rgba(0,0,0,0.14)] border border-[#e8eaed] w-[230px] z-50 overflow-hidden">
              {/* Profile header */}
              <div className="px-4 py-3 border-b border-[#f0f0f0]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#9970D7] to-[#2552ED] flex items-center justify-center shrink-0">
                    <span className="text-white text-[13px]" style={{ fontWeight: 400 }}>JD</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] text-[#212121] truncate" style={{ fontWeight: 400 }}>John Doe</p>
                    <p className="text-[11px] text-[#999] truncate">john.doe@acmecorp.com</p>
                  </div>
                </div>
              </div>
              {/* Menu items */}
              <div className="py-1.5">
                <button className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-[#212121] hover:bg-[#f5f5f5] transition-colors">
                  <User className="w-4 h-4 text-[#555]" />
                  My profile
                </button>
                <button
                  onClick={() => {
                    onViewChange("shared-by-me");
                    setProfileOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-[13px] transition-colors ${
                    currentView === "shared-by-me"
                      ? "text-[#2552ED] bg-[#e8effe]"
                      : "text-[#212121] hover:bg-[#f5f5f5]"
                  }`}
                >
                  <Share2 className="w-4 h-4" style={{ color: currentView === "shared-by-me" ? "#2552ED" : "#555" }} />
                  Shared by me
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-[#212121] hover:bg-[#f5f5f5] transition-colors">
                  <Settings className="w-4 h-4 text-[#555]" />
                  Settings
                </button>
              </div>
              <div className="border-t border-[#f0f0f0] py-1.5">
                <button className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-[#C62828] hover:bg-[#fce4ec] transition-colors">
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>

        <button className="flex items-center gap-1 px-2 py-1 rounded-lg border border-[#e8def6] bg-[#f0f1f5] ml-1">
          <Sparkles className="w-4 h-4 text-[#9970D7]" />
          <span className="text-[12px] bg-gradient-to-r from-[#9970D7] to-[#2552ED] bg-clip-text text-transparent">Ask BirdGPT</span>
        </button>
      </div>
    </div>
  );
}