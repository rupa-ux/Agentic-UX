import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUp, ExternalLink, GitBranch, ListTodo, Mic } from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { FLOATING_PANEL_DOCKED_SURFACE_CLASSNAME } from "@/app/components/ui/floatingPanelSurface";
import { useAgentsBuilderCanvasPanel } from "@/app/components/reviews/agentsBuilderCanvasPanelContext";

const PANEL_WIDTH_PX = 300;
/** Same asset as agents builder agent identity (Figma Review Response agent 2.0). */
const COACHING_AI_AGENT_ICON = "/agents-builder/ai-agent.svg";

const NODE_CARD_GLYPH_COL_CLASS = "flex w-5 shrink-0 justify-center";
/** Same as `NODE_CARD_BODY_PRIMARY_TEXT_CLASS` on the canvas — one row wrapper so order + title inherit identical 14px metrics (avoids base `button` / root font quirks). */
const NODE_CARD_BODY_PRIMARY_ROW_CLASS =
  "m-0 p-0 font-sans text-[14px] font-normal leading-[20px] tracking-[-0.28px] text-[#212121]";
/** Same as `NODE_CARD_BODY_DESCRIPTION_CLASS` on the canvas (without `line-clamp-2` so full issue text shows). */
const NODE_CARD_BODY_DESCRIPTION_CLASS =
  "m-0 mt-1.5 max-w-full break-words p-0 text-[12px] font-normal leading-[18px] tracking-[-0.24px] text-[#8f8f8f]";

type NodeType = "task" | "branch";

export type NodeInsight = {
  nodeId: string;
  nodeType: NodeType;
  /** Same string as the canvas task card title (`WorkflowNode.title`). */
  canvasTitle: string;
  /** Same numbering as `NodeCard` `displayOrder` on the north preset branch path. */
  displayOrder: number;
  currentIssue: string;
  changeCount: number;
};

export const NODE_INSIGHTS: Record<string, Omit<NodeInsight, "nodeId">> = {
  "north-node-response-generation": {
    nodeType: "task",
    canvasTitle: "Response generation",
    displayOrder: 5,
    currentIssue:
      "system prompt to acknowledge distress and offer a concrete next step instead of generic phrasing.",
    changeCount: 2,
  },
  "north-node-review-details": {
    nodeType: "task",
    canvasTitle: "Review details extraction",
    displayOrder: 4,
    currentIssue:
      "context variables to capture reviewer sentiment and urgency so the response can be calibrated.",
    changeCount: 1,
  },
};

const FALLBACK_INSIGHT: Omit<NodeInsight, "nodeId"> = {
  nodeType: "task",
  canvasTitle: "Agent node",
  displayOrder: 0,
  currentIssue: "This node has been flagged for improvement based on recent feedback.",
  changeCount: 1,
};

function getInsight(nodeId: string): Omit<NodeInsight, "nodeId"> {
  return NODE_INSIGHTS[nodeId] ?? { ...FALLBACK_INSIGHT };
}

// ─── Conversation messages ──────────────────────────────────────────────────

type AgentResponseKind = "root-cause" | "proposed-change";

type Message =
  | { type: "user"; text: string }
  | { type: "agent"; kind: AgentResponseKind };

type Suggestion = { label: string; responseKind: AgentResponseKind | null };

const INITIAL_SUGGESTIONS: Suggestion[] = [
  { label: "Analyze root cause", responseKind: "root-cause" },
  { label: "View proposed change", responseKind: "proposed-change" },
  { label: "Apply to all responses", responseKind: null },
  { label: "Test with a review", responseKind: null },
];

const ROOT_CAUSE_FOLLOWUPS: Suggestion[] = [
  { label: "View proposed change", responseKind: "proposed-change" },
  { label: "Which one is most critical?", responseKind: null },
  { label: "Show me an example failure", responseKind: null },
];

const PROPOSED_CHANGE_FOLLOWUPS: Suggestion[] = [
  { label: "Apply to Task 5", responseKind: null },
  { label: "Apply to Task 4", responseKind: null },
  { label: "Apply all changes", responseKind: null },
  { label: "Test with a review", responseKind: null },
  { label: "Analyze root cause", responseKind: "root-cause" },
];

const ROOT_CAUSES: { title: string; body: string }[] = [
  {
    title: "No emotional register in system prompt",
    body: "Task 5's persona has no instruction for distress, pain, or repeated failures — the LLM defaults to corporate tone.",
  },
  {
    title: "Task 4 outputs not wired into Task 5",
    body: "Severity and staff_mentions are extracted by Task 4, but Task 5 isn't receiving them as context.",
  },
  {
    title: "No severity-conditional response rules",
    body: "Nothing scales response depth or resolution by severity — every review gets the same treatment.",
  },
];

