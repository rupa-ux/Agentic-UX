import {
  IconStrip, L2NavPanel, ReviewsL2NavPanel, SocialL2NavPanel, SearchAIL2NavPanel,
  ContactsL2NavPanel, AgentsL2NavPanel, ListingsL2NavPanel, TicketingL2NavPanel,
  CampaignsL2NavPanel, SurveysL2NavPanel, InsightsL2NavPanel, CompetitorsL2NavPanel,
  InboxL2NavPanel,
} from "./components/Sidebar";
import { useLayoutEffect, useRef, useState } from "react";
import { Toaster } from "sonner";
import { MonitorNotificationsProvider } from "./context/MonitorNotificationsContext";
import { TopBar } from "./components/TopBar";
import { Dashboard } from "./components/Dashboard";
import { SharedByMe } from "./components/SharedByMe";
import { InboxView } from "./components/InboxView";
import { ComponentShowcase } from "./components/ComponentShowcase";
import { ReviewsView } from "./components/ReviewsView";
import { SocialView } from "./components/SocialView";
import { SearchAIView } from "./components/SearchAIView";
import { ContactsView } from "./components/ContactsView";
import { ScheduledDeliveriesView } from "./components/ScheduledDeliveriesView";
import { AgentsMonitorView } from "./components/AgentsMonitorView";
import { AgentsBuilderView } from "./components/AgentsBuilderView";
import { AgentDetailView } from "./components/AgentDetailView";
import { AgentOnboardingView } from "./components/AgentOnboardingView";
import { ScheduleBuilderView } from "./components/ScheduleBuilderView";
import { BirdAIReportsView } from "./components/BirdAIReportsView";
import { type DraftReport } from "./components/draftStore";
import { APP_MAIN_CONTENT_SHELL_CLASS } from "./components/layout/appShellClasses";
import { ResizableRightChatPanel } from "./components/layout/ResizableRightChatPanel";
import { MynaChatPanel } from "./components/MynaChatPanel";
import BusinessOverviewDashboard from "./components/BusinessOverviewDashboard";

export type AppView =
  | "business-overview"
  | "dashboard"
  | "shared-by-me"
  | "inbox"
  | "storybook"
  | "reviews"
  | "social"
  | "searchai"
  | "contacts"
  | "scheduled-deliveries"
  | "agents-monitor"
  | "agents-builder"
  | "agent-detail"
  | "agents-onboarding"
  | "schedule-builder"
  | "birdai-reports"
  | "listings"
  | "surveys"
  | "ticketing"
  | "campaigns"
  | "insights"
  | "competitors";

