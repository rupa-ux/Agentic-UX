import { useMemo, useState } from "react";
import {
  ChevronDown,
  GripVertical,
  Info,
  LayoutGrid,
  List,
  MoreHorizontal,
} from "lucide-react";
import { Button, buttonVariants } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/ui/tooltip";
import { FLOATING_PANEL_LIST_PADDING_CLASSNAME } from "@/app/components/ui/floatingPanelSurface";
import { cn } from "@/app/components/ui/utils";
import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";
import { usePersistedState } from "@/app/hooks/usePersistedState";

type Persona = "Marketing persona" | "Operations persona" | "Customer experience";
type SortMode = "performance" | "persona" | "custom";
type ViewMode = "grid" | "list";

type AgentDirectoryItem = {
  id: string;
  name: string;
  product: string;
  description: string;
  firstMetricLabel: string;
  persona: Persona;
  runs: number;
  timeSavedHours: number;
  costSavedK: number;
  runState: "running" | "needs_attention";
  queueLabel: string;
};

type PersonaSummary = {
  label: Persona;
  products: string;
};

const AGENT_DIRECTORY: AgentDirectoryItem[] = [
  { id: "inbox-triage",         name: "Inbox triage agent",          product: "Inbox",                description: "Classifies incoming messages and routes them to the right team and priority.",                          firstMetricLabel: "Messages routed",      persona: "Operations persona",    runs: 1900, timeSavedHours: 97, costSavedK: 6.8, runState: "running",          queueLabel: "12 tasks ongoing" },
  { id: "mktg-workflow",        name: "Workflow agent",               product: "Marketing Automation", description: "Builds automations and multi-step flows tuned to conversion outcomes.",                                firstMetricLabel: "Workflows created",    persona: "Marketing persona",     runs: 1200, timeSavedHours: 68, costSavedK: 4.8, runState: "running",          queueLabel: "8 tasks ongoing" },
  { id: "mktg-template",        name: "Template agent",               product: "Marketing Automation", description: "Creates personalized email and SMS templates optimized for open and click rates.",                     firstMetricLabel: "Templates created",    persona: "Marketing persona",     runs: 960,  timeSavedHours: 54, costSavedK: 3.8, runState: "running",          queueLabel: "13 tasks ongoing" },
  { id: "reviews-generation",   name: "Review generation agent",      product: "Reviews",              description: "Sends review requests to customers after transactions via SMS and email.",                             firstMetricLabel: "New reviews",          persona: "Marketing persona",     runs: 868,  timeSavedHours: 41, costSavedK: 2.9, runState: "needs_attention", queueLabel: "9 issues identified" },
  { id: "reviews-response",     name: "Review response agent",        product: "Reviews",              description: "Drafts replies to incoming reviews based on sentiment, tone and location context.",                    firstMetricLabel: "Reviews responded",    persona: "Marketing persona",     runs: 609,  timeSavedHours: 51, costSavedK: 3.6, runState: "needs_attention", queueLabel: "3 issues identified" },
  { id: "mktg-lead-scoring",    name: "Lead scoring agent",           product: "Marketing Automation", description: "Scores inbound leads against your ICP and enriches records with firmographic context.",                firstMetricLabel: "Leads scored",         persona: "Marketing persona",     runs: 434,  timeSavedHours: 18, costSavedK: 1.3, runState: "running",          queueLabel: "5 tasks ongoing" },
  { id: "mktg-segmentation",    name: "Contact segmentation agent",   product: "Marketing Automation", description: "Builds and refreshes smart contact segments — inactive customers, high-value leads, churn-risk.",     firstMetricLabel: "Segments created",     persona: "Marketing persona",     runs: 396,  timeSavedHours: 34, costSavedK: 2.4, runState: "running",          queueLabel: "4 tasks ongoing" },
  { id: "social-publishing",    name: "Social publishing agent",      product: "Social",               description: "Schedules and publishes social posts across Instagram, Facebook and LinkedIn.",                        firstMetricLabel: "Social posts published", persona: "Marketing persona",   runs: 392,  timeSavedHours: 32, costSavedK: 2.2, runState: "running",          queueLabel: "3 tasks ongoing" },
  { id: "listings-optimization",name: "Listing optimization agent",   product: "Listings",             description: "Monitors and updates business listings for accuracy, completeness and SEO impact.",                    firstMetricLabel: "Listings optimized",   persona: "Marketing persona",     runs: 301,  timeSavedHours: 40, costSavedK: 2.8, runState: "running",          queueLabel: "2 tasks ongoing" },
  { id: "mktg-campaign",        name: "Campaign agent",               product: "Marketing Automation", description: "Builds, launches and adjusts marketing campaigns based on live performance signals.",                  firstMetricLabel: "Campaigns launched",   persona: "Marketing persona",     runs: 147,  timeSavedHours: 28, costSavedK: 2.0, runState: "running",          queueLabel: "2 tasks ongoing" },
  { id: "listings-sync",        name: "Listing sync agent",           product: "Listings",             description: "Keeps hours, services and photos in sync across 60+ directories automatically.",                      firstMetricLabel: "Listings synced",      persona: "Marketing persona",     runs: 126,  timeSavedHours: 18, costSavedK: 1.3, runState: "running",          queueLabel: "1 tasks ongoing" },
];

