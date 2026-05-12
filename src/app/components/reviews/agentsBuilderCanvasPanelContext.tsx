import { createContext, useContext } from "react";

export type WorkflowCanvasApi = {
  focusWorkflowNode: (nodeId: string) => void;
};

export type AgentsBuilderCanvasPanelContextValue = {
  focusWorkflowNode: (nodeId: string) => void;
  selectedNodeId: string | null;
};

export const AgentsBuilderCanvasPanelContext = createContext<AgentsBuilderCanvasPanelContextValue | null>(null);

export function useAgentsBuilderCanvasPanel() {
  return useContext(AgentsBuilderCanvasPanelContext);
}
