import { useState, type ReactNode } from "react";
import {
  BookOpen,
  CalendarClock,
  Database,
  FileText,
  MessageSquareText,
  PenLine,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Wand2,
  Workflow,
  Zap,
} from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { cn } from "@/app/components/ui/utils";

type GapType = "knowledge" | "context" | "action";
type ImpactLevel = "high" | "medium" | "low";

interface RecommendationItem {
  id: string;
  gap: GapType;
  impact: ImpactLevel;
  title: string;
  meta: string;
  hint: string;
  source?: string;
}

const RECOMMENDATIONS: RecommendationItem[] = [
  {
    id: "same-day-urgent",
    gap: "knowledge",
    impact: "high",
    title: "Same-day & urgent appointment policy",
    meta: "Asked 27 times this week",
    hint: "Add same-day booking policy, urgent care pathway, and walk-in hours to the knowledge base",
  },
  {
    id: "telehealth",
    gap: "knowledge",
    impact: "high",
    title: "Telehealth vs in-person appointment options",
    meta: "Asked 31 times this week",
    hint: "Add telehealth eligibility rules per visit type and a “how to join” guide",
  },
  {
    id: "pediatric-prep",
    gap: "knowledge",
    impact: "medium",
    title: "Pediatric visit prep and required documents",
    meta: "Asked 18 times this week",
    hint: "Document vaccination forms, guardian consent, and what to bring for under-12 visits",
  },
  {
    id: "nguyen-schedule",
    gap: "context",
    impact: "high",
    title: "Dr. Nguyen’s schedule not syncing from Athena",
    meta: "Affected 22 patients · incomplete_data",
    hint: "Verify Dr. Nguyen’s schedule is published — patients are being told no availability exists",
    source: "Athena · scheduling",
  },
  {
    id: "cigna-eligibility",
    gap: "context",
    impact: "medium",
    title: "Insurance eligibility check failing for Cigna",
    meta: "Affected 14 patients · api_error",
    hint: "Check Availity enrollment for Cigna payer ID — eligibility calls timing out",
    source: "Availity · eligibility",
  },
  {
    id: "cancel-via-chat",
    gap: "action",
    impact: "high",
    title: "Patients want to cancel appointments via chat",
    meta: "34 escalations this week",
    hint: "Enable “cancel appointment” write action on the chat channel — one-toggle fix",
  },
  {
    id: "update-insurance",
    gap: "action",
    impact: "medium",
    title: "Patients want to update insurance on file during booking",
    meta: "21 requests this week",
    hint: "Enable “update insurance” write action — requires Athena write permission",
  },
  {
    id: "reminder-confirm",
    gap: "action",
    impact: "medium",
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

const GAP_BADGE: Record<GapType, string> = {
  knowledge: "bg-emerald-50 text-emerald-800 border-emerald-200",
  context: "bg-emerald-50/70 text-emerald-700 border-emerald-200",
  action: "bg-emerald-50/40 text-emerald-700 border-emerald-200",
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

const IMPACT_DOT: Record<ImpactLevel, string> = {
  high: "bg-rose-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
};

const IMPACT_LABEL: Record<ImpactLevel, string> = {
  high: "High impact",
  medium: "Medium impact",
  low: "Low impact",
};

function ImpactPill({ level }: { level: ImpactLevel }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-foreground">
      <span className={cn("inline-block size-1.5 rounded-full", IMPACT_DOT[level])} aria-hidden />
      {IMPACT_LABEL[level]}
    </span>
  );
}

function RecCategory({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </span>
        <span className="text-[11px] tabular-nums text-muted-foreground">{count}</span>
      </div>
      <ul className="flex flex-col gap-2">{children}</ul>
    </div>
  );
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
          "group flex w-full flex-col gap-2 rounded-lg border bg-card p-3 text-left transition-colors",
          selected
            ? "border-primary/40 bg-primary/5 ring-1 ring-primary/30"
            : "border-border hover:border-foreground/20 hover:bg-muted/40",
        )}
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
              GAP_BADGE[item.gap],
            )}
          >
            {GAP_LABEL[item.gap]}
          </span>
          <ImpactPill level={item.impact} />
        </div>
        <p className="text-[13px] font-medium leading-snug text-foreground">{item.title}</p>
        <p className="text-[12px] leading-relaxed text-muted-foreground">{item.meta}</p>
      </button>
    </li>
  );
}

// ─── Right-pane content ─────────────────────────────────────────────────────

function SectionCard({
  icon,
  eyebrow,
  title,
  children,
  trailing,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  trailing?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            {icon}
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {eyebrow}
            </span>
            <h3 className="text-[15px] font-medium leading-tight text-foreground">{title}</h3>
          </div>
        </div>
        {trailing}
      </div>
      <div className="flex flex-col gap-3 text-[13px] leading-relaxed text-foreground">{children}</div>
    </section>
  );
}

