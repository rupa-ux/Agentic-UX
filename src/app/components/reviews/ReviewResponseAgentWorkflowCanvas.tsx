import { useState, type ReactNode } from "react";
import { ArrowDown, ArrowRight, ChevronDown, Crosshair, GitBranch, Info, ListTodo, Maximize2, Pencil, Play, Sparkles, Wrench, X, Zap } from "lucide-react";
import {
  AGENTS_BUILDER_NORTH_AUTONOMOUS_DISPLAY_NAME,
} from "@/app/components/AgentsBuilderView.v1";
import { cn } from "@/app/components/ui/utils";

// ---------------------------------------------------------------------------
// Static workflow data (view-only mirror of makeNorthAutonomousWorkflowNodes)
// ---------------------------------------------------------------------------

interface WorkflowNode {
  id: string;
  type: "agent" | "trigger" | "task" | "branch";
  title: string;
  description: string;
  enabled: boolean;
  order: number;
  config: Record<string, unknown>;
}

interface BranchPath {
  id: string;
  name: string;
  nodes: WorkflowNode[];
}

const NORTH_LOCATIONS = [
  "1001 — North Region hub",
  "1002 — Seattle, WA",
  "1003 — Portland, OR",
  "1004 — Chicago, IL",
];

const AGENT_NODE: WorkflowNode = {
  id: "node-agent",
  type: "agent",
  title: AGENTS_BUILDER_NORTH_AUTONOMOUS_DISPLAY_NAME,
  description: "500 locations",
  enabled: true,
  order: 0,
  config: {
    name: AGENTS_BUILDER_NORTH_AUTONOMOUS_DISPLAY_NAME,
    description: "500 locations",
    goals:
      "Autonomously triage incoming reviews for the North Region: detect spam and policy risk, honor each source's content rules, and route genuine reviews toward a safe, on-brand autonomous reply.",
    outcomes:
      "Reduce manual moderation load, keep public responses compliant, and maintain consistent customer experience across all connected locations.",
    locations: NORTH_LOCATIONS,
    additionalLocations: 496,
  },
};

