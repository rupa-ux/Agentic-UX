/**
 * Review response agent library templates — copy aligned with
 * Review Response agent 2.0 Figma (library + builder empty state).
 */
export type ResponseAgentLibraryTemplate = {
  id: string;
  title: string;
  description: string;
};

export const RESPONSE_AGENT_LIBRARY_TEMPLATES: ResponseAgentLibraryTemplate[] = [
  {
    id: "template-replies",
    title: "Review response agent replying using templates",
    description: "Uses pre-defined templates and responds to reviews automatically",
  },
  {
    id: "autonomous-replies",
    title: "Review response agent replying autonomously",
    description:
      "Uses AI to analyze review sentiment, generates and posts unique, context aware replies automatically",
  },
  {
    id: "approval-workflow",
    title: "Review response agent replying after human approval",
    description:
      "Uses AI to analyze review sentiment, generates and sends unique, context-aware replies for a human approval before posting",
  },
  {
    id: "dashboard-suggestions",
    title: "Review response agent suggesting replies in dashboard",
    description:
      "Uses AI to analyze review sentiment, generates and shows unique, context-aware replies in the dashboard for one-click manual posting",
  },
];
