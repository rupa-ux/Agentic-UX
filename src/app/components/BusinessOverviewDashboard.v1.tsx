import { WorkspacePlaceholderSkeleton } from "@/app/components/layout/WorkspacePlaceholderSkeleton";

export default function BusinessOverviewDashboard() {
  return (
    <div className="relative flex h-full min-h-0 flex-1 overflow-hidden bg-background">
      <WorkspacePlaceholderSkeleton caption="Overview workspace is loading for this section." />
    </div>
  );
}