const PROPOSED_CHANGE_GROUPS: { task: string; changes: string[] }[] = [
  {
    task: "Task 5 · Response generation",
    changes: [
      "System prompt — rewrite persona for empathy",
      "Context — add brand voice variable",
      "Input fields — wire severity + staff_mentions from Task 4",
      "User prompt — severity-conditional response rule",
    ],
  },
  {
    task: "Task 4 · Review details extraction",
    changes: ["User prompt — add complaint_type extraction"],
  },
];

const TOTAL_PROPOSED_CHANGES = PROPOSED_CHANGE_GROUPS.reduce(
  (sum, g) => sum + g.changes.length,
  0,
);

// ─── Typewriter hook ────────────────────────────────────────────────────────

function useTypewriter(text: string, charsPerSec = 240) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    let i = 0;
    const intervalMs = Math.max(8, Math.floor(1000 / charsPerSec));
    const id = setInterval(() => {
      i = Math.min(i + 1, text.length);
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, intervalMs);
    return () => clearInterval(id);
  }, [text, charsPerSec]);
  return shown;
}

export function CoachingCopilotPanel({
  highlightNodeIds,
}: {
  highlightNodeIds: string[];
}) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasViewedNode, setHasViewedNode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const panel = useAgentsBuilderCanvasPanel();

  function handleNodeSelect(nodeId: string) {
    setHasViewedNode(true);
    panel?.focusWorkflowNode(nodeId);
  }

  useEffect(() => {
    if (messages.length > 0) {
      const id = setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      }, 50);
      return () => clearTimeout(id);
    }
  }, [messages]);

  const insights = highlightNodeIds
    .map((id) => ({ nodeId: id, ...getInsight(id) }))
    .sort((a, b) => a.displayOrder - b.displayOrder);
  const totalChanges = insights.reduce((sum, n) => sum + n.changeCount, 0);
  const hasAgentResponse = messages.some((m) => m.type === "agent");

  function handleSend(e: FormEvent) {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { type: "user", text: trimmed }]);
    setMessage("");
  }

  function handleSuggestionClick(suggestion: Suggestion) {
    setMessages((prev) => {
      const next: Message[] = [...prev, { type: "user", text: suggestion.label }];
      if (suggestion.responseKind) {
        next.push({ type: "agent", kind: suggestion.responseKind });
      }
      return next;
    });
  }

  return (
    <div
      className={cn(
        `absolute left-6 top-6 bottom-6 z-10 flex min-h-0 w-[${PANEL_WIDTH_PX}px] flex-col overflow-hidden`,
        FLOATING_PANEL_DOCKED_SURFACE_CLASSNAME,
      )}
    >
      {/* Header */}
      <div className="shrink-0 border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center" aria-hidden>
            <img
              src={COACHING_AI_AGENT_ICON}
              alt=""
              width={24}
              height={25}
              className="block h-[25px] w-6 max-w-none object-contain"
              decoding="async"
            />
          </span>
          <p className="min-w-0 truncate text-[13px] font-semibold leading-none text-foreground">
            Coach agent
          </p>
        </div>
      </div>

      {/* Scrollable conversation */}
      <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
        {/* Copilot intro — intro text, flagged responses link, and suggested changes are one agent message */}
        <AgentMessageShell>
          <p className="text-[13px] leading-relaxed text-foreground">
            Based on your{" "}
            <span className="font-medium">4 flagged responses</span>
            , I've identified{" "}
            <span className="font-medium">
              {totalChanges} change{totalChanges !== 1 ? "s" : ""}
            </span>{" "}
            across{" "}
            <span className="font-medium">
              {insights.length} node{insights.length !== 1 ? "s" : ""}
            </span>{" "}
            in your workflow.
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-1 self-start text-[12px] text-primary hover:underline"
          >
            View flagged responses
            <ExternalLink className="size-3" strokeWidth={1.6} absoluteStrokeWidth />
          </button>
          <p className="mt-1 text-[12px] font-semibold text-muted-foreground">
            Suggested changes
          </p>
          <div className="flex flex-col gap-2">
            {insights.map((node) => (
              <NodeInsightCard
                key={node.nodeId}
                node={node}
                onSelect={() => handleNodeSelect(node.nodeId)}
              />
            ))}
          </div>
        </AgentMessageShell>

        {/* Initial follow-up prompt — only after user has clicked a node card, hidden once agent responds */}
        {hasViewedNode && !hasAgentResponse && (
          <AgentMessageShell>
            <p className="text-[13px] leading-relaxed text-foreground">
              What do you want to do next?
            </p>
            <div className="flex flex-wrap gap-1.5">
              {INITIAL_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion.label}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="rounded-full border border-border px-3 py-1 text-[11px] text-foreground transition-colors hover:bg-muted"
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          </AgentMessageShell>
        )}

        {/* Conversation messages */}
        {(() => {
          const lastAgentIndex = messages.reduce(
            (acc, m, i) => (m.type === "agent" ? i : acc),
            -1,
          );
          return messages.map((m, i) => {
            if (m.type === "user") {
              return (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[85%] rounded-lg bg-primary/10 px-3 py-2">
                    <p className="text-[13px] leading-relaxed text-foreground">{m.text}</p>
                  </div>
                </div>
              );
            }
            const showFollowUps = i === lastAgentIndex;
            if (m.kind === "root-cause")
              return (
                <RootCauseResponse
                  key={i}
                  showFollowUps={showFollowUps}
                  onFollowUp={handleSuggestionClick}
                />
              );
            if (m.kind === "proposed-change")
              return (
                <ProposedChangeResponse
                  key={i}
                  showFollowUps={showFollowUps}
                  onFollowUp={handleSuggestionClick}
                />
              );
            return null;
          });
        })()}
      </div>

      {/* Chat input */}
      <div className="shrink-0 rounded-b-2xl border-t border-border/60 bg-popover px-5 py-3">
        <form
          onSubmit={handleSend}
          className="flex flex-col gap-2 rounded-lg border border-border bg-card px-3 py-2 transition-shadow focus-within:shadow-sm"
        >
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e as unknown as FormEvent);
              }
            }}
            placeholder="Ask a follow-up…"
            rows={2}
            className="w-full resize-none border-0 bg-transparent text-[13px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
          />
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Voice input"
              className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Mic className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
            </button>
            <button
              type="submit"
              aria-label="Send"
              disabled={!message.trim()}
              className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-opacity disabled:opacity-30"
            >
              <ArrowUp className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function nodeTypeIcon(type: NodeType) {
  if (type === "branch")
    return <GitBranch className="size-[14px] text-[#5C6BC0]" strokeWidth={1.6} absoluteStrokeWidth />;
  return <ListTodo className="size-[14px] text-[#00897B]" strokeWidth={1.6} absoluteStrokeWidth />;
}

