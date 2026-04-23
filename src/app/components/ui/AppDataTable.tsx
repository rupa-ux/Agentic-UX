"use client";

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AppDataTableColumnSettingsTrigger } from "@/app/components/ui/AppDataTableColumnSettingsTrigger";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type ColumnOrderState,
  type ColumnSizingState,
  type SortingState,
  type VisibilityState,
  type OnChangeFn,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp, Columns3 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { cn } from "@/app/components/ui/utils";
import { usePersistedState } from "@/app/hooks/usePersistedState";
import {
  type AppDataTablePersistedSlice,
  buildAppDataTableStorageKey,
} from "@/app/components/ui/appDataTableTypes";
import {
  buildLayoutInputsFromColumnDefs,
  buildSizeWeightsFromColumnDefs,
  distributeWidths,
  resolveWeights,
} from "@/app/components/ui/appDataTableColumnSizing";
import { ColumnSettingsSheet, type ColumnSettingsSheetColumn } from "@/app/components/ui/ColumnSettingsSheet";

function applyTableUpdater<T>(updater: T | ((old: T) => T), old: T): T {
  return typeof updater === "function" ? (updater as (o: T) => T)(old) : updater;
}

/** Avoid persisting when TanStack passes a no-op updater — prevents render loops in layout effects. */
function isSameColumnSizing(next: ColumnSizingState, prev: ColumnSizingState): boolean {
  if (next === prev) return true;
  const pk = Object.keys(prev);
  const nk = Object.keys(next);
  if (pk.length !== nk.length) return false;
  for (const k of pk) {
    if (prev[k] !== next[k]) return false;
  }
  return true;
}

function mergeColumnOrder(saved: string[], defaults: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of saved) {
    if (defaults.includes(id) && !seen.has(id)) {
      out.push(id);
      seen.add(id);
    }
  }
  for (const id of defaults) {
    if (!seen.has(id)) out.push(id);
  }
  return out;
}

function buildDefaultSlice(columnIds: string[]): AppDataTablePersistedSlice {
  return {
    columnOrder: [...columnIds],
    columnVisibility: Object.fromEntries(columnIds.map((id) => [id, true])),
    columnSizing: {},
  };
}

export interface AppDataTableProps<TData> {
  /** Stable id for session persistence (e.g. `campaigns.list`). */
  tableId: string;
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  /** When false, skip sessionStorage (Storybook / tests). Default true. */
  persist?: boolean;
  onRowClick?: (row: TData) => void;
  getRowId?: (originalRow: TData, index: number) => string;
  emptyState?: ReactNode;
  /** Extra toolbar controls to the left of the Columns button. */
  toolbarLeft?: ReactNode;
  /** Optional title row: title left, Columns (label) right; `toolbarLeft` on the row below. */
  toolbarTitle?: ReactNode;
  /** Sheet title override. */
  columnSheetTitle?: string;
  /** Initial sort (e.g. Storybook). */
  initialSorting?: SortingState;
  /** Root wrapper classes (e.g. remove horizontal padding when nested in a card). */
  className?: string;
  /** Marks row as selected (e.g. `data-state="selected"` for directory tables). */
  isRowSelected?: (row: TData) => boolean;
  /** When true, omit the built-in Columns control; use with `columnSheetOpen` + `onColumnSheetOpenChange` and {@link AppDataTableColumnSettingsTrigger} in the page header. */
  hideColumnsButton?: boolean;
  /** Controlled column sheet open state (pair with `onColumnSheetOpenChange`). */
  columnSheetOpen?: boolean;
  onColumnSheetOpenChange?: (open: boolean) => void;
}

