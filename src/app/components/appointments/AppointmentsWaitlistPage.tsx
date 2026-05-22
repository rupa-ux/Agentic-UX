import { useMemo, useState } from "react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import {
  CalendarDays,
  List as ListIcon,
  Mail,
  MessageSquare,
  MoreVertical,
  Phone,
  Plus,
  Settings,
} from "lucide-react";
import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";
import { AppDataTable } from "@/app/components/ui/AppDataTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { SegmentedToggle } from "@/app/components/ui/segmented-toggle";
import { cn } from "@/app/components/ui/utils";

type WaitlistStatus = "agent-called" | "pending" | "slot-offered";
type OutreachChannel = "phone" | "email" | "sms";

type WaitlistRow = {
  id: string;
  patientName: string;
  patientAge: number;
  patientAvatarUrl?: string;
  department: string;
  visitType: string;
  provider: string;
  daysWaiting: number;
  lastOutreachChannel: OutreachChannel;
  lastOutreachLabel: string;
  status: WaitlistStatus;
};

const STATUS_LABEL: Record<WaitlistStatus, string> = {
  "agent-called": "Agent called",
  pending: "Pending",
  "slot-offered": "Slot offered",
};

const STATUS_CLASS: Record<WaitlistStatus, string> = {
  "agent-called": "bg-sky-50 text-sky-700",
  pending: "bg-amber-50 text-amber-800",
  "slot-offered": "bg-violet-50 text-violet-700",
};

const WAITLIST: WaitlistRow[] = [
  {
    id: "w1",
    patientName: "Sebastian Hill",
    patientAge: 44,
    patientAvatarUrl: "https://i.pravatar.cc/96?img=12",
    department: "Cardiology",
    visitType: "Procedure",
    provider: "Dr. Marcus",
    daysWaiting: 28,
    lastOutreachChannel: "phone",
    lastOutreachLabel: "2d ago",
    status: "agent-called",
  },
  {
    id: "w2",
    patientName: "Scarlett Roberts",
    patientAge: 38,
    patientAvatarUrl: "https://i.pravatar.cc/96?img=47",
    department: "Family medicine",
    visitType: "Urgent care",
    provider: "Dr. Karen L.",
    daysWaiting: 27,
    lastOutreachChannel: "phone",
    lastOutreachLabel: "1d ago",
    status: "pending",
  },
  {
    id: "w3",
    patientName: "Ella Mitchell",
    patientAge: 26,
    patientAvatarUrl: "https://i.pravatar.cc/96?img=49",
    department: "Internal medicine",
    visitType: "New consult",
    provider: "Dr. Nina Br.",
    daysWaiting: 26,
    lastOutreachChannel: "email",
    lastOutreachLabel: "9d ago",
    status: "pending",
  },
  {
    id: "w4",
    patientName: "Elijah Adams",
    patientAge: 63,
    patientAvatarUrl: "https://i.pravatar.cc/96?img=11",
    department: "Orthopedics",
    visitType: "Urgent care",
    provider: "Dr. Marcus",
    daysWaiting: 25,
    lastOutreachChannel: "phone",
    lastOutreachLabel: "Today",
    status: "agent-called",
  },
  {
    id: "w5",
    patientName: "Chloe Harris",
    patientAge: 19,
    patientAvatarUrl: "https://i.pravatar.cc/96?img=20",
    department: "Family medicine",
    visitType: "New consult",
    provider: "Dr. Karen L.",
    daysWaiting: 22,
    lastOutreachChannel: "email",
    lastOutreachLabel: "7d ago",
    status: "pending",
  },
  {
    id: "w6",
    patientName: "Ava Nguyen",
    patientAge: 24,
    patientAvatarUrl: "https://i.pravatar.cc/96?img=13",
    department: "Gastroenterology",
    visitType: "Procedure",
    provider: "Dr. Nina",
    daysWaiting: 21,
    lastOutreachChannel: "sms",
    lastOutreachLabel: "1d ago",
    status: "slot-offered",
  },
  {
    id: "w7",
    patientName: "Olivia Bennett",
    patientAge: 60,
    patientAvatarUrl: "https://i.pravatar.cc/96?img=33",
    department: "Cardiology",
    visitType: "Urgent care",
    provider: "Dr. Marcus",
    daysWaiting: 19,
    lastOutreachChannel: "phone",
    lastOutreachLabel: "Today",
    status: "agent-called",
  },
  {
    id: "w8",
    patientName: "Mason Clark",
    patientAge: 56,
    patientAvatarUrl: "https://i.pravatar.cc/96?img=15",
    department: "Internal medicine",
    visitType: "Follow-up",
    provider: "Dr. Alan Pa.",
    daysWaiting: 18,
    lastOutreachChannel: "phone",
    lastOutreachLabel: "4d ago",
    status: "slot-offered",
  },
  {
    id: "w9",
    patientName: "Priya Subramanian",
    patientAge: 35,
    patientAvatarUrl: "https://i.pravatar.cc/96?img=32",
    department: "Dermatology",
    visitType: "New consult",
    provider: "Dr. Lin",
    daysWaiting: 15,
    lastOutreachChannel: "email",
    lastOutreachLabel: "2d ago",
    status: "pending",
  },
  {
    id: "w10",
    patientName: "Marcus Hill",
    patientAge: 61,
    patientAvatarUrl: "https://i.pravatar.cc/96?img=8",
    department: "Cardiology",
    visitType: "Follow-up",
    provider: "Dr. Marcus",
    daysWaiting: 12,
    lastOutreachChannel: "phone",
    lastOutreachLabel: "Today",
    status: "agent-called",
  },
];

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function OutreachIcon({ channel }: { channel: OutreachChannel }) {
  const Icon = channel === "phone" ? Phone : channel === "email" ? Mail : MessageSquare;
  return <Icon className="size-3.5 text-muted-foreground" strokeWidth={1.6} absoluteStrokeWidth />;
}

