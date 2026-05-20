import { cn } from "@/app/components/ui/utils";
import {
  PRODUCT_VERTICALS,
  useProductVertical,
} from "@/app/context/ProductVerticalContext";

interface ProductVerticalSwitcherProps {
  className?: string;
}

export function ProductVerticalSwitcher({ className }: ProductVerticalSwitcherProps) {
  const { vertical, setVertical } = useProductVertical();

  return (
    <div
      role="tablist"
      aria-label="Product vertical"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md border border-border/50 bg-muted/40 p-0.5 dark:bg-white/[0.04]",
        className,
      )}
    >
      {PRODUCT_VERTICALS.map((opt) => {
        const isSelected = vertical === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => setVertical(opt.id)}
            className={cn(
              "rounded-[5px] px-2.5 py-1 text-[11px] font-medium leading-none whitespace-nowrap transition-colors duration-150",
              isSelected
                ? "bg-background text-foreground shadow-sm dark:bg-white/[0.08]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
