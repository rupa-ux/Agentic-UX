"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, RotateCcw } from "lucide-react";
import { L1_STRIP_ICON_STROKE_PX } from "@/app/components/l1StripIconTokens";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { Switch } from "@/app/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/app/components/ui/sheet";
import { cn } from "@/app/components/ui/utils";

export { reorderColumnIds } from "./columnSettingsReorder";

export interface ColumnSettingsSheetColumn {
  id: string;
  label: string;
  visible: boolean;
  /** When false, row still shows but switch is disabled (e.g. required column). */
  canHide: boolean;
}

interface ColumnSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  columns: ColumnSettingsSheetColumn[];
  /** Full column id list after drag-reorder (order matches table columnOrder). */
  onReorder: (orderedColumnIds: string[]) => void;
  onToggleVisibility: (columnId: string, visible: boolean) => void;
  onReset: () => void;
}

type SortableColumnRowProps = {
  col: ColumnSettingsSheetColumn;
  onToggleVisibility: (columnId: string, visible: boolean) => void;
};

function SortableColumnRow({ col, onToggleVisibility }: SortableColumnRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: col.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? { zIndex: 1 } : {}),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-column-row
      role="listitem"
      className={cn(
        "flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-2 transition-[opacity,box-shadow] duration-150",
        isDragging && "border-primary/30 bg-muted/20 ring-1 ring-primary/20",
        isDragging && "opacity-95",
      )}
    >
      <div
        ref={setActivatorNodeRef}
        className={cn(
          "flex size-9 shrink-0 cursor-grab touch-none items-center justify-center rounded-md border border-transparent",
          "text-muted-foreground hover:border-border hover:bg-muted/60 active:cursor-grabbing",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        )}
        title="Drag to reorder"
        {...listeners}
        {...attributes}
        aria-label={`Drag to reorder ${col.label}`}
      >
        <GripVertical
          className="size-4 shrink-0"
          aria-hidden
          strokeWidth={L1_STRIP_ICON_STROKE_PX}
          absoluteStrokeWidth
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <Label htmlFor={`col-vis-${col.id}`} className="truncate text-sm font-medium text-foreground">
          {col.label}
        </Label>
      </div>
      <div className="shrink-0">
        <Switch
          id={`col-vis-${col.id}`}
          checked={col.visible}
          disabled={!col.canHide && col.visible}
          onCheckedChange={(v) => onToggleVisibility(col.id, v)}
          className={cn(!col.canHide && col.visible && "opacity-60")}
        />
      </div>
    </div>
  );
}

export function ColumnSettingsSheet({
  open,
  onOpenChange,
  title = "Columns",
  columns,
  onReorder,
  onToggleVisibility,
  onReset,
}: ColumnSettingsSheetProps) {
  const [a11yMsg, setA11yMsg] = useState("");

  const ids = useMemo(() => columns.map((c) => c.id), [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (!open) setA11yMsg("");
  }, [open]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const id = String(event.active.id);
      const col = columns.find((c) => c.id === id);
      setA11yMsg(col ? `Picked up ${col.label}. Use arrow keys to move, then drop.` : "");
    },
    [columns],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over == null || active.id === over.id) {
        setA11yMsg("Reorder cancelled.");
        return;
      }
      const oldIndex = ids.indexOf(String(active.id));
      const newIndex = ids.indexOf(String(over.id));
      if (oldIndex < 0 || newIndex < 0) {
        setA11yMsg("Reorder cancelled.");
        return;
      }
      const next = arrayMove(ids, oldIndex, newIndex);
      onReorder(next);
      const col = columns.find((c) => c.id === String(active.id));
      setA11yMsg(
        col ? `${col.label} moved to position ${newIndex + 1} of ${ids.length}.` : "Column order updated.",
      );
    },
    [columns, ids, onReorder],
  );

  const handleDragCancel = useCallback(() => {
    setA11yMsg("Reorder cancelled.");
  }, []);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" inset="floating" floatingSize="md" className="flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 py-4 text-left">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            Show or hide columns. Drag the grip handle to reorder (pointer or touch); widths follow the table
            header. Focus a grip and use Space plus arrow keys to reorder with the keyboard.
          </SheetDescription>
        </SheetHeader>
        <span className="sr-only" aria-live="polite" aria-atomic="true">
          {a11yMsg}
        </span>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <div
              role="list"
              aria-label="Column order and visibility"
              className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-6 py-4"
            >
              {columns.map((col) => (
                <SortableColumnRow key={col.id} col={col} onToggleVisibility={onToggleVisibility} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <div className="border-t border-border px-6 py-4">
          <Button type="button" variant="outline" className="w-full gap-2" onClick={onReset}>
            <RotateCcw className="size-4" aria-hidden strokeWidth={L1_STRIP_ICON_STROKE_PX} absoluteStrokeWidth />
            Reset columns
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
