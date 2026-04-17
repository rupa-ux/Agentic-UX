/**
 * Placeholder main content for Journeys L2 leaves that do not yet have a dedicated screen.
 */

const LEAF_TITLE: Record<string, string> = {
  "Agents/campaign": "Campaign agents",
  "Settings/channels": "Channels",
  "Settings/templates": "Templates",
  "Settings/knowledge": "Knowledge",
  "Settings/memory": "Memory",
  "Settings/comm-restriction": "Communication restriction",
  "Settings/manage-tags": "Manage tags",
};


function titleFromKey(journeysL2Key: string): string {
  return LEAF_TITLE[journeysL2Key] ?? journeysL2Key.replace(/\//g, " · ");
}

export function BirdAIJourneysPlaceholderView({ journeysL2Key }: { journeysL2Key: string }) {
  const title = titleFromKey(journeysL2Key);
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-white px-6 py-6 transition-colors duration-300 dark:bg-[#1e2229]">
      <div className="max-w-lg flex flex-col gap-2">
        <h1 className="text-[17px] font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          This Journeys area is not wired to a full experience yet. Navigation and the Storybook scorecard
          reflect the target IA from design.
        </p>
      </div>
    </div>
  );
}
