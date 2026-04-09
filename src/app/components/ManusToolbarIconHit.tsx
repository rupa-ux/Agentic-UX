import * as React from "react";

import { HOVER } from "@/app/components/L2NavLayout";
import { cn } from "@/app/components/ui/utils";

type ManusToolbarIconHitProps = React.ComponentProps<"button">;

/**
 * **32×32** icon tile: **hover / pressed overlays** use the same washes as **L2 navigation**
 * (`L2NavLayout` `HOVER` + selected-row gray). Stroke still pairs with `L1_STRIP_ICON_*` on Lucide.
 * Focus ring matches app chrome (`#1E44CC`).
 */
export function ManusToolbarIconHit({ className, type = "button", ...props }: ManusToolbarIconHitProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-[10px] outline-none",
        "transition-all duration-200 ease-out",
        HOVER,
        "text-[#555] hover:text-[#212121] active:bg-[#e2e4ea] active:text-[#212121]",
        "dark:text-[#9ba2b0] dark:hover:text-[#e4e4e4] dark:active:bg-[#454d5c] dark:active:text-[#e4e4e4]",
        "focus-visible:ring-2 focus-visible:ring-[#1E44CC]/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background dark:focus-visible:ring-offset-[#1e2229]",
        className,
      )}
      {...props}
    />
  );
}
