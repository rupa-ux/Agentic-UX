"use client";

/**
 * Bulk import shell: vertical stepper + pane. Spacing on 8px / 4px dense grid (no gap-3 / px-3 layout).
 * Cancel returns to the More options menu (parent closes bulk + reopens dialog).
 */

import { createColumnHelper } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Info,
  Trash2,
  Upload,
} from "lucide-react";

import { L1_STRIP_ICON_STROKE_PX } from "@/app/components/l1StripIconTokens";
import { MAIN_VIEW_PRIMARY_HEADING_CLASS } from "@/app/components/layout/mainViewTitleClasses";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert.v1";
import { AppDataTable } from "@/app/components/ui/AppDataTable";
import { AppDataTableColumnSettingsTrigger } from "@/app/components/ui/AppDataTableColumnSettingsTrigger";
import { Button, buttonVariants } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/components/ui/collapsible.v1";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { cn } from "@/app/components/ui/utils";
import type {
  BulkImportHistoryRow,
  BulkImportMatchRow,
  ContactsBulkImportStep,
} from "@/app/components/contacts/bulkImportTypes";

const FILE_INPUT_ACCEPT =
  "text/csv,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx,application/vnd.ms-excel,.xls";

function fileIsAllowed(file: File): boolean {
  const n = file.name.toLowerCase();
  return n.endsWith(".csv") || n.endsWith(".xlsx") || n.endsWith(".xls");
}

function hasFileDrag(e: React.DragEvent): boolean {
  return (
    e.dataTransfer.types.includes("Files") ||
    Array.from(e.dataTransfer.items).some((i) => i.kind === "file")
  );
}

const historyHelper = createColumnHelper<BulkImportHistoryRow>();

const MOCK_HISTORY: BulkImportHistoryRow[] = [
  {
    id: "1",
    fileName: "Q1-contacts.csv",
    rowSummary: "248 rows imported",
    uploadedOn: "Apr 18, 2026",
    uploadedBy: "Jamie Chen",
  },
  {
    id: "2",
    fileName: "leads-import.xlsx",
    rowSummary: "12 rows imported",
    uploadedOn: "Apr 02, 2026",
    uploadedBy: "Alex Rivera",
  },
];

const MOCK_MATCH_ROWS: BulkImportMatchRow[] = [
  {
    id: "m1",
    matched: true,
    spreadsheetColumn: "First name",
    sampleData: "Test 1, Test 2",
    contactField: "first_name",
  },
  {
    id: "m2",
    matched: true,
    spreadsheetColumn: "Email",
    sampleData: "a@example.com, b@example.com",
    contactField: "email",
  },
  {
    id: "m3",
    matched: true,
    spreadsheetColumn: "Mobile phone",
    sampleData: "—",
    contactField: "mobile",
  },
  {
    id: "m4",
    matched: true,
    spreadsheetColumn: "Country",
    sampleData: "US, CA",
    contactField: "country",
  },
];

const CONTACT_FIELD_OPTIONS: { value: string; label: string }[] = [
  { value: "first_name", label: "First name" },
  { value: "last_name", label: "Last name" },
  { value: "email", label: "Email" },
  { value: "mobile", label: "Mobile phone" },
  { value: "country", label: "Country" },
  { value: "tags", label: "Tags" },
];

const cellBase = "py-2 text-left text-[13px] font-normal text-foreground";
const cellMuted = "py-2 text-left text-[13px] font-normal text-muted-foreground";

export type ContactsBulkImportWorkspaceProps = {
  step: ContactsBulkImportStep;
  onStepChange: (step: ContactsBulkImportStep) => void;
  onCancel: () => void;
  onFinish: () => void;
  /** Storybook/tests: seed import history (default: mock rows). */
  importHistoryInitialRows?: BulkImportHistoryRow[];
};