const PERSONA_ORDER: Persona[] = ["Marketing persona", "Operations persona", "Customer experience"];
const PERSONA_SUMMARY: PersonaSummary[] = [
  { label: "Marketing persona", products: "Reviews, Listings, Social, Referrals" },
  { label: "Operations persona", products: "Inbox, Tickets, Campaigns, Insights" },
  { label: "Customer experience", products: "Surveys, Contacts" },
];

type AgentFilterKey = "all" | "Listings" | "Reviews" | "Social" | "Inbox" | "Contacts" | "Surveys" | "Tickets" | "Marketing" | "Payments" | "Insights";
type TimeRangeKey = "last-week" | "last-month" | "custom";

const AGENT_FILTER_OPTIONS: { key: AgentFilterKey; label: string; hasAttention?: boolean }[] = [
  { key: "all", label: "All agents" },
  { key: "Listings", label: "Listings" },
  { key: "Reviews", label: "Reviews", hasAttention: true },
  { key: "Social", label: "Social" },
  { key: "Inbox", label: "Inbox" },
  { key: "Contacts", label: "Contacts" },
  { key: "Surveys", label: "Surveys" },
  { key: "Tickets", label: "Tickets" },
  { key: "Marketing", label: "Marketing automation AI" },
  { key: "Payments", label: "Payments" },
  { key: "Insights", label: "Insights" },
];

const TIME_RANGE_OPTIONS: { key: TimeRangeKey; label: string }[] = [
  { key: "last-week", label: "Last week" },
  { key: "last-month", label: "Last month" },
  { key: "custom", label: "Custom" },
];

function formatRunCount(runs: number): string {
  return runs >= 1000 ? `${(runs / 1000).toFixed(1)}K` : String(runs);
}

function formatCostSaved(costSavedK: number): string {
  return `$${costSavedK.toFixed(1)}K`;
}

function getRunningInstanceLabel(queueLabel: string): string {
  const matchedCount = queueLabel.match(/\d+/);
  if (!matchedCount) return "Running";
  const count = Number.parseInt(matchedCount[0], 10);
  if (!Number.isFinite(count) || count <= 0) return "Running";
  return `${count} Running`;
}

const AGENT_RUNNING_PILL_CLASS = "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400";

export function MetricCard({
  value,
  label,
  delta,
  tooltip,
  deltaVariant = "positive",
  valueVariant = "default",
}: {
  value: string;
  label: string;
  delta?: string;
  tooltip?: string;
  deltaVariant?: "positive" | "negative";
  valueVariant?: "default" | "destructive";
}) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-4">
      <div className="flex items-baseline gap-1">
        <p
          className={cn(
            "font-medium tabular-nums tracking-[-0.48px] text-[24px] leading-[36px]",
            valueVariant === "destructive" ? "text-destructive" : "text-foreground",
          )}
        >
          {value}
        </p>
        {delta ? (
          <p
            className={cn(
              "font-medium text-[12px] leading-[18px]",
              deltaVariant === "positive" ? "text-emerald-600" : "text-destructive",
            )}
          >
            {delta}
          </p>
        ) : null}
      </div>
      <div className="mt-2 flex items-center gap-1">
        <p className="text-[13px] leading-[18px] text-muted-foreground">{label}</p>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
              <Info className="h-4 w-4 shrink-0" strokeWidth={1.6} absoluteStrokeWidth />
            </button>
          </TooltipTrigger>
          {tooltip ? <TooltipContent side="top" className="max-w-[140px] text-left text-balance">{tooltip}</TooltipContent> : null}
        </Tooltip>
      </div>
    </div>
  );
}

