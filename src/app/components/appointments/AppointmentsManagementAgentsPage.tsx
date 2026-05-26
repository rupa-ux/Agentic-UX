import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import {
  BookOpen,
  Braces,
  ChevronDown,
  Clock,
  ChevronLeft,
  Database,
  ExternalLink,
  FileText,
  Filter,
  Home,
  Package,
  Info,
  LayoutGrid,
  Link2,
  List,
  MessageSquare,
  MoreVertical,
  Play,
  Plus,
  Search,
  Target,
  User,
  Wrench,
  X,
} from "lucide-react";
import {
  APPOINTMENT_AGENT_SANDBOX_PANEL_WIDTH,
  AppointmentAgentSandboxPanel,
} from "@/app/components/appointments/AppointmentAgentSandboxSheet";
import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";
import { SlidingSidePanel } from "@/app/components/layout/SlidingSidePanel";
import { AppDataTable } from "@/app/components/ui/AppDataTable";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { SegmentedToggle } from "@/app/components/ui/segmented-toggle";
import { Textarea } from "@/app/components/ui/textarea";
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
import { AppointmentPoliciesTab } from "@/app/components/appointments/AppointmentPoliciesTab";

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

type AgentDetailTab = "outcomes" | "procedures" | "workflows" | "policies" | "coach" | "logs" | "settings" | "reports";

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

type ProcedureSortKey = "lastUpdated" | "title";

type StepSegment =
  | string
  | { kind: "var"; label: string }
  | { kind: "tool"; label: string };

interface ProcedureStep {
  /** Plain step text. Used when `segments` is not provided. */
  text: string;
  /** Optional rich segments — inline variable and tool chips can be mixed with text. */
  segments?: StepSegment[];
}

interface ProcedureSection {
  heading: string;
  intro?: string;
  steps: ProcedureStep[];
}

type ProcedureContextKind = "json" | "file" | "link" | "brand" | "style" | "industry";

interface ProcedureContextItem {
  kind: ProcedureContextKind;
  label: string;
}

interface ProcedureDocument {
  whenToUse: string;
  goal: string;
  examples: string[];
  sections: ProcedureSection[];
  tools: string[];
  context: ProcedureContextItem[];
}

interface ProcedureItem {
  id: string;
  title: string;
  description: string;
  /** ISO date (YYYY-MM-DD) for sorting */
  lastUpdated: string;
  /** ISO date (YYYY-MM-DD) shown on the card as date added */
  dateAdded: string;
  /** Author shown in metadata */
  createdBy: string;
  lastEditedBy: string;
  version: string;
  disabled?: boolean;
  document: ProcedureDocument;
}

