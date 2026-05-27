import { useMemo, useState, type ReactNode } from "react";
import {
  BookOpen,
  CalendarClock,
  ChevronDown,
  Database,
  ListFilter,
  MessageSquareText,
  Phone,
  Play,
  ShieldCheck,
  Sparkles,
  Wand2,
  Workflow,
  Zap,
} from "lucide-react";
import {
  APPOINTMENT_AGENT_SANDBOX_PANEL_WIDTH,
  AppointmentAgentSandboxPanel,
} from "@/app/components/appointments/AppointmentAgentSandboxSheet";
import { SlidingSidePanel } from "@/app/components/layout/SlidingSidePanel";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/components/ui/collapsible";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { cn } from "@/app/components/ui/utils";

type GapType = "knowledge" | "context" | "action";
interface RecommendationItem {
  id: string;
  gap: GapType;
  title: string;
  meta: string;
  hint: string;
  source?: string;
}

const RECOMMENDATIONS: RecommendationItem[] = [
  {
    id: "same-day-urgent",
    gap: "knowledge",
    title: "Same-day & urgent appointment policy",
    meta: "Asked 27 times this week",
    hint: "Add same-day booking policy, urgent care pathway, and walk-in hours to the knowledge base",
  },
  {
    id: "telehealth",
    gap: "knowledge",
    title: "Telehealth vs in-person appointment options",
    meta: "Asked 31 times this week",
    hint: "Add telehealth eligibility rules per visit type and a “how to join” guide",
  },
  {
    id: "pediatric-prep",
    gap: "knowledge",
    title: "Pediatric visit prep and required documents",
    meta: "Asked 18 times this week",
    hint: "Document vaccination forms, guardian consent, and what to bring for under-12 visits",
  },
  {
    id: "nguyen-schedule",
    gap: "context",
    title: "Dr. Nguyen’s schedule not syncing from Athena",
    meta: "Affected 22 patients · incomplete_data",
    hint: "Verify Dr. Nguyen’s schedule is published — patients are being told no availability exists",
    source: "Athena · scheduling",
  },
  {
    id: "cigna-eligibility",
    gap: "context",
    title: "Insurance eligibility check failing for Cigna",
    meta: "Affected 14 patients · api_error",
    hint: "Check Availity enrollment for Cigna payer ID — eligibility calls timing out",
    source: "Availity · eligibility",
  },
  {
    id: "cancel-via-chat",
    gap: "action",
    title: "Patients want to cancel appointments via chat",
    meta: "34 escalations this week",
    hint: "Enable “cancel appointment” write action on the chat channel — one-toggle fix",
  },
  {
    id: "update-insurance",
    gap: "action",
    title: "Patients want to update insurance on file during booking",
    meta: "21 requests this week",
    hint: "Enable “update insurance” write action — requires Athena write permission",
  },
  {
    id: "reminder-confirm",
    gap: "action",
    title: "Reminder confirmations not updating appointment status",
    meta: "16 patients this week",
    hint: "Enable “write confirmation status” when patient replies YES to reminder",
  },
];

const GAP_LABEL: Record<GapType, string> = {
  knowledge: "Knowledge gap",
  context: "Context gap",
  action: "Action gap",
};

const GAP_FILTER_LABEL: Record<GapType, string> = {
  knowledge: "Knowledge gaps",
  context: "Context gaps",
  action: "Action gaps",
};

const GAP_TYPES: GapType[] = ["knowledge", "context", "action"];

/** Mixed display order (not grouped by gap type). */
const RECOMMENDATION_DISPLAY_ORDER: string[] = [
  "cancel-via-chat",
  "pediatric-prep",
  "cigna-eligibility",
  "same-day-urgent",
  "reminder-confirm",
  "nguyen-schedule",
  "telehealth",
  "update-insurance",
];

const RECOMMENDATION_BY_ID = Object.fromEntries(
  RECOMMENDATIONS.map((item) => [item.id, item]),
) as Record<string, RecommendationItem>;

const ORDERED_RECOMMENDATIONS = RECOMMENDATION_DISPLAY_ORDER.map(
  (id) => RECOMMENDATION_BY_ID[id],
).filter((item): item is RecommendationItem => item != null);

