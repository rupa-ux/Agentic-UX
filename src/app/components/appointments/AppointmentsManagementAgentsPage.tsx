import { useMemo, useState, type ReactNode } from "react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronLeft,
  ExternalLink,
  Filter,
  Info,
  LayoutGrid,
  List,
  MoreVertical,
  Search,
} from "lucide-react";
import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";
import { AppDataTable } from "@/app/components/ui/AppDataTable";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { SegmentedToggle } from "@/app/components/ui/segmented-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/ui/tooltip";
import { cn } from "@/app/components/ui/utils";
import { AppointmentRecommendationTab } from "@/app/components/appointments/AppointmentRecommendationTab";

type AppointmentAgentStatus = "running" | "paused" | "draft" | "failed";

type AgentDomain = "healthcare" | "general";

type AppointmentAgentRow = {
  id: string;
  name: string;
  status: AppointmentAgentStatus;
  domain: AgentDomain;
  appointmentsManaged: number | null;
  managementSuccessRate: number | null;
  avgManagementTimeSeconds: number | null;
  timeSavedMinutes: number | null;
  locations: number | null;
};

const APPOINTMENT_AGENT_ROWS: AppointmentAgentRow[] = [
  {
    id: "north-autonomous",
    name: "Appointment management agent - North region",
    status: "running",
    domain: "healthcare",
    appointmentsManaged: 88,
    managementSuccessRate: 100,
    avgManagementTimeSeconds: 35,
    timeSavedMinutes: 3 * 24 * 60 + 17 * 60 + 52,
    locations: 147,
  },
  {
    id: "east-autonomous",
    name: "Appointment management agent - East region",
    status: "running",
    domain: "healthcare",
    appointmentsManaged: 79,
    managementSuccessRate: 97,
    avgManagementTimeSeconds: 42,
    timeSavedMinutes: 3 * 24 * 60 + 4 * 60 + 42,
    locations: 145,
  },
  {
    id: "south-autonomous",
    name: "Appointment management agent - South region",
    status: "running",
    domain: "healthcare",
    appointmentsManaged: 76,
    managementSuccessRate: 100,
    avgManagementTimeSeconds: 38,
    timeSavedMinutes: 3 * 24 * 60 + 2 * 60 + 18,
    locations: 142,
  },
  {
    id: "west-autonomous",
    name: "Appointment management agent - West region",
    status: "running",
    domain: "healthcare",
    appointmentsManaged: 72,
    managementSuccessRate: 98,
    avgManagementTimeSeconds: 41,
    timeSavedMinutes: 2 * 24 * 60 + 22 * 60 + 5,
    locations: 138,
  },
  {
    id: "central-paused",
    name: "Appointment management agent - Central region",
    status: "paused",
    domain: "healthcare",
    appointmentsManaged: 65,
    managementSuccessRate: 95,
    avgManagementTimeSeconds: 48,
    timeSavedMinutes: 2 * 24 * 60 + 8 * 60 + 30,
    locations: 131,
  },
  {
    id: "midwest-rules",
    name: "Appointment management agent - Midwest region",
    status: "draft",
    domain: "healthcare",
    appointmentsManaged: 54,
    managementSuccessRate: 96,
    avgManagementTimeSeconds: 44,
    timeSavedMinutes: 1 * 24 * 60 + 18 * 60 + 12,
    locations: 120,
  },
];

const columnHelper = createColumnHelper<AppointmentAgentRow>();

function formatSeconds(seconds: number | null): string {
  if (seconds == null) return "-";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  return `${minutes}m`;
}

function formatTimeSaved(minutes: number | null): string {
  if (minutes == null) return "-";
  const days = Math.floor(minutes / (60 * 24));
  const hours = Math.floor((minutes % (60 * 24)) / 60);
  const rem = minutes % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (rem > 0 || parts.length === 0) parts.push(`${rem}m`);
  return parts.join(" ");
}

function statusBadgeClasses(status: AppointmentAgentStatus): string {
  if (status === "running") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "paused") return "bg-amber-50 text-amber-700 border-amber-200";
  if (status === "failed") return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-muted text-muted-foreground border-border";
}

function statusLabel(status: AppointmentAgentStatus): string {
  if (status === "running") return "Running";
  if (status === "paused") return "Paused";
  if (status === "failed") return "Failed";
  return "Draft";
}

