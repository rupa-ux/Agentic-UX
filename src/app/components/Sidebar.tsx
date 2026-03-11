import { useState } from "react";
import {
  ChevronDown, ChevronUp,
} from "lucide-react";
import svgPaths from "../../imports/svg-y1gexucine";
import type { AppView } from "../App";

/* ─── Icon-strip items (Figma rail) ─── */
const iconStripItems = [
  { label: "Home", path: svgPaths.p3c83e900, viewBox: "0 0 11.1666 12.7435" },
  { label: "Inbox", path: svgPaths.p16687400, viewBox: "0 0 15.1666 13.85" },
  { label: "Listings", path: svgPaths.p1db22180, viewBox: "0 0 12.2467 14.7836" },
  { label: "Reviews", path: svgPaths.p97a8100, viewBox: "0 0 13.6492 12.9968" },
  { label: "Referrals", path: svgPaths.p3bb91c80, viewBox: "0 0 15.1666 16.1506" },
  { label: "Payments", path: svgPaths.p3d180f80, viewBox: "0 0 15.1666 15.1666" },
  { label: "Appointments", path: svgPaths.p1e88cfb0, viewBox: "0 0 13.1666 15.2628" },
  { label: "Social", path: svgPaths.p210b2470, viewBox: "0 0 15.3589 13.3589" },
  { label: "Surveys", path: svgPaths.p1271780, viewBox: "0 0 13.1666 14.6666" },
  { label: "Ticketing", path: svgPaths.p2af55f00, viewBox: "0 0 14.9743 14.9743" },
  { label: "Contacts", path: svgPaths.p1cc6aa00, viewBox: "0 0 14.6698 10.8485" },
  { label: "Campaigns", path: svgPaths.p2cdd75c0, viewBox: "0 0 15.2948 11.7626" },
  { label: "Reports", path: svgPaths.p376bbff0, viewBox: "0 0 12.274 12.2612", active: true },
  { label: "Insights", path: svgPaths.p140b9400, viewBox: "0 0 11.1666 15.2018" },
  { label: "Competitors", path: svgPaths.paf11800, viewBox: "0 0 14.1666 13.1666" },
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
export function IconStrip() {
  const [activeIcon, setActiveIcon] = useState("Reports");

  return (
    <div className="w-[66px] bg-[#e0e5eb] flex flex-col items-center shrink-0" data-no-print>
      {/* Birdeye logo */}
      <div className="h-[56px] w-[55px] flex items-center justify-center shrink-0">
        <svg width="19.5" height="18.75" viewBox="0 0 19.5 18.75" fill="none">
          <path clipRule="evenodd" d={svgPaths.p23fcc000} fill="#2552ED" fillRule="evenodd" />
        </svg>
      </div>

      {/* Icon buttons */}
      <div className="flex flex-col items-center px-[12px] py-[8px] gap-[2px] flex-1">
        {iconStripItems.map(item => {
          const isActive = item.label === activeIcon;
          return (
            <button
              key={item.label}
              onClick={() => setActiveIcon(item.label)}
              className={`relative w-[32px] h-[32px] flex items-center justify-center rounded-full transition-colors shrink-0 ${
                isActive
                  ? "bg-[#dfe8f1]"
                  : "hover:bg-[#d0d5dc]"
              }`}
              title={item.label}
            >
              <svg className="w-[16px] h-[16px]" viewBox={item.viewBox} fill="none" preserveAspectRatio="xMidYMid meet">
                <path d={item.path} fill={isActive ? "#2552ED" : "#303030"} />
              </svg>
            </button>
          );
        })}
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
    <div className="w-[220px] bg-white border-r border-[#e5e9f0] rounded-tl-[8px] flex flex-col h-full overflow-hidden shrink-0" data-no-print>
      {/* Header area: Search + Create dashboard */}
      <div className="px-4 pt-[19px] pb-2 shrink-0">
        {/* Search */}
        <div className="flex items-center gap-2 px-[11px] py-[7px] bg-[#f8f9fa] border border-[#e5e9f0] rounded-[8px] mb-3">
          <span className="text-[13px] text-[#b0b0b0]" style={{ fontWeight: 400 }}>Search</span>
        </div>

        {/* Create dashboard */}
        <button className="flex items-center justify-between w-full px-1 py-1 text-[13px] text-[#212121] hover:bg-[#f5f5f5] rounded-[8px] mb-1">
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
                    ? "text-[#2552ED] bg-[#e8effe]"
                    : "text-[#212121] hover:bg-[#f5f5f5]"
                }`}
                style={{ fontWeight: isActive ? 400 : 300 }}
              >
                <span>{item.label}</span>
                {item.expandable && <ChevronDown className="w-[14px] h-[14px] text-[#999]" />}
              </button>
            );
          })}
        </div>

        {/* Reports label */}
        <div className="px-[8px] pt-[12.5px] pb-[6px]">
          <span className="text-[11px] text-[#999]" style={{ fontWeight: 400 }}>Reports</span>
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
                      ? "text-[#212121]"
                      : "text-[#212121] hover:bg-[#f5f5f5]"
                  }`}
                >
                  <span>{section.label}</span>
                  {section.expandable && (
                    isExpanded
                      ? <ChevronUp className="w-[14px] h-[14px] text-[#999]" />
                      : <ChevronDown className="w-[14px] h-[14px] text-[#999]" />
                  )}
                </button>
                {section.children && isExpanded && (
                  <div className="ml-[12px] mt-[2px] space-y-[2px]">
                    {section.children.map(child => (
                      <button
                        key={child.label}
                        onClick={() => onViewChange("dashboard")}
                        className={`px-[10px] py-[5px] text-[13px] rounded-[8px] w-full text-left transition-colors ${
                          child.active && currentView === "dashboard"
                            ? "text-[#2552ED] bg-[#e8effe]"
                            : "text-[#212121] hover:bg-[#f5f5f5]"
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
      <IconStrip />
      {!hideL2Nav && <L2NavPanel currentView={currentView} onViewChange={onViewChange} />}
    </div>
  );
}