/** Matches agent status badges (e.g. Running) in AppointmentsManagementAgentsPage */
const GAP_BADGE: Record<GapType, string> = {
  knowledge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  context: "bg-emerald-50 text-emerald-700 border-emerald-200",
  action: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const STATUS_BADGE_ADDED = "bg-emerald-50 text-emerald-700 border-emerald-200";
const STATUS_BADGE_MODIFIED = "bg-amber-50 text-amber-700 border-amber-200";

const GAP_LIST_ICON_TILE: Record<GapType, string> = {
  knowledge: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  context: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  action: "bg-amber-500/10 text-amber-800 dark:text-amber-300",
};

const GAP_BAR_COLOR: Record<GapType, string> = {
  knowledge: "bg-emerald-700",
  context: "bg-emerald-500",
  action: "bg-emerald-300",
};

const GAP_DOT_COLOR: Record<GapType, string> = {
  knowledge: "bg-emerald-700",
  context: "bg-emerald-500",
  action: "bg-emerald-300",
};

/** Demo: user feedback analyzed for coach recommendations */
const COACH_INTERACTION_COUNT = 10;

function GapListIcon({ gap }: { gap: GapType }) {
  const className = "size-3.5 shrink-0";
  switch (gap) {
    case "knowledge":
      return <BookOpen className={className} strokeWidth={1.6} absoluteStrokeWidth />;
    case "context":
      return <Database className={className} strokeWidth={1.6} absoluteStrokeWidth />;
    case "action":
      return <Workflow className={className} strokeWidth={1.6} absoluteStrokeWidth />;
  }
}

function RecListItem({
  item,
  selected,
  onSelect,
}: {
  item: RecommendationItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "group flex w-full flex-col gap-2 rounded-lg border bg-card p-4 text-left transition-colors",
          selected
            ? "border-primary/40 bg-primary/5 ring-1 ring-primary/30"
            : "border-border hover:border-foreground/20 hover:bg-muted/40",
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-md",
              GAP_LIST_ICON_TILE[item.gap],
            )}
          >
            <GapListIcon gap={item.gap} />
          </span>
          <span className="truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {GAP_LABEL[item.gap]}
          </span>
        </div>
        <p className="text-[14px] font-medium leading-snug text-foreground">{item.title}</p>
        <p className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">{item.hint}</p>
      </button>
    </li>
  );
}

// ─── Right-pane content (open document layout) ──────────────────────────────

type RecoIconTone = "primary" | "knowledge" | "playbook" | "rules" | "responses";

const RECO_ICON_TONE_CLASS: Record<RecoIconTone, string> = {
  primary: "bg-primary/10 text-primary",
  knowledge: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  playbook: "bg-amber-500/10 text-amber-800 dark:text-amber-300",
  rules: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  responses: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
};

function RecoStatusBadge({
  children,
  variant,
}: {
  children: ReactNode;
  variant: "added" | "modified";
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "shrink-0 capitalize",
        variant === "added" ? STATUS_BADGE_ADDED : STATUS_BADGE_MODIFIED,
      )}
    >
      {children}
    </Badge>
  );
}

function RecoContentSection({
  icon,
  iconTone = "primary",
  label,
  title,
  articleTitle,
  trailing,
  children,
  defaultOpen = true,
}: {
  icon: ReactNode;
  iconTone?: RecoIconTone;
  /** Uppercase source label (e.g. Knowledge base) — shows chevron when set */
  label?: string;
  /** Section heading beside the icon (e.g. Why this came up?) */
  title?: string;
  /** Optional document title inside the body */
  articleTitle?: string;
  trailing?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="flex gap-3">
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          RECO_ICON_TONE_CLASS[iconTone],
        )}
        aria-hidden
      >
        {icon}
      </span>

      <Collapsible open={open} onOpenChange={setOpen} className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2">
          {label ? (
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex min-w-0 items-center gap-2 rounded-md text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {label}
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                    !open && "-rotate-90",
                  )}
                  strokeWidth={1.6}
                  absoluteStrokeWidth
                  aria-hidden
                />
              </button>
            </CollapsibleTrigger>
          ) : title ? (
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex min-w-0 items-center gap-2 rounded-md text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <h2 className="text-[15px] font-semibold leading-snug text-foreground">{title}</h2>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                    !open && "-rotate-90",
                  )}
                  strokeWidth={1.6}
                  absoluteStrokeWidth
                  aria-hidden
                />
              </button>
            </CollapsibleTrigger>
          ) : null}
          {trailing}
        </div>

        <CollapsibleContent className="flex flex-col gap-6 pt-4">
          {articleTitle ? (
            <h3 className="text-[15px] font-semibold leading-snug text-foreground">{articleTitle}</h3>
          ) : null}
          <div className="flex flex-col gap-6 text-[13px] leading-relaxed text-muted-foreground">
            {children}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}

