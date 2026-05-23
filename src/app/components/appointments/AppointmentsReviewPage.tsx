import { useMemo, useState } from "react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Bot, Download, Filter, MessageSquare, MoreVertical, Search, Send, Sparkles } from "lucide-react";
import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";
import { AppDataTable } from "@/app/components/ui/AppDataTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/app/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/ui/tooltip";
import { cn } from "@/app/components/ui/utils";

type AppointmentStatus =
  | "confirmed"
  | "unconfirmed"
  | "rescheduling-requested"
  | "cancelled"
  | "no-show"
  | "waitlisted";

type BookedBySource = "system" | "agent" | "user";

type BookedBy = {
  source: BookedBySource;
  /** User name when source is "user"; ignored otherwise. */
  name?: string;
};

type AppointmentRow = {
  id: string;
  patientName: string;
  patientAge: number;
  patientAvatarUrl?: string;
  provider: string;
  apptType: string;
  dateTimeIso: string;
  status: AppointmentStatus;
  bookedBy: BookedBy;
};

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  confirmed: "Confirmed",
  unconfirmed: "Unconfirmed",
  "rescheduling-requested": "Rescheduling requested",
  cancelled: "Cancelled",
  "no-show": "No-show",
  waitlisted: "Waitlisted",
};

const STATUS_CLASS: Record<AppointmentStatus, string> = {
  confirmed: "bg-emerald-50 text-emerald-700",
  unconfirmed: "bg-amber-50 text-amber-800",
  "rescheduling-requested": "bg-sky-50 text-sky-700",
  cancelled: "bg-rose-50 text-rose-700",
  "no-show": "bg-rose-50 text-rose-700",
  waitlisted: "bg-violet-50 text-violet-700",
};

const APPOINTMENTS: AppointmentRow[] = [
  {
    id: "a1",
    patientName: "Sarah Mitchell",
    patientAge: 40,
    patientAvatarUrl: "https://i.pravatar.cc/96?img=47",
    provider: "Dr. Karen Lee",
    apptType: "Annual physical",
    dateTimeIso: "2026-05-15T09:00",
    status: "confirmed",
    bookedBy: { source: "agent" },
  },
  {
    id: "a2",
    patientName: "David Kim",
    patientAge: 27,
    patientAvatarUrl: "https://i.pravatar.cc/96?img=12",
    provider: "Dr. Karen Lee",
    apptType: "Follow-up",
    dateTimeIso: "2026-05-15T10:30",
    status: "unconfirmed",
    bookedBy: { source: "user", name: "Jamie Rivera" },
  },
  {
    id: "a3",
    patientName: "Sophia Patel",
    patientAge: 33,
    patientAvatarUrl: "https://i.pravatar.cc/96?img=45",
    provider: "Dr. Karen Lee",
    apptType: "Telehealth",
    dateTimeIso: "2026-05-15T11:00",
    status: "rescheduling-requested",
    bookedBy: { source: "agent" },
  },
  {
    id: "a4",
    patientName: "Ella Mitchell",
    patientAge: 26,
    patientAvatarUrl: "https://i.pravatar.cc/96?img=49",
    provider: "Dr. Nina Brooks",
    apptType: "New consult",
    dateTimeIso: "2026-05-16T09:30",
    status: "confirmed",
    bookedBy: { source: "system" },
  },
  {
    id: "a5",
    patientName: "Priya Subramanian",
    patientAge: 35,
    patientAvatarUrl: "https://i.pravatar.cc/96?img=32",
    provider: "Dr. Alan Patel",
    apptType: "Urgent care",
    dateTimeIso: "2026-05-16T10:00",
    status: "confirmed",
    bookedBy: { source: "user", name: "Maria Chen" },
  },
  {
    id: "a6",
    patientName: "Mason Clark",
    patientAge: 56,
    patientAvatarUrl: "https://i.pravatar.cc/96?img=15",
    provider: "Dr. Alan Patel",
    apptType: "Follow-up",
    dateTimeIso: "2026-05-16T14:00",
    status: "cancelled",
    bookedBy: { source: "agent" },
  },
  {
    id: "a7",
    patientName: "Nadia Hartwell",
    patientAge: 44,
    patientAvatarUrl: "https://i.pravatar.cc/96?img=23",
    provider: "Dr. Karen Lee",
    apptType: "Procedure",
    dateTimeIso: "2026-05-17T08:00",
    status: "confirmed",
    bookedBy: { source: "user", name: "Jamie Rivera" },
  },
  {
    id: "a8",
    patientName: "Eleanor Moss",
    patientAge: 53,
    patientAvatarUrl: "https://i.pravatar.cc/96?img=44",
    provider: "Dr. Nina Brooks",
    apptType: "Annual physical",
    dateTimeIso: "2026-05-17T11:30",
    status: "no-show",
    bookedBy: { source: "system" },
  },
  {
    id: "a9",
    patientName: "Chen Wei",
    patientAge: 42,
    patientAvatarUrl: "https://i.pravatar.cc/96?img=13",
    provider: "Dr. Alan Patel",
    apptType: "Telehealth",
    dateTimeIso: "2026-05-17T13:00",
    status: "unconfirmed",
    bookedBy: { source: "agent" },
  },
  {
    id: "a10",
    patientName: "Marcus Hill",
    patientAge: 61,
    patientAvatarUrl: "https://i.pravatar.cc/96?img=11",
    provider: "Dr. Karen Lee",
    apptType: "Follow-up",
    dateTimeIso: "2026-05-18T09:15",
    status: "cancelled",
    bookedBy: { source: "user", name: "Maria Chen" },
  },
  {
    id: "a11",
    patientName: "Lina Alvarez",
    patientAge: 29,
    patientAvatarUrl: "https://i.pravatar.cc/96?img=20",
    provider: "Dr. Nina Brooks",
    apptType: "New consult",
    dateTimeIso: "2026-05-18T10:45",
    status: "waitlisted",
    bookedBy: { source: "agent" },
  },
  {
    id: "a12",
    patientName: "Owen Schmidt",
    patientAge: 38,
    patientAvatarUrl: "https://i.pravatar.cc/96?img=33",
    provider: "Dr. Alan Patel",
    apptType: "Urgent care",
    dateTimeIso: "2026-05-18T15:30",
    status: "no-show",
    bookedBy: { source: "system" },
  },
];

