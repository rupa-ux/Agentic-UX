import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AgentsBuilderView, AGENTS_BUILDER_NORTH_AUTONOMOUS_DISPLAY_NAME } from "@/app/components/AgentsBuilderView.v1";
import { CoachingAgentCanvas } from "@/app/components/reviews/CoachingAgentCanvas";
import { CoachingAgentCanvasV2 } from "@/app/components/reviews/CoachingAgentCanvas.v2";
import { AlertCircle, AlertTriangle, ArrowRight, ArrowUp, ArrowUpRight, Check, ChevronDown, ChevronLeft, Clock, ExternalLink, Filter, Flag, Info, LayoutGrid, List, ListTodo, MessageSquare, Mic, MoreVertical, Pencil, Search, Sparkles, Star, ThumbsDown, X, Zap } from "lucide-react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";
import { AppDataTable } from "@/app/components/ui/AppDataTable";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
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
import { RESPONSE_AGENT_LIBRARY_TEMPLATES } from "@/app/components/reviews/responseAgentLibraryTemplates";
import { ResponseAgentLibraryTemplateCard } from "@/app/components/reviews/ResponseAgentLibraryTemplateCard";

type ResponseAgentStatus = "running" | "paused" | "draft" | "failed";

type ResponseAgentRow = {
  id: string;
  name: string;
  status: ResponseAgentStatus;
  issues: number;
  reviewsResponded: number | null;
  responseRate: number | null;
  averageResponseTimeMinutes: number | null;
  timeSavedMinutes: number | null;
  costSavedUsd: number | null;
  locations: number | null;
};

type LibraryViewMode = "grid" | "list";
type ResponseAgentDetailTab = "outcomes" | "coach" | "logs" | "reports";

type LocationOutcomeRow = {
  id: string;
  location: string;
  reviewsResponded: number;
  responseRate: number;
  averageResponseTimeMinutes: number;
  timeSavedMinutes: number;
  costSavedUsd: number;
};

type FeedbackTagTone = "default";
type FeedbackStatus = "accepted" | "pending review";

type ConfigChangeDiff = {
  changeType: string;
  reason: string;
  diff: {
    removed?: string;
    added: string;
  };
};

type SuggestedTask = {
  taskLabel: string;
  changes: string[];
  deployWarning?: string;
  configChanges?: ConfigChangeDiff[];
};

type FeedbackRow = {
  id: string;
  tags: string[];
  tagTone: FeedbackTagTone;
  description: string;
  suggestedResponse: string;
  suggestedTasks: SuggestedTask[];
  status: FeedbackStatus;
  dateLabel: string;
  dateOrder: number;
  flagReasons?: string[];
  afterCoachingResponse?: string;
  customer: {
    name: string;
    initials: string;
    location: string;
    rating: number;
    reviewDate: string;
    reviewTime: string;
    reviewText: string;
    reviewTags: Array<{ label: string; tone: "negative" | "neutral" }>;
  };
  agentResponse: {
    text: string;
    time: string;
  };
  reviewPostedStatus: "posted" | "escalated";
};

const RESPONSE_AGENT_ROWS: ResponseAgentRow[] = [
  {
    id: "north-autonomous",
    name: AGENTS_BUILDER_NORTH_AUTONOMOUS_DISPLAY_NAME,
    status: "running",
    issues: 0,
    reviewsResponded: 102,
    responseRate: 15,
    averageResponseTimeMinutes: 20,
    timeSavedMinutes: 260,
    costSavedUsd: 2100,
    locations: 500,
  },
  {
    id: "east-autonomous",
    name: "Review response agent replying autonomously - East Region",
    status: "running",
    issues: 0,
    reviewsResponded: 98,
    responseRate: 9,
    averageResponseTimeMinutes: 5,
    timeSavedMinutes: 70,
    costSavedUsd: 1400,
    locations: 250,
  },
  {
    id: "south-autonomous",
    name: "Review response agent replying autonomously - South Region",
    status: "paused",
    issues: 0,
    reviewsResponded: 53,
    responseRate: 9,
    averageResponseTimeMinutes: 10,
    timeSavedMinutes: 45,
    costSavedUsd: 780,
    locations: 200,
  },
  {
    id: "west-autonomous",
    name: "Review response agent replying autonomously - West Region",
    status: "draft",
    issues: 2,
    reviewsResponded: 35,
    responseRate: 8,
    averageResponseTimeMinutes: 2,
    timeSavedMinutes: 200,
    costSavedUsd: 420,
    locations: 100,
  },
  {
    id: "north-template",
    name: "Review response agent replying using templates - North Region",
    status: "failed",
    issues: 1,
    reviewsResponded: 47,
    responseRate: 11,
    averageResponseTimeMinutes: 8,
    timeSavedMinutes: 110,
    costSavedUsd: 560,
    locations: 120,
  },
  {
    id: "south-template",
    name: "Review response agent replying using templates - South Region",
    status: "draft",
    issues: 0,
    reviewsResponded: null,
    responseRate: null,
    averageResponseTimeMinutes: null,
    timeSavedMinutes: null,
    costSavedUsd: null,
    locations: null,
  },
];

const columnHelper = createColumnHelper<ResponseAgentRow>();
const locationColumnHelper = createColumnHelper<LocationOutcomeRow>();
const feedbackColumnHelper = createColumnHelper<FeedbackRow>();

const COACHING_TASK_NODE_MAP: Record<string, string> = {
  "Task 5: Response generation": "north-node-response-generation",
  "Task 4: Review details extraction": "north-node-review-details",
};

function getNodeIdsForFeedbackRow(row: FeedbackRow): string[] {
  return [
    ...new Set(
      row.suggestedTasks
        .map((t) => COACHING_TASK_NODE_MAP[t.taskLabel])
        .filter(Boolean) as string[],
    ),
  ];
}

function getAllCoachingNodeIds(): string[] {
  return [
    ...new Set(
      RESPONSE_AGENT_FEEDBACK_ROWS.flatMap(getNodeIdsForFeedbackRow),
    ),
  ];
}

