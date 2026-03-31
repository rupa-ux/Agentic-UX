import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  IconStrip,
  L2NavPanel,
  ReviewsL2NavPanel,
  SocialL2NavPanel,
  SearchAIL2NavPanel,
  ContactsL2NavPanel,
  AgentsL2NavPanel,
} from "@/app/components/Sidebar";
import { TopBar } from "@/app/components/TopBar";
import type { AppView } from "@/app/App";

/* ─── View metadata for the view switcher ─── */
const VIEWS: { value: AppView; label: string; group: string }[] = [
  { value: "agents",               label: "Myna AI — Agents",        group: "Myna AI" },
  { value: "agents-monitor",       label: "Myna AI — Monitor",       group: "Myna AI" },
  { value: "birdai-reports",       label: "Myna AI — Reports",       group: "Myna AI" },
  { value: "dashboard",            label: "Reports — Dashboard",    group: "Reports" },
  { value: "shared-by-me",         label: "Reports — Shared by me", group: "Reports" },
  { value: "reviews",              label: "Reviews",                group: "Modules" },
  { value: "social",               label: "Social AI",              group: "Modules" },
  { value: "searchai",             label: "Search AI",              group: "Modules" },
  { value: "contacts",             label: "Contacts",               group: "Modules" },
  { value: "inbox",                label: "Inbox",                  group: "Modules" },
  { value: "scheduled-deliveries", label: "Scheduled Deliveries",   group: "Modules" },
];

/* ─── Resolve which L2 panel to show for a given view ─── */
function L2Panel({ view, onViewChange }: { view: AppView; onViewChange: (v: AppView) => void }) {
  if (view === "reviews")      return <ReviewsL2NavPanel />;
  if (view === "social")       return <SocialL2NavPanel />;
  if (view === "searchai")     return <SearchAIL2NavPanel />;
  if (view === "contacts")     return <ContactsL2NavPanel />;
  if (
    view === "agents" ||
    view === "agents-monitor" ||
    view === "agent-detail" ||
    view === "birdai-reports"
  ) return <AgentsL2NavPanel currentView={view} onViewChange={onViewChange} selectedAgentSlug="" />;
  if (
    view === "inbox" ||
    view === "storybook" ||
    view === "scheduled-deliveries" ||
    view === "agents-builder" ||
    view === "agents-onboarding" ||
    view === "schedule-builder"
  ) return null;
  // dashboard, shared-by-me → reports L2
  return <L2NavPanel currentView={view} onViewChange={onViewChange} />;
}

