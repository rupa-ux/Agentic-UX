import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useCallback,
} from "react";
import { usePersistedState } from "@/app/hooks/usePersistedState";
import type { LucideIcon } from "lucide-react";
import {
  ChevronDown, ChevronUp, Settings, Camera, Moon, Sun, Monitor, ChevronLeft, ExternalLink, Plus, Info, MessageSquare,
  MoreHorizontal,
  Search,
  Shield,
  ClipboardList,
  Pencil,
  Receipt,
  User,
} from "lucide-react";
import { useProductVertical, type ProductVertical } from "@/app/context/ProductVerticalContext";
import {
  FigmaIconBirdAI, FigmaIconOverview, FigmaIconInbox,
  FigmaIconReviews, FigmaIconReferrals, FigmaIconPayments, FigmaIconAppointments,
  FigmaIconSocial, FigmaIconSurveys, FigmaIconTicketing, FigmaIconContacts,
  FigmaIconCampaigns, FigmaIconCompetitors, FigmaIconInsights, FigmaIconReports,
  FigmaIconListings,
} from "./l1Icons";
import type { AppView } from "../App";
import { BirdeyeLogoMark } from "@/app/components/brand/BirdeyeLogoMark";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { Switch } from "@/app/components/ui/switch";
import { APP_SHELL_RAIL_SURFACE_CLASS } from "@/app/components/layout/appShellClasses";
import { FLOATING_PANEL_SURFACE_CLASSNAME } from "@/app/components/ui/floatingPanelSurface";
import { L1_STRIP_ICON_SIZE, L1_STRIP_ICON_STROKE_PX } from "./l1StripIconTokens";
import { MonitorNotificationsTrigger } from "./MonitorNotificationsTrigger";
import { AccountSettingsSheet } from "./settings/AccountSettingsSheet";
import { useTheme, type ThemePreference } from "./useTheme";
import { useSidebarHoverExpand } from "@/app/hooks/useSidebarHoverExpand";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import {
  L2NavLayout,
  L2_FLAT_NAV_KEY_PREFIX,
  PANEL,
  ROW,
  L2_ROW_SELECTED_BG,
  CHILD_ACTIVE,
  CHILD_INACTIVE,
  FOOTER_ROW_CLS,
  SECTION_HEADER,
  L2_HEADER_PLUS_WRAPPER_BLUE,
  L2_HEADER_PLUS_GLYPH_BLUE,
  L2_HEADER_PLUS_STROKE_PX,
} from "./L2NavLayout";
import { APPOINTMENTS_L2_CALENDAR_KEY } from "@/app/components/appointmentsL2Nav";

/** How long to show the Reports-row shimmer before opening the tab (~sub-second “micro” handoff). */
export const REPORTS_EXTERNAL_SHIMMER_MS = 480;

