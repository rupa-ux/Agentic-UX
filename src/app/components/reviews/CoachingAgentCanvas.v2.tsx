import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowRightLeft,
  ArrowUp,
  BookOpen,
  Check,
  ChevronLeft,
  Flag,
  ListFilter,
  ListTodo,
  Loader2,
  MessageSquare,
  Mic,
  PenLine,
  PlusCircle,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { Badge } from "@/app/components/ui/badge";

const COACHING_AI_AGENT_ICON = "/agents-builder/ai-agent.svg";

export type CoachingAgentV2 = {
  id: string;
  name: string;
};

type Impact = "low" | "medium" | "high";

type SuggestedChangeV2 = {
  nodeId: string;
  taskOrder: number;
  taskTitle: string;
  taskDescription: string;
  improvement: string;
  impact: Impact;
};

const SUGGESTED_CHANGES: SuggestedChangeV2[] = [
  {
    nodeId: "north-node-review-details",
    taskOrder: 4,
    taskTitle: "Review details extraction",
    taskDescription:
      "Detects what the reviewer is talking about, maps it to the business's vocabulary, scores severity, identifies staff mentions and repeated issues.",
    improvement:
      "context variables to capture reviewer sentiment and urgency so the response can be calibrated.",
    impact: "low",
  },
  {
    nodeId: "north-node-response-generation",
    taskOrder: 5,
    taskTitle: "Response generation",
    taskDescription:
      "Assembles the final message using the drafted strategy, the extracted details, and the brand voice.",
    improvement:
      "system prompt to acknowledge distress and offer a concrete next step instead of generic phrasing.",
    impact: "medium",
  },
];

const GAP_SEGMENTS: { id: string; label: string; weight: number; tone: string }[] = [
  { id: "knowledge", label: "Knowledge gaps", weight: 5, tone: "bg-[#2F6F4A]" },
  { id: "context", label: "Context gaps", weight: 5, tone: "bg-[#5BA577]" },
  { id: "action", label: "Action gaps", weight: 3, tone: "bg-[#B5DCBF]" },
];

/** Same copy as `RESPONSE_AGENT_FEEDBACK_ROWS[0]` in ReviewsResponseAgentsPage (Marcus Thompson / review changes workflow). */
const MARCUS_COACHING_PREVIEW = {
  customerName: "Marcus Thompson",
  initials: "MT",
  location: "New York City, NY",
  rating: 1,
  reviewDate: "Jan 7, 2023",
  reviewText:
    "I came in for a root canal and the experience was honestly terrible. The front desk was dismissive when I asked about wait times. I sat in pain for over 30 minutes without anyone checking on me. The procedure itself was rushed and the dentist didn't explain what was happening. I won't be returning.",
  originalAgentResponse:
    "Hi Marcus, thank you for your feedback. We're sorry to hear your visit did not meet expectations. We take all reviews seriously and your experience — particularly around wait times and communication — is being reviewed with our team. We'd welcome the chance to speak with you directly and make this right. Please reach out to us at your convenience.",
  responseTimeLabel: "9:22 AM",
  afterCoachingResponse:
    "Hi Marcus, sitting in pain for 30 minutes without anyone checking on you — and then having the procedure rushed without explanation — is not the care you deserved. We're genuinely sorry. Our clinical director will call you directly this week to understand what happened and make it right. Thank you for telling us.",
} as const;

// ─── Task change cards data ──────────────────────────────────────────────────

type ChangeIcon = "pen-line" | "plus-circle" | "arrow-right-left" | "book-open" | "list-filter";

type TaskChange = {
  icon: ChangeIcon;
  taskOrder: number;
  title: string;
  description: string;
  reasoning: string;
};

const TASK4_CHANGES: TaskChange[] = [
  {
    icon: "pen-line",
    taskOrder: 4,
    title: "Update system prompt",
    description:
      "Add complaint_type and severity score (1–10) extraction. Instruct the model to identify urgency signals like refund mentions and repeat complaints.",
    reasoning:
      "Without complaint_type, every review looks identical to Task 5 — it was generating the same response for a 1-star 'I'm in pain' review and a 3-star 'parking was hard' review.",
  },
  {
    icon: "plus-circle",
    taskOrder: 4,
    title: "Add extraction output fields",
    description:
      "Add reviewer_sentiment, urgency_level, and complaint_type to the structured output so Task 5 can calibrate its response.",
    reasoning:
      "Task 5 has no way to know severity or sentiment right now. These three fields give it everything it needs to vary tone and offer the right next step.",
  },
];