function PolicySubsection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h4 className="text-[13px] font-semibold text-foreground">{heading}</h4>
      <div className="text-[13px] leading-relaxed text-muted-foreground">{children}</div>
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

function ImpactSummary({ rec }: { rec: RecommendationItem }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-gradient-to-br from-primary/[0.06] via-card to-card p-5">
      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Sparkles className="size-4" strokeWidth={1.6} absoluteStrokeWidth />
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Impact summary
        </span>
      </div>
      <p className="text-[14px] leading-relaxed text-foreground">
        Applying this recommendation is estimated to resolve <span className="font-medium">27 patient escalations / week</span>,
        improve same-day booking confidence, and reduce after-hours staff calls by <span className="font-medium">~18%</span>.
      </p>
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Badge variant="outline" className={cn("capitalize", GAP_BADGE[rec.gap])}>
          {GAP_LABEL[rec.gap]}
        </Badge>
        <Badge variant="outline" className="bg-card">
          Knowledge base
        </Badge>
        <Badge variant="outline" className="bg-card">
          Playbook
        </Badge>
        <Badge variant="outline" className="bg-card">
          Rules
        </Badge>
      </div>
    </div>
  );
}

function SameDayPolicyDetail() {
  return (
    <>
      <SectionCard
        icon={<BookOpen className="size-4" strokeWidth={1.6} absoluteStrokeWidth />}
        eyebrow="Knowledge base · New article"
        title="Same-day & urgent appointment policy"
        trailing={
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
            <Plus className="size-3" strokeWidth={1.6} absoluteStrokeWidth />
            Added
          </span>
        }
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

        <div className="mt-1 flex items-center gap-2 border-t border-border pt-3 text-[11px] text-muted-foreground">
          <span>Last reviewed: May 2026</span>
          <span aria-hidden>·</span>
          <span>Scope: Appointment agent (chat + phone channels)</span>
        </div>
      </SectionCard>

      <SectionCard
        icon={<Workflow className="size-4" strokeWidth={1.6} absoluteStrokeWidth />}
        eyebrow="Playbook · Updated step"
        title="Slot selection and hold — same-day handling"
        trailing={
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-800">
            <PenLine className="size-3" strokeWidth={1.6} absoluteStrokeWidth />
            Modified
          </span>
        }
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
      </SectionCard>

      <SectionCard
        icon={<ShieldCheck className="size-4" strokeWidth={1.6} absoluteStrokeWidth />}
        eyebrow="Rules · New rule"
        title="Urgent symptom escalation"
        trailing={
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
            <Plus className="size-3" strokeWidth={1.6} absoluteStrokeWidth />
            Added
          </span>
        }
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
      </SectionCard>

      <SectionCard
        icon={<MessageSquareText className="size-4" strokeWidth={1.6} absoluteStrokeWidth />}
        eyebrow="Agent responses · Before vs after"
        title="How the agent now answers same-day requests"
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
      </SectionCard>
    </>
  );
}

function GenericRecommendationDetail({ rec }: { rec: RecommendationItem }) {
  const iconByGap: Record<GapType, ReactNode> = {
    knowledge: <BookOpen className="size-4" strokeWidth={1.6} absoluteStrokeWidth />,
    context: <Database className="size-4" strokeWidth={1.6} absoluteStrokeWidth />,
    action: <Zap className="size-4" strokeWidth={1.6} absoluteStrokeWidth />,
  };

  return (
    <SectionCard
      icon={iconByGap[rec.gap]}
      eyebrow={`${GAP_LABEL[rec.gap]} · Suggested change`}
      title={rec.title}
    >
      <p>{rec.hint}</p>
      {rec.source ? (
        <p className="text-muted-foreground">Source: {rec.source}</p>
      ) : null}
      <p className="text-muted-foreground">
        Select <span className="text-foreground">Same-day & urgent appointment policy</span> from the
        list to see a full example of the changes the coach proposes for an appointment agent.
      </p>
    </SectionCard>
  );
}

// ─── Public component ───────────────────────────────────────────────────────

