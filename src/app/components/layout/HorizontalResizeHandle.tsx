"use client";

import type { PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent } from "react";

export type HorizontalResizeHandleProps = {
  onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onDoubleClick?: (e: ReactMouseEvent<HTMLDivElement>) => void;
  "aria-label": string;
  "aria-valuenow"?: number;
  "aria-valuemin"?: number;
  "aria-valuemax"?: number;
};

/**
 * Invisible edge strip (6px hit area) positioned at the left border of an adjacent panel.
 * Shows col-resize cursor on hover; a subtle 2px highlight appears while hovering or dragging.
 */
export function HorizontalResizeHandle({
  onPointerDown,
  onDoubleClick,
  "aria-label": ariaLabel,
  "aria-valuenow": valueNow,
  "aria-valuemin": valueMin,
  "aria-valuemax": valueMax,
}: HorizontalResizeHandleProps) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={ariaLabel}
      aria-valuenow={valueNow}
      aria-valuemin={valueMin}
      aria-valuemax={valueMax}
      className="group absolute inset-y-0 left-0 z-10 w-[6px] cursor-col-resize touch-none select-none"
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[2px] bg-transparent transition-colors duration-150 group-hover:bg-[#2552ED]/20 group-active:bg-[#2552ED]/40 dark:group-hover:bg-[#5580e0]/25 dark:group-active:bg-[#5580e0]/50" />
    </div>
  );
}
