import { useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ExternalLink, Filter, Info, LayoutGrid, List, MoreVertical, Search } from "lucide-react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";
import { AppDataTable } from "@/app/components/ui/AppDataTable";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
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

type LibraryTemplate = {
  id: string;
  title: string;
  description: string;
};

type LibraryViewMode = "grid" | "list";
type ResponseAgentDetailTab = "outcomes" | "feedback" | "learnings" | "logs" | "reports";

type LocationOutcomeRow = {
  id: string;
  location: string;
  reviewsResponded: number;
  responseRate: number;
  averageResponseTimeMinutes: number;
  timeSavedMinutes: number;
  costSavedUsd: number;
};



const RESPONSE_AGENT_ROWS: ResponseAgentRow[] = [
  {
    id: "north-autonomous",
    name: "Review response agent replying autonomously - North Region",
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

const RESPONSE_AGENT_LIBRARY_TEMPLATES: LibraryTemplate[] = [
  {
    id: "template-replies",
    title: "Review response agent replying using templates",
    description: "Uses pre-defined templates and responds to reviews automatically",
  },
  {
    id: "autonomous-replies",
    title: "Review response agent replying autonomously",
    description: "Uses AI to analyze review sentiment, generates and posts unique, context-aware replies automatically",
  },
  {
    id: "approval-workflow",
    title: "Review response agent replying after human approval",
    description: "Uses AI to analyze review sentiment, generates and sends unique, context-aware replies for a human approval before posting",
  },
  {
    id: "dashboard-suggestions",
    title: "Review response agent suggesting replies in dashboard",
    description: "Uses AI to analyze review sentiment, generates and shows unique, context-aware replies in the dashboard for one-click manual posting",
  },
];

const columnHelper = createColumnHelper<ResponseAgentRow>();
const locationColumnHelper = createColumnHelper<LocationOutcomeRow>();

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

function ResponseAgentRowActions({ status }: { status: ResponseAgentStatus }) {
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
        <DropdownMenuItem className="text-[13px]">Edit</DropdownMenuItem>
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

function ResponseAgentLibraryCard({ template }: { template: LibraryTemplate }) {
  return (
    <article className="group relative flex h-[160px] flex-col gap-4 overflow-hidden rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/35 hover:bg-muted/20">
      <h3 className="text-[14px] font-normal leading-[22px] text-foreground">{template.title}</h3>
      <p className="text-[13px] font-light leading-[21px] text-muted-foreground group-hover:line-clamp-2">
        {template.description}
      </p>
      <div className="pointer-events-none mt-auto opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        <Button type="button" size="sm" className="pointer-events-auto h-8 rounded-md px-3 text-xs">
          Use agent
        </Button>
      </div>
    </article>
  );
}

function ResponseAgentDetailPage({
  agent,
  columnSheetOpen,
  onColumnSheetOpenChange,
  onBack,
}: {
  agent: ResponseAgentRow;
  columnSheetOpen: boolean;
  onColumnSheetOpenChange: (open: boolean) => void;
  onBack: () => void;
}) {
  const [activeDetailTab, setActiveDetailTab] = useState<ResponseAgentDetailTab>("outcomes");
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
              <DropdownMenuItem className="text-[13px]">Edit</DropdownMenuItem>
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
          {[
            {
              key: "outcomes",
              label: "Outcomes",
              count: true,
              tooltip: "A summary of results this agent has produced - reviews responded to, response rate, average response time, and time and cost saved across all locations.",
            },
            {
              key: "feedback",
              label: "Feedback",
              count: true,
              tooltip: "Each row shows a customer review alongside the agent's drafted or posted response. The agent analyses sentiment and crafts a reply - each response can be coached to refine the agent's tone and style for future interactions.",
            },
            { key: "learnings", label: "Learnings" },
            { key: "logs", label: "Logs" },
            { key: "reports", label: "Reports", external: true },
          ].map((tab) => {
            const isActive = tab.key === activeDetailTab;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveDetailTab(tab.key as ResponseAgentDetailTab)}
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
                ) : tab.count ? (
                  <Info className="h-3 w-3 opacity-45" strokeWidth={1.6} absoluteStrokeWidth />
                ) : null}
                {tab.external ? <ExternalLink className="h-3 w-3 opacity-70" strokeWidth={1.6} absoluteStrokeWidth /> : null}
                {isActive ? <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary" aria-hidden /> : null}
              </button>
            );
          })}
        </div>
      </div>

      {activeDetailTab === "outcomes" ? (
        <>
          <div className="shrink-0 px-6 pb-4 pt-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
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
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center px-6 pb-6 text-sm text-muted-foreground">
          No data available for this tab yet.
        </div>
      )}
    </div>
  );
}

export function ReviewsResponseAgentsPage() {
  const [activeTab, setActiveTab] = useState<"agents" | "library">("agents");
  const [libraryViewMode, setLibraryViewMode] = useState<LibraryViewMode>("grid");
  const [columnSheetOpen, setColumnSheetOpen] = useState(false);
  const [detailColumnSheetOpen, setDetailColumnSheetOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<ResponseAgentRow | null>(null);

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
          <div className="inline-flex items-center gap-1.5">
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
          <ResponseAgentRowActions status={info.row.original.status} />
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
      <Button type="button" className="h-9 rounded-lg text-sm">Create agent</Button>
      <Button type="button" variant="outline" size="icon">
        <Filter className="h-[14px] w-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
      </Button>
    </div>
  );

  return (
    selectedAgent ? (
      <ResponseAgentDetailPage
        agent={selectedAgent}
        columnSheetOpen={detailColumnSheetOpen}
        onColumnSheetOpenChange={setDetailColumnSheetOpen}
        onBack={() => setSelectedAgent(null)}
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
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
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
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {RESPONSE_AGENT_LIBRARY_TEMPLATES.map((template) => (
              <ResponseAgentLibraryCard key={template.id} template={template} />
            ))}
          </div>
        </div>
      )}
    </div>
    )
  );
}
