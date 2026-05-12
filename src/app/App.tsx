import {
  IconStrip, L2NavPanel, ReviewsL2NavPanel, SocialL2NavPanel,
  ContactsL2NavPanel, ListingsL2NavPanel, TicketingL2NavPanel,
  CampaignsL2NavPanel, SurveysL2NavPanel, CompetitorsL2NavPanel,
  AppointmentsL2NavPanel, InboxL2NavPanel, MynaConversationsL2NavPanel,
  ReferralsL2NavPanel,
  REFERRALS_L2_DEFAULT_ACTIVE_KEY,
  PaymentsL2NavPanel,
  PAYMENTS_L2_DEFAULT_ACTIVE_KEY,
  APPOINTMENTS_L2_CALENDAR_KEY,
  AeoProductListing1L2NavPanel,
  AeoSearchAiL2NavPanel,
} from "./components/Sidebar";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { usePersistedState } from "./hooks/usePersistedState";
import { Toaster, toast } from "sonner";
import { MonitorNotificationsProvider } from "./context/MonitorNotificationsContext";
import { TopBar } from "./components/TopBar";
import { Dashboard } from "./components/Dashboard";
import { SharedByMe } from "./components/SharedByMe";
import { InboxView } from "./components/InboxView";
import { ComponentShowcase } from "./components/ComponentShowcase";
import { ReviewsView } from "./components/ReviewsView";
import { SocialView } from "./components/SocialView";
import { AppShellContentPlaceholder } from "./components/layout/AppShellContentPlaceholder";
import { AppShellL2Placeholder } from "./components/layout/AppShellL2Placeholder";
import {
  birdAiShellShowsL2Placeholder,
  birdAiShellShowsMainPlaceholder,
} from "./components/layout/birdAiShellRoutes";
import {
  ContactsView,
  CONTACTS_L2_KEY_ALL,
  type ContactsAppBridge,
  type ContactsSheetMode,
} from "./components/ContactsView";
import { ContactsBulkImportWorkspace } from "./components/contacts/ContactsBulkImportWorkspace";
import type { ContactsBulkImportStep } from "./components/contacts/bulkImportTypes";
import { SEARCH_AI_L2_DEFAULT_ACTIVE } from "./components/searchai/searchAIL2Keys";
import { ScheduledDeliveriesView } from "./components/ScheduledDeliveriesView";
import { ScheduleBuilderView } from "./components/ScheduleBuilderView";
import { ReferralsView, referralsL2KeyToSection } from "./components/ReferralsView";
import { PaymentsView, paymentsL2KeyToStatusFilter } from "./components/PaymentsView";
import { AppointmentsView } from "./components/AppointmentsView";
import {
  appointmentsL2PlaceholderProductLabel,
  appointmentsL2ShowsCalendarCanvas,
} from "./components/appointmentsL2Nav";
import { SurveysView } from "./components/SurveysView";
import { TicketingView } from "./components/TicketingView";
import { ListingsView } from "./components/ListingsView";
import { CampaignsView } from "./components/CampaignsView";
import { CompetitorsView } from "./components/CompetitorsView";
import { type DraftReport } from "./components/draftStore";
import {
  APP_MAIN_CONTENT_SHELL_CLASS,
  APP_SHELL_BELOW_TOPBAR_CARD_CLASS,
  APP_SHELL_GUTTER_SURFACE_CLASS,
} from "./components/layout/appShellClasses";
import { ResizableRightChatPanel } from "./components/layout/ResizableRightChatPanel";
import { MynaChatPanel } from "./components/MynaChatPanel";
import BusinessOverviewDashboard from "./components/BusinessOverviewDashboard";
import {
  getAppViewTitle,
  LOGIN_TAB_TITLES,
  LOGIN_TAB_TITLE_COUNT,
} from "./appViewTitle";
import { l2KeyFromConversation } from "./myna/mynaL2NavKeys";
import { useMynaConversations } from "./myna/useMynaConversations";
import { ShortcutsModal } from "./shortcuts/ShortcutsModal";
import { useShortcuts } from "./shortcuts/useShortcuts";
import { ConversationStream } from "./components/ConversationStream";
import { AgentActivityView } from "./components/AgentActivityView";
import { AgentConfigView } from "./components/AgentConfigView";
import { AgentsMonitorView } from "./components/AgentsMonitorView";
import {
  AgentsBuilderView,
  AGENTS_BUILDER_NORTH_AUTONOMOUS_DISPLAY_NAME,
  AGENTS_BUILDER_NORTH_AUTONOMOUS_PRESET_ID,
} from "./components/AgentsBuilderView.v1";
import { SettingsView } from "./components/SettingsView.v1";
import { SettingsL2NavPanel } from "./components/SettingsL2NavPanel.v1";
import { BirdAILoginPage } from "./components/auth/BirdAILoginPage";
import { AppEntryWithSplash } from "./components/layout/AppEntryWithSplash";
import { MobileWebAppGate } from "./components/layout/MobileWebAppGate";
import { useMobileWebGateActive } from "./hooks/useMobileWebGateActive";

