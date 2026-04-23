import { useCallback, useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import {
  DollarSign, Download, Search, MoreHorizontal,
  TrendingUp, ArrowDownToLine, Receipt, Info,
  CheckCircle2, X, RotateCcw, FileText,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { AppDataTable } from "@/app/components/ui/AppDataTable";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/app/components/ui/sheet";
import {
  Tooltip, TooltipContent, TooltipTrigger, TooltipProvider,
} from "@/app/components/ui/tooltip";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/app/components/ui/dialog";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";
import { L2_FLAT_NAV_KEY_PREFIX } from "@/app/components/L2NavLayout";

/* ─── Types ─── */
export type TxStatus = "received" | "requested" | "not_paid" | "refunded" | "cancelled";

export type PaymentsStatusFilter = TxStatus | "all";

export function paymentsL2KeyToStatusFilter(l2Key: string): PaymentsStatusFilter {
  if (l2Key === `${L2_FLAT_NAV_KEY_PREFIX}/received`) return "received";
  if (l2Key === `${L2_FLAT_NAV_KEY_PREFIX}/requested`) return "requested";
  if (l2Key === `${L2_FLAT_NAV_KEY_PREFIX}/not_paid`) return "not_paid";
  if (l2Key === `${L2_FLAT_NAV_KEY_PREFIX}/refunded`) return "refunded";
  if (l2Key === `${L2_FLAT_NAV_KEY_PREFIX}/cancelled`) return "cancelled";
  return "all";
}

interface Transaction {
  id: string;
  contactName: string;
  businessName: string;
  amount: number;
  status: TxStatus;
  date: string;
  description: string;
}

type ModalType = "cancel" | "mark_paid" | "refund" | "invoice" | null;

/* ─── Mock data ─── */
const PIE_DATA = [
  { name: "Received",  value: 68, color: "var(--chart-2)" },
  { name: "Not paid",  value: 21, color: "var(--chart-4)" },
  { name: "Refunded",  value: 11, color: "var(--chart-5)" },
];

const TOTAL_REQUESTED = 142_800;

const METRIC_BLOCKS = [
  {
    label: "Available balance",
    value: "$4,218.00",
    icon: DollarSign,
    tooltip: "Funds available for payout. A reserve of 5% is held for 7 days after each payment.",
  },
  {
    label: "Net earnings",
    value: "$97,104.00",
    icon: TrendingUp,
    tooltip: "Gross received minus refunds and fees. Formula: Received – Refunded – Processing fees.",
  },
  {
    label: "Paid out",
    value: "$92,886.00",
    icon: ArrowDownToLine,
    tooltip: null,
  },
  {
    label: "Monthly bill",
    value: "$349.00",
    icon: Receipt,
    tooltip: "Billing breakdown: 1 location × $349/mo Payments plan.",
  },
];

const TRANSACTIONS: Transaction[] = [
  { id: "t1",  contactName: "Sarah Johnson",    businessName: "Johnson Dental",      amount: 320.00,  status: "received",   date: "Apr 12, 2026", description: "Teeth cleaning + X-ray" },
  { id: "t2",  contactName: "Marcus Webb",       businessName: "Webb Auto Repair",    amount: 1_450.00, status: "not_paid",  date: "Apr 11, 2026", description: "Engine diagnostic & repair" },
  { id: "t3",  contactName: "Priya Nair",        businessName: "Nair Law Group",      amount: 800.00,  status: "received",   date: "Apr 10, 2026", description: "Consultation retainer" },
  { id: "t4",  contactName: "Derek Osei",        businessName: "Osei Landscaping",    amount: 550.00,  status: "refunded",   date: "Apr 9, 2026",  description: "Spring lawn service" },
  { id: "t5",  contactName: "Amelia Torres",     businessName: "Torres HVAC",         amount: 2_200.00, status: "received",  date: "Apr 8, 2026",  description: "AC unit installation" },
  { id: "t6",  contactName: "Raj Patel",         businessName: "Patel Pharmacy",      amount: 145.00,  status: "requested",  date: "Apr 7, 2026",  description: "Prescription & vitamins" },
  { id: "t7",  contactName: "Linda Kraft",       businessName: "Kraft Catering",      amount: 3_800.00, status: "received",  date: "Apr 6, 2026",  description: "Corporate event catering" },
  { id: "t8",  contactName: "Noah Chambers",     businessName: "Chambers Plumbing",   amount: 420.00,  status: "cancelled",  date: "Apr 5, 2026",  description: "Pipe repair – guest bath" },
  { id: "t9",  contactName: "Fatima Al-Rashid",  businessName: "Al-Rashid Salon",     amount: 220.00,  status: "received",   date: "Apr 4, 2026",  description: "Hair colour & treatment" },
  { id: "t10", contactName: "George Brennan",    businessName: "Brennan Roofing",     amount: 6_500.00, status: "not_paid",  date: "Apr 3, 2026",  description: "Full roof replacement" },
  { id: "t11", contactName: "Mei-Ling Chen",     businessName: "Chen Acupuncture",    amount: 180.00,  status: "received",   date: "Apr 2, 2026",  description: "Initial assessment" },
  { id: "t12", contactName: "Samuel Okonkwo",    businessName: "Okonkwo Electric",    amount: 950.00,  status: "refunded",   date: "Apr 1, 2026",  description: "Panel upgrade – partial refund" },
];

/* ─── Helpers ─── */
const STATUS_CONFIG: Record<TxStatus, { label: string; className: string }> = {
  received:   { label: "Received",   className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400" },
  requested:  { label: "Requested",  className: "bg-blue-50   text-blue-700   border-blue-200   dark:bg-blue-950/40   dark:text-blue-400" },
  not_paid:   { label: "Not paid",   className: "bg-amber-50  text-amber-700  border-amber-200  dark:bg-amber-950/40  dark:text-amber-400" },
  refunded:   { label: "Refunded",   className: "bg-slate-50  text-slate-600  border-slate-200  dark:bg-slate-800/40  dark:text-slate-400" },
  cancelled:  { label: "Cancelled",  className: "bg-red-50    text-red-600    border-red-200    dark:bg-red-950/40    dark:text-red-400" },
};

function StatusBadge({ status }: { status: TxStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={`text-[length:var(--font-size)] font-medium ${cfg.className}`}>
      {cfg.label}
    </Badge>
  );
}

function fmtAmount(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/* ─── Donut summary ─── */
function PaymentsSummaryCard() {
  const receivedPct = PIE_DATA[0].value;

  return (
    <div className="bg-card border border-border rounded-xl p-5 flex gap-6 items-center">
      {/* Donut */}
      <div className="shrink-0 w-[120px] h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={PIE_DATA}
              cx="50%"
              cy="50%"
              innerRadius={38}
              outerRadius={56}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {PIE_DATA.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <RechartsTooltip
              formatter={(val, name) => [`${val}%`, name]}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--card)",
                color: "var(--foreground)",
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Total + legend */}
      <div className="flex flex-col gap-3 min-w-0">
        <div>
          <p className="text-xs text-muted-foreground">Total requested</p>
          <p className="text-2xl font-semibold text-foreground">
            {fmtAmount(TOTAL_REQUESTED)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {receivedPct}% collected
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          {PIE_DATA.map((d) => (
            <div key={d.name} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: d.color }}
              />
              <span>{d.name}</span>
              <span className="ml-auto font-medium text-foreground">{d.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Metric block ─── */
function MetricBlock({
  label, value, icon: Icon, tooltip,
}: {
  label: string; value: string;
  icon: React.ElementType; tooltip: string | null;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
        {tooltip ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  <Info size={13} strokeWidth={1.6} absoluteStrokeWidth />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[220px] text-xs leading-relaxed">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null}
      </div>
      <div className="flex items-end gap-2">
        <Icon size={18} strokeWidth={1.6} absoluteStrokeWidth className="text-primary mb-0.5 shrink-0" />
        <span className="text-xl font-semibold text-foreground">{value}</span>
      </div>
    </div>
  );
}

/* ─── Transaction actions ─── */
function TxActions({
  tx,
  onAction,
}: {
  tx: Transaction;
  onAction: (type: ModalType, tx: Transaction) => void;
}) {
  const canCancel   = tx.status === "requested" || tx.status === "not_paid";
  const canMarkPaid = tx.status === "not_paid";
  const canRefund   = tx.status === "received";

  return (
    <div className="text-left">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <MoreHorizontal size={15} strokeWidth={1.6} absoluteStrokeWidth />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          className="text-xs cursor-pointer"
          onClick={() => onAction("invoice", tx)}
        >
          <FileText size={13} strokeWidth={1.6} absoluteStrokeWidth className="mr-2" />
          View invoice
        </DropdownMenuItem>
        {canMarkPaid && (
          <DropdownMenuItem
            className="text-xs cursor-pointer"
            onClick={() => onAction("mark_paid", tx)}
          >
            <CheckCircle2 size={13} strokeWidth={1.6} absoluteStrokeWidth className="mr-2" />
            Mark as paid
          </DropdownMenuItem>
        )}
        {canRefund && (
          <DropdownMenuItem
            className="text-xs cursor-pointer"
            onClick={() => onAction("refund", tx)}
          >
            <RotateCcw size={13} strokeWidth={1.6} absoluteStrokeWidth className="mr-2" />
            Issue refund
          </DropdownMenuItem>
        )}
        {canCancel && (
          <DropdownMenuItem
            className="text-xs text-destructive cursor-pointer focus:text-destructive"
            onClick={() => onAction("cancel", tx)}
          >
            <X size={13} strokeWidth={1.6} absoluteStrokeWidth className="mr-2" />
            Cancel request
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
  );
}

/* ─── Confirmation dialogs ─── */
function ActionDialog({
  open,
  type,
  tx,
  onConfirm,
  onClose,
}: {
  open: boolean;
  type: ModalType;
  tx: Transaction | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!tx || !type || type === "invoice") return null;

  const CONFIG = {
    cancel: {
      title: "Cancel payment request?",
      desc: `This will cancel the $${tx.amount.toFixed(2)} request sent to ${tx.contactName}. They will be notified.`,
      cta: "Cancel request",
      variant: "destructive" as const,
    },
    mark_paid: {
      title: "Mark as paid?",
      desc: `Confirm that ${tx.contactName} has paid $${tx.amount.toFixed(2)} outside of Birdeye Payments.`,
      cta: "Mark as paid",
      variant: "default" as const,
    },
    refund: {
      title: `Issue refund of ${fmtAmount(tx.amount)}?`,
      desc: `A full refund will be issued to ${tx.contactName}. This may take 5–10 business days.`,
      cta: "Issue refund",
      variant: "destructive" as const,
    },
  };

  const cfg = CONFIG[type];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">{cfg.title}</DialogTitle>
          <DialogDescription className="text-sm mt-1">{cfg.desc}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-2">
          <Button variant="outline" size="sm" onClick={onClose} className="cursor-pointer">
            Go back
          </Button>
          <Button variant={cfg.variant} size="sm" onClick={onConfirm} className="cursor-pointer">
            {cfg.cta}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Invoice sheet ─── */
function InvoiceSheet({
  open,
  tx,
  onClose,
}: {
  open: boolean;
  tx: Transaction | null;
  onClose: () => void;
}) {
  if (!tx) return null;

  const statusCfg = STATUS_CONFIG[tx.status];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-base">Invoice detail</SheetTitle>
          <SheetDescription className="sr-only">
            Payment invoice for {tx.contactName}
          </SheetDescription>
        </SheetHeader>

        {/* Contact */}
        <div className="flex flex-col gap-1 mb-6">
          <p className="text-sm font-semibold text-foreground">{tx.contactName}</p>
          <p className="text-xs text-muted-foreground">{tx.businessName}</p>
        </div>

        {/* Amount + status */}
        <div className="bg-muted/40 rounded-lg p-4 flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Amount</p>
            <p className="text-2xl font-bold text-foreground">{fmtAmount(tx.amount)}</p>
          </div>
          <Badge variant="outline" className={`text-xs font-medium ${statusCfg.className}`}>
            {statusCfg.label}
          </Badge>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4 text-sm">
          {[
            { label: "Date", value: tx.date },
            { label: "Description", value: tx.description },
            { label: "Transaction ID", value: `TXN-${tx.id.toUpperCase()}` },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className="text-foreground">{value}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-8">
          <Button variant="outline" size="sm" className="cursor-pointer gap-1.5">
            <Download size={13} strokeWidth={1.6} absoluteStrokeWidth />
            Download PDF
          </Button>
          {tx.status === "not_paid" && (
            <Button size="sm" className="cursor-pointer">
              Send reminder
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export type PaymentsViewProps = {
  /** Transaction status scope from shell L2 (`PaymentsL2NavPanel`). */
  statusFilter: PaymentsStatusFilter;
};

const paymentColumnHelper = createColumnHelper<Transaction>();

/* ─── Main view ─── */
export function PaymentsView({ statusFilter }: PaymentsViewProps) {
  const [search, setSearch] = useState("");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  const filtered = TRANSACTIONS.filter((tx) => {
    const matchesSearch =
      tx.contactName.toLowerCase().includes(search.toLowerCase()) ||
      tx.businessName.toLowerCase().includes(search.toLowerCase()) ||
      tx.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || tx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAction = useCallback((type: ModalType, tx: Transaction) => {
    setSelectedTx(tx);
    if (type === "invoice") {
      setInvoiceOpen(true);
    } else {
      setModalType(type);
    }
  }, []);

  const handleConfirm = () => {
    setModalType(null);
    setSelectedTx(null);
  };

  const paymentColumns = useMemo(
    () => [
      paymentColumnHelper.accessor("contactName", {
        id: "contact",
        header: "Contact",
        meta: { settingsLabel: "Contact" },
        size: 220,
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-foreground">{row.original.contactName}</span>
            <span className="text-muted-foreground">{row.original.businessName}</span>
          </div>
        ),
      }),
      paymentColumnHelper.accessor("amount", {
        id: "amount",
        header: "Amount",
        meta: { settingsLabel: "Amount" },
        size: 120,
        enableSorting: true,
        cell: (info) => (
          <span className="block text-left font-medium text-foreground tabular-nums">
            {fmtAmount(info.getValue())}
          </span>
        ),
      }),
      paymentColumnHelper.accessor("status", {
        id: "status",
        header: "Status",
        meta: { settingsLabel: "Status" },
        size: 120,
        enableSorting: true,
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      paymentColumnHelper.accessor("date", {
        id: "date",
        header: "Date",
        meta: { settingsLabel: "Date" },
        size: 130,
        enableSorting: true,
        cell: (info) => (
          <span className="whitespace-nowrap text-muted-foreground">{info.getValue()}</span>
        ),
      }),
      paymentColumnHelper.accessor("description", {
        id: "description",
        header: "Description",
        meta: { settingsLabel: "Description" },
        size: 220,
        enableSorting: true,
        cell: (info) => (
          <span className="max-w-[220px] truncate text-muted-foreground">{info.getValue()}</span>
        ),
      }),
      paymentColumnHelper.display({
        id: "actions",
        header: "",
        meta: { settingsLabel: "Actions" },
        size: 52,
        enableResizing: false,
        enableHiding: false,
        cell: ({ row }) => <TxActions tx={row.original} onAction={handleAction} />,
      }),
    ],
    [handleAction],
  );

  const paymentsEmpty = (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-sm text-muted-foreground">No transactions match your search.</p>
    </div>
  );

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full overflow-hidden">
        {/* ── Header ── */}
        <MainCanvasViewHeader
          title="Payments"
          description="Manage payment requests, track collections, and process refunds."
        />

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col gap-5 min-h-0">

          {/* Summary row */}
          <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr] gap-4 items-stretch">
            <PaymentsSummaryCard />
            {METRIC_BLOCKS.map((m) => (
              <MetricBlock key={m.label} {...m} />
            ))}
          </div>

          {/* Transaction table */}
          <div className="flex flex-col overflow-hidden border-0 bg-background">
            <div className="overflow-x-auto border-b border-border">
              <AppDataTable<Transaction>
                tableId="payments.ledger"
                data={filtered}
                columns={paymentColumns}
                onRowClick={(tx) => {
                  setSelectedTx(tx);
                  setInvoiceOpen(true);
                }}
                getRowId={(row) => row.id}
                emptyState={paymentsEmpty}
                columnSheetTitle="Payment columns"
                className="min-w-0 px-0"
                toolbarLeft={
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
                    <div className="relative max-w-xs flex-1">
                      <Search
                        size={13}
                        strokeWidth={1.6}
                        absoluteStrokeWidth
                        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                      />
                      <Input
                        placeholder="Search transactions…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-8 pl-8 text-xs"
                      />
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
                      </p>
                      <Button variant="outline" size="sm" className="h-8 cursor-pointer gap-1.5 text-xs">
                        <Download size={12} strokeWidth={1.6} absoluteStrokeWidth />
                        Export
                      </Button>
                    </div>
                  </div>
                }
              />
            </div>

            {/* Pagination stub */}
            <div className="px-4 py-3 border-t border-border flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing {filtered.length} of {TRANSACTIONS.length} transactions
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-7 text-xs cursor-pointer" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs cursor-pointer" disabled>
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Modals ── */}
        <ActionDialog
          open={!!modalType && modalType !== "invoice"}
          type={modalType}
          tx={selectedTx}
          onConfirm={handleConfirm}
          onClose={() => { setModalType(null); setSelectedTx(null); }}
        />

        <InvoiceSheet
          open={invoiceOpen}
          tx={selectedTx}
          onClose={() => { setInvoiceOpen(false); setSelectedTx(null); }}
        />
      </div>
    </TooltipProvider>
  );
}
