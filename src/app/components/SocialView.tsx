interface SocialViewProps {
  /** If omitted, the component manages its own active-item state */
  activeItem?: string;
  onActiveItemChange?: (_key: string) => void;
}

function SkeletonBlock({
  className,
  style,
}: {
  className: string;
  style?: React.CSSProperties;
}) {
  return <div className={`animate-pulse rounded-md bg-black/8 dark:bg-white/8 ${className}`} style={style} />;
}

function contextualPlaceholderText(activeItem: string): string {
  if (activeItem.startsWith("Publish/")) return "Publishing workspace is loading for this section.";
  if (activeItem.startsWith("Engage/")) return "Engagement workspace is loading for this section.";
  if (activeItem.startsWith("Reports/")) return "Reporting workspace is loading for this section.";
  if (activeItem.startsWith("Competitors/")) return "Competitor workspace is loading for this section.";
  if (activeItem.startsWith("Libraries/")) return "Library workspace is loading for this section.";
  if (activeItem.startsWith("Agents/")) return "Agent workspace is loading for this section.";
  if (activeItem.startsWith("Settings/")) return "Settings workspace is loading for this section.";
  if (activeItem === "Create post") return "Post creation workspace is loading.";
  return "Social workspace is loading for this section.";
}

function SocialPagePlaceholder({ activeItem }: { activeItem: string }) {
  const contextText = contextualPlaceholderText(activeItem);
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-6 overflow-hidden overflow-y-auto bg-app-shell-main p-8 transition-colors duration-300">
      <div className="flex w-full max-w-4xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <SkeletonBlock className="h-8 w-52" />
            <SkeletonBlock className="h-4 w-72 bg-black/5 dark:bg-white/5" />
          </div>
          <div className="flex gap-2">
            <SkeletonBlock className="h-9 w-24" />
            <SkeletonBlock className="h-9 w-24 bg-black/5 dark:bg-white/5" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col gap-4 rounded-xl border border-black/[0.06] bg-white p-4 dark:border-white/[0.06] dark:bg-app-shell-main"
            >
              <SkeletonBlock className="h-3 w-20" />
              <SkeletonBlock className="h-8 w-16 bg-black/10 dark:bg-white/10" />
              <SkeletonBlock className="h-2 w-24 bg-black/5 dark:bg-white/5" />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-black/[0.06] bg-white p-6 dark:border-white/[0.06] dark:bg-app-shell-main">
          <div className="flex items-center justify-between">
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="h-7 w-28 bg-black/5 dark:bg-white/5" />
          </div>
          <div className="flex h-48 items-center justify-center rounded-lg bg-gradient-to-br from-black/[0.03] to-black/[0.06] dark:from-white/[0.03] dark:to-white/[0.06]">
            <span className="select-none text-[13px] text-[#999] dark:text-[#555]">{contextText}</span>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-black/[0.06] bg-white dark:border-white/[0.06] dark:bg-app-shell-main">
          <div className="flex gap-4 border-b border-black/[0.06] px-6 py-4 dark:border-white/[0.06]">
            {[160, 96, 80, 64].map((width, index) => (
              <SkeletonBlock key={index} className="h-3" style={{ width }} />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="flex gap-4 border-b border-black/[0.04] px-6 py-4 last:border-0 dark:border-white/[0.04]"
            >
              {[140, 92, 72, 58].map((width, index) => (
                <div
                  key={index}
                  className="h-3 animate-pulse rounded bg-black/6 dark:bg-white/6"
                  style={{ width: width + rowIndex * 4 }}
                />
              ))}
            </div>
          ))}
          </div>
        </div>
      </div>
  );
}

export function SocialView({ activeItem: activeItemProp, onActiveItemChange: onChangeProp }: SocialViewProps) {
  const activeItem = activeItemProp ?? "Publish/Calendar";
  void onChangeProp;

  return (
    <div className="relative flex h-full min-h-0 flex-1 overflow-hidden bg-background">
      <SocialPagePlaceholder activeItem={activeItem} />
    </div>
  );
}