const MAIN_NODES: WorkflowNode[] = [
  AGENT_NODE,
  {
    id: "node-1",
    type: "trigger",
    title: "When a new review is received or updated",
    description: "Agent triggers on new or updated reviews across all sources and locations.",
    enabled: true,
    order: 1,
    config: {
      triggerName: "When a new review is received or updated",
      description: "Agent triggers on new or updated reviews across all sources and locations.",
    },
  },
  {
    id: "node-2",
    type: "task",
    title: "Triage review",
    description:
      "The system checks the review to decide whether a response is required based on whether it is a genuine customer review or spam content that is irrelevant to the business or in any way violates the content policy of the source.",
    enabled: true,
    order: 2,
    config: {
      taskName: "Triage review",
      llmModel: "fast",
      systemPrompt:
        "You are the First-Line triaging agent. Analyze the incoming review if it is a genuine customer review or irrelevant spam.",
      userPrompt:
        "1. If the review content violates any content terms of {x} Review.source treat it as spam.\n2. If the review contains business-unrelated self-promotion or distracts from the business profile, treat it as spam.",
      contextChips: ["{x} Review.comment", "{x} Review.source", "https://www.yelp.com/guidelines"],
      contextMoreCount: 8,
      inputFieldChips: ["{x} Review.comment", "{x} Review.source", "{x} Review.rating"],
      outputFieldChips: ["{x} Review.isSpam", "{x} Review.spamReason"],
    },
  },
  {
    id: "north-node-branch",
    type: "branch",
    title: "Based on conditions",
    description: "Build condition-specific flows.",
    enabled: true,
    order: 3,
    config: {
      paths: [
        {
          id: "north-path-respond",
          name: "Respond",
          nodes: [
            {
              id: "north-node-review-details",
              type: "task",
              title: "Review details extraction",
              description:
                "Detects what the reviewer is talking about, maps it to the business's vocabulary, scores severity, identifies staff mentioned and competitors, and flags relevant business context details.",
              enabled: true,
              order: 0,
              config: {
                taskName: "Review details extraction",
                llmModel: "thinking",
                systemPrompt:
                  "You are a Review Intelligence Extractor. Your job is to analyze a customer review and extract details. Be precise. Do not hallucinate. If something is not mentioned or cannot be confidently inferred from the review, do not invent it — say it explicitly as unknown or omit it.",
                userPrompt:
                  "Analyze the following review:\nReview Text: {x} Review.text\nStar Rating: {x} Review.rating\n\nPerform all of the following: extract language, severity, sentiment, severity reason, escalation flag, topics, staff mentions, competitor mentions, and any other structured fields defined in your output specification.",
                contextChips: ["Location.name", "Location.brand", "location.speciality", "www.aspendental.com"],
                contextMoreCount: 2,
                inputFieldChips: ["Review.comment", "Review.rating", "Review.source", "Contact.assistedby"],
                outputFieldChips: [
                  "Review.language",
                  "Review.severity",
                  "Review.sentiment",
                  "Review.severityreason",
                  "Review.escalate",
                  "Topics",
                  "Staff_mentions",
                  "Competitor_mentions",
                ],
              },
            },
            {
              id: "north-node-response-generation",
              type: "task",
              title: "Response generation",
              description:
                "Assemble the final message using the drafted strategy, the extracted details, and the brand voice.",
              enabled: true,
              order: 1,
              config: {
                taskName: "Response generation",
                llmModel: "balanced",
                systemPrompt:
                  "You are a marketing manager specialised in writing responses to customer reviews",
                userPrompt:
                  "Write a response to {x} Review.text with Star rating: {x} Review.rating\nApply all relevant rules below (cumulative, not exclusive).\nRule 0 - LANGUAGE: Respond in the same language as the review.\nRule 1 - TONE AND VOICE: Reflect our brand voice; be respectful and solution-oriented.\nRule 2 - FACTUALITY: Do not invent details; only use information supported by the review and provided context.\nRule 3 - PLATFORM POLICY: Follow the destination platform's public posting guidelines.\nRule 4 - SENSITIVE TOPICS: Avoid unsafe or disallowed claims; escalate when unsure.",
                contextChips: [
                  "{x} Location.brand",
                  "{x} Location.name",
                  "{x} Location.alias",
                  "{x} Location.address",
                  "{x} Location.phone",
                  "{x} Location.email",
                ],
                contextMoreCount: 14,
                inputFieldChips: [
                  "{x} 4.review.sentiment",
                  "{x} 4.review.language",
                  "{x} 4.review.escalate",
                  "{x} 4.topics",
                ],
                outputFieldChips: ["{x} Review.response"],
              },
            },
            {
              id: "north-node-review-responder",
              type: "task",
              title: "Review responder",
              description: "Responds to the given review using the selected response",
              enabled: true,
              order: 2,
              config: {
                taskName: "Send a review response",
                llmModel: "fast",
                systemPrompt:
                  "You are a marketing manager specialised in responding to reviews. Given the generated response, post it to the review.",
                userPrompt:
                  "Use response from {x} 5.review.response and respond using 🔧 Review responder",
              },
            },
          ],
        },
        {
          id: "north-path-no-conditions",
          name: "No conditions met",
          nodes: [
            {
              id: "north-node-email-alert",
              type: "task",
              title: "Send an email alert",
              description:
                "Alerts specific users when a review has been marked as SPAM and user has to take an action to flag it on the review site",
              enabled: true,
              order: 0,
              config: {
                taskName: "Send an email alert",
                toolOnlyTask: true,
                toolNames: ["Send email"],
              },
            },
          ],
        },
      ] satisfies BranchPath[],
    },
  },
];

// ---------------------------------------------------------------------------
// Display order computation (mirrors AgentsBuilderView formula)
// ---------------------------------------------------------------------------

function computePathStartOrders(branchOrder: number, paths: BranchPath[]): number[] {
  const base = branchOrder;
  return paths.reduce<number[]>((acc, p, i) => {
    const prevEnd = i === 0 ? 0 : acc[i - 1]! + paths[i - 1]!.nodes.length;
    return [...acc, base + 1 + prevEnd];
  }, []);
}

// ---------------------------------------------------------------------------
// Canvas visual tokens
// ---------------------------------------------------------------------------

const CARD_W = 340;
const BRANCH_GAP = 200;
const CONNECTOR_SEGMENT_CLASS = "h-[18px] w-px bg-[#C5CAD3]";
const BRANCH_TRUNK_H = 64;
const BRANCH_ARM_H = 56;
const CARD_SHADOW = "shadow-[0_2px_6px_rgba(33,33,33,0.06)]";

