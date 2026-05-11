import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/components/ui/utils";
import type { ResponseAgentLibraryTemplate } from "@/app/components/reviews/responseAgentLibraryTemplates";

export function ResponseAgentLibraryTemplateCard({
  template,
  onUseAgent,
}: {
  template: ResponseAgentLibraryTemplate;
  /** When omitted (e.g. library tab preview), the CTA is visible on hover but has no action. */
  onUseAgent?: (templateId: string) => void;
}) {
  return (
    <article
      className={cn(
        "group flex h-[196px] flex-col gap-2 overflow-hidden rounded-lg border border-border bg-card p-5 transition-[background-color,border-color] duration-150",
        "hover:border-primary/30 hover:bg-primary/[0.07] dark:hover:bg-primary/15",
      )}
    >
      <h3 className="line-clamp-2 shrink-0 text-[14px] font-medium leading-snug tracking-tight text-foreground">
        {template.title}
      </h3>
      <div className="min-h-0 flex-1 overflow-hidden">
        <p className="text-[14px] font-normal leading-relaxed text-muted-foreground line-clamp-4 group-hover:line-clamp-2">
          {template.description}
        </p>
      </div>
      <div className="flex h-8 shrink-0 items-end">
        <Button
          type="button"
          variant="default"
          size="sm"
          className={cn(
            "h-8 rounded-md px-3 text-xs font-medium shadow-none transition-opacity duration-150",
            "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto",
          )}
          onClick={() => onUseAgent?.(template.id)}
        >
          Use agent
        </Button>
      </div>
    </article>
  );
}
