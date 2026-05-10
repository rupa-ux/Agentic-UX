import {
  Megaphone,
  MessageSquarePlus,
  MessageSquareText,
  Sparkles,
  Star,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";

type GenerateReviewAction = {
  id: "manual-request" | "configure-agents" | "launch-campaign";
  title: string;
  description: string;
  icon: LucideIcon;
};

const GENERATE_REVIEW_ACTIONS: GenerateReviewAction[] = [
  {
    id: "manual-request",
    title: "Send a manual request",
    description: "Reach out to a single customer right now via SMS or email.",
    icon: MessageSquarePlus,
  },
  {
    id: "configure-agents",
    title: "Configure review generation agents",
    description: "Automate review requests after every appointment or transaction.",
    icon: Sparkles,
  },
  {
    id: "launch-campaign",
    title: "Launch a campaign",
    description: "Bulk-send to a customer list and track open and click rates.",
    icon: Megaphone,
  },
];

export type GenerateReviewActionsPageProps = {
  onActionClick?: (actionId: GenerateReviewAction["id"]) => void;
};

export function GenerateReviewActionsPage({ onActionClick }: GenerateReviewActionsPageProps) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex flex-1 flex-col items-center justify-center px-8 pb-8 pt-6">
        <div className="mb-10 flex h-28 w-28 items-center justify-center rounded-[28px] bg-muted">
          <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
            <MessageSquareText className="h-8 w-8 text-primary" strokeWidth={1.6} absoluteStrokeWidth />
            <div className="mt-2 flex items-center gap-0.5">
              {Array.from({ length: 4 }).map((_, index) => (
                <Star
                  key={`star-${index}`}
                  className="h-3.5 w-3.5 fill-primary text-primary"
                  strokeWidth={1.6}
                  absoluteStrokeWidth
                />
              ))}
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-xl text-foreground">Start collecting reviews from your customers</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Send personalized requests via SMS or email - it takes under 2 minutes to set up.
          </p>
        </div>

        <div className="mt-10 flex w-full flex-wrap justify-center gap-3">
          {GENERATE_REVIEW_ACTIONS.map((action) => {
            const ActionIcon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => onActionClick?.(action.id)}
                className={cn(
                  "group flex w-[250px] max-w-[250px] min-h-[122px] flex-col items-start gap-3 rounded-xl border border-border bg-card p-5 text-left",
                  "transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                <ActionIcon className="h-4 w-4 text-muted-foreground" strokeWidth={1.6} absoluteStrokeWidth />
                <div className="space-y-1.5">
                  <p className="text-base text-foreground">{action.title}</p>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
