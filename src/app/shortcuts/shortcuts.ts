/** Keep in sync with `AppView` in `App.tsx` (avoid importing App — circular). */
export type ShortcutScope =
  | "global"
  | "reviews"
  | "inbox"
  | "agents"
  | "social"
  | "dashboard"
  | "ticketing"
  | "surveys"
  | "default";

export interface ShortcutDefinition {
  id: string;
  /** Single chord; not used for display when `keySequences` is set. */
  keys: string[];
  /** Multiple alternative chords (e.g. ? vs ⌘K); each inner array is one chord. */
  keySequences?: string[][];
  description: string;
  /** Optional helper line under the title in the shortcuts modal. */
  detail?: string;
  /** Shown in modal; global shortcuts always listed */
  scope: ShortcutScope;
}

export function shortcutScopeFromView(view: string): ShortcutScope {
  if (view === "reviews") return "reviews";
  if (view === "inbox") return "inbox";
  if (
    view === "agents-monitor" ||
    view === "agents-builder" ||
    view === "agents-onboarding" ||
    view === "agent-detail" ||
    view === "birdai-reports" ||
    view === "schedule-builder"
  ) {
    return "agents";
  }
  if (view === "social") return "social";
  if (view === "ticketing") return "ticketing";
  if (view === "surveys") return "surveys";
  if (
    view === "dashboard" ||
    view === "listings" ||
    view === "campaigns" ||
    view === "insights" ||
    view === "competitors"
  ) {
    return "dashboard";
  }
  return "default";
}

/** All shortcuts documented in the help modal (single source of truth). */
export const SHORTCUT_REGISTRY: ShortcutDefinition[] = [
  {
    id: "open-help",
    keys: [],
    keySequences: [["?"], ["⌘", "K"]],
    description: "Show keyboard shortcuts",
    detail: "Open this panel from anywhere.",
    scope: "global",
  },
  {
    id: "go-ticketing",
    keys: ["G", "T"],
    description: "Go to Ticketing",
    detail: "Jump to the ticketing workspace.",
    scope: "global",
  },
  {
    id: "go-reviews",
    keys: ["G", "V"],
    description: "Go to Reviews",
    detail: "Jump to reviews.",
    scope: "global",
  },
  {
    id: "go-monitor",
    keys: ["G", "M"],
    description: "Go to BirdAI (Monitor)",
    detail: "Jump to the BirdAI monitor.",
    scope: "global",
  },
  {
    id: "go-shared",
    keys: ["G", "P"],
    description: "Go to Shared by me",
    detail: "Jump to content you have shared.",
    scope: "global",
  },
  {
    id: "go-overview",
    keys: ["G", "O"],
    description: "Go to Overview",
    detail: "Jump to business overview.",
    scope: "global",
  },
  {
    id: "reviews-search",
    keys: ["/"],
    description: "Focus reviews search",
    detail: "Move focus to the search field.",
    scope: "reviews",
  },
  {
    id: "reviews-filters",
    keys: ["F"],
    description: "Toggle review filters",
    detail: "Show or hide filter controls.",
    scope: "reviews",
  },
  {
    id: "reviews-ai",
    keys: ["C"],
    description: "Focus AI reply assistant",
    detail: "Move focus to the AI reply assistant.",
    scope: "reviews",
  },
  {
    id: "inbox-compose",
    keys: ["C"],
    description: "Focus message composer",
    detail: "Move focus to the composer.",
    scope: "inbox",
  },
  {
    id: "inbox-search",
    keys: ["R"],
    description: "Focus conversation search",
    detail: "Move focus to conversation search.",
    scope: "inbox",
  },
  {
    id: "agents-builder",
    keys: ["B"],
    description: "Open Agent builder",
    detail: "Open the agent builder.",
    scope: "agents",
  },
  {
    id: "agents-home",
    keys: ["H"],
    description: "Open Myna monitor",
    detail: "Return to the Myna monitor.",
    scope: "agents",
  },
  {
    id: "social-new",
    keys: ["N"],
    description: "New post (coming soon)",
    detail: "Reserved for a new post flow.",
    scope: "social",
  },
  {
    id: "dashboard-refresh",
    keys: ["R"],
    description: "Refresh reports (coming soon)",
    detail: "Reserved for refreshing reports.",
    scope: "dashboard",
  },
  {
    id: "ticketing-new",
    keys: ["N"],
    description: "New ticket (coming soon)",
    detail: "Reserved for creating a ticket.",
    scope: "ticketing",
  },
  {
    id: "surveys-new",
    keys: ["N"],
    description: "New survey (coming soon)",
    detail: "Reserved for creating a survey.",
    scope: "surveys",
  },
];

export function shortcutsForModal(scope: ShortcutScope): ShortcutDefinition[] {
  const global = SHORTCUT_REGISTRY.filter((s) => s.scope === "global");
  const scoped =
    scope === "default"
      ? []
      : SHORTCUT_REGISTRY.filter((s) => s.scope === scope);
  return [...global, ...scoped];
}
