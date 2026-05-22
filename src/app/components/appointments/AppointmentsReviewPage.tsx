import { useMemo, useState } from "react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Download, Filter, Search } from "lucide-react";
import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";
import { AppDataTable } from "@/app/components/ui/AppDataTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/components/ui/utils";

type AppointmentStatus =
  | "confirmed"
  | "unconfirmed"
  | "rescheduling-requested"
  | "cancelled"
  | "no-show"
  | "waitlisted";

type AppointmentRow = {
  id: string;
  patientName: string;
  patientAge: number;
  patientAvatarUrl?: string;
  provider: string;
  apptType: string;
  dateTimeIso: string;
  status: AppointmentStatus;
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

const columnHelper = createColumnHelper<AppointmentRow>();

export function AppointmentsReviewPage() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["key"]>("all");
  const [columnSheetOpen, setColumnSheetOpen] = useState(false);

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
        id: "patient",
        header: "Patient",
        size: 280,
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
      columnHelper.accessor("provider", {
        id: "provider",
        header: "Provider",
        size: 180,
        meta: { settingsLabel: "Provider" },
        cell: (info) => <span className="text-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor("apptType", {
        id: "apptType",
        header: "Appt type",
        size: 180,
        meta: { settingsLabel: "Appt type" },
        cell: (info) => <span className="text-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor("dateTimeIso", {
        id: "dateTime",
        header: "Date & time",
        size: 220,
        meta: { settingsLabel: "Date & time" },
        cell: (info) => (
          <span className="tabular-nums text-foreground">{formatDateTime(info.getValue())}</span>
        ),
      }),
      columnHelper.accessor("status", {
        id: "status",
        header: "Status",
        size: 200,
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
          tableId="appointments.review.v1"
          data={rows}
          columns={columns}
          initialSorting={[{ id: "dateTime", desc: false }]}
          getRowId={(row) => row.id}
          className="h-full min-h-0 px-0"
          columnSheetTitle="Appointment columns"
          hideColumnsButton
          columnSheetOpen={columnSheetOpen}
          onColumnSheetOpenChange={setColumnSheetOpen}
          stickyFirstColumn={false}
          rowDensity="default"
        />
      </div>
    </div>
  );
}
