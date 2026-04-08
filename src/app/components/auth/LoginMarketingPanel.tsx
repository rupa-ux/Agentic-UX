import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/components/ui/utils";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1760112982282-45eade72df08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200";

/**
 * Right column for login — large rounded card, gradient, hero art, overlay copy (ElevenLabs-inspired).
 */
export function LoginMarketingPanel({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "hidden h-full min-h-0 w-full flex-col p-6 lg:flex lg:w-1/2 lg:min-w-0 lg:shrink-0",
        className,
      )}
    >
      <div className="relative flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-emerald-100/90 via-teal-200/80 to-cyan-800/90 dark:from-emerald-950/50 dark:via-teal-950/40 dark:to-slate-950/80">
        <img
          src={HERO_IMAGE}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-overlay dark:opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-white/10 dark:from-black/60" />

        <div className="relative mt-auto flex flex-col gap-4 p-8">
          <Badge
            variant="secondary"
            className="w-fit border-0 bg-white/25 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white backdrop-blur-sm dark:bg-white/10"
          >
            Latest updates
          </Badge>
          <p className="max-w-md text-2xl font-medium leading-snug tracking-tight text-white md:text-3xl">
            Explore agents that respond, publish, and optimize — all in one Bird AI workspace.
          </p>
        </div>

        <div className="absolute bottom-8 right-8 flex gap-2">
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="size-10 rounded-full border-0 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
            aria-label="Previous slide"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="size-10 rounded-full border-0 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
            aria-label="Next slide"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
