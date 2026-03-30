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

// ─── All selectable views, grouped for the control dropdown ───────────────
const VIEW_OPTIONS: AppView[] = [
  // BirdAI
  "agents",
  "agents-monitor",
  "birdai-reports",
  // Reports
  "dashboard",
  "shared-by-me",
  // Modules with their own L2
  "reviews",
  "social",
  "searchai",
  "contacts",
  // No-L2 modules
  "inbox",
  "scheduled-deliveries",
];

// Human-readable label for each view (shown in the Controls panel)
const VIEW_LABELS: Record<AppView, string> = {
  "agents":                "BirdAI — Agents",
  "agents-monitor":        "BirdAI — Monitor",
  "agents-builder":        "BirdAI — Builder",
  "agents-onboarding":     "BirdAI — Onboarding",
  "agent-detail":          "BirdAI — Agent detail",
  "birdai-reports":        "BirdAI — Reports",
  "dashboard":             "Reports — Dashboard",
  "shared-by-me":          "Reports — Shared by me",
  "reviews":               "Reviews",
  "social":                "Social AI",
  "searchai":              "Search AI",
  "contacts":              "Contacts",
  "inbox":                 "Inbox (no L2)",
  "scheduled-deliveries":  "Scheduled deliveries (no L2)",
  "schedule-builder":      "Schedule builder (no L2)",
  "storybook":             "Component showcase (no L2)",
};

// ─── L2 panel resolver — returns the right panel for any view ─────────────
function ActiveL2Panel({
  view,
  onViewChange,
}: {
  view: AppView;
  onViewChange: (v: AppView) => void;
}) {
  if (view === "reviews")   return <ReviewsL2NavPanel />;
  if (view === "social")    return <SocialL2NavPanel />;
  if (view === "searchai")  return <SearchAIL2NavPanel />;
  if (view === "contacts")  return <ContactsL2NavPanel />;
  if (
    view === "agents" ||
    view === "agents-monitor" ||
    view === "agent-detail" ||
    view === "birdai-reports"
  ) {
    return (
      <AgentsL2NavPanel
        currentView={view}
        onViewChange={onViewChange}
        selectedAgentSlug=""
      />
    );
  }
  // Modules with no L2 panel
  if (
    view === "inbox" ||
    view === "storybook" ||
    view === "scheduled-deliveries" ||
    view === "agents-builder" ||
    view === "agents-onboarding" ||
    view === "schedule-builder"
  ) {
    return null;
  }
  // dashboard, shared-by-me → Reports L2
  return <L2NavPanel currentView={view} onViewChange={onViewChange} />;
}

// ─── Shared wrapper ───────────────────────────────────────────────────────
function SidebarFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#e0e5eb] dark:bg-[#13161b] transition-colors duration-300">
      {children}
    </div>
  );
}

// ─── Storybook meta ───────────────────────────────────────────────────────
const meta: Meta = {
  title: "App/Sidebar",
  parameters: { layout: "fullscreen" },
  argTypes: {
    currentView: {
      name: "Active view",
      description:
        "The currently active product or module. Controls which icon is highlighted and which L2 panel is shown.",
      control: "select",
      options: VIEW_OPTIONS,
      // Map raw values → readable labels in the Controls dropdown
      mapping: Object.fromEntries(VIEW_OPTIONS.map((v) => [v, v])) as Record<string, AppView>,
      labels: Object.fromEntries(
        VIEW_OPTIONS.map((v) => [v, VIEW_LABELS[v]])
      ) as Record<string, string>,
    },
  },
};
export default meta;

type Story = StoryObj<{ currentView: AppView }>;

/* ══════════════════════════════════════════════════════
   STORY 1 — Icon Strip (L1 rail only)
   Use the Controls panel to switch the active icon.
   ══════════════════════════════════════════════════════ */
export const IconStripOnly: Story = {
  name: "Icon Strip",
  args: { currentView: "agents" },
  render: ({ currentView: argView }) => {
    const [view, setView] = useState<AppView>(argView);

    // Sync when the Controls panel changes the arg
    useEffect(() => { setView(argView); }, [argView]);

    return (
      <SidebarFrame>
        <IconStrip currentView={view} onViewChange={setView} />
      </SidebarFrame>
    );
  },
};

/* ══════════════════════════════════════════════════════
   STORY 2 — Full Sidebar (Icon Strip + L2 panel)
   Use the Controls panel to switch the product.
   The L2 panel updates automatically — no new stories needed.
   ══════════════════════════════════════════════════════ */
export const SidebarCombined: Story = {
  name: "Sidebar",
  args: { currentView: "dashboard" },
  render: ({ currentView: argView }) => {
    const [view, setView] = useState<AppView>(argView);

    // Sync when the Controls panel changes the arg
    useEffect(() => { setView(argView); }, [argView]);

    return (
      <SidebarFrame>
        <IconStrip currentView={view} onViewChange={setView} />
        <ActiveL2Panel view={view} onViewChange={setView} />
      </SidebarFrame>
    );
  },
};
