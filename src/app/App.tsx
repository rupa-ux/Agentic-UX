import { IconStrip, L2NavPanel, ReviewsL2NavPanel, SocialL2NavPanel, SearchAIL2NavPanel, ContactsL2NavPanel, AgentsL2NavPanel } from "./components/Sidebar";
import { useState } from "react";
import { Toaster } from "sonner";
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
import { AgentsView } from "./components/AgentsView";
import { AgentsMonitorView } from "./components/AgentsMonitorView";
import { AgentsBuilderView } from "./components/AgentsBuilderView";
import { AgentDetailView } from "./components/AgentDetailView";
import { AgentOnboardingView } from "./components/AgentOnboardingView";
import { ScheduleBuilderView } from "./components/ScheduleBuilderView";
import { BirdAIReportsView } from "./components/BirdAIReportsView";
import { type DraftReport } from "./components/draftStore";

export type AppView = "dashboard" | "shared-by-me" | "inbox" | "storybook" | "reviews" | "social" | "searchai" | "contacts" | "scheduled-deliveries" | "agents" | "agents-monitor" | "agents-builder" | "agent-detail" | "agents-onboarding" | "schedule-builder" | "birdai-reports";

export default function App() {
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>("agents");
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

  const handleViewReport = (reportName: string) => {
    setEditingDraft(null);
    setCurrentView("dashboard");
    setAiPanelOpen(true);
  };

  const handleAiPanelChange = (open: boolean) => {
    setAiPanelOpen(open);
    if (!open) setEditingDraft(null);
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <Toaster position="top-center" richColors />

      {/* L1 icon strip – full height on the far left */}
      <IconStrip currentView={currentView} onViewChange={handleViewChange} />

      {/* Everything to the right of the icon strip */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TopBar spans above both L2 nav and content */}
        <TopBar currentView={currentView} onViewChange={handleViewChange} />

        {/* Below TopBar: L2 nav + main content side by side */}
        <div className="flex-1 flex min-h-0 overflow-hidden bg-[#e0e5eb] dark:bg-[#13161b] transition-colors duration-300">
          {/* L2 nav panel (hidden when AI panel is open, inbox, storybook, reviews, social, or searchai view) */}
          {!aiPanelOpen && currentView !== "inbox" && currentView !== "storybook" && currentView !== "reviews" && currentView !== "social" && currentView !== "searchai" && currentView !== "contacts" && currentView !== "scheduled-deliveries" && currentView !== "agents" && currentView !== "agents-monitor" && currentView !== "agents-builder" && currentView !== "agent-detail" && currentView !== "agents-onboarding" && currentView !== "schedule-builder" && currentView !== "birdai-reports" && (
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
          {/* Agents L2 nav panel */}
          {!aiPanelOpen && (currentView === "agents" || currentView === "agents-monitor" || currentView === "agent-detail" || currentView === "birdai-reports") && (
            <AgentsL2NavPanel currentView={currentView} onViewChange={handleViewChange} selectedAgentSlug={selectedAgentSlug} />
          )}

          {/* Main content area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {currentView === "shared-by-me" ? (
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
            ) : currentView === "agents" ? (
              <AgentsView
                onNavigateToMonitor={() => setCurrentView("agents-monitor")}
                onNavigateToDetail={(slug: string) => handleViewChange("agent-detail", slug)}
              />
            ) : currentView === "agents-monitor" ? (
              <AgentsMonitorView onBack={() => setCurrentView("agents")} />
            ) : currentView === "agents-builder" ? (
              <AgentsBuilderView onBack={() => handleViewChange("agents")} />
            ) : currentView === "agent-detail" ? (
              <AgentDetailView
                agentSlug={selectedAgentSlug}
                onOpenBuilder={(templateName) => {
                  if (selectedAgentSlug === "scheduled-reports") {
                    handleViewChange("schedule-builder");
                  } else {
                    handleViewChange("agents-builder");
                  }
                }}
              />
            ) : currentView === "agents-onboarding" ? (
              <AgentOnboardingView
                onComplete={() => handleViewChange("agents")}
                onSkip={() => handleViewChange("agents")}
                onGoToMonitor={() => handleViewChange("agents-monitor")}
              />
            ) : currentView === "schedule-builder" ? (
              <ScheduleBuilderView onBack={() => handleViewChange("agent-detail", "scheduled-reports")} />
            ) : currentView === "birdai-reports" ? (
              <BirdAIReportsView />
            ) : (
              <Dashboard
                aiPanelOpen={aiPanelOpen}
                onAiPanelChange={handleAiPanelChange}
                editingDraft={editingDraft}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}