function AgentDirectoryCard({
  agent,
  isCustomOrder,
  isDragging,
}: {
  agent: AgentDirectoryItem;
  isCustomOrder: boolean;
  isDragging: boolean;
}) {
  const isRunning = agent.runState === "running";

  return (
    <article
      className={cn(
        "group flex flex-col gap-4 rounded-xl border bg-card p-5 transition-colors hover:bg-muted/20",
        "border-border",
        isDragging && "opacity-60",
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{agent.product}</p>
          <button
            type="button"
            className="mt-0.5 block w-full truncate text-left text-[15px] font-medium text-foreground transition-colors group-hover:text-primary"
          >
            {agent.name}
          </button>
        </div>
        <div className="ml-auto flex shrink-0 items-center justify-end gap-1.5">
          {isCustomOrder ? (
            <button type="button" className="rounded-md p-1 text-muted-foreground hover:bg-muted" title="Drag to reorder">
              <GripVertical className="size-4" strokeWidth={1.6} absoluteStrokeWidth />
            </button>
          ) : null}
          <button type="button" className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted hover:text-foreground">
            <MoreHorizontal className="size-4" strokeWidth={1.6} absoluteStrokeWidth />
          </button>
          <Badge
            variant="outline"
            className={cn("tabular-nums", AGENT_RUNNING_PILL_CLASS)}
          >
            {isRunning ? getRunningInstanceLabel(agent.queueLabel) : "Running"}
          </Badge>
        </div>
      </div>
      <p className="truncate text-xs leading-[18px] text-muted-foreground">{agent.description}</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { value: formatRunCount(agent.runs), label: agent.firstMetricLabel },
          { value: `${agent.timeSavedHours}h`, label: "Time saved" },
          { value: formatCostSaved(agent.costSavedK), label: "Cost saved" },
        ].map(({ value, label }) => (
          <div key={label} className="flex flex-col gap-0.5">
            <p className="text-[13px] font-medium text-foreground tabular-nums">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {isRunning ? (
        <div className="rounded-lg bg-muted/45 px-3 py-2">
          <p className="text-xs text-muted-foreground">{agent.queueLabel}</p>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 rounded-lg bg-destructive/6 px-3 py-2">
          <p className="text-xs text-destructive/85">{agent.queueLabel}</p>
          <button type="button" className="shrink-0 text-xs font-medium text-primary hover:underline">
            Show details
          </button>
        </div>
      )}
    </article>
  );
}

function AgentDirectoryListTable({ agents }: { agents: AgentDirectoryItem[] }) {
  return (
    <div className="min-w-0 overflow-hidden bg-background">
      <div className="grid grid-cols-[minmax(300px,2.3fr)_minmax(190px,1.25fr)_120px_120px_120px] items-center border-b border-border px-3 py-2 text-xs text-muted-foreground">
        <p className="px-1">Agent</p>
        <p className="px-1">Product</p>
        <p className="px-1 text-right">Tasks</p>
        <p className="px-1 text-right">Time saved</p>
        <p className="px-1 text-right">Cost saved</p>
      </div>
      {agents.map((agent, index) => (
        <div
          key={agent.id}
          className={cn(
            "group grid grid-cols-[minmax(300px,2.3fr)_minmax(190px,1.25fr)_120px_120px_120px] items-center px-3 py-2.5 transition-colors hover:bg-muted/30",
            index !== agents.length - 1 && "border-b border-border",
          )}
        >
          <div className="min-w-0 px-1">
            <p className="truncate text-[13px] text-foreground transition-colors group-hover:text-primary">{agent.name}</p>
            <p className="truncate text-xs text-muted-foreground">{agent.description}</p>
          </div>
          <p className="truncate px-1 text-[13px] text-muted-foreground">{agent.product}</p>
          <p className="px-1 text-right text-[13px] tabular-nums text-foreground">{formatRunCount(agent.runs)}</p>
          <p className="px-1 text-right text-[13px] tabular-nums text-foreground">{agent.timeSavedHours}h</p>
          <p className="px-1 text-right text-[13px] tabular-nums text-emerald-600">{formatCostSaved(agent.costSavedK)}</p>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Agents landing (L1 → Agents)
   ═══════════════════════════════════════════ */

const DEFAULT_MONITOR_USER_DISPLAY_NAME = "John";

export type AgentsMonitorViewProps = {
  onBack: () => void;
  onNavigateToReviews?: () => void;
  userDisplayName?: string;
};

export function AgentsMonitorView({
  onBack,
  onNavigateToReviews,
  userDisplayName = DEFAULT_MONITOR_USER_DISPLAY_NAME,
}: AgentsMonitorViewProps) {
  void onBack;
  void onNavigateToReviews;
  void userDisplayName;
  const [agentFilter, setAgentFilter] = useState<AgentFilterKey>("all");
  const [timeRange, setTimeRange] = useState<TimeRangeKey>("last-week");
  const [sortMode, setSortMode] = usePersistedState<SortMode>("agents:directory:sort-mode", "performance");
  const [viewMode, setViewMode] = usePersistedState<ViewMode>("agents:directory:view-mode", "grid");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [customOrder, setCustomOrder] = usePersistedState<string[]>(
    "agents:directory:custom-order",
    AGENT_DIRECTORY.map((agent) => agent.id),
  );

  const orderIndex = useMemo(() => {
    const map = new Map<string, number>();
    customOrder.forEach((id, idx) => map.set(id, idx));
    return map;
  }, [customOrder]);

  const filteredAgents = useMemo(() => {
    const base = AGENT_DIRECTORY;

    if (sortMode === "custom") {
      return [...base].sort((a, b) => {
        const aIdx = orderIndex.get(a.id) ?? Number.MAX_SAFE_INTEGER;
        const bIdx = orderIndex.get(b.id) ?? Number.MAX_SAFE_INTEGER;
        if (aIdx === bIdx) return b.runs - a.runs;
        return aIdx - bIdx;
      });
    }

    if (sortMode === "performance") {
      return [...base].sort((a, b) => b.runs - a.runs);
    }

    return [...base].sort((a, b) => {
      const personaRank = PERSONA_ORDER.indexOf(a.persona) - PERSONA_ORDER.indexOf(b.persona);
      if (personaRank !== 0) return personaRank;
      return b.runs - a.runs;
    });
  }, [sortMode, orderIndex]);

  const groupedByPersona = useMemo(() => {
    const buckets: Record<Persona, AgentDirectoryItem[]> = {
      "Marketing persona": [],
      "Operations persona": [],
      "Customer experience": [],
    };
    filteredAgents.forEach((agent) => buckets[agent.persona].push(agent));
    return buckets;
  }, [filteredAgents]);

  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = { all: AGENT_DIRECTORY.length };
    for (const opt of AGENT_FILTER_OPTIONS) {
      if (opt.key !== "all") {
        counts[opt.key] = AGENT_DIRECTORY.filter((a) => a.product === opt.key).length;
      }
    }
    return counts;
  }, []);

  const metrics = useMemo(() => {
    const running = AGENT_DIRECTORY.filter((item) => item.runState === "running").length;
    const totalHours = AGENT_DIRECTORY.reduce((sum, item) => sum + item.timeSavedHours, 0);
    const totalCost = AGENT_DIRECTORY.reduce((sum, item) => sum + item.costSavedK, 0);
    const attention = AGENT_DIRECTORY.filter((item) => item.runState === "needs_attention").length;
    return {
      running,
      totalHours,
      totalCost,
      attention,
    };
  }, []);

  const reorderCustomOrder = (sourceId: string, targetId: string) => {
    setCustomOrder((prev) => {
      const next = [...prev];
      const from = next.indexOf(sourceId);
      const to = next.indexOf(targetId);
      if (from < 0 || to < 0 || from === to) return prev;
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-background">
      <div className="sticky top-0 z-10 bg-background">
        <MainCanvasViewHeader
          title="Agents"
          description="Manage and monitor AI agents across your business."
          actions={
            <div className="flex flex-wrap items-center justify-end gap-2">
              {/* Agent filter */}
              <Popover>
                <PopoverTrigger className={cn(buttonVariants({ variant: "outline" }), "h-9 rounded-lg text-sm")}>
                  {AGENT_FILTER_OPTIONS.find((o) => o.key === agentFilter)?.label ?? "All agents"}
                  <ChevronDown className="ml-1 h-4 w-4" strokeWidth={1.6} absoluteStrokeWidth />
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className={cn(
                    FLOATING_PANEL_LIST_PADDING_CLASSNAME,
                    "w-[260px] p-2 data-[state=open]:duration-150 data-[state=closed]:duration-150",
                  )}
                >
                  {AGENT_FILTER_OPTIONS.map((opt) => {
                    const count = filterCounts[opt.key] ?? 0;
                    const active = agentFilter === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setAgentFilter(opt.key)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg px-4 py-2 text-left text-[13px] transition-colors duration-150",
                          active ? "bg-muted text-foreground" : "text-foreground hover:bg-muted",
                        )}
                      >
                        <span className="min-w-0 truncate pr-3">
                          <span className="truncate">{opt.label}</span>
                        </span>
                        <span
                          className={cn(
                            "min-w-[24px] rounded-md px-1.5 py-0.5 text-center text-xs tabular-nums",
                            active
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                              : "bg-slate-50 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400",
                          )}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </PopoverContent>
              </Popover>

              {/* Time range */}
              <Popover>
                <PopoverTrigger className={cn(buttonVariants({ variant: "outline" }), "h-9 rounded-lg text-sm")}>
                  {TIME_RANGE_OPTIONS.find((o) => o.key === timeRange)?.label ?? "Last week"}
                  <ChevronDown className="ml-1 h-4 w-4" strokeWidth={1.6} absoluteStrokeWidth />
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className={cn(
                    FLOATING_PANEL_LIST_PADDING_CLASSNAME,
                    "w-[200px] p-2 data-[state=open]:duration-150 data-[state=closed]:duration-150",
                  )}
                >
                  {TIME_RANGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setTimeRange(opt.key)}
                      className={cn(
                        "flex w-full items-center rounded-lg px-4 py-2 text-left text-[13px] transition-colors duration-150",
                        timeRange === opt.key ? "bg-muted text-foreground" : "text-foreground hover:bg-muted",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>

              <Button type="button" className="h-9 rounded-lg text-sm">
                Create agent
              </Button>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-4 gap-6 px-8 pb-6 pt-2">
        <MetricCard
          value={String(metrics.running)}
          label="Running agents"
          delta="+2.4%"
          tooltip="Total agents currently active across all personas"
        />
        <MetricCard
          value={`${metrics.totalHours}h`}
          label="Time saved"
          delta="+4.2%"
          tooltip="Cumulative hours saved through agent automation this period"
        />
        <MetricCard
          value={`$${metrics.totalCost.toFixed(1)}K`}
          label="Cost saved"
          delta="+8.1%"
          tooltip="Estimated cost savings from automated agent runs this period"
        />
        <MetricCard
          value={String(metrics.attention)}
          label="Needs attention"
          delta="+1"
          deltaVariant="negative"
          valueVariant="destructive"
          tooltip="Agents requiring manual review or configuration changes"
        />
      </div>

      <section className="px-8 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 py-6">
            <h2 className="text-xl text-foreground">Agent directory</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-lg text-sm"
                  onClick={() => setSortMenuOpen((prev) => !prev)}
                >
                  {sortMode === "performance"
                    ? "Sort by agent runs"
                    : sortMode === "persona"
                      ? "Sort by persona"
                      : "Sort by custom order"}
                  <ChevronDown className="ml-1 h-4 w-4" strokeWidth={1.6} absoluteStrokeWidth />
                </Button>
                {sortMenuOpen ? (
                  <div className="absolute right-0 top-11 z-20">
                    <div className="w-[260px] rounded-xl border border-border bg-popover p-2">
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm",
                        sortMode === "performance" ? "bg-muted text-foreground" : "hover:bg-muted",
                      )}
                      onClick={() => {
                        setSortMode("performance");
                        setSortMenuOpen(false);
                      }}
                    >
                      Sort by agent runs
                      {sortMode === "performance" ? <span className="text-primary">✓</span> : null}
                    </button>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm",
                        sortMode === "persona" ? "bg-primary/10 text-primary" : "hover:bg-muted",
                      )}
                      onClick={() => setSortMode("persona")}
                    >
                      Sort by persona
                      <ChevronDown className="h-4 w-4 -rotate-90" strokeWidth={1.6} absoluteStrokeWidth />
                    </button>
                    <button
                      type="button"
                      className={cn(
                        "mt-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm",
                        sortMode === "custom" ? "bg-muted text-foreground" : "hover:bg-muted",
                      )}
                      onClick={() => {
                        setSortMode("custom");
                        setSortMenuOpen(false);
                      }}
                    >
                      Sort by custom order
                      {sortMode === "custom" ? <span className="text-primary">✓</span> : null}
                    </button>
                    </div>
                    {sortMode === "persona" ? (
                      <div className="absolute right-[calc(100%+8px)] top-[54px] w-[340px] rounded-xl border border-border bg-popover p-2">
                        {PERSONA_SUMMARY.map((entry, index) => (
                          <div
                            key={entry.label}
                            className={cn(
                              "rounded-lg px-4 py-3",
                              index === 0 ? "bg-primary/10" : "hover:bg-muted",
                            )}
                          >
                            <p className={cn("text-sm", index === 0 ? "text-primary" : "text-foreground")}>{entry.label}</p>
                            <p className="text-xs text-muted-foreground">{entry.products}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <div className="flex h-9 items-center rounded-lg border border-border bg-background p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "rounded-md p-1.5",
                    viewMode === "grid" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <LayoutGrid className="h-4 w-4" strokeWidth={1.6} absoluteStrokeWidth />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "rounded-md p-1.5",
                    viewMode === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <List className="h-4 w-4" strokeWidth={1.6} absoluteStrokeWidth />
                </button>
              </div>
            </div>
        </div>
        <div className="pt-2 pb-6">
            {sortMode === "persona" ? (
              <div className="space-y-6">
                {PERSONA_ORDER.map((persona) =>
                  groupedByPersona[persona].length > 0 ? (
                    <div key={persona}>
                      <h3 className="mb-3 text-sm text-muted-foreground">{persona}</h3>
                      {viewMode === "grid" ? (
                        <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2">
                          {groupedByPersona[persona].map((agent) => (
                            <div key={agent.id}>
                              <AgentDirectoryCard agent={agent} isCustomOrder={false} isDragging={false} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <AgentDirectoryListTable agents={groupedByPersona[persona]} />
                      )}
                    </div>
                  ) : null,
                )}
              </div>
            ) : (
              viewMode === "grid" ? (
                <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2">
                  {filteredAgents.map((agent) => (
                    <div
                      key={agent.id}
                      draggable={sortMode === "custom"}
                      onDragStart={() => {
                        if (sortMode !== "custom") return;
                        setDraggedId(agent.id);
                      }}
                      onDragOver={(event) => {
                        if (sortMode !== "custom") return;
                        event.preventDefault();
                      }}
                      onDrop={() => {
                        if (sortMode !== "custom" || !draggedId) return;
                        reorderCustomOrder(draggedId, agent.id);
                        setDraggedId(null);
                      }}
                    >
                      <AgentDirectoryCard
                        agent={agent}
                        isCustomOrder={sortMode === "custom"}
                        isDragging={draggedId === agent.id}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <AgentDirectoryListTable agents={filteredAgents} />
              )
            )}
        </div>
      </section>
    </div>
  );
}
