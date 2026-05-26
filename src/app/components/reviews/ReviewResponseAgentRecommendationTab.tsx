import { useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  BookOpen,
  ChevronDown,
  GitBranch,
  ListFilter,
  MessageSquareText,
  Mic2,
  Play,
  Sparkles,
  ThumbsDown,
  Wand2,
} from "lucide-react";
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

type GapType = "tone" | "context" | "action";

interface RecommendationItem {
  id: string;
  gap: GapType;
  title: string;
  meta: string;
  hint: string;
}

const RECOMMENDATIONS: RecommendationItem[] = [
  {
    id: "empathy-distress",
    gap: "tone",
    title: "Add empathy cues for distress-level reviews",
    meta: "Flagged in 2 responses",
    hint: "Update the system prompt to detect distress signals (pain, waiting, being ignored) and respond with direct acknowledgment before resolution language",
  },
  {
    id: "wire-extracted-issues",
    gap: "context",
    title: "Wire extracted issues from Task 4 to Task 5",
    meta: "Affected 1 response",
    hint: "Parking, access, and operational complaints extracted by Task 4 are not passed as inputs to the response generator — add extracted_issues to Task 5 inputs",
  },
  {
    id: "severity-routing",
    gap: "action",
    title: "Add severity routing for 1 and 2-star reviews",
    meta: "Flagged in 2 responses",
    hint: "Low-star reviews are routed through the same template as 4-star reviews — add a severity score and a routing rule that opens with direct acknowledgment, not a thank-you",
  },
  {
    id: "remove-generic-phrases",
    gap: "tone",
    title: "Replace generic closing phrases with brand-specific language",
    meta: "Flagged in 2 responses",
    hint: "Add few-shot examples and explicit negative examples to prevent corporate filler (\"thank you for your feedback\", \"hope to see you again\") from appearing in responses",
  },
];

const GAP_LABEL: Record<GapType, string> = {
  tone: "Tone gap",
  context: "Context gap",
  action: "Action gap",
};

const GAP_FILTER_LABEL: Record<GapType, string> = {
  tone: "Tone gaps",
  context: "Context gaps",
  action: "Action gaps",
};

const GAP_TYPES: GapType[] = ["tone", "context", "action"];

const RECOMMENDATION_DISPLAY_ORDER: string[] = [
  "empathy-distress",
  "severity-routing",
  "wire-extracted-issues",
  "remove-generic-phrases",
];

const RECOMMENDATION_BY_ID = Object.fromEntries(
  RECOMMENDATIONS.map((item) => [item.id, item]),
) as Record<string, RecommendationItem>;

const ORDERED_RECOMMENDATIONS = RECOMMENDATION_DISPLAY_ORDER.map(
  (id) => RECOMMENDATION_BY_ID[id],
).filter((item): item is RecommendationItem => item != null);

const GAP_LIST_ICON_TILE: Record<GapType, string> = {
  tone: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  context: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  action: "bg-amber-500/10 text-amber-800 dark:text-amber-300",
};

const GAP_BAR_COLOR: Record<GapType, string> = {
  tone: "bg-violet-600",
  context: "bg-sky-500",
  action: "bg-amber-400",
};

const GAP_DOT_COLOR: Record<GapType, string> = {
  tone: "bg-violet-600",
  context: "bg-sky-500",
  action: "bg-amber-400",
};

const GAP_BADGE: Record<GapType, string> = {
  tone: "bg-violet-50 text-violet-700 border-violet-200",
  context: "bg-sky-50 text-sky-700 border-sky-200",
  action: "bg-amber-50 text-amber-700 border-amber-200",
};

const COACH_INTERACTION_COUNT = 47;

const STATUS_BADGE_ADDED = "bg-emerald-50 text-emerald-700 border-emerald-200";
const STATUS_BADGE_MODIFIED = "bg-amber-50 text-amber-700 border-amber-200";