const AUTH_STORAGE_KEY = "birdai_demo_authenticated";
const LOGIN_TAB_TITLE_INDEX_KEY = "auth:login_tab_title_index";

function parseStoredLoginTabIndex(raw: string | null): number {
  if (raw === null) return 0;
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n)) return 0;
  return ((n % LOGIN_TAB_TITLE_COUNT) + LOGIN_TAB_TITLE_COUNT) % LOGIN_TAB_TITLE_COUNT;
}

function readDemoAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  try {
    // Opt-in: missing key (fresh tab / new deployment) = not authenticated
    return sessionStorage.getItem(AUTH_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

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
  | "birdai-journeys"
  | "listings"
  | "surveys"
  | "ticketing"
  | "campaigns"
  | "insights"
  | "competitors"
  | "referrals"
  | "payments"
  | "appointments"
  | "conversation-stream"
  | "agent-activity"
  | "agent-config"
  | "aeo-product-listing-1"
  | "aeo-search-ai"
  | "settings";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => readDemoAuthenticated());
  const { gateActive } = useMobileWebGateActive();

  const signIn = useCallback(() => {
    try {
      sessionStorage.setItem(AUTH_STORAGE_KEY, "true");
      // Always land on Reviews after login
      sessionStorage.setItem("nav:l1", JSON.stringify("reviews"));
    } catch {
      /* ignore */
    }
    setIsAuthenticated(true);
  }, []);

  const signOut = useCallback(() => {
    try {
      sessionStorage.setItem(AUTH_STORAGE_KEY, "false");
      const cur = parseStoredLoginTabIndex(sessionStorage.getItem(LOGIN_TAB_TITLE_INDEX_KEY));
      sessionStorage.setItem(
        LOGIN_TAB_TITLE_INDEX_KEY,
        String((cur + 1) % LOGIN_TAB_TITLE_COUNT),
      );
      // Clear nav state so next session starts fresh
      Object.keys(sessionStorage)
        .filter((k) => k.startsWith("nav:"))
        .forEach((k) => sessionStorage.removeItem(k));
    } catch {
      /* ignore */
    }
    setIsAuthenticated(false);
  }, []);

  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [currentView, setCurrentView] = usePersistedState<AppView>("nav:l1", "reviews");
  const [editingAgentName, setEditingAgentName] = useState<string | undefined>(undefined);
  const [editingDraft, setEditingDraft] = useState<DraftReport | null>(null);
  /** Journeys L2 compound key — synced when navigating via `l2:` slug prefix in handleViewChange. */
  const [journeysL2ActiveKey, setJourneysL2ActiveKey] = usePersistedState<string>(
    "nav:journeys-l2-key",
    "Agents/workflow",
  );

  const [contactsL2Active, setContactsL2Active] = usePersistedState("nav:l2:contacts", CONTACTS_L2_KEY_ALL);
  const [reviewsL2Active, setReviewsL2Active] = usePersistedState(
    "nav:l2:reviews",
    "Human actions/View all reviews",
  );
  const [reviewsBuilderActive, setReviewsBuilderActive] = useState(false);
  const [referralsL2Active, setReferralsL2Active] = usePersistedState(
    "nav:l2:referrals",
    REFERRALS_L2_DEFAULT_ACTIVE_KEY,
  );
  const [paymentsL2Active, setPaymentsL2Active] = usePersistedState(
    "nav:l2:payments",
    PAYMENTS_L2_DEFAULT_ACTIVE_KEY,
  );
  const [appointmentsL2Active, setAppointmentsL2Active] = usePersistedState(
    "nav:l2:appointments",
    APPOINTMENTS_L2_CALENDAR_KEY,
  );
  const [settingsL2Active, setSettingsL2Active] = usePersistedState<string>("settings:l2-active", "Business info");
  const [settingsScrollTarget, setSettingsScrollTarget] = useState<string | null>(null);

  const handleSettingsSectionClick = useCallback((label: string) => {
    setSettingsL2Active(label);
    setSettingsScrollTarget(label);
  }, []);

  const [contactsSheetMode, setContactsSheetMode] = useState<ContactsSheetMode>("none");
  const [contactsDetailId, setContactsDetailId] = useState<number | null>(null);
  const [contactsQuickViewId, setContactsQuickViewId] = useState<number | null>(null);
  const [contactsBulkImportActive, setContactsBulkImportActive] = useState(false);

  const [reviewsFeedbackDeepLinkKey, setReviewsFeedbackDeepLinkKey] = useState(0);
  const [reviewsFeedbackDeepLink, setReviewsFeedbackDeepLink] = useState<{ agentId: string; feedbackId: string } | null>(null);
  const [contactsBulkImportStep, setContactsBulkImportStep] =
    useState<ContactsBulkImportStep>("upload");

  const handleContactsChooseBulkImport = useCallback(() => {
    setContactsBulkImportStep("upload");
    setContactsBulkImportActive(true);
  }, []);

  const handleContactsBulkCancel = useCallback(() => {
    setContactsBulkImportActive(false);
  }, []);

  const handleContactsBulkFinish = useCallback(() => {
    setContactsBulkImportActive(false);
    setContactsBulkImportStep("upload");
  }, []);

  useEffect(() => {
    if (currentView !== "contacts") {
      setContactsBulkImportActive(false);
      setContactsBulkImportStep("upload");
    }
  }, [currentView]);

  const handleContactsL2Change = useCallback((key: string) => {
    setContactsL2Active(key);
    setContactsDetailId(null);
    setContactsSheetMode("none");
    setContactsQuickViewId(null);
  }, []);

  const handleContactsAddContact = useCallback(() => {
    setContactsSheetMode("addContact");
    setContactsQuickViewId(null);
  }, []);

  const handleSendReferralRequest = useCallback(() => {
    toast.message("Send a referral request (prototype)");
  }, []);

  const handleRequestPayment = useCallback(() => {
    toast.message("Request a payment (prototype)");
  }, []);

  const contactsApp = useMemo<ContactsAppBridge>(
    () => ({
      l2ActiveItem: contactsL2Active,
      onL2ActiveItemChange: handleContactsL2Change,
      sheetMode: contactsSheetMode,
      onSheetModeChange: setContactsSheetMode,
      detailContactId: contactsDetailId,
      onDetailContactIdChange: setContactsDetailId,
      quickViewContactId: contactsQuickViewId,
      onQuickViewContactIdChange: setContactsQuickViewId,
      onChooseBulkImport: handleContactsChooseBulkImport,
    }),
    [
      contactsL2Active,
      handleContactsL2Change,
      contactsSheetMode,
      contactsDetailId,
      contactsQuickViewId,
      handleContactsChooseBulkImport,
    ],
  );

  useEffect(() => {
    if (currentView !== "contacts") {
      setContactsL2Active(CONTACTS_L2_KEY_ALL);
      setContactsSheetMode("none");
      setContactsDetailId(null);
      setContactsQuickViewId(null);
    }
  }, [currentView]);

  const [searchAIL2Active, setSearchAIL2Active] = usePersistedState("nav:l2:searchai", SEARCH_AI_L2_DEFAULT_ACTIVE);
  const handleSearchAIL2Change = useCallback((key: string) => {
    setSearchAIL2Active(key);
  }, []);

  useEffect(() => {
    if (currentView !== "searchai") {
      setSearchAIL2Active(SEARCH_AI_L2_DEFAULT_ACTIVE);
    }
  }, [currentView]);

  const [socialL2Active, setSocialL2Active] = usePersistedState("nav:l2:social", "Publish/Calendar");
  const handleSocialL2Change = useCallback((key: string) => {
    setSocialL2Active(key);
  }, []);

  const handleViewChange = useCallback((view: AppView, slug?: string) => {
    if (view !== currentView) {
      setMynaChatExpanded(false);
    }
    if (view === "social" && currentView !== "social") {
      setSocialL2Active("Publish/Calendar");
    }
    if (slug?.startsWith("l2:")) {
      setJourneysL2ActiveKey(slug.slice(3));
      setCurrentView(view);
      return;
    }
    setCurrentView(view);
  }, [currentView, setSocialL2Active]);

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

  useEffect(() => {
    if (!isAuthenticated) {
      const idx = parseStoredLoginTabIndex(sessionStorage.getItem(LOGIN_TAB_TITLE_INDEX_KEY));
      document.title = LOGIN_TAB_TITLES[idx];
      return;
    }
    document.title = `${getAppViewTitle(currentView)} – Birdeye`;
  }, [isAuthenticated, currentView]);

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

  if (gateActive) {
    return (
      <>
        <Toaster position="top-center" richColors />
        <MobileWebAppGate />
      </>
    );
  }

  // Views that have their own L2 panels (not the default Reports L2NavPanel)
  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-center" richColors />
        <BirdAILoginPage onAuthenticated={signIn} />
      </>
    );
  }

  const hasOwnL2Panel = (v: AppView) =>
    v === "business-overview" ||
    v === "shared-by-me" ||
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
    v === "birdai-journeys" ||
    v === "agent-activity" ||
    v === "agent-config" ||
    v === "listings" ||
    v === "surveys" ||
    v === "ticketing" ||
    v === "campaigns" ||
    v === "insights" ||
    v === "competitors" ||
    v === "referrals" ||
    v === "payments" ||
    v === "appointments" ||
    v === "aeo-product-listing-1" ||
    v === "aeo-search-ai" ||
    v === "settings";

  return (
    <MonitorNotificationsProvider
      onNavigateToMonitor={() => {
        setMynaChatExpanded(false);
        setCurrentView("agents-monitor");
      }}
    >
    <AppEntryWithSplash>
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
        onSignOut={signOut}
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
        <div
          className={
            contactsBulkImportActive && currentView === "contacts"
              ? `flex-1 flex min-h-0 overflow-hidden pl-0 pr-0 pb-0 ${APP_SHELL_GUTTER_SURFACE_CLASS}`
              : `flex-1 flex min-h-0 overflow-hidden pr-[10px] pb-[10px] pl-0 ${APP_SHELL_GUTTER_SURFACE_CLASS}`
          }
        >
          <div className={APP_SHELL_BELOW_TOPBAR_CARD_CLASS}>

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

          {/* Reviews L2 nav panel — hidden while coaching canvas is open */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "reviews" && !reviewsBuilderActive && (
            <ReviewsL2NavPanel activeItem={reviewsL2Active} onActiveItemChange={setReviewsL2Active} />
          )}
          {/* Social L2 nav panel — hidden on Create post (full-width composer) */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "social" && socialL2Active !== "Create post" && (
            <SocialL2NavPanel activeItem={socialL2Active} onActiveItemChange={handleSocialL2Change} />
          )}
          {/* Chatbot (`searchai`) — shell L2 is preview only; product is not hosted here */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "searchai" && (
            <AppShellL2Placeholder />
          )}
          {/* Contacts L2 nav panel */}
          {!aiPanelOpen &&
            !mynaWorkspaceExpanded &&
            currentView === "contacts" &&
            !contactsBulkImportActive && (
            <ContactsL2NavPanel
              activeItem={contactsL2Active}
              onActiveItemChange={handleContactsL2Change}
              onAddContact={handleContactsAddContact}
            />
          )}
          {/* Listings L2 nav panel */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "listings" && (
            <ListingsL2NavPanel
              activeItem={journeysL2ActiveKey}
              onActiveItemChange={(key) => handleViewChange("listings", `l2:${key}`)}
            />
          )}
          {/* Surveys L2 nav panel */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "surveys" && (
            <AppShellL2Placeholder caption="Surveys is not hosted in this shell — secondary nav is a preview only." />
          )}
          {/* Ticketing L2 nav panel */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "ticketing" && (
            <AppShellL2Placeholder caption="Ticketing is not hosted in this shell — secondary nav is a preview only." />
          )}
          {/* Campaigns L2 nav panel */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "campaigns" && (
            <CampaignsL2NavPanel />
          )}
          {/* Insights — shell L2 is preview only; product is not hosted here (same pattern as Chatbot). */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "insights" && (
            <AppShellL2Placeholder caption="Insights is not hosted in this shell — secondary nav is a preview only." />
          )}
          {/* Competitors L2 nav panel */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "competitors" && (
            <CompetitorsL2NavPanel />
          )}
          {/* Referrals L2 nav panel */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "referrals" && (
            <ReferralsL2NavPanel
              activeItem={referralsL2Active}
              onActiveItemChange={setReferralsL2Active}
              onSendReferralRequest={handleSendReferralRequest}
            />
          )}
          {/* Payments L2 nav panel */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "payments" && (
            <PaymentsL2NavPanel
              activeItem={paymentsL2Active}
              onActiveItemChange={setPaymentsL2Active}
              onRequestPayment={handleRequestPayment}
            />
          )}
          {/* Appointments L2 nav panel */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "appointments" && (
            <AppointmentsL2NavPanel
              activeItem={appointmentsL2Active}
              onActiveItemChange={setAppointmentsL2Active}
            />
          )}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "settings" && (
            <SettingsL2NavPanel
              activeSection={settingsL2Active}
              onSectionClick={handleSettingsSectionClick}
            />
          )}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "aeo-product-listing-1" && (
            <AeoProductListing1L2NavPanel />
          )}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "aeo-search-ai" && (
            <AeoSearchAiL2NavPanel />
          )}
          {/* Inbox L2 nav panel */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "inbox" && (
            <InboxL2NavPanel />
          )}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView === "agents-monitor" && (
            <AppShellL2Placeholder caption=" " />
          )}
          {/* BirdAI — shell L2 is preview only (same pattern as Chatbot); no rail on agents-builder */}
          {!aiPanelOpen && !mynaWorkspaceExpanded && currentView !== "agents-monitor" && birdAiShellShowsL2Placeholder(currentView) && (
            <AppShellL2Placeholder caption="BirdAI is not hosted in this shell — secondary nav is a preview only." />
          )}

          {/* Main content + optional Myna chat (flex row, main keeps ≥60% when possible) */}
          <div
            ref={chatLayoutRef}
            className="flex min-h-0 min-w-0 flex-1 overflow-hidden"
          >
            {!mynaWorkspaceExpanded ? (
            <div
              className={
                contactsBulkImportActive && currentView === "contacts"
                  ? `${APP_MAIN_CONTENT_SHELL_CLASS} min-h-0 min-w-0 flex-1`
                  : `${APP_MAIN_CONTENT_SHELL_CLASS} min-h-0 min-w-[60%]`
              }
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
              <ReviewsView
                reviewsL2ActiveItem={reviewsL2Active}
                onViewFeedbackProgress={() => {
                  setReviewsFeedbackDeepLink({ agentId: "north-autonomous", feedbackId: "fb-1" });
                  setReviewsFeedbackDeepLinkKey((k) => k + 1);
                  setReviewsL2Active("Agents/Response agent");
                  handleViewChange("reviews");
                }}
                onCreateAgent={() => { setEditingAgentName(undefined); handleViewChange("agents-builder"); }}
                onEditAgent={(name) => { setEditingAgentName(name); handleViewChange("agents-builder"); }}
                onBuilderModeChange={setReviewsBuilderActive}
                initialAgentId={reviewsFeedbackDeepLink?.agentId}
                initialFeedbackId={reviewsFeedbackDeepLink?.feedbackId}
                deepLinkKey={reviewsFeedbackDeepLinkKey}
              />
            ) : currentView === "social" ? (
              <SocialView activeItem={socialL2Active} onActiveItemChange={handleSocialL2Change} />
            ) : currentView === "searchai" ? (
              <AppShellContentPlaceholder view="searchai" />
            ) : currentView === "agents-builder" ? (
              <AgentsBuilderView
                agentName={editingAgentName}
                workflowPresetId={
                  editingAgentName === AGENTS_BUILDER_NORTH_AUTONOMOUS_DISPLAY_NAME
                    ? AGENTS_BUILDER_NORTH_AUTONOMOUS_PRESET_ID
                    : undefined
                }
                initialPhase={editingAgentName ? "building" : "library"}
                onBack={() => { setEditingAgentName(undefined); handleViewChange("reviews"); }}
              />
            ) : currentView === "agents-monitor" ? (
              <AgentsMonitorView onBack={() => {}} />
            ) : birdAiShellShowsMainPlaceholder(currentView) ? (
              <AppShellContentPlaceholder view={currentView} />
            ) : currentView === "contacts" && contactsBulkImportActive ? (
              <ContactsBulkImportWorkspace
                step={contactsBulkImportStep}
                onStepChange={setContactsBulkImportStep}
                onCancel={handleContactsBulkCancel}
                onFinish={handleContactsBulkFinish}
              />
            ) : currentView === "contacts" ? (
              <ContactsView app={contactsApp} />
            ) : currentView === "scheduled-deliveries" ? (
              <ScheduledDeliveriesView onCreateSchedule={() => handleViewChange("schedule-builder")} />
            ) : currentView === "schedule-builder" ? (
              <ScheduleBuilderView onBack={() => handleViewChange("agent-detail", "scheduled-reports")} />
            ) : currentView === "listings" ? (
              <ListingsView l2ActiveItem={journeysL2ActiveKey} />
            ) : currentView === "surveys" ? (
              <AppShellContentPlaceholder view="surveys" productLabel="Surveys" />
            ) : currentView === "ticketing" ? (
              <AppShellContentPlaceholder view="ticketing" productLabel="Ticketing" />
            ) : currentView === "campaigns" ? (
              <CampaignsView />
            ) : currentView === "insights" ? (
              <AppShellContentPlaceholder view="insights" />
            ) : currentView === "competitors" ? (
              <CompetitorsView />
            ) : currentView === "referrals" ? (
              <ReferralsView activeSection={referralsL2KeyToSection(referralsL2Active)} />
            ) : currentView === "payments" ? (
              <PaymentsView statusFilter={paymentsL2KeyToStatusFilter(paymentsL2Active)} />
            ) : currentView === "appointments" ? (
              appointmentsL2ShowsCalendarCanvas(appointmentsL2Active) ? (
                <AppointmentsView />
              ) : (
                <AppShellContentPlaceholder
                  view="appointments"
                  productLabel={appointmentsL2PlaceholderProductLabel(appointmentsL2Active)}
                />
              )
            ) : currentView === "aeo-product-listing-1" ? (
              <AppShellContentPlaceholder view="aeo-product-listing-1" productLabel="Listings" />
            ) : currentView === "aeo-search-ai" ? (
              <AppShellContentPlaceholder view="aeo-search-ai" productLabel="Search AI" />
            ) : currentView === "conversation-stream" ? (
              <ConversationStream />
            ) : currentView === "agent-activity" ? (
              <AgentActivityView onConfigure={() => handleViewChange("agent-config")} />
            ) : currentView === "agent-config" ? (
              <AgentConfigView />
            ) : currentView === "settings" ? (
              <SettingsView
                scrollTarget={settingsScrollTarget}
                onScrollTargetConsumed={() => setSettingsScrollTarget(null)}
                activeSection={settingsL2Active}
                onActiveSectionChange={setSettingsL2Active}
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
    </div>
    </AppEntryWithSplash>
    </MonitorNotificationsProvider>
  );
}