/** Opens the full Reporting module in a new tab. Set `VITE_REPORTING_MODULE_URL` in the host app when known. */
export function openReportingModuleInNewTab() {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  const envUrl = (env?.VITE_REPORTING_MODULE_URL ?? "").trim();
  const url = envUrl || `${window.location.origin}${window.location.pathname}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1617853701628-bfcf8b81d13d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBoZWFkc2hvdCUyMHNtaWxlJTIwc3R1ZGlvJTIwbGlnaHRpbmd8ZW58MXx8fHwxNzczMjE4MDIzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

type SidebarNavItem = {
  label: string;
  Icon: React.ElementType;
  view: AppView;
};

type SidebarNavSection = {
  title?: string;
  items: SidebarNavItem[];
};

function AeoSearchAiL1Icon({ size, className }: { size?: number; className?: string }) {
  return (
    <Search
      size={size}
      className={className}
      strokeWidth={L1_STRIP_ICON_STROKE_PX}
      absoluteStrokeWidth
    />
  );
}

function createHealthcareL1Icon(Icon: LucideIcon) {
  return function HealthcareL1Icon({ size, className }: { size?: number; className?: string }) {
    return (
      <Icon
        size={size}
        className={className}
        strokeWidth={L1_STRIP_ICON_STROKE_PX}
        absoluteStrokeWidth
      />
    );
  };
}

const HealthcareL1IconFrontdesk = createHealthcareL1Icon(Monitor);
const HealthcareL1IconInsurance = createHealthcareL1Icon(Shield);
const HealthcareL1IconIntake = createHealthcareL1Icon(ClipboardList);
const HealthcareL1IconPrescriptions = createHealthcareL1Icon(Pencil);
const HealthcareL1IconClaims = createHealthcareL1Icon(Receipt);
const HealthcareL1IconPatients = createHealthcareL1Icon(User);

const sidebarSections: SidebarNavSection[] = [
  {
    items: [
      { label: "Overview", Icon: FigmaIconOverview, view: "business-overview" },
      { label: "Agents", Icon: FigmaIconBirdAI, view: "agents-monitor" },
    ],
  },
  {
    title: "Marketing",
    items: [
      { label: "Search AI", Icon: AeoSearchAiL1Icon, view: "aeo-search-ai" },
      { label: "Listings", Icon: FigmaIconListings, view: "aeo-product-listing-1" },
      { label: "Reviews", Icon: FigmaIconReviews, view: "reviews" },
      { label: "Social", Icon: FigmaIconSocial, view: "social" },
      { label: "Referrals", Icon: FigmaIconReferrals, view: "referrals" },
      { label: "Marketing automations", Icon: FigmaIconCampaigns, view: "campaigns" },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Inbox", Icon: FigmaIconInbox, view: "inbox" },
      { label: "Appointments", Icon: FigmaIconAppointments, view: "appointments" },
      { label: "Contacts", Icon: FigmaIconContacts, view: "contacts" },
      { label: "Payments", Icon: FigmaIconPayments, view: "payments" },
    ],
  },
  {
    title: "Customer experience",
    items: [
      { label: "Ticketing", Icon: FigmaIconTicketing, view: "ticketing" },
      { label: "Surveys", Icon: FigmaIconSurveys, view: "surveys" },
    ],
  },
  {
    title: "Analytics",
    items: [
      { label: "Reports", Icon: FigmaIconReports, view: "dashboard" },
      { label: "Insights", Icon: FigmaIconInsights, view: "insights" },
    ],
  },
];

const healthcareSections: SidebarNavSection[] = [
  {
    title: "Marketing",
    items: [
      { label: "Search AI", Icon: AeoSearchAiL1Icon, view: "aeo-search-ai" },
      { label: "Listings", Icon: FigmaIconListings, view: "aeo-product-listing-1" },
      { label: "Reviews", Icon: FigmaIconReviews, view: "reviews" },
      { label: "Social", Icon: FigmaIconSocial, view: "social" },
      { label: "Referral", Icon: FigmaIconReferrals, view: "referrals" },
      { label: "Marketing automation", Icon: FigmaIconCampaigns, view: "campaigns" },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Inbox", Icon: FigmaIconInbox, view: "inbox" },
      { label: "Frontdesk", Icon: HealthcareL1IconFrontdesk, view: "healthcare-frontdesk" },
      { label: "Appointments", Icon: FigmaIconAppointments, view: "appointments" },
      { label: "Insurance", Icon: HealthcareL1IconInsurance, view: "healthcare-insurance" },
      { label: "Intake", Icon: HealthcareL1IconIntake, view: "healthcare-intake" },
      { label: "Prescriptions", Icon: HealthcareL1IconPrescriptions, view: "healthcare-prescriptions" },
      { label: "Claims", Icon: HealthcareL1IconClaims, view: "healthcare-claims" },
    ],
  },
  {
    title: "Customer experience",
    items: [
      { label: "Surveys", Icon: FigmaIconSurveys, view: "surveys" },
      { label: "Ticketing", Icon: FigmaIconTicketing, view: "ticketing" },
      { label: "Reports", Icon: FigmaIconReports, view: "dashboard" },
      { label: "Insights", Icon: FigmaIconInsights, view: "insights" },
    ],
  },
  {
    title: "Patients",
    items: [
      { label: "Patients", Icon: HealthcareL1IconPatients, view: "healthcare-patients" },
    ],
  },
];

const dentalSections: SidebarNavSection[] = [
  {
    items: [
      { label: "Overview", Icon: FigmaIconOverview, view: "business-overview" },
      { label: "Agents", Icon: FigmaIconBirdAI, view: "agents-monitor" },
    ],
  },
  {
    title: "Marketing",
    items: [
      { label: "Search AI", Icon: AeoSearchAiL1Icon, view: "aeo-search-ai" },
      { label: "Listings", Icon: FigmaIconListings, view: "aeo-product-listing-1" },
      { label: "Reviews", Icon: FigmaIconReviews, view: "reviews" },
      { label: "Referrals", Icon: FigmaIconReferrals, view: "referrals" },
      { label: "Marketing automations", Icon: FigmaIconCampaigns, view: "campaigns" },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Inbox", Icon: FigmaIconInbox, view: "inbox" },
      { label: "Appointments", Icon: FigmaIconAppointments, view: "appointments" },
      { label: "Contacts", Icon: FigmaIconContacts, view: "contacts" },
      { label: "Payments", Icon: FigmaIconPayments, view: "payments" },
    ],
  },
  {
    title: "Patient experience",
    items: [
      { label: "Surveys", Icon: FigmaIconSurveys, view: "surveys" },
    ],
  },
  {
    title: "Analytics",
    items: [
      { label: "Reports", Icon: FigmaIconReports, view: "dashboard" },
      { label: "Insights", Icon: FigmaIconInsights, view: "insights" },
    ],
  },
];

const automotiveSections: SidebarNavSection[] = [
  {
    items: [
      { label: "Overview", Icon: FigmaIconOverview, view: "business-overview" },
      { label: "Agents", Icon: FigmaIconBirdAI, view: "agents-monitor" },
    ],
  },
  {
    title: "Marketing",
    items: [
      { label: "Search AI", Icon: AeoSearchAiL1Icon, view: "aeo-search-ai" },
      { label: "Listings", Icon: FigmaIconListings, view: "aeo-product-listing-1" },
      { label: "Reviews", Icon: FigmaIconReviews, view: "reviews" },
      { label: "Social", Icon: FigmaIconSocial, view: "social" },
      { label: "Marketing automations", Icon: FigmaIconCampaigns, view: "campaigns" },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Inbox", Icon: FigmaIconInbox, view: "inbox" },
      { label: "Appointments", Icon: FigmaIconAppointments, view: "appointments" },
      { label: "Contacts", Icon: FigmaIconContacts, view: "contacts" },
      { label: "Payments", Icon: FigmaIconPayments, view: "payments" },
    ],
  },
  {
    title: "Customer experience",
    items: [
      { label: "Surveys", Icon: FigmaIconSurveys, view: "surveys" },
    ],
  },
  {
    title: "Analytics",
    items: [
      { label: "Reports", Icon: FigmaIconReports, view: "dashboard" },
      { label: "Insights", Icon: FigmaIconInsights, view: "insights" },
    ],
  },
];

function getSectionsForVertical(vertical: ProductVertical): SidebarNavSection[] {
  switch (vertical) {
    case "healthcare": return healthcareSections;
    case "dental": return dentalSections;
    case "automotive": return automotiveSections;
    default: return sidebarSections;
  }
}

const RAIL_ICON_PX = 32;
const RAIL_SECTION_INNER_GAP_PX = 2;
const RAIL_SECTION_BREAK_GAP_PX = 18;
/** Uniform stack pitch when the rail is in overflow mode (icon + gap-2). */
const RAIL_OVERFLOW_ROW_PITCH_PX = RAIL_ICON_PX + 8;

function heightOfCollapsedSectionedRail(sections: SidebarNavSection[]): number {
  let h = 0;
  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i];
    const n = sec.items.length;
    if (n === 0) continue;
    h += n * RAIL_ICON_PX + (n - 1) * RAIL_SECTION_INNER_GAP_PX;
    if (i < sections.length - 1) h += RAIL_SECTION_BREAK_GAP_PX;
  }
  return h;
}

/* ═══════════════════════════════════════════
   Icon Strip (L1 nav rail) – exported separately
   (sizes / stroke: `l1StripIconTokens`)
   ═══════════════════════════════════════════ */

interface IconStripProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  /** Icon size in px. Defaults to `L1_STRIP_ICON_SIZE` (16.2). */
  iconSize?: number;
  onOpenKeyboardShortcuts?: () => void;
  /** Demo auth: clear session and show login (wired from App). */
  onSignOut?: () => void;
}

export function IconStrip({
  currentView,
  onViewChange,
  iconSize = L1_STRIP_ICON_SIZE,
  onOpenKeyboardShortcuts,
  onSignOut,
}: IconStripProps) {
  const [activeIcon, setActiveIcon] = useState("Agents");
  const [profileOpen, setProfileOpen] = useState(false);
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);
  const { vertical } = useProductVertical();

  /* ── L1 hover-to-expand (user preference; see useSidebarHoverExpand) ── */
  const [hoverExpandEnabled, setHoverExpandEnabled] = useSidebarHoverExpand();
  const [expanded, setExpanded] = useState(false);
  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const handleRailEnter = useCallback(() => {
    if (!hoverExpandEnabled) return;
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    openTimerRef.current = window.setTimeout(() => {
      setExpanded(true);
      openTimerRef.current = null;
    }, 160);
  }, [hoverExpandEnabled]);

  const handleRailLeave = useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setExpanded(false);
      closeTimerRef.current = null;
    }, 200);
  }, []);

  // If preference flips off while expanded, collapse immediately.
  useEffect(() => {
    if (!hoverExpandEnabled && expanded) setExpanded(false);
  }, [hoverExpandEnabled, expanded]);

  useEffect(() => {
    return () => {
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);
  // Portal tooltip — fixed position so it escapes overflow-y: auto clipping
  const [tooltip, setTooltip] = useState<{ label: string; top: number } | null>(null);

  const showTooltip = (e: React.MouseEvent<HTMLElement>, label: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ label, top: rect.top + rect.height / 2 });
  };
  const hideTooltip = () => setTooltip(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void showTooltip; void hideTooltip; void tooltip;
  const [showAppearance, setShowAppearance] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const overflowNavRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isDark, preference, setPreference } = useTheme();

  const [avatarUrl, setAvatarUrl] = useState<string>(() => {
    return localStorage.getItem("profile_avatar") || DEFAULT_AVATAR;
  });

  const activeSections = useMemo(() => getSectionsForVertical(vertical), [vertical]);
  const flatNav = useMemo(() => activeSections.flatMap((s) => s.items), [activeSections]);
  const [swapView, setSwapView] = usePersistedState<AppView | null>("nav:l1:swapView", null);
  const navMeasureRef = useRef<HTMLDivElement>(null);
  const [navInnerH, setNavInnerH] = useState(0);
  const [overflowNavOpen, setOverflowNavOpen] = useState(false);

  // Sync activeIcon with currentView (layout effect avoids wrong rail highlight on first paint)
  useLayoutEffect(() => {
    if (currentView === "business-overview") setActiveIcon("Overview");
    else if (currentView === "inbox") setActiveIcon("Inbox");
    else if (currentView === "reviews") setActiveIcon("Reviews");
    else if (currentView === "social") setActiveIcon("Social");
    else if (currentView === "searchai" || currentView === "conversation-stream") setActiveIcon("Chatbot");
    else if (currentView === "contacts") setActiveIcon("Contacts");
    else if (currentView === "surveys") setActiveIcon("Surveys");
    else if (currentView === "ticketing") setActiveIcon("Ticketing");
    else if (currentView === "campaigns") setActiveIcon("Campaigns");
    else if (currentView === "insights") setActiveIcon("Insights");
    else if (currentView === "competitors") setActiveIcon("Competitors");
    else if (currentView === "referrals") setActiveIcon("Referral");
    else if (currentView === "healthcare-frontdesk") setActiveIcon("Frontdesk");
    else if (currentView === "healthcare-insurance") setActiveIcon("Insurance");
    else if (currentView === "healthcare-intake") setActiveIcon("Intake");
    else if (currentView === "healthcare-prescriptions") setActiveIcon("Prescriptions");
    else if (currentView === "healthcare-claims") setActiveIcon("Claims");
    else if (currentView === "healthcare-patients") setActiveIcon("Patients");
    else if (currentView === "payments") setActiveIcon("Payments");
    else if (currentView === "appointments") setActiveIcon("Appointments");
    else if (currentView === "aeo-product-listing-1") setActiveIcon("Listings");
    else if (currentView === "aeo-search-ai") setActiveIcon("Search AI");
    else if (currentView === "dashboard" || currentView === "shared-by-me") setActiveIcon("Reports");
    else if (currentView === "agent-config" || currentView === "settings") setActiveIcon("Settings");
    else if (currentView === "agents-monitor" || currentView === "agents-analyze-performance" || currentView === "agents-builder" || currentView === "agent-detail" || currentView === "agents-onboarding" || currentView === "birdai-reports" || currentView === "birdai-journeys") setActiveIcon("Agents");
    // scheduled-deliveries / schedule-builder: no icon mapping
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
      const t = e.target as Node;
      if (profileRef.current && !profileRef.current.contains(t)) {
        setProfileOpen(false);
        setShowAppearance(false);
      }
      if (overflowNavRef.current && !overflowNavRef.current.contains(t)) {
        setOverflowNavOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNavClick = (label: string) => {
    setActiveIcon(label);
    if (label === "Overview") onViewChange("business-overview");
    else if (label === "Agents") onViewChange("agents-monitor");
    else if (label === "Reviews") {
      try {
        sessionStorage.setItem("nav:l2:reviews", JSON.stringify("Human actions/View all reviews"));
      } catch {
        // Ignore storage write failures and continue navigation.
      }
      onViewChange("reviews");
    }
    else if (label === "Social") onViewChange("social");
    else if (label === "Referral" || label === "Referrals") onViewChange("referrals");
    else if (label === "Contacts") onViewChange("contacts");
    else if (label === "Marketing automation" || label === "Marketing automations" || label === "Campaigns") {
      onViewChange("campaigns");
    }
    else if (label === "Inbox") onViewChange("inbox");
    else if (label === "Payments") onViewChange("payments");
    else if (label === "Appointments") onViewChange("appointments");
    else if (label === "Chatbot") onViewChange("searchai");
    else if (label === "Reports") onViewChange("dashboard");
    else if (label === "Insights") onViewChange("insights");
    else if (label === "Ticketing") onViewChange("ticketing");
    else if (label === "Surveys") onViewChange("surveys");
    else if (label === "Listings") onViewChange("aeo-product-listing-1");
    else if (label === "Search AI") onViewChange("aeo-search-ai");
    else if (label === "Frontdesk") onViewChange("healthcare-frontdesk");
    else if (label === "Insurance") onViewChange("healthcare-insurance");
    else if (label === "Intake") onViewChange("healthcare-intake");
    else if (label === "Prescriptions") onViewChange("healthcare-prescriptions");
    else if (label === "Claims") onViewChange("healthcare-claims");
    else if (label === "Patients") onViewChange("healthcare-patients");
    else if (label === "Settings") onViewChange("agent-config");
  };

  useLayoutEffect(() => {
    const el = navMeasureRef.current;
    if (!el) return;
    const apply = () => setNavInnerH(el.clientHeight);
    apply();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const railMetrics = useMemo(() => {
    const measured = navInnerH > 0;
    const fullH = heightOfCollapsedSectionedRail(activeSections);
    const overflowMode = measured && fullH > navInnerH;
    const maxRows = Math.max(2, Math.floor((navInnerH + 8) / RAIL_OVERFLOW_ROW_PITCH_PX));
    const P =
      overflowMode
        ? Math.max(0, Math.min(maxRows - 2, Math.max(0, flatNav.length - 2)))
        : flatNav.length;
    const tailSlice = overflowMode ? flatNav.slice(P) : [];
    const defaultSwapItem = flatNav[Math.min(P, flatNav.length - 1)] ?? flatNav[0];
    return { overflowMode, P, maxRows, tailSlice, defaultSwapItem };
  }, [navInnerH, flatNav]);

  const effectiveSwapItem = useMemo(() => {
    if (!railMetrics.overflowMode) return null;
    const { tailSlice, defaultSwapItem } = railMetrics;
    if (swapView !== null) {
      const hit = flatNav.find((i) => i.view === swapView);
      if (hit && tailSlice.some((t) => t.view === hit.view)) return hit;
    }
    return defaultSwapItem ?? null;
  }, [railMetrics, swapView, flatNav]);

  useLayoutEffect(() => {
    if (!railMetrics.overflowMode || swapView === null) return;
    if (!railMetrics.tailSlice.some((t) => t.view === swapView)) {
      setSwapView(null);
    }
  }, [railMetrics.overflowMode, railMetrics.tailSlice, swapView, setSwapView]);

  useEffect(() => {
    if (!railMetrics.overflowMode && overflowNavOpen) setOverflowNavOpen(false);
  }, [railMetrics.overflowMode, overflowNavOpen]);

  /**
   * L1 rail + expanded nav pills — `bg-app-shell-l1-nav-highlight` (darker blue-grey on the rail; not near-white).
   * Pressed: `bg-app-shell-l1-nav-pressed`. Menus: `bg-primary/10` (Design Tokens → Navigation selection).
   */
  const navActiveBg = "bg-app-shell-l1-nav-highlight";
  const navHoverBg =
    "hover:bg-app-shell-l1-nav-highlight active:bg-app-shell-l1-nav-pressed";

  const renderRailButton = (item: SidebarNavItem) => {
    const isActive = item.label === activeIcon;
    const btn = (
      <button
        key={item.label}
        type="button"
        onClick={() => handleNavClick(item.label)}
        aria-label={item.label}
        className={`
          group relative w-[32px] h-[32px] flex items-center justify-center rounded-[10px] shrink-0
          transition-all duration-200 ease-out outline-none
          focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1 focus-visible:ring-offset-app-shell-rail
          ${isActive ? `${navActiveBg} shadow-none` : `bg-transparent ${navHoverBg} hover:scale-110 active:scale-95`}
        `}
      >
        <item.Icon
          size={iconSize}
          className={`transition-all duration-200 ${
            isActive
              ? "text-primary"
              : "text-muted-foreground group-hover:scale-110"
          } ${item.label === "Agents" && isActive ? "group-hover:animate-[agents-shimmer_3s_ease-in-out_infinite]" : ""}`}
        />
      </button>
    );
    if (hoverExpandEnabled) return btn;
    return (
      <Tooltip key={item.label}>
        <TooltipTrigger asChild>{btn}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>{item.label}</TooltipContent>
      </Tooltip>
    );
  };

  const renderPanelButton = (item: SidebarNavItem) => {
    const isActive = item.label === activeIcon;
    return (
      <button
        key={item.label}
        type="button"
        onClick={() => handleNavClick(item.label)}
        aria-label={item.label}
        className={`
          group relative w-full h-[32px] flex items-center rounded-[10px] shrink-0 outline-none
          transition-colors duration-200 ease-out
          focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1
          ${isActive ? navActiveBg : `bg-transparent ${navHoverBg}`}
        `}
      >
        <span className="flex w-[32px] h-[32px] items-center justify-center shrink-0">
          <item.Icon
            size={iconSize}
            className={`transition-colors duration-200 ${
              isActive
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          />
        </span>
        <span
          className={`ml-3 text-[13px] whitespace-nowrap ${
            isActive
              ? "text-primary"
              : "text-foreground"
          }`}
        >
          {item.label}
        </span>
      </button>
    );
  };

  const renderRailSection = (section: SidebarNavSection, index: number) => (
    <div key={section.title ?? `top-${index}`} className="flex flex-col items-center gap-[2px] w-full">
      {section.items.map((item) => renderRailButton(item))}
    </div>
  );

  const renderPanelSection = (section: SidebarNavSection, index: number) => (
    <div key={section.title ?? `top-${index}`} className="flex flex-col">
      {section.title && (
        <div className="px-2 pt-3 pb-1 text-[10px] uppercase tracking-[0.6px] text-muted-foreground">
          {section.title}
        </div>
      )}
      <div className="flex flex-col gap-[2px]">
        {section.items.map((item) => renderPanelButton(item))}
      </div>
    </div>
  );

  return (
    <TooltipProvider delayDuration={250}>
    <div
      className="relative w-[66px] shrink-0 h-full text-base"
      data-no-print
    >
      <div
        onMouseEnter={handleRailEnter}
        onMouseLeave={handleRailLeave}
        aria-expanded={expanded}
        className={`absolute inset-0 flex flex-col ${APP_SHELL_RAIL_SURFACE_CLASS}`}
      >
      {/* Birdeye logo */}
      <div className="h-[48px] w-[55px] flex items-center justify-center shrink-0 self-center">
        <BirdeyeLogoMark />
      </div>

      {/* 70% main nav · 20% spacer · 10% bottom cluster (settings, notifications, profile) */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div
          ref={navMeasureRef}
          className={`flex min-h-0 flex-[7] flex-col px-[12px] ${
            /* L1 ⋯ flyout is `absolute` to the right; `overflow-hidden` here clips it off. */
            railMetrics.overflowMode ? "overflow-visible" : "overflow-hidden"
          }`}
        >
          <div
            className={`flex min-h-0 flex-1 flex-col items-center py-2 ${
              railMetrics.overflowMode
                ? "justify-start gap-2 overflow-visible"
                : "justify-start gap-[18px] overflow-hidden"
            }`}
          >
            {railMetrics.overflowMode ? (
              <>
                {flatNav.slice(0, railMetrics.P).map((item) => renderRailButton(item))}
                {effectiveSwapItem ? renderRailButton(effectiveSwapItem) : null}
                <div className="relative shrink-0" ref={overflowNavRef}>
                  {(() => {
                    const moreBtn = (
                      <button
                        type="button"
                        aria-label="More navigation"
                        aria-expanded={overflowNavOpen}
                        onClick={() => {
                          setProfileOpen(false);
                          setShowAppearance(false);
                          setOverflowNavOpen((o) => !o);
                        }}
                        className={`
                          group relative w-[32px] h-[32px] flex items-center justify-center rounded-[10px] shrink-0
                          transition-all duration-200 ease-out outline-none
                          focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1 focus-visible:ring-offset-app-shell-rail
                          bg-transparent ${navHoverBg} hover:scale-110 active:scale-95
                        `}
                      >
                        <MoreHorizontal
                          size={iconSize}
                          strokeWidth={L1_STRIP_ICON_STROKE_PX}
                          absoluteStrokeWidth
                          className="text-muted-foreground transition-all duration-200 group-hover:scale-110"
                        />
                      </button>
                    );
                    return hoverExpandEnabled ? (
                      moreBtn
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>{moreBtn}</TooltipTrigger>
                        <TooltipContent side="right" sideOffset={8}>More navigation</TooltipContent>
                      </Tooltip>
                    );
                  })()}
                  {overflowNavOpen ? (
                    <div
                      className={`absolute left-[calc(100%+8px)] top-1/2 z-50 flex w-[260px] max-h-[min(480px,calc(100vh-2rem))] -translate-y-1/2 flex-col overflow-hidden transition-colors duration-300 ${FLOATING_PANEL_SURFACE_CLASSNAME}`}
                    >
                      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-2 pb-3 pt-3">
                        {railMetrics.tailSlice.map((item) => (
                          <button
                            key={item.view}
                            type="button"
                            onClick={() => {
                              setSwapView(item.view);
                              handleNavClick(item.label);
                              setOverflowNavOpen(false);
                            }}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] transition-colors duration-150 ${
                              activeIcon === item.label
                                ? "bg-primary/10 text-primary"
                                : "text-foreground hover:bg-accent dark:hover:bg-white/[0.06]"
                            }`}
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-transparent">
                              <item.Icon
                                size={iconSize}
                                className={
                                  activeIcon === item.label
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                }
                              />
                            </span>
                            <span className="min-w-0 truncate">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              activeSections.map(renderRailSection)
            )}
          </div>
        </div>

        <div className="min-h-0 flex-[2] shrink-0 basis-0" aria-hidden />

        {/* ─── Bottom tower: Settings + Notifications + Profile ─── */}
        <div className="flex min-h-0 flex-[1] shrink-0 basis-0 flex-col items-center justify-end gap-2 pb-3 pt-2">
        {/* Settings gear — same surface / hover / focus as L1 nav icons */}
        {(() => {
          const settingsBtn = (
            <button
              type="button"
              aria-label="Settings"
              onClick={() => onViewChange("settings")}
              className={`group relative w-[32px] h-[32px] flex items-center justify-center rounded-[10px] shrink-0 transition-all duration-200 ease-out outline-none bg-transparent ${currentView === "settings" ? navActiveBg : `${navHoverBg} hover:scale-110 active:scale-95`} focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1 focus-visible:ring-offset-app-shell-rail`}
            >
              <Settings
                width={L1_STRIP_ICON_SIZE}
                height={L1_STRIP_ICON_SIZE}
                strokeWidth={L1_STRIP_ICON_STROKE_PX}
                absoluteStrokeWidth
                className={`transition-all duration-200 ${currentView === "settings" ? "text-primary" : "text-muted-foreground group-hover:scale-110"}`}
              />
            </button>
          );
          if (hoverExpandEnabled) return settingsBtn;
          return (
            <Tooltip>
              <TooltipTrigger asChild>{settingsBtn}</TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>Settings</TooltipContent>
            </Tooltip>
          );
        })()}

        <MonitorNotificationsTrigger />

        {/* Profile avatar with upward dropdown */}
        <div className="relative" ref={profileRef}>
          <Button
            type="button"
            variant="ghost"
            size="iconXs"
            onClick={() => {
              setOverflowNavOpen(false);
              setProfileOpen(!profileOpen);
              if (profileOpen) setShowAppearance(false);
            }}
            className="relative min-h-0 min-w-0 shrink-0 cursor-pointer overflow-hidden rounded-full p-0 shadow-sm ring-2 ring-white/80 transition-all hover:ring-white dark:ring-[#3d4555] dark:hover:ring-[#4d5568]"
          >
            <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
          </Button>

          {/* Dropdown - opens UPWARD from bottom-left */}
          {profileOpen && (
            <div
              className={`absolute bottom-0 left-[calc(100%+8px)] z-50 w-[260px] overflow-hidden transition-colors duration-300 ${FLOATING_PANEL_SURFACE_CLASSNAME}`}
            >
              {/* Slide between main menu and appearance sub-panel */}
              <div className="relative overflow-hidden">
                <div
                  className="flex transition-transform duration-250 ease-in-out"
                  style={{ transform: showAppearance ? "translateX(-100%)" : "translateX(0)" }}
                >
                  {/* ─── Main menu panel ─── */}
                  <div className="w-full shrink-0">
                    {/* Profile header — inset from card edge (Subframe-style shell) */}
                    <div className="px-4 pb-2 pt-4">
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
                          <p className="text-[13px] text-foreground truncate" style={{ fontWeight: 400 }}>John Doe</p>
                          <p className="text-[11px] text-muted-foreground truncate">john.doe@acmecorp.com</p>
                        </div>
                      </div>
                    </div>
                    {/* Text-only rows: inset pill hovers (Subframe-style), no icons */}
                    <div className="flex flex-col gap-1 px-2 pb-3">
                      <button
                        type="button"
                        onClick={() => {
                          setAccountSheetOpen(true);
                          setProfileOpen(false);
                          setShowAppearance(false);
                        }}
                        className="w-full rounded-lg px-3 py-2 text-left text-[13px] text-foreground transition-colors duration-150 hover:bg-accent dark:hover:bg-white/[0.06]"
                      >
                        My profile
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onViewChange("shared-by-me");
                          setProfileOpen(false);
                          setShowAppearance(false);
                        }}
                        className={`w-full rounded-lg px-3 py-2 text-left text-[13px] transition-colors duration-150 ${
                          currentView === "shared-by-me"
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-accent dark:hover:bg-white/[0.06]"
                        }`}
                      >
                        Shared by me
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onViewChange("scheduled-deliveries");
                          setProfileOpen(false);
                          setShowAppearance(false);
                        }}
                        className={`w-full rounded-lg px-3 py-2 text-left text-[13px] transition-colors duration-150 ${
                          currentView === "scheduled-deliveries"
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-accent dark:hover:bg-white/[0.06]"
                        }`}
                      >
                        Scheduled deliveries
                      </button>
                      <button
                        type="button"
                        onClick={() => { onViewChange("settings"); setProfileOpen(false); setShowAppearance(false); }}
                        className={`w-full rounded-lg px-3 py-2 text-left text-[13px] transition-colors duration-150 ${currentView === "settings" ? "text-primary bg-accent dark:bg-white/[0.06]" : "text-foreground hover:bg-accent dark:hover:bg-white/[0.06]"}`}
                      >
                        Settings
                      </button>
                      {onOpenKeyboardShortcuts && (
                        <button
                          type="button"
                          onClick={() => {
                            onOpenKeyboardShortcuts();
                            setProfileOpen(false);
                            setShowAppearance(false);
                          }}
                          className="w-full rounded-lg px-3 py-2 text-left text-[13px] text-foreground transition-colors duration-150 hover:bg-accent dark:hover:bg-white/[0.06]"
                        >
                          Keyboard shortcuts
                        </button>
                      )}
                      <div className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-[13px] text-foreground transition-colors duration-150 hover:bg-accent dark:hover:bg-white/[0.06]">
                        <span>Expand sidebar on hover</span>
                        <Switch
                          checked={hoverExpandEnabled}
                          onCheckedChange={setHoverExpandEnabled}
                          aria-label="Expand sidebar on hover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAppearance(true)}
                        className="w-full rounded-lg px-3 py-2 text-left text-[13px] text-foreground transition-colors duration-150 hover:bg-accent dark:hover:bg-white/[0.06]"
                      >
                        Switch appearance
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          setShowAppearance(false);
                          onSignOut?.();
                        }}
                        className="w-full rounded-lg px-3 py-2 text-left text-[13px] text-destructive transition-colors duration-150 hover:bg-destructive/10"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>

                  {/* ─── Appearance sub-panel ─── */}
                  <div className="w-full shrink-0">
                    {/* Header row */}
                    <div className="flex items-center gap-2 px-4 py-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setShowAppearance(false)}
                        className="shrink-0 border-2 border-primary transition-colors hover:bg-primary/10"
                      >
                        <ChevronLeft className="h-4 w-4 text-primary" />
                      </Button>
                      <span className="flex-1 text-[14px] text-foreground" style={{ fontWeight: 400 }}>
                        Switch appearance
                      </span>
                      <Moon
                        className="h-5 w-5 text-muted-foreground transition-transform duration-500"
                        style={{ transform: isDark ? "rotate(-30deg)" : "rotate(0deg)" }}
                      />
                    </div>
                    {/* Theme options — same inset pill rows as main profile menu */}
                    <div className="flex flex-col gap-1 px-2 pb-3 pt-1">
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
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-[13px] transition-colors duration-150 ${
                              isSelected
                                ? "bg-primary/10 text-primary"
                                : "text-foreground hover:bg-accent dark:hover:bg-white/[0.06]"
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <Icon
                                className={`h-4 w-4 transition-transform duration-500 ${
                                  isSelected ? "text-primary" : "text-muted-foreground"
                                }`}
                                style={{
                                  transform: value === "dark" && isDark ? "rotate(-30deg)" : "rotate(0deg)",
                                }}
                              />
                              {label}
                            </span>
                            {/* Radio indicator */}
                            <span
                              className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 transition-colors ${
                                isSelected
                                  ? "border-primary"
                                  : "border-muted-foreground/40"
                              }`}
                            >
                              {isSelected && (
                                <span className="h-[10px] w-[10px] rounded-full bg-primary" />
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
      </div>

      {/* ═══ Floating expanded panel — appears on hover ═══ */}
      <div
        onMouseEnter={handleRailEnter}
        onMouseLeave={handleRailLeave}
        aria-hidden={!expanded}
        className={`absolute top-2 bottom-2 left-2 w-[272px] flex flex-col rounded-xl border border-white/45 bg-white/70 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_18px_60px_rgba(17,24,39,0.14)] dark:border-white/10 dark:bg-app-shell-rail/72 z-30 transition-[opacity,transform] duration-200 ease-out ${
          expanded
            ? "opacity-100 translate-x-0 pointer-events-auto"
            : "opacity-0 -translate-x-2 pointer-events-none"
        }`}
      >
        {/* Logo + Birdeye label */}
        <div className="h-[48px] pl-[17px] flex items-center gap-2 shrink-0">
          <BirdeyeLogoMark />
          <span className="text-[15px] font-medium text-foreground whitespace-nowrap">
            Birdeye
          </span>
        </div>

        {/* Labeled nav rows */}
        <div className="flex flex-col items-stretch pb-[8px] pt-0 gap-[2px] flex-1 overflow-y-auto overflow-x-hidden px-[12px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {activeSections.map(renderPanelSection)}
        </div>

        {/* Footer stack — keep the same order as collapsed: Settings, Notifications, Profile */}
        <div className="flex w-full flex-col gap-2 pb-3 pt-2 px-[12px] shrink-0">
          <div className="grid w-full grid-cols-[32px_minmax(0,1fr)] items-center gap-2">
            <button
              type="button"
              aria-label="Settings"
              onClick={() => onViewChange("settings")}
              className={`group relative w-[32px] h-[32px] flex items-center justify-center rounded-[10px] shrink-0 transition-all duration-200 ease-out outline-none bg-transparent ${currentView === "settings" ? navActiveBg : `${navHoverBg} hover:scale-110 active:scale-95`} focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1 focus-visible:ring-offset-app-shell-rail`}
            >
              <Settings
                width={L1_STRIP_ICON_SIZE}
                height={L1_STRIP_ICON_SIZE}
                strokeWidth={L1_STRIP_ICON_STROKE_PX}
                absoluteStrokeWidth
                className={`transition-colors ${currentView === "settings" ? "text-primary" : "text-muted-foreground"}`}
              />
            </button>
            <span className={`text-[13px] font-normal leading-none whitespace-nowrap ${currentView === "settings" ? "text-primary" : "text-foreground"}`}>
              Settings
            </span>
          </div>

          <div className="grid w-full grid-cols-[32px_minmax(0,1fr)] items-center gap-2">
            <MonitorNotificationsTrigger />
            <span className="min-w-0 truncate text-[13px] font-normal leading-none text-foreground">
              Notifications
            </span>
          </div>

          <div className="grid w-full grid-cols-[32px_minmax(0,1fr)] items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="iconXs"
              onClick={() => {
                setOverflowNavOpen(false);
                setProfileOpen(!profileOpen);
                if (profileOpen) setShowAppearance(false);
              }}
              className="relative min-h-0 min-w-0 shrink-0 cursor-pointer overflow-hidden rounded-full p-0 shadow-sm ring-2 ring-white/80 transition-all hover:ring-white dark:ring-[#3d4555] dark:hover:ring-[#4d5568]"
            >
              <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
            </Button>
            <span className="min-w-0 truncate text-[13px] font-normal leading-none text-foreground">
              John Doe
            </span>
          </div>
        </div>
      </div>

      <AccountSettingsSheet
        open={accountSheetOpen}
        onOpenChange={setAccountSheetOpen}
        avatarUrl={avatarUrl}
        onAvatarUpload={handleAvatarUpload}
        defaultFirstName="John"
        defaultLastName="Doe"
        defaultEmail="john.doe@acmecorp.com"
      />
    </div>
    </TooltipProvider>
  );
}

/* ═══════════════════════════════════════════
   L2 Nav Panel (Reports sub-nav) – exported separately
   ═══════════════════════════════════════════ */
interface L2NavPanelProps {
  currentView: AppView;
  onViewChange: (view: AppView, agentSlug?: string) => void;
}

/* ─── Reporting nav data ─── */
const dashboardSections = [
  { label: "Created by me", children: ["Palo Alto performance", "2024 Yearly report"] },
  { label: "Shared with me", children: ["2025 Q1 dashboard", "2025 Q2 dashboard", "2025 Q3 dashboard"] },
];

/** Product report catalogs in Reports L2 (no "Agent Reports" parent). */
const reportCatalogSections = [
  { label: "Listings", children: ["All", "Google", "Apple", "Facebook", "Bing", "Yelp"] },
  { label: "Social", children: ["All channels", "Post performance", "Response trends", "Best time to post"] },
  { label: "Campaigns", children: ["Review campaigns", "Referral campaigns", "CX campaigns", "Custom campaigns"] },
  { label: "Inbox", children: ["Over time", "Location", "Users", "Channels"] },
  { label: "Surveys", children: ["Survey NPS", "Responses"] },
  { label: "Ticketing", children: ["Resolution time", "Volume"] },
];

export function L2NavPanel({ currentView: _currentView, onViewChange }: L2NavPanelProps) {
  // Active item tracked internally
  const [activeItem, setActiveItem] = useState("Created by me/Palo Alto performance");

  const activate = (key: string) => {
    setActiveItem(key);
    onViewChange("dashboard");
  };

  const dashboardExpandedInit = Object.fromEntries(
    dashboardSections.map(s => [s.label, s.label === "Created by me"])
  );
  const reportExpandedInit = Object.fromEntries(
    reportCatalogSections.map(s => [s.label, s.label === "Listings"])
  );

  const [dashboardExpanded, setDashboardExpanded] = useState<Record<string, boolean>>(() => dashboardExpandedInit);
  const [reportExpanded, setReportExpanded] = useState<Record<string, boolean>>(() => reportExpandedInit);

  const toggleDashboard = (label: string) =>
    setDashboardExpanded(prev => ({ ...prev, [label]: !prev[label] }));
  const toggleReport = (label: string) =>
    setReportExpanded(prev => ({ ...prev, [label]: !prev[label] }));

  const renderDashboardSection = (section: { label: string; children: string[] }) => {
    const isExp = dashboardExpanded[section.label];
    return (
      <div key={section.label}>
        <button
          type="button"
          onClick={() => toggleDashboard(section.label)}
          className={SECTION_HEADER}
          style={{ fontWeight: 400 }}
        >
          <span>{section.label}</span>
          {isExp
            ? <ChevronUp className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            : <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          }
        </button>
        {isExp && section.children.map(child => {
          const key = `${section.label}/${child}`;
          const isActive = activeItem === key;
          return (
            <button
              type="button"
              key={key}
              onClick={() => activate(key)}
              className={isActive ? CHILD_ACTIVE : CHILD_INACTIVE}
              style={{ fontWeight: isActive ? 400 : 300 }}
            >
              {child}
            </button>
          );
        })}
      </div>
    );
  };

  const renderReportSection = (section: { label: string; children: string[] }) => {
    const isExp = reportExpanded[section.label];
    return (
      <div key={section.label}>
        <button
          type="button"
          onClick={() => toggleReport(section.label)}
          className={SECTION_HEADER}
          style={{ fontWeight: 400 }}
        >
          <span>{section.label}</span>
          {isExp
            ? <ChevronUp className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            : <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          }
        </button>
        {isExp && section.children.map(child => {
          const key = `${section.label}/${child}`;
          const isActive = activeItem === key;
          return (
            <button
              type="button"
              key={key}
              onClick={() => activate(key)}
              className={isActive ? CHILD_ACTIVE : CHILD_INACTIVE}
              style={{ fontWeight: isActive ? 400 : 300 }}
            >
              {child}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className={PANEL} data-no-print>
      <div className="flex-1 overflow-y-auto px-[8px] pt-3 pb-4">
        {/* Create dashboard button */}
        <button
          type="button"
          className={`${FOOTER_ROW_CLS} mb-2`}
          style={{ fontSize: 14 }}
          onClick={() => onViewChange("dashboard")}
        >
          <span className="text-[14px]">Create dashboard</span>
          <div className={L2_HEADER_PLUS_WRAPPER_BLUE}>
            <Plus
              className={L2_HEADER_PLUS_GLYPH_BLUE}
              strokeWidth={L2_HEADER_PLUS_STROKE_PX}
              absoluteStrokeWidth
              aria-hidden
            />
          </div>
        </button>

        {/* Dashboard sections */}
        {dashboardSections.map(renderDashboardSection)}

        {/* Create report button */}
        <button
          type="button"
          className={`${FOOTER_ROW_CLS} mt-2 mb-2`}
          style={{ fontSize: 14 }}
          onClick={() => onViewChange("dashboard")}
        >
          <span className="text-[14px]">Create report</span>
          <div className={L2_HEADER_PLUS_WRAPPER_BLUE}>
            <Plus
              className={L2_HEADER_PLUS_GLYPH_BLUE}
              strokeWidth={L2_HEADER_PLUS_STROKE_PX}
              absoluteStrokeWidth
              aria-hidden
            />
          </div>
        </button>

        {/* Product report catalogs (Listings, Social, …) — no Agent Reports parent */}
        <div className="mt-2 flex flex-col gap-1">
          {reportCatalogSections.map(renderReportSection)}
        </div>

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Reviews L2 Nav Panel – uses L2NavLayout
   ═══════════════════════════════════════════ */

const reviewsConfig = {
  headerAction: { label: "Send a review request" },
  defaultExpandedSections: ["Human actions"],
  sections: [
    {
      label: "Human actions",
      children: [
        "View all reviews",
        "Generate review",
        "Respond to reviews",
        "Approve campaigns",
        "Monitor agent replies",
      ],
    },
    {
      label: "Agents",
      children: [
        "Response agent",
        "Generation agent",
        "Marketing agent",
      ],
    },
    {
      label: "Outcomes",
      children: [
        "Reviews & ratings",
        "Response rate",
        "Contacts reached",
        { label: "All reports", external: true },
      ],
    },
    {
      label: "Resources",
      children: [
        "Templates",
        "QR codes",
        "Widgets",
      ],
    },
  ],
};

export function ReviewsL2NavPanel({
  activeItem,
  onActiveItemChange,
}: {
  activeItem?: string;
  onActiveItemChange?: (key: string) => void;
} = {}) {
  return (
    <L2NavLayout
      {...reviewsConfig}
      activeItem={activeItem}
      onActiveItemChange={onActiveItemChange}
      storageKey="nav:l2:reviews"
      data-no-print
    />
  );
}

/** Default L2 selection when opening Referrals (matches `flatNavItems` key `sent`). */
export const REFERRALS_L2_DEFAULT_ACTIVE_KEY = `${L2_FLAT_NAV_KEY_PREFIX}/sent`;

export type ReferralsL2NavPanelProps = {
  activeItem: string;
  onActiveItemChange: (key: string) => void;
  onSendReferralRequest: () => void;
};

export function ReferralsL2NavPanel({
  activeItem,
  onActiveItemChange,
  onSendReferralRequest,
}: ReferralsL2NavPanelProps) {
  return (
    <L2NavLayout
      headerAction={{ label: "Send a referral request", onClick: onSendReferralRequest }}
      flatNavItems={[
        { label: "Sent", key: "sent" },
        { label: "Shared", key: "shared" },
        { label: "Leads", key: "leads" },
      ]}
      flatNavAccentKeys={["sent", "shared", "leads"]}
      sections={[]}
      defaultActive={REFERRALS_L2_DEFAULT_ACTIVE_KEY}
      activeItem={activeItem}
      onActiveItemChange={onActiveItemChange}
      data-no-print
    />
  );
}

/** Default L2 selection when opening Payments (transaction status scope). */
export const PAYMENTS_L2_DEFAULT_ACTIVE_KEY = `${L2_FLAT_NAV_KEY_PREFIX}/all`;

export type PaymentsL2NavPanelProps = {
  activeItem: string;
  onActiveItemChange: (key: string) => void;
  onRequestPayment: () => void;
};

export function PaymentsL2NavPanel({
  activeItem,
  onActiveItemChange,
  onRequestPayment,
}: PaymentsL2NavPanelProps) {
  return (
    <L2NavLayout
      headerAction={{ label: "Request a payment", onClick: onRequestPayment }}
      flatNavItems={[
        { label: "All", key: "all" },
        { label: "Received", key: "received" },
        { label: "Requested", key: "requested" },
        { label: "Not paid", key: "not_paid" },
        { label: "Refunded", key: "refunded" },
        { label: "Cancelled", key: "cancelled" },
      ]}
      sections={[]}
      defaultActive={PAYMENTS_L2_DEFAULT_ACTIVE_KEY}
      activeItem={activeItem}
      onActiveItemChange={onActiveItemChange}
      data-no-print
    />
  );
}

/* ═══════════════════════════════════════════
   Social L2 Nav Panel – uses L2NavLayout
   ═══════════════════════════════════════════ */
const socialConfig = {
  sections: [
    { label: "Publish", children: ["Calendar", "View drafts", "Approve posts", "Fix failed posts", "Fix rejected posts", "Expired posts"] },
    { label: "Engage", children: ["View all engagements", "Assigned to me", "Approve replies", "Fix rejected replies", "View spam"] },
    { label: "Reports", children: ["All channels", "Post performance", "Response trends", "Best time to post"] },
    { label: "Competitors", children: ["Benchmarking", "Posts"] },
    { label: "Libraries", children: ["Post library", "Media library", "Reply templates"] },
    { label: "Agents", children: ["Publishing agent", "Engagement agent"] },
    { label: "Settings", children: ["Approvals", "Link in bio", "Tags", "AI posts", "AI prompts"] },
  ],
};

export type SocialL2NavPanelProps = {
  activeItem: string;
  onActiveItemChange: (key: string) => void;
  /** Shell-only placeholder (non-interactive rows) for static Social nav previews. */
  mode?: "live" | "placeholder";
};

const SOCIAL_PLACEHOLDER_ROWS = [
  "Calendar",
  "View drafts",
  "Approve posts",
  "Fix failed posts",
  "Fix rejected posts",
  "Expired posts",
] as const;

function SocialL2NavPlaceholder() {
  return (
    <aside className={PANEL} aria-label="Social secondary navigation placeholder" data-no-print>
      <div className="min-h-0 flex-1 overflow-y-auto px-[8px] pb-4 pt-3">
        {SOCIAL_PLACEHOLDER_ROWS.map((label, index) => (
          <div
            key={label}
            className={`${ROW} text-left ${index === 2 ? `text-foreground ${L2_ROW_SELECTED_BG}` : "text-muted-foreground"}`}
            style={{ fontWeight: index === 2 ? 400 : 300 }}
            aria-current={index === 2 ? "page" : undefined}
          >
            {label}
          </div>
        ))}
      </div>
    </aside>
  );
}

export function SocialL2NavPanel({
  activeItem,
  onActiveItemChange,
  mode = "live",
}: SocialL2NavPanelProps) {
  if (mode === "placeholder") return <SocialL2NavPlaceholder />;
  return (
    <L2NavLayout
      {...socialConfig}
      headerAction={{ label: "Create post", onClick: () => onActiveItemChange("Create post") }}
      activeItem={activeItem}
      onActiveItemChange={onActiveItemChange}
      data-no-print
    />
  );
}

/* ═══════════════════════════════════════════
   Search AI L2 Nav Panel – uses L2NavLayout
   ═══════════════════════════════════════════ */
/** L2 config for Chatbot (`searchai`) — used in Storybook / demos when not using shell placeholders. */
const searchAIConfig = {
  sections: [
    { label: "Conversations", children: ["Active threads", "Handoffs"] },
    { label: "Knowledge", children: ["Articles", "Snippets", "FAQs"] },
    { label: "Settings", children: ["Channels", "Hours", "Tone"] },
  ],
};

export type SearchAIL2NavPanelProps = {
  activeItem: string;
  onActiveItemChange: (key: string) => void;
};

export function SearchAIL2NavPanel({ activeItem, onActiveItemChange }: SearchAIL2NavPanelProps) {
  return (
    <L2NavLayout
      {...searchAIConfig}
      activeItem={activeItem}
      onActiveItemChange={onActiveItemChange}
      data-no-print
    />
  );
}

/* ═══════════════════════════════════════════
   Contacts L2 Nav Panel – uses L2NavLayout
   ═══════════════════════════════════════════ */
const contactsNavSections = [
  { label: "Settings", children: ["Custom fields", "Tags"] },
];

function ContactsL2UsageFooter() {
  return (
    <Card className="gap-2 rounded-lg border border-border bg-card py-0 shadow-none">
      <CardContent className="flex flex-col gap-2 px-4 py-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-muted-foreground text-xs leading-snug">7/50 Reachable contacts added</p>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground shrink-0 rounded-sm p-1"
            title="Illustrative usage for the prototype"
            aria-label="Usage information"
          >
            <Info className="size-4" aria-hidden />
          </button>
        </div>
        <Progress value={14} />
        <button type="button" className="text-primary text-left text-xs font-medium hover:underline">
          View usage
        </button>
      </CardContent>
    </Card>
  );
}

export type ContactsL2NavPanelProps = {
  activeItem: string;
  onActiveItemChange: (key: string) => void;
  onAddContact: () => void;
};

export function ContactsL2NavPanel({ activeItem, onActiveItemChange, onAddContact }: ContactsL2NavPanelProps) {
  return (
    <L2NavLayout
      headerAction={{ label: "Add a contact", onClick: onAddContact }}
      standaloneItems={["All contacts", "Lists & segments"]}
      sections={contactsNavSections}
      activeItem={activeItem}
      onActiveItemChange={onActiveItemChange}
      defaultActive="standalone/All contacts"
      defaultExpandedSections={[]}
      footerSlot={<ContactsL2UsageFooter />}
      data-no-print
    />
  );
}

/* ═══════════════════════════════════════════
   Listings L2 Nav Panel – new export
   ═══════════════════════════════════════════ */
const listingsConfig = {
  sections: [
    { label: "Actions", children: ["Recommendations", "Suppress duplicates", "Google suggestions"] },
    { label: "Ranking reports", children: ["Keywords", "Citations", "Rankings"] },
    { label: "Search performance", children: ["All sites", "Google", "Apple", "Facebook", "Bing", "Yelp"] },
    { label: "Accuracy", children: ["Core sites", "Other sites"] },
    { label: "Publish status", children: ["All listings", "By location", "By site"] },
    { label: "Agents", children: ["Listing optimization agent"] },
    { label: "Settings", children: ["Profiles", "Citations", "Keywords", "Grid radius", "Products", "Google services", "Google Q&A"] },
  ],
};

export type ListingsL2NavPanelProps = {
  activeItem?: string;
  onActiveItemChange?: (key: string) => void;
};

export function ListingsL2NavPanel({ activeItem, onActiveItemChange }: ListingsL2NavPanelProps) {
  return (
    <L2NavLayout
      {...listingsConfig}
      storageKey="nav:l2:listings"
      activeItem={activeItem}
      onActiveItemChange={onActiveItemChange}
      data-no-print
    />
  );
}

/* ═══════════════════════════════════════════
   Ticketing L2 Nav Panel – new export
   ═══════════════════════════════════════════ */
const ticketingConfig = {
  headerAction: { label: "New ticket" },
  sections: [
    { label: "Actions", children: ["My tickets", "View all tickets"] },
    { label: "Reports", children: ["Resolution time", "Volume"] },
    { label: "Agents", children: ["Ticket resolution agent"] },
  ],
};

export function TicketingL2NavPanel() {
  return <L2NavLayout {...ticketingConfig} storageKey="nav:l2:ticketing" data-no-print />;
}

/* ═══════════════════════════════════════════
   Campaigns L2 Nav Panel – new export
   ═══════════════════════════════════════════ */
const campaignsConfig = {
  headerAction: { label: "Create campaign" },
  sections: [
    { label: "Actions", children: ["Manage automations", "Manage campaigns"] },
    { label: "Libraries", children: ["Templates", "Landing pages"] },
    { label: "Reports", children: ["Review campaigns", "Referral campaigns", "CX campaigns", "Custom campaigns"] },
    { label: "Settings", children: ["Workflow tags", "Communication restriction"] },
  ],
};

export function CampaignsL2NavPanel() {
  return <L2NavLayout {...campaignsConfig} storageKey="nav:l2:campaigns" data-no-print />;
}

/* ═══════════════════════════════════════════
   Surveys L2 Nav Panel – new export
   ═══════════════════════════════════════════ */
const surveysConfig = {
  headerAction: { label: "Create survey" },
  sections: [
    { label: "Actions", children: ["Respond to surveys"] },
    { label: "Surveys", children: ["All surveys", "Standard surveys", "Pulse surveys"] },
    { label: "Agents", children: ["Survey distribution agent", "Survey tagging agent"] },
    { label: "Libraries", children: ["Request templates"] },
  ],
  footerLink: { label: "Reports", external: true },
};

export function SurveysL2NavPanel() {
  return <L2NavLayout {...surveysConfig} storageKey="nav:l2:surveys" data-no-print />;
}

/* ═══════════════════════════════════════════
   AEO/SEO experience — L2 placeholders
   ═══════════════════════════════════════════ */
const aeoProductListing1L2Config = {
  sections: [
    { label: "Actions", children: ["Overview", "Sync status"] },
    { label: "Workspace", children: ["Placeholder A", "Placeholder B"] },
  ],
};

const aeoSearchAiL2Config = {
  sections: [
    { label: "Actions", children: ["New query", "Saved views"] },
    { label: "Workspace", children: ["Results preview", "Settings"] },
  ],
};

export function AeoProductListing1L2NavPanel() {
  return <L2NavLayout {...aeoProductListing1L2Config} storageKey="nav:l2:aeo-product-listing-1" data-no-print />;
}

export function AeoSearchAiL2NavPanel() {
  return <L2NavLayout {...aeoSearchAiL2Config} storageKey="nav:l2:aeo-search-ai" data-no-print />;
}

/* ═══════════════════════════════════════════
   Insights L2 Nav Panel – new export
   ═══════════════════════════════════════════ */
const insightsConfig = {
  sections: [
    { label: "Actions", children: ["Recommendations", "Track progress"] },
    { label: "Analysis", children: ["All signals", "Reviews", "Listings", "Calls"] },
    { label: "Settings", children: ["Categories & keywords", "Birdeye score"] },
  ],
};

export function InsightsL2NavPanel() {
  return <L2NavLayout {...insightsConfig} storageKey="nav:l2:insights" data-no-print />;
}

/* ═══════════════════════════════════════════
   Competitors L2 Nav Panel – new export
   ═══════════════════════════════════════════ */
const competitorsConfig = {
  sections: [
    { label: "Actions", children: ["Recommendations", "Track progress"] },
    { label: "Analysis", children: ["All signals", "Reviews", "Social"] },
    {
      label: "Benchmarking",
      children: [
        "You vs Industry",
        "You vs Peach Tree Dental",
        "You vs Coast Dental",
        "You vs Altima Dental",
        "You vs Tooth Works",
        "You vs White Teeth",
      ],
    },
    { label: "Settings", children: ["Brands & locations", "Categories & keywords", "Birdeye score"] },
  ],
};

export function CompetitorsL2NavPanel() {
  return <L2NavLayout {...competitorsConfig} storageKey="nav:l2:competitors" data-no-print />;
}

/* ═══════════════════════════════════════════
   Appointments L2 Nav Panel – uses L2NavLayout
   ═══════════════════════════════════════════ */
const appointmentsConfig = {
  headerAction: { label: "Book an appointment" },
  defaultExpandedSections: ["Human actions"],
  sections: [
    {
      label: "Human actions",
      children: [
        "View all appointments",
        "View schedule",
        "Manage waitlist",
      ],
    },
    {
      label: "Agents",
      children: [
        "Appointment agent",
        "Reminder agent",
        "Waitlist agent",
        "Insurance verification agent",
      ],
    },
    {
      label: "Outcomes",
      children: [
        "Bookings",
        "No-shows",
        { label: "All reports", external: true },
      ],
    },
    {
      label: "Resources",
      children: [
        "Intake forms",
        "Phone numbers",
        "Widgets",
      ],
    },
  ],
};

export type AppointmentsL2NavPanelProps = {
  activeItem: string;
  onActiveItemChange: (key: string) => void;
};

export function AppointmentsL2NavPanel({ activeItem, onActiveItemChange }: AppointmentsL2NavPanelProps) {
  return (
    <L2NavLayout
      {...appointmentsConfig}
      defaultActive={APPOINTMENTS_L2_CALENDAR_KEY}
      activeItem={activeItem}
      onActiveItemChange={onActiveItemChange}
      data-no-print
    />
  );
}

export { APPOINTMENTS_L2_CALENDAR_KEY } from "@/app/components/appointmentsL2Nav";

/* ═══════════════════════════════════════════
   Inbox L2 Nav Panel – uses L2NavLayout
   ═══════════════════════════════════════════ */
const inboxConfig = {
  headerAction: { label: "New message" },
  defaultExpandedSections: ["Human actions"],
  sections: [
    {
      label: "Human actions",
      children: ["All", "Assigned to me", "Leads", "Messages", "Reviews", "Spam", "Surveys"],
    },
    {
      label: "Agents",
      children: ["Lead generation agents", "Tagging & routing agent"],
    },
    {
      label: "Outcomes",
      children: [
        "Inbox metrics",
        { label: "All reports", external: true },
      ],
    },
    {
      label: "Resources",
      children: ["Knowledge base"],
    },
    {
      label: "Status",
      children: [
        "Follow up",
        "Lost",
        "Missed call",
        "New lead",
        "New voicemails",
        "Scheduling request",
        "Service",
        "Unqualified",
        "Won",
      ],
    },
    {
      label: "Saved filter",
      children: ["Missed calls today", "New patient inquiries"],
    },
    { label: "Settings", children: ["Chatbot", "Receptionist"] },
  ],
};

export function InboxL2NavPanel() {
  return <L2NavLayout {...inboxConfig} storageKey="nav:l2:inbox" data-no-print />;
}

/* ═══════════════════════════════════════════
   Agents L2 Nav Panel – re-exported from versioned file
   ═══════════════════════════════════════════ */
export { AgentsL2NavPanel } from "./AgentsL2NavPanel";

export { MynaConversationsL2NavPanel } from "./MynaConversationsL2NavPanel";

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