const RESPONSE_AGENT_FEEDBACK_ROWS: FeedbackRow[] = [
  {
    id: "fb-1",
    tags: ["More empathy", "Improve brand voice"],
    tagTone: "default",
    description:
      "Response felt too generic for a serious complaint — needed direct acknowledgment and a concrete next step.",
    suggestedResponse:
      "We're truly sorry, Marcus — this isn't the experience we want for anyone. Please reach out to us directly so we can make this right for you personally.",
    flagReasons: [
      "Marcus was in physical discomfort — the reply gave no direct acknowledgment of that",
      "Response used generic phrasing (\"we take this seriously\") — off-brand",
      "No concrete next step offered — just a vague \"hope to improve\"",
    ],
    afterCoachingResponse:
      "Hi Marcus, sitting in pain for 30 minutes without anyone checking on you — and then having the procedure rushed without explanation — is not the care you deserved. We're genuinely sorry. Our clinical director will call you directly this week to understand what happened and make it right. Thank you for telling us.",
    suggestedTasks: [
      {
        taskLabel: "Task 5: Response generation",
        changes: ["System prompt update", "Context: add variable"],
        configChanges: [
          {
            changeType: "System prompt update",
            reason:
              "Current system prompt has no persona depth or instruction for distress-level reviews. The LLM defaults to corporate tone regardless of severity.",
            diff: {
              removed:
                "You are a marketing manager specialised in writing responses to customer reviews",
              added:
                "You are a customer experience manager for {Location.brand} who genuinely cares about every patient's experience. You write responses that feel personal and specific — never copy-paste, never corporate. For reviews involving physical pain, long waits, or staff dismissiveness, acknowledge the specific experience directly before moving to resolution.",
            },
          },
          {
            changeType: "Context — add variable",
            reason:
              "Add structured brand voice guidelines so the model stops inventing filler phrases.",
            diff: {
              added:
                "Location.brand_voice_guidelines\n\"Warm but direct. Use first names. Never use: 'we take all reviews seriously', 'at your convenience', 'meet expectations'. Always use specific action language and direct ownership.\"",
            },
          },
        ],
      },
    ],
    status: "pending review",
    dateLabel: "2m ago",
    dateOrder: 4,
    reviewPostedStatus: "posted",
    customer: {
      name: "Marcus Thompson",
      initials: "MT",
      location: "New York City, NY",
      rating: 1,
      reviewDate: "Jan 7, 2023",
      reviewTime: "9:14 AM",
      reviewText:
        "I came in for a root canal and the experience was honestly terrible. The front desk was dismissive when I asked about wait times. I sat in pain for over 30 minutes without anyone checking on me. The procedure itself was rushed and the dentist didn't explain what was happening. I won't be returning.",
      reviewTags: [
        { label: "negative", tone: "negative" },
        { label: "wait time", tone: "neutral" },
        { label: "staff communication", tone: "neutral" },
        { label: "pain", tone: "neutral" },
      ],
    },
    agentResponse: {
      time: "9:22 AM",
      text:
        "Hi Marcus, thank you for your feedback. We're sorry to hear your visit did not meet expectations. We take all reviews seriously and your experience — particularly around wait times and communication — is being reviewed with our team. We'd welcome the chance to speak with you directly and make this right. Please reach out to us at your convenience.",
    },
  },
  {
    id: "fb-2",
    tags: ["Missed context", "Weak follow-up"],
    tagTone: "default",
    description:
      "Reply missed the parking issue entirely — no awareness of why it matters to evening visitors.",
    suggestedResponse:
      "Thank you for the kind words — and you're right to flag the parking. Evening access is a real pain point we're actively working to fix. Your feedback is exactly what helps us prioritize it.",
    flagReasons: [
      "Parking concern mentioned twice — agent response made no reference to it",
      "Generic closing line added no value for a 4-star review",
    ],
    suggestedTasks: [
      {
        taskLabel: "Task 5: Response generation",
        changes: ["Input fields: fix missing outputs"],
        configChanges: [
          {
            changeType: "Input fields — fix missing outputs",
            reason: "The parking issue was extracted by Task 4 but never wired as an input to Task 5 — the response generator had no visibility into it.",
            diff: {
              removed: "inputs: [review_text, brand_voice, location_name]",
              added: "inputs: [review_text, brand_voice, location_name, extracted_issues]",
            },
          },
        ],
      },
      {
        taskLabel: "Task 4: Review details extraction",
        changes: ["User prompt: add extraction rule"],
        deployWarning: "Task 4 must be deployed first",
        configChanges: [
          {
            changeType: "User prompt — add extraction rule",
            reason: "Task 4 had no rule for operational complaints like parking. The extraction now explicitly flags location access issues.",
            diff: {
              added: "If the review mentions parking, access, or location logistics, include these in extracted_issues with issue_type: 'operational'.",
            },
          },
        ],
      },
    ],
    status: "pending review",
    dateLabel: "10 May",
    dateOrder: 3,
    reviewPostedStatus: "posted",
    customer: {
      name: "Sarah Johnson",
      initials: "SJ",
      location: "Atlanta, GA",
      rating: 4,
      reviewDate: "Jan 6, 2023",
      reviewTime: "8:42 AM",
      reviewText:
        "Loved the food and the service was warm and attentive. Only downside is the parking situation in the evening — it's almost impossible to find a spot after 6pm and the side street fills up fast. Would still come back though, the team here is lovely.",
      reviewTags: [
        { label: "positive", tone: "neutral" },
        { label: "parking", tone: "neutral" },
        { label: "service", tone: "neutral" },
      ],
    },
    agentResponse: {
      time: "8:51 AM",
      text:
        "Thank you so much for the kind words, Sarah! We're thrilled you enjoyed the food and service. We hope to welcome you back again soon.",
    },
  },
  {
    id: "fb-3",
    tags: ["Too brief", "No resolution offered"],
    tagTone: "default",
    description:
      "2-star review citing being ignored three times — needed a callback offer, not a vague manager mention.",
    suggestedResponse:
      "We hear you, and we don't want to leave this unresolved. Please contact our team directly and we'll personally follow up to make sure this is fully addressed.",
    flagReasons: [
      "Lost reservation on an anniversary — response gave no acknowledgment of the occasion",
      "45-minute wait with no apology — agent response did not address the specific delay",
      "No concrete resolution or follow-up offered",
    ],
    suggestedTasks: [
      {
        taskLabel: "Task 5: Response generation",
        changes: ["User prompt: add severity role"],
        configChanges: [
          {
            changeType: "User prompt — add severity routing",
            reason: "2-star and 1-star reviews were routed through the same response template as 4-star reviews. High-severity cases now get a more direct, empathetic opening.",
            diff: {
              added: "If review_severity >= 4, open by directly naming the specific incident before moving to resolution. Do not start with a thank-you.",
            },
          },
        ],
      },
      {
        taskLabel: "Task 4: Review details extraction",
        changes: ["System prompt: add severity scoring guide"],
        configChanges: [
          {
            changeType: "System prompt — add severity scoring",
            reason: "Task 4 was not scoring severity consistently — anniversary occasions and reservation failures were not marked as high-severity.",
            diff: {
              added: "Score severity 1–5: 5 = safety or health, 4 = significant service failure (lost reservation, long wait with no acknowledgment), 3 = operational issue, 2 = minor inconvenience, 1 = neutral or positive.",
            },
          },
        ],
      },
    ],
    status: "pending review",
    dateLabel: "10 May",
    dateOrder: 2,
    reviewPostedStatus: "escalated",
    customer: {
      name: "James Williams",
      initials: "JW",
      location: "Stamford, CT",
      rating: 2,
      reviewDate: "Jan 5, 2023",
      reviewTime: "7:30 PM",
      reviewText:
        "Booked a table for our anniversary and the reservation was lost when we arrived. We were told to wait at the bar with no apology and no estimate. Eventually got seated 45 minutes late. The food was fine but the evening was already ruined.",
      reviewTags: [
        { label: "negative", tone: "negative" },
        { label: "reservation", tone: "neutral" },
        { label: "service", tone: "neutral" },
      ],
    },
    agentResponse: {
      time: "7:48 PM",
      text:
        "Hi James, thanks for sharing your feedback. We're sorry your evening did not go as planned.",
    },
  },
  {
    id: "fb-4",
    tags: ["Generic response", "Off-brand tone"],
    tagTone: "default",
    description:
      "Reads like a copy-paste template — no personality, no specific services referenced.",
    suggestedResponse:
      "It means a lot that you chose us — and your experience should have reflected that. We'd love to welcome you back and show you what genuine hospitality looks like here.",
    flagReasons: [
      "Review cited a specific service gap at the door — response ignored it entirely",
      "\"Hope to see you again\" closing is off-brand for this location tier",
    ],
    suggestedTasks: [
      {
        taskLabel: "Task 5: Response generation",
        changes: [
          "Context: add few-shot examples",
          "User prompt: add negative examples",
        ],
        configChanges: [
          {
            changeType: "Context — add few-shot examples",
            reason: "Without examples the model defaulted to a generic acknowledgment template. Brand-specific examples anchor the tone and teach specificity.",
            diff: {
              added: "Example — 3-star hospitality review:\n\"Hi David, the welcome you described doesn't reflect what we stand for here. Thank you for being direct — that kind of feedback is exactly what helps us improve.\"",
            },
          },
          {
            changeType: "User prompt — add negative examples",
            reason: "The model had no guard against corporate filler phrases. Explicit negative examples prevent the copy-paste patterns that undermine trust.",
            diff: {
              added: "Never write: 'Thank you for your feedback', 'We appreciate your review', 'Hope to see you again'. These feel impersonal and signal the response was not written for this person.",
            },
          },
        ],
      },
    ],
    status: "pending review",
    dateLabel: "9 May",
    dateOrder: 1,
    reviewPostedStatus: "posted",
    customer: {
      name: "David Kim",
      initials: "DK",
      location: "Chicago, IL",
      rating: 3,
      reviewDate: "Jan 4, 2023",
      reviewTime: "1:12 PM",
      reviewText:
        "Came here for lunch with a colleague. Food was decent, room was clean, but the welcome at the door felt flat — no warmth, just a quick nod and a menu. For a place at this price point I expected more.",
      reviewTags: [
        { label: "neutral", tone: "neutral" },
        { label: "hospitality", tone: "neutral" },
        { label: "tone", tone: "neutral" },
      ],
    },
    agentResponse: {
      time: "1:30 PM",
      text:
        "Hi David, thank you for your review. We appreciate the feedback and will share it with the team. Hope to see you again.",
    },
  },
];