export function AppointmentRecommendationTab() {
  const [selectedId, setSelectedId] = useState<string>("same-day-urgent");
  const selected = RECOMMENDATIONS.find((r) => r.id === selectedId) ?? RECOMMENDATIONS[0];

  const knowledge = RECOMMENDATIONS.filter((r) => r.gap === "knowledge");
  const context = RECOMMENDATIONS.filter((r) => r.gap === "context");
  const action = RECOMMENDATIONS.filter((r) => r.gap === "action");
  const total = RECOMMENDATIONS.length;
  const knowledgePct = (knowledge.length / total) * 100;
  const contextPct = (context.length / total) * 100;
  const actionPct = (action.length / total) * 100;

  return (
    <div className="flex min-h-0 flex-1 gap-6 px-6 pb-6">
      {/* ── Left rail ── */}
      <aside className="flex w-[340px] shrink-0 flex-col gap-4 rounded-xl border border-border bg-card">
        <div className="flex flex-col gap-2 px-4 pt-4">
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
              Action gaps
            </span>
          </div>
        </div>

        <div className="mx-4 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2.5">
          <p className="flex items-start gap-2 text-[12px] leading-relaxed text-muted-foreground">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" strokeWidth={1.6} absoluteStrokeWidth />
            <span>
              Based on <span className="text-foreground">63 patient interactions</span>, I’ve identified
              <span className="text-foreground"> {total} changes</span> across knowledge, context, and actions.
            </span>
          </p>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-5 px-4 pb-4">
            <RecCategory title="Knowledge gaps" count={knowledge.length}>
              {knowledge.map((item) => (
                <RecListItem
                  key={item.id}
                  item={item}
                  selected={selectedId === item.id}
                  onSelect={() => setSelectedId(item.id)}
                />
              ))}
            </RecCategory>
            <RecCategory title="Context gaps" count={context.length}>
              {context.map((item) => (
                <RecListItem
                  key={item.id}
                  item={item}
                  selected={selectedId === item.id}
                  onSelect={() => setSelectedId(item.id)}
                />
              ))}
            </RecCategory>
            <RecCategory title="Action gaps" count={action.length}>
              {action.map((item) => (
                <RecListItem
                  key={item.id}
                  item={item}
                  selected={selectedId === item.id}
                  onSelect={() => setSelectedId(item.id)}
                />
              ))}
            </RecCategory>
          </div>
        </ScrollArea>
      </aside>

      {/* ── Right pane ── */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 pr-1">
          {/* Header strip with selected rec context + actions */}
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 md:flex-row md:items-start md:justify-between">
            <div className="flex min-w-0 flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                    GAP_BADGE[selected.gap],
                  )}
                >
                  {GAP_LABEL[selected.gap]}
                </span>
                <ImpactPill level={selected.impact} />
                {selected.id === "same-day-urgent" ? (
                  <Badge variant="outline" className="gap-1 bg-card text-muted-foreground">
                    <Stethoscope className="size-3" strokeWidth={1.6} absoluteStrokeWidth />
                    Healthcare
                  </Badge>
                ) : null}
              </div>
              <h1 className="text-[20px] font-medium leading-tight text-foreground">{selected.title}</h1>
              <p className="text-[13px] text-muted-foreground">{selected.meta}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button type="button" variant="outline" size="sm" className="h-9 gap-1.5 rounded-lg text-sm">
                <FileText className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
                View conversations
              </Button>
              <Button type="button" size="sm" className="h-9 gap-1.5 rounded-lg text-sm">
                <Wand2 className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
                Apply changes
              </Button>
            </div>
          </div>

          <ImpactSummary rec={selected} />

          {/* What I’ll change — and why */}
          <div className="flex items-center gap-2 px-1 pt-1">
            <PenLine className="size-3.5 text-muted-foreground" strokeWidth={1.6} absoluteStrokeWidth />
            <span className="text-[12px] font-medium uppercase tracking-wide text-muted-foreground">
              What I’ll change — and why
            </span>
          </div>

          {selected.id === "same-day-urgent" ? (
            <SameDayPolicyDetail />
          ) : (
            <GenericRecommendationDetail rec={selected} />
          )}

          {/* Trigger context */}
          <SectionCard
            icon={<CalendarClock className="size-4" strokeWidth={1.6} absoluteStrokeWidth />}
            eyebrow="Trigger context"
            title="Why this came up"
          >
            <p>
              Over the past 7 days, the agent received <span className="text-foreground">27 same-day requests</span>
              {" "}across chat and phone. In <span className="text-foreground">11 cases</span>, the patient was told
              “the next available appointment is tomorrow” without checking the same-day queue. In
              <span className="text-foreground"> 4 cases</span> involving a sick child, the conversation was
              escalated to staff after the patient asked twice.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="gap-1 bg-card text-muted-foreground">
                <Phone className="size-3" strokeWidth={1.6} absoluteStrokeWidth />
                Phone · 14
              </Badge>
              <Badge variant="outline" className="gap-1 bg-card text-muted-foreground">
                <MessageSquareText className="size-3" strokeWidth={1.6} absoluteStrokeWidth />
                Chat · 13
              </Badge>
              <Badge variant="outline" className="bg-card text-muted-foreground">
                Escalated to staff · 4
              </Badge>
            </div>
          </SectionCard>
        </div>
      </ScrollArea>
    </div>
  );
}
