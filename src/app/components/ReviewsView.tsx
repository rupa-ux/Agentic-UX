"use client";

import { useState } from "react";
import { ReviewsViewList } from "./ReviewsView.v1";
import { ReviewsViewConversation } from "./ReviewsView.v2";
import { GenerateReviewActionsPage } from "./reviews/GenerateReviewActionsPage";
import { ReviewsResponseAgentsPage } from "./reviews/ReviewsResponseAgentsPage";

export type ReviewsViewMode = "list" | "conversation";

const REVIEWS_L2_GENERATE_REVIEW_KEY = "Human actions/Generate review";
const REVIEWS_L2_RESPOND_TO_REVIEWS_KEY = "Human actions/Respond to reviews";
const REVIEWS_L2_RESPONSE_AGENT_KEY = "Agents/Response agent";

export function ReviewsView({
  reviewsL2ActiveItem,
  onViewFeedbackProgress,
}: { reviewsL2ActiveItem?: string; onViewFeedbackProgress?: () => void } = {}) {
  const [mode, setMode] = useState<ReviewsViewMode>("list");
  if (reviewsL2ActiveItem === REVIEWS_L2_GENERATE_REVIEW_KEY) {
    return <GenerateReviewActionsPage />;
  }
  if (reviewsL2ActiveItem === REVIEWS_L2_RESPOND_TO_REVIEWS_KEY) {
    return (
      <ReviewsViewList
        viewMode="list"
        onViewModeChange={setMode}
        reviewsL2ActiveItem={reviewsL2ActiveItem}
        onViewFeedbackProgress={onViewFeedbackProgress}
      />
    );
  }
  if (reviewsL2ActiveItem === REVIEWS_L2_RESPONSE_AGENT_KEY) {
    return <ReviewsResponseAgentsPage />;
  }

  return mode === "list" ? (
    <ReviewsViewList
      viewMode={mode}
      onViewModeChange={setMode}
      reviewsL2ActiveItem={reviewsL2ActiveItem}
      onViewFeedbackProgress={onViewFeedbackProgress}
    />
  ) : (
    <ReviewsViewConversation viewMode={mode} onViewModeChange={setMode} />
  );
}
