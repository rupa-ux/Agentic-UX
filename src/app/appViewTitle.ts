import type { AppView } from "./App";

/** Single source of truth for the top bar / Myna context label for each route. */
export function getAppViewTitle(view: AppView): string {
  switch (view) {
    case "business-overview":
      return "Overview";
    case "inbox":
      return "Inbox";
    case "storybook":
      return "Component showcase";
    case "reviews":
      return "Reviews";
    case "social":
      return "Social";
    case "searchai":
      return "Search";
    case "contacts":
      return "Contacts";
    case "listings":
      return "Listings";
    case "surveys":
      return "Surveys";
    case "ticketing":
      return "Ticketing";
    case "campaigns":
      return "Campaigns";
    case "insights":
      return "Insights";
    case "competitors":
      return "Competitors";
    case "dashboard":
      return "Reports";
    case "shared-by-me":
      return "Shared by me";
    case "scheduled-deliveries":
    case "schedule-builder":
      return "Scheduled deliveries";
    case "agents-monitor":
    case "agents-analyze-performance":
    case "agents-builder":
    case "agent-detail":
    case "birdai-reports":
      return "BirdAI";
    case "agents-onboarding":
      return "BirdAI setup";
    default:
      return "Reports";
  }
}