const TABS: { key: "all" | AppointmentStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unconfirmed", label: "Unconfirmed" },
  { key: "rescheduling-requested", label: "Rescheduling requested" },
  { key: "cancelled", label: "Cancelled" },
  { key: "no-show", label: "No-show" },
  { key: "waitlisted", label: "Waitlisted" },
];

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${date} ${time}`;
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type ChatTurn = {
  speaker: "patient" | "agent";
  text: string;
  time: string;
};

const CONVERSATIONS: Record<string, ChatTurn[]> = {
  a1: [
    { speaker: "patient", text: "Hi, I need to schedule my annual physical for next month.", time: "May 10, 2:14 PM" },
    { speaker: "agent", text: "Happy to help, Sarah. I see you’re due — Dr. Karen Lee has openings on May 15 at 9:00 AM or May 20 at 11:30 AM. Which works better?", time: "May 10, 2:14 PM" },
    { speaker: "patient", text: "May 15 at 9 works.", time: "May 10, 2:15 PM" },
    { speaker: "agent", text: "Booked — you’re confirmed with Dr. Karen Lee on May 15 at 9:00 AM. I’ll send a reminder 48 hours before. Anything else?", time: "May 10, 2:15 PM" },
    { speaker: "patient", text: "That’s it, thanks!", time: "May 10, 2:16 PM" },
  ],
  a2: [
    { speaker: "patient", text: "Need a follow-up after my visit last week.", time: "May 12, 9:02 AM" },
    { speaker: "agent", text: "Got it, David. Dr. Karen Lee can see you May 15 at 10:30 AM. Want me to hold it?", time: "May 12, 9:02 AM" },
    { speaker: "patient", text: "Yes please.", time: "May 12, 9:03 AM" },
    { speaker: "agent", text: "Held. Please reply YES to this message to confirm. The slot will release in 24 hours otherwise.", time: "May 12, 9:03 AM" },
  ],
  a3: [
    { speaker: "patient", text: "Can we move my telehealth visit on May 15?", time: "May 13, 4:48 PM" },
    { speaker: "agent", text: "Of course. What times work for you this week?", time: "May 13, 4:48 PM" },
    { speaker: "patient", text: "Maybe Friday afternoon?", time: "May 13, 4:50 PM" },
    { speaker: "agent", text: "I’ve flagged the original slot for rescheduling and reserved Friday May 16 at 3:15 PM pending your confirmation. Should I lock it in?", time: "May 13, 4:50 PM" },
  ],
};

function ChatBubble({ turn, patientName, patientAvatarUrl }: { turn: ChatTurn; patientName: string; patientAvatarUrl?: string }) {
  const isAgent = turn.speaker === "agent";
  return (
    <div className={cn("flex items-start gap-2.5", isAgent ? "flex-row" : "flex-row-reverse")}>
      <Avatar className="size-7 shrink-0">
        {isAgent ? (
          <AvatarFallback className="bg-primary/10 text-primary">
            <Bot className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
          </AvatarFallback>
        ) : (
          <>
            {patientAvatarUrl ? <AvatarImage src={patientAvatarUrl} alt={patientName} /> : null}
            <AvatarFallback className="text-[10px]">{initials(patientName)}</AvatarFallback>
          </>
        )}
      </Avatar>
      <div className={cn("flex max-w-[80%] flex-col gap-1", isAgent ? "items-start" : "items-end")}>
        <div
          className={cn(
            "rounded-xl px-3 py-2 text-[13px] leading-[1.5]",
            isAgent ? "bg-muted text-foreground" : "bg-primary text-primary-foreground",
          )}
        >
          {turn.text}
        </div>
        <span className="px-1 text-[11px] text-muted-foreground">{turn.time}</span>
      </div>
    </div>
  );
}

function ConversationDrawer({
  appointment,
  open,
  onOpenChange,
}: {
  appointment: AppointmentRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!appointment) return null;
  const turns = CONVERSATIONS[appointment.id] ?? [
    {
      speaker: "agent" as const,
      text: `Hi ${appointment.patientName.split(" ")[0]}, I’ve booked your ${appointment.apptType.toLowerCase()} with ${appointment.provider} for ${formatDateTime(appointment.dateTimeIso)}. Let me know if you need to change anything.`,
      time: "Earlier today",
    },
    { speaker: "patient" as const, text: "Thanks!", time: "Earlier today" },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" inset="floating" floatingSize="md" className="flex flex-col gap-0 p-0">
        <SheetHeader className="border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 shrink-0">
              {appointment.patientAvatarUrl ? (
                <AvatarImage src={appointment.patientAvatarUrl} alt={appointment.patientName} />
              ) : null}
              <AvatarFallback className="text-[11px]">{initials(appointment.patientName)}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <SheetTitle className="text-[15px] font-medium leading-tight">
                {appointment.patientName}
              </SheetTitle>
              <SheetDescription className="text-[12px]">
                {appointment.apptType} · {appointment.provider} · {formatDateTime(appointment.dateTimeIso)}
              </SheetDescription>
            </div>
          </div>
          <div className="flex items-center gap-1.5 pt-1">
            <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              <Sparkles className="size-3" strokeWidth={1.6} absoluteStrokeWidth />
              Appointment agent
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium",
                STATUS_CLASS[appointment.status],
              )}
            >
              {STATUS_LABEL[appointment.status]}
            </span>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="flex flex-col gap-4">
            {turns.map((turn, i) => (
              <ChatBubble
                key={i}
                turn={turn}
                patientName={appointment.patientName}
                patientAvatarUrl={appointment.patientAvatarUrl}
              />
            ))}
          </div>
        </div>

        <div className="border-t border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Reply on behalf of the agent…"
              className="flex-1 rounded-md border border-border bg-card px-3 py-2 text-[13px] outline-none placeholder:text-muted-foreground focus:border-primary"
            />
            <Button type="button" size="icon" aria-label="Send">
              <Send className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function BookedByCell({ bookedBy }: { bookedBy: BookedBy }) {
  if (bookedBy.source === "user") {
    return <span className="text-foreground">{bookedBy.name ?? "Unknown user"}</span>;
  }
  const label = bookedBy.source === "system" ? "System" : "Agent";
  const classes =
    bookedBy.source === "system"
      ? "bg-muted text-muted-foreground"
      : "bg-sky-50 text-sky-700";
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[12px] font-medium", classes)}>
      {label}
    </span>
  );
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[32px] font-medium leading-none tracking-[-0.02em] tabular-nums text-foreground">
        {value}
      </span>
      <span className="text-[13px] text-muted-foreground">{label}</span>
    </div>
  );
}

function RowActionButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          onClick={onClick}
          className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

function RowActions() {
  return (
    <div className="flex items-center gap-1.5 opacity-0 transition-opacity group-hover/table-row:opacity-100 focus-within:opacity-100">
      <RowActionButton label="Quick send">
        <Send className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
      </RowActionButton>
      <RowActionButton label="Message">
        <MessageSquare className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
      </RowActionButton>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="More options"
                className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <MoreVertical className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="top">More options</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem className="text-[13px]">View patient</DropdownMenuItem>
          <DropdownMenuItem className="text-[13px]">Reschedule</DropdownMenuItem>
          <DropdownMenuItem className="text-[13px]">Mark as confirmed</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-[13px] text-destructive focus:text-destructive">
            Cancel appointment
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

const columnHelper = createColumnHelper<AppointmentRow>();

export function AppointmentsReviewPage() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["key"]>("all");
  const [columnSheetOpen, setColumnSheetOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentRow | null>(null);

  const counts = useMemo(() => {
    return {
      total: APPOINTMENTS.length,
      unconfirmed: APPOINTMENTS.filter((a) => a.status === "unconfirmed").length,
      cancelled: APPOINTMENTS.filter((a) => a.status === "cancelled").length,
      noShow: APPOINTMENTS.filter((a) => a.status === "no-show").length,
    };
  }, []);

  const rows = useMemo(
    () => (activeTab === "all" ? APPOINTMENTS : APPOINTMENTS.filter((a) => a.status === activeTab)),
    [activeTab],
  );

  const columns = useMemo<ColumnDef<AppointmentRow, unknown>[]>(
    () => [
      columnHelper.accessor("patientName", {
        id: "bookedFor",
        header: "Booked for",
        size: 280,
        meta: { settingsLabel: "Booked for" },
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="size-9 shrink-0">
                {row.patientAvatarUrl ? <AvatarImage src={row.patientAvatarUrl} alt={row.patientName} /> : null}
                <AvatarFallback className="text-[11px]">{initials(row.patientName)}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-[13px] text-foreground">{row.patientName}</span>
                <span className="text-[12px] text-muted-foreground">{row.patientAge} yrs</span>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("provider", {
        id: "provider",
        header: "Provider",
        size: 180,
        meta: { settingsLabel: "Provider" },
        cell: (info) => <span className="text-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor("apptType", {
        id: "appointmentType",
        header: "Appointment type",
        size: 180,
        meta: { settingsLabel: "Appointment type" },
        cell: (info) => <span className="text-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor("dateTimeIso", {
        id: "appointmentTime",
        header: "Appointment time",
        size: 220,
        meta: { settingsLabel: "Appointment time" },
        cell: (info) => (
          <span className="tabular-nums text-foreground">{formatDateTime(info.getValue())}</span>
        ),
      }),
      columnHelper.accessor("status", {
        id: "status",
        header: "Status",
        size: 180,
        meta: { settingsLabel: "Status" },
        cell: (info) => {
          const status = info.getValue();
          return (
            <span
              className={cn(
                "inline-flex items-center rounded-md px-2 py-0.5 text-[12px] font-medium",
                STATUS_CLASS[status],
              )}
            >
              {STATUS_LABEL[status]}
            </span>
          );
        },
      }),
      columnHelper.accessor((row) => row.bookedBy, {
        id: "bookedBy",
        header: "Booked by",
        size: 160,
        meta: { settingsLabel: "Booked by" },
        sortingFn: (a, b) => {
          const aLabel = a.original.bookedBy.source === "user" ? a.original.bookedBy.name ?? "" : a.original.bookedBy.source;
          const bLabel = b.original.bookedBy.source === "user" ? b.original.bookedBy.name ?? "" : b.original.bookedBy.source;
          return aLabel.localeCompare(bLabel);
        },
        cell: (info) => <BookedByCell bookedBy={info.getValue()} />,
      }),
      columnHelper.display({
        id: "rowActions",
        header: "",
        enableSorting: false,
        enableResizing: false,
        size: 140,
        meta: { settingsLabel: "Actions" },
        cell: () => (
          <div className="flex w-full justify-end pr-2">
            <RowActions />
          </div>
        ),
      }),
    ],
    [],
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <MainCanvasViewHeader
        title="Review appointments"
        actions={
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="icon" aria-label="Search appointments">
              <Search className="h-[14px] w-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
            </Button>
            <Button type="button" variant="outline" size="icon" aria-label="Filter appointments">
              <Filter className="h-[14px] w-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
            </Button>
            <Button type="button" className="h-9 gap-1.5 rounded-lg text-sm">
              <Download className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
              Export
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="shrink-0 px-6 pb-6 pt-0">
        <div className="grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-4">
          <Stat value={counts.total} label="Appointments" />
          <Stat value={counts.unconfirmed} label="Unconfirmed" />
          <Stat value={counts.cancelled} label="Cancellations received" />
          <Stat value={counts.noShow} label="No-shows" />
        </div>
      </div>

      {/* Tabs */}
      <div className="shrink-0 px-6 pb-4">
        <div className="inline-flex items-center border-b border-border">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "relative px-4 py-2 text-sm",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
                {isActive ? (
                  <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary" aria-hidden />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="min-h-0 flex-1 px-6 pb-6">
        <AppDataTable<AppointmentRow>
          tableId="appointments.review.v3"
          persist={false}
          data={rows}
          columns={columns}
          initialSorting={[{ id: "appointmentTime", desc: false }]}
          getRowId={(row) => row.id}
          className="h-full min-h-0 px-0"
          columnSheetTitle="Appointment columns"
          hideColumnsButton
          columnSheetOpen={columnSheetOpen}
          onColumnSheetOpenChange={setColumnSheetOpen}
          stickyFirstColumn={false}
          rowDensity="default"
          onRowClick={setSelectedAppointment}
        />
      </div>

      <ConversationDrawer
        appointment={selectedAppointment}
        open={selectedAppointment !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedAppointment(null);
        }}
      />
    </div>
  );
}
