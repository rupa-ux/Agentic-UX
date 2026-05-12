import { useState, useCallback, useEffect, useLayoutEffect, useMemo, useRef, createContext, useContext, type CSSProperties, type MutableRefObject } from "react";
import {
  DndContext,
  DragOverlay,
  useDroppable,
  useDraggable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  ChevronLeft,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  GripVertical,
  Play,
  MoreVertical,
  X,
  Zap,
  MessageSquare,
  Ticket,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  GitBranch,
  Clock,
  Plus,
  Pencil,
  RotateCcw,
  Trash2,
  Copy,
  Ban,
  Star,
  Inbox,
  MapPin,
  Share2,
  ClipboardCheck,
  LayoutGrid,
  Gift,
  User,
  ListTodo,
  Maximize2,
  Undo2,
  Redo2,
  Info,
  CloudUpload,
  Sparkles,
  Wrench,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import { toast } from "sonner";
import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/components/ui/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/app/components/ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { NodeInsightCard, type NodeInsight } from "@/app/components/reviews/CoachingCopilotPanel";
import {
  COACHING_DIFFS,
  type CoachingDiff,
  type DiffSegment,
} from "@/app/components/reviews/coachingDiffData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { RESPONSE_AGENT_LIBRARY_TEMPLATES } from "@/app/components/reviews/responseAgentLibraryTemplates";
import { ResponseAgentLibraryTemplateCard } from "@/app/components/reviews/ResponseAgentLibraryTemplateCard";
import { FLOATING_PANEL_DOCKED_SURFACE_CLASSNAME } from "@/app/components/ui/floatingPanelSurface";
import {
  AgentsBuilderCanvasPanelContext,
  type WorkflowCanvasApi,
} from "@/app/components/reviews/agentsBuilderCanvasPanelContext";

/** Figma Review Response agent 2.0 — empty state illustration (exported from design). */
const AGENTS_BUILDER_LIBRARY_EMPTY_ILLUSTRATION = "/agents-builder/library-empty-state-illustration.svg";
const AGENTS_BUILDER_LIBRARY_EMPTY_SPARKLE = "/agents-builder/library-empty-state-sparkle.svg";
/** AI agent mark — same artwork as repo `AI agent.svg`, served for canvas agent node. */
const AGENTS_BUILDER_AI_AGENT_ICON = "/agents-builder/ai-agent.svg";

/** Absolute toolbox width — keep `BuildingPhase` horizontal centering in sync. */
const AGENTS_BUILDER_TOOLBOX_WIDTH_PX = 300;
/** Right docked pane width (`PropertiesPanel`) — keep reserve + centering calc in sync. */
const AGENTS_BUILDER_RIGHT_PANE_WIDTH_PX = 380;
/** Matches `left-6` / `right-6` (24px) insets on docked panes. */
const AGENTS_BUILDER_SIDE_INSET_CSS = "1.5rem";
const AGENTS_BUILDER_RIGHT_PANE_WIDTH_CLASS = `w-[${AGENTS_BUILDER_RIGHT_PANE_WIDTH_PX}px]`;
/** Pad the building chrome so the top toolbar stays clear of the right floating pane. */
const BUILDING_PHASE_FLOATING_PANEL_RESERVE_CLASS = `pr-[calc(${AGENTS_BUILDER_RIGHT_PANE_WIDTH_PX}px+${AGENTS_BUILDER_SIDE_INSET_CSS})]`;
/** Half of toolbox width + `left-6` — shift pan/zoom layer so the graph centers in the visible band. */
const AGENTS_BUILDER_TOOLBOX_HALF_OFFSET_CSS = `(${AGENTS_BUILDER_TOOLBOX_WIDTH_PX}px + ${AGENTS_BUILDER_SIDE_INSET_CSS}) / 2`;

/**
 * Birdeye standard text field / text area — [Review Response agent 2.0](https://www.figma.com/design/mCFHJowuWOQMo0giLAjwyj/Review-Response-agent-2.0?node-id=1-58778)
 * (Text field - Standard / Text area). Field chrome uses social tokens; value typography uses
 * {@link RRA20_AGENT_DETAILS_VALUE_TEXT_CLASS} (14px, Inbox summary palette).
 */
const RRA20_FORM_LABEL_CLASS =
  "flex flex-row items-center gap-1 text-xs font-normal leading-[18px] tracking-tight text-[color:var(--s-text-primary)]";
const RRA20_FORM_FIELD_SURFACE =
  "rounded border border-[color:var(--s-border-subtle)] bg-[color:var(--s-bg-input)] shadow-none selection:bg-primary selection:text-primary-foreground placeholder:text-[color:var(--s-text-muted)] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";
/**
 * 14px value copy for agent details (name, goals, outcomes, locations) — matches Inbox summary
 * palette. `md:text-[14px]` wins over shadcn `Input` / `Textarea` defaults (`md:text-sm`).
 */
const RRA20_AGENT_DETAILS_VALUE_TEXT_CLASS =
  "text-[14px] md:text-[14px] leading-relaxed font-normal text-[#444] dark:text-[#b0b7c3]";
const rra20SingleLineInputClass = cn(
  "h-9 w-full px-3 py-2",
  RRA20_FORM_FIELD_SURFACE,
  RRA20_AGENT_DETAILS_VALUE_TEXT_CLASS,
);
const rra20TextareaClass = cn(
  "min-h-[120px] w-full resize-y px-3 py-2",
  RRA20_FORM_FIELD_SURFACE,
  RRA20_AGENT_DETAILS_VALUE_TEXT_CLASS,
);

type BuilderPhase = "library" | "building";

interface WorkflowNode {
  id: string;
  type: "agent" | "trigger" | "task" | "branch" | "delay";
  subtype: string;
  title: string;
  description: string;
  config: Record<string, unknown>;
  enabled: boolean;
  order: number;
}

function workflowHasTriggerNode(nodes: WorkflowNode[]): boolean {
  return nodes.some((n) => n.type === "trigger");
}

function toolboxAccordionsForHasTrigger(hasTrigger: boolean): {
  triggerExpanded: boolean;
  tasksExpanded: boolean;
  controlsExpanded: boolean;
} {
  return {
    triggerExpanded: !hasTrigger,
    tasksExpanded: hasTrigger,
    controlsExpanded: false,
  };
}

const DEFAULT_AGENT_NODE_ID = "node-agent";

const DEFAULT_AGENT_LOCATIONS = [
  "1001 - Mountain view, CA",
  "1002 - Seattle, WA",
  "1004 - Chicago, IL",
  "1006 - Las Vegas, NV",
];

const DEFAULT_AGENT_GOALS =
  "Executes rule-based logic to rotate through qualifying templates and publish them automatically. If technical restrictions prevent immediate posting, the response is queued as a suggestion for manual review";

const DEFAULT_AGENT_OUTCOMES =
  "Ensure safe, effortless engagement by relying exclusively on your pre-approved templates. Eliminate manual effort and operational overhead by autonomously responding across platforms";

function makeDefaultAgentNode(displayName?: string | null): WorkflowNode {
  const name = (displayName?.trim() || "New review response agent").trim();
  return {
    id: DEFAULT_AGENT_NODE_ID,
    type: "agent",
    subtype: "agent-identity",
    title: name,
    description: "All locations",
    config: {
      name,
      description: "All locations",
      goals: DEFAULT_AGENT_GOALS,
      outcomes: DEFAULT_AGENT_OUTCOMES,
      locations: DEFAULT_AGENT_LOCATIONS,
      additionalLocations: 100,
    },
    enabled: true,
    order: 0,
  };
}

interface DraggableItemData {
  type: "trigger" | "task" | "branch" | "delay";
  subtype: string;
  label: string;
  description: string;
}

interface AgentsBuilderViewProps {
  onBack: () => void;
  agentName?: string;
  /** When set (e.g. `north-autonomous`), loads the Review Response agent 2.0 flow for that agent. */
  workflowPresetId?: string;
  initialPhase?: BuilderPhase;
  /** Node IDs that should render with an amber coaching-highlight border. */
  coachingHighlightNodeIds?: string[];
  /**
   * Node to select (open detail panel) when the canvas first mounts.
   * Pass `null` explicitly to suppress the default selection (DEFAULT_AGENT_NODE_ID).
   */
  initialSelectedNodeId?: string | null;
  /** Replaces the default ToolboxPanel in building phase (e.g. a coaching co-pilot panel). */
  leftPanel?: React.ReactNode;
  /** Coaching mode: primary header actions (replaces Publish / auto-save when `coachingHighlightNodeIds` is set). */
  onCoachingAcceptChanges?: () => void;
  onCoachingEditAgent?: () => void;
  /** Coaching mode: items shown in the "Suggested changes (N)" header popover. */
  coachingSuggestedChanges?: NodeInsight[];
}

interface CanvasTransform {
  x: number;
  y: number;
  scale: number;
}

/** Trigger library — labels aligned with Review Response agent 2.0 toolbox (Figma). */
const LEFT_PANEL_TRIGGERS: DraggableItemData[] = [
  {
    type: "trigger",
    subtype: "schedule-based",
    label: "Schedule-based",
    description: "Run the agent on a defined schedule.",
  },
  {
    type: "trigger",
    subtype: "review-event",
    label: "Review event",
    description: "When a review is received or updated.",
  },
  {
    type: "trigger",
    subtype: "inbox-event",
    label: "Inbox event",
    description: "When an inbox message matches your rules.",
  },
  {
    type: "trigger",
    subtype: "listing-event",
    label: "Listing event",
    description: "When listing data changes or meets criteria.",
  },
  {
    type: "trigger",
    subtype: "social-event",
    label: "Social event",
    description: "When social activity matches your rules.",
  },
  {
    type: "trigger",
    subtype: "survey-event",
    label: "Survey event",
    description: "When a survey response is submitted.",
  },
  {
    type: "trigger",
    subtype: "ticketing-event",
    label: "Ticketing event",
    description: "When a ticket is created or updated.",
  },
  {
    type: "trigger",
    subtype: "external-event",
    label: "External event",
    description: "When an external system sends an event.",
  },
];

const LEFT_PANEL_TASKS: DraggableItemData[] = [
  {
    type: "task",
    subtype: "custom",
    label: "Custom",
    description: "Create a custom task.",
  },
  {
    type: "task",
    subtype: "review",
    label: "Review",
    description: "Review-related tasks.",
  },
  {
    type: "task",
    subtype: "ticketing",
    label: "Ticketing",
    description: "Ticketing-related tasks.",
  },
  {
    type: "task",
    subtype: "contact",
    label: "Contact",
    description: "Contact-related tasks.",
  },
  {
    type: "task",
    subtype: "referral",
    label: "Referral",
    description: "Referral-related tasks.",
  },
  {
    type: "task",
    subtype: "surveys",
    label: "Surveys",
    description: "Survey-related tasks.",
  },
  {
    type: "task",
    subtype: "external-apps",
    label: "External apps",
    description: "External app tasks.",
  },
];

const LEFT_PANEL_CONTROLS: DraggableItemData[] = [
  {
    type: "branch",
    subtype: "branch",
    label: "Branch",
    description: "Add conditional branching logic",
  },
  {
    type: "delay",
    subtype: "delay",
    label: "Delay",
    description: "Add a time delay between steps",
  },
];

/** Review event drill-down — Agent ARC Framework 2.0 (Figma). */
const REVIEW_EVENT_SUB_TRIGGERS: DraggableItemData[] = [
  {
    type: "trigger",
    subtype: "review-new",
    label: "When a new review is received",
    description: "Agent runs when a new review is posted.",
  },
  {
    type: "trigger",
    subtype: "review-updated",
    label: "When a review is updated",
    description: "Agent runs when an existing review changes.",
  },
  {
    type: "trigger",
    subtype: "review-responded",
    label: "When a review is responded",
    description: "Agent runs when a response is published to a review.",
  },
  {
    type: "trigger",
    subtype: "review-new-or-updated",
    label: "When a new review is received or updated",
    description: "Agent runs on new reviews or when a review is updated.",
  },
];

/** Review task flyout — Agent ARC Framework 2.0 ([Figma](https://www.figma.com/design/cqTpEMS6nxxADwkpsYsNyo/Agent-ARC-Framework---2.0?node-id=1299-161785)). */
type ReviewTaskAction = { id: string; label: string };

/** Stable `DraggableItemData.subtype` for review flyout rows (`review-library__{id}`). */
function reviewTaskActionToDraggableItem(action: ReviewTaskAction): DraggableItemData {
  return {
    type: "task",
    subtype: `review-library__${action.id}`,
    label: action.label,
    description: "Add this review-related task to your agent.",
  };
}

const REVIEW_TASK_ACTIONS: ReviewTaskAction[] = [
  { id: "send-review-request-email", label: "Send review request email" },
  { id: "send-customer-experience-email", label: "Send customer experience email" },
  { id: "fetch-tags", label: "Fetch tags" },
  { id: "get-reviews", label: "Get reviews" },
  { id: "respond-review-1", label: "Respond to a review" },
  { id: "create-tags", label: "Create tags" },
  { id: "analyze-review-sentiment", label: "Analyze review sentiment" },
  { id: "identify-product-mentions", label: "Identify product mentions" },
  { id: "respond-review-2", label: "Respond to a review" },
  { id: "assign-tags-to-review", label: "Assign tags to a review" },
  { id: "update-tags", label: "Update tags" },
  { id: "attribute-review-employee", label: "Attribute review to an employee" },
];

const CANVAS_ZOOM_PRESETS = [50, 75, 100, 125, 150, 200] as const;

/** Between workflow nodes: segment height so two lines + `size-6` hub ≈ same total span as the agent guide. */
const CANVAS_VERTICAL_GUIDE_NODE_SEGMENT_CLASS = "h-[18px] w-px bg-[#C5CAD3]";

function nodeTypeIcon(type: WorkflowNode["type"]) {
  if (type === "trigger") return <Zap className="size-[14px] text-[#F57C00]" strokeWidth={1.6} absoluteStrokeWidth />;
  if (type === "branch" || type === "delay") return <GitBranch className="size-[14px] text-[#5C6BC0]" strokeWidth={1.6} absoluteStrokeWidth />;
  return <ListTodo className="size-[14px] text-[#00897B]" strokeWidth={1.6} absoluteStrokeWidth />;
}

/** Matches `NodeCard` header icon column — body order (`1.`) aligns here. */
const NODE_CARD_GLYPH_COL_CLASS = "flex w-5 shrink-0 justify-center";
/** Order + headline: identical font metrics (`tabular-nums` only on the order span). */
const NODE_CARD_BODY_PRIMARY_TEXT_CLASS =
  "m-0 p-0 font-sans text-[14px] font-normal leading-[20px] tracking-[-0.28px] text-[#212121]";
/** Secondary body copy — up to two lines, then ellipsis. */
const NODE_CARD_BODY_DESCRIPTION_CLASS =
  "m-0 mt-1.5 max-w-full break-words p-0 text-[12px] leading-[18px] tracking-[-0.24px] text-[#8f8f8f] line-clamp-2";

const ICON_SW = 1.6 as const;
const TOOLBOX_ICON_CLASS = "size-5 shrink-0 text-muted-foreground";

function toolboxItemLeadingIcon(item: DraggableItemData) {
  if (item.type === "trigger") {
    switch (item.subtype) {
      case "schedule-based":
        return <Clock className={TOOLBOX_ICON_CLASS} strokeWidth={ICON_SW} absoluteStrokeWidth />;
      case "review-event":
        return <Star className={TOOLBOX_ICON_CLASS} strokeWidth={ICON_SW} absoluteStrokeWidth />;
      case "inbox-event":
        return <Inbox className={TOOLBOX_ICON_CLASS} strokeWidth={ICON_SW} absoluteStrokeWidth />;
      case "listing-event":
        return <MapPin className={TOOLBOX_ICON_CLASS} strokeWidth={ICON_SW} absoluteStrokeWidth />;
      case "social-event":
        return <Share2 className={TOOLBOX_ICON_CLASS} strokeWidth={ICON_SW} absoluteStrokeWidth />;
      case "survey-event":
        return <ClipboardCheck className={TOOLBOX_ICON_CLASS} strokeWidth={ICON_SW} absoluteStrokeWidth />;
      case "ticketing-event":
        return <Ticket className={TOOLBOX_ICON_CLASS} strokeWidth={ICON_SW} absoluteStrokeWidth />;
      case "external-event":
        return <LayoutGrid className={TOOLBOX_ICON_CLASS} strokeWidth={ICON_SW} absoluteStrokeWidth />;
      case "review-new":
      case "review-updated":
      case "review-responded":
      case "review-new-or-updated":
        return <Star className={TOOLBOX_ICON_CLASS} strokeWidth={ICON_SW} absoluteStrokeWidth />;
      default:
        return <Zap className={TOOLBOX_ICON_CLASS} strokeWidth={ICON_SW} absoluteStrokeWidth />;
    }
  }
  if (item.type === "branch")
    return <GitBranch className={TOOLBOX_ICON_CLASS} strokeWidth={ICON_SW} absoluteStrokeWidth />;
  if (item.type === "delay")
    return <Clock className={TOOLBOX_ICON_CLASS} strokeWidth={ICON_SW} absoluteStrokeWidth />;
  if (item.type === "task") {
    switch (item.subtype) {
      case "custom":
        return <ListTodo className={TOOLBOX_ICON_CLASS} strokeWidth={ICON_SW} absoluteStrokeWidth />;
      case "review":
        return <Star className={TOOLBOX_ICON_CLASS} strokeWidth={ICON_SW} absoluteStrokeWidth />;
      case "ticketing":
        return <Ticket className={TOOLBOX_ICON_CLASS} strokeWidth={ICON_SW} absoluteStrokeWidth />;
      case "contact":
        return <User className={TOOLBOX_ICON_CLASS} strokeWidth={ICON_SW} absoluteStrokeWidth />;
      case "referral":
        return <Gift className={TOOLBOX_ICON_CLASS} strokeWidth={ICON_SW} absoluteStrokeWidth />;
      case "surveys":
        return <ClipboardCheck className={TOOLBOX_ICON_CLASS} strokeWidth={ICON_SW} absoluteStrokeWidth />;
      case "external-apps":
        return <LayoutGrid className={TOOLBOX_ICON_CLASS} strokeWidth={ICON_SW} absoluteStrokeWidth />;
      default:
        if (item.subtype.startsWith("review-library__")) {
          return <Star className={TOOLBOX_ICON_CLASS} strokeWidth={ICON_SW} absoluteStrokeWidth />;
        }
        return <Search className={TOOLBOX_ICON_CLASS} strokeWidth={ICON_SW} absoluteStrokeWidth />;
    }
  }
  return <Search className={TOOLBOX_ICON_CLASS} strokeWidth={ICON_SW} absoluteStrokeWidth />;
}

function DraggableReviewSubTriggerRow({
  item,
  dragDisabled,
}: {
  item: DraggableItemData;
  dragDisabled?: boolean;
}) {
  const id = `draggable-${item.type}-${item.subtype}`;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: item,
    disabled: Boolean(dragDisabled),
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...(dragDisabled ? {} : listeners)}
      className={cn(
        "flex h-9 w-full items-center gap-2.5 rounded border border-border bg-card px-3 py-1 text-left transition-colors",
        dragDisabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-grab hover:bg-muted/30",
        isDragging && "opacity-40",
      )}
    >
      {toolboxItemLeadingIcon(item)}
      <span className="min-w-0 flex-1 truncate text-[14px] leading-5 tracking-tight text-foreground">
        {item.label}
      </span>
      <GripVertical
        className="pointer-events-none size-5 shrink-0 text-muted-foreground"
        strokeWidth={ICON_SW}
        absoluteStrokeWidth
        aria-hidden
      />
    </div>
  );
}

