import { Bell, CheckCircle2, X } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { cn } from "@/app/components/ui/utils";
import { useMonitorNotifications } from "@/app/context/MonitorNotificationsContext";

/**
 * L1 rail trigger + popover for agent monitor notifications.
 * Uses UI Popover (Radix) for anchoring to the right, focus, and dismiss behavior.
 */
export function MonitorNotificationsTrigger() {
  const {
    notifPanelOpen,
    setNotifPanelOpen,
    notificationItems,
    unresolvedCount,
    resolvedNotifs,
    readNotifs,
    handleResolveNotif,
    handleNotifClick,
  } = useMonitorNotifications();

  return (
    <Popover open={notifPanelOpen} onOpenChange={setNotifPanelOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Notifications"
          aria-label="Notifications"
          aria-expanded={notifPanelOpen}
          aria-haspopup="dialog"
          className={cn(
            "relative w-[34px] h-[34px] flex items-center justify-center rounded-full transition-colors outline-none",
            "hover:bg-[#d0d5dc] dark:hover:bg-[#2e3340]",
            "focus-visible:ring-2 focus-visible:ring-[#1E44CC]/50 focus-visible:ring-offset-1 focus-visible:ring-offset-[#e0e5eb] dark:focus-visible:ring-offset-[#181b22]",
            "data-[state=open]:bg-[#d0d5dc] dark:data-[state=open]:bg-[#2e3340]",
          )}
        >
          <Bell
            width={12.6}
            height={12.6}
            strokeWidth={1.2}
            className="text-[#555] dark:text-[#8b92a5]"
            aria-hidden
          />
          {unresolvedCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] flex items-center justify-center px-0.5 bg-destructive text-destructive-foreground text-[9px] rounded-full tabular-nums"
              style={{ fontWeight: 400 }}
            >
              {unresolvedCount > 9 ? "9+" : unresolvedCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        aria-label="Notifications"
        className={cn(
          "w-[min(400px,calc(100vw-88px))] max-h-[min(480px,70vh)] p-0 flex flex-col overflow-hidden rounded-xl shadow-xl z-[100]",
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <h4 className="text-[14px] tracking-[-0.28px]" style={{ fontWeight: 400 }}>
            Notifications
          </h4>
          <div className="flex items-center gap-2">
            {unresolvedCount > 0 && (
              <span
                className="text-[11px] text-muted-foreground px-2 py-0.5 bg-muted rounded-full"
                style={{ fontWeight: 300 }}
              >
                {unresolvedCount} unresolved
              </span>
            )}
            <button
              type="button"
              onClick={() => setNotifPanelOpen(false)}
              className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
              aria-label="Close notifications"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-border">
          {notificationItems.filter(n => n.severity === "warning" && !resolvedNotifs.has(n.id)).length > 0 && (
            <div>
              <div className="px-4 py-2">
                <span
                  className="text-[10px] text-amber-700 dark:text-amber-400 tracking-[0.5px] uppercase"
                  style={{ fontWeight: 400 }}
                >
                  Requires review
                </span>
              </div>
              {notificationItems
                .filter(n => n.severity === "warning" && !resolvedNotifs.has(n.id))
                .map(n => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleNotifClick(n)}
                    className={cn(
                      "w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/80 transition-colors duration-150",
                      !readNotifs.has(n.id) && "bg-amber-50/80 dark:bg-amber-950/20",
                    )}
                  >
                    <Badge
                      className="mt-0.5 shrink-0 border-transparent bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200 text-[10px] px-2 py-0.5 font-normal"
                      variant="outline"
                    >
                      Needs review
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-foreground truncate" style={{ fontWeight: 400 }}>
                        {n.agentName}
                      </p>
                      <p className="text-[12px] text-muted-foreground mt-0.5" style={{ fontWeight: 300 }}>
                        {n.summary}
                      </p>
                      <span className="text-[10px] text-muted-foreground tabular-nums" style={{ fontWeight: 300 }}>
                        {n.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 mt-0.5">
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={e => {
                          e.stopPropagation();
                          handleNotifClick(n);
                        }}
                        onKeyDown={e => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            handleNotifClick(n);
                          }
                        }}
                        className="text-[11px] text-primary hover:underline cursor-pointer"
                        style={{ fontWeight: 400 }}
                      >
                        {n.quickAction}
                      </span>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          handleResolveNotif(n.id);
                        }}
                        className="w-5 h-5 flex items-center justify-center rounded hover:bg-muted transition-colors"
                        title="Mark as resolved"
                        aria-label="Mark as resolved"
                      >
                        <CheckCircle2 className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </div>
                  </button>
                ))}
            </div>
          )}

          {notificationItems.filter(n => n.severity === "error" && !resolvedNotifs.has(n.id)).length > 0 && (
            <div>
              <div className="px-4 py-2">
                <span className="text-[10px] text-destructive tracking-[0.5px] uppercase" style={{ fontWeight: 400 }}>
                  Failed actions
                </span>
              </div>
              {notificationItems
                .filter(n => n.severity === "error" && !resolvedNotifs.has(n.id))
                .map(n => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleNotifClick(n)}
                    className={cn(
                      "w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/80 transition-colors duration-150",
                      !readNotifs.has(n.id) && "bg-destructive/5 dark:bg-destructive/10",
                    )}
                  >
                    <Badge
                      className="mt-0.5 shrink-0 border-transparent bg-destructive/15 text-destructive dark:bg-destructive/25 dark:text-destructive-foreground text-[10px] px-2 py-0.5 font-normal"
                      variant="outline"
                    >
                      Failed
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-foreground truncate" style={{ fontWeight: 400 }}>
                        {n.agentName}
                      </p>
                      <p className="text-[12px] text-muted-foreground mt-0.5" style={{ fontWeight: 300 }}>
                        {n.summary}
                      </p>
                      <span className="text-[10px] text-muted-foreground tabular-nums" style={{ fontWeight: 300 }}>
                        {n.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 mt-0.5">
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={e => {
                          e.stopPropagation();
                          handleNotifClick(n);
                        }}
                        onKeyDown={e => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            handleNotifClick(n);
                          }
                        }}
                        className="text-[11px] text-primary hover:underline cursor-pointer"
                        style={{ fontWeight: 400 }}
                      >
                        {n.quickAction}
                      </span>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          handleResolveNotif(n.id);
                        }}
                        className="w-5 h-5 flex items-center justify-center rounded hover:bg-muted transition-colors"
                        title="Mark as resolved"
                        aria-label="Mark as resolved"
                      >
                        <CheckCircle2 className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </div>
                  </button>
                ))}
            </div>
          )}

          {notificationItems.filter(n => resolvedNotifs.has(n.id)).length > 0 && (
            <div>
              <div className="px-4 py-2">
                <span className="text-[10px] text-[#4caf50] tracking-[0.5px] uppercase" style={{ fontWeight: 400 }}>
                  Resolved
                </span>
              </div>
              {notificationItems
                .filter(n => resolvedNotifs.has(n.id))
                .map(n => (
                  <div key={n.id} className="flex items-center gap-3 px-4 py-2.5 opacity-60">
                    <span className="text-[10px] text-muted-foreground shrink-0 uppercase tracking-wide" style={{ fontWeight: 400 }}>
                      Done
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-muted-foreground truncate" style={{ fontWeight: 300 }}>
                        {n.agentName} — {n.summary}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground tabular-nums shrink-0" style={{ fontWeight: 300 }}>
                      {n.time}
                    </span>
                  </div>
                ))}
            </div>
          )}

          {unresolvedCount === 0 && notificationItems.filter(n => resolvedNotifs.has(n.id)).length === 0 && (
            <div className="py-8 px-4 text-center">
              <p className="text-[13px] text-muted-foreground" style={{ fontWeight: 300 }}>
                No notifications
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