const columnHelper = createColumnHelper<WaitlistRow>();

export function AppointmentsWaitlistPage() {
  const [viewMode, setViewMode] = useState<"calendar" | "list">("list");
  const [columnSheetOpen, setColumnSheetOpen] = useState(false);

  const columns = useMemo<ColumnDef<WaitlistRow, unknown>[]>(
    () => [
      columnHelper.accessor("patientName", {
        id: "patient",
        header: "Patient",
        size: 240,
        meta: { settingsLabel: "Patient" },
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
      columnHelper.accessor("department", {
        id: "department",
        header: "Department",
        size: 180,
        meta: { settingsLabel: "Department" },
        cell: (info) => <span className="text-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor("visitType", {
        id: "visitType",
        header: "Visit type",
        size: 160,
        meta: { settingsLabel: "Visit type" },
        cell: (info) => <span className="text-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor("provider", {
        id: "provider",
        header: "Provider",
        size: 160,
        meta: { settingsLabel: "Provider" },
        cell: (info) => <span className="text-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor("daysWaiting", {
        id: "daysWaiting",
        header: "Days waiting",
        size: 140,
        meta: { settingsLabel: "Days waiting" },
        sortingFn: "alphanumeric",
        cell: (info) => (
          <span className="tabular-nums text-foreground">{info.getValue()} days</span>
        ),
      }),
      columnHelper.accessor("lastOutreachLabel", {
        id: "lastOutreach",
        header: "Last outreach",
        size: 160,
        meta: { settingsLabel: "Last outreach" },
        cell: (info) => {
          const row = info.row.original;
          return (
            <span className="inline-flex items-center gap-2 text-foreground">
              <OutreachIcon channel={row.lastOutreachChannel} />
              {info.getValue()}
            </span>
          );
        },
      }),
      columnHelper.accessor("status", {
        id: "status",
        header: "Status",
        size: 160,
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
    ],
    [],
  );

  const headerActions = (
    <div className="flex items-center gap-2">
      <SegmentedToggle<"calendar" | "list">
        iconOnly
        ariaLabel="Waitlist view"
        value={viewMode}
        onChange={setViewMode}
        className="border border-border"
        items={[
          {
            value: "calendar",
            label: "Calendar view",
            icon: <CalendarDays className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />,
          },
          {
            value: "list",
            label: "List view",
            icon: <ListIcon className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />,
          },
        ]}
      />
      <Button type="button" className="h-9 gap-1.5 rounded-lg text-sm">
        <Plus className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
        Add patients
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" size="icon" aria-label="More actions">
            <MoreVertical className="h-[14px] w-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem className="text-[13px]">Export waitlist</DropdownMenuItem>
          <DropdownMenuItem className="text-[13px]">Bulk message</DropdownMenuItem>
          <DropdownMenuItem className="text-[13px]">Print</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button type="button" variant="outline" size="icon" aria-label="Waitlist settings">
        <Settings className="h-[14px] w-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
      </Button>
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <MainCanvasViewHeader
        title="Waitlist"
        description="Track waiting patients by department, provider, or arrival date. Offer slots as they open up."
        actions={headerActions}
      />

      {viewMode === "list" ? (
        <div className="min-h-0 flex-1 px-6 pb-6">
          <AppDataTable<WaitlistRow>
            tableId="appointments.waitlist.v1"
            data={WAITLIST}
            columns={columns}
            initialSorting={[{ id: "daysWaiting", desc: true }]}
            getRowId={(row) => row.id}
            className="h-full min-h-0 px-0"
            columnSheetTitle="Waitlist columns"
            hideColumnsButton
            columnSheetOpen={columnSheetOpen}
            onColumnSheetOpenChange={setColumnSheetOpen}
            stickyFirstColumn={false}
            rowDensity="default"
          />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center px-6 pb-6 text-sm text-muted-foreground">
          Calendar view for the waitlist is not available in this prototype.
        </div>
      )}
    </div>
  );
}