function ReviewEventToolboxRow({
  hideFlyoutWhileDragging,
  flyoutCloseTick,
  triggerDragDisabled,
}: {
  hideFlyoutWhileDragging: boolean;
  flyoutCloseTick: number;
  triggerDragDisabled: boolean;
}) {
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const reviewParent =
    LEFT_PANEL_TRIGGERS.find((t) => t.subtype === "review-event") ?? LEFT_PANEL_TRIGGERS[1]!;

  /** Close after drag ends — do not close on drag *start* or the flyout unmounts and breaks `useDraggable`. */
  useLayoutEffect(() => {
    if (flyoutCloseTick > 0) setFlyoutOpen(false);
  }, [flyoutCloseTick]);

  return (
    <HoverCard open={flyoutOpen} onOpenChange={setFlyoutOpen} openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          disabled={triggerDragDisabled}
          title={triggerDragDisabled ? "This agent already has a trigger" : undefined}
          className={cn(
            "flex h-9 w-full items-center gap-2.5 rounded border border-border bg-card px-3 py-1 text-left transition-colors data-[state=open]:bg-muted/40",
            triggerDragDisabled
              ? "cursor-not-allowed opacity-50"
              : "cursor-default hover:bg-muted/30",
          )}
        >
          {toolboxItemLeadingIcon(reviewParent)}
          <span className="min-w-0 flex-1 truncate text-left text-[14px] leading-5 tracking-tight text-foreground">
            Review event
          </span>
          <ChevronRight
            className="pointer-events-none size-5 shrink-0 text-muted-foreground"
            strokeWidth={ICON_SW}
            absoluteStrokeWidth
            aria-hidden
          />
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        side="right"
        align="start"
        sideOffset={10}
        className={cn(
          "w-[min(353px,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] space-y-5 p-5 shadow-md",
          hideFlyoutWhileDragging && "pointer-events-none invisible",
        )}
      >
        <p className="text-[14px] font-normal leading-5 tracking-tight text-foreground">Review event</p>
        <div className="flex flex-col gap-2">
          {REVIEW_EVENT_SUB_TRIGGERS.map((sub) => (
            <DraggableReviewSubTriggerRow
              key={sub.subtype}
              item={sub}
              dragDisabled={triggerDragDisabled}
            />
          ))}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

const TOOLBOX_TASK_ROW_CLASS =
  "flex h-9 w-full cursor-default items-center gap-2.5 rounded border border-border bg-card px-3 py-1 text-left transition-colors hover:bg-muted/30";

function DraggableReviewTaskRow({ action }: { action: ReviewTaskAction }) {
  const item = useMemo(() => reviewTaskActionToDraggableItem(action), [action.id, action.label]);
  const id = `draggable-${item.type}-${item.subtype}`;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: item,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      role="listitem"
      className={cn(
        "flex h-9 w-full cursor-grab items-center gap-2 rounded border border-[#e5e9f0] bg-background px-3 py-1 dark:border-border",
        isDragging && "opacity-40",
      )}
    >
      {toolboxItemLeadingIcon(item)}
      <span className="min-w-0 flex-1 truncate text-[14px] font-normal leading-5 tracking-tight text-foreground">
        {action.label}
      </span>
      <GripVertical
        className="pointer-events-none size-5 shrink-0 text-muted-foreground"
        strokeWidth={ICON_SW}
        absoluteStrokeWidth
        aria-hidden
      />
    </div>
  );
}

function ReviewTaskToolboxRow({
  item,
  hideFlyoutWhileDragging,
  flyoutCloseTick,
}: {
  item: DraggableItemData;
  hideFlyoutWhileDragging: boolean;
  flyoutCloseTick: number;
}) {
  const [flyoutOpen, setFlyoutOpen] = useState(false);

  useLayoutEffect(() => {
    if (flyoutCloseTick > 0) setFlyoutOpen(false);
  }, [flyoutCloseTick]);

  return (
    <HoverCard open={flyoutOpen} onOpenChange={setFlyoutOpen} openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className={cn(
            TOOLBOX_TASK_ROW_CLASS,
            "w-full data-[state=open]:bg-muted/40",
          )}
        >
          {toolboxItemLeadingIcon(item)}
          <span className="min-w-0 flex-1 truncate text-left text-[14px] leading-5 tracking-tight text-foreground">
            {item.label}
          </span>
          <ChevronRight
            className="pointer-events-none size-5 shrink-0 text-muted-foreground"
            strokeWidth={ICON_SW}
            absoluteStrokeWidth
            aria-hidden
          />
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        side="right"
        align="start"
        sideOffset={10}
        className={cn(
          "w-[min(353px,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] space-y-5 p-5 shadow-md",
          hideFlyoutWhileDragging && "pointer-events-none invisible",
        )}
      >
        <p className="text-[14px] font-normal leading-5 tracking-tight text-foreground">Review task</p>
        <div className="flex flex-col gap-2" role="list">
          {REVIEW_TASK_ACTIONS.map((action) => (
            <DraggableReviewTaskRow key={action.id} action={action} />
          ))}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

function ToolboxExternalAppsRow({ item }: { item: DraggableItemData }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={cn(TOOLBOX_TASK_ROW_CLASS, "w-full")}
      >
        {toolboxItemLeadingIcon(item)}
        <span className="min-w-0 flex-1 truncate text-left text-[14px] leading-5 tracking-tight text-foreground">
          {item.label}
        </span>
        {expanded ? (
          <ChevronUp className="size-5 shrink-0 text-muted-foreground" strokeWidth={ICON_SW} absoluteStrokeWidth />
        ) : (
          <ChevronDown className="size-5 shrink-0 text-muted-foreground" strokeWidth={ICON_SW} absoluteStrokeWidth />
        )}
      </button>
    </div>
  );
}

function ToolboxTaskCategoryRow({
  item,
  hideFlyoutWhileDragging,
  flyoutCloseTick,
}: {
  item: DraggableItemData;
  hideFlyoutWhileDragging: boolean;
  flyoutCloseTick: number;
}) {
  if (item.subtype === "review") {
    return (
      <ReviewTaskToolboxRow
        item={item}
        hideFlyoutWhileDragging={hideFlyoutWhileDragging}
        flyoutCloseTick={flyoutCloseTick}
      />
    );
  }
  if (item.subtype === "external-apps") {
    return <ToolboxExternalAppsRow item={item} />;
  }
  if (item.subtype === "custom") {
    return (
      <div className={TOOLBOX_TASK_ROW_CLASS}>
        {toolboxItemLeadingIcon(item)}
        <span className="min-w-0 flex-1 truncate text-[14px] leading-5 tracking-tight text-foreground">{item.label}</span>
        <GripVertical
          className="pointer-events-none size-5 shrink-0 text-muted-foreground"
          strokeWidth={ICON_SW}
          absoluteStrokeWidth
          aria-hidden
        />
      </div>
    );
  }
  return (
    <div className={TOOLBOX_TASK_ROW_CLASS}>
      {toolboxItemLeadingIcon(item)}
      <span className="min-w-0 flex-1 truncate text-[14px] leading-5 tracking-tight text-foreground">{item.label}</span>
      <ChevronRight
        className="pointer-events-none size-5 shrink-0 text-muted-foreground"
        strokeWidth={ICON_SW}
        absoluteStrokeWidth
        aria-hidden
      />
    </div>
  );
}

function DraggableLeftItem({
  item,
  dragDisabled,
}: {
  item: DraggableItemData;
  dragDisabled?: boolean;
}) {
  const id = `draggable-${item.type}-${item.subtype}`;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: item,
    disabled: Boolean(dragDisabled),
  });

  const showDragHandle =
    item.type === "branch" || item.type === "delay" || (item.type === "trigger" && item.subtype === "schedule-based");

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...(dragDisabled ? {} : listeners)}
      className={cn(
        "flex h-9 w-full items-center gap-2.5 rounded border border-border bg-card px-3 py-1 text-left transition-colors",
        dragDisabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-grab hover:bg-muted/30",
        isDragging && "opacity-40",
      )}
    >
      {toolboxItemLeadingIcon(item)}
      <span className="min-w-0 flex-1 truncate text-[14px] leading-5 tracking-tight text-foreground">
        {item.label}
      </span>
      {showDragHandle ? (
        <GripVertical className="size-5 shrink-0 text-muted-foreground" strokeWidth={ICON_SW} absoluteStrokeWidth />
      ) : (
        <ChevronRight
          className="pointer-events-none size-5 shrink-0 text-muted-foreground"
          strokeWidth={ICON_SW}
          absoluteStrokeWidth
          aria-hidden
        />
      )}
    </div>
  );
}

function DragGhostCard({ item }: { item: DraggableItemData }) {
  return (
    <div className="flex h-9 w-[240px] cursor-grabbing items-center gap-2.5 rounded border border-border bg-card px-3 py-1 text-left shadow-lg opacity-90">
      {toolboxItemLeadingIcon(item)}
      <span className="min-w-0 flex-1 truncate text-[14px] leading-5 text-foreground">{item.label}</span>
    </div>
  );
}