export function AppDataTable<TData>({
  tableId,
  data,
  columns,
  persist = true,
  onRowClick,
  getRowId,
  emptyState,
  toolbarLeft,
  toolbarTitle,
  columnSheetTitle,
  initialSorting,
  className,
  isRowSelected,
  hideColumnsButton = false,
  columnSheetOpen: columnSheetOpenProp,
  onColumnSheetOpenChange,
}: AppDataTableProps<TData>) {
  if (
    process.env.NODE_ENV !== "production" &&
    hideColumnsButton &&
    (columnSheetOpenProp === undefined || onColumnSheetOpenChange === undefined)
  ) {
    throw new Error(
      "AppDataTable: hideColumnsButton requires columnSheetOpen and onColumnSheetOpenChange so the header trigger can control the sheet.",
    );
  }

  const columnSheetControlled =
    columnSheetOpenProp !== undefined && onColumnSheetOpenChange !== undefined;
  const [columnSheetOpenInternal, setColumnSheetOpenInternal] = useState(false);
  const columnSheetOpen = columnSheetControlled ? columnSheetOpenProp : columnSheetOpenInternal;
  const setColumnSheetOpen = useCallback(
    (open: boolean) => {
      if (columnSheetControlled) onColumnSheetOpenChange(open);
      else setColumnSheetOpenInternal(open);
    },
    [columnSheetControlled, onColumnSheetOpenChange],
  );
  const columnIds = useMemo(
    () => columns.map((c) => String(c.id ?? "")).filter(Boolean),
    [columns],
  );

  const defaultSlice = useMemo(() => buildDefaultSlice(columnIds), [columnIds]);

  const storageKey = persist && tableId ? buildAppDataTableStorageKey(tableId) : undefined;
  const [persisted, setPersisted] = usePersistedState<AppDataTablePersistedSlice>(
    storageKey,
    defaultSlice,
  );

  const merged = useMemo((): AppDataTablePersistedSlice => {
    return {
      columnOrder: mergeColumnOrder(persisted.columnOrder, columnIds),
      columnVisibility: { ...defaultSlice.columnVisibility, ...persisted.columnVisibility },
      columnSizing: persisted.columnSizing ?? {},
    };
  }, [persisted, columnIds, defaultSlice.columnVisibility]);

  const [sorting, setSorting] = useState<SortingState>(() => initialSorting ?? []);
  const layoutRef = useRef<HTMLDivElement>(null);
  const [layoutW, setLayoutW] = useState(0);

  const setColumnOrder: OnChangeFn<ColumnOrderState> = useCallback(
    (updater) => {
      setPersisted((prev) => {
        const current = mergeColumnOrder(prev.columnOrder, columnIds);
        const next = applyTableUpdater(updater, current);
        return { ...prev, columnOrder: mergeColumnOrder(next, columnIds) };
      });
    },
    [columnIds, setPersisted],
  );

  const setColumnVisibility: OnChangeFn<VisibilityState> = useCallback(
    (updater) => {
      setPersisted((prev) => ({
        ...prev,
        columnVisibility: applyTableUpdater(updater, prev.columnVisibility),
      }));
    },
    [setPersisted],
  );

  const setColumnSizing: OnChangeFn<ColumnSizingState> = useCallback(
    (updater) => {
      setPersisted((prev) => {
        const nextSizing = applyTableUpdater(updater, prev.columnSizing);
        if (isSameColumnSizing(nextSizing, prev.columnSizing)) return prev;
        return { ...prev, columnSizing: nextSizing };
      });
    },
    [setPersisted],
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnOrder: merged.columnOrder,
      columnVisibility: merged.columnVisibility,
      columnSizing: merged.columnSizing,
    },
    onSortingChange: setSorting,
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: "onChange",
    enableColumnResizing: true,
    getRowId,
    defaultColumn: {
      enableSorting: false,
      minSize: 72,
      maxSize: 640,
      size: 160,
    },
  });

  const visibleOrderedIds = useMemo(() => {
    return merged.columnOrder.filter((id) => {
      if (!columnIds.includes(id)) return false;
      return merged.columnVisibility[id] !== false;
    });
  }, [merged.columnOrder, merged.columnVisibility, columnIds]);

  const sizingEmpty = Object.keys(merged.columnSizing).length === 0;

  useLayoutEffect(() => {
    const el = layoutRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w != null) setLayoutW(Math.floor(w));
    });
    ro.observe(el);
    setLayoutW(Math.floor(el.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (!sizingEmpty || layoutW < 1 || visibleOrderedIds.length === 0) return;
    const inputs = buildLayoutInputsFromColumnDefs(columns, visibleOrderedIds);
    const weights = resolveWeights(
      visibleOrderedIds.length,
      buildSizeWeightsFromColumnDefs(columns, visibleOrderedIds),
    );
    const sizes = distributeWidths(layoutW, inputs, weights);
    if (Object.keys(sizes).length > 0) {
      setColumnSizing(() => sizes);
    }
  }, [layoutW, sizingEmpty, visibleOrderedIds, columns, setColumnSizing]);

  const sheetColumns: ColumnSettingsSheetColumn[] = table.getAllLeafColumns().map((col) => ({
    id: col.id,
    label: (col.columnDef.meta as { settingsLabel?: string } | undefined)?.settingsLabel ?? col.id,
    visible: col.getIsVisible(),
    canHide: col.getCanHide(),
  }));

  const handleMove = useCallback(
    (columnId: string, direction: -1 | 1) => {
      const order = [...merged.columnOrder];
      const i = order.indexOf(columnId);
      if (i < 0) return;
      const j = i + direction;
      if (j < 0 || j >= order.length) return;
      [order[i], order[j]] = [order[j], order[i]];
      setColumnOrder(order);
    },
    [merged.columnOrder, setColumnOrder],
  );

  const handleReset = useCallback(() => {
    setPersisted(defaultSlice);
    setSorting(initialSorting ?? []);
  }, [defaultSlice, setPersisted, initialSorting]);

  const columnsLabel = columnSheetTitle ?? "Columns";

  const columnTotalPx = Math.max(1, table.getTotalSize());
  /** Sum of column widths — floor for `minWidth` and horizontal scroll when wider than the scrollport. */
  const tableMinWidthPx = columnTotalPx;
  /**
   * At least `tableMinWidthPx`; when the table is narrower than the scrollport, grow to `layoutW` so
   * row borders span the container edge-to-edge (display only — does not change persisted column sizes).
   */
  const tableWidthPx = layoutW > 0 ? Math.max(layoutW, tableMinWidthPx) : tableMinWidthPx;

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  const showToolbar =
    Boolean(toolbarTitle) || Boolean(toolbarLeft) || !hideColumnsButton;

  return (
    <div className={cn("flex min-w-0 flex-col gap-2 px-6", className)}>
      {showToolbar ? (
        <div className="flex flex-col gap-2">
          {toolbarTitle ? (
            <>
              <div className="flex min-h-0 items-center justify-between gap-2">
                <div className="min-w-0 flex-1 text-sm font-medium text-foreground">{toolbarTitle}</div>
                {!hideColumnsButton ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 gap-2"
                    onClick={() => setColumnSheetOpen(true)}
                  >
                    <Columns3 className="size-4 shrink-0" aria-hidden />
                    Columns
                  </Button>
                ) : null}
              </div>
              {toolbarLeft ? (
                <div className="flex min-w-0 flex-wrap items-center gap-2">{toolbarLeft}</div>
              ) : null}
            </>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{toolbarLeft}</div>
              {!hideColumnsButton ? (
                <AppDataTableColumnSettingsTrigger
                  sheetTitle={columnsLabel}
                  onClick={() => setColumnSheetOpen(true)}
                />
              ) : null}
            </div>
          )}
        </div>
      ) : null}

      <ColumnSettingsSheet
        open={columnSheetOpen}
        onOpenChange={setColumnSheetOpen}
        title={columnsLabel}
        columns={sheetColumns}
        onMove={handleMove}
        onToggleVisibility={(id, visible) => {
          table.getColumn(id)?.toggleVisibility(visible);
        }}
        onReset={handleReset}
      />

      <div ref={layoutRef} className="relative min-w-0 w-full overflow-x-auto">
        <Table
          className="table-fixed w-full text-[length:var(--font-size)] leading-normal"
          style={{ width: tableWidthPx, minWidth: tableMinWidthPx }}
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-border hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  const sortedActive = sorted === "asc" || sorted === "desc";
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "relative h-auto min-h-[52px] overflow-hidden px-4 py-4 text-left align-middle text-[length:var(--font-size)] font-medium leading-normal text-muted-foreground",
                        header.column.getIsResizing() && "select-none",
                      )}
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex min-w-0 items-center gap-1 pr-2">
                          {canSort ? (
                            <button
                              type="button"
                              className="flex min-w-0 items-center gap-1 rounded-md p-1 text-left text-[length:var(--font-size)] leading-normal font-medium text-muted-foreground hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              <span
                                className={cn(
                                  "min-w-0 truncate",
                                  sortedActive && "font-semibold text-foreground",
                                )}
                              >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                              </span>
                              {sorted === "asc" ? (
                                <ChevronUp
                                  className="size-3 shrink-0 text-foreground/80"
                                  strokeWidth={2}
                                  aria-hidden
                                />
                              ) : (
                                <ChevronDown
                                  className={cn(
                                    "size-3 shrink-0 transition-colors",
                                    sorted === "desc"
                                      ? "text-foreground/80"
                                      : "text-muted-foreground opacity-50",
                                  )}
                                  strokeWidth={2}
                                  aria-hidden
                                />
                              )}
                            </button>
                          ) : (
                            <span className="min-w-0 truncate pl-1 font-medium">
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </span>
                          )}
                        </div>
                      )}
                      {header.column.getCanResize() ? (
                        <div
                          role="separator"
                          aria-orientation="vertical"
                          aria-label={`Resize ${header.column.id}`}
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className="absolute top-1/2 right-0 z-10 flex h-10 w-3 -translate-y-1/2 cursor-col-resize touch-none items-center justify-center hover:[&>span]:bg-primary"
                          data-active={header.column.getIsResizing()}
                        >
                          <span
                            className={cn(
                              "pointer-events-none block h-[13px] w-px shrink-0 rounded-full bg-border transition-colors",
                              header.column.getIsResizing() && "bg-primary",
                            )}
                            aria-hidden
                          />
                        </div>
                      ) : null}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={isRowSelected?.(row.original) ? "selected" : undefined}
                className={cn(
                  "border-b border-border hover:bg-muted/30 data-[state=selected]:bg-muted",
                  onRowClick && "cursor-pointer",
                )}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="min-w-0 overflow-hidden whitespace-normal px-4 py-4 align-middle text-[length:var(--font-size)] leading-normal text-foreground"
                    style={{ width: cell.column.getSize() }}
                    onClick={
                      cell.column.id === "actions" ||
                      (cell.column.columnDef.meta as { stopRowClick?: boolean } | undefined)?.stopRowClick
                        ? (e) => e.stopPropagation()
                        : undefined
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