export function ContactsBulkImportWorkspace({
  step,
  onStepChange,
  onCancel,
  onFinish,
  importHistoryInitialRows,
}: ContactsBulkImportWorkspaceProps) {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [historyRows, setHistoryRows] = useState<BulkImportHistoryRow[]>(
    () => importHistoryInitialRows ?? MOCK_HISTORY,
  );
  const [importHistoryOpen, setImportHistoryOpen] = useState(true);
  const [historyColumnSheetOpen, setHistoryColumnSheetOpen] = useState(false);
  const [importHistoryPendingDeleteId, setImportHistoryPendingDeleteId] = useState<string | null>(
    null,
  );
  const [matchRows, setMatchRows] = useState<BulkImportMatchRow[]>(MOCK_MATCH_ROWS);
  const [createList, setCreateList] = useState(false);
  const [addToExisting, setAddToExisting] = useState(false);
  const [listOptionsOpen, setListOptionsOpen] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const dragDepth = useRef(0);
  const [dropActive, setDropActive] = useState(false);

  const applyFile = useCallback((file: File | undefined | null) => {
    if (!file) return;
    if (!fileIsAllowed(file)) {
      toast.message("Use .csv, .xlsx, or .xls for this import.");
      return;
    }
    setUploadFile(file);
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    applyFile(f);
    e.target.value = "";
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hasFileDrag(e)) return;
    dragDepth.current += 1;
    setDropActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDropActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasFileDrag(e)) {
      e.dataTransfer.dropEffect = "copy";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current = 0;
    setDropActive(false);
    const files = e.dataTransfer.files;
    if (!files?.length) return;
    const allowed = Array.from(files).filter(fileIsAllowed);
    if (!allowed.length) {
      toast.message("Use .csv, .xlsx, or .xls for this import.");
      return;
    }
    applyFile(allowed[0]);
  };

  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    const onPaste = (ev: ClipboardEvent) => {
      const items = ev.clipboardData?.files;
      if (!items?.length) return;
      const f = Array.from(items).find(fileIsAllowed);
      if (f) {
        ev.preventDefault();
        applyFile(f);
      }
    };
    el.addEventListener("paste", onPaste);
    return () => el.removeEventListener("paste", onPaste);
  }, [applyFile]);

  const pendingImportHistoryRow = useMemo(
    () => historyRows.find((r) => r.id === importHistoryPendingDeleteId) ?? null,
    [historyRows, importHistoryPendingDeleteId],
  );

  const historyColumns = useMemo(
    () => [
      historyHelper.accessor("fileName", {
        id: "fileName",
        header: "File",
        meta: { settingsLabel: "File" },
        size: 220,
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex flex-col gap-1">
              <span className="font-medium text-foreground">{row.fileName}</span>
              <span className="text-muted-foreground">{row.rowSummary}</span>
            </div>
          );
        },
      }),
      historyHelper.accessor("uploadedOn", {
        id: "uploadedOn",
        header: "Uploaded on",
        meta: { settingsLabel: "Uploaded on" },
        size: 140,
        cell: (info) => (
          <span className="text-muted-foreground">{info.getValue()}</span>
        ),
      }),
      historyHelper.accessor("uploadedBy", {
        id: "uploadedBy",
        header: "Uploaded by",
        meta: { settingsLabel: "Uploaded by" },
        size: 140,
        cell: (info) => (
          <span className="text-muted-foreground">{info.getValue()}</span>
        ),
      }),
      historyHelper.display({
        id: "actions",
        header: "",
        meta: { settingsLabel: "Actions" },
        size: 56,
        enableSorting: false,
        enableResizing: false,
        enableHiding: false,
        cell: (info) => (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-destructive"
            aria-label={`Delete import ${info.row.original.fileName}`}
            onClick={(ev) => {
              ev.stopPropagation();
              setImportHistoryPendingDeleteId(info.row.original.id);
            }}
          >
            <Trash2
              className="size-4"
              strokeWidth={L1_STRIP_ICON_STROKE_PX}
              absoluteStrokeWidth
            />
          </Button>
        ),
      }),
    ],
    [],
  );

  const historyEmptyState = (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Upload
        className="mb-2 size-8 text-muted-foreground"
        strokeWidth={L1_STRIP_ICON_STROKE_PX}
        absoluteStrokeWidth
        aria-hidden
      />
      <p className="text-sm font-medium text-foreground">No import history yet</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Completed imports will appear here.
      </p>
    </div>
  );

  const nextDisabled =
    step === "upload" ? uploadFile === null : false;

  const primaryLabel =
    step === "import" ? "Finish import" : "Next";

  const handlePrimary = () => {
    if (step === "upload") onStepChange("match");
    else if (step === "match") onStepChange("import");
    else {
      toast.success("Import queued (prototype).");
      onFinish();
    }
  };

  const stepTitle =
    step === "upload"
      ? "Upload"
      : step === "match"
        ? "Match spreadsheet columns to contact fields"
        : "Import";

  const steps: { id: ContactsBulkImportStep; label: string; n: number }[] = [
    { id: "upload", label: "Upload", n: 1 },
    { id: "match", label: "Match", n: 2 },
    { id: "import", label: "Import", n: 3 },
  ];

  const stepOrder = steps.map((x) => x.id);
  const currentStepIndex = stepOrder.indexOf(step);

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-app-shell-main transition-opacity duration-200 motion-reduce:transition-none">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 px-6 py-4">
        <h1 className={MAIN_VIEW_PRIMARY_HEADING_CLASS}>Bulk import</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={nextDisabled}
            onClick={handlePrimary}
          >
            {primaryLabel}
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 min-w-0 flex-1 flex-row border-t border-border">
        <nav
          aria-label="Import steps"
          className="flex w-[220px] shrink-0 flex-col border-r border-app-shell-border bg-app-shell-l2-surface py-4"
        >
          {steps.map((s) => {
            const active = step === s.id;
            const stepIndex = stepOrder.indexOf(s.id);
            const completed = stepIndex < currentStepIndex;
            return (
              <div
                key={s.id}
                className={cn(
                  "mx-2 mb-1 flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] transition-colors duration-200 motion-reduce:transition-none",
                  active
                    ? "bg-muted text-foreground font-medium"
                    : "text-muted-foreground font-normal",
                )}
                aria-current={active ? "step" : undefined}
              >
                <span
                  className="flex size-4 shrink-0 items-center justify-center"
                  aria-hidden
                >
                  {completed ? (
                    <Check
                      className="size-4 text-primary"
                      strokeWidth={L1_STRIP_ICON_STROKE_PX}
                      absoluteStrokeWidth
                    />
                  ) : (
                    <span className="tabular-nums text-muted-foreground">{s.n}</span>
                  )}
                </span>
                <span className={cn(active && "text-foreground")}>{s.label}</span>
              </div>
            );
          })}
        </nav>

        <div
          key={step}
          className="min-h-0 min-w-0 flex-1 overflow-auto px-6 py-6 animate-in fade-in-0 duration-200 motion-reduce:animate-none"
        >
          {step === "upload" ? (
            <div className="flex max-w-3xl flex-col gap-6">
              <h2 className={MAIN_VIEW_PRIMARY_HEADING_CLASS}>{stepTitle}</h2>

              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept={FILE_INPUT_ACCEPT}
                aria-hidden
                onChange={onInputChange}
              />

              <div
                ref={dropRef}
                role="region"
                aria-label="Drop spreadsheet file"
                tabIndex={-1}
                className={cn(
                  "flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-muted/40 px-6 py-12 text-center transition-colors duration-200 motion-reduce:transition-none",
                  dropActive && "border-primary/40 bg-muted ring-2 ring-ring ring-offset-2 ring-offset-background",
                )}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <Upload
                  className="size-10 text-muted-foreground"
                  strokeWidth={L1_STRIP_ICON_STROKE_PX}
                  absoluteStrokeWidth
                  aria-hidden
                />
                <div className="flex max-w-md flex-col gap-2 text-[13px]">
                  <p className="text-foreground">
                    Drag and drop a file to upload, or use the button below.
                  </p>
                  <p className="text-muted-foreground">
                    Supported: .csv, .xlsx, .xls
                  </p>
                  {uploadFile ? (
                    <p className="font-medium text-foreground">{uploadFile.name}</p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                >
                  Upload spreadsheet
                </Button>

                <div className="w-full max-w-md rounded-lg bg-muted/60 px-4 py-4 text-left text-[13px] text-foreground">
                  <span className="text-muted-foreground">Download a </span>
                  <a
                    href="/contacts-import-sample.csv"
                    download="contacts-import-sample.csv"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    sample spreadsheet
                  </a>
                  <span className="text-muted-foreground">
                    {" "}
                    to quickly start your import
                  </span>
                </div>
              </div>

              <Collapsible open={importHistoryOpen} onOpenChange={setImportHistoryOpen}>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CollapsibleTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-auto gap-2 px-0 py-1 text-[13px] font-medium text-foreground hover:bg-transparent"
                      >
                        Import history
                        <ChevronDown
                          className={cn(
                            "size-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none",
                            importHistoryOpen && "rotate-180",
                          )}
                          strokeWidth={L1_STRIP_ICON_STROKE_PX}
                          absoluteStrokeWidth
                        />
                      </Button>
                    </CollapsibleTrigger>
                    <AppDataTableColumnSettingsTrigger
                      sheetTitle="Import history columns"
                      onClick={() => setHistoryColumnSheetOpen(true)}
                    />
                  </div>
                  <CollapsibleContent>
                    <div className="flex max-h-[min(360px,40vh)] min-h-0 flex-col gap-2">
                      {historyRows.length > 0 ? (
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-[13px] text-muted-foreground"
                            onClick={() => setHistoryRows([])}
                          >
                            Clear all
                          </Button>
                        </div>
                      ) : null}
                      <AppDataTable<BulkImportHistoryRow>
                        tableId="contacts.bulkImport.importHistory"
                        persist={false}
                        data={historyRows}
                        columns={historyColumns}
                        getRowId={(r) => r.id}
                        emptyState={historyEmptyState}
                        columnSheetTitle="Import history columns"
                        className="min-h-0 min-w-0 flex-1"
                        rowDensity="default"
                        hideColumnsButton
                        columnSheetOpen={historyColumnSheetOpen}
                        onColumnSheetOpenChange={setHistoryColumnSheetOpen}
                      />
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            </div>
          ) : null}

          {step === "match" ? (
            <div className="flex max-w-4xl flex-col gap-4">
              <h2 className={MAIN_VIEW_PRIMARY_HEADING_CLASS}>{stepTitle}</h2>
              <Alert>
                <Info
                  className="size-4"
                  strokeWidth={L1_STRIP_ICON_STROKE_PX}
                  absoluteStrokeWidth
                />
                <AlertTitle>Column mapping</AlertTitle>
                <AlertDescription className="flex flex-wrap items-center gap-2">
                  <span>
                    Some columns map automatically; others you set manually. Unmapped fields can be saved
                    as tags.
                  </span>
                  <Button type="button" variant="link" className="h-auto p-0 text-[13px]">
                    Learn more
                  </Button>
                </AlertDescription>
              </Alert>

              <div className="w-full overflow-x-auto">
                <Table withScrollContainer={false}>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className={cn(cellBase, "w-24")}>Matched</TableHead>
                      <TableHead className={cellBase}>Spreadsheet column</TableHead>
                      <TableHead className={cellBase}>Sample data</TableHead>
                      <TableHead className={cellBase}>Contact field</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matchRows.map((row) => (
                      <TableRow key={row.id} className="hover:bg-transparent">
                        <TableCell className={cellMuted}>
                          {row.matched ? (
                            <CheckCircle2
                              className="size-4 text-emerald-600 dark:text-emerald-500"
                              strokeWidth={L1_STRIP_ICON_STROKE_PX}
                              absoluteStrokeWidth
                              aria-label="Matched"
                            />
                          ) : (
                            <span aria-hidden>—</span>
                          )}
                        </TableCell>
                        <TableCell className={cellBase}>{row.spreadsheetColumn}</TableCell>
                        <TableCell className={cellMuted}>{row.sampleData}</TableCell>
                        <TableCell className={cellBase}>
                          <Select
                            value={row.contactField}
                            onValueChange={(v) =>
                              setMatchRows((rows) =>
                                rows.map((r) => (r.id === row.id ? { ...r, contactField: v } : r)),
                              )
                            }
                          >
                            <SelectTrigger className="h-8 w-[min(100%,200px)] text-[13px] font-normal">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CONTACT_FIELD_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value} className="text-[13px]">
                                  {o.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : null}

          {step === "import" ? (
            <div className="flex max-w-2xl flex-col gap-6">
              <h2 className={MAIN_VIEW_PRIMARY_HEADING_CLASS}>{stepTitle}</h2>

              <Collapsible open={listOptionsOpen} onOpenChange={setListOptionsOpen}>
                <div className="rounded-lg bg-card px-4 py-2 shadow-sm">
                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex h-auto w-full items-center justify-between gap-2 px-0 py-2 text-left text-[13px] font-medium text-foreground hover:bg-transparent"
                    >
                      Contact list options
                      <ChevronDown
                        className={cn(
                          "size-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none",
                          listOptionsOpen && "rotate-180",
                        )}
                        strokeWidth={L1_STRIP_ICON_STROKE_PX}
                        absoluteStrokeWidth
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="flex flex-col gap-4 pb-4 pt-2">
                      <label className="flex cursor-pointer items-start gap-2 text-[13px]">
                        <Checkbox
                          checked={createList}
                          onCheckedChange={(v) => setCreateList(v === true)}
                          className="mt-0.5"
                        />
                        <span>Create a contact list from this import</span>
                      </label>
                      <label className="flex cursor-pointer items-start gap-2 text-[13px]">
                        <Checkbox
                          checked={addToExisting}
                          onCheckedChange={(v) => setAddToExisting(v === true)}
                          className="mt-0.5"
                        />
                        <span>Add contacts to an existing list</span>
                      </label>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            </div>
          ) : null}
        </div>
      </div>

      <AlertDialog
        open={importHistoryPendingDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setImportHistoryPendingDeleteId(null);
        }}
      >
        <AlertDialogContent className="gap-4 border-0 shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this import from history?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingImportHistoryRow
                ? `"${pendingImportHistoryRow.fileName}" will be removed from import history. You can upload again anytime.`
                : "This import will be removed from history."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              className={buttonVariants({ variant: "destructive" })}
              onClick={() => {
                const id = importHistoryPendingDeleteId;
                if (id) setHistoryRows((rows) => rows.filter((r) => r.id !== id));
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