/* ─── Main content placeholder ─── */
function ContentPlaceholder({ view }: { view: AppView }) {
  const label = VIEWS.find(v => v.value === view)?.label ?? view;
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 min-w-0 overflow-hidden p-8">
      {/* Skeleton card grid */}
      <div className="w-full max-w-4xl flex flex-col gap-6">
        {/* Header placeholder */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <div className="h-6 w-48 rounded-lg bg-black/8 dark:bg-white/8 animate-pulse" />
            <div className="h-4 w-72 rounded-lg bg-black/5 dark:bg-white/5 animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 rounded-lg bg-black/8 dark:bg-white/8 animate-pulse" />
            <div className="h-9 w-24 rounded-lg bg-black/5 dark:bg-white/5 animate-pulse" />
          </div>
        </div>

        {/* Stat cards row */}
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-[#1e2229] p-4 flex flex-col gap-3"
            >
              <div className="h-3 w-20 rounded bg-black/8 dark:bg-white/8 animate-pulse" />
              <div className="h-8 w-16 rounded bg-black/10 dark:bg-white/10 animate-pulse" />
              <div className="h-2 w-24 rounded bg-black/5 dark:bg-white/5 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Main chart placeholder */}
        <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-[#1e2229] p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 rounded bg-black/8 dark:bg-white/8 animate-pulse" />
            <div className="h-7 w-28 rounded-lg bg-black/5 dark:bg-white/5 animate-pulse" />
          </div>
          <div className="h-48 rounded-lg bg-gradient-to-br from-black/[0.03] to-black/[0.06] dark:from-white/[0.03] dark:to-white/[0.06] flex items-center justify-center">
            <span className="text-[13px] text-[#999] dark:text-[#555] select-none">
              {label} · main content
            </span>
          </div>
        </div>

        {/* Table placeholder */}
        <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-[#1e2229] overflow-hidden">
          {/* Table header */}
          <div className="flex gap-4 px-5 py-3 border-b border-black/[0.06] dark:border-white/[0.06]">
            {[160, 96, 80, 64].map((w, i) => (
              <div key={i} className="h-3 rounded bg-black/8 dark:bg-white/8 animate-pulse" style={{ width: w }} />
            ))}
          </div>
          {/* Table rows */}
          {Array.from({ length: 5 }).map((_, row) => (
            <div
              key={row}
              className="flex gap-4 px-5 py-3.5 border-b last:border-0 border-black/[0.04] dark:border-white/[0.04]"
            >
              {[160, 96, 80, 64].map((w, i) => (
                <div
                  key={i}
                  className="h-3 rounded animate-pulse"
                  style={{
                    width: w * (0.7 + Math.random() * 0.5),
                    background: `rgba(0,0,0,${0.04 + i * 0.01})`,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── View switcher bar (only visible in Storybook for demo) ─── */
function ViewSwitcher({
  current,
  onChange,
}: {
  current: AppView;
  onChange: (v: AppView) => void;
}) {
  const groups = [...new Set(VIEWS.map(v => v.group))];
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-white dark:bg-[#22262f] border border-black/10 dark:border-white/10 rounded-full px-3 py-1.5 shadow-lg">
      <span className="text-[11px] text-muted-foreground mr-1.5">Switch view:</span>
      {groups.map(group => {
        const groupViews = VIEWS.filter(v => v.group === group);
        const anyActive = groupViews.some(v => v.value === current);
        return (
          <div key={group} className="flex items-center gap-0.5">
            {groupViews.map(v => (
              <button
                key={v.value}
                onClick={() => onChange(v.value)}
                className={`px-2.5 py-1 rounded-full text-[11px] transition-all ${
                  current === v.value
                    ? "bg-[#2552ED] text-white"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {v.label.split(" — ")[1] ?? v.label}
              </button>
            ))}
            <span className="text-muted-foreground/30 text-[10px] mx-1">|</span>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   STORIES
   ═══════════════════════════════════════════════════ */

const meta: Meta = {
  title: "App/AppShell",
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: "App Shell — interactive",
  render: () => {
    const [view, setView] = useState<AppView>("dashboard");

    return (
      <div className="relative h-screen w-screen flex overflow-hidden bg-[#e0e5eb] dark:bg-[#13161b] transition-colors duration-300">
        {/* L1 Icon Strip */}
        <IconStrip currentView={view} onViewChange={setView} />

        {/* Right of icon strip */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* TopBar */}
          <TopBar currentView={view} onViewChange={setView} />

          {/* L2 nav + main content */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            <L2Panel view={view} onViewChange={setView} />
            <ContentPlaceholder view={view} />
          </div>
        </div>

        {/* Floating view switcher for Storybook demo */}
        <ViewSwitcher current={view} onChange={setView} />
      </div>
    );
  },
};

export const StartingWithAgents: Story = {
  name: "App Shell — start: BirdAI",
  render: () => {
    const [view, setView] = useState<AppView>("agents");

    return (
      <div className="relative h-screen w-screen flex overflow-hidden bg-[#e0e5eb] dark:bg-[#13161b] transition-colors duration-300">
        <IconStrip currentView={view} onViewChange={setView} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar currentView={view} onViewChange={setView} />
          <div className="flex-1 flex min-h-0 overflow-hidden">
            <L2Panel view={view} onViewChange={setView} />
            <ContentPlaceholder view={view} />
          </div>
        </div>
        <ViewSwitcher current={view} onChange={setView} />
      </div>
    );
  },
};

export const StartingWithReviews: Story = {
  name: "App Shell — start: Reviews",
  render: () => {
    const [view, setView] = useState<AppView>("reviews");

    return (
      <div className="relative h-screen w-screen flex overflow-hidden bg-[#e0e5eb] dark:bg-[#13161b] transition-colors duration-300">
        <IconStrip currentView={view} onViewChange={setView} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar currentView={view} onViewChange={setView} />
          <div className="flex-1 flex min-h-0 overflow-hidden">
            <L2Panel view={view} onViewChange={setView} />
            <ContentPlaceholder view={view} />
          </div>
        </div>
        <ViewSwitcher current={view} onChange={setView} />
      </div>
    );
  },
};

export const NoL2Panel: Story = {
  name: "App Shell — no L2 (Inbox layout)",
  render: () => {
    const [view, setView] = useState<AppView>("inbox");

    return (
      <div className="relative h-screen w-screen flex overflow-hidden bg-[#e0e5eb] dark:bg-[#13161b] transition-colors duration-300">
        <IconStrip currentView={view} onViewChange={setView} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar currentView={view} onViewChange={setView} />
          <div className="flex-1 flex min-h-0 overflow-hidden">
            <ContentPlaceholder view={view} />
          </div>
        </div>
        <ViewSwitcher current={view} onChange={setView} />
      </div>
    );
  },
};
