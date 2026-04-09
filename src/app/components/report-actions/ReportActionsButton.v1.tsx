import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";
import {
  FLOATING_PANEL_LIST_PADDING_CLASSNAME,
  FLOATING_PANEL_SURFACE_CLASSNAME,
} from "@/app/components/ui/floatingPanelSurface";
import { useReportActions, buildReportContext } from "./useReportActions";
import { ShareReportModal } from "./ShareReportModal";
import { ScheduleReportModal } from "./ScheduleReportModal";
import { CustomizeShareDrawer } from "./CustomizeShareDrawer";
import { trackReportAction, buildEvent } from "./services";
import type { ReportContext, ReportActionId } from "./types";

/* ─── Props ─── */
interface ReportActionsButtonProps {
  /** Pre-built context or use buildReportContext() helper */
  context: ReportContext;
  /** Which actions to offer */
  actions: ReportActionId[];
  /** Override the button label (defaults to "Actions") */
  label?: string;
  /** Custom handler for "customizeShare" — e.g. Dashboard opens its AI panel instead */
  onCustomize?: () => void;
}

/**
 * Plug-and-play report actions dropdown.
 *
 * Usage:
 * ```tsx
 * <ReportActionsButton
 *   context={buildReportContext({ reportId: 'executive-impact', reportType: 'birdai', reportName: 'Executive impact' })}
 *   actions={['share', 'customizeShare', 'schedule']}
 * />
 * ```
 */
export function ReportActionsButton({
  context,
  actions,
  label = "Actions",
  onCustomize,
}: ReportActionsButtonProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { openAction, closeAction, activeAction, availableActions } = useReportActions(context, actions);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleActionClick = (actionId: ReportActionId) => {
    setDropdownOpen(false);
    trackReportAction(buildEvent("report_action_clicked", context, actionId));

    // If customizeShare has a custom handler, use it
    if (actionId === "customizeShare" && onCustomize) {
      onCustomize();
      return;
    }

    openAction(actionId);
  };

  return (
    <>
      {/* Trigger */}
      <div className="relative" ref={dropdownRef}>
        <Button
          type="button"
          variant="outline"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="gap-1 rounded-[8px] text-[13px] font-normal tracking-[-0.26px] dark:bg-[#1e2229]"
        >
          {label}
          <ChevronDown className="w-3.5 h-3.5 text-[#212121] dark:text-[#e4e4e4]" />
        </Button>

        {/* Dropdown menu */}
        {dropdownOpen && (
          <div
            className={cn(
              "absolute right-0 top-full z-20 mt-1 flex min-w-[180px] flex-col gap-1",
              FLOATING_PANEL_SURFACE_CLASSNAME,
              FLOATING_PANEL_LIST_PADDING_CLASSNAME,
            )}
          >
            {availableActions.map((action) => {
              const disabled = action.isEnabled ? !action.isEnabled(context) : false;
              return (
                <button
                  key={action.id}
                  onClick={() => !disabled && handleActionClick(action.id)}
                  disabled={disabled}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] transition-colors duration-150",
                    disabled
                      ? "cursor-not-allowed text-muted-foreground opacity-60"
                      : "text-foreground hover:bg-muted",
                  )}
                  style={{ fontWeight: 400 }}
                >
                  <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center text-muted-foreground">
                    {action.icon}
                  </span>
                  {action.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals / Drawer — rendered based on activeAction */}
      <ShareReportModal
        open={activeAction === "share"}
        onClose={closeAction}
        context={context}
      />
      <ScheduleReportModal
        open={activeAction === "schedule"}
        onClose={closeAction}
        context={context}
      />
      <CustomizeShareDrawer
        open={activeAction === "customizeShare"}
        onClose={closeAction}
        context={context}
      />
    </>
  );
}

/* Re-export helpers for convenience */
export { buildReportContext } from "./useReportActions";
export type { ReportContext, ReportActionId } from "./types";
