/**
 * Proposed prompt/config changes applied when the user enters coaching mode for the
 * "Review response agent replying autonomously — North Region" preset. Each entry is
 * keyed by node ID and feeds the inline diff display + "Accept changes" action in
 * the agents builder right pane.
 *
 * The "kept" segments must match the existing prompt constants in
 * `AgentsBuilderView.v1.tsx` (NORTH_REVIEW_DETAILS_SYSTEM_PROMPT,
 * NORTH_REVIEW_DETAILS_USER_PROMPT, etc.) so that the diff renders against the
 * actual content the user sees on the canvas.
 */

export type DiffSegment = { text: string; kind: "kept" | "added" | "removed" };

export type CoachingDiff = {
  /** Inline segmented diff for the system prompt field. */
  systemPromptDiff?: DiffSegment[];
  /** Inline segmented diff for the user prompt field. */
  userPromptDiff?: DiffSegment[];
  /** New chips to render in the Input fields section (rendered in green to call out the addition). */
  addedInputFields?: string[];
  /** New chips to render in the Output fields section (rendered in green to call out the addition). */
  addedOutputFields?: string[];
  /** Final value applied when the user accepts the changes. */
  acceptedSystemPrompt?: string;
  acceptedUserPrompt?: string;
  /** Input field chips appended to `node.config.inputFieldChips` on accept. */
  acceptedInputFieldChips?: string[];
  /** Output field chips appended to `node.config.outputFieldChips` on accept. */
  acceptedOutputFieldChips?: string[];
};

// ─── north-node-review-details (Task 4) ──────────────────────────────────────
// Existing system prompt:
//   "You are a Review Intelligence Extractor. Your job is to analyze a customer
//    review and extract details. Be precise. Do not hallucinate. If something is
//    not mentioned or cannot be confidently inferred from the review, do not
//    invent it — say it explicitly as unknown or omit it."
//
// Existing user prompt (multi-line):
//   "Analyze the following review:
//    Review Text: {x} Review.text
//    Star Rating: {x} Review.rating
//
//    Perform all of the following: extract language, severity, sentiment,
//    severity reason, escalation flag, topics, staff mentions, competitor
//    mentions, and any other structured fields defined in your output
//    specification."
//
// Proposed additions (per coaching copilot):
//   • complaint_type extraction
//   • severity scoring rubric (1–10)
//   • Review.complaint_type output field

const REVIEW_DETAILS_SYSTEM_DIFF: DiffSegment[] = [
  {
    text: "You are a Review Intelligence Extractor. Your job is to analyze a customer review and extract ",
    kind: "kept",
  },
  { text: "details", kind: "removed" },
  { text: "structured details including complaint type and a severity score (1–10)", kind: "added" },
  {
    text: ". Be precise. Do not hallucinate. If something is not mentioned or cannot be confidently inferred from the review, do not invent it — say it explicitly as unknown or omit it.",
    kind: "kept",
  },
];

const REVIEW_DETAILS_ACCEPTED_SYSTEM =
  "You are a Review Intelligence Extractor. Your job is to analyze a customer review and extract structured details including complaint type and a severity score (1–10). Be precise. Do not hallucinate. If something is not mentioned or cannot be confidently inferred from the review, do not invent it — say it explicitly as unknown or omit it.";

const REVIEW_DETAILS_USER_DIFF: DiffSegment[] = [
  {
    text: "Analyze the following review:\nReview Text: {x} Review.text\nStar Rating: {x} Review.rating\n\nPerform all of the following: extract language, severity",
    kind: "kept",
  },
  { text: " (1–10 using the rubric below)", kind: "added" },
  {
    text: ", sentiment, severity reason, escalation flag, topics, staff mentions, competitor mentions, ",
    kind: "kept",
  },
  { text: "complaint_type, ", kind: "added" },
  { text: "and any other structured fields defined in your output specification.", kind: "kept" },
  {
    text: "\n\nSeverity scoring rubric:\n  1–3 minor · 4–6 moderate · 7–8 reputation risk · 9–10 safety/health implied",
    kind: "added",
  },
  {
    text: "\n\nExtract complaint_type from one of: [service, wait_time, billing, parking, staff_attitude, repeated_issue, general].",
    kind: "added",
  },
];

const REVIEW_DETAILS_ACCEPTED_USER = `Analyze the following review:
Review Text: {x} Review.text
Star Rating: {x} Review.rating

Perform all of the following: extract language, severity (1–10 using the rubric below), sentiment, severity reason, escalation flag, topics, staff mentions, competitor mentions, complaint_type, and any other structured fields defined in your output specification.

Severity scoring rubric:
  1–3 minor · 4–6 moderate · 7–8 reputation risk · 9–10 safety/health implied

Extract complaint_type from one of: [service, wait_time, billing, parking, staff_attitude, repeated_issue, general].`;

const REVIEW_DETAILS_ADDED_INPUT_FIELDS = [
  "service",
  "wait_time",
  "billing",
  "parking",
  "staff_attitude",
  "repeated_issue",
  "general",
];

export const COACHING_DIFFS: Record<string, CoachingDiff> = {
  "north-node-review-details": {
    systemPromptDiff: REVIEW_DETAILS_SYSTEM_DIFF,
    userPromptDiff: REVIEW_DETAILS_USER_DIFF,
    addedInputFields: REVIEW_DETAILS_ADDED_INPUT_FIELDS,
    addedOutputFields: ["Review.complaint_type"],
    acceptedSystemPrompt: REVIEW_DETAILS_ACCEPTED_SYSTEM,
    acceptedUserPrompt: REVIEW_DETAILS_ACCEPTED_USER,
    acceptedInputFieldChips: REVIEW_DETAILS_ADDED_INPUT_FIELDS,
    acceptedOutputFieldChips: ["Review.complaint_type"],
  },
};
