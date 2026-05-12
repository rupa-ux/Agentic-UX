import {
  AgentsBuilderView,
  AGENTS_BUILDER_NORTH_AUTONOMOUS_PRESET_ID,
} from "@/app/components/AgentsBuilderView.v1";
import {
  CoachingCopilotPanel,
  NODE_INSIGHTS,
  type NodeInsight,
} from "@/app/components/reviews/CoachingCopilotPanel";

export type CoachingAgent = {
  id: string;
  name: string;
};

export function CoachingAgentCanvas({
  agent,
  highlightNodeIds,
  onBack,
  onAcceptChanges,
  onEditAgent,
  initialSelectedNodeId,
}: {
  agent: CoachingAgent;
  highlightNodeIds: string[];
  onBack: () => void;
  onAcceptChanges?: () => void;
  onEditAgent?: () => void;
  initialSelectedNodeId?: string;
}) {
  const presetId =
    agent.id === AGENTS_BUILDER_NORTH_AUTONOMOUS_PRESET_ID ? agent.id : undefined;

  const coachingSuggestedChanges: NodeInsight[] = highlightNodeIds
    .map((nodeId) => {
      const insight = NODE_INSIGHTS[nodeId];
      if (!insight) return null;
      return { nodeId, ...insight };
    })
    .filter((x): x is NodeInsight => !!x)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <AgentsBuilderView
      agentName={agent.name}
      workflowPresetId={presetId}
      initialPhase="building"
      coachingHighlightNodeIds={highlightNodeIds}
      coachingSuggestedChanges={coachingSuggestedChanges}
      initialSelectedNodeId={initialSelectedNodeId ?? null}
      leftPanel={
        <CoachingCopilotPanel highlightNodeIds={highlightNodeIds} />
      }
      onBack={onBack}
      onCoachingAcceptChanges={onAcceptChanges}
      onCoachingEditAgent={onEditAgent}
    />
  );
}
