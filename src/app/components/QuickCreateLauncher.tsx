"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bot,
  CircleDollarSign,
  FileBarChart2,
  LayoutDashboard,
  Mail,
  MessageSquareQuote,
  Plus,
  ReceiptText,
  ScanSearch,
  Ticket,
  UserPlus,
  Waypoints,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import {
  L2_HEADER_PLUS_GLYPH_BLUE,
  L2_HEADER_PLUS_STROKE_PX,
  L2_HEADER_PLUS_WRAPPER_BLUE,
} from "@/app/components/L2NavLayout.v1";
import { MAIN_VIEW_HEADER_BAND_CLASS } from "@/app/components/layout/mainViewTitleClasses";
import { cn } from "@/app/components/ui/utils";

export interface QuickCreateAction {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  shortcut?: string;
}

export const QUICK_CREATE_ACTIONS: QuickCreateAction[] = [
  {
    id: "review-request",
    title: "Review request",
    description: "Ask customers for fresh feedback after a visit or service.",
    icon: MessageSquareQuote,
    shortcut: "R",
  },
  {
    id: "new-message",
    title: "New message",
    description: "Start a direct outreach thread from one global entry point.",
    icon: Mail,
    shortcut: "M",
  },
  {
    id: "create-post",
    title: "Create post",
    description: "Draft a social post without switching into the Social module first.",
    icon: ReceiptText,
    shortcut: "P",
  },
  {
    id: "custom-agent",
    title: "Create custom agent",
    description: "Spin up a BirdAI worker for repeatable operational tasks.",
    icon: Bot,
    shortcut: "A",
  },
  {
    id: "add-contact",
    title: "Add a contact",
    description: "Create a CRM record for a new lead, customer, or business contact.",
    icon: UserPlus,
    shortcut: "C",
  },
  {
    id: "request-payment",
    title: "Request payment",
    description: "Send a billing request from the same launcher instead of an L2 tile.",
    icon: CircleDollarSign,
    shortcut: "Y",
  },
  {
    id: "create-survey",
    title: "Create survey",
    description: "Start a customer survey with templates and distribution options.",
    icon: ScanSearch,
    shortcut: "S",
  },
  {
    id: "create-ticket",
    title: "Create ticket",
    description: "Open a support ticket and route it into the service workflow.",
    icon: Ticket,
    shortcut: "T",
  },
  {
    id: "create-workflow",
    title: "Create workflow",
    description: "Compose a multi-step automation that spans modules.",
    icon: Waypoints,
    shortcut: "W",
  },
  {
    id: "create-report",
    title: "Create report",
    description: "Generate a report artifact from shared metrics and saved views.",
    icon: FileBarChart2,
    shortcut: "G",
  },
  {
    id: "create-dashboard",
    title: "Create dashboard",
    description: "Create a saved reporting surface with persistent widgets.",
    icon: LayoutDashboard,
    shortcut: "D",
  },
];

/** Card layout: full title + description, or title only (description still used for `aria-label`). */
export type QuickCreateCardVariant = "withSubtext" | "noSubtext";

interface QuickCreateLauncherProps {
  actions?: QuickCreateAction[];
  /** Default `noSubtext` — icon + title only. Use `withSubtext` for the two-line CTA cards. */
  cardVariant?: QuickCreateCardVariant;
  onActionSelect?: (action: QuickCreateAction) => void;
  className?: string;
}

export function QuickCreateLauncher({
  actions = QUICK_CREATE_ACTIONS,
  cardVariant = "noSubtext",
  onActionSelect,
  className,
}: QuickCreateLauncherProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleSelect(action: QuickCreateAction) {
    onActionSelect?.(action);
    setDialogOpen(false);
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Open create actions"
          className={cn(
            L2_HEADER_PLUS_WRAPPER_BLUE,
            "transition-colors hover:bg-primary/20 dark:hover:bg-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            className,
          )}
        >
          <Plus
            className={L2_HEADER_PLUS_GLYPH_BLUE}
            strokeWidth={L2_HEADER_PLUS_STROKE_PX}
            absoluteStrokeWidth
            aria-hidden
          />
        </button>
      </DialogTrigger>

      <DialogContent className="flex max-h-[min(90vh,720px)] w-full max-w-[min(100vw-2rem,56rem)] flex-col gap-0 overflow-hidden p-0 text-[13px] sm:max-w-[min(100vw-2rem,56rem)]">
        <div className={MAIN_VIEW_HEADER_BAND_CLASS}>
          <div className="min-w-0">
            <DialogTitle>What do you want to create?</DialogTitle>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {actions.map((action) => {
              const Icon = action.icon;
              const showSubtext = cardVariant === "withSubtext";
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => handleSelect(action)}
                  aria-label={showSubtext ? undefined : `${action.title}. ${action.description}`}
                  className={cn(
                    "group flex min-h-0 flex-row gap-3 rounded-lg border border-border bg-card p-4 text-left text-[13px] leading-normal tracking-[-0.26px] transition-colors hover:bg-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    showSubtext ? "items-start" : "items-center",
                  )}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-[13px] font-medium leading-normal text-foreground">{action.title}</span>
                    {showSubtext ? (
                      <span className="text-[13px] font-normal leading-normal text-muted-foreground">
                        {action.description}
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