export default function App() {
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>("agents-monitor");
  const [editingDraft, setEditingDraft] = useState<DraftReport | null>(null);
  const [selectedAgentSlug, setSelectedAgentSlug] = useState<string>("");

  const handleViewChange = (view: AppView, agentSlug?: string) => {
    setCurrentView(view);
    if (agentSlug) setSelectedAgentSlug(agentSlug);
  };

  const handleEditDraft = (draft: DraftReport) => {
    setEditingDraft(draft);
    setCurrentView("dashboard");
    setAiPanelOpen(true);
  };

  const handleViewReport = (_reportName: string) => {
    setEditingDraft(null);
    setCurrentView("dashboard");
    setAiPanelOpen(true);
  };

  const handleAiPanelChange = (open: boolean) => {
    setAiPanelOpen(open);
    if (!open) setEditingDraft(null);
  };

  const [mynaChatOpen, setMynaChatOpen] = useState(false);
  const chatLayoutRef = useRef<HTMLDivElement>(null);
  const [chatLayoutWidth, setChatLayoutWidth] = useState(0);

  useLayoutEffect(() => {
    const el = chatLayoutRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setChatLayoutWidth(el.clientWidth);
    });
    ro.observe(el);
    setChatLayoutWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // Views that have their own L2 panels (not the default Reports L2NavPanel)
  const hasOwnL2Panel = (v: AppView) =>
    v === "business-overview" ||
    v === "inbox" ||
    v === "storybook" ||
    v === "reviews" ||
    v === "social" ||
    v === "searchai" ||
    v === "contacts" ||
    v === "scheduled-deliveries" ||
    v === "agents-monitor" ||
    v === "agents-builder" ||
    v === "agent-detail" ||
    v === "agents-onboarding" ||
    v === "birdai-reports" ||
    v === "listings" ||
    v === "surveys" ||
    v === "ticketing" ||
    v === "campaigns" ||
    v === "insights" ||
    v === "competitors";

  return (
    <MonitorNotificationsProvider onNavigateToMonitor={() => setCurrentView("agents-monitor")}>
    <div className="h-screen w-screen flex overflow-hidden">
      <Toaster position="top-center" richColors />

      {/* L1 icon strip – full height on the far left */}
      <IconStrip currentView={currentView} onViewChange={handleViewChange} />

      {/* Everything to the right of the icon strip */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TopBar spans above both L2 nav and content */}
        <TopBar
          currentView={currentView}
          onViewChange={handleViewChange}
          mynaChatOpen={mynaChatOpen}
          onToggleMynaChat={() => setMynaChatOpen((o) => !o)}
        />

        {/* Below TopBar: L2 nav + main content side by side */}
        <div className="flex-1 flex min-h-0 overflow-hidden bg-[#e0e5eb] dark:bg-[#13161b] transition-colors duration-300">

          {/* Default Reports L2 nav panel */}
          {!aiPanelOpen && !hasOwnL2Panel(currentView) && (
            <L2NavPanel currentView={currentView} onViewChange={handleViewChange} />
          )}

          {/* Reviews L2 nav panel */}
          {!aiPanelOpen && currentView === "reviews" && (
            <ReviewsL2NavPanel />
          )}
          {/* Social L2 nav panel */}
          {!aiPanelOpen && currentView === "social" && (
            <SocialL2NavPanel />
          )}
          {/* Search AI L2 nav panel */}
          {!aiPanelOpen && currentView === "searchai" && (
            <SearchAIL2NavPanel />
          )}
          {/* Contacts L2 nav panel */}
          {!aiPanelOpen && currentView === "contacts" && (
            <ContactsL2NavPanel />
          )}
          {/* Listings L2 nav panel */}
          {!aiPanelOpen && currentView === "listings" && (
            <ListingsL2NavPanel />
          )}
          {/* Surveys L2 nav panel */}
          {!aiPanelOpen && currentView === "surveys" && (
            <SurveysL2NavPanel />
          )}
          {/* Ticketing L2 nav panel */}
          {!aiPanelOpen && currentView === "ticketing" && (
            <TicketingL2NavPanel />
          )}
          {/* Campaigns L2 nav panel */}
          {!aiPanelOpen && currentView === "campaigns" && (
            <CampaignsL2NavPanel />
          )}
          {/* Insights L2 nav panel */}
          {!aiPanelOpen && currentView === "insights" && (
            <InsightsL2NavPanel />
          )}
          {/* Competitors L2 nav panel */}
          {!aiPanelOpen && currentView === "competitors" && (
            <CompetitorsL2NavPanel />
          )}
          {/* Inbox L2 nav panel */}
          {!aiPanelOpen && currentView === "inbox" && (
            <InboxL2NavPanel />
          )}
          {/* Agents L2 nav panel */}
          {!aiPanelOpen && (currentView === "agents-monitor" || currentView === "agents-builder" || currentView === "agents-onboarding" || currentView === "agent-detail" || currentView === "birdai-reports") && (
            <AgentsL2NavPanel currentView={currentView} onViewChange={handleViewChange} selectedAgentSlug={selectedAgentSlug} />
          )}

          {/* Main content + optional Myna chat (flex row, main keeps ≥60% when possible) */}
          <div
            ref={chatLayoutRef}
            className="flex min-h-0 min-w-0 flex-1 overflow-hidden"
          >
            <div
              className={`${APP_MAIN_CONTENT_SHELL_CLASS} min-h-0 min-w-[60%]`}
            >
            {currentView === "business-overview" ? (
              <BusinessOverviewDashboard />
            ) : currentView === "shared-by-me" ? (
              <SharedByMe onEditDraft={handleEditDraft} onViewReport={handleViewReport} />
            ) : currentView === "inbox" ? (
              <InboxView />
            ) : currentView === "storybook" ? (
              <ComponentShowcase />
            ) : currentView === "reviews" ? (
              <ReviewsView />
            ) : currentView === "social" ? (
              <SocialView />
            ) : currentView === "searchai" ? (
              <SearchAIView />
            ) : currentView === "contacts" ? (
              <ContactsView />
            ) : currentView === "scheduled-deliveries" ? (
              <ScheduledDeliveriesView onCreateSchedule={() => handleViewChange("schedule-builder")} />
            ) : currentView === "agents-monitor" ? (
              <AgentsMonitorView onBack={() => setCurrentView("agents-monitor")} />
            ) : currentView === "agents-builder" ? (
              <AgentsBuilderView onBack={() => handleViewChange("agents-monitor")} />
            ) : currentView === "agent-detail" ? (
              <AgentDetailView
                agentSlug={selectedAgentSlug}
                onOpenBuilder={(_templateName) => {
                  if (selectedAgentSlug === "scheduled-reports") {
                    handleViewChange("schedule-builder");
                  } else {
                    handleViewChange("agents-builder");
                  }
                }}
              />
            ) : currentView === "agents-onboarding" ? (
              <AgentOnboardingView
                onComplete={() => handleViewChange("agents-monitor")}
                onSkip={() => handleViewChange("agents-monitor")}
                onGoToMonitor={() => handleViewChange("agents-monitor")}
              />
            ) : currentView === "schedule-builder" ? (
              <ScheduleBuilderView onBack={() => handleViewChange("agent-detail", "scheduled-reports")} />
            ) : currentView === "birdai-reports" ? (
              <BirdAIReportsView />
            ) : currentView === "listings" ? (
              <Dashboard
                aiPanelOpen={aiPanelOpen}
                onAiPanelChange={handleAiPanelChange}
                editingDraft={editingDraft}
              />
            ) : currentView === "surveys" ? (
              <Dashboard
                aiPanelOpen={aiPanelOpen}
                onAiPanelChange={handleAiPanelChange}
                editingDraft={editingDraft}
              />
            ) : currentView === "ticketing" ? (
              <Dashboard
                aiPanelOpen={aiPanelOpen}
                onAiPanelChange={handleAiPanelChange}
                editingDraft={editingDraft}
              />
            ) : currentView === "campaigns" ? (
              <Dashboard
                aiPanelOpen={aiPanelOpen}
                onAiPanelChange={handleAiPanelChange}
                editingDraft={editingDraft}
              />
            ) : currentView === "insights" ? (
              <Dashboard
                aiPanelOpen={aiPanelOpen}
                onAiPanelChange={handleAiPanelChange}
                editingDraft={editingDraft}
              />
            ) : currentView === "competitors" ? (
              <Dashboard
                aiPanelOpen={aiPanelOpen}
                onAiPanelChange={handleAiPanelChange}
                editingDraft={editingDraft}
              />
            ) : (
              <Dashboard
                aiPanelOpen={aiPanelOpen}
                onAiPanelChange={handleAiPanelChange}
                editingDraft={editingDraft}
              />
            )}
            </div>
            <ResizableRightChatPanel open={mynaChatOpen} layoutRowWidth={chatLayoutWidth}>
              <MynaChatPanel onClose={() => setMynaChatOpen(false)} />
            </ResizableRightChatPanel>
          </div>
        </div>
      </div>
    </div>
    </MonitorNotificationsProvider>
  );
}