const RESPONSE_AGENT_LOCATION_OUTCOMES: LocationOutcomeRow[] = [
  {
    id: "atlanta-ga",
    location: "Atlanta, GA",
    reviewsResponded: 19,
    responseRate: 90,
    averageResponseTimeMinutes: 108,
    timeSavedMinutes: 260,
    costSavedUsd: 520,
  },
  {
    id: "stamford-ct",
    location: "Stamford, CT",
    reviewsResponded: 9,
    responseRate: 92,
    averageResponseTimeMinutes: 125,
    timeSavedMinutes: 130,
    costSavedUsd: 310,
  },
  {
    id: "los-angeles-ca",
    location: "Los Angeles, CA",
    reviewsResponded: 22,
    responseRate: 90,
    averageResponseTimeMinutes: 142,
    timeSavedMinutes: 125,
    costSavedUsd: 410,
  },
  {
    id: "new-york-city-ny",
    location: "New York City, NY",
    reviewsResponded: 18,
    responseRate: 90,
    averageResponseTimeMinutes: 130,
    timeSavedMinutes: 160,
    costSavedUsd: 280,
  },
  {
    id: "san-diego-ca",
    location: "San Diego, CA",
    reviewsResponded: 7,
    responseRate: 95,
    averageResponseTimeMinutes: 160,
    timeSavedMinutes: 190,
    costSavedUsd: 140,
  },
  {
    id: "las-vegas-nv",
    location: "Las Vegas, NV",
    reviewsResponded: 3,
    responseRate: 94,
    averageResponseTimeMinutes: 185,
    timeSavedMinutes: 190,
    costSavedUsd: 90,
  },
  {
    id: "chicago-il",
    location: "Chicago, IL",
    reviewsResponded: 10,
    responseRate: 92,
    averageResponseTimeMinutes: 185,
    timeSavedMinutes: 185,
    costSavedUsd: 210,
  },
];

function formatMinutes(minutes: number | null): string {
  if (minutes == null) return "-";
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  if (hours === 0) return `${rem}m`;
  if (rem === 0) return `${hours}h`;
  return `${hours}h ${rem}m`;
}