const TASK5_CHANGES: TaskChange[] = [
  {
    icon: "pen-line",
    taskOrder: 5,
    title: "Rewrite the agent's persona",
    description:
      "Change from 'marketing manager' to a customer experience role instructed to respond with empathy — especially for reviews mentioning pain, long waits, or being dismissed.",
    reasoning:
      "All 4 flagged responses had the same hollow tone. The current persona gives the LLM no instruction on how to handle distress, so it defaults to corporate language every time.",
  },
  {
    icon: "book-open",
    taskOrder: 5,
    title: "Add brand voice guidelines",
    description:
      "Give the agent a list of phrases to avoid and what to use instead — specific actions, direct ownership, first names.",
    reasoning:
      "Right now the agent has no brand voice to reference, so it invents tone from scratch each time. That's why you keep seeing the same filler phrases — 'we take this seriously', 'at your convenience' — across different responses.",
  },
  {
    icon: "arrow-right-left",
    taskOrder: 5,
    title: "Pass in more context from the analysis step",
    description:
      "The analysis step already figures out how serious the complaint is, what it's about, and who's mentioned — but that information isn't being sent to the response step.",
    reasoning:
      "This is why the parking complaint and the staff mention got ignored — the response step simply never received that information. The analysis had it, but wasn't sharing it. This wires them together.",
  },
  {
    icon: "list-filter",
    taskOrder: 5,
    title: "Add a rule for serious complaints",
    description:
      "For 1–2 star reviews, the agent must offer a concrete resolution — a callback, direct contact, or a specific corrective action. No more vague closings.",
    reasoning:
      "Two of the four flagged responses ended with 'hope to do better next time' on reviews where the customer was genuinely distressed. There's no rule telling the agent to offer more — this adds one.",
  },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export function CoachingAgentCanvasV2({
  agent,
  onBack,
}: {
  agent: CoachingAgentV2;
  onBack: (completed?: boolean) => void;
}) {
  type ApplyState = "idle" | "applying" | "accepted";
  const [applyState, setApplyState] = useState<ApplyState>("idle");

  function handleAccept() {
    setApplyState("applying");
    setTimeout(() => setApplyState("accepted"), 3000);
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex shrink-0 items-center gap-3 border-b border-border px-6 py-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.6} absoluteStrokeWidth />
        </button>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[15px] font-semibold leading-snug text-foreground">Coach</span>
          <div className="flex items-center gap-2">
            <span className="truncate text-[12px] leading-none text-muted-foreground">
              {agent.name}
            </span>
            <Badge variant="outline" className="shrink-0 border-emerald-300 bg-emerald-50 text-emerald-700 text-[11px]">
              Running
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <RecommendationsPanel applyState={applyState} />
        <CoachingNarrative onAccept={handleAccept} applyState={applyState} onBack={() => onBack(true)} />
      </div>
    </div>
  );
}

// ─── Left panel ─────────────────────────────────────────────────────────────

function RecommendationsPanel({ applyState }: { applyState: "idle" | "applying" | "accepted" }) {
  // per-task check state: -1 = pending, 0 = checking, 1 = done
  const [taskChecks, setTaskChecks] = useState<number[]>(
    SUGGESTED_CHANGES.map(() => -1),
  );
  const [cardsVisible, setCardsVisible] = useState(true);

  useEffect(() => {
    if (applyState !== "applying") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    SUGGESTED_CHANGES.forEach((_, i) => {
      timers.push(setTimeout(() => setTaskChecks((prev) => prev.map((v, j) => (j === i ? 0 : v))), i * 900));
      timers.push(setTimeout(() => setTaskChecks((prev) => prev.map((v, j) => (j === i ? 1 : v))), i * 900 + 600));
    });
    timers.push(setTimeout(() => setCardsVisible(false), SUGGESTED_CHANGES.length * 900 + 800));
    return () => timers.forEach(clearTimeout);
  }, [applyState]);

  const isIdle = applyState === "idle";
  const isAccepted = applyState === "accepted";

  return (
    <aside className="flex w-[360px] shrink-0 flex-col border-r border-border">
      <div className="flex shrink-0 flex-col gap-3 px-6 py-5">
        <h2 className="text-[16px] font-semibold leading-snug text-foreground">
          Recommendations
        </h2>
        {isIdle && (
          <>
            <p className="text-[13px] leading-snug text-muted-foreground">
              Most impactful ways to improve your agent&apos;s response quality
            </p>
            <GapProgressBar />
            <GapLegend />
          </>
        )}
      </div>

      {isIdle && (
        <div className="shrink-0 px-6 py-3">
          <IntroMessage />
        </div>
      )}

      {isAccepted ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-6 pb-8 text-center motion-safe:animate-[fadeIn_400ms_ease-out]">
          <span className="flex size-10 items-center justify-center rounded-full bg-emerald-100">
            <Check className="size-5 text-emerald-600" strokeWidth={2} absoluteStrokeWidth />
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-[14px] font-semibold text-foreground">All caught up for now</p>
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              Coaching applied across Tasks 4 and 5. Agent is up to date.
            </p>
          </div>
        </div>
      ) : (
        <>
          {isIdle && (
            <div className="flex shrink-0 items-center px-6 py-3">
              <span className="text-[12px] font-medium text-muted-foreground">
                {SUGGESTED_CHANGES.length} suggested changes
              </span>
            </div>
          )}
          <ul
            className={cn(
              "min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-3 flex flex-col gap-2 transition-opacity duration-500",
              !cardsVisible && "opacity-0",
            )}
          >
            {SUGGESTED_CHANGES.map((change, i) => (
              <ApplyingTaskCard
                key={change.nodeId}
                change={change}
                checkState={taskChecks[i]}
              />
            ))}
          </ul>
        </>
      )}
    </aside>
  );
}

function ApplyingTaskCard({
  change,
  checkState,
}: {
  change: SuggestedChangeV2;
  checkState: number; // -1 idle, 0 spinning, 1 done
}) {
  return (
    <div className="w-full rounded-lg border border-border bg-card p-4">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-0.5">
          <span className="flex w-5 shrink-0 justify-center">
            <ListTodo className="size-[14px] text-[#00897B]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
          </span>
          <span className="text-[11px] leading-[18px] tracking-[-0.22px] text-[#8f8f8f]">Task</span>
        </div>
        {checkState === 0 && (
          <Loader2 className="size-4 shrink-0 animate-spin text-primary" strokeWidth={1.6} absoluteStrokeWidth />
        )}
        {checkState === 1 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-emerald-100 motion-safe:animate-[fadeIn_200ms_ease-out]">
            <Check className="size-3 text-emerald-600" strokeWidth={2.5} absoluteStrokeWidth />
          </span>
        )}
      </div>
      <div className="mt-2 flex w-full items-baseline gap-0.5">
        <span className="w-5 shrink-0 text-[14px] tabular-nums leading-[20px] tracking-[-0.28px] text-[#212121]">
          {change.taskOrder}.
        </span>
        <span className="min-w-0 flex-1 text-[14px] leading-[20px] tracking-[-0.28px] text-[#212121]">
          {change.taskTitle}
        </span>
      </div>
      <p className="mt-1.5 line-clamp-2 text-[12px] leading-[18px] tracking-[-0.24px]">
        <span className="font-semibold text-[#212121]">Improve: </span>
        <span className="text-[#8f8f8f]">{change.improvement}</span>
      </p>
    </div>
  );
}

