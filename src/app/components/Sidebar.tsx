import { useState, useRef, useEffect } from "react";
import {
  ChevronDown, ChevronUp, Settings, User, LogOut, Camera, Moon, Sun, Monitor, ChevronLeft, Share2, Palette, Clock, Sparkles,
} from "lucide-react";
import {
  House, ChatDots, MapPin, Star, Gift, CurrencyDollar,
  CalendarDots, Graph, ClipboardText, Ticket, Users,
  MegaphoneSimple, Globe, Lightbulb, ChartBar, Sparkle,
} from "@phosphor-icons/react";
import svgPaths from "../../imports/svg-y1gexucine";
import svgPathsReviews from "../../imports/svg-w1z8z09mht";
import type { AppView } from "../App";
import { useTheme, type ThemePreference } from "./useTheme";

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1617853701628-bfcf8b81d13d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBoZWFkc2hvdCUyMHNtaWxlJTIwc3R1ZGlvJTIwbGlnaHRpbmd8ZW58MXx8fHwxNzczMjE4MDIzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

/* ─── Icon-strip items — Phosphor Icons ─── */
const iconStripItems: { label: string; Icon: React.ElementType }[] = [
  { label: "Agents",       Icon: Sparkle        },
  { label: "Home",         Icon: House          },
  { label: "Inbox",        Icon: ChatDots       },
  { label: "Listings",     Icon: MapPin         },
  { label: "Reviews",      Icon: Star           },
  { label: "Referrals",    Icon: Gift           },
  { label: "Payments",     Icon: CurrencyDollar },
  { label: "Appointments", Icon: CalendarDots   },
  { label: "Social",       Icon: Graph          },
  { label: "Surveys",      Icon: ClipboardText  },
  { label: "Ticketing",    Icon: Ticket         },
  { label: "Contacts",     Icon: Users          },
  { label: "Campaigns",    Icon: MegaphoneSimple},
  { label: "Reports",      Icon: Globe          },
  { label: "Insights",     Icon: Lightbulb      },
  { label: "Competitors",  Icon: ChartBar       },
];

/* ─── Reports nav sections ─── */
const reportSections = [
  {
    label: "Reviews",
    expandable: true,
    children: [
      { label: "Overview" },
      { label: "Review sites" },
    ],
  },
  {
    label: "Inbox",
    expandable: true,
    children: [
      { label: "All messages" },
      { label: "Unread" },
    ],
  },
  {
    label: "Listings",
    expandable: true,
    children: [
      { label: "Accuracy" },
      { label: "Google" },
    ],
  },
  {
    label: "Social",
    expandable: true,
    defaultExpanded: true,
    children: [
      { label: "Profile performance", active: true },
      { label: "Response trends" },
      { label: "Facebook" },
      { label: "Instagram" },
      { label: "LinkedIn" },
      { label: "TikTok" },
    ],
  },
  { label: "Surveys", expandable: true },
  { label: "Campaigns", expandable: true },
  { label: "Workflows", expandable: false },
  { label: "Ticketing", expandable: true },
  { label: "Contacts", expandable: true },
];

const dashboardGroups = [
  { label: "Default", expandable: true, view: "dashboard" as AppView },
  { label: "Created by me", expandable: true, view: "dashboard" as AppView },
  { label: "Shared with me", expandable: true, view: "dashboard" as AppView },
  { label: "Shared by me", expandable: false, view: "shared-by-me" as AppView },
];

/* ═══════════════════════════════════════════
   Icon Strip (L1 nav rail) – exported separately
   ═══════════════════════════════════════════ */
interface IconStripProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  /** Icon size in px. Defaults to 18. */
  iconSize?: number;
}