function formatMoney(amount: number | null): string {
  if (amount == null) return "-";
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${amount}`;
}

function statusBadgeClasses(status: ResponseAgentStatus): string {
  if (status === "running") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "paused") return "bg-amber-50 text-amber-700 border-amber-200";
  if (status === "failed") return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-muted text-muted-foreground border-border";
}

function statusLabel(status: ResponseAgentStatus): string {
  if (status === "running") return "Running";
  if (status === "paused") return "Paused";
  if (status === "failed") return "Failed";
  return "Draft";
}

function feedbackStatusLabel(status: FeedbackStatus): string {
  if (status === "accepted") return "Accepted";
  return "Pending review";
}

function feedbackStatusBadgeClasses(status: FeedbackStatus): string {
  if (status === "accepted") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
}

function feedbackTagClasses(_tone: FeedbackTagTone): string {
  return "rounded-full border border-primary/40 bg-primary/5 text-primary font-normal hover:bg-primary/10";
}

/** Splits "Category — title" coaching change labels for a two-line summary + description layout. */
function splitConfigChangeTitle(changeType: string): { category?: string; title: string } {
  const sep = " — ";
  const i = changeType.indexOf(sep);
  if (i === -1) return { title: changeType };
  return {
    category: changeType.slice(0, i).trim(),
    title: changeType.slice(i + sep.length).trim(),
  };
}

function sentenceCaseLabel(phrase: string): string {
  const t = phrase.trim();
  if (!t) return t;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function ResponseAgentRowActions({ status, onEdit }: { status: ResponseAgentStatus; onEdit: () => void }) {
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
        <DropdownMenuItem className="text-[13px]" onClick={onEdit}>Edit</DropdownMenuItem>
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

function MetricCard({
  title,
  value,
  delta,
  tooltip,
}: {
  title: string;
  value: string;
  delta: string;
  tooltip: string;
}) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-4">
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
            <button type="button" className="flex items-center text-muted-foreground transition-colors hover:text-foreground">
              <Info className="h-4 w-4 shrink-0" strokeWidth={1.6} absoluteStrokeWidth />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[140px] text-left text-balance">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

function GoogleGlyph({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md border border-border bg-card",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-5">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
    </span>
  );
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < value;
        return (
          <Star
            key={i}
            className={cn(
              "size-3.5",
              filled ? "fill-amber-400 text-amber-400" : "text-muted-foreground",
            )}
            strokeWidth={1.6}
            absoluteStrokeWidth
          />
        );
      })}
    </div>
  );
}

type SectionPhase = "idle" | "thinking" | "typing";

function ThinkingDots() {
  return (
    <span
      className="inline-flex items-center gap-1"
      role="status"
      aria-label="Thinking"
    >
      <span className="size-1.5 rounded-full bg-muted-foreground/55 animate-[pulse_1.2s_ease-in-out_infinite] [animation-delay:0ms]" aria-hidden />
      <span className="size-1.5 rounded-full bg-muted-foreground/55 animate-[pulse_1.2s_ease-in-out_infinite] [animation-delay:200ms]" aria-hidden />
      <span className="size-1.5 rounded-full bg-muted-foreground/55 animate-[pulse_1.2s_ease-in-out_infinite] [animation-delay:400ms]" aria-hidden />
    </span>
  );
}

function useTypewriter(text: string, enabled: boolean, charsPerSec = 280) {
  const [shown, setShown] = useState(enabled ? "" : text);

  useEffect(() => {
    if (!enabled) {
      setShown(text);
      return;
    }
    setShown("");
    let i = 0;
    const intervalMs = Math.max(8, Math.floor(1000 / charsPerSec));
    const id = setInterval(() => {
      i = Math.min(i + 1, text.length);
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, intervalMs);
    return () => clearInterval(id);
  }, [text, enabled, charsPerSec]);

  return shown;
}

function TypingText({
  text,
  enabled,
  charsPerSec = 280,
  cursor = true,
}: {
  text: string;
  enabled: boolean;
  charsPerSec?: number;
  cursor?: boolean;
}) {
  const shown = useTypewriter(text, enabled, charsPerSec);
  const isDone = shown === text;
  return (
    <>
      {shown}
      {cursor && enabled && !isDone ? (
        <span
          className="ml-px inline-block h-3 w-[2px] -mb-[1px] align-baseline bg-current opacity-50 animate-[pulse_0.9s_ease-in-out_infinite]"
          aria-hidden
        />
      ) : null}
    </>
  );
}

function TypingListItem({
  text,
  startDelayMs,
  bulletClassName,
}: {
  text: string;
  startDelayMs: number;
  bulletClassName?: string;
}) {
  const [started, setStarted] = useState(false);
  useEffect(() => {
    setStarted(false);
    const t = setTimeout(() => setStarted(true), startDelayMs);
    return () => clearTimeout(t);
  }, [startDelayMs, text]);
  return (
    <li className="flex items-start gap-2 text-[13px] leading-normal text-muted-foreground">
      <span
        className={cn(
          "mt-[7px] size-1.5 shrink-0 rounded-full",
          bulletClassName ?? "bg-muted-foreground/40",
        )}
        aria-hidden
      />
      <span>
        <TypingText text={text} enabled={started} />
      </span>
    </li>
  );
}

function ResponseAgentFeedbackDetailView({
  agent,
  feedbackRows,
  selectedFeedbackId,
  onSelectFeedback,
  onBack,
  onGoToTask,
  onFeedbackAccepted,
}: {
  agent: ResponseAgentRow;
  feedbackRows: FeedbackRow[];
  selectedFeedbackId: string;
  onSelectFeedback: (id: string) => void;
  onBack: () => void;
  onGoToTask?: (nodeId: string) => void;
  onFeedbackAccepted?: (id: string) => void;
}) {
  const selected = feedbackRows.find((row) => row.id === selectedFeedbackId) ?? feedbackRows[0];
  const region = agent.name.split(" - ")[1] ?? "";
  const [conversationOpen, setConversationOpen] = useState(false);
  const [followUp, setFollowUp] = useState("");
  const [followUpsByFeedback, setFollowUpsByFeedback] = useState<Record<string, string[]>>({});
  const followUpMessages = followUpsByFeedback[selected.id] ?? [];

  const [phase1, setPhase1] = useState<SectionPhase>("idle");
  const [phase2, setPhase2] = useState<SectionPhase>("idle");
  const [phase3, setPhase3] = useState<SectionPhase>("idle");
  const [phase4, setPhase4] = useState<SectionPhase>("idle");
  const phaseTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    phaseTimersRef.current.forEach(clearTimeout);
    phaseTimersRef.current = [];
    setPhase1("idle");
    setPhase2("idle");
    setPhase3("idle");
    setPhase4("idle");

    const schedule = (ms: number, fn: () => void) => {
      phaseTimersRef.current.push(setTimeout(fn, ms));
    };

    // Section 1 — What went wrong
    schedule(400, () => setPhase1("thinking"));
    schedule(1000, () => setPhase1("typing"));

    // Section 2 — What I'll change
    schedule(2400, () => setPhase2("thinking"));
    schedule(3000, () => setPhase2("typing"));

    // Section 3 — Reasoning
    schedule(4400, () => setPhase3("thinking"));
    schedule(5000, () => setPhase3("typing"));

    // Section 4 — The improved response (+ Accept card)
    schedule(6400, () => setPhase4("thinking"));
    schedule(7000, () => setPhase4("typing"));

    return () => phaseTimersRef.current.forEach(clearTimeout);
  }, [selected.id]);

  type AcceptScope = "all-feedback" | "future" | "similar";
  type AcceptState =
    | { stage: "choosing"; scope: AcceptScope }
    | { stage: "applied"; scope: AcceptScope };
  const [acceptStateByFeedback, setAcceptStateByFeedback] = useState<
    Record<string, AcceptState>
  >({});
  const acceptState = acceptStateByFeedback[selected.id];
  const scopeLabel = (scope: AcceptScope) =>
    scope === "all-feedback"
      ? "all feedback"
      : scope === "future"
        ? "all future responses"
        : "similar responses";

  const reasoningText = `Cross-referenced the customer's review, the brand voice for ${selected.customer.location}, and similar past replies. The original message was flagged for ${selected.tags.map((t) => t.toLowerCase()).join(", ")}. The revised version below addresses those gaps while keeping the tone aligned with brand guidelines.`;

  const tasksWithConfigChanges = selected.suggestedTasks.filter(
    (t) => t.configChanges && t.configChanges.length > 0,
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex shrink-0 items-center gap-2 px-6 py-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to feedback"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.6} absoluteStrokeWidth />
        </button>
        <span className="text-[15px] text-foreground">
          {agent.name.split(" - ")[0]}
        </span>
        {region ? (
          <>
            <span className="text-muted-foreground">·</span>
            <span className="text-[15px] text-muted-foreground">{region}</span>
          </>
        ) : null}
        <Badge
          variant="outline"
          className={cn("ml-2 capitalize", statusBadgeClasses(agent.status))}
        >
          {statusLabel(agent.status)}
        </Badge>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[360px] shrink-0 flex-col border-r border-border">
          <div className="flex shrink-0 items-center gap-2 px-6 py-2">
            <ThumbsDown
              className="size-4 text-muted-foreground"
              strokeWidth={1.6}
              absoluteStrokeWidth
              aria-hidden
            />
            <span className="text-[13px] text-muted-foreground">
              {feedbackRows.length} negative feedback
            </span>
          </div>
          <ul className="min-h-0 flex-1 overflow-y-auto">
            {feedbackRows.map((row) => {
              const isActive = row.id === selected.id;
              const rowStatus = acceptStateByFeedback[row.id] ? "accepted" : row.status;
              return (
                <li key={row.id} className="border-t border-border first:border-t-0">
                  <button
                    type="button"
                    onClick={() => onSelectFeedback(row.id)}
                    className={cn(
                      "flex w-full flex-col gap-2 px-6 py-4 text-left transition-colors",
                      isActive ? "bg-primary/5" : "hover:bg-muted/40",
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-1">
                      {row.tags.map((tag) => (
                        <Badge key={tag} className={feedbackTagClasses(row.tagTone)}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-[13px] leading-normal text-muted-foreground line-clamp-2">
                      {row.description}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn("self-start", feedbackStatusBadgeClasses(rowStatus))}
                    >
                      {feedbackStatusLabel(rowStatus)}
                    </Badge>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="flex flex-col gap-4 px-10 py-8">

              {/* Original agent response */}
              <div className="overflow-hidden rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex size-7 items-center justify-center rounded-md bg-amber-50"
                      aria-hidden
                    >
                      <Flag
                        className="size-4 text-amber-600"
                        strokeWidth={1.6}
                        absoluteStrokeWidth
                      />
                    </div>
                    <span className="text-[13px] text-foreground">
                      Original agent response
                    </span>
                  </div>
                  <Badge className="border-0 bg-destructive/10 text-destructive hover:bg-destructive/15">
                    Flagged
                  </Badge>
                </div>
                <div className="flex flex-col gap-2 border-t border-border px-4 py-4">
                  <p className="text-[13px] leading-normal text-muted-foreground">
                    {selected.agentResponse.text}
                  </p>
                  <span className="text-[12px] text-muted-foreground">
                    {selected.dateLabel}
                  </span>
                </div>
                <div className="border-t border-border px-4 py-2">
                  <button
                    type="button"
                    onClick={() => setConversationOpen((v) => !v)}
                    className="text-[13px] text-primary underline-offset-4 hover:underline"
                  >
                    {conversationOpen ? "Hide review" : "View review"}
                  </button>
                </div>
                {conversationOpen ? (
                  <div className="border-t border-border bg-muted/30 px-4 py-4">
                    <div className="flex gap-2">
                      <div
                        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-[12px] text-muted-foreground"
                        aria-hidden
                      >
                        {selected.customer.initials}
                      </div>
                      <div className="min-w-0 flex-1 overflow-hidden rounded-lg border border-border bg-card">
                        <div className="flex items-center gap-2 px-4 py-2">
                          <GoogleGlyph className="size-8" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] text-foreground">
                              {selected.customer.name}
                            </p>
                            <StarRating value={selected.customer.rating} />
                          </div>
                          <span className="shrink-0 text-[12px] text-muted-foreground">
                            {selected.customer.reviewDate}
                          </span>
                        </div>
                        <div className="px-4 pb-2">
                          <p className="text-[13px] leading-normal text-muted-foreground">
                            {selected.customer.reviewText}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1 px-4 pb-4">
                          {selected.customer.reviewTags.map((tag) => (
                            <Badge
                              key={tag.label}
                              variant="outline"
                              className={cn(
                                "border-0",
                                tag.tone === "negative"
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              {tag.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Rupa D's feedback bubble */}
              <div className="flex justify-end">
                <div className="flex max-w-[80%] flex-col items-end gap-1">
                  <div className="rounded-lg bg-primary/10 px-4 py-2">
                    <p className="text-[13px] leading-normal text-foreground">
                      {selected.description}
                    </p>
                  </div>
                  <span className="text-[12px] italic text-muted-foreground">
                    Rupa D · {selected.dateLabel}
                  </span>
                </div>
              </div>

              {/* What went wrong — phase 1 */}
              {phase1 !== "idle" && selected.flagReasons && selected.flagReasons.length > 0 ? (
                <div className="flex flex-col gap-3 pt-8">
                  <div className="flex items-center gap-2 px-1">
                    <AlertCircle
                      className="size-4 text-destructive"
                      strokeWidth={1.6}
                      absoluteStrokeWidth
                      aria-hidden
                    />
                    <span className="text-[13px] text-foreground">What went wrong</span>
                  </div>
                  {phase1 === "thinking" ? (
                    <div className="px-1">
                      <ThinkingDots />
                    </div>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {selected.flagReasons.map((reason, i) => (
                        <TypingListItem
                          key={`${selected.id}-flag-${i}`}
                          text={reason}
                          startDelayMs={i * 350}
                          bulletClassName="bg-destructive/50"
                        />
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}

              {/* What I'll change — phase 2 */}
              {phase2 !== "idle" && tasksWithConfigChanges.length > 0 ? (
                <div className="flex flex-col gap-3 pt-8">
                  <div className="flex items-center gap-2 px-1">
                    <Pencil
                      className="size-4 text-muted-foreground"
                      strokeWidth={1.6}
                      absoluteStrokeWidth
                      aria-hidden
                    />
                    <span className="text-[13px] text-foreground">What I'll change</span>
                  </div>
                  {phase2 === "thinking" ? (
                    <div className="px-1">
                      <ThinkingDots />
                    </div>
                  ) : (
                    tasksWithConfigChanges.map((task, ti) => (
                      <div key={ti} className="flex flex-col gap-3">
                        {task.configChanges!.map((cc, ci) => {
                          const { category, title } = splitConfigChangeTitle(cc.changeType);
                          return (
                          <div key={ci} className="overflow-hidden rounded-lg border border-border bg-card">
                            <div className="flex flex-col gap-2 px-4 py-3">
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <span className="inline-flex min-w-0 flex-wrap items-center gap-1">
                                  <ListTodo
                                    className="size-[15px] shrink-0 text-[#00897B]"
                                    strokeWidth={1.6}
                                    absoluteStrokeWidth
                                    aria-hidden
                                  />
                                  <span className="text-[12px] leading-[19px] tracking-[-0.22px] text-[#8f8f8f]">
                                    Task
                                  </span>
                                  <span className="text-[12px] leading-[19px] text-[#8f8f8f] opacity-40" aria-hidden>
                                    ·
                                  </span>
                                  <span className="text-[12px] leading-[19px] tracking-[-0.22px] text-[#212121]">
                                    {task.taskLabel.replace(/^Task \d+: /, "")}
                                  </span>
                                </span>
                                {onGoToTask && COACHING_TASK_NODE_MAP[task.taskLabel] ? (
                                  <button
                                    type="button"
                                    onClick={() => onGoToTask(COACHING_TASK_NODE_MAP[task.taskLabel])}
                                    className="inline-flex shrink-0 items-center gap-1 text-[12px] text-primary underline-offset-4 hover:underline"
                                  >
                                    Open in builder
                                    <ArrowUpRight className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
                                  </button>
                                ) : null}
                              </div>
                              <div className="flex flex-col gap-1">
                                {category?.toLowerCase() === "context" ? (
                                  <>
                                    <p className="text-[12px] leading-[18px] font-medium text-foreground">
                                      Context: {sentenceCaseLabel(title)}
                                    </p>
                                    <p className="text-[12px] leading-normal text-muted-foreground">
                                      <TypingText text={cc.reason} enabled charsPerSec={400} />
                                    </p>
                                  </>
                                ) : !category && /system prompt/i.test(cc.changeType) ? (
                                  <>
                                    <p className="text-[12px] leading-[18px] font-medium text-foreground">
                                      {sentenceCaseLabel(cc.changeType)}
                                    </p>
                                    <p className="text-[12px] leading-normal text-muted-foreground">
                                      <TypingText text={cc.reason} enabled charsPerSec={400} />
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    {category ? (
                                      <span className="text-[12px] leading-[18px] text-muted-foreground">
                                        {sentenceCaseLabel(category)}
                                      </span>
                                    ) : null}
                                    <p className="text-[13px] font-medium leading-normal text-foreground">
                                      {sentenceCaseLabel(title)}
                                    </p>
                                    <p className="text-[13px] leading-normal text-muted-foreground">
                                      <TypingText text={cc.reason} enabled charsPerSec={400} />
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 border-t border-border bg-muted/30 px-4 py-3 font-mono text-[12px] leading-relaxed">
                              {cc.diff.removed ? (
                                <div className="rounded bg-destructive/10 px-3 py-2 text-destructive">
                                  {cc.diff.removed.split("\n").map((line, li) => (
                                    <div key={li}>− {line}</div>
                                  ))}
                                </div>
                              ) : null}
                              <div className="rounded bg-emerald-50 px-3 py-2 text-emerald-700">
                                {cc.diff.added.split("\n").map((line, li) => (
                                  <div key={li}>+ {line}</div>
                                ))}
                              </div>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>
              ) : null}

              {/* Reasoning — phase 3 */}
              {phase3 !== "idle" ? (
                <div className="flex flex-col gap-2 px-1 pt-8">
                  <div className="flex items-center gap-2">
                    <Zap
                      className="size-4 text-amber-500"
                      strokeWidth={1.6}
                      absoluteStrokeWidth
                      aria-hidden
                    />
                    <span className="text-[13px] text-foreground">Reasoning</span>
                  </div>
                  {phase3 === "thinking" ? (
                    <ThinkingDots />
                  ) : (
                    <p className="text-[13px] leading-normal text-muted-foreground">
                      <TypingText text={reasoningText} enabled charsPerSec={320} />
                    </p>
                  )}
                </div>
              ) : null}

              {/* The improved response — phase 4 */}
              {phase4 !== "idle" ? (
                <div className="flex flex-col gap-3 pt-8">
                  <div className="flex items-center gap-2 px-1">
                    <MessageSquare
                      className="size-4 text-muted-foreground"
                      strokeWidth={1.6}
                      absoluteStrokeWidth
                      aria-hidden
                    />
                    <span className="text-[13px] text-foreground">The improved response</span>
                  </div>
                  {phase4 === "thinking" ? (
                    <div className="px-1">
                      <ThinkingDots />
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-lg border border-border bg-card">
                      <div className="px-4 py-4">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="size-2 shrink-0 rounded-full bg-destructive" aria-hidden />
                          <span className="text-[13px] text-foreground">Original agent response</span>
                        </div>
                        <p className="text-[13px] leading-normal text-muted-foreground">
                          {selected.agentResponse.text}
                        </p>
                      </div>
                      <div className="border-t border-emerald-200 bg-emerald-50/60 px-4 py-4">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="size-2 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                          <span className="text-[13px] text-foreground">After coaching</span>
                        </div>
                        <p className="text-[13px] leading-normal text-muted-foreground">
                          <TypingText
                            text={selected.suggestedResponse}
                            enabled
                            charsPerSec={300}
                          />
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Accept this coaching — v2 flow */}
              {phase4 === "typing" ? (
                <div className="flex flex-col gap-3 pt-8">
                {!acceptState ? (
                  /* Step 1 — accept card (v2 style) */
                  <div className="overflow-hidden rounded-lg border border-border bg-card">
                    <div className="flex items-start gap-3 px-5 py-4">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Sparkles className="size-4 text-primary" strokeWidth={1.6} absoluteStrokeWidth />
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="text-[14px] font-semibold text-foreground">Accept this coaching</span>
                        <p className="text-[13px] leading-snug text-muted-foreground">
                          Apply these changes to update the agent&apos;s configuration and improve future responses.
                        </p>
                        <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">
                          Want to test the changes? Paste in a review below and I&apos;ll show you how the agent responds now.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 px-5 pb-4">
                      <Button type="button" variant="outline" size="sm" className="gap-1.5">
                        <X className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
                        Dismiss
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        className="gap-1.5"
                        onClick={() =>
                          setAcceptStateByFeedback((prev) => ({
                            ...prev,
                            [selected.id]: { stage: "choosing", scope: "future" },
                          }))
                        }
                      >
                        <Check className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
                        Accept changes
                      </Button>
                    </div>
                  </div>
                ) : acceptState.stage === "choosing" ? (
                  /* Step 2 — scope cards, click to apply immediately */
                  <div className="flex flex-col gap-2">
                    <p className="text-[13px] text-muted-foreground">Where should these changes take effect?</p>
                    {([
                      { id: "all-feedback" as AcceptScope, title: "All feedback", description: "Apply to all flagged responses and any backlog waiting for a reply." },
                      { id: "future" as AcceptScope, title: "All future responses", description: "Only new reviews from today — doesn't touch anything already sent." },
                      { id: "similar" as AcceptScope, title: "Only similar responses", description: "Reviews flagged for tone or action gaps, like these." },
                    ]).map((opt) => {
                      const active = acceptState.scope === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setAcceptStateByFeedback((prev) => ({
                              ...prev,
                              [selected.id]: { stage: "applied", scope: opt.id },
                            }));
                            onFeedbackAccepted?.(selected.id);
                            toast(`Agent updated — coaching applied to ${opt.title.toLowerCase()}.`, {
                              description: "Changes are live. Future responses will reflect the new rules.",
                              icon: (
                                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                                  <Check className="size-3 text-emerald-600" strokeWidth={2.5} absoluteStrokeWidth />
                                </span>
                              ),
                            });
                            setTimeout(() => onBack(), 1200);
                          }}
                          className={cn(
                            "flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                            active ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/50",
                          )}
                        >
                          <span className={cn("mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors", active ? "border-primary bg-primary" : "border-muted-foreground/40")}>
                            {active && <span className="size-1.5 rounded-full bg-white" />}
                          </span>
                          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <span className={cn("text-[13px] font-medium", active ? "text-primary" : "text-foreground")}>{opt.title}</span>
                            <span className="text-[12px] leading-relaxed text-muted-foreground">{opt.description}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* Step 3 — applied confirmation */
                  <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                      <Check className="size-4 text-emerald-600" strokeWidth={2} absoluteStrokeWidth />
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[14px] font-semibold text-emerald-900">Coaching applied</p>
                      <p className="text-[12px] text-emerald-700">Applied to {scopeLabel(acceptState.scope)}. Agent is up to date.</p>
                    </div>
                  </div>
                )}
                </div>
              ) : null}

              {followUpMessages.map((msg, idx) => (
                <div key={idx} className="flex justify-end">
                  <div className="flex max-w-[80%] flex-col items-end gap-1">
                    <div className="rounded-lg bg-primary/10 px-4 py-2">
                      <p className="text-[13px] leading-normal text-foreground">
                        {msg}
                      </p>
                    </div>
                    <span className="text-[12px] italic text-muted-foreground">
                      Rupa D · just now
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="shrink-0 px-10 pb-6 pt-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const trimmed = followUp.trim();
                if (!trimmed) return;
                setFollowUpsByFeedback((prev) => ({
                  ...prev,
                  [selected.id]: [...(prev[selected.id] ?? []), trimmed],
                }));
                setFollowUp("");
              }}
              className="flex flex-col gap-2 rounded-xl border border-border bg-card px-4 py-3 transition-shadow focus-within:shadow-sm"
            >
                <textarea
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  placeholder="Follow-up with additional improvements"
                  rows={3}
                  className="w-full resize-none border-0 bg-transparent text-[13px] leading-normal text-foreground outline-none placeholder:text-muted-foreground"
                />
              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  aria-label="Voice input"
                  className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Mic className="size-4" strokeWidth={1.6} absoluteStrokeWidth />
                </button>
                <button
                  type="submit"
                  aria-label="Send"
                  disabled={!followUp.trim()}
                  className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-foreground transition-opacity hover:bg-muted/80 disabled:opacity-50"
                >
                  <ArrowUp
                    className="size-4"
                    strokeWidth={1.6}
                    absoluteStrokeWidth
                  />
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

function ResponseAgentDetailPage({
  agent,
  columnSheetOpen,
  onColumnSheetOpenChange,
  onBack,
  onEdit,
  onCoachAgent,
  initialFeedbackId,
  initialTab,
  acceptedFeedbackIds,
  onFeedbackAccepted,
}: {
  agent: ResponseAgentRow;
  columnSheetOpen: boolean;
  onColumnSheetOpenChange: (open: boolean) => void;
  onBack: () => void;
  onEdit: () => void;
  onCoachAgent: (highlightNodeIds: string[], initialSelectedNodeId?: string, version?: 1 | 2) => void;
  initialFeedbackId?: string;
  initialTab?: ResponseAgentDetailTab;
  acceptedFeedbackIds?: Set<string>;
  onFeedbackAccepted?: (id: string) => void;
}) {
  const [activeDetailTab, setActiveDetailTab] = useState<ResponseAgentDetailTab>(initialTab ?? (initialFeedbackId ? "coach" : "outcomes"));
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(initialFeedbackId ?? null);
  const flaggedFeedbackCount = RESPONSE_AGENT_FEEDBACK_ROWS.length;

  useEffect(() => {
    if (initialTab) setActiveDetailTab(initialTab);
  }, [initialTab]);

  const columns = useMemo<ColumnDef<LocationOutcomeRow, unknown>[]>(() => [
    locationColumnHelper.accessor("location", {
      id: "location",
      header: "Location",
      size: 280,
      meta: { settingsLabel: "Location" },
      cell: (info) => <span className="text-foreground">{info.getValue()}</span>,
    }),
    locationColumnHelper.accessor("reviewsResponded", {
      id: "reviewsResponded",
      header: "Reviews responded",
      size: 180,
      meta: { settingsLabel: "Reviews responded" },
      sortingFn: "alphanumeric",
      cell: (info) => <span className="tabular-nums text-foreground">{info.getValue()}</span>,
    }),
    locationColumnHelper.accessor("responseRate", {
      id: "responseRate",
      header: "Response rate",
      size: 164,
      meta: { settingsLabel: "Response rate" },
      cell: (info) => <span className="tabular-nums text-foreground">{info.getValue()}%</span>,
    }),
    locationColumnHelper.accessor("averageResponseTimeMinutes", {
      id: "avgResponseTime",
      header: "Average response time",
      size: 200,
      meta: { settingsLabel: "Average response time" },
      cell: (info) => <span className="tabular-nums text-foreground">{formatMinutes(info.getValue())}</span>,
    }),
    locationColumnHelper.accessor("timeSavedMinutes", {
      id: "timeSaved",
      header: "Time saved",
      size: 164,
      meta: { settingsLabel: "Time saved" },
      cell: (info) => <span className="tabular-nums text-foreground">{formatMinutes(info.getValue())}</span>,
    }),
    locationColumnHelper.accessor("costSavedUsd", {
      id: "costSaved",
      header: "Cost saved",
      size: 144,
      meta: { settingsLabel: "Cost saved" },
      cell: (info) => <span className="tabular-nums text-foreground">{formatMoney(info.getValue())}</span>,
    }),
  ], []);

  const feedbackColumns = useMemo<ColumnDef<FeedbackRow, unknown>[]>(() => [
    feedbackColumnHelper.display({
      id: "review",
      header: "Review",
      minSize: 240,
      meta: { settingsLabel: "Review", sizeWeight: 4, cellClassName: "align-top" },
      cell: (info) => {
        const row = info.row.original;
        const { customer } = row;
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium leading-snug text-foreground">
                {customer.name}
              </span>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "size-3 shrink-0",
                      i < customer.rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted",
                    )}
                    strokeWidth={0}
                  />
                ))}
              </div>
            </div>
            <p className="text-[12px] leading-relaxed text-muted-foreground line-clamp-3">
              {customer.reviewText}
            </p>
          </div>
        );
      },
    }),
    feedbackColumnHelper.display({
      id: "feedbackReason",
      header: "Feedback reason",
      minSize: 280,
      meta: { settingsLabel: "Feedback reason", sizeWeight: 4, cellClassName: "align-top" },
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-1">
              {row.tags.map((tag) => (
                <Badge key={tag} className={feedbackTagClasses(row.tagTone)}>
                  {tag}
                </Badge>
              ))}
            </div>
            <p className="text-[13px] leading-relaxed text-muted-foreground line-clamp-3">
              {row.description}
            </p>
          </div>
        );
      },
    }),
    feedbackColumnHelper.display({
      id: "suggestedChanges",
      header: "Suggested changes",
      minSize: 280,
      meta: { settingsLabel: "Suggested changes", sizeWeight: 5, cellClassName: "align-top" },
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="flex flex-col gap-4">
            {row.suggestedTasks.map((task, taskIdx) => (
              <div key={taskIdx} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <ListTodo className="size-[13px] shrink-0 text-[#00897B]" strokeWidth={1.6} absoluteStrokeWidth />
                  <span className="text-[12px] font-semibold leading-snug text-foreground">
                    {task.taskLabel}
                  </span>
                </div>
                <ul className="flex flex-col gap-1 pl-1">
                  {task.changes.map((change, changeIdx) => (
                    <li
                      key={changeIdx}
                      className="flex items-start gap-1.5 text-[12px] leading-relaxed text-muted-foreground"
                    >
                      <span
                        className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/40"
                        aria-hidden
                      />
                      {change}
                    </li>
                  ))}
                </ul>
                {task.deployWarning ? (
                  <div className="flex items-center gap-1 pt-0.5 text-[11px] leading-normal text-amber-700">
                    <AlertTriangle
                      className="size-3 shrink-0"
                      strokeWidth={1.6}
                      absoluteStrokeWidth
                      aria-hidden
                    />
                    <span>{task.deployWarning}</span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        );
      },
    }),
    feedbackColumnHelper.accessor("status", {
      id: "status",
      header: "Status",
      minSize: 140,
      meta: { settingsLabel: "Status", sizeWeight: 0.5 },
      cell: (info) => {
        const rowId = info.row.original.id;
        if (acceptedFeedbackIds?.has(rowId)) {
          return (
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
              Coaching applied
            </Badge>
          );
        }
        const v = info.getValue();
        return (
          <Badge variant="outline" className={feedbackStatusBadgeClasses(v)}>
            {feedbackStatusLabel(v)}
          </Badge>
        );
      },
    }),
    feedbackColumnHelper.accessor("dateOrder", {
      id: "date",
      header: "Date",
      minSize: 96,
      enableResizing: false,
      sortingFn: "alphanumeric",
      meta: { settingsLabel: "Date", sizeWeight: 0.3 },
      cell: (info) => (
        <span className="text-[13px] text-muted-foreground">
          {info.row.original.dateLabel}
        </span>
      ),
    }),
    feedbackColumnHelper.display({
      id: "rowAction",
      header: "",
      size: 160,
      enableSorting: false,
      enableResizing: false,
      meta: { settingsLabel: "Action", stopRowClick: true, sizeWeight: 0 },
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="flex w-full items-center justify-end pr-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFeedbackId(row.id);
              }}
              className="inline-flex items-center gap-1 text-[13px] text-primary underline-offset-4 opacity-0 transition-opacity group-hover/table-row:opacity-100 hover:underline"
            >
              Review changes
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} absoluteStrokeWidth />
            </button>
          </div>
        );
      },
    }),
  ], [acceptedFeedbackIds]);


  if (selectedFeedbackId) {
    return (
      <ResponseAgentFeedbackDetailView
        agent={agent}
        feedbackRows={RESPONSE_AGENT_FEEDBACK_ROWS}
        selectedFeedbackId={selectedFeedbackId}
        onSelectFeedback={setSelectedFeedbackId}
        onBack={() => setSelectedFeedbackId(null)}
        onGoToTask={(nodeId) => onCoachAgent([nodeId], nodeId)}
        onFeedbackAccepted={onFeedbackAccepted}
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <MainCanvasViewHeader
        title={(
          <span className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to response agents"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.6} absoluteStrokeWidth />
            </button>
            <span className="min-w-0 truncate">{agent.name}</span>
            <Badge variant="outline" className={cn("capitalize", statusBadgeClasses(agent.status))}>
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
              <DropdownMenuItem className="text-[13px]" onClick={onEdit}>Edit</DropdownMenuItem>
              {agent.status === "running" ? <DropdownMenuItem className="text-[13px]">Pause</DropdownMenuItem> : null}
              <DropdownMenuItem className="text-[13px]">Duplicate</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-[13px] text-destructive focus:text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      <div className="shrink-0 px-6 pb-6">
        <div className="inline-flex items-center border-b border-border">
          {(
            [
              { key: "outcomes", label: "Outcomes" },
              { key: "coach", label: "Coach" },
              { key: "logs", label: "Logs" },
              { key: "reports", label: "Reports", external: true },
            ] as const satisfies readonly {
              key: ResponseAgentDetailTab;
              label: string;
              tooltip?: string;
              external?: boolean;
            }[]
          ).map((tab) => {
            const isActive = tab.key === activeDetailTab;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveDetailTab(tab.key)}
                className={cn(
                  "relative flex items-center gap-1 px-4 py-2 text-sm",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
                {tab.tooltip ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex text-muted-foreground">
                        <Info className="h-3 w-3 opacity-70" strokeWidth={1.6} absoluteStrokeWidth />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[240px] text-left text-balance">
                      {tab.tooltip}
                    </TooltipContent>
                  </Tooltip>
                ) : null}
                {tab.external ? (
                  <ExternalLink className="h-3 w-3 opacity-70" strokeWidth={1.6} absoluteStrokeWidth />
                ) : null}
                {isActive ? <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary" aria-hidden /> : null}
              </button>
            );
          })}
        </div>
      </div>

      {activeDetailTab === "outcomes" ? (
        <>
          <div className="shrink-0 px-6 pb-4 pt-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
              <MetricCard
                title="Reviews responded"
                value="120"
                delta="+1.3%"
                tooltip="Total review replies posted by this response agent in the selected period."
              />
              <MetricCard
                title="Response rate"
                value="82%"
                delta="+1.3%"
                tooltip="Share of incoming reviews this agent responded to."
              />
              <MetricCard
                title="Average response time"
                value="20m"
                delta="+1.3%"
                tooltip="Mean time taken by this agent to publish a response after review arrival."
              />
              <MetricCard
                title="Time saved"
                value="2h 20m"
                delta="+1.3%"
                tooltip="Estimated manual effort saved by this response agent."
              />
              <MetricCard
                title="Cost saved"
                value="$1.8K"
                delta="+2.1%"
                tooltip="Estimated spend avoided by using this response agent."
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 px-6 pb-6">
            <AppDataTable<LocationOutcomeRow>
              tableId={`reviews.response-agent-detail.${agent.id}`}
              data={RESPONSE_AGENT_LOCATION_OUTCOMES}
              columns={columns}
              initialSorting={[{ id: "location", desc: false }]}
              getRowId={(row) => row.id}
              className="h-full min-h-0 px-0"
              columnSheetTitle="Location outcome columns"
              hideColumnsButton
              columnSheetOpen={columnSheetOpen}
              onColumnSheetOpenChange={onColumnSheetOpenChange}
              stickyFirstColumn={false}
              rowDensity="default"
            />
          </div>
        </>
      ) : activeDetailTab === "coach" ? (
        <>
          <div className="shrink-0 px-6 pb-4">
            <div
              className="flex flex-col gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2 sm:flex-row sm:items-center sm:justify-between"
              role="status"
            >
              <div className="flex min-w-0 items-center gap-2">
                <ThumbsDown
                  className="size-3.5 shrink-0 text-destructive"
                  strokeWidth={1.6}
                  absoluteStrokeWidth
                  aria-hidden
                />
                <p className="text-[13px] leading-normal text-destructive">
                  {flaggedFeedbackCount} responses flagged for improvement
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex shrink-0 items-center gap-1 cursor-pointer text-[13px] text-primary underline-offset-4 transition-colors hover:text-primary/90 hover:underline"
                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).click()}
                  >
                    Coach agent
                    <ArrowRight className="h-3 w-3" strokeWidth={1.6} absoluteStrokeWidth />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-lg">
                  <DropdownMenuItem
                    className="text-[13px]"
                    onClick={() => onCoachAgent(getAllCoachingNodeIds(), undefined, 1)}
                  >
                    Version 1 🤔
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-[13px]"
                    onClick={() => onCoachAgent(getAllCoachingNodeIds(), undefined, 2)}
                  >
                    <span className="flex items-center gap-2">
                      Version 2
                      <span
                        className="inline-flex size-4 shrink-0 items-center justify-center rounded-[2px] bg-emerald-600"
                        aria-hidden
                      >
                        <Check className="size-[10px] text-white" strokeWidth={1.6} absoluteStrokeWidth />
                      </span>
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="min-h-0 flex-1 px-6 pb-6">
            <AppDataTable<FeedbackRow>
              tableId={`reviews.response-agent-detail.feedback.v5.${agent.id}`}
              data={RESPONSE_AGENT_FEEDBACK_ROWS}
              columns={feedbackColumns}
              initialSorting={[{ id: "date", desc: true }]}
              getRowId={(row) => row.id}
              className="h-full min-h-0 px-0"
              columnSheetTitle="Coach columns"
              hideColumnsButton
              columnSheetOpen={columnSheetOpen}
              onColumnSheetOpenChange={onColumnSheetOpenChange}
              stickyFirstColumn={false}
              rowDensity="medium"
            />
          </div>
        </>
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center px-6 pb-6 text-sm text-muted-foreground">
          No data available for this tab yet.
        </div>
      )}
    </div>
  );
}

export function ReviewsResponseAgentsPage({
  onCreateAgent,
  onEditAgent,
  onBuilderModeChange,
  initialAgentId,
  initialFeedbackId,
}: {
  onCreateAgent?: () => void;
  onEditAgent?: (agentName: string) => void;
  onBuilderModeChange?: (active: boolean) => void;
  initialAgentId?: string;
  initialFeedbackId?: string;
} = {}) {
  const [activeTab, setActiveTab] = useState<"agents" | "library">("agents");
  const [libraryViewMode, setLibraryViewMode] = useState<LibraryViewMode>("grid");
  const [columnSheetOpen, setColumnSheetOpen] = useState(false);
  const [detailColumnSheetOpen, setDetailColumnSheetOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<ResponseAgentRow | null>(
    initialAgentId ? (RESPONSE_AGENT_ROWS.find((r) => r.id === initialAgentId) ?? null) : null,
  );
  const [editingAgent, setEditingAgent] = useState<ResponseAgentRow | null>(null);
  const [coachingHighlightNodeIds, setCoachingHighlightNodeIds] = useState<string[]>([]);
  const [coachingInitialNodeId, setCoachingInitialNodeId] = useState<string | undefined>(undefined);
  const [coachingVersion, setCoachingVersion] = useState<1 | 2>(1);
  const [coachingCompleted, setCoachingCompleted] = useState(false);
  const [acceptedFeedbackIds, setAcceptedFeedbackIds] = useState<Set<string>>(new Set());

  const columns = useMemo<ColumnDef<ResponseAgentRow, unknown>[]>(() => [
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
      size: 164,
      meta: { settingsLabel: "Status" },
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="inline-flex items-center gap-2">
            <Badge variant="outline" className={cn("capitalize", statusBadgeClasses(info.getValue()))}>
              {statusLabel(info.getValue())}
            </Badge>
            {row.issues > 0 ? (
              <span className="text-xs text-muted-foreground">
                {row.issues} {row.issues === 1 ? "issue" : "issues"}
              </span>
            ) : null}
          </div>
        );
      },
    }),
    columnHelper.accessor("reviewsResponded", {
      id: "reviewsResponded",
      header: "Reviews responded",
      size: 164,
      meta: { settingsLabel: "Reviews responded" },
      sortingFn: "alphanumeric",
      cell: (info) => (
        <span className="tabular-nums text-foreground">
          {info.getValue() == null ? "-" : info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("responseRate", {
      id: "responseRate",
      header: "Response rate",
      size: 164,
      meta: { settingsLabel: "Response rate" },
      cell: (info) => (
        <span className="tabular-nums text-foreground">
          {info.getValue() == null ? "-" : `${info.getValue()}%`}
        </span>
      ),
    }),
    columnHelper.accessor("averageResponseTimeMinutes", {
      id: "avgResponseTime",
      header: "Average response time",
      size: 164,
      meta: { settingsLabel: "Average response time" },
      cell: (info) => (
        <span className="tabular-nums text-foreground">
          {formatMinutes(info.getValue())}
        </span>
      ),
    }),
    columnHelper.accessor("timeSavedMinutes", {
      id: "timeSaved",
      header: "Time saved",
      size: 164,
      meta: { settingsLabel: "Time saved" },
      cell: (info) => (
        <span className="tabular-nums text-foreground">
          {formatMinutes(info.getValue())}
        </span>
      ),
    }),
    columnHelper.accessor("costSavedUsd", {
      id: "costSaved",
      header: "Cost saved",
      size: 164,
      meta: { settingsLabel: "Cost saved" },
      cell: (info) => (
        <span className="tabular-nums text-foreground">
          {formatMoney(info.getValue())}
        </span>
      ),
    }),
    columnHelper.accessor("locations", {
      id: "locations",
      header: "Locations",
      size: 164,
      enableResizing: false,
      meta: { settingsLabel: "Locations" },
      cell: (info) => (
        <span className="tabular-nums text-foreground">
          {info.getValue() == null ? "-" : info.getValue()}
        </span>
      ),
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
          <ResponseAgentRowActions
            status={info.row.original.status}
            onEdit={() => onEditAgent ? onEditAgent(info.row.original.name) : setEditingAgent(info.row.original)}
          />
        </div>
      ),
    }),
  ], []);

  const headerActions = activeTab === "library" ? (
    <div className="flex items-center gap-4">
      <Button type="button" variant="outline" size="icon" aria-label="Search agent library">
        <Search className="h-[14px] w-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
      </Button>
      <SegmentedToggle<LibraryViewMode>
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
      <Button type="button" variant="outline" size="icon">
        <Search className="h-[14px] w-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
      </Button>
      <Button type="button" className="h-9 rounded-lg text-sm" onClick={() => onCreateAgent ? onCreateAgent() : setEditingAgent({ id: 'new', name: 'New agent', status: 'draft', issues: 0, reviewsResponded: null, responseRate: null, averageResponseTimeMinutes: null, timeSavedMinutes: null, costSavedUsd: null, locations: null } as ResponseAgentRow)}>Create agent</Button>
      <Button type="button" variant="outline" size="icon">
        <Filter className="h-[14px] w-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
      </Button>
    </div>
  );

  if (editingAgent) {
    const handleCoachingBack = (completed = false) => {
      const wasV1 = coachingVersion === 1;
      if (!wasV1 && completed) {
        setCoachingCompleted(true);
        setAcceptedFeedbackIds(new Set(RESPONSE_AGENT_FEEDBACK_ROWS.map((r) => r.id)));
      }
      setEditingAgent(null);
      setCoachingHighlightNodeIds([]);
      setCoachingInitialNodeId(undefined);
      setCoachingVersion(1);
      if (wasV1) onBuilderModeChange?.(false);
    };

    if (coachingHighlightNodeIds.length > 0) {
      if (coachingVersion === 2) {
        return (
          <CoachingAgentCanvasV2
            agent={editingAgent}
            onBack={(completed?: boolean) => handleCoachingBack(completed)}
          />
        );
      }
      return (
        <CoachingAgentCanvas
          agent={editingAgent}
          highlightNodeIds={coachingHighlightNodeIds}
          initialSelectedNodeId={coachingInitialNodeId}
          onBack={handleCoachingBack}
          onAcceptChanges={() => {
            toast.success("Changes accepted.");
            setCoachingHighlightNodeIds([]);
            setCoachingInitialNodeId(undefined);
            setEditingAgent(null);
            onBuilderModeChange?.(false);
          }}
          onEditAgent={() => {
            setCoachingHighlightNodeIds([]);
            setCoachingInitialNodeId(undefined);
          }}
        />
      );
    }

    return (
      <AgentsBuilderView
        agentName={editingAgent.id === "new" ? undefined : editingAgent.name}
        workflowPresetId={editingAgent.id === "new" ? undefined : editingAgent.id}
        initialPhase={editingAgent.id === "new" ? "library" : "building"}
        onBack={() => { setEditingAgent(null); onBuilderModeChange?.(false); }}
      />
    );
  }

  return (
    selectedAgent ? (
      <ResponseAgentDetailPage
        agent={selectedAgent}
        columnSheetOpen={detailColumnSheetOpen}
        onColumnSheetOpenChange={setDetailColumnSheetOpen}
        onBack={() => { setSelectedAgent(null); setCoachingCompleted(false); setAcceptedFeedbackIds(new Set()); }}
        onEdit={() => onEditAgent && selectedAgent ? onEditAgent(selectedAgent.name) : setEditingAgent(selectedAgent)}
        initialFeedbackId={initialFeedbackId}
        initialTab={coachingCompleted ? "coach" : undefined}
        acceptedFeedbackIds={acceptedFeedbackIds}
        onFeedbackAccepted={(id) => setAcceptedFeedbackIds((prev) => new Set([...prev, id]))}
        onCoachAgent={(nodeIds, initialNodeId, version) => {
          setCoachingHighlightNodeIds(nodeIds);
          setCoachingInitialNodeId(initialNodeId);
          setCoachingVersion(version ?? 1);
          setCoachingCompleted(false);
          const northAgent = RESPONSE_AGENT_ROWS.find((r) => r.id === "north-autonomous")!;
          setEditingAgent(northAgent);
          // v1 takes full width (hide L2 nav). v2 keeps Reviews L2 nav visible.
          onBuilderModeChange?.((version ?? 1) === 1);
        }}
      />
    ) : (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <MainCanvasViewHeader
        title="Review response agents"
        actions={headerActions}
      />

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
                {isActive ? <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary" aria-hidden /> : null}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "agents" ? (
        <div className="shrink-0 px-6 pb-4 pt-0">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              title="Reviews responded"
              value="835"
              delta="+1.3%"
              tooltip="Total review replies posted by response agents in the selected period."
            />
            <MetricCard
              title="Response rate"
              value="92%"
              delta="+1.3%"
              tooltip="Share of incoming reviews that received a response."
            />
            <MetricCard
              title="Average response time"
              value="20m"
              delta="+1.3%"
              tooltip="Mean time taken by agents to publish a response after review arrival."
            />
            <MetricCard
              title="Time saved"
              value="6h 20m"
              delta="+1.3%"
              tooltip="Estimated manual effort saved through automated response handling."
            />
            <MetricCard
              title="Cost saved"
              value="$4.2K"
              delta="+2.1%"
              tooltip="Estimated spend avoided by using automated response agents."
            />
          </div>
        </div>
      ) : null}

      {activeTab === "agents" ? (
        <div className="min-h-0 flex-1 px-6 pb-6 pt-6">
          <AppDataTable<ResponseAgentRow>
            tableId="reviews.response-agents.v2"
            data={RESPONSE_AGENT_ROWS}
            columns={columns}
            initialSorting={[{ id: "reviewsResponded", desc: true }]}
            getRowId={(row) => row.id}
            className="h-full min-h-0 px-0"
            columnSheetTitle="Response agent columns"
            hideColumnsButton
            columnSheetOpen={columnSheetOpen}
            onColumnSheetOpenChange={setColumnSheetOpen}
            stickyFirstColumn={false}
            rowDensity="default"
          />
        </div>
      ) : (
        <div className="min-h-0 flex-1 px-6 pb-6 pt-0">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {RESPONSE_AGENT_LIBRARY_TEMPLATES.map((template) => (
              <ResponseAgentLibraryTemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>
      )}
    </div>
    )
  );
}
