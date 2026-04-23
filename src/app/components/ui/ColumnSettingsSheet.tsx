"use client";

import { ArrowDown, ArrowUp, GripVertical, RotateCcw } from "lucide-react";
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
  /** Move column one step in list order (visual order matches table columnOrder). */
  onMove: (columnId: string, direction: -1 | 1) => void;
  onToggleVisibility: (columnId: string, visible: boolean) => void;
  onReset: () => void;
}

export function ColumnSettingsSheet({
  open,
  onOpenChange,
  title = "Columns",
  columns,
  onMove,
  onToggleVisibility,
  onReset,
}: ColumnSettingsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" inset="floating" floatingSize="md" className="flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 py-4 text-left">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            Show or hide columns. Use the grip and arrows to change column order; widths are set from the table
            header.
          </SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-6 py-4">
          {columns.map((col, index) => (
            <div
              key={col.id}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-2"
            >
              <div className="flex shrink-0 items-center gap-2" role="group" aria-label={`Reorder ${col.label}`}>
                <GripVertical className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <div className="flex flex-col gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    disabled={index === 0}
                    aria-label={`Move ${col.label} up in the list`}
                    onClick={() => onMove(col.id, -1)}
                  >
                    <ArrowUp className="size-4" strokeWidth={2} aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    disabled={index === columns.length - 1}
                    aria-label={`Move ${col.label} down in the list`}
                    onClick={() => onMove(col.id, 1)}
                  >
                    <ArrowDown className="size-4" strokeWidth={2} aria-hidden />
                  </Button>
                </div>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Label htmlFor={`col-vis-${col.id}`} className="truncate text-sm font-medium text-foreground">
                  {col.label}
                </Label>
                <span className="text-xs text-muted-foreground">Column id: {col.id}</span>
              </div>
              <Switch
                id={`col-vis-${col.id}`}
                checked={col.visible}
                disabled={!col.canHide && col.visible}
                onCheckedChange={(v) => onToggleVisibility(col.id, v)}
                className={cn(!col.canHide && col.visible && "opacity-60")}
              />
            </div>
          ))}
        </div>
        <div className="border-t border-border px-6 py-4">
          <Button type="button" variant="outline" className="w-full gap-2" onClick={onReset}>
            <RotateCcw className="size-4" aria-hidden />
            Reset columns
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