function PolicySubsection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-[14px] font-semibold text-foreground">{heading}</h4>
      <div>{children}</div>
    </div>
  );
}

function ResponseCompare({
  oldResponse,
  newResponse,
  scenario,
}: {
  scenario: string;
  oldResponse: string;
  newResponse: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-4">
      <p className="text-[12px] text-muted-foreground">
        Patient asked: <span className="text-foreground">{scenario}</span>
      </p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1.5 rounded-md border border-rose-200 bg-rose-50/60 p-3">
          <span className="inline-flex w-fit items-center gap-1 rounded-full border border-rose-200 bg-white/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-rose-700">
            Before
          </span>
          <p className="text-[13px] leading-relaxed text-rose-900">{oldResponse}</p>
        </div>
        <div className="flex flex-col gap-1.5 rounded-md border border-emerald-200 bg-emerald-50/60 p-3">
          <span className="inline-flex w-fit items-center gap-1 rounded-full border border-emerald-200 bg-white/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-700">
            After
          </span>
          <p className="text-[13px] leading-relaxed text-emerald-900">{newResponse}</p>
        </div>
      </div>
    </div>
  );
}

function SameDayPolicyDetail() {
  return (
    <div className="flex flex-col gap-8">
      <RecoContentSection
        icon={<BookOpen className="size-4" strokeWidth={1.6} absoluteStrokeWidth />}
        iconTone="knowledge"
        label="Knowledge base"
        articleTitle="Same-day & urgent appointment policy"
        trailing={<RecoStatusBadge variant="added">Added</RecoStatusBadge>}
      >
        <PolicySubsection heading="Can I get a same-day appointment?">
          Yes. We hold a limited number of same-day slots each morning for acute and urgent needs. These are
          released daily at 8:00 AM and are available on a first-come, first-served basis. The agent should
          check live availability before confirming — do not promise a slot without verifying.
          <br />
          <span className="text-foreground">Best way to request:</span> contact us by phone or chat before
          10:00 AM for the best chance of availability.
        </PolicySubsection>

        <PolicySubsection heading="What counts as an urgent or same-day visit?">
          Same-day slots are reserved for conditions that need attention today but are not life-threatening
          emergencies. Common reasons include:
          <ul className="mt-1.5 list-disc space-y-1 pl-5">
            <li>Fever over 101°F (38.3°C) in adults, or any fever in children under 3 months</li>
            <li>Ear pain, sore throat, or suspected ear/sinus infection</li>
            <li>Urinary tract infection symptoms</li>
            <li>Mild to moderate injury (sprain, minor cut, rash)</li>
            <li>Worsening cold, flu, or respiratory symptoms</li>
            <li>Sudden onset of pain that is new or unusual for the patient</li>
          </ul>
          <p className="mt-2">
            <span className="text-foreground">Not sure if it qualifies?</span> The agent should tell the patient:
            <span className="italic"> “I can check if we have same-day availability. If we don’t have a slot that fits, I’ll let you know the next options.”</span>
          </p>
        </PolicySubsection>

        <PolicySubsection heading="What if no same-day slots are available?">
          If same-day slots are full, the agent should offer these in order:
          <ol className="mt-1.5 list-decimal space-y-1 pl-5">
            <li><span className="text-foreground">Next available appointment</span> — the earliest slot, even if tomorrow</li>
            <li><span className="text-foreground">Telehealth visit</span> — many urgent concerns can be handled over video same day</li>
            <li><span className="text-foreground">Urgent care referral</span> — if the patient’s concern cannot wait</li>
            <li><span className="text-foreground">Emergency guidance</span> — chest pain, difficulty breathing, signs of stroke → call 911</li>
          </ol>
        </PolicySubsection>

        <PolicySubsection heading="Walk-in availability">
          Walk-ins are accepted on a capacity basis. Current walk-in hours:
          <ul className="mt-1.5 list-disc space-y-1 pl-5">
            <li>Monday – Friday: 8:00 AM – 11:00 AM</li>
            <li>Saturday: 9:00 AM – 11:00 AM</li>
            <li>Sunday: not available</li>
          </ul>
          <p className="mt-2">
            Walk-in patients are seen after scheduled patients. Wait times range from 30 minutes to 2+ hours
            depending on volume. The agent should set this expectation clearly and suggest calling ahead.
          </p>
        </PolicySubsection>

        <PolicySubsection heading="Pediatric urgent visits">
          For children under 12, same-day sick visit slots are prioritized separately. If a parent calls about
          a sick child, the agent should flag the request as pediatric and check the pediatric same-day queue
          specifically. For infants under 3 months with any fever, escalate to staff immediately.
        </PolicySubsection>

        <PolicySubsection heading="What the agent should never do">
          <ul className="mt-1.5 list-disc space-y-1 pl-5">
            <li>Do not confirm a same-day slot without checking live availability</li>
            <li>Do not advise a patient to “just come in” without confirming walk-in hours</li>
            <li>Do not dismiss urgency — escalate to staff if symptoms are escalating</li>
            <li>Do not suggest the ER for non-emergency situations</li>
          </ul>
        </PolicySubsection>

        <p className="text-[11px] text-muted-foreground">
          Last reviewed: May 2026 · Scope: Appointment agent (chat + phone channels)
        </p>
      </RecoContentSection>

      <RecoContentSection
        icon={<Workflow className="size-4" strokeWidth={1.6} absoluteStrokeWidth />}
        iconTone="playbook"
        label="Procedure · Updated step"
        articleTitle="Slot selection and hold — same-day handling"
        trailing={<RecoStatusBadge variant="modified">Modified</RecoStatusBadge>}
      >
        <p>
          When the patient describes urgent symptoms or asks for “today,” the agent now branches into the
          same-day flow before showing the standard slot list:
        </p>
        <ol className="list-decimal space-y-1.5 pl-5 text-muted-foreground">
          <li>Check the same-day queue for the patient’s home location first.</li>
          <li>If empty, fall back to telehealth slots for the same day before offering tomorrow.</li>
          <li>For pediatric (&lt; 12) sick visits, route to the pediatric same-day queue only.</li>
          <li>If symptoms suggest emergency, stop the booking flow and surface 911 guidance.</li>
        </ol>
      </RecoContentSection>

      <RecoContentSection
        icon={<ShieldCheck className="size-4" strokeWidth={1.6} absoluteStrokeWidth />}
        iconTone="rules"
        label="Policies · New policy"
        articleTitle="Urgent symptom escalation"
        trailing={<RecoStatusBadge variant="added">Added</RecoStatusBadge>}
      >
        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[13px]">
          <span className="text-muted-foreground">If</span>
          <span className="text-foreground">
            Patient mentions chest pain, difficulty breathing, signs of stroke, or fever in an infant
            under 3 months
          </span>
          <span className="text-muted-foreground">Then</span>
          <span className="text-foreground">
            Halt booking, surface 911 / ER guidance, and notify on-call staff via the escalation queue
          </span>
          <span className="text-muted-foreground">Priority</span>
          <span>
            <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
              High
            </Badge>
          </span>
        </div>
      </RecoContentSection>

      <RecoContentSection
        icon={<MessageSquareText className="size-4" strokeWidth={1.6} absoluteStrokeWidth />}
        iconTone="responses"
        label="Agent responses · Before vs after"
        articleTitle="How the agent now answers same-day requests"
      >
        <ResponseCompare
          scenario="“My throat is killing me — can I be seen today?”"
          oldResponse="“I’m sorry to hear that. The next available appointment with your provider is Thursday at 2:15 PM. Would you like me to book that for you?”"
          newResponse="“That sounds painful — let me check our same-day options. I found a 10:30 AM opening today with any available provider, or a telehealth visit at 11:15 AM. Which one would you prefer?”"
        />
        <ResponseCompare
          scenario="“My 4-year-old has a 102 fever, what do I do?”"
          oldResponse="“I can book the next available pediatric appointment, which is tomorrow at 9:00 AM. Would you like me to schedule that?”"
          newResponse="“I’m flagging this as a pediatric urgent visit. I see a same-day pediatric slot at 11:45 AM today — should I hold it? If symptoms get worse before then (trouble breathing, unresponsive, stiff neck), please call 911 right away.”"
        />
        <ResponseCompare
          scenario="“I don’t see any openings online — can I just walk in?”"
          oldResponse="“Yes, you’re welcome to come in anytime during business hours and we’ll fit you in.”"
          newResponse="“Walk-ins are accepted Monday–Friday 8–11 AM and Saturday 9–11 AM — wait times can run 30 min to 2+ hours. I’d recommend calling ahead to check current wait, or I can book you the next open slot now if that’s easier.”"
        />
      </RecoContentSection>
    </div>
  );
}