function MetricCard({
  title,
  value,
  delta,
  tooltip,
  trailing,
}: {
  title: string;
  value: string;
  delta: string;
  tooltip: string;
  trailing?: ReactNode;
}) {
  return (
    <div className="relative flex flex-col rounded-lg border border-border bg-card p-4">
      {trailing ? <div className="absolute right-3 top-3">{trailing}</div> : null}
      <div className="flex items-baseline gap-1">
        <p className="font-medium tabular-nums tracking-[-0.48px] text-[24px] leading-[36px] text-foreground">
          {value}
        </p>
        <p className="font-medium text-[12px] leading-[18px] text-emerald-600">{delta}</p>
      </div>
      <div className="mt-2 flex items-center gap-1">
        <p className="text-[13px] leading-[18px] text-muted-foreground">{title}</p>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="flex items-center text-muted-foreground transition-colors hover:text-foreground"
            >
              <Info className="h-4 w-4 shrink-0" strokeWidth={1.6} absoluteStrokeWidth />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[200px] text-left text-balance">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

function AppointmentAgentRowActions({ status }: { status: AppointmentAgentStatus }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Row actions"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-primary"
        >
          <MoreVertical className="h-4 w-4" strokeWidth={1.6} absoluteStrokeWidth />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem className="text-[13px]">Edit</DropdownMenuItem>
        {status === "running" ? <DropdownMenuItem className="text-[13px]">Pause</DropdownMenuItem> : null}
        <DropdownMenuItem className="text-[13px]">Duplicate</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-[13px]">Outcomes</DropdownMenuItem>
        <DropdownMenuItem className="text-[13px]">Interactions</DropdownMenuItem>
        <DropdownMenuItem className="text-[13px]">Logs</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-[13px]">
          View reports
          <ExternalLink className="ml-auto h-3.5 w-3.5 opacity-70" strokeWidth={1.6} absoluteStrokeWidth />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-[13px] text-destructive focus:text-destructive">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Detail view types ───────────────────────────────────────────────────────

type AgentDetailTab = "outcomes" | "configuration" | "playbook" | "rules" | "coach" | "logs" | "reports";

type LocationOutcomeRow = {
  id: string;
  location: string;
  appointmentsScheduled: number;
  scheduleRate: number;
  avgBookingTimeMinutes: number;
  timeSavedMinutes: number;
  costSavedUsd: number;
};

const locationColHelper = createColumnHelper<LocationOutcomeRow>();

const NORTH_LOCATION_OUTCOMES: LocationOutcomeRow[] = [
  { id: "atlanta", location: "Atlanta, GA", appointmentsScheduled: 19, scheduleRate: 94, avgBookingTimeMinutes: 3, timeSavedMinutes: 260, costSavedUsd: 520 },
  { id: "chicago", location: "Chicago, IL", appointmentsScheduled: 14, scheduleRate: 91, avgBookingTimeMinutes: 4, timeSavedMinutes: 185, costSavedUsd: 310 },
  { id: "detroit", location: "Detroit, MI", appointmentsScheduled: 11, scheduleRate: 88, avgBookingTimeMinutes: 5, timeSavedMinutes: 150, costSavedUsd: 210 },
  { id: "boston", location: "Boston, MA", appointmentsScheduled: 16, scheduleRate: 96, avgBookingTimeMinutes: 3, timeSavedMinutes: 220, costSavedUsd: 410 },
  { id: "nyc", location: "New York City, NY", appointmentsScheduled: 22, scheduleRate: 93, avgBookingTimeMinutes: 4, timeSavedMinutes: 290, costSavedUsd: 580 },
  { id: "philadelphia", location: "Philadelphia, PA", appointmentsScheduled: 9, scheduleRate: 89, avgBookingTimeMinutes: 5, timeSavedMinutes: 130, costSavedUsd: 180 },
  { id: "pittsburgh", location: "Pittsburgh, PA", appointmentsScheduled: 7, scheduleRate: 92, avgBookingTimeMinutes: 4, timeSavedMinutes: 100, costSavedUsd: 140 },
];

function formatBookingTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatTimeSavedDetail(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ─── Healthcare-only tab content ─────────────────────────────────────────────

interface PlaybookStep {
  id: string;
  order: number;
  title: string;
  description: string;
  owner: string;
}

const PLAYBOOK_STEPS: PlaybookStep[] = [
  {
    id: "intake",
    order: 1,
    title: "Patient intake verification",
    description: "Confirm patient identity, insurance eligibility, and primary care provider before offering any appointment slot.",
    owner: "Agent",
  },
  {
    id: "slot-selection",
    order: 2,
    title: "Slot selection and hold",
    description: "Identify the earliest available slot matching patient preference and appointment type, then place a 5-minute hold while the patient confirms.",
    owner: "Agent",
  },
  {
    id: "provider-match",
    order: 3,
    title: "Provider matching",
    description: "Match the appointment to a licensed provider accepting new patients in the patient's insurance network and geographic region.",
    owner: "Agent",
  },
  {
    id: "consent-capture",
    order: 4,
    title: "Consent and pre-visit instructions",
    description: "Send HIPAA-compliant consent form and pre-visit preparation instructions via patient's preferred communication channel.",
    owner: "Agent",
  },
  {
    id: "human-review",
    order: 5,
    title: "Human review for complex cases",
    description: "Route to a care coordinator for manual review when the appointment type is flagged as high-acuity, specialist-only, or requires prior authorization.",
    owner: "Care coordinator",
  },
  {
    id: "confirmation",
    order: 6,
    title: "Booking confirmation and reminders",
    description: "Send booking confirmation immediately and automated reminders at 48h and 2h before the appointment time.",
    owner: "Agent",
  },
];

interface RuleRow {
  id: string;
  name: string;
  condition: string;
  action: string;
  priority: "high" | "medium" | "low";
  enabled: boolean;
}

const RULES: RuleRow[] = [
  {
    id: "r1",
    name: "Same-day booking block",
    condition: "Appointment requested < 2 hours before slot",
    action: "Reject and offer next available slot with ≥ 4 hours notice",
    priority: "high",
    enabled: true,
  },
  {
    id: "r2",
    name: "Insurance pre-check",
    condition: "Patient insurance status is unverified",
    action: "Pause booking and request insurance details before confirming slot",
    priority: "high",
    enabled: true,
  },
  {
    id: "r3",
    name: "High-acuity escalation",
    condition: "Appointment type is marked high-acuity or urgent",
    action: "Escalate to care coordinator; do not auto-confirm",
    priority: "high",
    enabled: true,
  },
  {
    id: "r4",
    name: "No-show threshold",
    condition: "Patient has ≥ 3 no-shows in the last 90 days",
    action: "Flag account and require phone confirmation before booking",
    priority: "medium",
    enabled: true,
  },
  {
    id: "r5",
    name: "Provider capacity cap",
    condition: "Provider has reached 90% of daily appointment capacity",
    action: "Offer alternative provider or next available day",
    priority: "medium",
    enabled: true,
  },
  {
    id: "r6",
    name: "After-hours request",
    condition: "Booking request received outside 7 am – 8 pm local time",
    action: "Queue request and process at next business hour open",
    priority: "low",
    enabled: false,
  },
];

const PRIORITY_CLASSES: Record<RuleRow["priority"], string> = {
  high: "bg-rose-50 text-rose-700 border-rose-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-muted text-muted-foreground border-border",
};

function PlaybookTab() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 pb-6">
      <p className="text-[13px] text-muted-foreground">
        Standard operating procedure this agent follows when managing appointment requests for healthcare locations.
      </p>
      <ol className="flex flex-col gap-3">
        {PLAYBOOK_STEPS.map((step) => (
          <li key={step.id} className="flex gap-4 rounded-lg border border-border bg-card p-4">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[12px] font-semibold tabular-nums text-primary">
              {step.order}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[14px] font-medium leading-snug text-foreground">{step.title}</span>
                <span className="shrink-0 rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground">
                  {step.owner}
                </span>
              </div>
              <p className="text-[13px] leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function RulesTab() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 pb-6">
      <p className="text-[13px] text-muted-foreground">
        Business rules applied by this agent before confirming or modifying any appointment.
      </p>
      <div className="flex flex-col gap-2">
        {RULES.map((rule) => (
          <div
            key={rule.id}
            className={cn(
              "flex flex-col gap-2 rounded-lg border border-border bg-card p-4 transition-opacity",
              !rule.enabled && "opacity-50",
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize",
                    PRIORITY_CLASSES[rule.priority],
                  )}
                >
                  {rule.priority}
                </span>
                <span className="min-w-0 truncate text-[14px] font-medium text-foreground">{rule.name}</span>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full border px-2.5 py-0.5 text-[11px]",
                  rule.enabled
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-border bg-muted text-muted-foreground",
                )}
              >
                {rule.enabled ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[13px]">
              <span className="text-muted-foreground">If</span>
              <span className="text-foreground">{rule.condition}</span>
              <span className="text-muted-foreground">Then</span>
              <span className="text-foreground">{rule.action}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Detail view component ────────────────────────────────────────────────────

function AppointmentAgentDetailView({
  agent,
  onBack,
}: {
  agent: AppointmentAgentRow;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState<AgentDetailTab>("outcomes");
  const [columnSheetOpen, setColumnSheetOpen] = useState(false);

  const locationColumns = useMemo<ColumnDef<LocationOutcomeRow, unknown>[]>(() => [
    locationColHelper.accessor("location", {
      id: "location",
      header: "Location",
      size: 260,
      meta: { settingsLabel: "Location" },
      cell: (info) => <span className="text-foreground">{info.getValue()}</span>,
    }),
    locationColHelper.accessor("appointmentsScheduled", {
      id: "appointmentsScheduled",
      header: "Appointments scheduled",
      size: 210,
      meta: { settingsLabel: "Appointments scheduled" },
      sortingFn: "alphanumeric",
      cell: (info) => <span className="tabular-nums text-foreground">{info.getValue()}</span>,
    }),
    locationColHelper.accessor("scheduleRate", {
      id: "scheduleRate",
      header: "Schedule rate",
      size: 160,
      meta: { settingsLabel: "Schedule rate" },
      cell: (info) => <span className="tabular-nums text-foreground">{info.getValue()}%</span>,
    }),
    locationColHelper.accessor("avgBookingTimeMinutes", {
      id: "avgBookingTime",
      header: "Avg. booking time",
      size: 180,
      meta: { settingsLabel: "Avg. booking time" },
      cell: (info) => <span className="tabular-nums text-foreground">{formatBookingTime(info.getValue())}</span>,
    }),
    locationColHelper.accessor("timeSavedMinutes", {
      id: "timeSaved",
      header: "Time saved",
      size: 160,
      meta: { settingsLabel: "Time saved" },
      cell: (info) => <span className="tabular-nums text-foreground">{formatTimeSavedDetail(info.getValue())}</span>,
    }),
    locationColHelper.accessor("costSavedUsd", {
      id: "costSaved",
      header: "Cost saved",
      size: 140,
      meta: { settingsLabel: "Cost saved" },
      cell: (info) => <span className="tabular-nums text-foreground">${info.getValue().toLocaleString()}</span>,
    }),
  ], []);

  const isHealthcare = agent.domain === "healthcare";

  const DETAIL_TABS = [
    { key: "outcomes" as const, label: "Outcomes" },
    { key: "configuration" as const, label: "Configuration" },
    ...(isHealthcare ? [
      { key: "playbook" as const, label: "Playbook" },
      { key: "rules" as const, label: "Rules" },
    ] : []),
    { key: "coach" as const, label: "Recommendation" },
    { key: "logs" as const, label: "Logs" },
    { key: "reports" as const, label: "Reports", external: true },
  ] satisfies readonly { key: AgentDetailTab; label: string; external?: boolean }[];

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      {/* ── Header ── */}
      <MainCanvasViewHeader
        title={(
          <span className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to appointment management agents"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.6} absoluteStrokeWidth />
            </button>
            <span className="min-w-0 truncate">{agent.name}</span>
            <Badge variant="outline" className={cn("capitalize shrink-0", statusBadgeClasses(agent.status))}>
              {statusLabel(agent.status)}
            </Badge>
          </span>
        )}
        actions={(
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="h-9 gap-1 rounded-lg text-sm">
                Actions
                <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.6} absoluteStrokeWidth />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="text-[13px]">Edit</DropdownMenuItem>
              {agent.status === "running" ? (
                <DropdownMenuItem className="text-[13px]">Pause</DropdownMenuItem>
              ) : null}
              <DropdownMenuItem className="text-[13px]">Duplicate</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-[13px] text-destructive focus:text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      {/* ── Tab bar ── */}
      <div className="shrink-0 px-6 pb-6">
        <div className="inline-flex items-center border-b border-border">
          {DETAIL_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "relative flex items-center gap-1 px-4 py-2 text-sm",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
                {tab.external ? (
                  <ExternalLink className="h-3 w-3 opacity-70" strokeWidth={1.6} absoluteStrokeWidth />
                ) : null}
                {isActive ? (
                  <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary" aria-hidden />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Outcomes tab ── */}
      {activeTab === "outcomes" ? (
        <>
          <div className="shrink-0 px-6 pb-4 pt-1">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
              <MetricCard
                title="Appointments scheduled"
                value="98"
                delta="+3.4%"
                tooltip="Total appointments booked autonomously by this agent in the selected period."
              />
              <MetricCard
                title="Schedule rate"
                value="92%"
                delta="+1.8%"
                tooltip="Share of incoming appointment requests this agent successfully scheduled."
              />
              <MetricCard
                title="Avg. booking time"
                value="4m"
                delta="-0.5%"
                tooltip="Mean time from request to confirmed booking for this agent."
              />
              <MetricCard
                title="Time saved"
                value="4h 35m"
                delta="+2.1%"
                tooltip="Estimated staff time saved by this agent handling bookings autonomously."
              />
              <MetricCard
                title="Cost saved"
                value="$2.3K"
                delta="+2.8%"
                tooltip="Estimated spend avoided by automating appointment scheduling in this region."
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 px-6 pb-6">
            <AppDataTable<LocationOutcomeRow>
              tableId="appointments.management-agent-detail.north.v1"
              data={NORTH_LOCATION_OUTCOMES}
              columns={locationColumns}
              initialSorting={[{ id: "location", desc: false }]}
              getRowId={(row) => row.id}
              className="h-full min-h-0 px-0"
              columnSheetTitle="Location outcome columns"
              hideColumnsButton
              columnSheetOpen={columnSheetOpen}
              onColumnSheetOpenChange={setColumnSheetOpen}
              stickyFirstColumn={false}
              rowDensity="default"
            />
          </div>
        </>
      ) : activeTab === "configuration" ? (
        <div className="flex min-h-0 flex-1 items-center justify-center px-6 pb-6 text-sm text-muted-foreground">
          Agent configuration for appointment management agents is not available in this prototype.
        </div>
      ) : activeTab === "playbook" ? (
        <PlaybookTab />
      ) : activeTab === "rules" ? (
        <RulesTab />
      ) : activeTab === "coach" ? (
        <AppointmentRecommendationTab />
      ) : activeTab === "logs" ? (
        <div className="flex min-h-0 flex-1 items-center justify-center px-6 pb-6 text-sm text-muted-foreground">
          Interaction logs are not available in this prototype.
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center px-6 pb-6 text-sm text-muted-foreground">
          Reports are opening in a new tab…
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function AppointmentsManagementAgentsPage() {
  const [activeTab, setActiveTab] = useState<"agents" | "library">("agents");
  const [libraryViewMode, setLibraryViewMode] = useState<"grid" | "list">("grid");
  const [columnSheetOpen, setColumnSheetOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AppointmentAgentRow | null>(null);

  const columns = useMemo<ColumnDef<AppointmentAgentRow, unknown>[]>(
    () => [
      columnHelper.accessor("name", {
        id: "agentName",
        header: "Agent name",
        size: 360,
        meta: { settingsLabel: "Agent name" },
        cell: (info) => (
          <button
            type="button"
            onClick={() => setSelectedAgent(info.row.original)}
            className="text-left text-foreground transition-colors hover:text-primary hover:underline group-hover/table-row:text-primary group-hover/table-row:underline"
          >
            {info.getValue()}
          </button>
        ),
      }),
      columnHelper.accessor("status", {
        id: "status",
        header: "Status",
        size: 140,
        meta: { settingsLabel: "Status" },
        cell: (info) => (
          <Badge variant="outline" className={cn("capitalize", statusBadgeClasses(info.getValue()))}>
            {statusLabel(info.getValue())}
          </Badge>
        ),
      }),
      columnHelper.accessor("appointmentsManaged", {
        id: "appointmentsManaged",
        header: "Appointments managed",
        size: 180,
        meta: { settingsLabel: "Appointments managed" },
        sortingFn: "alphanumeric",
        cell: (info) => (
          <span className="tabular-nums text-foreground">
            {info.getValue() == null ? "-" : info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("managementSuccessRate", {
        id: "managementSuccessRate",
        header: "Management success rate",
        size: 200,
        meta: { settingsLabel: "Management success rate" },
        cell: (info) => (
          <span className="tabular-nums text-foreground">
            {info.getValue() == null ? "-" : `${info.getValue()}%`}
          </span>
        ),
      }),
      columnHelper.accessor("avgManagementTimeSeconds", {
        id: "avgManagementTime",
        header: "Avg. management time",
        size: 180,
        meta: { settingsLabel: "Avg. management time" },
        cell: (info) => (
          <span className="tabular-nums text-foreground">{formatSeconds(info.getValue())}</span>
        ),
      }),
      columnHelper.accessor("timeSavedMinutes", {
        id: "timeSaved",
        header: "Time saved",
        size: 160,
        meta: { settingsLabel: "Time saved" },
        cell: (info) => (
          <span className="tabular-nums text-foreground">{formatTimeSaved(info.getValue())}</span>
        ),
      }),
      columnHelper.accessor("locations", {
        id: "locations",
        header: "Locations",
        size: 140,
        enableResizing: false,
        meta: { settingsLabel: "Locations" },
        cell: (info) => {
          const count = info.getValue();
          if (count == null) return <span className="text-foreground">-</span>;
          return (
            <button
              type="button"
              className="inline-flex items-center gap-1 tabular-nums text-foreground hover:text-primary"
            >
              {count}
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.6} absoluteStrokeWidth />
            </button>
          );
        },
      }),
      columnHelper.display({
        id: "rowActions",
        header: "",
        enableSorting: false,
        enableResizing: false,
        size: 80,
        meta: { settingsLabel: "Actions" },
        cell: (info) => (
          <div className="flex w-full justify-end pr-6">
            <AppointmentAgentRowActions status={info.row.original.status} />
          </div>
        ),
      }),
    ],
    [],
  );

  const headerActions =
    activeTab === "library" ? (
      <div className="flex items-center gap-4">
        <Button type="button" variant="outline" size="icon" aria-label="Search agent library">
          <Search className="h-[14px] w-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
        </Button>
        <SegmentedToggle<"grid" | "list">
          iconOnly
          ariaLabel="Library view"
          value={libraryViewMode}
          onChange={setLibraryViewMode}
          className="border border-border"
          items={[
            {
              value: "grid",
              label: "Grid view",
              icon: <LayoutGrid className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />,
            },
            {
              value: "list",
              label: "List view",
              icon: <List className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />,
            },
          ]}
        />
      </div>
    ) : (
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="icon" aria-label="Search agents">
          <Search className="h-[14px] w-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
        </Button>
        <Button type="button" className="h-9 rounded-lg text-sm">
          Create agent
        </Button>
        <Button type="button" variant="outline" size="icon" aria-label="Filter agents">
          <Filter className="h-[14px] w-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
        </Button>
      </div>
    );

  if (selectedAgent) {
    return (
      <AppointmentAgentDetailView
        agent={selectedAgent}
        onBack={() => setSelectedAgent(null)}
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <MainCanvasViewHeader title="Appointment management agents" actions={headerActions} />

      <div className="shrink-0 px-6 pb-6">
        <div className="inline-flex items-center border-b border-border">
          {[
            { key: "agents", label: "Agents" },
            { key: "library", label: "Library" },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as "agents" | "library")}
                className={cn(
                  "relative px-4 py-2 text-sm",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
                {isActive ? (
                  <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary" aria-hidden />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "agents" ? (
        <>
          <div className="shrink-0 px-6 pb-4 pt-0">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="Appointments managed"
                value="434"
                delta="+3.2%"
                tooltip="Total appointments handled by management agents in the selected period."
              />
              <MetricCard
                title="Management success rate"
                value="85%"
                delta="+1.8%"
                tooltip="Share of appointment management tasks completed successfully."
              />
              <MetricCard
                title="Avg. management time"
                value="2m"
                delta="-0.6%"
                tooltip="Mean time agents spend managing each appointment."
              />
              <MetricCard
                title="Time saved"
                value="9h 35m"
                delta="+1.3%"
                tooltip="Estimated manual effort saved through automated appointment management."
                trailing={(
                  <Button type="button" variant="outline" size="icon" className="h-8 w-8" aria-label="Filter metrics">
                    <Filter className="h-[14px] w-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
                  </Button>
                )}
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 px-6 pb-6 pt-6">
            <AppDataTable<AppointmentAgentRow>
              tableId="appointments.management-agents.v1"
              data={APPOINTMENT_AGENT_ROWS}
              columns={columns}
              initialSorting={[{ id: "appointmentsManaged", desc: true }]}
              getRowId={(row) => row.id}
              className="h-full min-h-0 px-0"
              columnSheetTitle="Appointment agent columns"
              hideColumnsButton
              columnSheetOpen={columnSheetOpen}
              onColumnSheetOpenChange={setColumnSheetOpen}
              stickyFirstColumn={false}
              rowDensity="default"
            />
          </div>
        </>
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center px-6 pb-6 text-sm text-muted-foreground">
          Agent library templates are not available yet.
        </div>
      )}
    </div>
  );
}
