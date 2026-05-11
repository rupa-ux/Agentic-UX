import { useState, useCallback, useEffect, useLayoutEffect, useMemo, useRef, type CSSProperties } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { RESPONSE_AGENT_LIBRARY_TEMPLATES } from "@/app/components/reviews/responseAgentLibraryTemplates";
import { ResponseAgentLibraryTemplateCard } from "@/app/components/reviews/ResponseAgentLibraryTemplateCard";
import { FLOATING_PANEL_DOCKED_SURFACE_CLASSNAME } from "@/app/components/ui/floatingPanelSurface";

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
  initialPhase?: BuilderPhase;
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

/** Agent → first node: single vertical guide (unchanged visual weight). */
const CANVAS_VERTICAL_GUIDE_AGENT_CLASS = "h-[60px] w-px bg-[#C5CAD3]";
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
}: {
  node: WorkflowNode;
  isSelected: boolean;
  onSelect: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onAddBranch?: () => void;
}) {
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
      onClick={onSelect}
      className={cn(
        "w-[400px] rounded-lg bg-white p-4 text-left",
        CARD_SHADOW,
        isSelected ? CARD_SELECTED : CARD_DEFAULT,
      )}
    >
      {/* Header row — icon column aligns with `order.` below; type label aligns with headline */}
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-0.5">
          <span className={NODE_CARD_GLYPH_COL_CLASS}>{nodeTypeIcon(node.type)}</span>
          <span className="text-[11px] leading-[18px] tracking-[-0.22px] text-[#8f8f8f]">{typeLabel}</span>
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
          {node.order}.
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

function InsertDropZone({ afterOrder }: { afterOrder: number }) {
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
            isOver
              ? "scale-110 bg-[#1976d2] text-white shadow-md"
              : "bg-[#f4f6f7] text-[#555]",
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
  isDragActive,
}: {
  branchNodeId: string;
  path: BranchPath;
  onUpdatePaths: (updater: (paths: BranchPath[]) => BranchPath[]) => void;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  isDragActive: boolean;
}) {
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
      {/* Connector down from horizontal split to chip */}
      <div className="h-10 w-px bg-[#C5CAD3]" />

      {/* Branch path chip */}
      <div className="flex items-center gap-1.5 rounded border border-[#E5E9F0] bg-white px-3 py-1.5 shadow-[0_2px_6px_rgba(33,33,33,0.06)]">
        <span className="whitespace-nowrap text-[13px] leading-5 tracking-[-0.26px] text-[#212121]">
          {path.name}
        </span>
        <Info className="size-3.5 text-[#8f8f8f]" strokeWidth={1.6} absoluteStrokeWidth />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
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
      </div>

      {/* Nodes — each preceded by a droppable zone */}
      {sortedNodes.map((node, idx) => (
        <div key={node.id} className="flex w-full flex-col items-center">
          <BranchPathZone
            branchNodeId={branchNodeId}
            pathId={path.id}
            afterOrder={zoneAfterOrder(idx)}
            isDragActive={isDragActive}
            onAddNode={(type) => addNodeAfter(zoneAfterOrder(idx), type)}
          />
          <NodeCard
            node={node}
            isSelected={selectedNodeId === node.id}
            onSelect={() => onSelectNode(node.id)}
            onToggle={() => toggleNode(node.id)}
            onDelete={() => removeNode(node.id)}
            onDuplicate={() => {}}
          />
        </div>
      ))}

      {/* Final zone before End */}
      <BranchPathZone
        branchNodeId={branchNodeId}
        pathId={path.id}
        afterOrder={sortedNodes.length > 0 ? sortedNodes[sortedNodes.length - 1]!.order : -1}
        isDragActive={isDragActive}
        onAddNode={(type) =>
          addNodeAfter(
            sortedNodes.length > 0 ? sortedNodes[sortedNodes.length - 1]!.order : -1,
            type,
          )
        }
      />
      <div className="rounded bg-[#eaeaea] px-2 py-0.5 text-[12px] leading-[18px] text-[#555]">End</div>
    </div>
  );
}

