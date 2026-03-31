import type { Meta, StoryObj } from "@storybook/react";
import { useState, useEffect } from "react";
import {
  IconStrip,
  L2NavPanel,
  ReviewsL2NavPanel,
  SocialL2NavPanel,
  SearchAIL2NavPanel,
  ContactsL2NavPanel,
  AgentsL2NavPanel,
} from "@/app/components/Sidebar";
import type { AppView } from "@/app/App";

// ─── All selectable views ─────────────────────────────
const VIEW_OPTIONS: AppView[] = [
  "agents", "agents-monitor", "birdai-reports",
  "dashboard", "shared-by-me",
  "reviews", "social", "searchai", "contacts",
  "inbox", "scheduled-deliveries",
];

const VIEW_LABELS: Record<string, string> = {
  "agents":                "Myna AI — Agents",
  "agents-monitor":        "Myna AI — Monitor",
  "birdai-reports":        "Myna AI — Reports",
  "dashboard":             "Reports — Dashboard",
  "shared-by-me":          "Reports — Shared by me",
  "reviews":               "Reviews",
  "social":                "Social AI",
  "searchai":              "Search AI",
  "contacts":              "Contacts",
  "inbox":                 "Inbox (no L2)",
  "scheduled-deliveries":  "Scheduled deliveries (no L2)",
};

// ─── L2 panel resolver ────────────────────────────────
function ActiveL2Panel({ view, onViewChange }: { view: AppView; onViewChange: (v: AppView) => void }) {
  if (view === "reviews")  return <ReviewsL2NavPanel />;
  if (view === "social")   return <SocialL2NavPanel />;
  if (view === "searchai") return <SearchAIL2NavPanel />;
  if (view === "contacts") return <ContactsL2NavPanel />;
  if (["agents","agents-monitor","agent-detail","birdai-reports"].includes(view))
    return <AgentsL2NavPanel currentView={view} onViewChange={onViewChange} selectedAgentSlug="" />;
  if (["inbox","storybook","scheduled-deliveries","agents-builder","agents-onboarding","schedule-builder"].includes(view))
    return null;
  return <L2NavPanel currentView={view} onViewChange={onViewChange} />;
}

function SidebarFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#e0e5eb] dark:bg-[#13161b] transition-colors duration-300">
      {children}
    </div>
  );
}

// ─── Storybook meta ───────────────────────────────────
const meta: Meta = {
  title: "App/Sidebar",
  parameters: { layout: "fullscreen" },
  argTypes: {
    currentView: {
      name: "Active view",
      description: "Active product — updates the highlighted icon and L2 panel.",
      control: "select",
      options: VIEW_OPTIONS,
      labels: Object.fromEntries(VIEW_OPTIONS.map(v => [v, VIEW_LABELS[v]])) as Record<string, string>,
    },
    iconSize: {
      name: "Icon size (px)",
      description: "Phosphor icon size. Default is 18px.",
      control: { type: "range", min: 12, max: 28, step: 1 },
    },
  },
};
export default meta;

type Story = StoryObj<{ currentView: AppView; iconSize: number }>;

/* ══════════════════════════════════════════════════════
   STORY 1 — Icon Strip only
   ══════════════════════════════════════════════════════ */
export const IconStripOnly: Story = {
  name: "Icon Strip",
  args: { currentView: "agents", iconSize: 18 },
  render: ({ currentView: argView, iconSize }) => {
    const [view, setView] = useState<AppView>(argView);
    useEffect(() => { setView(argView); }, [argView]);
    return (
      <SidebarFrame>
        <IconStrip currentView={view} onViewChange={setView} iconSize={iconSize} />
      </SidebarFrame>
    );
  },
};

/* ══════════════════════════════════════════════════════
   STORY 2 — Full Sidebar (Icon Strip + L2)
   ══════════════════════════════════════════════════════ */
export const SidebarCombined: Story = {
  name: "Sidebar",
  args: { currentView: "dashboard", iconSize: 18 },
  render: ({ currentView: argView, iconSize }) => {
    const [view, setView] = useState<AppView>(argView);
    useEffect(() => { setView(argView); }, [argView]);
    return (
      <SidebarFrame>
        <IconStrip currentView={view} onViewChange={setView} iconSize={iconSize} />
        <ActiveL2Panel view={view} onViewChange={setView} />
      </SidebarFrame>
    );
  },
};