function nodeTypeLabel(type: NodeType) {
  return type === "branch" ? "Branch" : "Task";
}

export function NodeInsightCard({ node, onSelect }: { node: NodeInsight; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full max-w-full rounded-lg border border-border bg-transparent p-4 text-left font-normal outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
    >
      <div className="flex min-w-0 items-center gap-0.5">
        <span className={NODE_CARD_GLYPH_COL_CLASS}>
          {nodeTypeIcon(node.nodeType)}
        </span>
        <span className="text-[11px] leading-[18px] tracking-[-0.22px] text-[#8f8f8f]">
          {nodeTypeLabel(node.nodeType)}
        </span>
      </div>
      <div className={cn("mt-2 flex w-full items-baseline gap-0.5", NODE_CARD_BODY_PRIMARY_ROW_CLASS)}>
        <span className={cn(NODE_CARD_GLYPH_COL_CLASS, "m-0 shrink-0 p-0 tabular-nums")}>{node.displayOrder}.</span>
        <div className="min-w-0 flex-1">
          <span className="m-0 block min-w-0 p-0 text-[13px]">{node.canvasTitle}</span>
          <p className={cn(NODE_CARD_BODY_DESCRIPTION_CLASS, "line-clamp-2")}>
            <span className="font-medium text-foreground">Improve: </span>
            {node.currentIssue}
          </p>
        </div>
      </div>
    </button>
  );
}

// ─── Agent response blocks ──────────────────────────────────────────────────

function AgentMessageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center" aria-hidden>
        <img
          src={COACHING_AI_AGENT_ICON}
          alt=""
          width={20}
          height={21}
          className="block h-[21px] w-5 max-w-none object-contain"
          decoding="async"
        />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">{children}</div>
    </div>
  );
}