function GapListIcon({ gap }: { gap: GapType }) {
  const className = "size-3.5 shrink-0";
  switch (gap) {
    case "tone":
      return <Mic2 className={className} strokeWidth={1.6} absoluteStrokeWidth />;
    case "context":
      return <BookOpen className={className} strokeWidth={1.6} absoluteStrokeWidth />;
    case "action":
      return <GitBranch className={className} strokeWidth={1.6} absoluteStrokeWidth />;
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

// ─── Right-pane section ───────────────────────────────────────────────────────

type RecoIconTone = "primary" | "tone" | "context" | "action" | "responses";

const RECO_ICON_TONE_CLASS: Record<RecoIconTone, string> = {
  primary: "bg-primary/10 text-primary",
  tone: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  context: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  action: "bg-amber-500/10 text-amber-800 dark:text-amber-300",
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
  trailing,
  children,
  defaultOpen = true,
}: {
  icon: ReactNode;
  iconTone?: RecoIconTone;
  label?: string;
  title?: string;
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
          <div className="flex flex-col gap-6 text-[13px] leading-relaxed text-muted-foreground">
            {children}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </section>
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
        Review says: <span className="text-foreground">{scenario}</span>
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

function DiffBlock({ removed, added }: { removed?: string; added: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-muted/30 px-4 py-3 font-mono text-[12px] leading-relaxed">
      {removed ? (
        <div className="rounded bg-destructive/10 px-3 py-2 text-destructive">
          {removed.split("\n").map((line, i) => (
            <div key={i}>− {line}</div>
          ))}
        </div>
      ) : null}
      <div className="rounded bg-emerald-50 px-3 py-2 text-emerald-700">
        {added.split("\n").map((line, i) => (
          <div key={i}>+ {line}</div>
        ))}
      </div>
    </div>
  );
}

function EmpathyDistressDetail() {
  return (
    <div className="flex flex-col gap-8">
      <RecoContentSection
        icon={<AlertCircle className="size-4" strokeWidth={1.6} absoluteStrokeWidth />}
        iconTone="tone"
        title="Why this came up?"
      >
        <p>
          In the past 7 days, <span className="text-foreground">2 responses</span> to low-star
          reviews (1★ and 2★) were flagged for missing direct acknowledgment of the customer's
          specific experience. Both used generic corporate phrasing despite the review containing
          explicit descriptions of physical discomfort or unresolved disappointment.
        </p>
        <p>
          In <span className="text-foreground">Marcus's 1-star review</span>, the patient described
          sitting in pain for 30 minutes without acknowledgment. The agent responded with
          "we take all reviews seriously" — no direct mention of the pain or delay. In{" "}
          <span className="text-foreground">James's 2-star review</span>, a lost anniversary
          reservation prompted only a brief apology with no resolution or follow-up offered.
        </p>
      </RecoContentSection>

      <RecoContentSection
        icon={<Mic2 className="size-4" strokeWidth={1.6} absoluteStrokeWidth />}
        iconTone="tone"
        label="Task 5: Response generation · System prompt update"
        trailing={<RecoStatusBadge variant="modified">Modified</RecoStatusBadge>}
      >
        <p>
          The system prompt currently instructs the agent to write as "a marketing manager." This
          produces brand-safe but emotionally flat responses that fail when the review describes pain,
          loss, or neglect. The updated prompt establishes a customer experience persona with explicit
          rules for distress-level reviews.
        </p>
        <DiffBlock
          removed="You are a marketing manager specialised in writing responses to customer reviews"
          added={`You are a customer experience manager for {Location.brand} who genuinely cares about every patient's experience. You write responses that feel personal and specific — never copy-paste, never corporate. For reviews involving physical pain, long waits, or staff dismissiveness, acknowledge the specific experience directly before moving to resolution.`}
        />
      </RecoContentSection>

      <RecoContentSection
        icon={<BookOpen className="size-4" strokeWidth={1.6} absoluteStrokeWidth />}
        iconTone="context"
        label="Task 5: Response generation · Context variable"
        trailing={<RecoStatusBadge variant="added">Added</RecoStatusBadge>}
      >
        <p>
          Without brand voice guidelines in context, the model invents filler phrases.
          Adding <span className="text-foreground">Location.brand_voice_guidelines</span> anchors
          the tone and gives the model specific phrases to avoid.
        </p>
        <DiffBlock
          added={`Location.brand_voice_guidelines\n"Warm but direct. Use first names. Never use: 'we take all reviews seriously', 'at your convenience', 'meet expectations'. Always use specific action language and direct ownership."`}
        />
      </RecoContentSection>

      <RecoContentSection
        icon={<MessageSquareText className="size-4" strokeWidth={1.6} absoluteStrokeWidth />}
        iconTone="responses"
        label="Agent responses · Before vs after"
      >
        <ResponseCompare
          scenario={"\"I sat in pain for 30 minutes without anyone checking on me.\""}
          oldResponse={"\"Hi Marcus, thank you for your feedback. We’re sorry to hear your visit did not meet expectations. We take all reviews seriously and your experience — particularly around wait times and communication — is being reviewed with our team.\""}
          newResponse={"\"Hi Marcus, sitting in pain for 30 minutes without anyone checking on you — and then having the procedure rushed without explanation — is not the care you deserved. Our clinical director will call you directly this week to understand what happened and make it right.\""}
        />
        <ResponseCompare
          scenario={"\"Our anniversary reservation was lost when we arrived. 45 minutes late, no apology.\""}
          oldResponse={"\"Hi James, thanks for sharing your feedback. We’re sorry your evening did not go as planned.\""}
          newResponse={"\"Hi James, losing a reservation on your anniversary — and then waiting 45 minutes without a genuine apology — is unacceptable. Please reach out directly and we’ll make this right for you personally.\""}
        />
      </RecoContentSection>
    </div>
  );
}

function GenericRecommendationDetail({ rec }: { rec: RecommendationItem }) {
  const iconByGap: Record<GapType, { icon: ReactNode; tone: RecoIconTone }> = {
    tone: {
      icon: <Mic2 className="size-4" strokeWidth={1.6} absoluteStrokeWidth />,
      tone: "tone",
    },
    context: {
      icon: <BookOpen className="size-4" strokeWidth={1.6} absoluteStrokeWidth />,
      tone: "context",
    },
    action: {
      icon: <GitBranch className="size-4" strokeWidth={1.6} absoluteStrokeWidth />,
      tone: "action",
    },
  };
  const { icon, tone } = iconByGap[rec.gap];

  return (
    <RecoContentSection
      icon={icon}
      iconTone={tone}
      label={`${GAP_LABEL[rec.gap]} · Suggested change`}
    >
      <p>{rec.hint}</p>
      <p>
        Select{" "}
        <span className="text-foreground">Add empathy cues for distress-level reviews</span> from
        the list to see a full walkthrough of how the coach proposes changes for a review response
        agent.
      </p>
    </RecoContentSection>
  );
}

// ─── Public component ────────────────────────────────────────────────────────

export function ReviewResponseAgentRecommendationTab() {
  const [selectedId, setSelectedId] = useState<string>("empathy-distress");
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

  const tone = RECOMMENDATIONS.filter((r) => r.gap === "tone");
  const context = RECOMMENDATIONS.filter((r) => r.gap === "context");
  const action = RECOMMENDATIONS.filter((r) => r.gap === "action");
  const total = RECOMMENDATIONS.length;
  const tonePct = (tone.length / total) * 100;
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
                Most impactful ways to improve response quality
              </p>

              <div className="mt-2 flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <span
                  className={cn("h-full", GAP_BAR_COLOR.tone)}
                  style={{ width: `${tonePct}%` }}
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
                  <span className={cn("size-1.5 rounded-full", GAP_DOT_COLOR.tone)} aria-hidden />
                  Tone gaps
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
                    <Sparkles
                      className="mt-0.5 size-3.5 shrink-0 text-primary"
                      strokeWidth={1.6}
                      absoluteStrokeWidth
                    />
                    <span>
                      Based on{" "}
                      <span className="text-foreground">{COACH_INTERACTION_COUNT} reviews</span>{" "}
                      analyzed, I've identified{" "}
                      <span className="text-foreground">{total} changes</span> across tone, context,
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
                        <ListFilter
                          className="size-4 shrink-0"
                          strokeWidth={1.6}
                          absoluteStrokeWidth
                          aria-hidden
                        />
                        Filters
                        <span className="tabular-nums text-muted-foreground">
                          {activeFilterCount}
                        </span>
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
                          onCheckedChange={(checked) =>
                            setGapFilterChecked(gap, checked === true)
                          }
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
                    <Badge
                      variant="outline"
                      className={cn("shrink-0 capitalize", GAP_BADGE[selected.gap])}
                    >
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
                        aria-label="Test agent"
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

              {selected.id === "empathy-distress" ? (
                <EmpathyDistressDetail />
              ) : (
                <GenericRecommendationDetail rec={selected} />
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </TooltipProvider>
  );
}