const INITIAL_PROCEDURE_ITEMS: ProcedureItem[] = [
  {
    id: "intake",
    title: "Patient intake verification",
    description:
      "Confirm patient identity, insurance eligibility, and primary care provider before offering any appointment slot.",
    lastUpdated: "2025-05-20",
    dateAdded: "2025-05-20",
    createdBy: "System",
    lastEditedBy: "Care operations",
    version: "v1.4",
    document: {
      whenToUse:
        "Use this procedure when a patient initiates a new appointment request through any channel (phone, web form, chat, or messaging) and identity, insurance, or primary care provider information has not yet been verified for the current visit.",
      goal:
        "Ensure that every appointment is tied to a verified patient record with active insurance coverage and an assigned primary care provider, so downstream scheduling, billing, and clinical workflows operate on accurate information.",
      examples: [
        "I'd like to book a follow-up with Dr. Patel",
        "My doctor told me to schedule labs next week",
        "I need an appointment for my child — I'm not sure if our insurance changed",
      ],
      sections: [
        {
          heading: "Patient identity verification",
          intro:
            "Use this procedure when the patient's identity has not been confirmed against the EHR for the current request.",
          steps: [
            {
              text: "Greet the patient using the Style and voice tone and ask for their full legal name and date of birth. Run Identity match against EHR lookup to resolve to a single Patient_ID.",
              segments: [
                "Greet the patient using the ",
                { kind: "var", label: "Style and voice" },
                " tone and ask for their full legal name and date of birth. Run ",
                { kind: "tool", label: "Identity match" },
                " against the ",
                { kind: "tool", label: "EHR lookup" },
                " to resolve to a single ",
                { kind: "var", label: "Patient_ID" },
                "; if more than one record is found, also ask for the last four digits of SSN or address on file before proceeding.",
              ],
            },
            { text: "Confirm the best phone number to reach the patient — this is not to re-verify identity, but to ensure reminder and follow-up messages reach them at their preferred number." },
            {
              text: "Confirm the patient's preferred communication channel (call, SMS, secure portal) and language preference. If the patient is a minor, confirm the legal guardian on the request before continuing.",
              segments: [
                "Confirm the patient's preferred communication channel (call, SMS, secure portal) and language preference using the ",
                { kind: "var", label: "Brand.brand_profile" },
                " default if none is on file. If the patient is a minor, confirm the legal guardian on the request before continuing.",
              ],
            },
            {
              text: "If the patient cannot be located in the EHR, do not create a duplicate record. Use Lead capture to gather contact details and inform the patient that a new chart will be created at check-in.",
              segments: [
                "If the patient cannot be located in ",
                { kind: "tool", label: "EHR lookup" },
                ", do not create a duplicate record. Use ",
                { kind: "tool", label: "Lead capture" },
                " to gather contact details, then inform the patient that a new chart will be created at check-in and route the request to the front-desk queue for identity capture.",
              ],
            },
          ],
        },
        {
          heading: "Insurance eligibility check",
          intro:
            "Use this procedure once identity is confirmed and before any slot is offered to the patient.",
          steps: [
            {
              text: "Pull the active payer record from the EHR via EHR lookup. If the policy is older than 90 days, prompt the patient to confirm the insurance is unchanged; otherwise request the updated Insurance_card.PDF or member ID.",
              segments: [
                "Pull the active payer record from ",
                { kind: "tool", label: "EHR lookup" },
                ". If the policy is older than 90 days, prompt the patient to confirm the insurance is unchanged; otherwise request the updated ",
                { kind: "var", label: "Insurance_card.PDF" },
                " or member ID.",
              ],
            },
            {
              text: "Run a real-time Eligibility check (270/271) against payer-eligibility.api. If the response indicates coverage termination, plan inactive, or out-of-network, pause the booking and explain the next step rather than offering a slot.",
              segments: [
                "Run a real-time ",
                { kind: "tool", label: "Eligibility check (270/271)" },
                " against ",
                { kind: "var", label: "payer-eligibility.api" },
                ". If the response indicates coverage termination, plan inactive, or out-of-network, pause the booking and explain the next step rather than offering a slot.",
              ],
            },
            { text: "Capture any patient responsibility flags (deductible remaining, copay, prior authorization required) returned by the payer and surface them on the appointment record so the front desk can collect at check-in." },
            {
              text: "If the patient is self-pay, do not skip eligibility — confirm they understand the self-pay rate range and reference Industry context for state-specific disclosure requirements before continuing.",
              segments: [
                "If the patient is self-pay, do not skip eligibility — confirm they understand the self-pay rate range and reference ",
                { kind: "var", label: "Industry context" },
                " for state-specific disclosure requirements before continuing.",
              ],
            },
          ],
        },
        {
          heading: "Primary care provider information",
          intro:
            "Use this procedure for any visit type that must be tied to an assigned PCP (annual physicals, referrals, chronic-care follow-ups).",
          steps: [
            { text: "Confirm the patient's PCP on file. If none is assigned, do not auto-book — route the request to the new-patient onboarding queue so a PCP can be selected based on network, location, and panel availability." },
            { text: "If the visit type requires the PCP specifically (e.g., annual wellness visit), only offer slots on the PCP's calendar. For all other visit types, the PCP is informational and any in-network provider may be offered." },
            { text: "If the patient asks to change their PCP, record the request but do not modify the assignment in this flow — escalate to the care-team coordinator. PCP changes must follow the panel rebalancing rules." },
          ],
        },
      ],
      tools: ["EHR lookup", "Eligibility check (270/271)", "Identity match", "Lead capture"],
      context: [
        { kind: "json", label: "Patient_ID" },
        { kind: "file", label: "Insurance_card.PDF" },
        { kind: "link", label: "payer-eligibility.api" },
        { kind: "brand", label: "Brand.brand_profile" },
        { kind: "style", label: "Style and voice" },
        { kind: "industry", label: "Industry context" },
      ],
    },
  },
  {
    id: "slot-selection",
    title: "Slot selection and hold",
    description:
      "Identify the earliest available slot matching patient preference and appointment type, then place a 5-minute hold while the patient confirms.",
    lastUpdated: "2025-05-18",
    dateAdded: "2025-05-18",
    createdBy: "System",
    lastEditedBy: "Scheduling operations",
    version: "v2.1",
    document: {
      whenToUse:
        "Use this procedure after identity, insurance, and provider have been verified, and the patient is ready to choose a time. Do not start slot selection if any verification step is incomplete or flagged for review.",
      goal:
        "Offer the patient the earliest clinically appropriate slot that matches their stated preference, hold that slot for a short window so they can confirm without losing it to a concurrent request, and release it cleanly if they decline.",
      examples: [
        "What's the earliest you have this week?",
        "I can only do Tuesday or Thursday after 4 pm",
        "Can I get something next month — I'm out of town until then",
      ],
      sections: [
        {
          heading: "Standard slot offer",
          intro:
            "Use this procedure when the patient has not specified a hard constraint that excludes the next-available slot.",
          steps: [
            {
              text: "Determine visit type, expected duration, and any equipment requirements from the Visit_type_catalog.PDF. Reference Resource_requirements to confirm a room or device is available.",
              segments: [
                "Determine visit type, expected duration, and any equipment requirements (e.g., imaging room, lactation room) from ",
                { kind: "var", label: "Visit_type_catalog.PDF" },
                ". Cross-check ",
                { kind: "var", label: "Resource_requirements" },
                " to confirm a room or device is available — do not offer a slot that fails this check.",
              ],
            },
            {
              text: "Run Calendar query against Provider_calendar for the next three available slots that match duration and resource constraints. Filter out blackout windows and break time.",
              segments: [
                "Run ",
                { kind: "tool", label: "Calendar query" },
                " against the ",
                { kind: "var", label: "Provider_calendar" },
                " for the next three available slots that match duration and resource constraints. Filter out slots inside the provider's blackout windows or break time.",
              ],
            },
            { text: "Offer the patient the earliest two slots first, framed by time-of-day (morning / afternoon) rather than raw timestamps, to reduce decision fatigue. Keep the third slot in reserve for a counter-offer if both are declined." },
            {
              text: "Once the patient indicates a preference, call Slot hold to place a 5-minute soft hold. The hold must be visible to concurrent schedulers so the slot is not double-booked.",
              segments: [
                "Once the patient indicates a preference, call ",
                { kind: "tool", label: "Slot hold" },
                " to place a 5-minute soft hold. The hold must be visible to concurrent schedulers so the slot is not double-booked.",
              ],
            },
          ],
        },
        {
          heading: "Constrained slot search",
          intro:
            "Use this procedure when the patient has provided a specific day-of-week, time-of-day, or provider constraint.",
          steps: [
            { text: "Capture the constraint exactly as stated (e.g., 'Tuesday or Thursday after 4 pm') and translate it into the calendar query. Do not over-broaden the constraint — if the patient said 'after 4 pm', do not offer 3:45 pm." },
            { text: "Run the calendar query for the next 14 days. If no slot is found, expand to 30 days. If still no match, do not silently fall back to non-matching slots — tell the patient explicitly and ask whether to relax the constraint or join the waitlist." },
            { text: "When a matching slot is found, place the 5-minute hold and confirm the date, time, and provider back to the patient using both the day of week and the calendar date (e.g., 'Thursday, June 5 at 4:30 pm with Dr. Lin')." },
          ],
        },
        {
          heading: "Hold release",
          intro:
            "Use this procedure when the patient declines the held slot or the 5-minute hold expires without confirmation.",
          steps: [
            { text: "Release the hold immediately so the slot returns to the open calendar. Do not wait for a periodic sweep — concurrent schedulers depend on the slot becoming visible." },
            { text: "If the patient declined, ask one clarifying question to refine the next offer (e.g., 'Would a later time the same day work, or should we look at a different day?'). Do not start over from scratch unless the patient asks." },
            {
              text: "If the hold expired without a patient response, log the abandoned request and trigger a single follow-up via Notification send within 1 hour. Offer Waitlist add if no slot worked.",
              segments: [
                "If the hold expired without a patient response, log the abandoned request and trigger a single follow-up via ",
                { kind: "tool", label: "Notification send" },
                " within 1 hour through the patient's preferred channel. If no offered slot worked, call ",
                { kind: "tool", label: "Waitlist add" },
                " so the patient is auto-notified when a matching slot opens.",
              ],
            },
          ],
        },
      ],
      tools: ["Calendar query", "Slot hold", "Waitlist add", "Notification send"],
      context: [
        { kind: "json", label: "Provider_calendar" },
        { kind: "file", label: "Visit_type_catalog.PDF" },
        { kind: "json", label: "Resource_requirements" },
        { kind: "brand", label: "Brand.brand_profile" },
        { kind: "industry", label: "Industry context" },
      ],
    },
  },
  {
    id: "provider-match",
    title: "Provider matching",
    description:
      "Match the appointment to a licensed provider accepting new patients in the patient's insurance network and geographic region.",
    lastUpdated: "2025-05-15",
    dateAdded: "2025-05-15",
    createdBy: "System",
    lastEditedBy: "Network operations",
    version: "v1.2",
    document: {
      whenToUse:
        "Use this procedure when the patient does not have a current relationship with a specific provider, or when the requested provider is not available within the patient's required timeframe.",
      goal:
        "Match the patient to a provider who is licensed in the patient's state, in-network for the patient's insurance, accepting new patients, and able to deliver the required visit type within an acceptable distance and timeframe.",
      examples: [
        "I don't have a doctor yet — can you assign one?",
        "My doctor isn't available for 6 weeks, is there someone else?",
        "I just moved here and need to find a primary care doctor in-network",
      ],
      sections: [
        {
          heading: "New patient provider assignment",
          intro:
            "Use this procedure when the patient has no PCP on file or is requesting a new provider relationship.",
          steps: [
            {
              text: "Confirm the patient's state of residence and run License verification on each candidate in the Provider_directory. Do not offer a provider whose license is expired, restricted, or pending renewal.",
              segments: [
                "Confirm the patient's state of residence and run ",
                { kind: "tool", label: "License verification" },
                " against each candidate in the ",
                { kind: "var", label: "Provider_directory" },
                ". Do not offer a provider whose license is expired, restricted, or pending renewal.",
              ],
            },
            {
              text: "Apply Network filter using Network_data to keep only in-network providers. If zero are within an acceptable radius, escalate to network operations rather than offering out-of-network.",
              segments: [
                "Apply ",
                { kind: "tool", label: "Network filter" },
                " using ",
                { kind: "var", label: "Network_data" },
                " to keep only in-network providers. If zero providers are within an acceptable radius, escalate to network operations rather than offering out-of-network.",
              ],
            },
            { text: "Rank the remaining providers by panel availability (accepting new patients), distance from the patient's address, and earliest available slot. Offer the top two ranked providers with a brief reason for each match." },
            { text: "Once the patient selects a provider, record the assignment in the EHR as the new PCP and proceed to slot selection on that provider's calendar." },
          ],
        },
        {
          heading: "Substitute provider for unavailable PCP",
          intro:
            "Use this procedure when the patient's PCP cannot meet the clinical timeframe and the visit type does not require the PCP specifically.",
          steps: [
            { text: "Confirm the visit type does not require the PCP. If it does (e.g., annual wellness visit), do not substitute — offer the next available PCP slot or escalate to the care coordinator." },
            { text: "Identify providers in the same care team or pod as the PCP. Care-team providers share notes and can deliver continuity of care more reliably than unrelated providers in the same location." },
            { text: "Explain to the patient that this is a one-time substitute and the PCP relationship is unchanged. Confirm the patient understands before booking the substitute slot." },
          ],
        },
        {
          heading: "Specialist match",
          intro:
            "Use this procedure when the appointment type is a specialist visit (not primary care).",
          steps: [
            {
              text: "Verify the specialty matches the referral diagnosis or reason for visit using Specialty_matrix.PDF. Do not book a specialist outside the indicated specialty even if a sooner slot exists.",
              segments: [
                "Verify the specialty matches the referral diagnosis or reason for visit using ",
                { kind: "var", label: "Specialty_matrix.PDF" },
                ". Do not book a specialist outside the indicated specialty even if their next-available slot is sooner.",
              ],
            },
            {
              text: "Check whether the payer requires prior authorization for this specialty. If required and missing, route to the Prior auth queue rather than holding a slot that may be denied.",
              segments: [
                "Check whether the payer requires prior authorization or a referral on file for this specialty. If required and missing, route to ",
                { kind: "tool", label: "Prior auth queue" },
                " rather than holding a slot that may be denied.",
              ],
            },
            {
              text: "Confirm the specialist's sub-specialty if the diagnosis is narrow (e.g., pediatric cardiology vs. adult cardiology). Reference Industry context for regional sub-specialty norms.",
              segments: [
                "Confirm the specialist's sub-specialty if the diagnosis is narrow (e.g., pediatric cardiology vs. adult cardiology). Reference ",
                { kind: "var", label: "Industry context" },
                " for regional sub-specialty norms — mismatched sub-specialty causes downstream rescheduling and patient frustration.",
              ],
            },
          ],
        },
      ],
      tools: ["Provider directory", "License verification", "Network filter", "Prior auth queue"],
      context: [
        { kind: "json", label: "Provider_directory" },
        { kind: "json", label: "Network_data" },
        { kind: "file", label: "Specialty_matrix.PDF" },
        { kind: "brand", label: "Brand.brand_profile" },
        { kind: "industry", label: "Industry context" },
      ],
    },
  },
  {
    id: "consent-capture",
    title: "Consent and pre-visit instructions",
    description:
      "Send HIPAA-compliant consent form and pre-visit preparation instructions via patient's preferred communication channel.",
    lastUpdated: "2025-05-12",
    dateAdded: "2025-05-12",
    createdBy: "System",
    lastEditedBy: "Compliance",
    version: "v1.0",
    document: {
      whenToUse:
        "Use this procedure immediately after the appointment is confirmed and before the patient ends the interaction, so consent capture and pre-visit instructions are delivered in a single context with the booking.",
      goal:
        "Ensure every confirmed appointment has the required signed consents on file and the patient has received and acknowledged the pre-visit preparation instructions for the visit type.",
      examples: [
        "Do I need to sign anything before the visit?",
        "Is there anything I need to do to prepare?",
        "Can you send me the forms by email instead of mail?",
      ],
      sections: [
        {
          heading: "Consent form delivery",
          intro:
            "Use this procedure to send the consent packet matching the visit type.",
          steps: [
            {
              text: "Look up the visit type in the Consent_matrix and identify all required forms (general consent, HIPAA acknowledgement, financial responsibility, visit-specific consents).",
              segments: [
                "Look up the visit type in the ",
                { kind: "var", label: "Consent_matrix" },
                " and identify all required forms (general consent, HIPAA acknowledgement, financial responsibility, and any visit-specific consents such as imaging or procedure consents).",
              ],
            },
            {
              text: "Send the packet via Consent send through the patient's preferred channel — a Portal link or SMS dispatch to the secure-portal.url. Never send unencrypted email containing PHI.",
              segments: [
                "Send the packet via ",
                { kind: "tool", label: "Consent send" },
                " through the patient's preferred channel — a ",
                { kind: "tool", label: "Portal link" },
                " or ",
                { kind: "tool", label: "SMS dispatch" },
                " pointing to ",
                { kind: "var", label: "secure-portal.url" },
                ". Never send unencrypted email containing PHI.",
              ],
            },
            { text: "Set the consent expectation in the booking record: if any required consent is unsigned 24 hours before the visit, the appointment is flagged and the front desk will follow up at check-in." },
            { text: "If the patient is a minor, send the consent packet to the legal guardian's contact on file, not to the patient's contact." },
          ],
        },
        {
          heading: "Pre-visit instructions",
          intro:
            "Use this procedure to deliver the visit-specific preparation steps.",
          steps: [
            {
              text: "Pull the pre-visit instruction template from Pre_visit_templates.PDF and render it through the Template engine. Do not improvise — use the approved template.",
              segments: [
                "Pull the pre-visit instruction template for the visit type (e.g., fasting for labs, medication hold for procedures, arrival window for imaging) from ",
                { kind: "var", label: "Pre_visit_templates.PDF" },
                " and render it through the ",
                { kind: "tool", label: "Template engine" },
                ". Do not improvise — use the approved template.",
              ],
            },
            {
              text: "Personalize the instructions with the patient's appointment date, location address, parking notes, and any items to bring. Use the Style and voice tone for the messaging.",
              segments: [
                "Personalize the instructions with the patient's appointment date, location address, parking notes, and any items the patient should bring (ID, insurance card, current medication list). Use the ",
                { kind: "var", label: "Style and voice" },
                " tone — keep it warm, clear, and short.",
              ],
            },
            { text: "Confirm the patient has received and understood the instructions before ending the interaction. For procedures with critical prep (NPO, bowel prep), require an explicit verbal acknowledgement." },
          ],
        },
      ],
      tools: ["Consent send", "Portal link", "SMS dispatch", "Template engine"],
      context: [
        { kind: "json", label: "Consent_matrix" },
        { kind: "file", label: "Pre_visit_templates.PDF" },
        { kind: "link", label: "secure-portal.url" },
        { kind: "brand", label: "Brand.brand_profile" },
        { kind: "style", label: "Style and voice" },
      ],
    },
  },
  {
    id: "human-review",
    title: "Human review for complex cases",
    description:
      "Route to a care coordinator for manual review when the appointment type is flagged as high-acuity, specialist-only, or requires prior authorization.",
    lastUpdated: "2025-05-08",
    dateAdded: "2025-05-08",
    createdBy: "System",
    lastEditedBy: "Clinical operations",
    version: "v1.3",
    document: {
      whenToUse:
        "Use this procedure when the request matches one of the escalation triggers below. Do not attempt to auto-resolve a flagged case — the cost of a wrong decision is higher than the cost of a short wait for human review.",
      goal:
        "Hand off cases that require clinical judgement, payer-specific authorization steps, or sensitive context to a care coordinator with full handoff context, so the patient does not have to re-explain their situation.",
      examples: [
        "I think I might need to be seen today — I'm having chest pain",
        "My insurance said I need pre-authorization for this MRI",
        "My oncologist said to schedule the follow-up within two weeks",
      ],
      sections: [
        {
          heading: "Escalation triggers",
          intro:
            "Use this procedure to identify when a request must be routed to a human reviewer.",
          steps: [
            {
              text: "If the patient describes any symptom on the Urgent_symptom_list.PDF (chest pain, shortness of breath, severe bleeding, suicidal ideation, stroke signs), stop scheduling immediately.",
              segments: [
                "If the patient describes any symptom on the ",
                { kind: "var", label: "Urgent_symptom_list.PDF" },
                " (chest pain, shortness of breath, severe bleeding, suicidal ideation, signs of stroke), stop scheduling immediately and follow the urgent-care escalation procedure — do not continue with routine booking.",
              ],
            },
            {
              text: "If the appointment type is on the specialist-only list, do not auto-book. Use the Escalation router with Specialty_routing to send the case to the right specialty care coordinator.",
              segments: [
                "If the appointment type is on the specialist-only list (oncology, transplant, complex cardiology, high-risk obstetrics), do not auto-book. Use ",
                { kind: "tool", label: "Escalation router" },
                " with ",
                { kind: "var", label: "Specialty_routing" },
                " to send the case to the right specialty care coordinator.",
              ],
            },
            { text: "If the eligibility check returns a prior-authorization-required flag, do not hold a slot. Route to the prior-auth queue with the visit type, diagnosis code, and payer information attached." },
            { text: "If the patient has had three or more no-shows in the past 90 days, do not auto-confirm — route to the front desk to require phone confirmation before the slot is held." },
          ],
        },
        {
          heading: "Handoff to care coordinator",
          intro:
            "Use this procedure once an escalation trigger has been hit.",
          steps: [
            {
              text: "Use Conversation export to capture the full context (patient request, symptoms, constraints, slots discussed) and Case create to open the escalation case so the patient does not have to repeat anything.",
              segments: [
                "Use ",
                { kind: "tool", label: "Conversation export" },
                " to capture the full context (patient request, symptoms, constraints, slots already discussed), then call ",
                { kind: "tool", label: "Case create" },
                " to open the escalation case. The patient should not have to repeat anything that was already collected.",
              ],
            },
            { text: "Tell the patient explicitly that a care coordinator will reach out, give the expected callback window for that service line, and confirm the best number and time to reach them." },
            {
              text: "If the case is time-sensitive (within 24 hours), use Pager to alert the on-call coordinator from On_call_roster directly rather than dropping the case in the general queue.",
              segments: [
                "If the case is time-sensitive (within 24 hours), use ",
                { kind: "tool", label: "Pager" },
                " to alert the on-call coordinator from ",
                { kind: "var", label: "On_call_roster" },
                " directly rather than dropping the case in the general queue.",
              ],
            },
          ],
        },
      ],
      tools: ["Escalation router", "Pager", "Case create", "Conversation export"],
      context: [
        { kind: "file", label: "Urgent_symptom_list.PDF" },
        { kind: "json", label: "Specialty_routing" },
        { kind: "json", label: "On_call_roster" },
        { kind: "brand", label: "Brand.brand_profile" },
        { kind: "industry", label: "Industry context" },
      ],
    },
  },
  {
    id: "confirmation",
    title: "Booking confirmation and reminders",
    description:
      "Send booking confirmation immediately and automated reminders at 48h and 2h before the appointment time.",
    lastUpdated: "2025-05-02",
    dateAdded: "2025-05-02",
    createdBy: "System",
    lastEditedBy: "Patient experience",
    version: "v1.1",
    document: {
      whenToUse:
        "Use this procedure immediately after the slot hold has been converted to a confirmed booking and continues running automatically until the appointment is completed or cancelled.",
      goal:
        "Give the patient a clear, single source of truth for their appointment details and reduce no-shows by sending the right reminder at the right time through the channel they actually use.",
      examples: [
        "Can you send the appointment details to my email?",
        "I'd like reminders by text, not phone calls",
        "I need to reschedule the appointment I have tomorrow",
      ],
      sections: [
        {
          heading: "Immediate confirmation",
          intro:
            "Use this procedure within 30 seconds of slot confirmation.",
          steps: [
            {
              text: "Send a confirmation message through the patient's preferred channel containing the appointment date and time (with time zone), provider name, location with address, visit type, and a single tap-to-reschedule link.",
              segments: [
                "Send a confirmation through the ",
                { kind: "tool", label: "Notification send" },
                " containing the ",
                { kind: "var", label: "Appointment date" },
                ", ",
                { kind: "var", label: "Appointment time" },
                ", ",
                { kind: "var", label: "Provider name" },
                ", and ",
                { kind: "var", label: "Location address" },
                " — plus a single tap-to-reschedule link.",
              ],
            },
            {
              text: "Add the appointment to the patient's portal so they have a persistent record. Reference Channel_preferences to confirm the right channel was chosen.",
              segments: [
                "Add the appointment to the patient's portal so they have a persistent record outside of the message channel. Cross-check ",
                { kind: "var", label: "Channel_preferences" },
                " to confirm the right channel was chosen — channels can be lost or filtered as spam, so do not rely on the message alone.",
              ],
            },
            { text: "If the patient does not have a portal account, include a one-time portal sign-up link in the confirmation. Do not block the booking on portal creation." },
          ],
        },
        {
          heading: "Reminder schedule",
          intro:
            "Use this procedure for the automated reminder cadence.",
          steps: [
            {
              text: "Use Reminder schedule from Reminder_templates.PDF to send a reminder 48 hours before the appointment via the patient's preferred channel with a confirm/reschedule CTA.",
              segments: [
                "Use ",
                { kind: "tool", label: "Reminder schedule" },
                " with the 48h template from ",
                { kind: "var", label: "Reminder_templates.PDF" },
                " to send a reminder via the patient's preferred channel with a confirm/reschedule call-to-action. If the patient does not respond within 24 hours, do not auto-escalate — the second reminder will catch it.",
              ],
            },
            { text: "Schedule a second reminder 2 hours before the appointment via SMS regardless of stated preference (email is too slow at this distance). Include parking and check-in instructions for in-person visits, or the join link for telehealth." },
            { text: "If the patient explicitly opts out of reminders, honor that preference and record the opt-out, but still send the immediate confirmation — it contains required information for the visit, not promotional content." },
          ],
        },
        {
          heading: "Reschedule and cancel",
          intro:
            "Use this procedure when the patient responds to a confirmation or reminder with a reschedule or cancel intent.",
          steps: [
            { text: "Acknowledge the cancellation or reschedule request without judgment. Patients should never feel pressured to keep an appointment that doesn't work for them." },
            {
              text: "If contact details are not on file, collect them first; then confirm the appointment date, time, and provider name the patient wants to cancel.",
              segments: [
                "If contact details are not on file, use ",
                { kind: "tool", label: "Lead capture" },
                " to collect them first. Confirm the ",
                { kind: "var", label: "Appointment date" },
                ", ",
                { kind: "var", label: "Appointment time" },
                ", and ",
                { kind: "var", label: "Provider name" },
                " the patient wants to cancel. Gently offer to reschedule before proceeding — do not pressure if they decline.",
              ],
            },
            {
              text: "If rescheduling, call Reschedule to follow the slot-selection procedure for the new time, then release the original slot only after the new slot is confirmed.",
              segments: [
                "If rescheduling, call ",
                { kind: "tool", label: "Reschedule" },
                " to follow the slot-selection procedure for the new time, then release the original slot only after the new slot is confirmed. Do not release the original slot first.",
              ],
            },
            {
              text: "If cancelling within the cancellation window, release the slot immediately. If outside, apply the late-cancel rules in Cancellation_policy before releasing.",
              segments: [
                "If cancelling within the cancellation window, release the slot immediately and notify the patient that the slot is open for other patients. If outside the cancellation window, apply the late-cancel rules in ",
                { kind: "var", label: "Cancellation_policy" },
                " before releasing.",
              ],
            },
          ],
        },
      ],
      tools: ["Notification send", "Reminder schedule", "Reschedule", "Lead capture"],
      context: [
        { kind: "json", label: "Channel_preferences" },
        { kind: "file", label: "Reminder_templates.PDF" },
        { kind: "json", label: "Cancellation_policy" },
        { kind: "brand", label: "Brand.brand_profile" },
        { kind: "style", label: "Style and voice" },
      ],
    },
  },
];