function useProgressiveReveal(count: number, startDelayMs: number, stepMs: number) {
  const [revealed, setRevealed] = useState(0);
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < count; i++) {
      timers.push(setTimeout(() => setRevealed((c) => Math.max(c, i + 1)), startDelayMs + i * stepMs));
    }
    return () => timers.forEach(clearTimeout);
  }, [count, startDelayMs, stepMs]);
  return revealed;
}

function FollowUpPrompt({
  question,
  suggestions,
  onFollowUp,
}: {
  question: string;
  suggestions: Suggestion[];
  onFollowUp: (s: Suggestion) => void;
}) {
  return (
    <AgentMessageShell>
      <p className="text-[13px] leading-relaxed text-foreground">{question}</p>
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => onFollowUp(s)}
            className="rounded-full border border-border px-3 py-1 text-[11px] text-foreground transition-colors hover:bg-muted"
          >
            {s.label}
          </button>
        ))}
      </div>
    </AgentMessageShell>
  );
}

function RootCauseResponse({
  showFollowUps,
  onFollowUp,
}: {
  showFollowUps: boolean;
  onFollowUp: (s: Suggestion) => void;
}) {
  const intro = `I found ${ROOT_CAUSES.length} root causes across the 4 flagged responses.`;
  const shown = useTypewriter(intro);
  const introDone = shown === intro;
  const revealed = useProgressiveReveal(introDone ? ROOT_CAUSES.length : 0, 200, 350);
  const allRevealed = revealed === ROOT_CAUSES.length;

  return (
    <>
      <AgentMessageShell>
        <p className="text-[13px] leading-relaxed text-foreground">{shown}</p>
        <div className="mt-1 flex flex-col gap-3">
          {ROOT_CAUSES.slice(0, revealed).map((rc, i) => (
            <div key={i} className="flex gap-2.5 motion-safe:animate-[in_180ms_ease-out]">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold tabular-nums text-primary">
                {i + 1}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="text-[12px] font-semibold leading-snug text-foreground">{rc.title}</p>
                <p className="text-[12px] leading-relaxed text-muted-foreground">{rc.body}</p>
              </div>
            </div>
          ))}
        </div>
      </AgentMessageShell>
      {allRevealed && showFollowUps && (
        <FollowUpPrompt
          question="Want me to walk you through the proposed fixes?"
          suggestions={ROOT_CAUSE_FOLLOWUPS}
          onFollowUp={onFollowUp}
        />
      )}
    </>
  );
}

function ProposedChangeResponse({
  showFollowUps,
  onFollowUp,
}: {
  showFollowUps: boolean;
  onFollowUp: (s: Suggestion) => void;
}) {
  const intro = `Here are the ${TOTAL_PROPOSED_CHANGES} changes I'd make across Task 4 and Task 5.`;
  const shown = useTypewriter(intro);
  const introDone = shown === intro;
  const revealed = useProgressiveReveal(introDone ? TOTAL_PROPOSED_CHANGES : 0, 200, 280);
  const allRevealed = revealed === TOTAL_PROPOSED_CHANGES;

  let offset = 0;
  const visibleGroups = PROPOSED_CHANGE_GROUPS.map((group) => {
    const start = offset;
    offset += group.changes.length;
    const count = Math.max(0, Math.min(group.changes.length, revealed - start));
    return { task: group.task, visible: group.changes.slice(0, count) };
  }).filter((g) => g.visible.length > 0);

  return (
    <>
      <AgentMessageShell>
        <p className="text-[13px] leading-relaxed text-foreground">{shown}</p>
        <div className="mt-1 flex flex-col gap-4">
          {visibleGroups.map((group) => (
            <div
              key={group.task}
              className="flex flex-col gap-2 motion-safe:animate-[in_180ms_ease-out]"
            >
              <div className="flex items-center gap-1.5">
                <ListTodo
                  className="size-3.5 text-[#00897B]"
                  strokeWidth={1.6}
                  absoluteStrokeWidth
                />
                <p className="text-[11px] font-medium text-muted-foreground">{group.task}</p>
              </div>
              <ul className="flex flex-col gap-1.5">
                {group.visible.map((change) => (
                  <li
                    key={change}
                    className="flex gap-2 text-[12px] leading-snug text-foreground motion-safe:animate-[in_180ms_ease-out]"
                  >
                    <span
                      className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/60"
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </AgentMessageShell>
      {allRevealed && showFollowUps && (
        <FollowUpPrompt
          question="Ready to apply these, or want to test first?"
          suggestions={PROPOSED_CHANGE_FOLLOWUPS}
          onFollowUp={onFollowUp}
        />
      )}
    </>
  );
}