export function IconStrip({ currentView, onViewChange, iconSize = 18 }: IconStripProps) {
  const [activeIcon, setActiveIcon] = useState("Agents");
  const [profileOpen, setProfileOpen] = useState(false);
  const [showAppearance, setShowAppearance] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isDark, preference, setPreference } = useTheme();

  const [avatarUrl, setAvatarUrl] = useState<string>(() => {
    return localStorage.getItem("profile_avatar") || DEFAULT_AVATAR;
  });

  // Sync activeIcon with currentView
  useEffect(() => {
    if (currentView === "inbox") setActiveIcon("Inbox");
    else if (currentView === "reviews") setActiveIcon("Reviews");
    else if (currentView === "social") setActiveIcon("Social");
    else if (currentView === "searchai") setActiveIcon("Insights");
    else if (currentView === "contacts") setActiveIcon("Contacts");
    else if (currentView === "dashboard" || currentView === "shared-by-me") setActiveIcon("Reports");
    else if (currentView === "agents" || currentView === "agents-monitor" || currentView === "agents-builder" || currentView === "agent-detail" || currentView === "agents-onboarding" || currentView === "birdai-reports") setActiveIcon("Agents");
    // storybook doesn't map to any icon strip item
  }, [currentView]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatarUrl(dataUrl);
      localStorage.setItem("profile_avatar", dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
        setShowAppearance(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="w-[66px] bg-[#e0e5eb] dark:bg-[#181b22] flex flex-col items-center shrink-0 transition-colors duration-300" data-no-print>
      {/* Birdeye logo */}
      <div className="h-[56px] w-[55px] flex items-center justify-center shrink-0">
        <svg width="19.5" height="18.75" viewBox="0 0 19.5 18.75" fill="none">
          <path clipRule="evenodd" d={svgPaths.p23fcc000} fill="#2552ED" fillRule="evenodd" />
        </svg>
      </div>

      {/* Icon buttons */}
      <div className="flex flex-col items-center px-[12px] py-[8px] gap-[2px] flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {iconStripItems.map(({ label, Icon }) => {
          const isActive = label === activeIcon;
          return (
            <button
              key={label}
              onClick={() => {
                setActiveIcon(label);
                if (label === "Inbox") onViewChange("inbox");
                else if (label === "Reports") onViewChange("dashboard");
                else if (label === "Reviews") onViewChange("reviews");
                else if (label === "Social") onViewChange("social");
                else if (label === "Insights") onViewChange("searchai");
                else if (label === "Contacts") onViewChange("contacts");
                else if (label === "Agents") onViewChange("agents");
              }}
              className={`
                group relative w-[32px] h-[32px] flex items-center justify-center rounded-[10px] shrink-0
                transition-all duration-200 ease-out outline-none
                focus-visible:ring-2 focus-visible:ring-[#1E44CC]/50 focus-visible:ring-offset-1 focus-visible:ring-offset-[#e0e5eb] dark:focus-visible:ring-offset-[#181b22]
                ${isActive
                  ? "bg-[#dae3f0] dark:bg-[#252d42] shadow-[0_0_0_1px_rgba(30,68,204,0.08)]"
                  : "bg-transparent hover:bg-[#d4dae3] dark:hover:bg-[#282e3a] active:bg-[#c8d0dc] dark:active:bg-[#313845] hover:scale-110 active:scale-95"
                }
              `}
              title={label}
            >
              <Icon
                size={iconSize}
                weight={isActive ? "fill" : "regular"}
                className={`transition-all duration-200 ${
                  isActive
                    ? "text-[#1E44CC] dark:text-[#2952E3]"
                    : "text-[#505050] dark:text-[#9ba2b0] group-hover:scale-110"
                } ${label === "Agents" && isActive ? "animate-[agents-shimmer_3s_ease-in-out_infinite]" : ""}`}
              />
            </button>
          );
        })}
      </div>

      {/* ─── Bottom: Settings + Profile ─── */}
      <div className="flex flex-col items-center gap-2 pb-3 pt-2 shrink-0">
        {/* Agent setup */}
        <button
          onClick={() => onViewChange("agents-onboarding")}
          className={`w-[34px] h-[34px] flex items-center justify-center rounded-full transition-colors ${
            currentView === "agents-onboarding"
              ? "bg-[#dae3f0] dark:bg-[#252d42]"
              : "hover:bg-[#d0d5dc] dark:hover:bg-[#2e3340]"
          }`}
          title="Agent setup"
        >
          <Sparkles className={`w-[14px] h-[14px] ${currentView === "agents-onboarding" ? "text-[#2552ED]" : "text-[#555] dark:text-[#8b92a5]"}`} />
        </button>

        {/* Settings gear */}
        <button
          className="w-[34px] h-[34px] flex items-center justify-center rounded-full hover:bg-[#d0d5dc] dark:hover:bg-[#2e3340] transition-colors"
          title="Settings"
        >
          <Settings className="w-[14px] h-[14px] text-[#555] dark:text-[#8b92a5]" />
        </button>

        {/* Profile avatar with upward dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              if (profileOpen) setShowAppearance(false);
            }}
            className="relative w-[36px] h-[36px] rounded-full overflow-hidden ring-2 ring-white/80 dark:ring-[#3d4555] shadow-sm hover:ring-white dark:hover:ring-[#4d5568] transition-all cursor-pointer"
          >
            <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            {/* Online indicator */}
            <span className="absolute bottom-[1px] right-[1px] w-[10px] h-[10px] bg-[#4caf50] rounded-full border-2 border-[#e0e5eb] dark:border-[#181b22]" />
          </button>

          {/* Dropdown - opens UPWARD from bottom-left */}
          {profileOpen && (
            <div className="absolute left-[calc(100%+8px)] bottom-0 bg-white dark:bg-[#22262f] rounded-xl shadow-[0px_4px_24px_rgba(0,0,0,0.14)] dark:shadow-[0px_4px_24px_rgba(0,0,0,0.4)] border border-[#e8eaed] dark:border-[#333a47] w-[260px] z-50 overflow-hidden transition-colors duration-300">
              {/* Slide between main menu and appearance sub-panel */}
              <div className="relative overflow-hidden">
                <div
                  className="flex transition-transform duration-250 ease-in-out"
                  style={{ transform: showAppearance ? "translateX(-100%)" : "translateX(0)" }}
                >
                  {/* ─── Main menu panel ─── */}
                  <div className="w-full shrink-0">
                    {/* Profile header */}
                    <div className="px-4 py-3 border-b border-[#f0f0f0] dark:border-[#333a47]">
                      <div className="flex items-center gap-3">
                        <div className="relative group shrink-0">
                          <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-[#e8eaed] dark:ring-[#3d4555]">
                            <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all duration-200 cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] text-[#212121] dark:text-[#e4e4e4] truncate" style={{ fontWeight: 400 }}>John Doe</p>
                          <p className="text-[11px] text-[#999] dark:text-[#777] truncate">john.doe@acmecorp.com</p>
                        </div>
                      </div>
                    </div>
                    {/* Menu items */}
                    <div className="py-1.5">
                      <button className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-[#212121] dark:text-[#e4e4e4] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340] transition-colors">
                        <User className="w-4 h-4 text-[#555] dark:text-[#8b92a5]" />
                        My profile
                      </button>
                      <button
                        onClick={() => {
                          onViewChange("shared-by-me");
                          setProfileOpen(false);
                          setShowAppearance(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-[13px] transition-colors ${
                          currentView === "shared-by-me"
                            ? "text-[#2552ED] bg-[#e8effe] dark:bg-[#1e2d5e]"
                            : "text-[#212121] dark:text-[#e4e4e4] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340]"
                        }`}
                      >
                        <Share2 className="w-4 h-4" style={{ color: currentView === "shared-by-me" ? "#2552ED" : undefined }} />
                        Shared by me
                      </button>
                      <button
                        onClick={() => {
                          onViewChange("scheduled-deliveries");
                          setProfileOpen(false);
                          setShowAppearance(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-[13px] transition-colors ${
                          currentView === "scheduled-deliveries"
                            ? "text-[#2552ED] bg-[#e8effe] dark:bg-[#1e2d5e]"
                            : "text-[#212121] dark:text-[#e4e4e4] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340]"
                        }`}
                      >
                        <Clock className="w-4 h-4" style={{ color: currentView === "scheduled-deliveries" ? "#2552ED" : undefined }} />
                        Scheduled deliveries
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-[#212121] dark:text-[#e4e4e4] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340] transition-colors">
                        <Settings className="w-4 h-4 text-[#555] dark:text-[#8b92a5]" />
                        Settings
                      </button>
                      {/* Component showcase */}
                      <button
                        onClick={() => {
                          onViewChange("storybook");
                          setProfileOpen(false);
                          setShowAppearance(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-[13px] transition-colors ${
                          currentView === "storybook"
                            ? "text-[#2552ED] bg-[#e8effe] dark:bg-[#1e2d5e]"
                            : "text-[#212121] dark:text-[#e4e4e4] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340]"
                        }`}
                      >
                        <Palette className="w-4 h-4" style={{ color: currentView === "storybook" ? "#2552ED" : undefined }} />
                        Component showcase
                      </button>
                      {/* Switch appearance – navigates to sub-panel */}
                      <button
                        onClick={() => setShowAppearance(true)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-[#212121] dark:text-[#e4e4e4] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340] transition-colors"
                      >
                        <Moon
                          className="w-4 h-4 text-[#555] dark:text-[#8b92a5] transition-transform duration-500"
                          style={{ transform: isDark ? "rotate(-30deg)" : "rotate(0deg)" }}
                        />
                        Switch appearance
                      </button>
                    </div>
                    <div className="border-t border-[#f0f0f0] dark:border-[#333a47] py-1.5">
                      <button className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-[#C62828] hover:bg-[#fce4ec] dark:hover:bg-[#352530] transition-colors">
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </div>

                  {/* ─── Appearance sub-panel ─── */}
                  <div className="w-full shrink-0">
                    {/* Header row */}
                    <div className="flex items-center gap-2.5 px-3 py-3 border-b border-[#f0f0f0] dark:border-[#333a47]">
                      <button
                        onClick={() => setShowAppearance(false)}
                        className="w-7 h-7 rounded-md border-2 border-[#2552ED] flex items-center justify-center hover:bg-[#e8effe] dark:hover:bg-[#1e2d5e] transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 text-[#2552ED]" />
                      </button>
                      <span className="text-[14px] text-[#212121] dark:text-[#e4e4e4] flex-1" style={{ fontWeight: 400 }}>
                        Switch appearance
                      </span>
                      <Moon
                        className="w-5 h-5 text-[#555] dark:text-[#ccc] transition-transform duration-500"
                        style={{ transform: isDark ? "rotate(-30deg)" : "rotate(0deg)" }}
                      />
                    </div>
                    {/* Theme options */}
                    <div className="py-2">
                      {([
                        { value: "light" as ThemePreference, label: "Light", Icon: Sun },
                        { value: "dark" as ThemePreference, label: "Dark", Icon: Moon },
                        { value: "auto" as ThemePreference, label: "System", Icon: Monitor },
                      ]).map(({ value, label, Icon }) => {
                        const isSelected = preference === value;
                        return (
                          <button
                            key={value}
                            onClick={() => setPreference(value)}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-[13px] transition-colors ${
                              isSelected
                                ? "text-[#2552ED] bg-[#e8effe] dark:bg-[#1e2d5e]"
                                : "text-[#212121] dark:text-[#e4e4e4] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340]"
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <Icon
                                className={`w-4 h-4 transition-transform duration-500 ${
                                  isSelected ? "text-[#2552ED]" : "text-[#555] dark:text-[#8b92a5]"
                                }`}
                                style={{
                                  transform: value === "dark" && isDark ? "rotate(-30deg)" : "rotate(0deg)",
                                }}
                              />
                              {label}
                            </span>
                            {/* Radio indicator */}
                            <span
                              className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-colors ${
                                isSelected
                                  ? "border-[#2552ED]"
                                  : "border-[#ccc] dark:border-[#4d5568]"
                              }`}
                            >
                              {isSelected && (
                                <span className="w-[10px] h-[10px] rounded-full bg-[#2552ED]" />
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   L2 Nav Panel (Reports sub-nav) – exported separately
   ═══════════════════════════════════════════ */
interface L2NavPanelProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

export function L2NavPanel({ currentView, onViewChange }: L2NavPanelProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(["Social"]);

  const toggleExpand = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
    );
  };

  return (
    <div className="w-[220px] bg-[#F0F1F5] dark:bg-[#1e2229] border-r border-[#e5e9f0] dark:border-[#2e3340] rounded-tl-[8px] flex flex-col h-full overflow-hidden shrink-0 transition-colors duration-300" data-no-print>
      {/* Header area: Search + Create dashboard */}
      <div className="px-4 pt-[19px] pb-2 shrink-0">
        {/* Search */}
        <div className="flex items-center gap-2 px-[11px] py-[7px] bg-white dark:bg-[#262b35] border border-[#e5e9f0] dark:border-[#333a47] rounded-[8px] mb-3">
          <span className="text-[13px] text-[#b0b0b0] dark:text-[#6b7280]" style={{ fontWeight: 400 }}>Search</span>
        </div>

        {/* Create dashboard */}
        <button className="flex items-center justify-between w-full px-1 py-1 text-[13px] text-[#212121] dark:text-[#e4e4e4] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340] rounded-[8px] mb-1">
          <div className="flex items-center gap-2">
            <span>Create dashboard</span>
          </div>
          <span className="w-[20px] h-[20px] bg-[#2552ED] rounded-full flex items-center justify-center">
            <span className="text-white text-[13px]" style={{ fontWeight: 400 }}>+</span>
          </span>
        </button>
      </div>

      {/* Scrollable nav */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {/* Dashboard groups */}
        <div className="space-y-[2px] mb-2">
          {dashboardGroups.map(item => {
            const isActive = item.view === currentView && item.view !== "dashboard";
            return (
              <button
                key={item.label}
                onClick={() => onViewChange(item.view)}
                className={`flex items-center justify-between px-[8px] py-[6px] text-[13px] rounded-[8px] w-full transition-colors ${
                  isActive
                    ? "text-[#2552ED] bg-[#e8effe] dark:bg-[#1e2d5e]"
                    : "text-[#212121] dark:text-[#e4e4e4] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340]"
                }`}
                style={{ fontWeight: isActive ? 400 : 300 }}
              >
                <span>{item.label}</span>
                {item.expandable && <ChevronDown className="w-[14px] h-[14px] text-[#999] dark:text-[#6b7280]" />}
              </button>
            );
          })}
        </div>

        {/* Reports label */}
        <div className="px-[8px] pt-[12.5px] pb-[6px]">
          <span className="text-[11px] text-[#999] dark:text-[#6b7280]" style={{ fontWeight: 400 }}>Reports</span>
        </div>

        {/* Report sections */}
        <div className="space-y-[2px]">
          {reportSections.map(section => {
            const isExpanded = expandedItems.includes(section.label);
            return (
              <div key={section.label}>
                <button
                  onClick={() => {
                    if (section.expandable) toggleExpand(section.label);
                    onViewChange("dashboard");
                  }}
                  className={`flex items-center justify-between px-[8px] py-[6px] text-[13px] rounded-[8px] w-full transition-colors ${
                    section.label === "Social" && isExpanded
                      ? "text-[#212121] dark:text-[#e4e4e4]"
                      : "text-[#212121] dark:text-[#e4e4e4] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340]"
                  }`}
                >
                  <span>{section.label}</span>
                  {section.expandable && (
                    isExpanded
                      ? <ChevronUp className="w-[14px] h-[14px] text-[#999] dark:text-[#6b7280]" />
                      : <ChevronDown className="w-[14px] h-[14px] text-[#999] dark:text-[#6b7280]" />
                  )}
                </button>
                {section.children && isExpanded && (
                  <div className="mt-[2px] space-y-[2px]">
                    {section.children.map(child => (
                      <button
                        key={child.label}
                        onClick={() => onViewChange("dashboard")}
                        className={`px-[8px] py-[5px] text-[13px] rounded-[8px] w-full text-left transition-colors ${
                          child.active && currentView === "dashboard"
                            ? "text-[#2552ED] bg-[#e8effe] dark:bg-[#1e2d5e]"
                            : "text-[#212121] dark:text-[#e4e4e4] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340]"
                        }`}
                        style={{ fontWeight: child.active && currentView === "dashboard" ? 400 : 300 }}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Reviews L2 Nav Panel – exported separately
   ═══════════════════════════════════════════ */
const reviewsNavItems = [
  { label: "Send a review request", hasAddIcon: true },
  { label: "Actions", expandable: true },
  { label: "Reports", expandable: true },
  { label: "Competitors", expandable: true },
  { label: "Agents", expandable: true },
  { label: "Settings", expandable: true },
];

export function ReviewsL2NavPanel() {
  return (
    <div className="w-[220px] bg-[#f0f1f5] dark:bg-[#1e2229] border-r border-[#f0f1f5] dark:border-[#2e3340] rounded-tl-[8px] flex flex-col h-full overflow-hidden shrink-0 transition-colors duration-300" data-no-print>
      <div className="flex-1 overflow-y-auto px-2 pt-4 pb-2">
        <div className="flex flex-col gap-1">
          {reviewsNavItems.map(item => (
            <button
              key={item.label}
              className="flex items-center justify-between px-2 py-1 h-[28px] w-[190px] text-[14px] text-[#212121] dark:text-[#e4e4e4] rounded-[4px] hover:bg-[#e4e6ea] dark:hover:bg-[#2e3340] transition-colors tracking-[-0.28px]"
            >
              <span>{item.label}</span>
              {item.hasAddIcon && (
                <div className="w-[20px] h-[20px] flex items-center justify-center">
                  <svg className="w-[15px] h-[15px]" viewBox="0 0 15.1666 15.1666" fill="none">
                    <path d={svgPathsReviews.p21d4a600} fill="#1976D2" />
                  </svg>
                </div>
              )}
              {item.expandable && (
                <div className="w-[20px] h-[20px] flex items-center justify-center">
                  <svg className="w-[9px] h-[5px]" viewBox="0 0 9.01782 5.0176" fill="none">
                    <path d={svgPathsReviews.p5ccaa80} fill="#303030" className="dark:fill-[#8b92a5]" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Social L2 Nav Panel – exported separately
   ═══════════════════════════════════════════ */
interface SocialNavItem {
  label: string;
  hasAddIcon?: boolean;
  expandable?: boolean;
  defaultExpanded?: boolean;
  children?: { label: string; active?: boolean }[];
}

const socialNavItems: SocialNavItem[] = [
  { label: "Create post", hasAddIcon: true },
  { label: "Publish", expandable: true },
  {
    label: "Engage",
    expandable: true,
    defaultExpanded: true,
    children: [
      { label: "View all engagements", active: true },
      { label: "Assigned to me" },
      { label: "Approve replies" },
      { label: "Fix rejected replies" },
      { label: "View spam" },
    ],
  },
  { label: "Reports", expandable: true },
  { label: "Competitors", expandable: true },
  { label: "Libraries", expandable: true },
  { label: "Agents", expandable: true },
  { label: "Settings", expandable: true },
];

export function SocialL2NavPanel() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    socialNavItems.forEach(item => {
      if (item.defaultExpanded) initial[item.label] = true;
    });
    return initial;
  });

  const toggleSection = (label: string) => {
    setExpandedSections(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="w-[220px] bg-[#f0f1f5] dark:bg-[#1e2229] border-r border-[#f0f1f5] dark:border-[#2e3340] rounded-tl-[8px] flex flex-col h-full overflow-hidden shrink-0 transition-colors duration-300" data-no-print>
      <div className="flex-1 overflow-y-auto px-2 pt-4 pb-2">
        <div className="flex flex-col gap-0.5">
          {socialNavItems.map(item => (
            <div key={item.label}>
              <button
                onClick={() => item.expandable && toggleSection(item.label)}
                className={`flex items-center justify-between px-2 py-1.5 w-full text-[14px] text-[#212121] dark:text-[#e4e4e4] rounded-[4px] hover:bg-[#e4e6ea] dark:hover:bg-[#2e3340] transition-colors tracking-[-0.28px]`}
              >
                <span>{item.label}</span>
                {item.hasAddIcon && (
                  <div className="w-[20px] h-[20px] flex items-center justify-center">
                    <svg className="w-[15px] h-[15px]" viewBox="0 0 15.1666 15.1666" fill="none">
                      <path d={svgPathsReviews.p21d4a600} fill="#1976D2" />
                    </svg>
                  </div>
                )}
                {item.expandable && (
                  <div className="w-[20px] h-[20px] flex items-center justify-center">
                    {expandedSections[item.label] ? (
                      <ChevronDown className="w-3 h-3 text-[#303030] dark:text-[#8b92a5]" />
                    ) : (
                      <svg className="w-[9px] h-[5px]" viewBox="0 0 9.01782 5.0176" fill="none">
                        <path d={svgPathsReviews.p5ccaa80} fill="#303030" className="dark:fill-[#8b92a5]" />
                      </svg>
                    )}
                  </div>
                )}
              </button>
              {/* Children */}
              {item.children && expandedSections[item.label] && (
                <div className="flex flex-col gap-0.5 mt-0.5">
                  {item.children.map(child => (
                    <button
                      key={child.label}
                      className={`text-left px-2 py-1.5 text-[13px] rounded-[4px] transition-colors tracking-[-0.26px] ${
                        child.active
                          ? "text-[#2552ED] bg-[#e4e6ea] dark:bg-[#252a3a] dark:text-[#6b9bff]"
                          : "text-[#555] dark:text-[#9ba2b0] hover:bg-[#e4e6ea] dark:hover:bg-[#2e3340]"
                      }`}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Search AI L2 Nav Panel – exported separately
   ═══════════════════════════════════════════ */
interface SearchAINavItem {
  label: string;
  expandable?: boolean;
  defaultExpanded?: boolean;
  children?: { label: string; active?: boolean }[];
}

const searchAINavItems: SearchAINavItem[] = [
  {
    label: "Actions",
    expandable: true,
    defaultExpanded: true,
    children: [
      { label: "Recommendations" },
      { label: "Track progress" },
    ],
  },
  {
    label: "Reports",
    expandable: true,
    defaultExpanded: true,
    children: [
      { label: "Citations" },
      { label: "Visibility", active: true },
      { label: "Rankings" },
      { label: "Sentiment" },
    ],
  },
  {
    label: "Settings",
    expandable: true,
    defaultExpanded: true,
    children: [
      { label: "Prompts" },
    ],
  },
];

export function SearchAIL2NavPanel() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    searchAINavItems.forEach(item => {
      if (item.defaultExpanded) initial[item.label] = true;
    });
    return initial;
  });

  const toggleSection = (label: string) => {
    setExpandedSections(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="w-[220px] bg-[#f0f1f5] dark:bg-[#1e2229] border-r border-[#f0f1f5] dark:border-[#2e3340] rounded-tl-[8px] flex flex-col h-full overflow-hidden shrink-0 transition-colors duration-300" data-no-print>
      <div className="flex-1 overflow-y-auto px-2 pt-4 pb-2">
        <div className="flex flex-col gap-0.5">
          {searchAINavItems.map(item => (
            <div key={item.label}>
              <button
                onClick={() => item.expandable && toggleSection(item.label)}
                className="flex items-center justify-between px-2 py-1.5 w-full text-[14px] text-[#212121] dark:text-[#e4e4e4] rounded-[4px] hover:bg-[#e4e6ea] dark:hover:bg-[#2e3340] transition-colors tracking-[-0.28px]"
              >
                <span>{item.label}</span>
                {item.expandable && (
                  <div className="w-[20px] h-[20px] flex items-center justify-center">
                    {expandedSections[item.label] ? (
                      <ChevronUp className="w-3 h-3 text-[#303030] dark:text-[#8b92a5]" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-[#303030] dark:text-[#8b92a5]" />
                    )}
                  </div>
                )}
              </button>
              {item.children && expandedSections[item.label] && (
                <div className="flex flex-col gap-0.5 mt-0.5">
                  {item.children.map(child => (
                    <button
                      key={child.label}
                      className={`text-left px-2 py-1.5 text-[13px] rounded-[4px] transition-colors tracking-[-0.26px] ${
                        child.active
                          ? "text-[#2552ED] bg-[#e4e6ea] dark:bg-[#252a3a] dark:text-[#6b9bff]"
                          : "text-[#555] dark:text-[#9ba2b0] hover:bg-[#e4e6ea] dark:hover:bg-[#2e3340]"
                      }`}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Contacts L2 Nav Panel – exported separately
   ═══════════════════════════════════════════ */
const contactsNavItems = [
  { label: "Add a contact", hasAddIcon: true },
  { label: "All contacts", active: true },
  { label: "Lists & segments", expandable: true },
  { label: "Settings", expandable: true },
];

export function ContactsL2NavPanel() {
  return (
    <div className="w-[220px] bg-[#f0f1f5] dark:bg-[#1e2229] border-r border-[#f0f1f5] dark:border-[#2e3340] rounded-tl-[8px] flex flex-col h-full overflow-hidden shrink-0 transition-colors duration-300" data-no-print>
      <div className="flex-1 overflow-y-auto px-2 pt-4 pb-2">
        <div className="flex flex-col gap-1">
          {contactsNavItems.map(item => (
            <button
              key={item.label}
              className={`flex items-center justify-between px-2 py-1.5 w-full text-[14px] rounded-[4px] transition-colors tracking-[-0.28px] ${
                item.active
                  ? "text-[#2552ED] bg-[#e4e6ea] dark:bg-[#252a3a] dark:text-[#6b9bff]"
                  : "text-[#212121] dark:text-[#e4e4e4] hover:bg-[#e4e6ea] dark:hover:bg-[#2e3340]"
              }`}
              style={{ fontWeight: 400 }}
            >
              <span>{item.label}</span>
              {item.hasAddIcon && (
                <span className="w-[20px] h-[20px] bg-[#2552ED] rounded-full flex items-center justify-center">
                  <span className="text-white text-[13px]" style={{ fontWeight: 400 }}>+</span>
                </span>
              )}
              {item.expandable && (
                <ChevronDown className="w-3 h-3 text-[#303030] dark:text-[#8b92a5]" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Agents L2 Nav Panel – exported separately
   ═══════════════════════════════════════════ */
interface AgentsL2NavPanelProps {
  currentView: AppView;
  onViewChange: (view: AppView, agentSlug?: string) => void;
  selectedAgentSlug?: string;
}

interface AgentsNavChild {
  label: string;
  view?: AppView;
  agentSlug?: string;
  children?: { label: string; view?: AppView; agentSlug?: string }[];
}

interface AgentsNavItem {
  label: string;
  view?: AppView;
  agentSlug?: string;
  expandable?: boolean;
  defaultExpanded?: boolean;
  hasAddIcon?: boolean;
  isSeparator?: boolean;
  children?: AgentsNavChild[];
}

const agentsNavItems: AgentsNavItem[] = [
  { label: "Create agent", view: "agents-builder" as AppView, hasAddIcon: true },
  { label: "Overview", view: "agents" as AppView },
  { label: "Monitor", view: "agents-monitor" as AppView },
  {
    label: "Product agents",
    expandable: true,
    defaultExpanded: true,
    children: [
      {
        label: "Reviews",
        children: [
          { label: "Review response agent", view: "agent-detail" as AppView, agentSlug: "review-response" },
          { label: "Review generation agent", view: "agent-detail" as AppView, agentSlug: "review-generation" },
        ],
      },
      {
        label: "Social",
        children: [
          { label: "Publishing agent", view: "agent-detail" as AppView, agentSlug: "social-publishing" },
          { label: "Engagement agent", view: "agent-detail" as AppView, agentSlug: "social-engagement" },
        ],
      },
      {
        label: "Listings",
        children: [
          { label: "Listing optimization agent", view: "agent-detail" as AppView, agentSlug: "listing-optimization" },
        ],
      },
      {
        label: "Ticketing",
        children: [
          { label: "Ticket resolution agent", view: "agent-detail" as AppView, agentSlug: "ticket-resolution" },
        ],
      },
    ],
  },
  {
    label: "Data & system agents",
    expandable: true,
    defaultExpanded: false,
    children: [
      { label: "Data source agent", view: "agent-detail" as AppView, agentSlug: "data-source" },
      { label: "CRM mapping agent", view: "agent-detail" as AppView, agentSlug: "crm-mapping" },
      { label: "Sync agent", view: "agent-detail" as AppView, agentSlug: "sync" },
    ],
  },
  {
    label: "Scheduled agents",
    expandable: true,
    defaultExpanded: true,
    children: [
      { label: "Scheduled reports", view: "agent-detail" as AppView, agentSlug: "scheduled-reports" },
      { label: "Automation agents", view: "agent-detail" as AppView, agentSlug: "automation" },
    ],
  },
  { label: "Reports", view: "birdai-reports" as AppView },
];

export function AgentsL2NavPanel({ currentView, onViewChange, selectedAgentSlug }: AgentsL2NavPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    agentsNavItems.forEach(item => {
      if (item.defaultExpanded) initial[item.label] = true;
    });
    return initial;
  });

  const toggleSection = (label: string) => {
    setExpandedSections(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="w-[220px] bg-[#f0f1f5] dark:bg-[#1e2229] border-r border-[#f0f1f5] dark:border-[#2e3340] rounded-tl-[8px] flex flex-col h-full overflow-hidden shrink-0 transition-colors duration-300" data-no-print>
      <div className="flex-1 overflow-y-auto px-2 pt-4 pb-2">
        <div className="flex flex-col gap-0.5">
          {agentsNavItems.map(item => {
            if (item.isSeparator) {
              return <div key="sep" className="h-px bg-[#dfe1e6] dark:bg-[#2e3340] mx-1 my-2" />;
            }
            const isTopActive = item.view && item.view === currentView;
            return (
              <div key={item.label}>
                <button
                  onClick={() => {
                    if (item.view) onViewChange(item.view);
                    else if (item.expandable) toggleSection(item.label);
                  }}
                  className={`flex items-center justify-between px-2 py-1.5 w-full text-[14px] rounded-[4px] transition-colors tracking-[-0.28px] ${
                    isTopActive
                      ? "text-[#2552ED] bg-[#e4e6ea] dark:bg-[#252a3a] dark:text-[#6b9bff]"
                      : "text-[#212121] dark:text-[#e4e4e4] hover:bg-[#e4e6ea] dark:hover:bg-[#2e3340]"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.hasAddIcon && (
                    <div className="w-[20px] h-[20px] flex items-center justify-center">
                      <svg className="w-[15px] h-[15px]" viewBox="0 0 15.1666 15.1666" fill="none">
                        <path d={svgPathsReviews.p21d4a600} fill="#1976D2" />
                      </svg>
                    </div>
                  )}
                  {item.expandable && (
                    <div className="w-[20px] h-[20px] flex items-center justify-center">
                      {expandedSections[item.label] ? (
                        <ChevronDown className="w-3 h-3 text-[#303030] dark:text-[#8b92a5]" />
                      ) : (
                        <svg className="w-[9px] h-[5px]" viewBox="0 0 9.01782 5.0176" fill="none">
                          <path d={svgPathsReviews.p5ccaa80} fill="#303030" className="dark:fill-[#8b92a5]" />
                        </svg>
                      )}
                    </div>
                  )}
                </button>
                {/* Children (L2) */}
                {item.children && expandedSections[item.label] && (
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    {item.children.map(child => {
                      const hasGrandchildren = child.children && child.children.length > 0;
                      const isChildExpanded = expandedSections[child.label];
                      const isChildDetailActive = child.view === "agent-detail" && currentView === "agent-detail" && child.agentSlug === selectedAgentSlug;
                      return (
                        <div key={child.label}>
                          <button
                            onClick={() => {
                              if (child.view) onViewChange(child.view, child.agentSlug);
                              else if (hasGrandchildren) toggleSection(child.label);
                            }}
                            className={`flex items-center justify-between w-full text-left px-2 pr-2 py-1.5 text-[13px] rounded-[4px] transition-colors tracking-[-0.26px] ${
                              isChildDetailActive || (child.view && child.view === currentView && !child.agentSlug)
                                ? "text-[#2552ED] bg-[#e4e6ea] dark:bg-[#252a3a] dark:text-[#6b9bff]"
                                : "text-[#555] dark:text-[#9ba2b0] hover:bg-[#e4e6ea] dark:hover:bg-[#2e3340]"
                            }`}
                          >
                            <span>{child.label}</span>
                            {hasGrandchildren && (
                              <div className="w-[16px] h-[16px] flex items-center justify-center">
                                {isChildExpanded ? (
                                  <ChevronDown className="w-2.5 h-2.5 text-[#888] dark:text-[#6b7280]" />
                                ) : (
                                  <svg className="w-[7px] h-[4px]" viewBox="0 0 9.01782 5.0176" fill="none">
                                    <path d={svgPathsReviews.p5ccaa80} fill="#888" className="dark:fill-[#6b7280]" />
                                  </svg>
                                )}
                              </div>
                            )}
                          </button>
                          {/* Grandchildren (L3) */}
                          {hasGrandchildren && isChildExpanded && (
                            <div className="flex flex-col gap-0.5 mt-0.5">
                              {child.children!.map(gc => {
                                const isGcActive = currentView === "agent-detail" && gc.agentSlug === selectedAgentSlug;
                                return (
                                <button
                                  key={gc.label}
                                  onClick={() => gc.view && onViewChange(gc.view, gc.agentSlug)}
                                  className={`text-left pl-3 pr-2 py-1 text-[12px] rounded-[4px] transition-colors tracking-[-0.24px] ${
                                    isGcActive
                                      ? "text-[#2552ED] bg-[#e4e6ea] dark:bg-[#252a3a] dark:text-[#6b9bff]"
                                      : "text-[#777] dark:text-[#6b7280] hover:text-[#212121] dark:hover:text-[#e4e4e4] hover:bg-[#e4e6ea] dark:hover:bg-[#2e3340]"
                                  }`}
                                >
                                  {gc.label}
                                </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Legacy combined Sidebar export (backward compat)
   ═══════════════════════════════════════════ */
interface SidebarProps {
  hideL2Nav?: boolean;
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

export function Sidebar({ hideL2Nav = false, currentView, onViewChange }: SidebarProps) {
  return (
    <div className="flex h-full shrink-0" data-no-print>
      <IconStrip currentView={currentView} onViewChange={onViewChange} />
      {!hideL2Nav && <L2NavPanel currentView={currentView} onViewChange={onViewChange} />}
    </div>
  );
}