function BranchPaths({
  node,
  onSaveConfig,
  selectedNodeId,
  onSelectNode,
  isDragActive,
}: {
  node: WorkflowNode;
  onSaveConfig: (config: Record<string, unknown>) => void;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  isDragActive: boolean;
}) {
  const paths = getOrMigratePaths(node.config);
  if (paths.length === 0) return null;

  const updatePaths = (updater: (paths: BranchPath[]) => BranchPath[]) => {
    const newPaths = updater(paths);
    onSaveConfig({ ...node.config, paths: newPaths });
  };

  const COLUMN_WIDTH = 400;
  const COLUMN_GAP = 80;
  const HALF_COL = COLUMN_WIDTH / 2;

  return (
    <div className="flex flex-col items-center">
      <div className="h-10 w-px bg-[#C5CAD3]" />
      <div className="relative flex items-start" style={{ gap: `${COLUMN_GAP}px` }}>
        {paths.length > 1 && (
          <div
            className="absolute top-0 h-px bg-[#C5CAD3]"
            style={{ left: `${HALF_COL}px`, right: `${HALF_COL}px` }}
          />
        )}
        {paths.map((path) => (
          <BranchPathColumn
            key={path.id}
            branchNodeId={node.id}
            path={path}
            onUpdatePaths={updatePaths}
            selectedNodeId={selectedNodeId}
            onSelectNode={onSelectNode}
            isDragActive={isDragActive}
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
  isDragActive,
  hasFloatingPropertyPanel,
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
  isDragActive: boolean;
  /** When true, reserve trailing space for the absolute `PropertiesPanel` so pan/zoom content stays visually centered. */
  hasFloatingPropertyPanel: boolean;
}) {
  type CanvasLayout = "vertical" | "horizontal";

  const [transform, setTransform] = useState<CanvasTransform>({ x: 0, y: 0, scale: 1 });
  const [canvasLayout, setCanvasLayout] = useState<CanvasLayout>("vertical");
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<{ mx: number; my: number; tx: number; ty: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const prevHadFloatingPanel = useRef(hasFloatingPropertyPanel);

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

  const connectorVertical = (idx: number) => {
    if (idx === 0) return null;
    const prevNode = sortedNodes[idx - 1];
    const isAfterAgent = prevNode?.type === "agent";
    return isAfterAgent ? (
      /* plain line between agent pill and first workflow node — no + button */
      <div className={CANVAS_VERTICAL_GUIDE_AGENT_CLASS} />
    ) : (
      /* line + hub + line between workflow nodes — total span matches agent guide */
      <div className="flex flex-col items-center">
        <div className={CANVAS_VERTICAL_GUIDE_NODE_SEGMENT_CLASS} />
        <button
          type="button"
          onClick={() => onInsertBetween(sortedNodes[idx - 1]!.order)}
          className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#f4f6f7] text-[#555] transition-colors hover:bg-[#e8eaed]"
        >
          <Plus className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
        </button>
        <div className={CANVAS_VERTICAL_GUIDE_NODE_SEGMENT_CLASS} />
      </div>
    );
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
              "flex min-w-0 max-w-full shrink-0",
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
                {isDragActive && idx > 0 && canvasLayout === "vertical" ? (
                  <InsertDropZone afterOrder={sortedNodes[idx - 1]!.order} />
                ) : canvasLayout === "vertical" ? connectorVertical(idx) : connectorHorizontal(idx)}
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
              const lastNode = sortedNodes[sortedNodes.length - 1]!;
              const isBranchTerminal = lastNode.type === "branch" && canvasLayout === "vertical";
              if (isBranchTerminal) {
                return (
                  <BranchPaths
                    node={lastNode}
                    onSaveConfig={(config) => onSaveBranchConfig(lastNode.id, config)}
                    selectedNodeId={selectedNodeId}
                    onSelectNode={onSelectNode}
                    isDragActive={isDragActive}
                  />
                );
              }
              return canvasLayout === "vertical" ? (
                <div className="mt-0 flex flex-col items-center">
                  {isDragActive ? (
                    <InsertDropZone afterOrder={lastNode.order} />
                  ) : (
                    <div className={CANVAS_VERTICAL_GUIDE_NODE_SEGMENT_CLASS} />
                  )}
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

function PanelSaveButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="shrink-0 border-t border-border/60 px-4 py-3">
      <Button type="button" className="w-full" onClick={onClick}>
        Save
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
        </div>
      </div>

      <PanelSaveButton onClick={() => { onSave({ triggerName, description, conditions }); onClose(); }} />
    </div>
  );
}

function TaskConfigPanel({
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
                onCanvasPatch?.({ title: v, config: { taskName: v } });
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

          <div className="flex flex-col gap-1">
            <PanelFieldLabel>LLM Model</PanelFieldLabel>
            <Select value={llmModel} onValueChange={setLlmModel}>
              <SelectTrigger className="h-9 border-border bg-background text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fast">Fast</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="powerful">Powerful</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <PanelFieldLabel>Context</PanelFieldLabel>
            <div className="flex min-h-[52px] items-start rounded-md border border-border bg-background p-2">
              <button type="button" className="flex items-center gap-1 text-[13px] text-primary hover:underline">
                <Plus className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
                Add
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <PanelFieldLabel>Input fields</PanelFieldLabel>
            <div className="flex min-h-[52px] items-start rounded-md border border-border bg-background p-2">
              <button type="button" className="flex items-center gap-1 text-[13px] text-primary hover:underline">
                <Plus className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
                Add
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <PanelFieldLabel required>System prompt</PanelFieldLabel>
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Enter prompt"
              className={cn(rra20TextareaClass, "min-h-[120px]")}
            />
          </div>

          <div className="flex flex-col gap-1">
            <PanelFieldLabel required>User prompt</PanelFieldLabel>
            <Textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Enter prompt"
              className={cn(rra20TextareaClass, "min-h-[120px]")}
            />
          </div>

          <div className="flex flex-col gap-1">
            <PanelFieldLabel>Output fields</PanelFieldLabel>
            <div className="flex min-h-[56px] items-start rounded-md border border-border bg-background p-2">
              <button type="button" className="flex items-center gap-1 text-[13px] text-primary hover:underline">
                <Plus className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      <PanelSaveButton onClick={() => { onSave({ taskName, description, llmModel, systemPrompt, userPrompt }); onClose(); }} />
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

function PropertiesPanel({
  node,
  onClose,
  onSaveConfig,
  onCanvasPatch,
}: {
  node: WorkflowNode;
  onClose: () => void;
  onSaveConfig: (id: string, config: Record<string, unknown>) => void;
  onCanvasPatch: (id: string, patch: WorkflowNodeCanvasPatch) => void;
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

export function AgentsBuilderView({ onBack, agentName, initialPhase }: AgentsBuilderViewProps) {
  const [phase, setPhase] = useState<BuilderPhase>(
    initialPhase ?? (agentName ? "building" : "library")
  );
  const [nodes, setNodes] = useState<WorkflowNode[]>(() =>
    agentName ? makePrePopulatedNodes(agentName) : [],
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(() =>
    agentName ? DEFAULT_AGENT_NODE_ID : null,
  );
  const [dragItem, setDragItem] = useState<DraggableItemData | null>(null);
  /** Bumped on every `onDragEnd` so toolbox flyouts close without unmounting mid-drag (breaks `useDraggable`). */
  const [toolboxFlyoutCloseTick, setToolboxFlyoutCloseTick] = useState(0);

  const initialBuildingNodes = agentName ? makePrePopulatedNodes(agentName) : [];
  const initialAcc = toolboxAccordionsForHasTrigger(workflowHasTriggerNode(initialBuildingNodes));
  const [toolboxTriggerExpanded, setToolboxTriggerExpanded] = useState(initialAcc.triggerExpanded);
  const [toolboxTasksExpanded, setToolboxTasksExpanded] = useState(initialAcc.tasksExpanded);
  const [toolboxControlsExpanded, setToolboxControlsExpanded] = useState(initialAcc.controlsExpanded);

  const prevTriggerCountRef = useRef<number | null>(null);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

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
      setNodes((prev) =>
        prev.map((n) => {
          if (n.id !== branchNodeId) return n;
          const paths = getOrMigratePaths(n.config);
          const newPaths = paths.map((p) => {
            if (p.id !== pathId) return p;
            const withNew = [...p.nodes, newNode].sort((a, b) => a.order - b.order);
            return { ...p, nodes: withNew.map((nd, i) => ({ ...nd, order: i })) };
          });
          return { ...n, config: { ...n.config, paths: newPaths } };
        }),
      );
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
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n))
    );
  }, []);

  const handleDeleteNode = useCallback((id: string) => {
    if (id === DEFAULT_AGENT_NODE_ID) return;
    setNodes((prev) => prev.filter((n) => n.id !== id));
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
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id !== id) return n;
        const next = { ...n };
        if (patch.title !== undefined) next.title = patch.title;
        if (patch.description !== undefined) next.description = patch.description;
        if (patch.config) next.config = { ...n.config, ...patch.config };
        return next;
      }),
    );
  }, []);

  const handleSaveConfig = useCallback((id: string, config: Record<string, unknown>) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id !== id) return n;
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
          if (typeof config.taskName === "string") base.title = config.taskName;
          if (typeof config.description === "string") base.description = config.description;
          return base;
        }
        return base;
      }),
    );
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

  return (
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
              <span className="truncate text-foreground">
                {agentName ?? "New review response agent"}
              </span>
            </span>
          }
        />

        <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden bg-app-shell-l2-surface">
          {phase === "building" ? (
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
              onSelectNode={setSelectedNodeId}
              onToggleNode={handleToggleNode}
              onDeleteNode={handleDeleteNode}
              onDuplicateNode={handleDuplicateNode}
              onInsertBetween={handleInsertBetween}
              onAddBranch={handleAddBranch}
              onSaveBranchConfig={handleSaveConfig}
              isDragActive={dragItem !== null}
              hasFloatingPropertyPanel={selectedNode !== null}
            />
          )}

          {selectedNode && (
            <PropertiesPanel
              node={selectedNode}
              onClose={() => setSelectedNodeId(null)}
              onSaveConfig={handleSaveConfig}
              onCanvasPatch={handleWorkflowNodeCanvasPatch}
            />
          )}
        </div>
      </div>

      <DragOverlay>
        {dragItem ? <DragGhostCard item={dragItem} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