// ---------------------------------------------------------------------------
// Read-only chip display
// ---------------------------------------------------------------------------

function ROChips({ chips, moreCount }: { chips: string[]; moreCount?: number }) {
  return (
    <div className="flex min-h-[40px] flex-wrap items-center gap-2 rounded-md border border-border bg-muted/30 p-2">
      {chips.map((t, i) => (
        <span
          key={`${i}-${t}`}
          className={cn(
            "max-w-full break-all rounded-md border border-primary/25 bg-primary/5 px-2 py-1 text-[13px] leading-snug text-primary",
            (t.startsWith("http") || t.startsWith("www.")) && "border-border bg-muted/30 text-foreground",
          )}
        >
          {t}
        </span>
      ))}
      {moreCount != null && moreCount > 0 && (
        <span className="text-[13px] text-muted-foreground">+ {moreCount} more</span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Panel field label
// ---------------------------------------------------------------------------

function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{children}</span>;
}

function FieldValue({ children, mono }: { children: ReactNode; mono?: boolean }) {
  return (
    <p
      className={cn(
        "min-h-[36px] rounded-md border border-border bg-muted/30 px-3 py-2 text-[13px] leading-relaxed text-foreground",
        mono && "whitespace-pre-wrap font-mono text-[12px]",
      )}
    >
      {children}
    </p>
  );
}

// ---------------------------------------------------------------------------
// LLM model display
// ---------------------------------------------------------------------------

const LLM_LABELS: Record<string, string> = {
  fast: "Fast",
  balanced: "Balanced",
  thinking: "Thinking",
  powerful: "Powerful",
};

// ---------------------------------------------------------------------------
// Right panel — read-only node detail
// ---------------------------------------------------------------------------

function NodeDetailPanel({ node, onClose }: { node: WorkflowNode; onClose: () => void }) {
  const typeLabel =
    node.type === "agent" ? "Agent details"
    : node.type === "trigger" ? "Trigger"
    : node.type === "branch" ? "Branch"
    : "Task";

  const toolOnly = node.config.toolOnlyTask === true;
  const toolNames = (node.config.toolNames as string[] | undefined) ?? [];
  const contextChips = (node.config.contextChips as string[] | undefined) ?? [];
  const contextMoreCount = node.config.contextMoreCount as number | undefined;
  const inputFieldChips = (node.config.inputFieldChips as string[] | undefined) ?? [];
  const outputFieldChips = (node.config.outputFieldChips as string[] | undefined) ?? [];
  const llmModel = node.config.llmModel as string | undefined;
  const systemPrompt = node.config.systemPrompt as string | undefined;
  const userPrompt = node.config.userPrompt as string | undefined;
  const locations = (node.config.locations as string[] | undefined) ?? [];
  const additionalLocations = node.config.additionalLocations as number | undefined;
  const goals = node.config.goals as string | undefined;
  const outcomes = node.config.outcomes as string | undefined;
  const paths = (node.config.paths as BranchPath[] | undefined) ?? [];

  return (
    <div className="flex w-[300px] shrink-0 flex-col overflow-hidden border-l border-border bg-background">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-[14px] font-medium text-foreground">{typeLabel}</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          aria-label="Close panel"
        >
          <X className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-4">

          {/* ── Agent ─────────────────────────── */}
          {node.type === "agent" && (
            <>
              <div className="flex flex-col gap-1">
                <FieldLabel>Agent name</FieldLabel>
                <FieldValue>{node.config.name as string ?? node.title}</FieldValue>
              </div>
              <div className="flex flex-col gap-1">
                <FieldLabel>Description</FieldLabel>
                <FieldValue>{node.config.description as string ?? node.description}</FieldValue>
              </div>
              {goals && (
                <div className="flex flex-col gap-1">
                  <FieldLabel>Goals</FieldLabel>
                  <FieldValue>{goals}</FieldValue>
                </div>
              )}
              {outcomes && (
                <div className="flex flex-col gap-1">
                  <FieldLabel>Outcomes</FieldLabel>
                  <FieldValue>{outcomes}</FieldValue>
                </div>
              )}
              {locations.length > 0 && (
                <div className="flex flex-col gap-1">
                  <FieldLabel>Locations</FieldLabel>
                  <div className="flex flex-wrap gap-1.5">
                    {locations.map((loc) => (
                      <span key={loc} className="rounded-md bg-muted px-2 py-1 text-[13px] text-foreground">
                        {loc}
                      </span>
                    ))}
                    {additionalLocations != null && additionalLocations > 0 && (
                      <span className="text-[13px] text-muted-foreground self-center">
                        + {additionalLocations} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Trigger ───────────────────────── */}
          {node.type === "trigger" && (
            <>
              <div className="flex flex-col gap-1">
                <FieldLabel>Trigger name</FieldLabel>
                <FieldValue>{(node.config.triggerName as string) ?? node.title}</FieldValue>
              </div>
              <div className="flex flex-col gap-1">
                <FieldLabel>Description</FieldLabel>
                <FieldValue>{(node.config.description as string) ?? node.description}</FieldValue>
              </div>
            </>
          )}

          {/* ── Task ──────────────────────────── */}
          {node.type === "task" && (
            <>
              <div className="flex flex-col gap-1">
                <FieldLabel>Task name</FieldLabel>
                <FieldValue>{(node.config.taskName as string) ?? node.title}</FieldValue>
              </div>
              <div className="flex flex-col gap-1">
                <FieldLabel>Description</FieldLabel>
                <FieldValue>{node.description}</FieldValue>
              </div>
              {toolOnly ? (
                <div className="flex flex-col gap-1">
                  <FieldLabel>Tools</FieldLabel>
                  <div className="flex flex-col gap-1">
                    {toolNames.map((tn) => (
                      <div
                        key={tn}
                        className="flex h-10 items-center gap-2 rounded-md border border-border bg-muted/30 px-3"
                      >
                        <Wrench className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.6} absoluteStrokeWidth />
                        <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">{tn}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {llmModel && (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <FieldLabel>LLM model</FieldLabel>
                        <Info className="size-3.5 text-muted-foreground" strokeWidth={1.6} absoluteStrokeWidth />
                      </div>
                      <FieldValue>{LLM_LABELS[llmModel] ?? llmModel}</FieldValue>
                    </div>
                  )}
                  {contextChips.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <FieldLabel>Context</FieldLabel>
                      <ROChips chips={contextChips} moreCount={contextMoreCount} />
                    </div>
                  )}
                  {inputFieldChips.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <FieldLabel>Input fields</FieldLabel>
                      <ROChips chips={inputFieldChips} />
                    </div>
                  )}
                  {systemPrompt && (
                    <div className="flex flex-col gap-1">
                      <FieldLabel>System prompt</FieldLabel>
                      <FieldValue mono>{systemPrompt}</FieldValue>
                    </div>
                  )}
                  {userPrompt && (
                    <div className="flex flex-col gap-1">
                      <FieldLabel>User prompt</FieldLabel>
                      <FieldValue mono>{userPrompt}</FieldValue>
                    </div>
                  )}
                  {outputFieldChips.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <FieldLabel>Output fields</FieldLabel>
                      <ROChips chips={outputFieldChips} />
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ── Branch ────────────────────────── */}
          {node.type === "branch" && (
            <>
              <div className="flex flex-col gap-1">
                <FieldLabel>Branch name</FieldLabel>
                <FieldValue>{node.title}</FieldValue>
              </div>
              <div className="flex flex-col gap-1">
                <FieldLabel>Paths</FieldLabel>
                <div className="flex flex-col gap-1.5">
                  {paths.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-md border border-border bg-muted/30 px-3 py-2 text-[13px] text-foreground"
                    >
                      {p.name}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// View-only node cards
// ---------------------------------------------------------------------------

function nodeTypeIcon(type: WorkflowNode["type"]) {
  if (type === "trigger") return <Zap className="size-[14px] text-[#F57C00]" strokeWidth={1.6} absoluteStrokeWidth />;
  if (type === "branch") return <GitBranch className="size-[14px] text-[#5C6BC0]" strokeWidth={1.6} absoluteStrokeWidth />;
  return <ListTodo className="size-[14px] text-[#00897B]" strokeWidth={1.6} absoluteStrokeWidth />;
}

function nodeTypeLabel(type: WorkflowNode["type"]) {
  if (type === "trigger") return "Trigger";
  if (type === "branch") return "Branch";
  return "Task";
}

function CanvasNodeCard({
  node,
  displayOrder,
  isSelected,
  onSelect,
}: {
  node: WorkflowNode;
  displayOrder?: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const showToggle = node.type !== "trigger";

  return (
    <button
      type="button"
      onClick={onSelect}
      style={{ width: CARD_W }}
      className={cn(
        "rounded-lg bg-white p-4 text-left transition-[border-color]",
        CARD_SHADOW,
        isSelected ? "border-2 border-[#1976d2]" : "border-2 border-transparent",
      )}
    >
      {/* Header row */}
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-0.5">
          <span className="flex w-5 shrink-0 justify-center">{nodeTypeIcon(node.type)}</span>
          <span className="text-[11px] leading-[18px] tracking-[-0.22px] text-[#8f8f8f]">
            {nodeTypeLabel(node.type)}
          </span>
        </div>
        {showToggle && (
          <span
            className="relative h-4 w-8 shrink-0 overflow-hidden rounded-full bg-[#BBBFC4]"
            aria-hidden
          >
            <span className="absolute top-[2px] left-[18px] size-3 rounded-full bg-white" />
          </span>
        )}
      </div>

      {/* Body */}
      <div className="mt-2 flex w-full items-baseline gap-0.5">
        <span className="flex w-5 shrink-0 justify-center font-sans text-[14px] font-normal leading-[20px] tracking-[-0.28px] text-[#212121] tabular-nums">
          {displayOrder ?? node.order}.
        </span>
        <div className="min-w-0 flex-1">
          <span className="block min-w-0 font-sans text-[14px] font-normal leading-[20px] tracking-[-0.28px] text-[#212121]">
            {node.title}
          </span>
          <p className="m-0 mt-1.5 max-w-full break-words p-0 text-[12px] leading-[18px] tracking-[-0.24px] text-[#8f8f8f] line-clamp-2">
            {node.description}
          </p>
        </div>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Connector between main-chain nodes
// ---------------------------------------------------------------------------

function VerticalConnector() {
  return <div className="h-8 w-px bg-[#C5CAD3]" />;
}

// ---------------------------------------------------------------------------
// Branch split SVG connector
// ---------------------------------------------------------------------------

function BranchSplitSVG({ pathCount }: { pathCount: number }) {
  const W = CARD_W;
  const G = BRANCH_GAP;
  const totalW = pathCount * W + (pathCount - 1) * G;
  const H = BRANCH_ARM_H;
  const R = 4;
  const COLOR = "#C5CAD3";

  if (pathCount <= 1) {
    return (
      <svg width={W} height={H} style={{ display: "block", overflow: "visible" }}>
        <line x1={W / 2} y1={0} x2={W / 2} y2={H} stroke={COLOR} strokeWidth="1" />
      </svg>
    );
  }

  const cx = (i: number) => i * (W + G) + W / 2;
  const leftX = cx(0);
  const rightX = cx(pathCount - 1);
  const hBar = `M ${leftX + R} 0 L ${rightX - R} 0`;
  const arms = Array.from({ length: pathCount }, (_, i) => {
    const x = cx(i);
    if (i === 0) return `M ${x + R} 0 Q ${x} 0 ${x} ${R} L ${x} ${H}`;
    if (i === pathCount - 1) return `M ${x - R} 0 Q ${x} 0 ${x} ${R} L ${x} ${H}`;
    return `M ${x} 0 L ${x} ${H}`;
  });

  return (
    <svg width={totalW} height={H} style={{ display: "block", overflow: "visible" }}>
      <path d={[hBar, ...arms].join(" ")} stroke={COLOR} strokeWidth="1" fill="none" />
    </svg>
  );
}

// Branch merge (bottom) SVG — identical shape, flipped vertically
function BranchMergeSVG({ pathCount }: { pathCount: number }) {
  const W = CARD_W;
  const G = BRANCH_GAP;
  const totalW = pathCount * W + (pathCount - 1) * G;
  const H = BRANCH_ARM_H;
  const R = 4;
  const COLOR = "#C5CAD3";

  if (pathCount <= 1) {
    return (
      <svg width={W} height={H} style={{ display: "block", overflow: "visible" }}>
        <line x1={W / 2} y1={0} x2={W / 2} y2={H} stroke={COLOR} strokeWidth="1" />
      </svg>
    );
  }

  const cx = (i: number) => i * (W + G) + W / 2;
  const leftX = cx(0);
  const rightX = cx(pathCount - 1);
  // mirror: arms go from top (y=0) up to the horizontal bar at y=H
  const hBar = `M ${leftX + R} ${H} L ${rightX - R} ${H}`;
  const arms = Array.from({ length: pathCount }, (_, i) => {
    const x = cx(i);
    if (i === 0) return `M ${x} 0 L ${x} ${H - R} Q ${x} ${H} ${x + R} ${H}`;
    if (i === pathCount - 1) return `M ${x} 0 L ${x} ${H - R} Q ${x} ${H} ${x - R} ${H}`;
    return `M ${x} 0 L ${x} ${H}`;
  });

  return (
    <svg width={totalW} height={H} style={{ display: "block", overflow: "visible" }}>
      <path d={[hBar, ...arms].join(" ")} stroke={COLOR} strokeWidth="1" fill="none" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// End chip
// ---------------------------------------------------------------------------

function EndChip() {
  return (
    <div className="flex h-7 min-w-[52px] items-center justify-center rounded-full bg-[#1976d2] px-4 text-[12px] font-medium leading-none text-white">
      End
    </div>
  );
}

// ---------------------------------------------------------------------------
// Branch path column header chip
// ---------------------------------------------------------------------------

function PathHeaderChip({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-[12px] text-foreground shadow-sm">
      <svg className="size-3.5 shrink-0 text-muted-foreground" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" />
      </svg>
      {name}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Branch column inline connector (no + button since view-only)
// ---------------------------------------------------------------------------

function BranchColumnConnector() {
  return <div className="h-10 w-px bg-[#C5CAD3]" />;
}

// ---------------------------------------------------------------------------
// Main canvas component
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Toolbar
// ---------------------------------------------------------------------------

function CanvasToolbar({ onEdit }: { onEdit: () => void }) {
  return (
    <div className="flex items-center divide-x divide-[#e0e3e8] rounded-[14px] bg-white shadow-[0_2px_10px_rgba(33,33,33,0.10)]">
      {/* Navigation arrows */}
      <div className="flex items-center gap-0.5 px-1.5 py-1.5">
        <span className="flex size-8 items-center justify-center rounded-lg bg-[#f0f2f5]">
          <ArrowDown className="size-3.5 text-[#444]" strokeWidth={1.6} absoluteStrokeWidth />
        </span>
        <span className="flex size-8 items-center justify-center rounded-lg text-[#bbbfc4]">
          <ArrowRight className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
        </span>
      </div>
      {/* Expand */}
      <div className="flex items-center px-1.5 py-1.5">
        <span className="flex size-8 items-center justify-center rounded-lg text-[#bbbfc4]">
          <Maximize2 className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
        </span>
      </div>
      {/* Zoom */}
      <div className="flex items-center px-2 py-1.5">
        <span className="flex items-center gap-1 text-[13px] leading-5 text-[#444]">
          100%
          <ChevronDown className="size-3.5 text-[#bbbfc4]" strokeWidth={1.6} absoluteStrokeWidth />
        </span>
      </div>
      {/* Separator + Position + Edit */}
      <div className="flex items-center gap-0.5 px-1.5 py-1.5">
        <span className="flex size-8 items-center justify-center rounded-lg text-[#bbbfc4]">
          <Crosshair className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
        </span>
        <button
          type="button"
          onClick={onEdit}
          title="Edit workflow"
          className="flex size-8 items-center justify-center rounded-lg text-[#555] transition-colors hover:bg-[#f0f2f5] hover:text-[#1976d2]"
        >
          <Pencil className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
        </button>
      </div>
      {/* Play */}
      <div className="flex items-center px-1.5 py-1.5">
        <span className="flex size-8 items-center justify-center rounded-lg text-[#555]">
          <Play className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main canvas component
// ---------------------------------------------------------------------------

export function ReviewResponseAgentWorkflowCanvas({ onEdit }: { onEdit?: () => void } = {}) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const mainNodes = MAIN_NODES.filter((n) => n.type !== "agent");
  const agentNode = MAIN_NODES.find((n) => n.type === "agent")!;
  const branchNode = MAIN_NODES.find((n) => n.type === "branch");
  const branchPaths: BranchPath[] = branchNode
    ? ((branchNode.config.paths as BranchPath[]) ?? [])
    : [];

  const branchOrder = branchNode?.order ?? 3;
  const pathStartOrders = computePathStartOrders(branchOrder, branchPaths);

  function findNode(id: string | null): WorkflowNode | null {
    if (!id) return null;
    for (const n of MAIN_NODES) {
      if (n.id === id) return n;
    }
    for (const path of branchPaths) {
      for (const n of path.nodes) {
        if (n.id === id) return n;
      }
    }
    return null;
  }

  const selectedNode = findNode(selectedNodeId);

  function toggle(id: string) {
    setSelectedNodeId((prev) => (prev === id ? null : id));
  }

  const totalBranchW = branchPaths.length * CARD_W + (branchPaths.length - 1) * BRANCH_GAP;

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden rounded-lg border border-border">
      {/* ── Canvas ─────────────────────────────────────────── */}
      <div
        className="relative flex min-h-0 flex-1 flex-col overflow-auto"
        style={{
          backgroundColor: "#f0f2f5",
          backgroundImage: "radial-gradient(circle, #c5cad3 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        {/* Toolbar — floating, centered at top */}
        <div className="pointer-events-none sticky top-0 z-10 flex justify-center px-4 pt-4">
          <div className="pointer-events-auto">
            <CanvasToolbar onEdit={onEdit ?? (() => {})} />
          </div>
        </div>

        {/* Workflow — centered both axes */}
        <div className="flex flex-1 items-center justify-center px-12 py-8">
          <div className="flex flex-col items-center">

            {/* Agent identity pill */}
            <button
              type="button"
              onClick={() => toggle(agentNode.id)}
              className={cn(
                "flex items-center gap-2 rounded-[200px] bg-white px-8 py-4 text-left transition-[border-color]",
                CARD_SHADOW,
                selectedNodeId === agentNode.id ? "border-2 border-[#1976d2]" : "border-2 border-transparent",
              )}
            >
              <span className="flex size-6 shrink-0 items-center justify-center" aria-hidden>
                <Sparkles className="size-5 text-[#5C35CE]" strokeWidth={1.6} absoluteStrokeWidth />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="whitespace-nowrap text-[14px] leading-5 tracking-[-0.28px] text-[#212121]">
                  {agentNode.title}
                </span>
                <span className="block text-left text-[12px] leading-[18px] tracking-[-0.24px] text-[#8f8f8f]">
                  {agentNode.description}
                </span>
              </span>
            </button>

            {/* Main chain nodes (trigger → triage → branch) */}
            {mainNodes.map((node) => (
              <div key={node.id} className="flex flex-col items-center">
                <VerticalConnector />
                <CanvasNodeCard
                  node={node}
                  displayOrder={node.order}
                  isSelected={selectedNodeId === node.id}
                  onSelect={() => toggle(node.id)}
                />
              </div>
            ))}

            {/* Branch section */}
            {branchPaths.length > 0 && (
              <div className="flex flex-col items-center">
                {/* Trunk line */}
                <div className="w-px bg-[#C5CAD3]" style={{ height: BRANCH_TRUNK_H }} />

                {/* Split SVG */}
                <BranchSplitSVG pathCount={branchPaths.length} />

                {/* Branch columns */}
                <div className="flex items-start" style={{ gap: BRANCH_GAP, width: totalBranchW }}>
                  {branchPaths.map((path, pIdx) => {
                    const startOrder = pathStartOrders[pIdx]!;
                    return (
                      <div key={path.id} className="flex flex-col items-center" style={{ width: CARD_W }}>
                        <PathHeaderChip name={path.name} />
                        {path.nodes.map((node) => (
                          <div key={node.id} className="flex flex-col items-center">
                            <BranchColumnConnector />
                            <CanvasNodeCard
                              node={node}
                              displayOrder={startOrder + node.order}
                              isSelected={selectedNodeId === node.id}
                              onSelect={() => toggle(node.id)}
                            />
                          </div>
                        ))}
                        <BranchColumnConnector />
                        <EndChip />
                      </div>
                    );
                  })}
                </div>

                {/* Merge SVG (bottom) */}
                <BranchMergeSVG pathCount={branchPaths.length} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Right detail panel ──────────────────────────────── */}
      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          onClose={() => setSelectedNodeId(null)}
        />
      )}
    </div>
  );
}
