import {
  IconStrip, L2NavPanel, ReviewsL2NavPanel, SocialL2NavPanel, SearchAIL2NavPanel,
  ContactsL2NavPanel, AgentsL2NavPanel, ListingsL2NavPanel, TicketingL2NavPanel,
  CampaignsL2NavPanel, SurveysL2NavPanel, InsightsL2NavPanel, CompetitorsL2NavPanel,
  InboxL2NavPanel, MynaConversationsL2NavPanel,
} from "./components/Sidebar";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
import { AnalyzePerformanceView } from "./components/AnalyzePerformanceView";
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
import { getAppViewTitle } from "./appViewTitle";
import { l2KeyFromConversation } from "./myna/mynaL2NavKeys";
import { useMynaConversations } from "./myna/useMynaConversations";
import { ShortcutsModal } from "./shortcuts/ShortcutsModal";
import { useShortcuts } from "./shortcuts/useShortcuts";

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
  | "agents-analyze-performance"
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
  const [selectedAnalyzeItem, setSelectedAnalyzeItem] = useState<string>("overview");

  const handleViewChange = useCallback((view: AppView, slug?: string) => {
    if (view !== currentView) {
      setMynaChatExpanded(false);
    }
    setCurrentView(view);
    if (slug) {
      if (view === "agents-analyze-performance") {
        setSelectedAnalyzeItem(slug);
      } else {
        setSelectedAgentSlug(slug);
      }
    }
  }, [currentView]);

  const handleEditDraft = (draft: DraftReport) => {
    setEditingDraft(draft);
    setMynaChatExpanded(false);
    setCurrentView("dashboard");
    setAiPanelOpen(true);
  };

  const handleViewReport = (_reportName: string) => {
    setEditingDraft(null);
    setMynaChatExpanded(false);
    setCurrentView("dashboard");
    setAiPanelOpen(true);
  };

  const handleAiPanelChange = (open: boolean) => {
    setAiPanelOpen(open);
    if (!open) setEditingDraft(null);
  };

  const [mynaChatOpen, setMynaChatOpen] = useState(false);
  const [mynaChatExpanded, setMynaChatExpanded] = useState(false);
  const [mynaComposerFocusNonce, setMynaComposerFocusNonce] = useState(0);

  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    activeConversation,
    screenTitle,
    appendUserAndAssistant,
    createEmptyConversation,
  } = useMynaConversations(getAppViewTitle(currentView));

  useEffect(() => {
    if (aiPanelOpen) setMynaChatExpanded(false);
  }, [aiPanelOpen]);

  useEffect(() => {
    if (!mynaChatOpen) setMynaChatExpanded(false);
  }, [mynaChatOpen]);

  const mynaWorkspaceExpanded = mynaChatOpen && mynaChatExpanded && !aiPanelOpen;

  const activeL2NavKey = useMemo(() => {
    if (!activeConversation) return "";
    return l2KeyFromConversation(activeConversation);
  }, [activeConversation]);

  const { shortcutsModalOpen, setShortcutsModalOpen } = useShortcuts({
    currentView,
    onNavigate: handleViewChange,
    mynaChatOpen,
    onMynaChatOpenChange: setMynaChatOpen,
    aiPanelOpen,
  });

  /** ChatGPT-style: new thread opens in the side panel composer — no modal. */
  const startNewMynaChat = useCallback(() => {
    setMynaChatOpen(true);
    createEmptyConversation();
    setMynaComposerFocusNonce((n) => n + 1);
  }, [createEmptyConversation]);

  const mynaChatPanelEl = (
    <MynaChatPanel
      messages={activeConversation?.messages ?? []}
      onSend={appendUserAndAssistant}
      onClose={() => setMynaChatOpen(false)}
      expanded={mynaChatExpanded}
      onToggleExpand={() => setMynaChatExpanded((e) => !e)}
      conversations={conversations}
      activeConversationId={activeConversationId}
      onSelectConversation={setActiveConversationId}
      onOpenNewChat={startNewMynaChat}
      composerFocusNonce={mynaComposerFocusNonce}
    />
  );

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
    v === "agents-analyze-performance" ||
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
    <MonitorNotificationsProvider
      onNavigateToMonitor={() => {
        setMynaChatExpanded(false);
        setCurrentView("agents-monitor");
      }}
    >
    <div className="h-screen w-screen flex overflow-hidden">
      <ShortcutsModal
        open={shortcutsModalOpen}
        onOpenChange={setShortcutsModalOpen}
        currentView={currentView}
      />
      <Toaster position="top-center" richColors />

      {/* L1 icon strip – full height on the far left */}
      <IconStrip
        currentView={currentView}
        onViewChange={handleViewChange}
        onOpenKeyboardShortcuts={() => setShortcutsModalOpen(true)}
      />

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

          {/* Myna fullscreen: conversation L2 replaces product L2 */}
          {mynaWorkspaceExpanded && (
            <MynaConversationsL2NavPanel
              conversations={conversations}
              activeItem={activeL2NavKey}
              onSelectConversation={setActiveConversationId}
              onCreateNewChat={startNewMynaChat}
            />
          )}

          {/* Default Reports L2 nav panel */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && !hasOwnL2Panel(currentView) && (
            <L2NavPanel currentView={currentView} onViewChange={handleViewChange} />
          )}

          {/* Reviews L2 nav panel */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "reviews" && (
            <ReviewsL2NavPanel />
          )}
          {/* Social L2 nav panel */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "social" && (
            <SocialL2NavPanel />
          )}
          {/* Search AI L2 nav panel */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "searchai" && (
            <SearchAIL2NavPanel />
          )}
          {/* Contacts L2 nav panel */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "contacts" && (
            <ContactsL2NavPanel />
          )}
          {/* Listings L2 nav panel */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "listings" && (
            <ListingsL2NavPanel />
          )}
          {/* Surveys L2 nav panel */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "surveys" && (
            <SurveysL2NavPanel />
          )}
          {/* Ticketing L2 nav panel */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "ticketing" && (
            <TicketingL2NavPanel />
          )}
          {/* Campaigns L2 nav panel */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "campaigns" && (
            <CampaignsL2NavPanel />
          )}
          {/* Insights L2 nav panel */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "insights" && (
            <InsightsL2NavPanel />
          )}
          {/* Competitors L2 nav panel */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "competitors" && (
            <CompetitorsL2NavPanel />
          )}
          {/* Inbox L2 nav panel */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "inbox" && (
            <InboxL2NavPanel />
          )}
          {/* Agents L2 nav panel */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && (currentView === "agents-monitor" || currentView === "agents-analyze-performance" || currentView === "agents-builder" || currentView === "agents-onboarding" || currentView === "agent-detail" || currentView === "birdai-reports") && (
            <AgentsL2NavPanel currentView={currentView} onViewChange={handleViewChange} selectedAgentSlug={selectedAgentSlug} selectedAnalyzeItem={selectedAnalyzeItem} />
          )}

          {/* Main content + optional Myna chat (flex row, main keeps ≥60% when possible) */}
          <div
            ref={chatLayoutRef}
            className="flex min-h-0 min-w-0 flex-1 overflow-hidden"
          >
            {!mynaWorkspaceExpanded ? (
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
              <AgentsMonitorView
                onBack={() => setCurrentView("agents-monitor")}
                onNavigateToReviews={() => handleViewChange("reviews")}
              />
            ) : currentView === "agents-analyze-performance" ? (
              <AnalyzePerformanceView selectedItem={selectedAnalyzeItem} />
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
            ) : null}
            <ResizableRightChatPanel
              open={mynaChatOpen}
              workspaceExpanded={mynaWorkspaceExpanded}
              layoutRowWidth={chatLayoutWidth}
            >
              {mynaChatPanelEl}
            </ResizableRightChatPanel>
          </div>
        </div>
      </div>
    </div>
    </MonitorNotificationsProvider>
  );
}