function ToolboxPanel({
  hideFlyoutWhileDragging,
  flyoutCloseTick,
  triggerExpanded,
  tasksExpanded,
  controlsExpanded,
  onToggleTriggerAccordion,
  onToggleTasksAccordion,
  onToggleControlsAccordion,
  canAddTrigger,
}: {
  hideFlyoutWhileDragging: boolean;
  flyoutCloseTick: number;
  triggerExpanded: boolean;
  tasksExpanded: boolean;
  controlsExpanded: boolean;
  onToggleTriggerAccordion: () => void;
  onToggleTasksAccordion: () => void;
  onToggleControlsAccordion: () => void;
  canAddTrigger: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filterItems = (items: DraggableItemData[]) =>
    items.filter((i) =>
      i.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div
      className={cn(
        `absolute left-6 top-6 bottom-6 z-10 flex min-h-0 w-[${AGENTS_BUILDER_TOOLBOX_WIDTH_PX}px] flex-col overflow-hidden pt-6`,
        FLOATING_PANEL_DOCKED_SURFACE_CLASSNAME,
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pb-5">
        <div className="relative shrink-0">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            strokeWidth={ICON_SW}
            absoluteStrokeWidth
            aria-hidden
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="h-9 w-full rounded border border-border bg-background py-2 pl-10 pr-3 text-[14px] leading-5 tracking-tight text-foreground placeholder:text-muted-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </div>

        <div className="flex flex-col gap-3">
          <button type="button" onClick={onToggleTriggerAccordion} className="flex w-full items-center justify-between gap-3 text-left">
            <span className="min-w-0 flex-1 text-base font-normal leading-6 tracking-tight text-foreground">
              Trigger
            </span>
            {triggerExpanded ? (
              <ChevronUp className="size-5 shrink-0 text-muted-foreground" strokeWidth={ICON_SW} absoluteStrokeWidth />
            ) : (
              <ChevronDown className="size-5 shrink-0 text-muted-foreground" strokeWidth={ICON_SW} absoluteStrokeWidth />
            )}
          </button>
          {triggerExpanded ? (
            <div className="flex flex-col gap-3">
              {filterItems(LEFT_PANEL_TRIGGERS).map((item) =>
                item.subtype === "review-event" ? (
                  <ReviewEventToolboxRow
                    key="review-event-hover"
                    hideFlyoutWhileDragging={hideFlyoutWhileDragging}
                    flyoutCloseTick={flyoutCloseTick}
                    triggerDragDisabled={!canAddTrigger}
                  />
                ) : (
                  <DraggableLeftItem
                    key={item.subtype}
                    item={item}
                    dragDisabled={item.type === "trigger" && !canAddTrigger}
                  />
                ),
              )}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          <button type="button" onClick={onToggleTasksAccordion} className="flex w-full items-center justify-between gap-3 text-left">
            <span className="min-w-0 flex-1 text-base font-normal leading-6 tracking-tight text-foreground">Tasks</span>
            {tasksExpanded ? (
              <ChevronUp className="size-5 shrink-0 text-muted-foreground" strokeWidth={ICON_SW} absoluteStrokeWidth />
            ) : (
              <ChevronDown className="size-5 shrink-0 text-muted-foreground" strokeWidth={ICON_SW} absoluteStrokeWidth />
            )}
          </button>
          {tasksExpanded ? (
            <div className="flex flex-col gap-3">
              {filterItems(LEFT_PANEL_TASKS).map((item) => (
                <ToolboxTaskCategoryRow
                  key={item.subtype}
                  item={item}
                  hideFlyoutWhileDragging={hideFlyoutWhileDragging}
                  flyoutCloseTick={flyoutCloseTick}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          <button type="button" onClick={onToggleControlsAccordion} className="flex w-full items-center justify-between gap-3 text-left">
            <span className="min-w-0 flex-1 text-base font-normal leading-6 tracking-tight text-foreground">
              Controls
            </span>
            {controlsExpanded ? (
              <ChevronUp className="size-5 shrink-0 text-muted-foreground" strokeWidth={ICON_SW} absoluteStrokeWidth />
            ) : (
              <ChevronDown className="size-5 shrink-0 text-muted-foreground" strokeWidth={ICON_SW} absoluteStrokeWidth />
            )}
          </button>
          {controlsExpanded ? (
            <div className="flex flex-col gap-3">
              {filterItems(LEFT_PANEL_CONTROLS).map((item) => (
                <DraggableLeftItem key={item.subtype} item={item} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Shared card border — transparent keeps layout stable; selected swaps to #1976d2. */
const CARD_SHADOW = "shadow-[0_2px_6px_rgba(33,33,33,0.06)] transition-[border-color]";
const CARD_DEFAULT = "border-2 border-transparent";
const CARD_SELECTED = "border-2 border-[#1976d2]";
const CARD_COACHING = "border-2 border-amber-400";

/** Node IDs that should render with a coaching highlight border. Provided by AgentsBuilderView. */
const CoachingHighlightContext = createContext<ReadonlySet<string>>(new Set());

function AgentIdentityCard({
  node,
  isSelected,
  onSelect,
}: {
  node: WorkflowNode;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-center gap-2 rounded-[200px] bg-white px-8 py-4 text-left",
        CARD_SHADOW,
        isSelected ? CARD_SELECTED : CARD_DEFAULT,
      )}
    >
      <span className="flex size-6 shrink-0 items-center justify-center" aria-hidden>
        <img
          src={AGENTS_BUILDER_AI_AGENT_ICON}
          alt=""
          width={24}
          height={25}
          className="block h-[25px] w-6 max-w-none object-contain"
          decoding="async"
        />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="whitespace-nowrap text-[14px] leading-5 tracking-[-0.28px] text-[#212121]">
          {node.title}
        </span>
        <span className={cn("block min-w-0 text-left", NODE_CARD_BODY_DESCRIPTION_CLASS, "mt-0")}>
          {node.description}
        </span>
      </span>
    </button>
  );
}

function NodeCard({
  node,
  isSelected,
  onSelect,
  onToggle,
  onDelete,
  onDuplicate,
  onAddBranch,
  displayOrder,
}: {
  node: WorkflowNode;
  isSelected: boolean;
  onSelect: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onAddBranch?: () => void;
  displayOrder?: number;
}) {
  const coachingHighlightIds = useContext(CoachingHighlightContext);
  const isCoachingHighlight = coachingHighlightIds.has(node.id);

  if (node.type === "agent") {
    return <AgentIdentityCard node={node} isSelected={isSelected} onSelect={onSelect} />;
  }

  const typeLabel =
    node.type === "trigger" ? "Trigger"
    : node.type === "branch" ? "Branch"
    : node.type === "delay" ? "Delay"
    : "Task";

  const showToggle = node.type !== "trigger";
  const showAddCircle = node.type === "branch";

  return (
    <button
      type="button"
      data-workflow-node-id={node.id}
      onClick={onSelect}
      className={cn(
        "w-[400px] rounded-lg bg-white p-4 text-left",
        CARD_SHADOW,
        isSelected ? CARD_SELECTED : isCoachingHighlight ? CARD_COACHING : CARD_DEFAULT,
      )}
    >
      {/* Header row — icon column aligns with `order.` below; type label aligns with headline */}
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-0.5">
          <span className={NODE_CARD_GLYPH_COL_CLASS}>{nodeTypeIcon(node.type)}</span>
          <span className="text-[11px] leading-[18px] tracking-[-0.22px] text-[#8f8f8f]">{typeLabel}</span>
          {isCoachingHighlight && !isSelected && (
            <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium leading-none text-amber-700 ring-1 ring-amber-300">
              Improve task
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showToggle && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggle(); }}
              className={cn(
                "relative h-4 w-8 shrink-0 overflow-clip rounded-full transition-colors",
                node.enabled ? "bg-[#1976d2]" : "bg-[#BBBFC4]",
              )}
            >
              <span
                className={cn(
                  "absolute top-[2px] size-3 rounded-full bg-white transition-transform",
                  node.enabled ? "translate-x-[18px]" : "translate-x-[2px]",
                )}
              />
            </button>
          )}
          {showAddCircle && (
            <button
              type="button"
              aria-label="Add branch"
              onClick={(e) => { e.stopPropagation(); onAddBranch?.(); }}
              className="flex size-5 items-center justify-center rounded-full bg-[#f4f6f7] text-[#555] transition-colors hover:bg-[#1976d2] hover:text-white"
            >
              <Plus className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
            </button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="flex size-5 items-center justify-center text-[#8f8f8f] hover:text-foreground"
              >
                <MoreVertical className="size-[20px]" strokeWidth={1.6} absoluteStrokeWidth />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
                <Copy className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
                Duplicate
              </DropdownMenuItem>
              {showToggle && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onToggle(); }}>
                  <Ban className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
                  {node.enabled ? "Disable" : "Enable"}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Body — `order.` under icon; headline under type label; same type scale as the order */}
      <div className="mt-2 flex w-full items-baseline gap-0.5">
        <span
          className={cn(
            NODE_CARD_GLYPH_COL_CLASS,
            NODE_CARD_BODY_PRIMARY_TEXT_CLASS,
            "shrink-0 tabular-nums",
          )}
        >
          {displayOrder ?? node.order}.
        </span>
        <div className="min-w-0 flex-1">
          <span className={cn("block min-w-0", NODE_CARD_BODY_PRIMARY_TEXT_CLASS)}>{node.title}</span>
          <p className={NODE_CARD_BODY_DESCRIPTION_CLASS}>{node.description}</p>
        </div>
      </div>
    </button>
  );
}

function CanvasDropZone({ isDragActive }: { isDragActive: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas" });
  return <div ref={setNodeRef} className="absolute inset-0 pointer-events-none" aria-hidden={!isDragActive} />;
}

function InsertDropZone({
  afterOrder,
  emphasize,
}: {
  afterOrder: number;
  /** Pulse / ring while dragging a trigger from the toolbox (drop is allowed here). */
  emphasize?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `insert-after-${afterOrder}` });
  return (
    <div ref={setNodeRef} className="flex flex-col items-center">
      <div className={CANVAS_VERTICAL_GUIDE_NODE_SEGMENT_CLASS} />
      <div
        className={cn(
          "flex size-6 items-center justify-center rounded-full transition-all duration-150",
          isOver
            ? "scale-110 bg-[#1976d2] text-white shadow-md"
            : "bg-[#f4f6f7] text-[#555]",
          emphasize &&
            !isOver &&
            "animate-pulse shadow-[0_0_0_3px_rgba(25,118,210,0.25)]",
        )}
      >
        <Plus className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
      </div>
      <div className={CANVAS_VERTICAL_GUIDE_NODE_SEGMENT_CLASS} />
    </div>
  );
}

/** A single branch path stored inside a Branch node's config. */
interface BranchPath {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  description?: string;
  filters?: Array<{ field: string; operator: string; value: string }>;
}

/** Reference to a branch path that is currently selected for editing. */
interface BranchPathSelection {
  branchNodeId: string;
  pathId: string;
}

function findWorkflowNodeById(nodes: WorkflowNode[], id: string | null): WorkflowNode | null {
  if (!id) return null;
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.type === "branch" && Array.isArray(n.config.paths)) {
      for (const p of n.config.paths as BranchPath[]) {
        const hit = findWorkflowNodeById(p.nodes, id);
        if (hit) return hit;
      }
    }
  }
  return null;
}

function mapWorkflowNodeById(
  nodes: WorkflowNode[],
  id: string,
  fn: (n: WorkflowNode) => WorkflowNode,
): WorkflowNode[] {
  return nodes.map((n) => {
    if (n.id === id) return fn(n);
    if (n.type === "branch" && Array.isArray(n.config.paths)) {
      return {
        ...n,
        config: {
          ...n.config,
          paths: (n.config.paths as BranchPath[]).map((p) => ({
            ...p,
            nodes: mapWorkflowNodeById(p.nodes, id, fn),
          })),
        },
      };
    }
    return n;
  });
}

function removeWorkflowNodeFromTree(nodes: WorkflowNode[], id: string): WorkflowNode[] {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) => {
      if (n.type === "branch" && Array.isArray(n.config.paths)) {
        return {
          ...n,
          config: {
            ...n.config,
            paths: (n.config.paths as BranchPath[]).map((p) => ({
              ...p,
              nodes: removeWorkflowNodeFromTree(p.nodes, id),
            })),
          },
        };
      }
      return n;
    });
}

const BRANCH_COLUMN_WIDTH = 400;

/**
 * Gap varies by nesting depth so sub-branches never collide with each other:
 *
 *   depth=0 (branches of a top-level branch node): wide enough that each column's nested
 *     BranchPaths (innerWidth = 2×400+NESTED_GAP) doesn't overflow into its sibling's space.
 *     Required gap > (innerWidth − COLUMN_WIDTH) = (800+NESTED_GAP − 400) = 400+NESTED_GAP.
 *     With NESTED_GAP=80 → required top gap > 480 → use 520.
 *
 *   depth≥1 (branches inside a branch column): compact, capped at the visible card width
 *     to keep sub-branches legible without overflowing into sibling columns.
 */
const BRANCH_GAP_BY_DEPTH = [520, 80] as const;
function branchGapForDepth(depth: number): number {
  return BRANCH_GAP_BY_DEPTH[Math.min(depth, BRANCH_GAP_BY_DEPTH.length - 1)] ?? 80;
}

/**
 * SVG connector that draws the horizontal split from trunk to branch columns,
 * with 4px corner radii where horizontal meets each vertical arm.
 * Each column's vertical arm (h-10 equivalent) is drawn here too, so
 * BranchPathColumn no longer needs its own top connector div.
 */
function BranchConnectorSVG({
  pathCount,
  columnGap,
  selectedPathIndex = -1,
}: {
  pathCount: number;
  columnGap: number;
  selectedPathIndex?: number;
}) {
  if (pathCount === 0) return null;

  const W = BRANCH_COLUMN_WIDTH;
  const G = columnGap;
  const totalWidth = pathCount * W + (pathCount - 1) * G;
  const H = 56;
  const R = 4;
  const COLOR_DEFAULT = "#C5CAD3";
  const COLOR_SELECTED = "#1976d2";
  const STROKE_DEFAULT = "1";
  const STROKE_SELECTED = "1.5";

  const cx = (i: number) => i * (W + G) + W / 2;

  if (pathCount === 1) {
    const isSel = selectedPathIndex === 0;
    return (
      <svg width={W} height={H} style={{ display: "block", overflow: "visible" }}>
        <line
          x1={W / 2}
          y1={0}
          x2={W / 2}
          y2={H}
          stroke={isSel ? COLOR_SELECTED : COLOR_DEFAULT}
          strokeWidth={isSel ? STROKE_SELECTED : STROKE_DEFAULT}
        />
      </svg>
    );
  }

  const leftX = cx(0);
  const rightX = cx(pathCount - 1);
  /** Where the parent trunk meets the horizontal bar (the bar's midpoint). */
  const trunkCenterX = (leftX + rightX) / 2;

  /** Builds the SVG path for ONE column's arm (with rounded corner). */
  const armForColumn = (i: number): string => {
    const x = cx(i);
    if (i === 0) return `M ${x + R} 0 Q ${x} 0 ${x} ${R} L ${x} ${H}`;
    if (i === pathCount - 1) return `M ${x - R} 0 Q ${x} 0 ${x} ${R} L ${x} ${H}`;
    return `M ${x} 0 L ${x} ${H}`;
  };

  /**
   * Full L-shaped path from the trunk centre, along the horizontal toward column `i`,
   * around a 4-px rounded corner, then DOWN to the chip. This is the blue selection overlay.
   */
  const selectedRoute = (i: number): string => {
    const x = cx(i);
    if (Math.abs(x - trunkCenterX) < 0.5) return `M ${x} 0 L ${x} ${H}`;
    if (x < trunkCenterX) {
      // trunk → LEFT along horizontal → corner → DOWN
      return `M ${trunkCenterX} 0 L ${x + R} 0 Q ${x} 0 ${x} ${R} L ${x} ${H}`;
    }
    // trunk → RIGHT along horizontal → corner → DOWN
    return `M ${trunkCenterX} 0 L ${x - R} 0 Q ${x} 0 ${x} ${R} L ${x} ${H}`;
  };

  // Default: full horizontal bar + every column's arm, all grey
  const defaultSegments: string[] = [`M ${leftX + R} 0 L ${rightX - R} 0`];
  for (let i = 0; i < pathCount; i++) defaultSegments.push(armForColumn(i));

  const selectedSegment =
    selectedPathIndex >= 0 && selectedPathIndex < pathCount
      ? selectedRoute(selectedPathIndex)
      : null;

  return (
    <svg width={totalWidth} height={H} style={{ display: "block", overflow: "visible" }}>
      <path d={defaultSegments.join(" ")} stroke={COLOR_DEFAULT} strokeWidth={STROKE_DEFAULT} fill="none" />
      {selectedSegment && (
        <path d={selectedSegment} stroke={COLOR_SELECTED} strokeWidth={STROKE_SELECTED} fill="none" />
      )}
    </svg>
  );
}

/** Migrate old `branches: string[]` config to new `paths` format. */
function branchesToPaths(names: string[]): BranchPath[] {
  return names.map((name, i) => ({ id: `bp-legacy-${i}`, name, nodes: [] }));
}

function getOrMigratePaths(config: Record<string, unknown>): BranchPath[] {
  if (Array.isArray(config.paths)) return config.paths as BranchPath[];
  if (Array.isArray(config.branches)) return branchesToPaths(config.branches as string[]);
  return [
    { id: "bp-default-0", name: "Branch 1", nodes: [] },
    { id: "bp-default-1", name: "Branch 2", nodes: [] },
  ];
}

/**
 * Recursively inserts `newNode` into the branch path identified by `branchNodeId`+`pathId`,
 * searching at any nesting depth inside the given node array.
 * Returns a new array (structurally shared where unchanged) and whether the insert occurred.
 */
function insertNodeIntoBranchPath(
  nodesArr: WorkflowNode[],
  branchNodeId: string,
  pathId: string,
  newNode: WorkflowNode,
): { nodes: WorkflowNode[]; inserted: boolean } {
  let inserted = false;
  const next = nodesArr.map((n) => {
    // Direct match — insert into this branch node's path
    if (n.id === branchNodeId) {
      const paths = getOrMigratePaths(n.config);
      const newPaths = paths.map((p) => {
        if (p.id !== pathId) return p;
        inserted = true;
        const withNew = [...p.nodes, newNode].sort((a, b) => a.order - b.order);
        return { ...p, nodes: withNew.map((nd, i) => ({ ...nd, order: i })) };
      });
      return { ...n, config: { ...n.config, paths: newPaths } };
    }
    // Recurse — check paths nested inside this branch node
    if (n.type === "branch" && Array.isArray(n.config.paths)) {
      const paths = n.config.paths as BranchPath[];
      let changed = false;
      const newPaths = paths.map((p) => {
        const result = insertNodeIntoBranchPath(p.nodes, branchNodeId, pathId, newNode);
        if (result.inserted) { inserted = true; changed = true; }
        return result.inserted ? { ...p, nodes: result.nodes } : p;
      });
      return changed ? { ...n, config: { ...n.config, paths: newPaths } } : n;
    }
    return n;
  });
  return { nodes: next, inserted };
}

/** Inline `+` connector used between nodes and chips inside a branch column. */
function BranchColumnConnector({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center">
      <div className="h-10 w-px bg-[#C5CAD3]" />
      <button
        type="button"
        onClick={onAdd}
        className="flex size-6 items-center justify-center rounded-full bg-[#f4f6f7] text-[#555] transition-colors hover:bg-[#1976d2] hover:text-white"
        aria-label="Add step"
      >
        <Plus className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
      </button>
      <div className="h-10 w-px bg-[#C5CAD3]" />
    </div>
  );
}

/**
 * Drop ID format for branch-path insert zones:
 *   `bp|{branchNodeId}|{pathId}|{afterOrder}`
 * Pipe-separated to avoid collisions with dash-prefixed IDs.
 */
function makeBranchDropId(branchNodeId: string, pathId: string, afterOrder: number) {
  return `bp|${branchNodeId}|${pathId}|${afterOrder}`;
}

/** A `+` zone inside a branch column that is BOTH droppable (drag) and clickable (menu). */
function BranchPathZone({
  branchNodeId,
  pathId,
  afterOrder,
  isDragActive,
  onAddNode,
}: {
  branchNodeId: string;
  pathId: string;
  afterOrder: number;
  isDragActive: boolean;
  /** Accepted for API compatibility; selection does NOT colour zones — blue line only spans from trunk to chip. */
  isPathSelected?: boolean;
  onAddNode: (type: WorkflowNode["type"]) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: makeBranchDropId(branchNodeId, pathId, afterOrder),
  });

  return (
    <div ref={setNodeRef} className="flex flex-col items-center">
      <div className="h-10 w-px bg-[#C5CAD3]" />
      {isDragActive ? (
        /* Drag-active: show droppable visual cue */
        <div
          className={cn(
            "flex size-6 items-center justify-center rounded-full transition-all duration-150",
            isOver ? "scale-110 bg-[#1976d2] text-white shadow-md" : "bg-[#f4f6f7] text-[#555]",
          )}
        >
          <Plus className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
        </div>
      ) : (
        /* Idle: click opens node-type picker */
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex size-6 items-center justify-center rounded-full bg-[#f4f6f7] text-[#555] transition-colors hover:bg-[#1976d2] hover:text-white"
              aria-label="Add step"
            >
              <Plus className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuItem onClick={() => onAddNode("task")}>
              <ListTodo className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
              Add task
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddNode("branch")}>
              <GitBranch className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
              Add branch
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddNode("delay")}>
              <Clock className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
              Add delay
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <div className="h-10 w-px bg-[#C5CAD3]" />
    </div>
  );
}

function BranchPathColumn({
  branchNodeId,
  path,
  onUpdatePaths,
  selectedNodeId,
  onSelectNode,
  selectedBranchPath,
  onSelectBranchPath,
  isDragActive,
  startOrder,
  depth,
}: {
  branchNodeId: string;
  path: BranchPath;
  onUpdatePaths: (updater: (paths: BranchPath[]) => BranchPath[]) => void;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  selectedBranchPath: BranchPathSelection | null;
  onSelectBranchPath: (sel: BranchPathSelection | null) => void;
  isDragActive: boolean;
  startOrder: number;
  depth: number;
}) {
  const isPathSelected =
    selectedBranchPath?.branchNodeId === branchNodeId &&
    selectedBranchPath?.pathId === path.id;
  const sortedNodes = [...path.nodes].sort((a, b) => a.order - b.order);

  const addNodeAfter = (afterOrder: number, type: WorkflowNode["type"] = "task") => {
    const subtypes: Record<WorkflowNode["type"], string> = {
      task: "respond-review", trigger: "review-event", branch: "branch", delay: "delay", agent: "agent-identity",
    };
    const titles: Record<WorkflowNode["type"], string> = {
      task: "New task", trigger: "New trigger", branch: "Based on conditions", delay: "Wait", agent: "Agent",
    };
    const descs: Record<WorkflowNode["type"], string> = {
      task: "Configure this task",
      trigger: "Configure this trigger",
      branch: "Build condition-specific flows",
      delay: "Wait before proceeding",
      agent: "",
    };
    const newNode: WorkflowNode = {
      id: `bpn-${Date.now()}`,
      type,
      subtype: subtypes[type],
      title: titles[type],
      description: descs[type],
      config: type === "branch"
        ? { branchType: "condition", paths: [
            { id: `bp-${Date.now()}-0`, name: "Branch 1", nodes: [] },
            { id: `bp-${Date.now()}-1`, name: "Branch 2", nodes: [] },
          ] }
        : {},
      enabled: true,
      order: afterOrder + 0.5,
    };
    onUpdatePaths((paths) =>
      paths.map((p) => {
        if (p.id !== path.id) return p;
        const withNew = [...p.nodes, newNode].sort((a, b) => a.order - b.order);
        return { ...p, nodes: withNew.map((n, i) => ({ ...n, order: i })) };
      }),
    );
    onSelectNode(newNode.id);
  };

  const removeNode = (nodeId: string) => {
    onUpdatePaths((paths) =>
      paths.map((p) =>
        p.id === path.id ? { ...p, nodes: p.nodes.filter((n) => n.id !== nodeId) } : p,
      ),
    );
  };

  const toggleNode = (nodeId: string) => {
    onUpdatePaths((paths) =>
      paths.map((p) =>
        p.id === path.id
          ? { ...p, nodes: p.nodes.map((n) => (n.id === nodeId ? { ...n, enabled: !n.enabled } : n)) }
          : p,
      ),
    );
  };

  const zoneAfterOrder = (idx: number) =>
    idx === 0 ? -1 : sortedNodes[idx - 1]!.order;

  return (
    <div className="flex w-[400px] shrink-0 flex-col items-center">
      {/* Branch path chip — clickable, selects this branch path */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSelectBranchPath({ branchNodeId, pathId: path.id });
        }}
        className={cn(
          "flex items-center gap-1.5 rounded border bg-white px-3 py-1.5 text-left shadow-[0_2px_6px_rgba(33,33,33,0.06)] transition-colors",
          isPathSelected
            ? "border-[#1976d2]"
            : "border-[#E5E9F0] hover:border-[#1976d2]/40",
        )}
      >
        <span className="whitespace-nowrap text-[13px] leading-5 tracking-[-0.26px] text-[#212121]">
          {path.name}
        </span>
        <Info className="size-3.5 text-[#8f8f8f]" strokeWidth={1.6} absoluteStrokeWidth />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="flex size-4 items-center justify-center text-[#8f8f8f] hover:text-foreground"
            >
              <MoreVertical className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() =>
                onUpdatePaths((paths) => paths.filter((p) => p.id !== path.id))
              }
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </button>

      {/* Nodes — each preceded by a droppable zone */}
      {sortedNodes.map((node, idx) => (
        <div key={node.id} className="flex w-full flex-col items-center">
          <BranchPathZone
            branchNodeId={branchNodeId}
            pathId={path.id}
            afterOrder={zoneAfterOrder(idx)}
            isDragActive={isDragActive}
            isPathSelected={isPathSelected}
            onAddNode={(type) => addNodeAfter(zoneAfterOrder(idx), type)}
          />
          <NodeCard
            node={node}
            isSelected={selectedNodeId === node.id}
            onSelect={() => onSelectNode(node.id)}
            onToggle={() => toggleNode(node.id)}
            onDelete={() => removeNode(node.id)}
            onDuplicate={() => {}}
            displayOrder={startOrder + node.order}
          />
          {/* Nested branch: render its sub-paths immediately below */}
          {node.type === "branch" && (
            <BranchPaths
              node={node}
              onSaveConfig={(config) => {
                onUpdatePaths((paths) =>
                  paths.map((p) =>
                    p.id !== path.id
                      ? p
                      : {
                          ...p,
                          nodes: p.nodes.map((n) =>
                            n.id === node.id ? { ...n, config } : n,
                          ),
                        },
                  ),
                );
              }}
              selectedNodeId={selectedNodeId}
              onSelectNode={onSelectNode}
              selectedBranchPath={selectedBranchPath}
              onSelectBranchPath={onSelectBranchPath}
              isDragActive={isDragActive}
              parentStartOrder={startOrder + node.order}
              depth={depth + 1}
            />
          )}
        </div>
      ))}

      {/*
        Final zone + End — only shown when the last node is NOT a branch.
        When the last node IS a branch, its nested BranchPaths already provides
        End chips for every sub-path; rendering another one here creates stranded nodes.
        Users add nodes inside sub-paths via the + buttons within each branch column.
      */}
      {sortedNodes[sortedNodes.length - 1]?.type !== "branch" && (
        <>
          <BranchPathZone
            branchNodeId={branchNodeId}
            pathId={path.id}
            afterOrder={sortedNodes.length > 0 ? sortedNodes[sortedNodes.length - 1]!.order : -1}
            isDragActive={isDragActive}
            isPathSelected={isPathSelected}
            onAddNode={(type) =>
              addNodeAfter(
                sortedNodes.length > 0 ? sortedNodes[sortedNodes.length - 1]!.order : -1,
                type,
              )
            }
          />
          <div className="rounded bg-[#eaeaea] px-2 py-0.5 text-[12px] leading-[18px] text-[#555]">End</div>
        </>
      )}
    </div>
  );
}

function BranchPaths({
  node,
  onSaveConfig,
  selectedNodeId,
  onSelectNode,
  selectedBranchPath,
  onSelectBranchPath,
  isDragActive,
  parentStartOrder,
  depth = 0,
}: {
  node: WorkflowNode;
  onSaveConfig: (config: Record<string, unknown>) => void;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  selectedBranchPath: BranchPathSelection | null;
  onSelectBranchPath: (sel: BranchPathSelection | null) => void;
  isDragActive: boolean;
  /** The display order of this branch node — path nodes continue sequentially from here. */
  parentStartOrder?: number;
  /** Nesting depth — controls column gap so branches at deeper levels stay compact. */
  depth?: number;
}) {
  const paths = getOrMigratePaths(node.config);
  if (paths.length === 0) return null;

  const updatePaths = (updater: (paths: BranchPath[]) => BranchPath[]) => {
    const newPaths = updater(paths);
    onSaveConfig({ ...node.config, paths: newPaths });
  };

  /** Each path's nodes start numbering after all previous paths' nodes. */
  const base = parentStartOrder ?? node.order;
  const pathStartOrders = paths.reduce<number[]>((acc, p, i) => {
    const prevEnd = i === 0 ? 0 : acc[i - 1]! + paths[i - 1]!.nodes.length;
    return [...acc, base + 1 + prevEnd];
  }, []);

  return (
    <div className="flex flex-col items-center">
      {/* Trunk from branch card down to the SVG connector — blue when any path of this branch is selected */}
      <div
        className={cn(
          "h-16 w-px",
          selectedBranchPath?.branchNodeId === node.id ? "bg-[#1976d2]" : "bg-[#C5CAD3]",
        )}
      />
      {/* SVG draws the horizontal split with 4px rounded corners at each column */}
      <BranchConnectorSVG
        pathCount={paths.length}
        columnGap={branchGapForDepth(depth)}
        selectedPathIndex={
          selectedBranchPath?.branchNodeId === node.id
            ? paths.findIndex((p) => p.id === selectedBranchPath.pathId)
            : -1
        }
      />
      {/* Columns — no top connector div needed (SVG provides the vertical arms) */}
      <div className="flex items-start" style={{ gap: `${branchGapForDepth(depth)}px` }}>
        {paths.map((path, i) => (
          <BranchPathColumn
            key={path.id}
            branchNodeId={node.id}
            path={path}
            onUpdatePaths={updatePaths}
            selectedNodeId={selectedNodeId}
            onSelectNode={onSelectNode}
            selectedBranchPath={selectedBranchPath}
            onSelectBranchPath={onSelectBranchPath}
            isDragActive={isDragActive}
            startOrder={pathStartOrders[i]!}
            depth={depth}
          />
        ))}
      </div>
    </div>
  );
}

function LibraryPhase({
  onCreateFromScratch,
  onUseTemplate,
}: {
  onCreateFromScratch: () => void;
  onUseTemplate: (templateId: string) => void;
}) {
  const templatesRef = useRef<HTMLDivElement>(null);

  const scrollToTemplates = () => {
    templatesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex flex-1 flex-col items-center overflow-y-auto bg-background px-8 py-6">
      <div className="flex w-full max-w-[920px] flex-col items-center gap-8">
        <div className="flex w-full flex-col items-center gap-4">
          <div className="flex items-center justify-center rounded-lg bg-muted/50">
            <img
              src={AGENTS_BUILDER_LIBRARY_EMPTY_ILLUSTRATION}
              alt=""
              width={218}
              height={194}
              className="h-[194px] w-[218px] select-none"
              decoding="async"
              aria-hidden
            />
          </div>

          <div className="flex max-w-[615px] flex-col items-center">
            <div className="flex items-start justify-center gap-2 text-center text-[14px] leading-5 tracking-tight">
              <img
                src={AGENTS_BUILDER_LIBRARY_EMPTY_SPARKLE}
                alt=""
                width={16}
                height={16}
                className="mt-0.5 size-4 shrink-0"
                decoding="async"
                aria-hidden
              />
              <div className="flex min-w-0 flex-col items-center gap-3 text-pretty text-[14px] leading-5">
                <p>
                  <span className="text-muted-foreground">Build your agent. </span>
                  <button
                    type="button"
                    onClick={onCreateFromScratch}
                    className="text-[14px] leading-5 text-primary underline-offset-4 hover:underline"
                  >
                    Create from scratch
                  </button>
                </p>
                <p className="text-[14px] leading-5 text-muted-foreground">or</p>
                <p>
                  <span className="text-muted-foreground">Select from </span>
                  <button
                    type="button"
                    onClick={scrollToTemplates}
                    className="inline-flex items-center gap-0.5 text-[14px] leading-5 text-primary underline-offset-4 hover:underline"
                  >
                    <span>library</span>
                    <ChevronDown
                      className="size-4 shrink-0 translate-y-px text-primary"
                      strokeWidth={1.6}
                      absoluteStrokeWidth
                      aria-hidden
                    />
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          id="review-response-agent-templates"
          ref={templatesRef}
          className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:items-stretch xl:grid-cols-4 xl:gap-3"
        >
          {RESPONSE_AGENT_LIBRARY_TEMPLATES.map((template) => (
            <ResponseAgentLibraryTemplateCard
              key={template.id}
              template={template}
              onUseAgent={onUseTemplate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function BuildingPhase({
  nodes,
  selectedNodeId,
  onSelectNode,
  onToggleNode,
  onDeleteNode,
  onDuplicateNode,
  onInsertBetween,
  onAddBranch,
  onSaveBranchConfig,
  selectedBranchPath,
  onSelectBranchPath,
  isDragActive,
  emphasizeTriggerDropZones,
  hasFloatingPropertyPanel,
  workflowCanvasApiRef,
}: {
  nodes: WorkflowNode[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  onToggleNode: (id: string) => void;
  onDeleteNode: (id: string) => void;
  onDuplicateNode: (id: string) => void;
  onInsertBetween: (afterOrder: number) => void;
  onAddBranch: (id: string) => void;
  onSaveBranchConfig: (branchNodeId: string, config: Record<string, unknown>) => void;
  selectedBranchPath: BranchPathSelection | null;
  onSelectBranchPath: (sel: BranchPathSelection | null) => void;
  isDragActive: boolean;
  /** Pulse trunk insert `+` controls while dragging a trigger (Review Response agent 2.0). */
  emphasizeTriggerDropZones: boolean;
  /** When true, reserve trailing space for the absolute `PropertiesPanel` so pan/zoom content stays visually centered. */
  hasFloatingPropertyPanel: boolean;
  /** When set (e.g. coaching co-pilot), exposes `focusWorkflowNode` to pan/zoom the canvas to a node. */
  workflowCanvasApiRef?: MutableRefObject<WorkflowCanvasApi | null>;
}) {
  type CanvasLayout = "vertical" | "horizontal";

  const [transform, setTransform] = useState<CanvasTransform>({ x: 0, y: 0, scale: 1 });
  const [canvasLayout, setCanvasLayout] = useState<CanvasLayout>("vertical");
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<{ mx: number; my: number; tx: number; ty: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const prevHadFloatingPanel = useRef(hasFloatingPropertyPanel);

  const focusWorkflowNode = useCallback(
    (nodeId: string) => {
      onSelectNode(nodeId);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const canvas = canvasRef.current;
          const el = canvas?.querySelector(`[data-workflow-node-id="${nodeId}"]`) as HTMLElement | null;
          if (!canvas || !el) return;
          const c = canvas.getBoundingClientRect();
          const n = el.getBoundingClientRect();
          const dx = (c.left + c.width / 2) - (n.left + n.width / 2);
          const dy = (c.top + c.height / 2) - (n.top + n.height / 2);
          setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
        });
      });
    },
    [onSelectNode],
  );

  useLayoutEffect(() => {
    const ref = workflowCanvasApiRef;
    if (!ref) return;
    ref.current = { focusWorkflowNode };
    return () => {
      ref.current = null;
    };
  }, [workflowCanvasApiRef, focusWorkflowNode]);

  useEffect(() => {
    if (prevHadFloatingPanel.current && !hasFloatingPropertyPanel) {
      setTransform((prev) => ({ ...prev, x: 0, y: 0 }));
    }
    prevHadFloatingPanel.current = hasFloatingPropertyPanel;
  }, [hasFloatingPropertyPanel]);

  /** `pr-[…]` already excludes the right pane from this flex column; bias by half the left overlay only. */
  const canvasTranslateX = useMemo(
    () => `calc(${transform.x}px + ${AGENTS_BUILDER_TOOLBOX_HALF_OFFSET_CSS})`,
    [transform.x],
  );

  const zoomPercent = Math.round(transform.scale * 100);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest("[data-node]")) return;
      setIsPanning(true);
      panStart.current = { mx: e.clientX, my: e.clientY, tx: transform.x, ty: transform.y };
    },
    [transform.x, transform.y],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isPanning || !panStart.current) return;
      setTransform((prev) => ({
        ...prev,
        x: panStart.current!.tx + (e.clientX - panStart.current!.mx),
        y: panStart.current!.ty + (e.clientY - panStart.current!.my),
      }));
    },
    [isPanning],
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    panStart.current = null;
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setTransform((prev) => {
      const newScale = Math.min(2.0, Math.max(0.25, prev.scale + delta));
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return { ...prev, scale: newScale };
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const newX = mouseX - (mouseX - prev.x) * (newScale / prev.scale);
      const newY = mouseY - (mouseY - prev.y) * (newScale / prev.scale);
      return { x: newX, y: newY, scale: newScale };
    });
  }, []);

  const applyZoomPercent = useCallback((pct: number) => {
    const scale = Math.min(2, Math.max(0.25, pct / 100));
    setTransform((prev) => ({ ...prev, scale }));
  }, []);

  const handleTestRun = useCallback(() => {
    toast.message("Test run", {
      description: "This is a preview. Connect a backend to execute the agent.",
    });
  }, []);

  const handleFitView = useCallback(() => {
    setTransform({ x: 0, y: 0, scale: 1 });
  }, []);

  const sortedNodes = [...nodes].sort((a, b) => a.order - b.order);

  const canvasSurfaceStyle: CSSProperties = {
    backgroundColor: "hsl(220 20% 97%)",
    backgroundImage:
      "radial-gradient(circle, rgba(0,0,0,0.18) 1px, transparent 1px)",
    backgroundSize: "24px 24px",
  };

  const connectorHorizontal = (idx: number) =>
    idx > 0 ? (
      <div className="flex shrink-0 items-center gap-1 self-center px-1">
        <div className="h-px w-6 bg-border" />
        <button
          type="button"
          onClick={() => onInsertBetween(sortedNodes[idx - 1]!.order)}
          className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-muted"
        >
          <Plus className="size-[10px] text-muted-foreground" strokeWidth={1.6} absoluteStrokeWidth />
        </button>
        <div className="h-px w-6 bg-border" />
      </div>
    ) : null;

  return (
    <div
      className={cn(
        "flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden",
        hasFloatingPropertyPanel && BUILDING_PHASE_FLOATING_PANEL_RESERVE_CLASS,
      )}
      style={canvasSurfaceStyle}
    >
      <div
        className="flex w-full min-w-0 shrink-0 justify-center py-2"
        style={{ transform: `translateX(calc(${AGENTS_BUILDER_TOOLBOX_HALF_OFFSET_CSS}))` }}
      >
        <div className="flex items-center gap-0 rounded-lg border border-border bg-card px-1.5 py-2 shadow-sm">
          <div className="flex items-center gap-1.5 px-0.5">
            <div className="flex rounded-md border border-border bg-background p-0.5">
              <button
                type="button"
                aria-pressed={canvasLayout === "vertical"}
                aria-label="Vertical layout"
                onClick={() => setCanvasLayout("vertical")}
                className={cn(
                  "flex size-9 items-center justify-center rounded transition-colors",
                  canvasLayout === "vertical" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <ArrowDown className="size-4" strokeWidth={ICON_SW} absoluteStrokeWidth />
              </button>
              <button
                type="button"
                aria-pressed={canvasLayout === "horizontal"}
                aria-label="Horizontal layout"
                onClick={() => setCanvasLayout("horizontal")}
                className={cn(
                  "flex size-9 items-center justify-center rounded transition-colors",
                  canvasLayout === "horizontal" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <ArrowRight className="size-4" strokeWidth={ICON_SW} absoluteStrokeWidth />
              </button>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 rounded-md text-muted-foreground hover:text-foreground"
              aria-label="Fit view — reset zoom and pan"
              onClick={handleFitView}
            >
              <Maximize2 className="size-[18px]" strokeWidth={ICON_SW} absoluteStrokeWidth />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-9 min-w-[5.5rem] items-center justify-center gap-1 rounded-md border border-border bg-background px-3 text-[14px] leading-5 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                >
                  {zoomPercent}%
                  <ChevronDown className="size-4 shrink-0" strokeWidth={ICON_SW} absoluteStrokeWidth />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="min-w-[8rem]">
                {CANVAS_ZOOM_PRESETS.map((pct) => (
                  <DropdownMenuItem
                    key={pct}
                    className="text-[13px]"
                    onClick={() => applyZoomPercent(pct)}
                  >
                    {pct}%
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mx-1.5 h-6 w-px shrink-0 bg-border" aria-hidden />

          <div className="flex items-center gap-0.5 px-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled
              className="size-9 shrink-0 rounded-md text-muted-foreground/35"
              aria-label="Undo (not available)"
            >
              <Undo2 className="size-[18px]" strokeWidth={ICON_SW} absoluteStrokeWidth />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled
              className="size-9 shrink-0 rounded-md text-muted-foreground/35"
              aria-label="Redo (not available)"
            >
              <Redo2 className="size-[18px]" strokeWidth={ICON_SW} absoluteStrokeWidth />
            </Button>
          </div>

          <div className="mx-1.5 h-6 w-px shrink-0 bg-border" aria-hidden />

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9 shrink-0 rounded-md border-border"
            aria-label="Test run"
            onClick={handleTestRun}
          >
            <Play className="size-[18px]" strokeWidth={ICON_SW} absoluteStrokeWidth />
          </Button>
        </div>
      </div>

      <div
        ref={canvasRef}
        className={cn(
          "relative flex-1 select-none overflow-hidden",
          isPanning ? "cursor-grabbing" : "cursor-grab",
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <CanvasDropZone isDragActive={isDragActive} />

        {/* Full-size layer applies pan/zoom; inner content is width of graph and centered (Figma / Review Response agent 2.0). */}
        <div
          style={{
            transform: `translate(${canvasTranslateX}, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: "0 0",
          }}
          className="absolute inset-0 flex justify-center pt-8"
        >
          <div
            className={cn(
              "flex shrink-0",
              canvasLayout === "vertical"
                ? "flex-col items-center"
                : "flex-row flex-nowrap items-start justify-center overflow-x-auto overflow-y-hidden px-6",
            )}
          >
            {sortedNodes.map((node, idx) => (
              <div
                key={node.id}
                className={cn(
                  "flex shrink-0",
                  canvasLayout === "vertical" ? "flex-col items-center" : "flex-row items-center",
                )}
                data-node
              >
                {canvasLayout === "vertical" && idx > 0 ? (
                  <InsertDropZone
                    afterOrder={sortedNodes[idx - 1]!.order}
                    emphasize={emphasizeTriggerDropZones}
                  />
                ) : (
                  connectorHorizontal(idx)
                )}
                <NodeCard
                  node={node}
                  isSelected={selectedNodeId === node.id}
                  onSelect={() => onSelectNode(node.id)}
                  onToggle={() => onToggleNode(node.id)}
                  onDelete={() => onDeleteNode(node.id)}
                  onDuplicate={() => onDuplicateNode(node.id)}
                  onAddBranch={() => onAddBranch(node.id)}
                />
              </div>
            ))}

            {(() => {
              if (sortedNodes.length === 0) return null;
              const workflowNodes = sortedNodes.filter((n) => n.type !== "agent");
              const lastNode = sortedNodes[sortedNodes.length - 1]!;
              const isBranchTerminal = lastNode.type === "branch" && canvasLayout === "vertical";
              if (isBranchTerminal) {
                return (
                  <BranchPaths
                    node={lastNode}
                    onSaveConfig={(config) => onSaveBranchConfig(lastNode.id, config)}
                    selectedNodeId={selectedNodeId}
                    onSelectNode={onSelectNode}
                    selectedBranchPath={selectedBranchPath}
                    onSelectBranchPath={onSelectBranchPath}
                    isDragActive={isDragActive}
                    parentStartOrder={lastNode.order}
                    depth={0}
                  />
                );
              }
              const insertAfterOrder =
                workflowNodes.length === 0
                  ? (sortedNodes.find((n) => n.type === "agent")?.order ?? 0)
                  : lastNode.order;
              return canvasLayout === "vertical" ? (
                <div className="mt-0 flex flex-col items-center">
                  <InsertDropZone
                    afterOrder={insertAfterOrder}
                    emphasize={emphasizeTriggerDropZones}
                  />
                  <div className="rounded bg-[#eaeaea] px-2 py-0.5 text-[12px] leading-[18px] text-[#555]">
                    End
                  </div>
                </div>
              ) : (
                <div className="flex shrink-0 items-center self-center pl-2">
                  <div className="h-px w-8 bg-[#C5CAD3]" />
                  <div className="mx-2 rounded bg-[#eaeaea] px-2 py-0.5 text-[12px] leading-[18px] text-[#555]">
                    End
                  </div>
                  <div className="h-px w-8 bg-[#C5CAD3]" />
                </div>
              );
            })()}

            <div className={cn(canvasLayout === "vertical" ? "h-8 shrink-0" : "w-6 shrink-0")} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PanelFieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <p className="text-[12px] leading-[18px] text-foreground">
      {children}
      {required && <span className="ml-0.5 text-destructive">*</span>}
    </p>
  );
}

/** Inline read-only diff renderer used in coaching mode to preview prompt edits. */
function DiffText({ segments }: { segments: DiffSegment[] }) {
  return (
    <div
      className={cn(
        "min-h-[120px] w-full whitespace-pre-wrap px-3 py-2",
        RRA20_FORM_FIELD_SURFACE,
        RRA20_AGENT_DETAILS_VALUE_TEXT_CLASS,
      )}
    >
      {segments.map((seg, i) => {
        if (seg.kind === "removed") {
          return (
            <span key={i} className="text-red-500 line-through">
              {seg.text}
            </span>
          );
        }
        if (seg.kind === "added") {
          return (
            <span key={i} className="text-emerald-600">
              {seg.text}
            </span>
          );
        }
        return <span key={i}>{seg.text}</span>;
      })}
    </div>
  );
}


function PanelSaveButton({ onClick, label = "Save" }: { onClick: () => void; label?: string }) {
  return (
    <div className="shrink-0 border-t border-border/60 px-4 py-3">
      <Button type="button" className="w-full" onClick={onClick}>
        {label}
      </Button>
    </div>
  );
}

type WorkflowNodeCanvasPatch = {
  title?: string;
  description?: string;
  config?: Record<string, unknown>;
};

function TriggerConfigPanel({
  node,
  onSave,
  onClose,
  onCanvasPatch,
}: {
  node: WorkflowNode;
  onSave: (config: Record<string, unknown>) => void;
  onClose: () => void;
  onCanvasPatch?: (patch: WorkflowNodeCanvasPatch) => void;
}) {
  const [triggerName, setTriggerName] = useState(
    (node.config.triggerName as string) ?? node.title,
  );
  const [description, setDescription] = useState(
    (node.config.description as string) ?? node.description,
  );
  const [conditions, setConditions] = useState<string[]>(
    (node.config.conditions as string[]) ?? ["", "", ""],
  );

  useEffect(() => {
    setTriggerName((node.config.triggerName as string) ?? node.title);
    setDescription((node.config.description as string) ?? node.description);
    setConditions((node.config.conditions as string[]) ?? ["", "", ""]);
  }, [node.id]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <PanelFieldLabel required>Trigger name</PanelFieldLabel>
            <Input
              value={triggerName}
              onChange={(e) => {
                const v = e.target.value;
                setTriggerName(v);
                onCanvasPatch?.({ title: v, config: { triggerName: v } });
              }}
              className={rra20SingleLineInputClass}
            />
          </div>

          <div className="flex flex-col gap-1">
            <PanelFieldLabel required>Description</PanelFieldLabel>
            <Textarea
              value={description}
              onChange={(e) => {
                const v = e.target.value;
                setDescription(v);
                onCanvasPatch?.({ description: v, config: { description: v } });
              }}
              className={cn(rra20TextareaClass, "min-h-[80px]")}
            />
          </div>

          <div className="flex flex-col gap-2">
            <PanelFieldLabel>Trigger conditions</PanelFieldLabel>
            <div className="flex flex-col gap-2 rounded-md bg-muted/40 p-3">
              {conditions.map((_, i) => (
                <Select key={i}>
                  <SelectTrigger className="h-9 w-full border-border bg-background text-[13px]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All sources</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="yelp">Yelp</SelectItem>
                    <SelectItem value="tripadvisor">Tripadvisor</SelectItem>
                  </SelectContent>
                </Select>
              ))}
              <button
                type="button"
                className="flex items-center gap-1 text-[13px] text-primary hover:underline"
              >
                <Plus className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
                Add condition
              </button>
            </div>
          </div>

          <button type="button" className="self-start text-[13px] font-normal text-primary hover:underline">
            Advanced filters
          </button>
        </div>
      </div>

      <PanelSaveButton onClick={() => { onSave({ triggerName, description, conditions }); onClose(); }} />
    </div>
  );
}

function TaskConfigChipRow({
  chips,
  moreCount,
}: {
  chips: string[];
  moreCount?: number;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex min-h-[40px] flex-wrap items-center gap-2 rounded-md border border-border bg-background p-2">
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
        {moreCount != null && moreCount > 0 ? (
          <button type="button" className="text-[13px] font-normal text-primary hover:underline">
            + {moreCount} more
          </button>
        ) : null}
      </div>
      <button type="button" className="flex w-fit items-center gap-1 text-[13px] text-primary hover:underline">
        <Plus className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
        Add
      </button>
    </div>
  );
}

function TaskConfigPanel({
  node,
  onSave,
  onClose,
  onCanvasPatch,
  onAcceptCoachingChanges,
}: {
  node: WorkflowNode;
  onSave: (config: Record<string, unknown>) => void;
  onClose: () => void;
  onCanvasPatch?: (patch: WorkflowNodeCanvasPatch) => void;
  onAcceptCoachingChanges?: () => void;
}) {
  const toolOnlyTask = node.config.toolOnlyTask === true;
  const toolNames = (node.config.toolNames as string[] | undefined) ?? [];
  const promptStrength = node.config.promptStrength as string | undefined;
  const syncTaskNameToTitle = node.config.syncTaskNameToTitle !== false;
  const syncDescriptionToCard = node.config.syncDescriptionToCard !== false;

  const [taskName, setTaskName] = useState(
    (node.config.taskName as string) ?? node.title,
  );
  const [description, setDescription] = useState(
    (node.config.description as string) ?? node.description,
  );
  const [llmModel, setLlmModel] = useState(
    (node.config.llmModel as string) ?? "fast",
  );
  const [systemPrompt, setSystemPrompt] = useState(
    (node.config.systemPrompt as string) ?? "",
  );
  const [userPrompt, setUserPrompt] = useState(
    (node.config.userPrompt as string) ?? "",
  );

  useEffect(() => {
    setTaskName((node.config.taskName as string) ?? node.title);
    setDescription((node.config.description as string) ?? node.description);
    setLlmModel((node.config.llmModel as string) ?? "fast");
    setSystemPrompt((node.config.systemPrompt as string) ?? "");
    setUserPrompt((node.config.userPrompt as string) ?? "");
  }, [node.id]);

  const coachingHighlightIds = useContext(CoachingHighlightContext);
  const coachingDiff: CoachingDiff | undefined = coachingHighlightIds.has(node.id)
    ? COACHING_DIFFS[node.id]
    : undefined;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <PanelFieldLabel required>Task name</PanelFieldLabel>
            <Input
              value={taskName}
              onChange={(e) => {
                const v = e.target.value;
                setTaskName(v);
                onCanvasPatch?.(
                  syncTaskNameToTitle
                    ? { title: v, config: { taskName: v } }
                    : { config: { taskName: v } },
                );
              }}
              className={rra20SingleLineInputClass}
            />
          </div>

          <div className="flex flex-col gap-1">
            <PanelFieldLabel required>Description</PanelFieldLabel>
            <Textarea
              value={description}
              onChange={(e) => {
                const v = e.target.value;
                setDescription(v);
                onCanvasPatch?.(
                  syncDescriptionToCard
                    ? { description: v, config: { description: v } }
                    : { config: { description: v } },
                );
              }}
              className={cn(rra20TextareaClass, "min-h-[80px]")}
            />
          </div>

          {toolOnlyTask ? (
            <div className="flex flex-col gap-2">
              <PanelFieldLabel>Tools</PanelFieldLabel>
              <div className="flex flex-col gap-1">
                {toolNames.map((tn) => (
                  <button
                    key={tn}
                    type="button"
                    className="flex h-10 w-full items-center gap-2 rounded-md border border-border bg-background px-3 text-left text-[14px] text-foreground hover:bg-muted/40"
                  >
                    <Wrench className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.6} absoluteStrokeWidth />
                    <span className="min-w-0 flex-1 truncate">{tn}</span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.6} absoluteStrokeWidth />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <PanelFieldLabel>LLM Model</PanelFieldLabel>
                  <Info
                    className="size-4 shrink-0 text-muted-foreground"
                    strokeWidth={1.6}
                    absoluteStrokeWidth
                    aria-hidden
                  />
                </div>
                <Select
                  value={llmModel}
                  onValueChange={(v) => {
                    setLlmModel(v);
                    onCanvasPatch?.({ config: { llmModel: v } });
                  }}
                >
                  <SelectTrigger className="h-9 border-border bg-background text-[13px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fast">Fast</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="thinking">Thinking</SelectItem>
                    <SelectItem value="powerful">Powerful</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <PanelFieldLabel>Context</PanelFieldLabel>
                {(node.config.contextChips as string[] | undefined)?.length ? (
                  <TaskConfigChipRow
                    chips={node.config.contextChips as string[]}
                    moreCount={node.config.contextMoreCount as number | undefined}
                  />
                ) : (
                  <div className="flex min-h-[52px] items-start rounded-md border border-border bg-background p-2">
                    <button type="button" className="flex items-center gap-1 text-[13px] text-primary hover:underline">
                      <Plus className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
                      Add
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <PanelFieldLabel>Input fields</PanelFieldLabel>
                {(() => {
                  const existing = (node.config.inputFieldChips as string[] | undefined) ?? [];
                  const added = coachingDiff?.addedInputFields ?? [];
                  const hasAny = existing.length > 0 || added.length > 0;
                  if (!hasAny) {
                    return (
                      <div className="flex min-h-[52px] items-start rounded-md border border-border bg-background p-2">
                        <button type="button" className="flex items-center gap-1 text-[13px] text-primary hover:underline">
                          <Plus className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
                          Add
                        </button>
                      </div>
                    );
                  }
                  return (
                    <div className="flex flex-col gap-2">
                      <div className="flex min-h-[40px] flex-wrap items-center gap-2 rounded-md border border-border bg-background p-2">
                        {existing.map((t, i) => (
                          <span
                            key={`existing-${i}-${t}`}
                            className="max-w-full break-all rounded-md border border-primary/25 bg-primary/5 px-2 py-1 text-[13px] leading-snug text-primary"
                          >
                            {t}
                          </span>
                        ))}
                        {added.map((t, i) => (
                          <span
                            key={`added-${i}-${t}`}
                            className="max-w-full break-all rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 text-[13px] leading-snug text-emerald-700"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <button type="button" className="flex w-fit items-center gap-1 text-[13px] text-primary hover:underline">
                        <Plus className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
                        Add
                      </button>
                    </div>
                  );
                })()}
              </div>

              <div className="flex flex-col gap-1">
                <PanelFieldLabel required>System prompt</PanelFieldLabel>
                {coachingDiff?.systemPromptDiff ? (
                  <DiffText segments={coachingDiff.systemPromptDiff} />
                ) : (
                  <Textarea
                    value={systemPrompt}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSystemPrompt(v);
                      onCanvasPatch?.({ config: { systemPrompt: v } });
                    }}
                    placeholder="Enter prompt"
                    className={cn(rra20TextareaClass, "min-h-[120px]")}
                  />
                )}
              </div>

              <div className="flex flex-col gap-1">
                <PanelFieldLabel required>User prompt</PanelFieldLabel>
                {coachingDiff?.userPromptDiff ? (
                  <DiffText segments={coachingDiff.userPromptDiff} />
                ) : (
                  <Textarea
                    value={userPrompt}
                    onChange={(e) => {
                      const v = e.target.value;
                      setUserPrompt(v);
                      onCanvasPatch?.({ config: { userPrompt: v } });
                    }}
                    placeholder="Enter prompt"
                    className={cn(rra20TextareaClass, "min-h-[120px]")}
                  />
                )}
              </div>

              <div className="flex flex-col gap-1">
                <PanelFieldLabel>Output fields</PanelFieldLabel>
                {(() => {
                  const existing = (node.config.outputFieldChips as string[] | undefined) ?? [];
                  const added = coachingDiff?.addedOutputFields ?? [];
                  const hasAny = existing.length > 0 || added.length > 0;
                  if (!hasAny) {
                    return (
                      <div className="flex min-h-[56px] items-start rounded-md border border-border bg-background p-2">
                        <button type="button" className="flex items-center gap-1 text-[13px] text-primary hover:underline">
                          <Plus className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
                          Add
                        </button>
                      </div>
                    );
                  }
                  return (
                    <div className="flex flex-col gap-2">
                      <div className="flex min-h-[40px] flex-wrap items-center gap-2 rounded-md border border-border bg-background p-2">
                        {existing.map((t, i) => (
                          <span
                            key={`existing-${i}-${t}`}
                            className="max-w-full break-all rounded-md border border-primary/25 bg-primary/5 px-2 py-1 text-[13px] leading-snug text-primary"
                          >
                            {t}
                          </span>
                        ))}
                        {added.map((t, i) => (
                          <span
                            key={`added-${i}-${t}`}
                            className="max-w-full break-all rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 text-[13px] leading-snug text-emerald-700"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <button type="button" className="flex items-center gap-1 text-[13px] text-primary hover:underline">
                          <Plus className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
                          Add
                        </button>
                        <button type="button" className="flex items-center gap-1 text-[13px] text-primary hover:underline">
                          <Sparkles className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
                          Generate from prompt
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {promptStrength === "weak" ? (
                <div className="flex flex-col gap-2">
                  <PanelFieldLabel>Prompt strength</PanelFieldLabel>
                  <div className="flex flex-col gap-1.5 rounded-md border border-border bg-background p-3">
                    {coachingDiff ? (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-medium text-emerald-600">Very good</span>
                        <div className="h-2 flex-1 max-w-[200px] overflow-hidden rounded-full bg-muted">
                          <div className="h-full w-[88%] rounded-full bg-emerald-500" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[13px] font-medium text-destructive">Weak</span>
                          <div className="h-2 flex-1 max-w-[200px] overflow-hidden rounded-full bg-muted">
                            <div className="h-full w-[28%] rounded-full bg-destructive" />
                          </div>
                        </div>
                        <button type="button" className="self-start text-[13px] text-primary hover:underline">
                          View suggestions
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <PanelSaveButton
        label={coachingDiff ? "Accept changes" : "Save"}
        onClick={() => {
          if (coachingDiff) {
            const nextConfig: Record<string, unknown> = {
              ...node.config,
              taskName,
              description,
              llmModel,
            };
            if (coachingDiff.acceptedSystemPrompt) {
              nextConfig.systemPrompt = coachingDiff.acceptedSystemPrompt;
            } else {
              nextConfig.systemPrompt = systemPrompt;
            }
            if (coachingDiff.acceptedUserPrompt) {
              nextConfig.userPrompt = coachingDiff.acceptedUserPrompt;
            } else {
              nextConfig.userPrompt = userPrompt;
            }
            if (coachingDiff.acceptedInputFieldChips?.length) {
              const existing = (node.config.inputFieldChips as string[] | undefined) ?? [];
              nextConfig.inputFieldChips = [...existing, ...coachingDiff.acceptedInputFieldChips];
            }
            if (coachingDiff.acceptedOutputFieldChips?.length) {
              const existing = (node.config.outputFieldChips as string[] | undefined) ?? [];
              nextConfig.outputFieldChips = [...existing, ...coachingDiff.acceptedOutputFieldChips];
            }
            onSave(nextConfig);
            onAcceptCoachingChanges?.();
          } else if (toolOnlyTask) {
            onSave({
              ...node.config,
              taskName,
              description,
            });
          } else {
            onSave({
              ...node.config,
              taskName,
              description,
              llmModel,
              systemPrompt,
              userPrompt,
            });
          }
          onClose();
        }}
      />
    </div>
  );
}

function BranchConfigPanel({
  node,
  onSave,
  onClose,
}: {
  node: WorkflowNode;
  onSave: (config: Record<string, unknown>) => void;
  onClose: () => void;
}) {
  const [branchType, setBranchType] = useState(
    (node.config.branchType as string) ?? "condition",
  );
  const [branches, setBranches] = useState<string[]>(
    getOrMigratePaths(node.config).map((p) => p.name),
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <PanelFieldLabel required>Branch type</PanelFieldLabel>
            <Select value={branchType} onValueChange={setBranchType}>
              <SelectTrigger className="h-9 border-border bg-background text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="condition">Based on condition</SelectItem>
                <SelectItem value="random">Random split</SelectItem>
                <SelectItem value="rule">Rule-based</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <PanelFieldLabel>Branches</PanelFieldLabel>
            <div className="flex flex-col gap-1">
              {branches.map((branch, idx) => (
                <div
                  key={idx}
                  className="flex h-9 items-center gap-2 rounded border border-border bg-background px-3"
                >
                  <GripVertical
                    className="size-[14px] shrink-0 text-muted-foreground"
                    strokeWidth={1.6}
                    absoluteStrokeWidth
                  />
                  <span className="flex-1 truncate text-[14px] text-foreground">{branch}</span>
                  <button
                    type="button"
                    onClick={() => setBranches((prev) => prev.filter((_, i) => i !== idx))}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
                  </button>
                  <button type="button" className="shrink-0 text-muted-foreground hover:text-foreground">
                    <ChevronUp className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
                  </button>
                </div>
              ))}
              <div className="flex h-9 items-center gap-2 rounded border border-border bg-muted/30 px-3">
                <GripVertical
                  className="size-[14px] shrink-0 text-muted-foreground/30"
                  strokeWidth={1.6}
                  absoluteStrokeWidth
                />
                <span className="flex-1 text-[14px] text-muted-foreground">No conditions met</span>
                <Trash2 className="size-[14px] shrink-0 text-muted-foreground/30" strokeWidth={1.6} absoluteStrokeWidth />
                <ChevronUp className="size-[14px] shrink-0 text-muted-foreground/30" strokeWidth={1.6} absoluteStrokeWidth />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setBranches((prev) => [...prev, `Branch ${prev.length + 1}`])}
              className="flex items-center gap-1 self-start text-[13px] text-primary hover:underline"
            >
              <Plus className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
              Add
            </button>
          </div>
        </div>
      </div>

      <PanelSaveButton onClick={() => {
        const existing = getOrMigratePaths(node.config);
        const updatedPaths = branches.map((name, i) => ({
          ...(existing[i] ?? { id: `bp-save-${i}`, nodes: [] }),
          name,
        }));
        onSave({ branchType, paths: updatedPaths });
        onClose();
      }} />
    </div>
  );
}

function AgentDetailsConfigPanel({
  node,
  onSave,
  onCanvasPatch,
}: {
  node: WorkflowNode;
  onSave: (config: Record<string, unknown>) => void;
  onCanvasPatch?: (patch: WorkflowNodeCanvasPatch) => void;
}) {
  const [name, setName] = useState<string>((node.config.name as string) ?? "");
  const [cardDescription, setCardDescription] = useState<string>(
    (node.config.description as string) ?? node.description ?? "",
  );
  const [goals, setGoals] = useState<string>((node.config.goals as string) ?? "");
  const [outcomes, setOutcomes] = useState<string>((node.config.outcomes as string) ?? "");

  const locations = (node.config.locations as string[]) ?? [];
  const additionalLocations = (node.config.additionalLocations as number) ?? 0;

  useEffect(() => {
    setName((node.config.name as string) ?? node.title ?? "");
    setCardDescription((node.config.description as string) ?? node.description ?? "");
    setGoals((node.config.goals as string) ?? "");
    setOutcomes((node.config.outcomes as string) ?? "");
  }, [node]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <Label htmlFor="agent-details-name" className={RRA20_FORM_LABEL_CLASS}>
              Agent name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="agent-details-name"
              value={name}
              onChange={(e) => {
                const v = e.target.value;
                setName(v);
                onCanvasPatch?.({ title: v, config: { name: v } });
              }}
              className={rra20SingleLineInputClass}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="agent-details-description" className={RRA20_FORM_LABEL_CLASS}>
              Description
            </Label>
            <Textarea
              id="agent-details-description"
              value={cardDescription}
              onChange={(e) => {
                const v = e.target.value;
                setCardDescription(v);
                onCanvasPatch?.({ description: v });
              }}
              placeholder="Shown under the agent name on the canvas"
              className={cn(rra20TextareaClass, "min-h-[80px]")}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="agent-details-goals" className={RRA20_FORM_LABEL_CLASS}>
              Goals <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="agent-details-goals"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              className={rra20TextareaClass}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="agent-details-outcomes" className={RRA20_FORM_LABEL_CLASS}>
              Outcomes
            </Label>
            <Textarea
              id="agent-details-outcomes"
              value={outcomes}
              onChange={(e) => setOutcomes(e.target.value)}
              className={rra20TextareaClass}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label className={RRA20_FORM_LABEL_CLASS}>
              Locations <span className="text-destructive">*</span>
              <Info className="size-4 shrink-0 text-[color:var(--s-text-muted)]" strokeWidth={1.6} absoluteStrokeWidth />
            </Label>
            <div className="flex flex-wrap gap-2">
              {locations.map((loc) => (
                <span
                  key={loc}
                  className={cn(
                    "rounded-md bg-muted px-2 py-1.5",
                    RRA20_AGENT_DETAILS_VALUE_TEXT_CLASS,
                  )}
                >
                  {loc}
                </span>
              ))}
            </div>
            {additionalLocations > 0 ? (
              <button
                type="button"
                className="self-start text-[14px] md:text-[14px] leading-relaxed font-normal text-[color:var(--s-blue)] underline-offset-4 hover:underline"
              >
                + {additionalLocations} more
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-border/60 px-4 py-3">
        <Button
          type="button"
          className="w-full"
          onClick={() => onSave({ ...node.config, name, goals, outcomes, description: cardDescription })}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

/**
 * Right-side floating panel for editing a single Branch Path (Branch 1, Respond, etc.).
 * Renders Branch name, Description, Filter conditions, and a Save button.
 * Matches Figma "Branch spline RHS".
 */
function BranchPathDetailsPanel({
  branchNode,
  pathId,
  onClose,
  onSavePath,
}: {
  branchNode: WorkflowNode;
  pathId: string;
  onClose: () => void;
  onSavePath: (branchNodeId: string, pathId: string, updates: Partial<BranchPath>) => void;
}) {
  const paths = getOrMigratePaths(branchNode.config);
  const path = paths.find((p) => p.id === pathId);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [filters, setFilters] = useState<
    Array<{ field: string; operator: string; value: string }>
  >([{ field: "", operator: "is equal to", value: "" }]);

  useEffect(() => {
    const nextPath = getOrMigratePaths(branchNode.config).find((p) => p.id === pathId);
    if (!nextPath) return;
    setName(nextPath.name ?? "");
    setDescription(nextPath.description ?? "");
    setFilters(
      nextPath.filters?.length
        ? nextPath.filters.map((f) => ({
            field: f.field,
            operator: f.operator || "is equal to",
            value: f.value,
          }))
        : [{ field: "", operator: "is equal to", value: "" }],
    );
  }, [pathId, branchNode.config]);

  if (!path) return null;

  const persistFilters = filters.filter((f) => f.field.trim() !== "");

  return (
    <div
      className={cn(
        "absolute right-6 top-6 bottom-6 z-10 flex flex-col overflow-hidden pt-6",
        AGENTS_BUILDER_RIGHT_PANE_WIDTH_CLASS,
        FLOATING_PANEL_DOCKED_SURFACE_CLASSNAME,
      )}
    >
      <div className="flex shrink-0 items-center justify-between px-4 pb-3">
        <span className="text-[16px] leading-6 text-muted-foreground">Branch details</span>
        <div className="flex items-center gap-1">
          <button type="button" className="rounded p-1 text-muted-foreground hover:bg-muted/40" title="Test run" disabled>
            <Play className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
          </button>
          <button type="button" className="rounded p-1 text-muted-foreground hover:bg-muted/40" title="Expand">
            <ChevronUp className="size-[14px] rotate-90" strokeWidth={1.6} absoluteStrokeWidth />
          </button>
          <button type="button" onClick={onClose} className="rounded p-1 text-muted-foreground hover:bg-muted/40">
            <X className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <PanelFieldLabel required>Branch name</PanelFieldLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={rra20SingleLineInputClass}
            />
          </div>

          <div className="flex flex-col gap-1">
            <PanelFieldLabel required>Description</PanelFieldLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={cn(rra20TextareaClass, "min-h-[80px]")}
            />
          </div>

          <div className="flex flex-col gap-2">
            <PanelFieldLabel>Filter conditions</PanelFieldLabel>
            <div className="flex flex-col gap-3">
              {filters.map((row, rowIdx) => (
                <div key={rowIdx} className="flex flex-col gap-2 rounded-md bg-muted/40 p-3">
                  <Select
                    value={row.field || undefined}
                    onValueChange={(v) =>
                      setFilters((prev) =>
                        prev.map((r, i) => (i === rowIdx ? { ...r, field: v } : r)),
                      )
                    }
                  >
                    <SelectTrigger className="h-9 border-border bg-background text-[13px]">
                      <SelectValue placeholder="Select variable" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="{x} 1.Review.spam">{"{x} 1.Review.spam"}</SelectItem>
                      <SelectItem value="{x} Review.sentiment">{"{x} Review.sentiment"}</SelectItem>
                      <SelectItem value="{x} Review.rating">{"{x} Review.rating"}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={row.operator || undefined}
                    onValueChange={(v) =>
                      setFilters((prev) =>
                        prev.map((r, i) => (i === rowIdx ? { ...r, operator: v } : r)),
                      )
                    }
                  >
                    <SelectTrigger className="h-9 border-border bg-background text-[13px]">
                      <SelectValue placeholder="is equal to" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="is equal to">is equal to</SelectItem>
                      <SelectItem value="is not equal to">is not equal to</SelectItem>
                      <SelectItem value="contains">contains</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={row.value || undefined}
                    onValueChange={(v) =>
                      setFilters((prev) =>
                        prev.map((r, i) => (i === rowIdx ? { ...r, value: v } : r)),
                      )
                    }
                  >
                    <SelectTrigger className="h-9 border-border bg-background text-[13px]">
                      <SelectValue placeholder="Value" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="True">True</SelectItem>
                      <SelectItem value="False">False</SelectItem>
                      <SelectItem value="Negative">Negative</SelectItem>
                      <SelectItem value="Positive">Positive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setFilters((prev) => [
                    ...prev,
                    { field: "", operator: "is equal to", value: "" },
                  ])
                }
                className="flex items-center gap-1 self-start text-[13px] text-primary hover:underline"
              >
                <Plus className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
                Add condition
              </button>
            </div>
          </div>
        </div>
      </div>

      <PanelSaveButton
        onClick={() => {
          onSavePath(branchNode.id, path.id, {
            name,
            description,
            filters: persistFilters,
          });
          onClose();
        }}
      />
    </div>
  );
}

function PropertiesPanel({
  node,
  onClose,
  onSaveConfig,
  onCanvasPatch,
  onAcceptCoachingChanges,
}: {
  node: WorkflowNode;
  onClose: () => void;
  onSaveConfig: (id: string, config: Record<string, unknown>) => void;
  onCanvasPatch: (id: string, patch: WorkflowNodeCanvasPatch) => void;
  onAcceptCoachingChanges?: (nodeId: string) => void;
}) {
  const typeLabel =
    node.type === "agent"
      ? "Agent details"
      : node.type === "trigger"
      ? "Trigger"
      : node.type === "branch"
      ? "Branch"
      : node.type === "delay"
      ? "Delay"
      : "Task";

  return (
    <div
      className={cn(
        "absolute right-6 top-6 bottom-6 z-10 flex flex-col overflow-hidden pt-6",
        AGENTS_BUILDER_RIGHT_PANE_WIDTH_CLASS,
        FLOATING_PANEL_DOCKED_SURFACE_CLASSNAME,
      )}
    >
      <div className="flex shrink-0 items-center justify-between px-4 pb-3">
        <span className="text-[16px] leading-6 text-muted-foreground">{typeLabel}</span>
        <div className="flex items-center gap-1">
          {node.type !== "agent" && (
            <>
              <button type="button" className="rounded p-1 text-muted-foreground hover:bg-muted/40" title="Test run" disabled>
                <Play className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
              </button>
              <button type="button" className="rounded p-1 text-muted-foreground hover:bg-muted/40" title="Expand">
                <ChevronUp className="size-[14px] rotate-90" strokeWidth={1.6} absoluteStrokeWidth />
              </button>
            </>
          )}
          <button type="button" onClick={onClose} className="rounded p-1 text-muted-foreground hover:bg-muted/40">
            <X className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
          </button>
        </div>
      </div>

      {node.type === "agent" && (
        <AgentDetailsConfigPanel
          node={node}
          onCanvasPatch={(patch) => onCanvasPatch(node.id, patch)}
          onSave={(config) => {
            onSaveConfig(node.id, config);
            onClose();
          }}
        />
      )}
      {node.type === "trigger" && (
        <TriggerConfigPanel
          node={node}
          onCanvasPatch={(patch) => onCanvasPatch(node.id, patch)}
          onSave={(config) => onSaveConfig(node.id, config)}
          onClose={onClose}
        />
      )}
      {node.type === "task" && (
        <TaskConfigPanel
          node={node}
          onCanvasPatch={(patch) => onCanvasPatch(node.id, patch)}
          onSave={(config) => onSaveConfig(node.id, config)}
          onClose={onClose}
          onAcceptCoachingChanges={onAcceptCoachingChanges ? () => onAcceptCoachingChanges(node.id) : undefined}
        />
      )}
      {(node.type === "branch" || node.type === "delay") && (
        <BranchConfigPanel node={node} onSave={(config) => onSaveConfig(node.id, config)} onClose={onClose} />
      )}
    </div>
  );
}

function makePrePopulatedNodes(agentDisplayName?: string | null): WorkflowNode[] {
  return [
    makeDefaultAgentNode(agentDisplayName),
    {
      id: "node-1",
      type: "trigger",
      subtype: "new-review",
      title: "When a new review is received or updated",
      description: "Agent triggers on new or updated reviews across all sources and locations.",
      config: {},
      enabled: true,
      order: 1,
    },
    {
      id: "node-2",
      type: "task",
      subtype: "analyze-issue",
      title: "Analyze issue and find the right team",
      description: "Analyze the review and route to the appropriate team",
      config: {},
      enabled: true,
      order: 2,
    },
  ];
}

/** Matches `RESPONSE_AGENT_ROWS` id in Reviews — [Figma Review Response agent 2.0](https://www.figma.com/design/mCFHJowuWOQMo0giLAjwyj/Review-Response-agent-2.0?node-id=58-30140). */
export const AGENTS_BUILDER_NORTH_AUTONOMOUS_PRESET_ID = "north-autonomous" as const;
export const AGENTS_BUILDER_NORTH_AUTONOMOUS_DISPLAY_NAME =
  "Review response agent replying autonomously - North Region" as const;

const NORTH_AUTONOMOUS_TRIGGER_DESCRIPTION =
  "Agent triggers on new or updated reviews across all sources and locations.";

const NORTH_AUTONOMOUS_TRIAGE_DESCRIPTION =
  "The system checks the review to decide whether a response is required based on whether it is a genuine customer review or spam content that is irrelevant to the business or in any way violates the content policy of the source.";

const NORTH_AUTONOMOUS_SYSTEM_PROMPT =
  "You are the First-Line triaging agent. Analyze the incoming review if it is a genuine customer review or irrelevant spam.";

const NORTH_AUTONOMOUS_USER_PROMPT =
  "1. If the review content violates any content terms of {x} Review.source treat it as spam.\n2. If the review contains business-unrelated self-promotion or distracts from the business profile, treat it as spam.";

const NORTH_AUTONOMOUS_AGENT_GOALS =
  "Autonomously triage incoming reviews for the North Region: detect spam and policy risk, honor each source’s content rules, and route genuine reviews toward a safe, on-brand autonomous reply.";

const NORTH_AUTONOMOUS_AGENT_OUTCOMES =
  "Reduce manual moderation load, keep public responses compliant, and maintain consistent customer experience across all connected locations.";

const NORTH_AUTONOMOUS_LOCATIONS = [
  "1001 — North Region hub",
  "1002 — Seattle, WA",
  "1003 — Portland, OR",
  "1004 — Chicago, IL",
];

const NORTH_POST_TRIAGE_REVIEW_DETAILS_DESC =
  "Detects what the reviewer is talking about, maps it to the business's vocabulary, scores severity, identifies staff mentioned and competitors, and flags relevant business context details.";

const NORTH_POST_TRIAGE_RESPONSE_GENERATION_DESC =
  "Assemble the final message using the drafted strategy, the extracted details, and the brand voice.";

const NORTH_POST_TRIAGE_REVIEW_RESPONDER_CANVAS_DESC =
  "Responds to the given review using the selected response";

const NORTH_POST_TRIAGE_REVIEW_RESPONDER_PANEL_DESC = "Reply to the review using the generated response";

const NORTH_POST_TRIAGE_EMAIL_ALERT_DESC =
  "Alerts specific users when a review has been marked as SPAM and user has to take an action to flag it on the review site";

const NORTH_BRANCH_RESPOND_DESCRIPTION =
  "Decide based on the contents of the review if it warrants a reply.";

const NORTH_REVIEW_DETAILS_SYSTEM_PROMPT =
  "You are a Review Intelligence Extractor. Your job is to analyze a customer review and extract details. Be precise. Do not hallucinate. If something is not mentioned or cannot be confidently inferred from the review, do not invent it — say it explicitly as unknown or omit it.";

const NORTH_REVIEW_DETAILS_USER_PROMPT = `Analyze the following review:
Review Text: {x} Review.text
Star Rating: {x} Review.rating

Perform all of the following: extract language, severity, sentiment, severity reason, escalation flag, topics, staff mentions, competitor mentions, and any other structured fields defined in your output specification.`;

const NORTH_RESPONSE_GENERATION_SYSTEM_PROMPT =
  "You are a marketing manager specialised in writing responses to customer reviews";

const NORTH_RESPONSE_GENERATION_USER_PROMPT = `Write a response to {x} Review.text with Star rating: {x} Review.rating
Apply all relevant rules below (cumulative, not exclusive).
Rule 0 - LANGUAGE: Respond in the same language as the review.
Rule 1 - TONE AND VOICE: Reflect our brand voice; be respectful and solution-oriented.
Rule 2 - FACTUALITY: Do not invent details; only use information supported by the review and provided context.
Rule 3 - PLATFORM POLICY: Follow the destination platform's public posting guidelines.
Rule 4 - SENSITIVE TOPICS: Avoid unsafe or disallowed claims; escalate when unsure.`;

const NORTH_REVIEW_RESPONDER_SYSTEM_PROMPT =
  "You are a marketing manager specialised in responding to reviews. Given the generated response, post it to the review.";

const NORTH_REVIEW_RESPONDER_USER_PROMPT =
  "Use response from {x} 5.review.response and respond using 🔧 Review responder";

/** Canvas + default property panel values for “Review response agent replying autonomously — North Region”. */
function makeNorthAutonomousWorkflowNodes(displayName: string): WorkflowNode[] {
  const name = displayName.trim() || AGENTS_BUILDER_NORTH_AUTONOMOUS_DISPLAY_NAME;
  return [
    {
      id: DEFAULT_AGENT_NODE_ID,
      type: "agent",
      subtype: "agent-identity",
      title: name,
      description: "500 locations",
      config: {
        name,
        description: "500 locations",
        goals: NORTH_AUTONOMOUS_AGENT_GOALS,
        outcomes: NORTH_AUTONOMOUS_AGENT_OUTCOMES,
        locations: NORTH_AUTONOMOUS_LOCATIONS,
        additionalLocations: 496,
      },
      enabled: true,
      order: 0,
    },
    {
      id: "node-1",
      type: "trigger",
      subtype: "review-new-or-updated",
      title: "When a new review is received or updated",
      description: NORTH_AUTONOMOUS_TRIGGER_DESCRIPTION,
      config: {
        triggerName: "When a new review is received or updated",
        description: NORTH_AUTONOMOUS_TRIGGER_DESCRIPTION,
        conditions: ["", "", ""],
      },
      enabled: true,
      order: 1,
    },
    {
      id: "node-2",
      type: "task",
      subtype: "triage-review",
      title: "Triage review",
      description: NORTH_AUTONOMOUS_TRIAGE_DESCRIPTION,
      config: {
        taskName: "Triage review",
        description: NORTH_AUTONOMOUS_TRIAGE_DESCRIPTION,
        llmModel: "fast",
        systemPrompt: NORTH_AUTONOMOUS_SYSTEM_PROMPT,
        userPrompt: NORTH_AUTONOMOUS_USER_PROMPT,
        contextChips: ["{x} Review.comment", "{x} Review.source", "https://www.yelp.com/guidelines"],
        contextMoreCount: 8,
        inputFieldChips: ["{x} Review.comment", "{x} Review.source", "{x} Review.rating"],
        outputFieldChips: ["{x} Review.isSpam", "{x} Review.spamReason"],
      },
      enabled: true,
      order: 2,
    },
    {
      id: "north-node-branch",
      type: "branch",
      subtype: "branch",
      title: "Based on conditions",
      description: "Build condition-specific flows.",
      config: {
        branchType: "condition",
        paths: [
          {
            id: "north-path-respond",
            name: "Respond",
            description: NORTH_BRANCH_RESPOND_DESCRIPTION,
            filters: [
              {
                field: "{x} 1.Review.spam",
                operator: "is equal to",
                value: "False",
              },
            ],
            nodes: [
              {
                id: "north-node-review-details",
                type: "task",
                subtype: "review-details-extraction",
                title: "Review details extraction",
                description: NORTH_POST_TRIAGE_REVIEW_DETAILS_DESC,
                config: {
                  taskName: "Review details extraction",
                  description: NORTH_POST_TRIAGE_REVIEW_DETAILS_DESC,
                  llmModel: "thinking",
                  systemPrompt: NORTH_REVIEW_DETAILS_SYSTEM_PROMPT,
                  userPrompt: NORTH_REVIEW_DETAILS_USER_PROMPT,
                  contextChips: [
                    "Location.name",
                    "Location.brand",
                    "location.speciality",
                    "www.aspendental.com",
                  ],
                  contextMoreCount: 2,
                  inputFieldChips: [
                    "Review.comment",
                    "Review.rating",
                    "Review.source",
                    "Contact.assistedby",
                  ],
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
                  promptStrength: "weak",
                },
                enabled: true,
                order: 0,
              },
              {
                id: "north-node-response-generation",
                type: "task",
                subtype: "response-generation",
                title: "Response generation",
                description: NORTH_POST_TRIAGE_RESPONSE_GENERATION_DESC,
                config: {
                  taskName: "Response generation",
                  description: NORTH_POST_TRIAGE_RESPONSE_GENERATION_DESC,
                  llmModel: "balanced",
                  systemPrompt: NORTH_RESPONSE_GENERATION_SYSTEM_PROMPT,
                  userPrompt: NORTH_RESPONSE_GENERATION_USER_PROMPT,
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
                  promptStrength: "weak",
                },
                enabled: true,
                order: 1,
              },
              {
                id: "north-node-review-responder",
                type: "task",
                subtype: "review-responder",
                title: "Review responder",
                description: NORTH_POST_TRIAGE_REVIEW_RESPONDER_CANVAS_DESC,
                config: {
                  taskName: "Send a review response",
                  description: NORTH_POST_TRIAGE_REVIEW_RESPONDER_PANEL_DESC,
                  llmModel: "fast",
                  systemPrompt: NORTH_REVIEW_RESPONDER_SYSTEM_PROMPT,
                  userPrompt: NORTH_REVIEW_RESPONDER_USER_PROMPT,
                  promptStrength: "weak",
                  syncTaskNameToTitle: false,
                  syncDescriptionToCard: false,
                },
                enabled: true,
                order: 2,
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
                subtype: "send-email-alert",
                title: "Send an email alert",
                description: NORTH_POST_TRIAGE_EMAIL_ALERT_DESC,
                config: {
                  taskName: "Send an email alert",
                  description: NORTH_POST_TRIAGE_EMAIL_ALERT_DESC,
                  toolOnlyTask: true,
                  toolNames: ["Send email"],
                },
                enabled: true,
                order: 0,
              },
            ],
          },
        ],
      },
      enabled: true,
      order: 3,
    },
  ];
}

function resolveBuilderInitialNodes(
  agentName?: string | null,
  workflowPresetId?: string | null,
): WorkflowNode[] {
  const isNorthAutonomous =
    workflowPresetId === AGENTS_BUILDER_NORTH_AUTONOMOUS_PRESET_ID ||
    agentName === AGENTS_BUILDER_NORTH_AUTONOMOUS_DISPLAY_NAME;
  if (isNorthAutonomous) {
    return makeNorthAutonomousWorkflowNodes(agentName ?? AGENTS_BUILDER_NORTH_AUTONOMOUS_DISPLAY_NAME);
  }
  if (agentName) return makePrePopulatedNodes(agentName);
  return [];
}

export function AgentsBuilderView({
  onBack,
  agentName,
  workflowPresetId,
  initialPhase,
  coachingHighlightNodeIds,
  initialSelectedNodeId,
  leftPanel,
  onCoachingAcceptChanges,
  onCoachingEditAgent,
  coachingSuggestedChanges,
}: AgentsBuilderViewProps) {
  const [acceptedCoachingNodeIds, setAcceptedCoachingNodeIds] = useState<Set<string>>(new Set());

  const coachingHighlightSet = useMemo(
    () => new Set((coachingHighlightNodeIds ?? []).filter((id) => !acceptedCoachingNodeIds.has(id))),
    [coachingHighlightNodeIds, acceptedCoachingNodeIds],
  );

  const effectiveSuggestedChanges = useMemo(
    () => coachingSuggestedChanges?.filter((item) => !acceptedCoachingNodeIds.has(item.nodeId)),
    [coachingSuggestedChanges, acceptedCoachingNodeIds],
  );

  function handleAcceptNodeCoachingChanges(nodeId: string) {
    setAcceptedCoachingNodeIds((prev) => new Set([...prev, nodeId]));
  }
  const [phase, setPhase] = useState<BuilderPhase>(
    initialPhase ?? (agentName || workflowPresetId ? "building" : "library"),
  );
  const [nodes, setNodes] = useState<WorkflowNode[]>(() =>
    resolveBuilderInitialNodes(agentName, workflowPresetId),
  );
  const workflowCanvasApiRef = useRef<WorkflowCanvasApi | null>(null);
  const [suggestedChangesOpen, setSuggestedChangesOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(() =>
    agentName || workflowPresetId
      ? (initialSelectedNodeId !== undefined ? initialSelectedNodeId : DEFAULT_AGENT_NODE_ID)
      : null,
  );
  const [selectedBranchPath, setSelectedBranchPath] = useState<BranchPathSelection | null>(null);
  const [dragItem, setDragItem] = useState<DraggableItemData | null>(null);

  /** Selecting a node deselects any branch path, and vice versa. */
  const handleSelectNode = useCallback((id: string | null) => {
    setSelectedNodeId(id);
    if (id !== null) setSelectedBranchPath(null);
  }, []);
  const handleSelectBranchPath = useCallback((sel: BranchPathSelection | null) => {
    setSelectedBranchPath(sel);
    if (sel !== null) setSelectedNodeId(null);
  }, []);

  /** Persist Branch-path edits (name/description/filters) into the parent branch's config. */
  const handleSaveBranchPath = useCallback(
    (branchNodeId: string, pathId: string, updates: Partial<BranchPath>) => {
      setNodes((prev) =>
        mapWorkflowNodeById(prev, branchNodeId, (n) => {
          const paths = getOrMigratePaths(n.config);
          const newPaths = paths.map((p) => (p.id === pathId ? { ...p, ...updates } : p));
          return { ...n, config: { ...n.config, paths: newPaths } };
        }),
      );
    },
    [],
  );

  /** Branch node referenced by the currently-selected branch path (if any). */
  const selectedBranchNode = useMemo(
    () => (selectedBranchPath ? findWorkflowNodeById(nodes, selectedBranchPath.branchNodeId) : null),
    [nodes, selectedBranchPath],
  );
  /** Bumped on every `onDragEnd` so toolbox flyouts close without unmounting mid-drag (breaks `useDraggable`). */
  const [toolboxFlyoutCloseTick, setToolboxFlyoutCloseTick] = useState(0);

  const initialBuildingNodes = resolveBuilderInitialNodes(agentName, workflowPresetId);
  const initialAcc = toolboxAccordionsForHasTrigger(workflowHasTriggerNode(initialBuildingNodes));
  const [toolboxTriggerExpanded, setToolboxTriggerExpanded] = useState(initialAcc.triggerExpanded);
  const [toolboxTasksExpanded, setToolboxTasksExpanded] = useState(initialAcc.tasksExpanded);
  const [toolboxControlsExpanded, setToolboxControlsExpanded] = useState(initialAcc.controlsExpanded);

  const prevTriggerCountRef = useRef<number | null>(null);

  const selectedNode = useMemo(
    () => findWorkflowNodeById(nodes, selectedNodeId),
    [nodes, selectedNodeId],
  );

  const canAddTrigger = !workflowHasTriggerNode(nodes);

  const toggleToolboxTriggerAccordion = useCallback(() => {
    setToolboxTriggerExpanded((prev) => {
      const next = !prev;
      if (next) {
        setToolboxTasksExpanded(false);
        setToolboxControlsExpanded(false);
      }
      return next;
    });
  }, []);

  const toggleToolboxTasksAccordion = useCallback(() => {
    setToolboxTasksExpanded((prev) => {
      const next = !prev;
      if (next) {
        setToolboxTriggerExpanded(false);
        setToolboxControlsExpanded(false);
      }
      return next;
    });
  }, []);

  const toggleToolboxControlsAccordion = useCallback(() => {
    setToolboxControlsExpanded((prev) => {
      const next = !prev;
      if (next) {
        setToolboxTriggerExpanded(false);
        setToolboxTasksExpanded(false);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const c = nodes.filter((n) => n.type === "trigger").length;
    const prev = prevTriggerCountRef.current;
    if (prev !== null && prev >= 1 && c === 0) {
      const acc = toolboxAccordionsForHasTrigger(false);
      setToolboxTriggerExpanded(acc.triggerExpanded);
      setToolboxTasksExpanded(acc.tasksExpanded);
      setToolboxControlsExpanded(acc.controlsExpanded);
    }
    prevTriggerCountRef.current = c;
  }, [nodes]);

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as DraggableItemData | undefined;
    if (data) setDragItem(data);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setToolboxFlyoutCloseTick((t) => t + 1);
    setDragItem(null);
    if (!event.over) return;

    const overId = String(event.over.id);
    const isCanvasDrop = overId === "canvas";
    const insertMatch = overId.match(/^insert-after-(-?\d+)$/);
    const isBranchPathDrop = overId.startsWith("bp|");

    if (!isCanvasDrop && !insertMatch && !isBranchPathDrop) return;

    const data = event.active.data.current as DraggableItemData | undefined;
    if (!data) return;

    /* ── Branch-path drop: insert dragged node into the target path ── */
    if (isBranchPathDrop) {
      const [, branchNodeId, pathId, afterOrderStr] = overId.split("|");
      const afterOrder = parseFloat(afterOrderStr ?? "0");
      const newNode: WorkflowNode = {
        id: `bpn-${Date.now()}`,
        type: data.type,
        subtype: data.subtype,
        title: data.label,
        description: data.description,
        config:
          data.type === "branch"
            ? {
                branchType: "condition",
                paths: [
                  { id: `bp-${Date.now()}-0`, name: "Branch 1", nodes: [] },
                  { id: `bp-${Date.now()}-1`, name: "Branch 2", nodes: [] },
                ],
              }
            : {},
        enabled: true,
        order: afterOrder + 0.5,
      };
      setNodes((prev) => {
        const { nodes: updated } = insertNodeIntoBranchPath(prev, branchNodeId!, pathId!, newNode);
        return updated;
      });
      setSelectedNodeId(newNode.id);
      if (phase === "library") setPhase("building");
      return;
    }

    if (data.type === "trigger" && workflowHasTriggerNode(nodes)) {
      toast.info("You can only add one trigger to this agent.");
      return;
    }

    let insertOrder: number;
    if (insertMatch) {
      const afterOrder = Number(insertMatch[1]);
      insertOrder = afterOrder + 0.5;
    } else {
      insertOrder = nodes.length > 0 ? Math.max(...nodes.map((n) => n.order)) + 1 : 1;
    }

    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type: data.type,
      subtype: data.subtype,
      title: data.label,
      description: data.description,
      config:
        data.type === "branch"
          ? {
              branchType: "condition",
              paths: [
                { id: `bp-${Date.now()}-0`, name: "Branch 1", nodes: [] },
                { id: `bp-${Date.now()}-1`, name: "Branch 2", nodes: [] },
              ],
            }
          : {},
      enabled: true,
      order: insertOrder,
    };

    setNodes((prev) => {
      const withNew = [...prev, newNode];
      // Re-normalise orders so they're integers, preserving relative positions
      const sorted = withNew.slice().sort((a, b) => a.order - b.order);
      return sorted.map((n, i) => ({ ...n, order: i }));
    });
    setSelectedNodeId(newNode.id);

    if (data.type === "trigger") {
      const acc = toolboxAccordionsForHasTrigger(true);
      setToolboxTriggerExpanded(acc.triggerExpanded);
      setToolboxTasksExpanded(acc.tasksExpanded);
      setToolboxControlsExpanded(acc.controlsExpanded);
    }

    if (phase === "library") setPhase("building");
  };

  const handleToggleNode = useCallback((id: string) => {
    setNodes((prev) => {
      if (!findWorkflowNodeById(prev, id)) return prev;
      return mapWorkflowNodeById(prev, id, (n) => ({ ...n, enabled: !n.enabled }));
    });
  }, []);

  const handleDeleteNode = useCallback((id: string) => {
    if (id === DEFAULT_AGENT_NODE_ID) return;
    setNodes((prev) => removeWorkflowNodeFromTree(prev, id));
    setSelectedNodeId((cur) => (cur === id ? null : cur));
  }, []);

  const handleDuplicateNode = useCallback((id: string) => {
    if (id === DEFAULT_AGENT_NODE_ID) return;
    setNodes((prev) => {
      const target = prev.find((n) => n.id === id);
      if (!target) return prev;
      if (target.type === "trigger") {
        toast.info("You can only add one trigger to this agent.");
        return prev;
      }
      const maxOrder = Math.max(...prev.map((n) => n.order));
      return [...prev, { ...target, id: `node-${Date.now()}`, order: maxOrder + 1 }];
    });
  }, []);

  const handleInsertBetween = useCallback((_afterOrder: number) => {
  }, []);

  const handleAddBranch = useCallback((id: string) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id !== id || n.type !== "branch") return n;
        const paths = getOrMigratePaths(n.config);
        const newPath: BranchPath = {
          id: `bp-${Date.now()}`,
          name: `Branch ${paths.length + 1}`,
          nodes: [],
        };
        return { ...n, config: { ...n.config, paths: [...paths, newPath] } };
      }),
    );
  }, []);

  const handleWorkflowNodeCanvasPatch = useCallback((id: string, patch: WorkflowNodeCanvasPatch) => {
    setNodes((prev) => {
      if (!findWorkflowNodeById(prev, id)) return prev;
      return mapWorkflowNodeById(prev, id, (n) => {
        const next = { ...n };
        if (patch.title !== undefined) next.title = patch.title;
        if (patch.description !== undefined) next.description = patch.description;
        if (patch.config) next.config = { ...n.config, ...patch.config };
        return next;
      });
    });
  }, []);

  const handleSaveConfig = useCallback((id: string, config: Record<string, unknown>) => {
    setNodes((prev) => {
      if (!findWorkflowNodeById(prev, id)) return prev;
      return mapWorkflowNodeById(prev, id, (n) => {
        const merged = { ...n.config, ...config };
        const base: WorkflowNode = { ...n, config: merged };
        if (n.type === "agent") {
          if (typeof config.name === "string") base.title = config.name;
          if (typeof config.description === "string") base.description = config.description;
          return base;
        }
        if (n.type === "trigger") {
          if (typeof config.triggerName === "string") base.title = config.triggerName;
          if (typeof config.description === "string") base.description = config.description;
          return base;
        }
        if (n.type === "task") {
          const syncTitle = merged.syncTaskNameToTitle !== false;
          const syncDesc = merged.syncDescriptionToCard !== false;
          if (typeof config.taskName === "string" && syncTitle) base.title = config.taskName;
          if (typeof config.description === "string" && syncDesc) base.description = config.description;
          return base;
        }
        return base;
      });
    });
  }, []);

  const handleCreateFromScratch = () => {
    const agentNode = makeDefaultAgentNode(agentName ?? null);
    setNodes([agentNode]);
    setSelectedNodeId(agentNode.id);
    setPhase("building");
    const acc = toolboxAccordionsForHasTrigger(false);
    setToolboxTriggerExpanded(acc.triggerExpanded);
    setToolboxTasksExpanded(acc.tasksExpanded);
    setToolboxControlsExpanded(acc.controlsExpanded);
  };

  const handleUseTemplate = (templateId: string) => {
    const template = RESPONSE_AGENT_LIBRARY_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    setNodes(makePrePopulatedNodes(template.title));
    setSelectedNodeId(DEFAULT_AGENT_NODE_ID);
    setPhase("building");
    const acc = toolboxAccordionsForHasTrigger(true);
    setToolboxTriggerExpanded(acc.triggerExpanded);
    setToolboxTasksExpanded(acc.tasksExpanded);
    setToolboxControlsExpanded(acc.controlsExpanded);
  };

  const agentsBuilderCanvasPanelValue = useMemo(
    () =>
      leftPanel
        ? {
            focusWorkflowNode: (nodeId: string) => {
              workflowCanvasApiRef.current?.focusWorkflowNode(nodeId);
            },
            selectedNodeId,
          }
        : null,
    [leftPanel, selectedNodeId],
  );

  return (
    <CoachingHighlightContext.Provider value={coachingHighlightSet}>
    <AgentsBuilderCanvasPanelContext.Provider value={agentsBuilderCanvasPanelValue}>
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        <MainCanvasViewHeader
          title={
            <span className="flex min-w-0 items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="shrink-0 rounded-md text-muted-foreground"
              >
                <ChevronLeft className="size-4" strokeWidth={1.6} absoluteStrokeWidth />
              </Button>
              {coachingHighlightNodeIds?.length ? (
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[15px] font-semibold leading-none tracking-tight text-foreground">
                    Coach
                  </span>
                  <span className="flex min-w-0 items-center gap-2 leading-none">
                    <span className="truncate text-[13px] font-normal text-muted-foreground">
                      {agentName ?? "New review response agent"}
                    </span>
                    <span className="inline-flex shrink-0 items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                      Running
                    </span>
                  </span>
                </span>
              ) : (
                <span className="truncate">
                  {agentName ?? "New review response agent"}
                </span>
              )}
            </span>
          }
          actions={
            <div className="flex items-center gap-2">
              {coachingHighlightNodeIds && coachingHighlightNodeIds.length > 0 ? (
                <>
                  {effectiveSuggestedChanges && effectiveSuggestedChanges.length > 0 ? (
                    <Popover
                      open={suggestedChangesOpen}
                      onOpenChange={setSuggestedChangesOpen}
                    >
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                        >
                          <AlertCircle className="size-4 text-amber-500" strokeWidth={1.6} absoluteStrokeWidth />
                          <span>Suggested changes ({effectiveSuggestedChanges.length})</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-[320px] p-3">
                        <div className="flex flex-col gap-2">
                          {effectiveSuggestedChanges.map((item) => (
                            <NodeInsightCard
                              key={item.nodeId}
                              node={item}
                              onSelect={() => {
                                workflowCanvasApiRef.current?.focusWorkflowNode(item.nodeId);
                                setSuggestedChangesOpen(false);
                              }}
                            />
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onCoachingEditAgent?.()}
                    className="inline-flex items-center rounded-md px-2 py-1 text-sm font-medium text-primary transition-colors hover:underline"
                    aria-label="Edit agent"
                  >
                    Edit agent
                  </button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 rounded-lg px-4 text-sm"
                    onClick={() => {
                      setNodes((prev) =>
                        prev.map((n) => {
                          const diff = COACHING_DIFFS[n.id];
                          if (!diff) return n;
                          const newConfig: Record<string, unknown> = { ...n.config };
                          if (diff.acceptedSystemPrompt) {
                            newConfig.systemPrompt = diff.acceptedSystemPrompt;
                          }
                          if (diff.acceptedUserPrompt) {
                            newConfig.userPrompt = diff.acceptedUserPrompt;
                          }
                          if (diff.acceptedOutputFieldChips?.length) {
                            const existing = (n.config.outputFieldChips as string[] | undefined) ?? [];
                            newConfig.outputFieldChips = [...existing, ...diff.acceptedOutputFieldChips];
                          }
                          return { ...n, config: newConfig };
                        }),
                      );
                      onCoachingAcceptChanges?.();
                    }}
                  >
                    Accept changes
                  </Button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                    aria-label="Auto-save"
                    title="Auto-save"
                  >
                    <CloudUpload className="size-[18px]" strokeWidth={1.6} absoluteStrokeWidth />
                  </button>
                  <Button
                    type="button"
                    className="h-9 rounded-lg px-4 text-sm"
                    onClick={() => toast.success("Agent published successfully.")}
                  >
                    Publish
                  </Button>
                </>
              )}
            </div>
          }
        />

        <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden bg-app-shell-l2-surface">
          {phase === "building" ? (
            leftPanel !== undefined ? leftPanel : (
              <ToolboxPanel
                hideFlyoutWhileDragging={dragItem !== null}
                flyoutCloseTick={toolboxFlyoutCloseTick}
                triggerExpanded={toolboxTriggerExpanded}
                tasksExpanded={toolboxTasksExpanded}
                controlsExpanded={toolboxControlsExpanded}
                onToggleTriggerAccordion={toggleToolboxTriggerAccordion}
                onToggleTasksAccordion={toggleToolboxTasksAccordion}
                onToggleControlsAccordion={toggleToolboxControlsAccordion}
                canAddTrigger={canAddTrigger}
              />
            )
          ) : null}

          {phase === "library" ? (
            <LibraryPhase
              onCreateFromScratch={handleCreateFromScratch}
              onUseTemplate={handleUseTemplate}
            />
          ) : (
            <BuildingPhase
              nodes={nodes}
              selectedNodeId={selectedNodeId}
              onSelectNode={handleSelectNode}
              onToggleNode={handleToggleNode}
              onDeleteNode={handleDeleteNode}
              onDuplicateNode={handleDuplicateNode}
              onInsertBetween={handleInsertBetween}
              onAddBranch={handleAddBranch}
              onSaveBranchConfig={handleSaveConfig}
              selectedBranchPath={selectedBranchPath}
              onSelectBranchPath={handleSelectBranchPath}
              isDragActive={dragItem !== null}
              emphasizeTriggerDropZones={dragItem?.type === "trigger"}
              hasFloatingPropertyPanel={selectedNode !== null || selectedBranchPath !== null}
              workflowCanvasApiRef={leftPanel ? workflowCanvasApiRef : undefined}
            />
          )}

          {selectedNode && (
            <PropertiesPanel
              node={selectedNode}
              onClose={() => setSelectedNodeId(null)}
              onSaveConfig={handleSaveConfig}
              onCanvasPatch={handleWorkflowNodeCanvasPatch}
              onAcceptCoachingChanges={handleAcceptNodeCoachingChanges}
            />
          )}

          {selectedBranchPath && selectedBranchNode && (
            <BranchPathDetailsPanel
              branchNode={selectedBranchNode}
              pathId={selectedBranchPath.pathId}
              onClose={() => setSelectedBranchPath(null)}
              onSavePath={handleSaveBranchPath}
            />
          )}
        </div>
      </div>

      <DragOverlay>
        {dragItem ? <DragGhostCard item={dragItem} /> : null}
      </DragOverlay>
    </DndContext>
    </AgentsBuilderCanvasPanelContext.Provider>
    </CoachingHighlightContext.Provider>
  );
}