function formatProcedureDate(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatProcedureDateLong(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ProcedureDateAdded({ isoDate }: { isoDate: string }) {
  const label = formatProcedureDate(isoDate);
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 text-[11px] tabular-nums text-muted-foreground"
      title={label}
    >
      <Clock className="size-3 opacity-70" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
      <span>{label}</span>
    </span>
  );
}

const PROCEDURE_SORT_LABELS: Record<ProcedureSortKey, string> = {
  lastUpdated: "Last updated",
  title: "Title",
};

function procedureIdFromTitle(title: string): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || "procedure"}-${Date.now()}`;
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function emptyProcedureDocument(description: string): ProcedureDocument {
  return {
    whenToUse: description,
    goal: "",
    examples: [],
    sections: [],
    tools: [],
    context: [],
  };
}

function AddProcedureDialog({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (draft: { title: string; description: string }) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
    }
  }, [open]);

  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  const canSave = trimmedTitle.length > 0 && trimmedDescription.length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({ title: trimmedTitle, description: trimmedDescription });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add procedure</DialogTitle>
          <DialogDescription className="text-[13px] text-muted-foreground">
            Define a standard operating procedure this agent can follow when managing appointments.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="procedure-title" className="text-[13px]">
              Title
            </Label>
            <Input
              id="procedure-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Patient intake verification"
              className="h-9 text-[13px]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="procedure-description" className="text-[13px]">
              Description
            </Label>
            <Textarea
              id="procedure-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe when to use this procedure and what the agent should do."
              rows={4}
              className="min-h-[100px] resize-y text-[13px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" className="h-9 rounded-md text-[13px]" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" className="h-9 rounded-md text-[13px]" disabled={!canSave} onClick={handleSave}>
            Add procedure
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProcedureIconBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary",
        className,
      )}
      aria-hidden
    >
      <BookOpen className="size-5" strokeWidth={1.6} absoluteStrokeWidth />
    </span>
  );
}

function ProcedureCardMenu({
  onEdit,
  onDuplicate,
  onDelete,
}: {
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Procedure actions"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" strokeWidth={1.6} absoluteStrokeWidth />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem className="text-[13px]" onClick={onEdit}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem className="text-[13px]" onClick={onDuplicate}>
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-[13px] text-destructive focus:text-destructive"
          onClick={onDelete}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ProcedureSopCard({
  item,
  viewMode,
  onOpen,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  item: ProcedureItem;
  viewMode: "grid" | "list";
  onOpen: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const shellClass = cn(
    "group/procedure cursor-pointer rounded-lg border border-border bg-card text-left transition-colors duration-200",
    "hover:border-primary/30 hover:bg-primary/[0.04] dark:hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
  );

  const cardMenu = (
    <ProcedureCardMenu onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete} />
  );

  if (viewMode === "list") {
    return (
      <button type="button" onClick={onOpen} className={cn(shellClass, "flex w-full items-start gap-4 p-4")}>
        <ProcedureIconBadge />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-[14px] font-normal leading-snug text-foreground group-hover/procedure:text-primary">{item.title}</span>
          <p className="text-[13px] leading-relaxed text-muted-foreground">{item.description}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {cardMenu}
          <ProcedureDateAdded isoDate={item.dateAdded} />
        </div>
      </button>
    );
  }

  return (
    <button type="button" onClick={onOpen} className={cn(shellClass, "flex h-full min-h-[196px] w-full flex-col p-5")}>
      <div className="flex items-start justify-between gap-2">
        <ProcedureIconBadge />
        {cardMenu}
      </div>
      <h3 className="mt-4 line-clamp-2 text-[14px] font-normal leading-snug text-foreground group-hover/procedure:text-primary">
        {item.title}
      </h3>
      <p className="mt-2 min-h-0 flex-1 text-[13px] leading-relaxed text-muted-foreground line-clamp-4">
        {item.description}
      </p>
      <div className="mt-4 flex justify-end">
        <ProcedureDateAdded isoDate={item.dateAdded} />
      </div>
    </button>
  );
}

const CONTEXT_ICON: Record<ProcedureContextKind, typeof BookOpen> = {
  json: Braces,
  file: FileText,
  link: Link2,
  brand: Home,
  style: Home,
  industry: Package,
};

const CONTEXT_CHIP_STYLE: Record<
  ProcedureContextKind,
  { border: string; iconPane: string; icon: string }
> = {
  json: {
    border: "border-sky-200 dark:border-sky-800",
    iconPane: "bg-sky-50 dark:bg-sky-950/50",
    icon: "text-sky-600 dark:text-sky-400",
  },
  file: {
    border: "border-emerald-200 dark:border-emerald-800",
    iconPane: "bg-emerald-50 dark:bg-emerald-950/50",
    icon: "text-emerald-600 dark:text-emerald-400",
  },
  link: {
    border: "border-fuchsia-200 dark:border-fuchsia-800",
    iconPane: "bg-fuchsia-50 dark:bg-fuchsia-950/50",
    icon: "text-fuchsia-600 dark:text-fuchsia-400",
  },
  brand: {
    border: "border-indigo-200 dark:border-indigo-800",
    iconPane: "bg-indigo-50 dark:bg-indigo-950/50",
    icon: "text-indigo-600 dark:text-indigo-400",
  },
  style: {
    border: "border-indigo-200 dark:border-indigo-800",
    iconPane: "bg-indigo-50 dark:bg-indigo-950/50",
    icon: "text-indigo-600 dark:text-indigo-400",
  },
  industry: {
    border: "border-amber-200 dark:border-amber-800",
    iconPane: "bg-amber-50 dark:bg-amber-950/50",
    icon: "text-amber-600 dark:text-amber-500",
  },
};

const TOOL_CHIP_STYLE = {
  border: "border-border",
  iconPane: "bg-muted/80",
  icon: "text-muted-foreground",
} as const;

const PROCEDURE_DETAIL_BODY_CLASS = "text-[14px] leading-[1.75] text-muted-foreground";

/** Maps inline variable labels to the same context chip theme as the sidebar. */
function procedureContextKindFromLabel(label: string): ProcedureContextKind {
  if (label === "Industry context") return "industry";
  if (label === "Style and voice") return "style";
  if (label.startsWith("Brand.") || label.includes("brand_profile")) return "brand";
  if (/\.pdf$/i.test(label)) return "file";
  if (/\.(api|url)$/i.test(label) || label.includes("://") || label.startsWith("www.")) return "link";
  return "json";
}

function InlineVarChip({ label }: { label: string }) {
  const kind = procedureContextKindFromLabel(label);
  const style = CONTEXT_CHIP_STYLE[kind];
  const Icon = CONTEXT_ICON[kind];
  return (
    <ProcedureSidebarChip
      inline
      label={label}
      icon={Icon}
      borderClassName={style.border}
      iconPaneClassName={style.iconPane}
      iconClassName={style.icon}
    />
  );
}

function InlineToolChip({ label }: { label: string }) {
  return (
    <ProcedureSidebarChip
      inline
      label={label}
      icon={Wrench}
      borderClassName={TOOL_CHIP_STYLE.border}
      iconPaneClassName={TOOL_CHIP_STYLE.iconPane}
      iconClassName={TOOL_CHIP_STYLE.icon}
    />
  );
}

function renderStepSegments(segments: StepSegment[]) {
  return segments.map((seg, i) => {
    if (typeof seg === "string") return <span key={i}>{seg}</span>;
    if (seg.kind === "var") return <InlineVarChip key={i} label={seg.label} />;
    return <InlineToolChip key={i} label={seg.label} />;
  });
}

function ProcedureSidebarChip({
  label,
  icon: Icon,
  borderClassName,
  iconPaneClassName,
  iconClassName,
  inline = false,
  onRemove,
}: {
  label: string;
  icon: typeof Wrench;
  borderClassName: string;
  iconPaneClassName: string;
  iconClassName: string;
  /** Embedded in procedure body copy — same chrome as sidebar chips, no remove control. */
  inline?: boolean;
  onRemove?: () => void;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full overflow-hidden rounded-md border bg-card shadow-none",
        inline && "mx-0.5 align-middle",
        borderClassName,
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center self-stretch border-r",
          inline ? "px-1.5 py-0.5" : "px-2 py-1.5",
          borderClassName,
          iconPaneClassName,
        )}
      >
        <Icon
          className={cn("shrink-0", inline ? "size-3" : "size-4", iconClassName)}
          strokeWidth={1.6}
          absoluteStrokeWidth
          aria-hidden
        />
      </span>
      <span
        className={cn(
          "flex min-w-0 items-center bg-card",
          inline ? "py-0.5 pl-1.5 pr-1.5" : "gap-2 py-1.5 pl-2 pr-1",
        )}
      >
        <span
          className={cn(
            "truncate leading-none text-foreground",
            inline ? "text-[11px]" : "text-[13px]",
          )}
        >
          {label}
        </span>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex size-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={`Remove ${label}`}
          >
            <X className="size-3" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
          </button>
        ) : null}
      </span>
    </span>
  );
}

function ToolChip({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <ProcedureSidebarChip
      label={label}
      icon={Wrench}
      borderClassName={TOOL_CHIP_STYLE.border}
      iconPaneClassName={TOOL_CHIP_STYLE.iconPane}
      iconClassName={TOOL_CHIP_STYLE.icon}
      onRemove={onRemove}
    />
  );
}

function ContextChip({ item, onRemove }: { item: ProcedureContextItem; onRemove?: () => void }) {
  const Icon = CONTEXT_ICON[item.kind];
  const style = CONTEXT_CHIP_STYLE[item.kind];
  return (
    <ProcedureSidebarChip
      label={item.label}
      icon={Icon}
      borderClassName={style.border}
      iconPaneClassName={style.iconPane}
      iconClassName={style.icon}
      onRemove={onRemove}
    />
  );
}

function SidebarGroup({
  icon: Icon,
  title,
  children,
  onAdd,
}: {
  icon: typeof BookOpen;
  title: string;
  children: ReactNode;
  onAdd?: () => void;
}) {
  return (
    <section className="w-full rounded-xl border border-border bg-card p-5">
      <header className="mb-3 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-[13px] font-medium text-foreground">
          <span className="inline-flex size-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Icon className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
          </span>
          {title}
        </span>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[12px] text-primary transition-colors hover:bg-primary/10"
        >
          <Plus className="size-3" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
          Add
        </button>
      </header>
      <div className="flex flex-wrap items-start justify-start gap-2">{children}</div>
    </section>
  );
}

function ProcedureSectionHeading({
  icon: Icon,
  children,
}: {
  icon: typeof BookOpen;
  children: ReactNode;
}) {
  return (
    <h2 className="flex items-center gap-2 text-[14px] font-semibold leading-tight text-foreground">
      <Icon className="size-4 shrink-0 text-primary" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
      {children}
    </h2>
  );
}

/** Lines up with procedure title text (after back control: w-9 + gap-2). */
const PROCEDURE_DETAIL_CONTENT_INSET_CLASS = "pl-11";

function ProcedureDetailView({
  procedure,
  onBack,
  onToggleDisabled,
}: {
  procedure: ProcedureItem;
  onBack: () => void;
  onToggleDisabled: (next: boolean) => void;
}) {
  const doc = procedure.document;
  const enabled = !procedure.disabled;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-16 pt-2">
      <div className="mb-8 flex w-full items-start justify-between gap-6">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to all procedures"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="size-5" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
            </button>
            <h1 className="min-w-0 truncate text-xl font-semibold tracking-tight text-foreground">
              {procedure.title}
            </h1>
          </div>
          <p className="pl-11 text-[13px] text-muted-foreground">
            Created by {procedure.createdBy} on {formatProcedureDateLong(procedure.dateAdded)} · {procedure.version}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3 pt-1">
          <span className="text-[13px] text-foreground">Enable</span>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => onToggleDisabled(enabled)}
            className={cn(
              "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
              enabled ? "bg-primary" : "bg-muted",
            )}
          >
            <span
              className={cn(
                "inline-block size-4 transform rounded-full bg-background shadow-sm transition-transform",
                enabled ? "translate-x-[18px]" : "translate-x-[2px]",
              )}
            />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Procedure actions"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <MoreVertical className="size-4" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem className="text-[13px]">Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-[13px]">Duplicate</DropdownMenuItem>
              <DropdownMenuItem className="text-[13px]">Export</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-[13px] text-destructive focus:text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Two-column: content + sidebar (main capped; sidebar 400px) */}
      <div className="flex w-full gap-10">

        {/* ── Main content ── */}
        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col max-w-[calc(100%-40rem)]",
            PROCEDURE_DETAIL_CONTENT_INSET_CLASS,
          )}
        >
          <div className="flex flex-col gap-12">

            <section>
              <ProcedureSectionHeading icon={Clock}>When to use this procedure?</ProcedureSectionHeading>
              <p className={cn("mt-4", PROCEDURE_DETAIL_BODY_CLASS)}>{doc.whenToUse}</p>
            </section>

            <section>
              <ProcedureSectionHeading icon={Target}>Goal</ProcedureSectionHeading>
              <p className={cn("mt-4", PROCEDURE_DETAIL_BODY_CLASS)}>{doc.goal}</p>
            </section>

            <section>
              <ProcedureSectionHeading icon={MessageSquare}>Examples</ProcedureSectionHeading>
              {doc.examples.length === 0 ? (
                <p className={cn("mt-4", PROCEDURE_DETAIL_BODY_CLASS)}>No examples yet.</p>
              ) : (
                <ul className="mt-4 flex flex-col gap-2">
                  {doc.examples.map((ex, i) => (
                    <li key={i} className={cn("flex gap-2", PROCEDURE_DETAIL_BODY_CLASS)}>
                      <span className="mt-[4px] shrink-0" aria-hidden>
                        •
                      </span>
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {doc.sections.map((section, idx) => (
              <section key={idx}>
                <ProcedureSectionHeading icon={BookOpen}>{section.heading}</ProcedureSectionHeading>
                {section.intro ? (
                  <p className={cn("mt-4", PROCEDURE_DETAIL_BODY_CLASS)}>{section.intro}</p>
                ) : null}
                <ol className="mt-4 flex flex-col gap-6">
                  {section.steps.map((step, i) => (
                    <li key={i} className="flex gap-4">
                      <span
                        className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-[11px] tabular-nums text-muted-foreground"
                        aria-hidden
                      >
                        {i + 1}
                      </span>
                      <p className={PROCEDURE_DETAIL_BODY_CLASS}>
                        {step.segments ? renderStepSegments(step.segments) : step.text}
                      </p>
                    </li>
                  ))}
                </ol>
              </section>
            ))}

          </div>
        </div>

        {/* ── Sidebar ── */}
        <aside className="hidden w-[400px] shrink-0 flex-col items-start gap-4 lg:flex">
          <SidebarGroup icon={Wrench} title="Tools">
            {doc.tools.length === 0 ? (
              <span className="text-[12px] text-muted-foreground">No tools added.</span>
            ) : (
              doc.tools.map((tool, i) => <ToolChip key={`${tool}-${i}`} label={tool} onRemove={() => {}} />)
            )}
          </SidebarGroup>

          <SidebarGroup icon={Database} title="Context">
            {doc.context.length === 0 ? (
              <span className="text-[12px] text-muted-foreground">No context added.</span>
            ) : (
              doc.context.map((ctx, i) => <ContextChip key={`${ctx.label}-${i}`} item={ctx} onRemove={() => {}} />)
            )}
          </SidebarGroup>
        </aside>

      </div>
    </div>
  );
}

function ProceduresTab() {
  const [procedures, setProcedures] = useState<ProcedureItem[]>(INITIAL_PROCEDURE_ITEMS);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<ProcedureSortKey>("lastUpdated");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleAddProcedure = (draft: { title: string; description: string }) => {
    const today = todayIsoDate();
    const item: ProcedureItem = {
      id: procedureIdFromTitle(draft.title),
      title: draft.title,
      description: draft.description,
      lastUpdated: today,
      dateAdded: today,
      createdBy: "You",
      lastEditedBy: "You",
      version: "v1.0",
      document: emptyProcedureDocument(draft.description),
    };
    setProcedures((prev) => [item, ...prev]);
    setSearch("");
  };

  const handleDeleteProcedure = (id: string) => {
    setProcedures((prev) => prev.filter((p) => p.id !== id));
  };

  const handleDuplicateProcedure = (source: ProcedureItem) => {
    const today = todayIsoDate();
    const copy: ProcedureItem = {
      ...source,
      id: procedureIdFromTitle(`${source.title} copy`),
      title: `${source.title} (copy)`,
      lastUpdated: today,
      dateAdded: today,
    };
    setProcedures((prev) => [copy, ...prev]);
  };

  const handleToggleDisabled = (id: string, next: boolean) => {
    setProcedures((prev) => prev.map((p) => (p.id === id ? { ...p, disabled: next } : p)));
  };

  const visibleProcedures = useMemo(() => {
    const q = search.trim().toLowerCase();
    let items = procedures;
    if (q) {
      items = items.filter(
        (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
      );
    }
    return [...items].sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return b.lastUpdated.localeCompare(a.lastUpdated);
    });
  }, [search, sortBy, procedures]);

  const selectedProcedure = selectedId
    ? procedures.find((p) => p.id === selectedId) ?? null
    : null;

  if (selectedProcedure) {
    return (
      <ProcedureDetailView
        procedure={selectedProcedure}
        onBack={() => setSelectedId(null)}
        onToggleDisabled={(next) => handleToggleDisabled(selectedProcedure.id, next)}
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 pb-6">
      <div className="flex items-start justify-between gap-4">
        <p className="min-w-0 flex-1 text-[12px] leading-relaxed text-muted-foreground">
          Standard operating procedures this agent follows when managing appointment requests for healthcare locations.
        </p>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {searchOpen ? (
            <div className="relative h-9 w-[240px] shrink-0">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-[14px] -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.6}
                absoluteStrokeWidth
                aria-hidden
              />
              <Input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onBlur={() => {
                  if (search === "") setSearchOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setSearch("");
                    setSearchOpen(false);
                  }
                }}
                autoFocus
                placeholder="Search procedures"
                className="h-9 w-full rounded-md pl-9 text-[13px]"
                aria-label="Search procedures"
              />
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-9 shrink-0 rounded-md"
              aria-label="Search procedures"
              title="Search procedures"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
            </Button>
          )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-9 gap-1 rounded-md px-4 text-[13px] font-normal"
            >
              {PROCEDURE_SORT_LABELS[sortBy]}
              <ChevronDown className="size-3.5 opacity-70" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem className="text-[13px]" onClick={() => setSortBy("lastUpdated")}>
              Last updated
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[13px]" onClick={() => setSortBy("title")}>
              Title
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <SegmentedToggle<"grid" | "list">
          iconOnly
          ariaLabel="Procedure view"
          value={viewMode}
          onChange={setViewMode}
          className="border border-border"
          items={[
            {
              value: "list",
              label: "List view",
              icon: <List className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />,
            },
            {
              value: "grid",
              label: "Grid view",
              icon: <LayoutGrid className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />,
            },
          ]}
        />

        <Button
          type="button"
          className="h-9 gap-1 rounded-md px-4 text-[13px]"
          onClick={() => setAddDialogOpen(true)}
        >
          <Plus className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
          Add
        </Button>
        </div>
      </div>

      <AddProcedureDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSave={handleAddProcedure}
      />

      {visibleProcedures.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-muted-foreground">
          {procedures.length === 0
            ? "No procedures yet. Add a procedure to define how this agent should operate."
            : "No procedures match your search."}
        </p>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleProcedures.map((item) => (
            <ProcedureSopCard
              key={item.id}
              item={item}
              viewMode="grid"
              onOpen={() => setSelectedId(item.id)}
              onEdit={() => setSelectedId(item.id)}
              onDuplicate={() => handleDuplicateProcedure(item)}
              onDelete={() => handleDeleteProcedure(item.id)}
            />
          ))}
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {visibleProcedures.map((item) => (
            <li key={item.id}>
              <ProcedureSopCard
                item={item}
                viewMode="list"
                onOpen={() => setSelectedId(item.id)}
                onEdit={() => setSelectedId(item.id)}
                onDuplicate={() => handleDuplicateProcedure(item)}
                onDelete={() => handleDeleteProcedure(item.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PoliciesTab() {
  return <AppointmentPoliciesTab />;
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
  const [sandboxOpen, setSandboxOpen] = useState(false);

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
    ...(isHealthcare ? [
      { key: "procedures" as const, label: "Procedures" },
      { key: "workflows" as const, label: "Workflows" },
      { key: "policies" as const, label: "Policies" },
    ] : []),
    { key: "coach" as const, label: "Recommendation" },
    { key: "logs" as const, label: "Logs" },
    { key: "settings" as const, label: "Settings" },
    { key: "reports" as const, label: "Reports", external: true },
  ] satisfies readonly { key: AgentDetailTab; label: string; external?: boolean }[];

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-background">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 rounded-lg text-sm"
            onClick={() => setSandboxOpen(true)}
          >
            <Play className="size-4" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
            Test agent
          </Button>
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
      ) : activeTab === "procedures" ? (
        <ProceduresTab />
      ) : activeTab === "policies" ? (
        <PoliciesTab />
      ) : activeTab === "coach" ? (
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <AppointmentRecommendationTab />
        </div>
      ) : activeTab === "workflows" ? (
        <div className="flex min-h-0 flex-1 items-center justify-center px-6 pb-6 text-sm text-muted-foreground">
          Workflow canvas is not available in this prototype.
        </div>
      ) : activeTab === "logs" ? (
        <div className="flex min-h-0 flex-1 items-center justify-center px-6 pb-6 text-sm text-muted-foreground">
          Interaction logs are not available in this prototype.
        </div>
      ) : activeTab === "settings" ? (
        <div className="flex min-h-0 flex-1 items-center justify-center px-6 pb-6 text-sm text-muted-foreground">
          Agent settings are not available in this prototype.
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center px-6 pb-6 text-sm text-muted-foreground">
          Reports are opening in a new tab…
        </div>
      )}
      </div>

      <SlidingSidePanel
        side="right"
        open={sandboxOpen}
        widthPx={APPOINTMENT_AGENT_SANDBOX_PANEL_WIDTH}
        innerClassName="border-l border-border bg-background"
      >
        <AppointmentAgentSandboxPanel onClose={() => setSandboxOpen(false)} />
      </SlidingSidePanel>
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