function GenericRecommendationDetail({ rec }: { rec: RecommendationItem }) {
  const iconByGap: Record<GapType, { icon: ReactNode; tone: RecoIconTone }> = {
    knowledge: {
      icon: <BookOpen className="size-4" strokeWidth={1.6} absoluteStrokeWidth />,
      tone: "knowledge",
    },
    context: {
      icon: <Database className="size-4" strokeWidth={1.6} absoluteStrokeWidth />,
      tone: "primary",
    },
    action: {
      icon: <Zap className="size-4" strokeWidth={1.6} absoluteStrokeWidth />,
      tone: "playbook",
    },
  };
  const { icon, tone } = iconByGap[rec.gap];

  return (
    <RecoContentSection
      icon={icon}
      iconTone={tone}
      label={`${GAP_LABEL[rec.gap]} · Suggested change`}
      articleTitle={rec.title}
    >
      <p>{rec.hint}</p>
      {rec.source ? <p>Source: {rec.source}</p> : null}
      <p>
        Select <span className="text-foreground">Same-day & urgent appointment policy</span> from the
        list to see a full example of the changes the coach proposes for an appointment agent.
      </p>
    </RecoContentSection>
  );
}

// ─── Public component ───────────────────────────────────────────────────────

export function AppointmentRecommendationTab() {
  const [selectedId, setSelectedId] = useState<string>("same-day-urgent");
  const [sandboxOpen, setSandboxOpen] = useState(false);
  const [gapFilters, setGapFilters] = useState<GapType[]>([]);
  const selected = RECOMMENDATIONS.find((r) => r.id === selectedId) ?? RECOMMENDATIONS[0];

  const filteredRecommendations = useMemo(() => {
    if (gapFilters.length === 0) return ORDERED_RECOMMENDATIONS;
    return ORDERED_RECOMMENDATIONS.filter((item) => gapFilters.includes(item.gap));
  }, [gapFilters]);

  const activeFilterCount = gapFilters.length;

  const setGapFilterChecked = (gap: GapType, checked: boolean) => {
    setGapFilters((prev) =>
      checked ? (prev.includes(gap) ? prev : [...prev, gap]) : prev.filter((g) => g !== gap),
    );
  };

  const clearGapFilters = () => setGapFilters([]);

  const knowledge = RECOMMENDATIONS.filter((r) => r.gap === "knowledge");
  const context = RECOMMENDATIONS.filter((r) => r.gap === "context");
  const action = RECOMMENDATIONS.filter((r) => r.gap === "action");
  const total = RECOMMENDATIONS.length;
  const knowledgePct = (knowledge.length / total) * 100;
  const contextPct = (context.length / total) * 100;
  const actionPct = (action.length / total) * 100;

  return (
    <TooltipProvider delayDuration={200}>
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <div className="flex min-h-0 min-w-0 flex-1 gap-6 overflow-hidden px-6 pb-6">
      {/* ── Left rail ── */}
      <aside className="flex min-h-0 w-[340px] shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex shrink-0 flex-col gap-2 px-4 pt-4 pb-4">
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            Most impactful ways to improve your agent’s response quality
          </p>

          <div className="mt-2 flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <span
              className={cn("h-full", GAP_BAR_COLOR.knowledge)}
              style={{ width: `${knowledgePct}%` }}
              aria-hidden
            />
            <span
              className={cn("h-full", GAP_BAR_COLOR.context)}
              style={{ width: `${contextPct}%` }}
              aria-hidden
            />
            <span
              className={cn("h-full", GAP_BAR_COLOR.action)}
              style={{ width: `${actionPct}%` }}
              aria-hidden
            />
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className={cn("size-1.5 rounded-full", GAP_DOT_COLOR.knowledge)} aria-hidden />
              Knowledge gaps
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className={cn("size-1.5 rounded-full", GAP_DOT_COLOR.context)} aria-hidden />
              Context gaps
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className={cn("size-1.5 rounded-full", GAP_DOT_COLOR.action)} aria-hidden />
              {GAP_FILTER_LABEL.action}
            </span>
          </div>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-4 px-4 pb-4">
            <div className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2.5">
              <p className="flex items-start gap-2 text-[12px] leading-relaxed text-muted-foreground">
                <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" strokeWidth={1.6} absoluteStrokeWidth />
                <span>
                  Based on{" "}
                  <span className="text-foreground">{COACH_INTERACTION_COUNT} user feedback</span>, I’ve
                  identified <span className="text-foreground">{total} changes</span> across knowledge, context,
                  and actions.
                </span>
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
              <span className="text-[13px] text-foreground">
                <span className="tabular-nums">{filteredRecommendations.length}</span> items
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 px-2 text-[13px] font-normal"
                    aria-label={
                      activeFilterCount > 0
                        ? `Filters, ${activeFilterCount} active`
                        : "Filters"
                    }
                  >
                    <ListFilter className="size-4 shrink-0" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                    Filters
                    <span className="tabular-nums text-muted-foreground">{activeFilterCount}</span>
                    <ChevronDown
                      className="size-4 shrink-0 text-muted-foreground"
                      strokeWidth={1.6}
                      absoluteStrokeWidth
                      aria-hidden
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  {GAP_TYPES.map((gap) => (
                    <DropdownMenuCheckboxItem
                      key={gap}
                      checked={gapFilters.includes(gap)}
                      onCheckedChange={(checked) => setGapFilterChecked(gap, checked === true)}
                    >
                      {GAP_FILTER_LABEL[gap]}
                    </DropdownMenuCheckboxItem>
                  ))}
                  {activeFilterCount > 0 ? (
                    <>
                      <DropdownMenuSeparator />
                      <button
                        type="button"
                        className="w-full rounded-sm px-2 py-1.5 text-left text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        onClick={clearGapFilters}
                      >
                        Clear filters
                      </button>
                    </>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <ul className="flex flex-col gap-2">
              {filteredRecommendations.map((item) => (
                <RecListItem
                  key={item.id}
                  item={item}
                  selected={selectedId === item.id}
                  onSelect={() => setSelectedId(item.id)}
                />
              ))}
            </ul>
          </div>
        </ScrollArea>
      </aside>

      {/* ── Right pane ── */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-8 pr-1">
          <header className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-foreground">
                  {selected.title}
                </h1>
                <Badge variant="outline" className={cn("shrink-0 capitalize", GAP_BADGE[selected.gap])}>
                  {GAP_LABEL[selected.gap]}
                </Badge>
              </div>
              <p className="text-[13px] text-muted-foreground">{selected.meta}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="size-9 rounded-lg p-0"
                    onClick={() => setSandboxOpen(true)}
                    aria-label="Test agent"
                    title="Test agent"
                  >
                    <Play className="size-4" strokeWidth={1.6} absoluteStrokeWidth />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={4}>
                  Test agent
                </TooltipContent>
              </Tooltip>
              <Button type="button" size="sm" className="h-9 gap-1.5 rounded-lg text-sm">
                <Wand2 className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
                Apply changes
              </Button>
            </div>
          </header>

          <RecoContentSection
            icon={<CalendarClock className="size-4" strokeWidth={1.6} absoluteStrokeWidth />}
            iconTone="primary"
            title="Why this came up?"
          >
            <p>
              Over the past 7 days, the agent received <span className="text-foreground">27 same-day requests</span>
              {" "}across chat and phone. In <span className="text-foreground">11 cases</span>, the patient was told
              “the next available appointment is tomorrow” without checking the same-day queue. In
              <span className="text-foreground"> 4 cases</span> involving a sick child, the conversation was
              escalated to staff after the patient asked twice.
            </p>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px]">
              <span className="inline-flex items-center gap-1">
                <Phone className="size-3" strokeWidth={1.6} absoluteStrokeWidth />
                Phone · 14
              </span>
              <span aria-hidden className="text-muted-foreground/60">
                ·
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageSquareText className="size-3" strokeWidth={1.6} absoluteStrokeWidth />
                Chat · 13
              </span>
              <span aria-hidden className="text-muted-foreground/60">
                ·
              </span>
              <span>Escalated to staff · 4</span>
            </p>
          </RecoContentSection>

          {selected.id === "same-day-urgent" ? (
            <SameDayPolicyDetail />
          ) : (
            <GenericRecommendationDetail rec={selected} />
          )}
        </div>
      </ScrollArea>
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
    </TooltipProvider>
  );
}