function GapProgressBar() {
  const total = GAP_SEGMENTS.reduce((sum, s) => sum + s.weight, 0);
  return (
    <div
      className="flex h-2 w-full overflow-hidden rounded-full bg-muted"
      role="progressbar"
      aria-label="Gap distribution"
    >
      {GAP_SEGMENTS.map((seg) => (
        <span
          key={seg.id}
          className={cn("block h-full", seg.tone)}
          style={{ width: `${(seg.weight / total) * 100}%` }}
          aria-label={`${seg.label}: ${seg.weight}`}
        />
      ))}
    </div>
  );
}

function GapLegend() {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1">
      {GAP_SEGMENTS.map((seg) => (
        <div key={seg.id} className="flex items-center gap-1.5">
          <span className={cn("size-2 rounded-sm", seg.tone)} aria-hidden />
          <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            {seg.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function SuggestedChangeCard({ change }: { change: SuggestedChangeV2 }) {
  return <WorkflowTaskCard taskOrder={change.taskOrder} taskTitle={change.taskTitle} taskDescription={change.taskDescription} />;
}

// ─── Right narrative ─────────────────────────────────────────────────────────

type Phase =
  | "intro"
  | "responses-reveal"
  | "task-4-acting"
  | "task-4-analyzing"
  | "task-4-result"
  | "task-5-acting"
  | "task-5-analyzing"
  | "task-5-result"
  | "comparison-prompt"
  | "accept-prompt"
  | "test-prompt"
  | "test-response";

const REVEAL_DELAY_MS = 7200;

// task-4-acting must fire after FlaggedResponsesSection fully reveals (REVEAL_DELAY_MS)
// plus reading time (~1.2s). All subsequent phases stack naturally from there.
const PHASE_TIMINGS: { phase: Phase; delayMs: number }[] = [
  { phase: "intro",              delayMs: 400  },
  { phase: "responses-reveal",   delayMs: 1200 },
  { phase: "task-4-acting",      delayMs: REVEAL_DELAY_MS + 1200 }, // after thinking anim completes
  { phase: "task-4-analyzing",   delayMs: 900  },
  { phase: "task-4-result",      delayMs: 2000 },
  { phase: "task-5-acting",      delayMs: 2400 },
  { phase: "task-5-analyzing",   delayMs: 900  },
  { phase: "task-5-result",      delayMs: 2000 },
  { phase: "comparison-prompt",  delayMs: 1800 },
  { phase: "accept-prompt",      delayMs: 2000 },
];

const PHASE_ORDER: Phase[] = PHASE_TIMINGS.map((p) => p.phase);

function phaseReached(current: Phase, target: Phase) {
  return PHASE_ORDER.indexOf(current) >= PHASE_ORDER.indexOf(target);
}

type AcceptState = "idle" | "accepted" | "dismissed";

function CoachingNarrative({
  onAccept,
  applyState,
  onBack,
}: {
  onAccept: () => void;
  applyState: "idle" | "applying" | "accepted";
  onBack: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [acceptState, setAcceptState] = useState<AcceptState>("idle");
  const [scopeSelection, setScopeSelection] = useState<"all" | "future" | "similar" | null>(null);
  const [reviewInput, setReviewInput] = useState("");
  const [submittedReview, setSubmittedReview] = useState("");
  const [hasSubmittedReview, setHasSubmittedReview] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let acc = 0;
    PHASE_TIMINGS.forEach((step, i) => {
      if (i === 0) {
        acc += step.delayMs;
        timers.push(setTimeout(() => setPhase(step.phase), acc));
        return;
      }
      acc += step.delayMs;
      timers.push(setTimeout(() => setPhase(step.phase), acc));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [scopeSelection]);

  useEffect(() => {
    if (!scrollRef.current) return;
    const id = setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 80);
    return () => clearTimeout(id);
  }, [phase, hasSubmittedReview]);

  function handleSubmitReview(e: FormEvent) {
    e.preventDefault();
    if (!reviewInput.trim()) return;
    setSubmittedReview(reviewInput.trim());
    setHasSubmittedReview(true);
    setPhase("test-response");
    setReviewInput("");
  }

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-8">

          {/* Flagged responses — why each one was thumbs-downed */}
          {phaseReached(phase, "responses-reveal") ? <FlaggedResponsesSection /> : null}

          {/* Acting on Task 4 */}
          {phaseReached(phase, "task-4-acting") ? (
            <ActingOnSection
              change={SUGGESTED_CHANGES[0]}
              changes={TASK4_CHANGES}
              isAnalyzing={phase === "task-4-acting" || phase === "task-4-analyzing"}
              showResult={phaseReached(phase, "task-4-result")}
            />
          ) : null}

          {/* Acting on Task 5 */}
          {phaseReached(phase, "task-5-acting") ? (
            <ActingOnSection
              change={SUGGESTED_CHANGES[1]}
              changes={TASK5_CHANGES}
              isAnalyzing={phase === "task-5-acting" || phase === "task-5-analyzing"}
              showResult={phaseReached(phase, "task-5-result")}
            />
          ) : null}

          {/* Before / after response comparison */}
          {phaseReached(phase, "comparison-prompt") ? <BeforeAfterBlock /> : null}

          {/* Accept card + pre-accept test nudge */}
          {phaseReached(phase, "accept-prompt") && acceptState === "idle" ? (
            <>
              <AcceptCoachingCard
                onAccept={() => { setAcceptState("accepted"); setPhase("test-prompt"); onAccept(); }}
                onDismiss={() => setAcceptState("dismissed")}
              />
              {!hasSubmittedReview && (
                <AgentMessage>
                  <p className="text-[14px] leading-relaxed text-foreground">
                    Not sure yet? Paste a review in the box below — I&apos;ll show you exactly how
                    the updated agent would respond before you commit.
                  </p>
                </AgentMessage>
              )}
            </>
          ) : null}

          {/* Conversation thread — always renders once review is submitted */}
          {hasSubmittedReview ? (
            <ReviewConversation
              reviewInput={submittedReview}
              showResponse={phase === "test-response"}
              acceptState={acceptState}
              hideUserBubble={acceptState === "accepted"}
              onAccept={() => { setAcceptState("accepted"); setPhase("test-prompt"); onAccept(); }}
              onDismiss={() => setAcceptState("dismissed")}
            />
          ) : null}

          {/* Applying — synced with panel animation */}
          {acceptState === "accepted" && applyState === "applying" ? (
            <div className="flex items-center gap-3 rounded-lg bg-card px-5 py-4 motion-safe:animate-[fadeIn_280ms_ease-out]">
              <Loader2 className="size-5 shrink-0 animate-spin text-primary" strokeWidth={1.6} absoluteStrokeWidth />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="text-[14px] font-medium text-foreground">Applying coaching…</p>
                <p className="text-[12px] text-muted-foreground">
                  Updating Tasks 4 and 5 with the recommended changes.
                </p>
              </div>
            </div>
          ) : null}

          {/* Accepted confirmation */}
          {acceptState === "accepted" && applyState === "accepted" ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-emerald-200 bg-card px-6 py-6 text-center motion-safe:animate-[fadeIn_400ms_ease-out]">
              <span className="flex size-10 items-center justify-center rounded-full bg-emerald-50">
                <Check className="size-5 text-emerald-600" strokeWidth={2} absoluteStrokeWidth />
              </span>
              <div className="flex flex-col gap-1">
                <p className="text-[15px] font-semibold text-foreground">Coaching applied</p>
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  The agent has been updated with {SUGGESTED_CHANGES.length} changes across Tasks 4 and 5.
                  Future responses will reflect the new persona, context, and rules.
                </p>
              </div>
            </div>
          ) : null}

          {/* Scope selector */}
          {acceptState === "accepted" && applyState === "accepted" ? (
            <ScopeSelector selected={scopeSelection} onSelect={setScopeSelection} onDone={onBack} />
          ) : null}

          {/* Dismissed state */}
          {acceptState === "dismissed" ? (
            <AgentMessage>
              <p className="text-[14px] leading-relaxed text-muted-foreground">
                Got it — changes set aside. You can re-run coaching anytime from the Coach agent menu.
              </p>
            </AgentMessage>
          ) : null}

        </div>
      </div>

      {/* Sticky bottom input — always visible */}
      <div className="shrink-0 bg-background px-6 py-2">
        <form
          onSubmit={handleSubmitReview}
          className="mx-auto flex max-w-4xl flex-col gap-1.5 rounded-lg border border-border bg-card px-3 py-2 transition-shadow focus-within:shadow-sm"
        >
          <textarea
            value={reviewInput}
            onChange={(e) => setReviewInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmitReview(e as unknown as FormEvent);
              }
            }}
            placeholder="Ask anything or follow up with additional improvements"
            rows={2}
            className="max-h-[44px] min-h-[36px] w-full resize-none overflow-y-auto border-0 bg-transparent text-[13px] leading-[18px] text-foreground outline-none placeholder:text-muted-foreground"
          />
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Voice input"
              className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Mic className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
            </button>
            <button
              type="submit"
              aria-label="Send"
              disabled={!reviewInput.trim()}
              className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground transition-opacity disabled:opacity-30"
            >
              <ArrowUp className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

// ─── Intro ───────────────────────────────────────────────────────────────────

function IntroMessage() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
        <img
          src={COACHING_AI_AGENT_ICON}
          alt=""
          width={16}
          height={17}
          className="block h-[17px] w-4 max-w-none object-contain"
          decoding="async"
        />
      </span>
      <p className="text-[12px] leading-relaxed text-foreground">
        Based on your <span className="font-medium">4 flagged responses</span>, I&apos;ve identified{" "}
        <span className="font-medium">3 changes</span> across{" "}
        <span className="font-medium">2 nodes</span> in your workflow.
      </p>
    </div>
  );
}

// ─── Flagged responses section ───────────────────────────────────────────────

const THINKING_STEPS = [
  "Scanning 4 flagged responses…",
  "Spotting recurring tone patterns…",
  "Checking what context was dropped…",
  "Mapping failures back to workflow nodes…",
  "Ready.",
];

const STEP_DELAYS_MS = [0, 1600, 3200, 4900, 6400];

function FlaggedResponsesSection() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    STEP_DELAYS_MS.forEach((delay, i) => {
      timers.push(setTimeout(() => setCurrentStep(i), delay));
    });
    timers.push(setTimeout(() => setRevealed(true), REVEAL_DELAY_MS));
    return () => timers.forEach(clearTimeout);
  }, []);

  if (!revealed) {
    return (
      <div className="flex flex-col gap-2 motion-safe:animate-[fadeIn_280ms_ease-out]">
        {THINKING_STEPS.slice(0, currentStep + 1).map((step, i) => {
          const isDone = i < currentStep;
          const isActive = i === currentStep;
          return (
            <div
              key={i}
              className="flex items-center gap-2.5 motion-safe:animate-[fadeIn_220ms_ease-out]"
            >
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px]",
                  isDone
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {isDone ? (
                  <Check className="size-3" strokeWidth={2} absoluteStrokeWidth />
                ) : (
                  <span className="flex gap-0.5">
                    <span className="block size-1 animate-[analyzingDot_900ms_ease-in-out_infinite] rounded-full bg-muted-foreground/70 [animation-delay:0ms]" />
                    <span className="block size-1 animate-[analyzingDot_900ms_ease-in-out_infinite] rounded-full bg-muted-foreground/70 [animation-delay:150ms]" />
                    <span className="block size-1 animate-[analyzingDot_900ms_ease-in-out_infinite] rounded-full bg-muted-foreground/70 [animation-delay:300ms]" />
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "text-[13px] leading-snug transition-colors",
                  isDone ? "text-muted-foreground/60" : isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 motion-safe:animate-[fadeIn_280ms_ease-out]">
      <SectionLabel
        icon={<AlertCircle className="size-4 text-destructive" strokeWidth={1.6} absoluteStrokeWidth />}
        title="What went wrong"
      />
      <div className="flex flex-col gap-0 overflow-hidden rounded-lg border border-border bg-card">
        {FLAGGED_PATTERNS.map((p, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-3">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-[10px] font-semibold tabular-nums text-destructive">
              {p.count}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-[13px] font-medium leading-snug text-foreground">{p.label}</span>
              <span className="text-[12px] leading-relaxed text-muted-foreground">{p.detail}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-[13px] font-semibold leading-snug text-amber-900">Root cause</p>
        <ul
          role="list"
          className="mt-2 flex flex-col gap-1.5 text-[13px] leading-snug text-amber-800"
        >
          {ROOT_CAUSE_BULLETS.map((line) => (
            <li key={line} className="flex gap-2">
              <span
                className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600"
                aria-hidden
              />
              <span className="min-w-0">{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const ROOT_CAUSE_BULLETS = [
  "Task 4 isn't extracting sentiment or urgency.",
  "Task 5 has no instruction for handling distress.",
  "Every response lands with the same flat tone regardless of the reviewer's situation.",
] as const;

const FLAGGED_PATTERNS: { label: string; count: string; detail: string }[] = [
  {
    label: "Tone",
    count: "3",
    detail: "Responses used corporate boilerplate despite customers expressing distress or physical discomfort.",
  },
  {
    label: "Action gaps",
    count: "2",
    detail: "Responses offered no concrete next step — refund requests and escalation paths were left unaddressed.",
  },
  {
    label: "Context dropped",
    count: "2",
    detail: "Responses ignored key details the customer explicitly mentioned: surgery recovery, a repeated staff complaint.",
  },
];

// ─── Before / after response comparison ─────────────────────────────────────

function BeforeAfterBlock() {
  const p = MARCUS_COACHING_PREVIEW;
  return (
    <div className="flex flex-col gap-3 motion-safe:animate-[fadeIn_280ms_ease-out]">
      <AgentMessage>
        <p className="text-[12px] leading-snug text-foreground">
          Here&apos;s how the same review would have been handled before and after the changes.
        </p>
      </AgentMessage>

      {/* Original — flagged */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between gap-2 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-amber-50">
              <Flag className="size-3.5 text-amber-600" strokeWidth={1.6} absoluteStrokeWidth />
            </span>
            <span className="text-[12px] font-medium text-foreground">Original response</span>
          </div>
          <Badge className="border-0 bg-destructive/10 text-[10px] text-destructive">Flagged</Badge>
        </div>
        <div className="px-4 py-3">
          <p className="text-[12px] leading-relaxed text-muted-foreground">{p.originalAgentResponse}</p>
        </div>
        <div className="bg-muted/30 px-4 py-2.5">
          <button
            type="button"
            className="text-[11px] text-primary hover:underline"
            onClick={(e) => {
              const el = e.currentTarget.nextElementSibling as HTMLElement | null;
              if (el) el.style.display = el.style.display === "none" ? "block" : "none";
              e.currentTarget.textContent =
                e.currentTarget.textContent === "View review" ? "Hide review" : "View review";
            }}
          >
            View review
          </button>
          <div style={{ display: "none" }} className="mt-2">
            <div className="flex gap-2">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                {p.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium text-foreground">{p.customerName}</span>
                  <span className="text-[11px] text-muted-foreground">{p.reviewDate}</span>
                </div>
                <div className="flex gap-0.5 py-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn("size-2.5", i < p.rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted")}
                      strokeWidth={0}
                    />
                  ))}
                </div>
                <p className="text-[12px] leading-relaxed text-muted-foreground">{p.reviewText}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* After coaching */}
      <div className="overflow-hidden rounded-lg border border-emerald-200 bg-card">
        <div className="flex items-center gap-2 px-4 py-2.5">
          <span className="flex size-6 items-center justify-center rounded-md bg-emerald-50">
            <MessageSquare className="size-3.5 text-emerald-600" strokeWidth={1.6} absoluteStrokeWidth />
          </span>
          <span className="text-[12px] font-medium text-foreground">After coaching</span>
          <Badge className="ml-auto border-0 bg-emerald-100 text-[10px] text-emerald-700">Updated</Badge>
        </div>
        <div className="px-4 py-3">
          <p className="text-[12px] leading-relaxed text-muted-foreground">{p.afterCoachingResponse}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Acting on section ────────────────────────────────────────────────────────

function ActingOnSection({
  change,
  changes,
  isAnalyzing,
  showResult,
}: {
  change: SuggestedChangeV2;
  changes: TaskChange[];
  isAnalyzing: boolean;
  showResult: boolean;
}) {
  const [cardVisible, setCardVisible] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setCardVisible(true), 1400);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="flex flex-col gap-4 pt-6">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Acting on
        </span>
      </div>

      {!cardVisible ? (
        <AnalyzingLabel />
      ) : (
        <>
          <div className="motion-safe:animate-[fadeIn_280ms_ease-out]">
            <WorkflowTaskCard
              taskOrder={change.taskOrder}
              taskTitle={change.taskTitle}
              taskDescription={change.taskDescription}
              isAnalyzing={isAnalyzing}
            />
          </div>

          {isAnalyzing ? <AnalyzingLabel /> : null}

          {showResult ? (
            <div className="flex flex-col gap-3 motion-safe:animate-[fadeIn_280ms_ease-out]">
              <SectionLabel
                icon={<PenLine className="size-4 text-muted-foreground" strokeWidth={1.6} absoluteStrokeWidth />}
                title="What I'll change — and why"
              />
              <ChangesGroupCard changes={changes} />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

// ─── Workflow task card (matches canvas NodeCard style) ──────────────────────

function WorkflowTaskCard({
  taskOrder,
  taskTitle,
  taskDescription,
  isAnalyzing,
}: {
  taskOrder: number;
  taskTitle: string;
  taskDescription: string;
  isAnalyzing?: boolean;
}) {
  return (
    <div className="w-full rounded-lg border border-border bg-muted/40 p-4 dark:bg-muted/20">
      {/* Header */}
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-0.5">
          <span className="flex w-5 shrink-0 justify-center">
            <ListTodo className="size-[14px] text-[#00897B]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
          </span>
          <span className="text-[11px] leading-[18px] tracking-[-0.22px] text-[#8f8f8f]">Task</span>
        </div>
        {isAnalyzing ? (
          <Loader2 className="size-4 shrink-0 animate-spin text-primary" strokeWidth={1.6} absoluteStrokeWidth />
        ) : null}
      </div>
      {/* Body */}
      <div className="mt-2 flex w-full items-baseline gap-0.5">
        <span className="flex w-5 shrink-0 justify-center m-0 p-0 font-sans text-[14px] font-normal leading-[20px] tracking-[-0.28px] text-[#212121] tabular-nums">
          {taskOrder}.
        </span>
        <div className="min-w-0 flex-1">
          <span className="block min-w-0 m-0 p-0 font-sans text-[14px] font-normal leading-[20px] tracking-[-0.28px] text-[#212121]">
            {taskTitle}
          </span>
          <p className="m-0 mt-1.5 max-w-full break-words p-0 text-[12px] leading-[18px] tracking-[-0.24px] text-[#8f8f8f] line-clamp-2">
            {taskDescription}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Rich change card ─────────────────────────────────────────────────────────

function changeIcon(icon: ChangeIcon, cls = "size-4 text-foreground") {
  const sw = 1.6;
  switch (icon) {
    case "pen-line": return <PenLine className={cls} strokeWidth={sw} absoluteStrokeWidth />;
    case "plus-circle": return <PlusCircle className={cls} strokeWidth={sw} absoluteStrokeWidth />;
    case "arrow-right-left": return <ArrowRightLeft className={cls} strokeWidth={sw} absoluteStrokeWidth />;
    case "book-open": return <BookOpen className={cls} strokeWidth={sw} absoluteStrokeWidth />;
    case "list-filter": return <ListFilter className={cls} strokeWidth={sw} absoluteStrokeWidth />;
  }
}

function ChangesGroupCard({ changes }: { changes: TaskChange[] }) {
  const taskOrder = changes[0]?.taskOrder;
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card px-4 py-4">
      {/* Task chip — top-right */}
      {taskOrder != null && (
        <div className="mb-3 flex justify-start">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
            Task {taskOrder}
          </span>
        </div>
      )}
      <div className="flex flex-col gap-5">
        {changes.map((change, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
              {changeIcon(change.icon, "size-3.5 text-primary")}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-[13px] font-medium leading-snug text-foreground">{change.title}</span>
              <span className="text-[12px] leading-relaxed text-muted-foreground">{change.description}</span>
              <div className="mt-1.5 flex flex-col gap-0.5">
                <span className="text-[11px] font-semibold text-foreground">Why</span>
                <p className="text-[11px] italic leading-relaxed text-muted-foreground">{change.reasoning}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ─── Scope selector ──────────────────────────────────────────────────────────

const SCOPE_OPTIONS: {
  id: "all" | "future" | "similar";
  title: string;
  description: string;
}[] = [
  {
    id: "all",
    title: "All feedback",
    description: "Apply to all 4 flagged responses and any backlog waiting for a reply.",
  },
  {
    id: "future",
    title: "All future responses",
    description: "Only new reviews from today — doesn't touch anything already sent.",
  },
  {
    id: "similar",
    title: "Only similar complaints",
    description: "Reviews flagged for tone or action gaps, like these 4.",
  },
];

function ScopeSelector({
  selected,
  onSelect,
  onDone,
}: {
  selected: "all" | "future" | "similar" | null;
  onSelect: (s: "all" | "future" | "similar") => void;
  onDone: () => void;
}) {
  function handleSelect(s: "all" | "future" | "similar") {
    onSelect(s);
    const label = SCOPE_OPTIONS.find((o) => o.id === s)?.title ?? "selected responses";
    toast(`Agent updated — coaching applied to ${label.toLowerCase()}.`, {
      description: "Changes are live. Future responses will reflect the new rules.",
      icon: (
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
          <Check className="size-3 text-emerald-600" strokeWidth={2.5} />
        </span>
      ),
    });
    setTimeout(onDone, 1600);
  }

  return (
    <div className="flex flex-col gap-3 motion-safe:animate-[fadeIn_280ms_ease-out]">
      <AgentMessage>
        <p className="text-[14px] leading-relaxed text-foreground">
          Where should these changes take effect?
        </p>
      </AgentMessage>
      <div className="flex flex-col gap-2">
        {SCOPE_OPTIONS.map((opt) => {
          const active = selected === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                active
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:bg-muted/50",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  active ? "border-primary bg-primary" : "border-muted-foreground/40 bg-transparent",
                )}
              >
                {active && (
                  <span className="size-1.5 rounded-full bg-white" />
                )}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className={cn("text-[13px] font-medium leading-snug", active ? "text-primary" : "text-foreground")}>
                  {opt.title}
                </span>
                <span className="text-[12px] leading-relaxed text-muted-foreground">
                  {opt.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      {selected ? (
        <AgentMessage>
          <p className="text-[13px] leading-relaxed text-muted-foreground motion-safe:animate-[fadeIn_220ms_ease-out]">
            Got it — coaching will apply to{" "}
            <span className="font-medium text-foreground">
              {SCOPE_OPTIONS.find((o) => o.id === selected)?.title.toLowerCase()}
            </span>
            . Now let&apos;s make sure it works.
          </p>
        </AgentMessage>
      ) : null}
    </div>
  );
}

// ─── Accept coaching card ─────────────────────────────────────────────────────

function AcceptCoachingCard({
  onAccept,
  onDismiss,
}: {
  onAccept: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card motion-safe:animate-[fadeIn_280ms_ease-out]">
      <div className="flex items-start gap-3 px-5 py-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="size-4 text-primary" strokeWidth={1.6} absoluteStrokeWidth />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-[14px] font-semibold text-foreground">Accept this coaching</span>
          <p className="text-[13px] leading-snug text-muted-foreground">
            Apply these changes to update the agent&apos;s configuration and improve future responses.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 px-5 pb-4">
        <button
          type="button"
          onClick={onDismiss}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-1.5 text-[13px] text-foreground transition-colors hover:bg-muted"
        >
          <X className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
          Dismiss
        </button>
        <button
          type="button"
          onClick={onAccept}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-[13px] text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Check className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
          Accept changes
        </button>
      </div>
    </div>
  );
}

// ─── Test with a review (scroll transcript + fixed composer) ────────────────

function generateAgentResponse(review: string): string {
  const r = review.toLowerCase();

  const has = (...words: string[]) => words.some((w) => r.includes(w));

  if (has("ambience", "ambiance", "atmosphere", "noisy", "loud", "dirty", "uncomfortable", "decor", "lighting", "smell", "smell")) {
    return `Thank you for sharing this — the environment you're welcomed into matters, and what you described isn't what we aim for. We've passed your feedback directly to our operations team so it gets attention before your next visit. If you'd like to share more details or give us another chance, please reach out to us at north-help@birdeye.com and mention this review. We'd genuinely like to make it right.`;
  }
  if (has("wait", "waited", "slow", "long time", "30 minutes", "hour", "delayed", "took forever")) {
    return `Waiting that long without any update is genuinely frustrating, and we're sorry we put you through that. That kind of experience falls short of what we promise. Our team is reviewing our wait-time process directly. If you'd like to speak with our manager, email us at north-help@birdeye.com — we want to hear what happened and make sure it doesn't repeat.`;
  }
  if (has("staff", "rude", "unfriendly", "dismissive", "attitude", "unprofessional", "ignored", "unhelpful", "disrespect")) {
    return `The way you were treated by our team isn't something we take lightly. Every person walking through our door deserves to be treated with care and respect — and we fell short of that for you. We're addressing this with the team directly. Please reach out to our manager at north-help@birdeye.com so we can follow up personally and make this right.`;
  }
  if (has("food", "taste", "cold", "raw", "undercooked", "overcooked", "flavour", "flavor", "meal", "dish", "portion")) {
    return `We're really sorry the food didn't meet your expectations — that's not the standard we hold ourselves to. Your specific feedback has been passed to our kitchen team so they can address it. We'd love the chance to change your experience. Email us at north-help@birdeye.com and we'll arrange a visit on us.`;
  }
  if (has("refund", "money", "charged", "overcharged", "billing", "invoice", "payment")) {
    return `A billing concern like this needs to be resolved quickly — we understand how frustrating it is when charges don't match expectations. Please email us at north-help@birdeye.com with your order or booking reference and we'll have our billing team look into it and get back to you within 24 hours.`;
  }
  if (has("pain", "hurt", "injury", "uncomfortable", "procedure", "medical", "surgery", "rushed")) {
    return `We're truly sorry to hear this. Experiencing pain or discomfort and not having it acknowledged is unacceptable — you deserved better care than what we provided. Our clinical director will reach out to you directly this week. If you'd prefer to speak sooner, please contact us at north-help@birdeye.com and reference this review.`;
  }
  if (has("parking", "park", "space", "car", "location", "find", "access", "difficult to")) {
    return `We hear you — arriving to difficulty finding parking adds unnecessary stress before you've even walked in the door. We're working with our facilities team on this. In the meantime, we can share parking tips for nearby options if you email us at north-help@birdeye.com. Thank you for flagging this.`;
  }
  if (has("price", "expensive", "overpriced", "value", "worth", "cost", "cheap")) {
    return `We appreciate you being upfront about this. Feeling like you didn't get value for your money is a concern we take seriously. We'd love to understand your experience better — please reach out at north-help@birdeye.com and our team will make sure your next visit reflects the quality you expected.`;
  }
  if (has("clean", "hygiene", "hygeinic", "sanitiz", "dirty", "mess", "dust", "washroom", "toilet", "bathroom")) {
    return `Cleanliness and hygiene are non-negotiable for us, and we're sorry the standards weren't met during your visit. This has been escalated to our facilities manager for immediate attention. Thank you for telling us — if you'd like to follow up, please contact us at north-help@birdeye.com.`;
  }

  // fallback — generic but still specific and empathetic
  return `Thank you for taking the time to share your experience, and we're genuinely sorry it fell short of what you deserved. Your feedback has been shared with our team so we can address it directly. We'd welcome the chance to make things right — please reach out to us at north-help@birdeye.com and reference this review. We're listening.`;
}

function ReviewConversation({
  reviewInput,
  showResponse,
  acceptState,
  hideUserBubble,
  onAccept,
  onDismiss,
}: {
  reviewInput: string;
  showResponse: boolean;
  acceptState: AcceptState;
  hideUserBubble?: boolean;
  onAccept: () => void;
  onDismiss: () => void;
}) {
  const [showTyping, setShowTyping] = useState(true);
  const [showAcceptAgain, setShowAcceptAgain] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowTyping(false), 2000);
    const t2 = setTimeout(() => setShowAcceptAgain(true), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col gap-4 motion-safe:animate-[fadeIn_220ms_ease-out]">
      {/* User review — right-aligned bubble (hidden after coaching is committed) */}
      {!hideUserBubble ? (
        <div className="flex flex-col items-end gap-1">
          <div className="max-w-[78%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 shadow-sm">
            <p className="text-[13px] leading-relaxed text-primary-foreground">{reviewInput}</p>
          </div>
          <span className="pr-1 text-[10px] text-muted-foreground">{now}</span>
        </div>
      ) : null}

      {/* Typing indicator */}
      {showTyping ? (
        <div className="flex items-end gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-card">
            <img src={COACHING_AI_AGENT_ICON} alt="" width={14} height={15} className="block h-[15px] w-[14px] object-contain" decoding="async" />
          </span>
          <div className="flex h-8 items-center gap-1 rounded-2xl rounded-bl-sm border border-border bg-card px-3">
            <span className="size-1.5 animate-[analyzingDot_900ms_ease-in-out_infinite] rounded-full bg-muted-foreground/60 [animation-delay:0ms]" />
            <span className="size-1.5 animate-[analyzingDot_900ms_ease-in-out_infinite] rounded-full bg-muted-foreground/60 [animation-delay:180ms]" />
            <span className="size-1.5 animate-[analyzingDot_900ms_ease-in-out_infinite] rounded-full bg-muted-foreground/60 [animation-delay:360ms]" />
          </div>
        </div>
      ) : null}

      {/* Agent response — left-aligned */}
      {showResponse && !showTyping ? (
        <div className="flex flex-col gap-1.5 motion-safe:animate-[fadeIn_280ms_ease-out]">
          <div className="flex items-end gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-card">
              <img src={COACHING_AI_AGENT_ICON} alt="" width={14} height={15} className="block h-[15px] w-[14px] object-contain" decoding="async" />
            </span>
            <div className="max-w-[78%] rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3 shadow-sm">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-primary">
                Updated agent response
              </p>
              <p className="text-[13px] leading-relaxed text-foreground">
                {generateAgentResponse(reviewInput)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 pl-9">
            <span className="text-[10px] text-muted-foreground">{now}</span>
            <span className="text-[10px] text-emerald-600">· Delivered</span>
            <Badge className="ml-1 border-0 bg-emerald-100 px-1.5 text-[9px] text-emerald-700">
              Coaching active
            </Badge>
          </div>
        </div>
      ) : null}

      {/* Agent follow-up + coaching card re-surface */}
      {showAcceptAgain && acceptState === "idle" ? (
        <div className="motion-safe:animate-[fadeIn_280ms_ease-out]">
          <AcceptCoachingCard onAccept={onAccept} onDismiss={onDismiss} />
        </div>
      ) : null}
    </div>
  );
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function AgentMessage({ children, compact }: { children: React.ReactNode; compact?: boolean }) {
  return (
    <div className={cn("flex", compact ? "gap-2" : "gap-3")}>
      <span
        className={cn(
          "mt-0.5 flex shrink-0 items-center justify-center",
          compact ? "size-5" : "size-6",
        )}
        aria-hidden
      >
        <img
          src={COACHING_AI_AGENT_ICON}
          alt=""
          width={compact ? 18 : 22}
          height={compact ? 19 : 23}
          className={cn(
            "block max-w-none object-contain",
            compact ? "h-[19px] w-[18px]" : "h-[23px] w-[22px]",
          )}
          decoding="async"
        />
      </span>
      <div className={cn("flex min-w-0 flex-1 flex-col", compact ? "gap-1.5" : "gap-2")}>{children}</div>
    </div>
  );
}

function SectionLabel({
  icon,
  title,
  prefix,
}: {
  icon?: React.ReactNode;
  title?: string;
  prefix?: React.ReactNode;
}) {
  if (prefix) return <div className="flex items-center gap-2">{prefix}</div>;
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-[13px] font-medium text-foreground">{title}</span>
    </div>
  );
}

function AnalyzingLabel() {
  return (
    <div className="flex items-center gap-2 pl-1">
      <span className="inline-flex h-4 items-end gap-0.5" aria-hidden>
        <span className="block size-1 animate-[analyzingDot_900ms_ease-in-out_infinite] rounded-full bg-muted-foreground/70 [animation-delay:0ms]" />
        <span className="block size-1 animate-[analyzingDot_900ms_ease-in-out_infinite] rounded-full bg-muted-foreground/70 [animation-delay:150ms]" />
        <span className="block size-1 animate-[analyzingDot_900ms_ease-in-out_infinite] rounded-full bg-muted-foreground/70 [animation-delay:300ms]" />
      </span>
      <span className="text-[13px] italic text-muted-foreground">Analyzing</span>
      <style>{`
        @keyframes analyzingDot {
          0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-2px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
