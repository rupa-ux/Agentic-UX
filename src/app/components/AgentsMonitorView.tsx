import { useState, useRef, useCallback, useEffect } from "react";
import {
  Search, ChevronDown, CheckCircle2, XCircle, Clock,
  AlertTriangle, Bot, Activity, X, RotateCcw, UserCheck,
  PauseCircle, Pencil, Sparkles, Loader2, Bell, Eye, Wrench, Zap,
} from "lucide-react";

/* ─── Types ─── */
type ActivityStatus = "success" | "warning" | "error" | "processing";
type ActivityCategory = "Customer Interaction" | "Automation" | "Content Publishing" | "Data Update" | "System Event" | "Error";

interface TimelineStep {
  time: string;
  label: string;
  detail?: string;
}

interface AgentReasoning {
  sentiment?: string;
  topic?: string;
  customerHistory?: string;
  confidence: number;
}

interface MonitorActivity {
  id: string;
  time: string;
  agentName: string;
  action: string;
  status: ActivityStatus;
  detail?: string;
  category: ActivityCategory;
  timeline?: TimelineStep[];
  reasoning?: AgentReasoning;
  hasDraft?: boolean;
  draftText?: string;
}

/* ─── Mock Data ─── */
const monitorMetrics = [
  { label: "Agent actions today", value: "342", icon: Activity, color: "#2552ED" },
  { label: "Successful actions", value: "318", icon: CheckCircle2, color: "#4caf50" },
  { label: "Automation rate", value: "93%", icon: Zap, color: "#9970D7" },
  { label: "Avg response time", value: "4.2s", icon: Clock, color: "#F59E0B" },
];

const monitorActivities: MonitorActivity[] = [
  {
    id: "m1", time: "10:42 AM", agentName: "Review response agent",
    action: "Replied to a 2-star review on Google",
    status: "success", detail: "Sentiment: negative \u2022 Auto-approved",
    category: "Customer Interaction",
    timeline: [
      { time: "10:42:01", label: "Customer posted review", detail: "\"Food was terrible and the wait was over an hour.\"" },
      { time: "10:42:04", label: "Agent detected sentiment: Negative" },
      { time: "10:42:06", label: "Agent generated response draft", detail: "\"I'm sorry your experience didn't meet expectations. We take feedback seriously and would love the chance to make it right...\"" },
      { time: "10:42:10", label: "Auto-approval rule applied" },
      { time: "10:42:11", label: "Response posted to Google" },
    ],
    reasoning: { sentiment: "Negative", topic: "Service delay", customerHistory: "First-time reviewer", confidence: 0.92 },
  },
  {
    id: "m2", time: "10:39 AM", agentName: "Social publishing agent",
    action: "Scheduled campaign post on Instagram",
    status: "success", detail: "Campaign: Spring Sale 2026",
    category: "Content Publishing",
    timeline: [
      { time: "10:39:01", label: "Campaign trigger activated" },
      { time: "10:39:03", label: "Generated caption and hashtags" },
      { time: "10:39:05", label: "Image asset selected from library" },
      { time: "10:39:08", label: "Post scheduled for 2:00 PM EST" },
    ],
    reasoning: { topic: "Campaign scheduling", confidence: 0.95 },
  },
  {
    id: "m3", time: "10:34 AM", agentName: "Ticketing agent",
    action: "Escalated support request to Tier 2",
    status: "warning", detail: "Confidence: low",
    category: "Customer Interaction",
    timeline: [
      { time: "10:34:01", label: "Ticket #5201 received" },
      { time: "10:34:04", label: "Agent classified: Billing dispute" },
      { time: "10:34:06", label: "Confidence below threshold (0.42)" },
      { time: "10:34:08", label: "Escalated to Tier 2 support" },
    ],
    reasoning: { topic: "Billing dispute", customerHistory: "3 prior tickets, VIP customer", confidence: 0.42 },
  },
  {
    id: "m4", time: "10:28 AM", agentName: "Review generation agent",
    action: "Sent 15 review requests via SMS",
    status: "success", detail: "Location: Austin, TX \u2022 Batch #847",
    category: "Automation",
    timeline: [
      { time: "10:28:01", label: "Batch #847 triggered" },
      { time: "10:28:03", label: "15 eligible customers identified" },
      { time: "10:28:06", label: "SMS messages dispatched" },
      { time: "10:28:10", label: "Delivery confirmed: 15/15" },
    ],
    reasoning: { topic: "Review solicitation", confidence: 0.98 },
  },
  {
    id: "m5", time: "10:22 AM", agentName: "Listing optimization agent",
    action: "Updated hours on 3 Google Business profiles",
    status: "success", detail: "Locations: San Francisco, Austin, Denver",
    category: "Data Update",
    timeline: [
      { time: "10:22:01", label: "Holiday schedule detected" },
      { time: "10:22:04", label: "Updated 3 location profiles" },
      { time: "10:22:08", label: "Changes verified on Google" },
    ],
    reasoning: { topic: "Holiday hours sync", confidence: 0.97 },
  },
  {
    id: "m6", time: "10:15 AM", agentName: "Social publishing agent",
    action: "Failed to publish post \u2014 token expired",
    status: "error", detail: "Platform: Facebook \u2022 Error code: AUTH_EXPIRED",
    category: "Error",
    timeline: [
      { time: "10:15:01", label: "Scheduled post triggered" },
      { time: "10:15:03", label: "API authentication failed", detail: "Facebook OAuth token expired" },
      { time: "10:15:05", label: "Retry attempt 1 failed" },
      { time: "10:15:08", label: "Action flagged for manual intervention" },
    ],
    reasoning: { topic: "Authentication failure", confidence: 0.0 },
  },
  {
    id: "m7", time: "10:08 AM", agentName: "Review response agent",
    action: "Drafted response for 1-star review (pending approval)",
    status: "warning", detail: "Confidence: 0.38 \u2022 Requires human review",
    category: "Customer Interaction",
    hasDraft: true,
    draftText: "We sincerely apologize for your experience. Your feedback is important to us, and we'd like to make things right. Could you reach out to our team directly so we can address your concerns?",
    timeline: [
      { time: "10:08:01", label: "1-star review detected on Google" },
      { time: "10:08:04", label: "Agent analyzed sentiment: Very negative" },
      { time: "10:08:07", label: "Response draft generated", detail: "Low confidence \u2014 flagged for human review" },
    ],
    reasoning: { sentiment: "Very negative", topic: "Product quality complaint", customerHistory: "Repeat customer, 2 prior reviews", confidence: 0.38 },
  },
  {
    id: "m8", time: "9:55 AM", agentName: "Ticketing agent",
    action: "Auto-closed 12 resolved tickets",
    status: "success", detail: "SLA compliance: 98.2%",
    category: "Automation",
    timeline: [
      { time: "9:55:01", label: "Batch close triggered" },
      { time: "9:55:04", label: "12 tickets identified as resolved >48h" },
      { time: "9:55:06", label: "Closure notifications sent" },
    ],
    reasoning: { topic: "Ticket lifecycle management", confidence: 0.99 },
  },
  {
    id: "m9", time: "9:48 AM", agentName: "Review response agent",
    action: "Replied to a 5-star review on Yelp",
    status: "success", detail: "Sentiment: positive \u2022 Auto-approved",
    category: "Customer Interaction",
    timeline: [
      { time: "9:48:01", label: "5-star review detected on Yelp" },
      { time: "9:48:03", label: "Sentiment: Positive" },
      { time: "9:48:05", label: "Thank-you response generated and posted" },
    ],
    reasoning: { sentiment: "Positive", topic: "Positive feedback", confidence: 0.96 },
  },
  {
    id: "m10", time: "9:42 AM", agentName: "Social engagement agent",
    action: "Responded to 8 comments on Facebook",
    status: "success", detail: "Avg response time: 2.3 min",
    category: "Customer Interaction",
    timeline: [
      { time: "9:42:01", label: "8 new comments detected" },
      { time: "9:42:04", label: "Responses generated and posted" },
    ],
    reasoning: { topic: "Social engagement", confidence: 0.91 },
  },
  {
    id: "m11", time: "9:35 AM", agentName: "Listing optimization agent",
    action: "Detected outdated photo on Google listing",
    status: "warning", detail: "Location: Portland \u2022 Flagged for review",
    category: "Data Update",
    timeline: [
      { time: "9:35:01", label: "Photo audit completed" },
      { time: "9:35:04", label: "1 photo flagged as outdated (>12 months)" },
      { time: "9:35:06", label: "Notification sent to location manager" },
    ],
    reasoning: { topic: "Visual content freshness", confidence: 0.78 },
  },
  {
    id: "m12", time: "9:28 AM", agentName: "Ticketing agent",
    action: "Failed to route ticket \u2014 missing category",
    status: "error", detail: "Ticket #4892 \u2022 Needs manual assignment",
    category: "Error",
    timeline: [
      { time: "9:28:01", label: "Ticket #4892 received" },
      { time: "9:28:03", label: "Category classification failed" },
      { time: "9:28:05", label: "Routing aborted \u2014 flagged for manual assignment" },
    ],
    reasoning: { topic: "Unclassifiable request", confidence: 0.12 },
  },
];

const agentOptions = ["All agents", "Review response agent", "Review generation agent", "Listing optimization agent", "Social publishing agent", "Social engagement agent", "Ticketing agent"];
const statusOptions = ["All statuses", "Success", "Needs review", "Failed", "Processing"];
const categoryOptions: ("All categories" | ActivityCategory)[] = ["All categories", "Customer Interaction", "Automation", "Content Publishing", "Data Update", "System Event", "Error"];
const dateOptions = ["Today", "Last 7 days", "Last 30 days", "Custom range"];

/* ─── Status Icon ─── */
function StatusIcon({ status, size = "sm" }: { status: ActivityStatus; size?: "sm" | "md" }) {
  const cls = size === "md" ? "w-5 h-5" : "w-4 h-4";
  if (status === "success") return <CheckCircle2 className={`${cls} text-[#4caf50] shrink-0`} />;
  if (status === "warning") return <AlertTriangle className={`${cls} text-[#F59E0B] shrink-0`} />;
  if (status === "processing") return <Loader2 className={`${cls} text-[#2552ED] shrink-0 animate-spin`} />;
  return <XCircle className={`${cls} text-[#ef5350] shrink-0`} />;
}

/* ─── Status Label ─── */
function statusLabel(status: ActivityStatus) {
  if (status === "success") return "Success";
  if (status === "warning") return "Needs review";
  if (status === "processing") return "Processing";
  return "Failed";
}

function statusColor(status: ActivityStatus) {
  if (status === "success") return "text-[#4caf50]";
  if (status === "warning") return "text-[#F59E0B]";
  if (status === "processing") return "text-[#2552ED]";
  return "text-[#ef5350]";
}

/* ─── Category Badge ─── */
function CategoryBadge({ category }: { category: ActivityCategory }) {
  const colorMap: Record<ActivityCategory, string> = {
    "Customer Interaction": "bg-[#e8effe] dark:bg-[#252d42] text-[#2552ED] dark:text-[#6b9bff]",
    "Automation": "bg-[#e8f5e9] dark:bg-[#1b3a2a] text-[#4caf50] dark:text-[#66bb6a]",
    "Content Publishing": "bg-[#f3e8ff] dark:bg-[#2d1b4e] text-[#9970D7] dark:text-[#b794f4]",
    "Data Update": "bg-[#e0f2f1] dark:bg-[#1b3a36] text-[#00897b] dark:text-[#4db6ac]",
    "System Event": "bg-[#f0f1f5] dark:bg-[#262b35] text-[#555] dark:text-[#9ba2b0]",
    "Error": "bg-[#fce4ec] dark:bg-[#3a1b1b] text-[#ef5350] dark:text-[#ef9a9a]",
  };
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded-[4px] text-[10px] tracking-[-0.2px] ${colorMap[category]}`} style={{ fontWeight: 400 }}>
      {category}
    </span>
  );
}

/* ─── Confidence Meter ─── */
function ConfidenceMeter({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? "#4caf50" : pct >= 50 ? "#F59E0B" : "#ef5350";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-[4px] bg-[#f0f1f5] dark:bg-[#262b35] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[12px] tabular-nums" style={{ fontWeight: 400, color }}>{pct}%</span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Inspection Panel (Right Side)
   ═══════════════════════════════════════════ */
function InspectionPanel({ activity, onClose }: { activity: MonitorActivity; onClose: () => void }) {
  const [explainOpen, setExplainOpen] = useState(false);

  return (
    <div className="flex-1 min-w-0 bg-white dark:bg-[#1e2229] flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 shrink-0">
        <h3 className="text-[14px] text-[#212121] dark:text-[#e4e4e4] tracking-[-0.28px] truncate" style={{ fontWeight: 400 }}>
          Activity details
        </h3>
        <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-[4px] hover:bg-[#f0f0f0] dark:hover:bg-[#2e3340] transition-colors shrink-0">
          <X className="w-3.5 h-3.5 text-[#999] dark:text-[#6b7280]" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

        {/* Summary */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CategoryBadge category={activity.category} />
            <span className={`text-[11px] ${statusColor(activity.status)}`} style={{ fontWeight: 400 }}>{statusLabel(activity.status)}</span>
          </div>
          <p className="text-[14px] text-[#212121] dark:text-[#e4e4e4] tracking-[-0.28px]" style={{ fontWeight: 400 }}>
            {activity.agentName}
          </p>
          <p className="text-[13px] text-[#555] dark:text-[#9ba2b0]" style={{ fontWeight: 300 }}>
            {activity.action}
          </p>
          {activity.detail && (
            <p className="text-[11px] text-[#999] dark:text-[#6b7280]" style={{ fontWeight: 300 }}>{activity.detail}</p>
          )}
        </div>

        {/* Conversation Timeline */}
        {activity.timeline && activity.timeline.length > 0 && (
          <div>
            <h4 className="text-[12px] text-[#888] dark:text-[#6b7280] mb-3 tracking-[-0.24px]" style={{ fontWeight: 400 }}>Timeline</h4>
            <div className="relative pl-4">
              {/* Vertical line */}
              <div className="absolute left-[5px] top-1 bottom-1 w-px bg-[#E5E7EB] dark:bg-[#2e3340]" />
              <div className="space-y-3">
                {activity.timeline.map((step, i) => (
                  <div key={i} className="relative">
                    {/* Dot */}
                    <div className={`absolute -left-4 top-[5px] w-[10px] h-[10px] rounded-full border-2 ${
                      i === activity.timeline!.length - 1
                        ? "border-[#2552ED] bg-[#2552ED]"
                        : "border-[#E5E7EB] dark:border-[#4d5568] bg-white dark:bg-[#1e2229]"
                    }`} />
                    <div>
                      <span className="text-[10px] text-[#999] dark:text-[#6b7280] tabular-nums" style={{ fontWeight: 300 }}>{step.time}</span>
                      <p className="text-[12px] text-[#212121] dark:text-[#e4e4e4] mt-0.5" style={{ fontWeight: 400 }}>{step.label}</p>
                      {step.detail && (
                        <p className="text-[11px] text-[#777] dark:text-[#6b7280] mt-0.5 italic" style={{ fontWeight: 300 }}>{step.detail}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Agent Reasoning */}
        {activity.reasoning && (
          <div>
            <h4 className="text-[12px] text-[#888] dark:text-[#6b7280] mb-2 tracking-[-0.24px]" style={{ fontWeight: 400 }}>Agent reasoning</h4>
            <div className="bg-[#f8f9fa] dark:bg-[#1a1e26] border border-[#E5E7EB] dark:border-[#2e3340] rounded-[8px] px-4 py-3 space-y-2">
              {activity.reasoning.sentiment && (
                <div className="flex justify-between">
                  <span className="text-[11px] text-[#888] dark:text-[#6b7280]" style={{ fontWeight: 400 }}>Sentiment</span>
                  <span className="text-[11px] text-[#212121] dark:text-[#e4e4e4]" style={{ fontWeight: 400 }}>{activity.reasoning.sentiment}</span>
                </div>
              )}
              {activity.reasoning.topic && (
                <div className="flex justify-between">
                  <span className="text-[11px] text-[#888] dark:text-[#6b7280]" style={{ fontWeight: 400 }}>Topic detected</span>
                  <span className="text-[11px] text-[#212121] dark:text-[#e4e4e4]" style={{ fontWeight: 400 }}>{activity.reasoning.topic}</span>
                </div>
              )}
              {activity.reasoning.customerHistory && (
                <div className="flex justify-between">
                  <span className="text-[11px] text-[#888] dark:text-[#6b7280]" style={{ fontWeight: 400 }}>Customer history</span>
                  <span className="text-[11px] text-[#212121] dark:text-[#e4e4e4]" style={{ fontWeight: 400 }}>{activity.reasoning.customerHistory}</span>
                </div>
              )}
              <div className="pt-1">
                <span className="text-[11px] text-[#888] dark:text-[#6b7280] block mb-1" style={{ fontWeight: 400 }}>Confidence score</span>
                <ConfidenceMeter value={activity.reasoning.confidence} />
              </div>
            </div>
          </div>
        )}

        {/* Draft Preview */}
        {activity.hasDraft && activity.draftText && (
          <div>
            <h4 className="text-[12px] text-[#888] dark:text-[#6b7280] mb-2 tracking-[-0.24px]" style={{ fontWeight: 400 }}>Response draft</h4>
            <div className="bg-[#fffbf0] dark:bg-[#2a2618] border border-[#f0e6c8] dark:border-[#4a3f20] rounded-[8px] px-4 py-3">
              <p className="text-[12px] text-[#555] dark:text-[#9ba2b0] italic" style={{ fontWeight: 300 }}>
                "{activity.draftText}"
              </p>
            </div>
          </div>
        )}

        {/* AI Explain */}
        <div>
          <button
            onClick={() => setExplainOpen(!explainOpen)}
            className="flex items-center gap-1.5 text-[12px] text-[#2552ED] dark:text-[#6b9bff] hover:underline transition-colors"
            style={{ fontWeight: 400 }}
          >
            <Sparkles className="w-3 h-3" />
            Explain this activity
          </button>
          {explainOpen && (
            <div className="mt-2 bg-[#f0f4ff] dark:bg-[#1a2040] border border-[#d0dbf8] dark:border-[#2e3a5e] rounded-[8px] px-4 py-3 space-y-1">
              {activity.status === "success" && activity.reasoning && activity.reasoning.confidence >= 0.85 && (
                <>
                  <p className="text-[11px] text-[#555] dark:text-[#9ba2b0]" style={{ fontWeight: 300 }}>This action was auto-approved because:</p>
                  <ul className="text-[11px] text-[#555] dark:text-[#9ba2b0] list-disc pl-4 space-y-0.5" style={{ fontWeight: 300 }}>
                    {activity.reasoning.sentiment && <li>Sentiment was {activity.reasoning.sentiment.toLowerCase()}</li>}
                    <li>Response confidence {">"} 0.85 ({Math.round(activity.reasoning.confidence * 100)}%)</li>
                    <li>Auto-reply policy enabled for this agent</li>
                  </ul>
                </>
              )}
              {activity.status === "warning" && (
                <>
                  <p className="text-[11px] text-[#555] dark:text-[#9ba2b0]" style={{ fontWeight: 300 }}>This action was flagged for review because:</p>
                  <ul className="text-[11px] text-[#555] dark:text-[#9ba2b0] list-disc pl-4 space-y-0.5" style={{ fontWeight: 300 }}>
                    <li>Confidence score below auto-approval threshold</li>
                    {activity.reasoning && <li>Current confidence: {Math.round(activity.reasoning.confidence * 100)}%</li>}
                    <li>Human review required per policy</li>
                  </ul>
                </>
              )}
              {activity.status === "error" && (
                <>
                  <p className="text-[11px] text-[#555] dark:text-[#9ba2b0]" style={{ fontWeight: 300 }}>This action failed because:</p>
                  <ul className="text-[11px] text-[#555] dark:text-[#9ba2b0] list-disc pl-4 space-y-0.5" style={{ fontWeight: 300 }}>
                    <li>External API returned an authentication error</li>
                    <li>Retry attempts exhausted</li>
                    <li>Manual intervention is required to resolve</li>
                  </ul>
                </>
              )}
              {activity.status === "success" && activity.reasoning && activity.reasoning.confidence < 0.85 && (
                <p className="text-[11px] text-[#555] dark:text-[#9ba2b0]" style={{ fontWeight: 300 }}>
                  This action completed successfully. The agent processed the task according to its configured workflow rules.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Intervention Controls */}
      <div className="px-5 py-3 shrink-0">
        {activity.status === "warning" && activity.hasDraft ? (
          <div className="flex items-center gap-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[12px] text-[#212121] dark:text-[#e4e4e4] border border-[#e5e9f0] dark:border-[#333a47] rounded-[8px] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340] transition-colors" style={{ fontWeight: 400 }}>
              <Pencil className="w-3 h-3" />
              Edit
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[12px] text-white bg-[#4caf50] hover:bg-[#43a047] rounded-[8px] transition-colors" style={{ fontWeight: 400 }}>
              <CheckCircle2 className="w-3 h-3" />
              Approve
            </button>
          </div>
        ) : activity.status === "error" ? (
          <div className="flex items-center gap-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[12px] text-[#212121] dark:text-[#e4e4e4] border border-[#e5e9f0] dark:border-[#333a47] rounded-[8px] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340] transition-colors" style={{ fontWeight: 400 }}>
              <RotateCcw className="w-3 h-3" />
              Retry
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[12px] text-[#212121] dark:text-[#e4e4e4] border border-[#e5e9f0] dark:border-[#333a47] rounded-[8px] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340] transition-colors" style={{ fontWeight: 400 }}>
              <UserCheck className="w-3 h-3" />
              Escalate
            </button>
          </div>
        ) : activity.status === "warning" ? (
          <div className="flex items-center gap-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[12px] text-[#212121] dark:text-[#e4e4e4] border border-[#e5e9f0] dark:border-[#333a47] rounded-[8px] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340] transition-colors" style={{ fontWeight: 400 }}>
              <UserCheck className="w-3 h-3" />
              Escalate
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[12px] text-white bg-[#4caf50] hover:bg-[#43a047] rounded-[8px] transition-colors" style={{ fontWeight: 400 }}>
              <CheckCircle2 className="w-3 h-3" />
              Approve
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[12px] text-[#212121] dark:text-[#e4e4e4] border border-[#e5e9f0] dark:border-[#333a47] rounded-[8px] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340] transition-colors" style={{ fontWeight: 400 }}>
              <PauseCircle className="w-3 h-3" />
              Pause agent
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Monitor View
   ═══════════════════════════════════════════ */
export function AgentsMonitorView({ onBack }: { onBack: () => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [agentFilter, setAgentFilter] = useState("All agents");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [categoryFilter, setCategoryFilter] = useState<string>("All categories");
  const [dateFilter, setDateFilter] = useState("Today");
  const [agentDropOpen, setAgentDropOpen] = useState(false);
  const [statusDropOpen, setStatusDropOpen] = useState(false);
  const [categoryDropOpen, setCategoryDropOpen] = useState(false);
  const [dateDropOpen, setDateDropOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<MonitorActivity | null>(null);
  const [searchExpanded, setSearchExpanded] = useState(false);

  /* ── Notification panel state ── */
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [resolvedNotifs, setResolvedNotifs] = useState<Set<string>>(new Set());
  const [readNotifs, setReadNotifs] = useState<Set<string>>(new Set());
  const notifBellRef = useRef<HTMLDivElement>(null);

  // Build notifications from activities that need attention (warning + error)
  const notificationItems = monitorActivities
    .filter(a => a.status === "warning" || a.status === "error")
    .map(a => ({
      id: a.id,
      agentName: a.agentName,
      summary: a.status === "warning"
        ? (a.hasDraft ? "Drafted response requires approval" : "Action flagged — requires review")
        : (a.detail?.includes("token") ? "Post failed due to token expiration" : "Action failed — needs manual intervention"),
      time: a.time,
      severity: a.status as "warning" | "error",
      activityRef: a,
      quickAction: a.status === "warning" ? (a.hasDraft ? "Review" : "Inspect") : "Fix connection",
    }));

  const unresolvedNotifs = notificationItems.filter(n => !resolvedNotifs.has(n.id));
  const unresolvedCount = unresolvedNotifs.length;

  const handleResolveNotif = (id: string) => {
    setResolvedNotifs(prev => new Set(prev).add(id));
  };

  const handleNotifClick = (notif: typeof notificationItems[0]) => {
    setReadNotifs(prev => new Set(prev).add(notif.id));
    setSelectedActivity(notif.activityRef);
    setNotifPanelOpen(false);
  };

  // Close notif panel on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifBellRef.current && !notifBellRef.current.contains(e.target as Node)) {
        setNotifPanelOpen(false);
      }
    };
    if (notifPanelOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifPanelOpen]);

  /* ── Resizable pane state ── */
  const containerRef = useRef<HTMLDivElement>(null);
  const [dividerPos, setDividerPos] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startPos = useRef(0);

  const MIN_LEFT = 320;
  const MIN_RIGHT = 300;

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    isDragging.current = true;
    setIsResizing(true);
    startX.current = e.clientX;
    const container = containerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    startPos.current = dividerPos ?? containerRect.width - 400;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [dividerPos]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const maxLeft = containerRect.width - MIN_RIGHT;
    const delta = e.clientX - startX.current;
    const newPos = Math.min(maxLeft, Math.max(MIN_LEFT, startPos.current + delta));
    setDividerPos(newPos);
  }, []);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
    setIsResizing(false);
  }, []);

  const handleDoubleClick = useCallback(() => {
    setDividerPos(null);
  }, []);

  const closeAllDropdowns = () => {
    setAgentDropOpen(false);
    setStatusDropOpen(false);
    setCategoryDropOpen(false);
    setDateDropOpen(false);
  };

  const filteredActivities = monitorActivities.filter(a => {
    if (searchQuery && !a.action.toLowerCase().includes(searchQuery.toLowerCase()) && !a.agentName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (agentFilter !== "All agents" && a.agentName !== agentFilter) return false;
    if (statusFilter === "Success" && a.status !== "success") return false;
    if (statusFilter === "Needs review" && a.status !== "warning") return false;
    if (statusFilter === "Failed" && a.status !== "error") return false;
    if (statusFilter === "Processing" && a.status !== "processing") return false;
    if (categoryFilter !== "All categories" && a.category !== categoryFilter) return false;
    return true;
  });

  // Alert counts
  const needsReviewCount = monitorActivities.filter(a => a.status === "warning").length;
  const errorCount = monitorActivities.filter(a => a.status === "error").length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#13161b] transition-colors duration-300 rounded-tr-[8px]">
      {/* ─── Page Header ─── */}
      <div className="px-6 pt-6 pb-0 shrink-0">
        {/* Title row with filters inline */}
        <div className="flex items-start justify-between mb-5">
          <div className="shrink-0">
            <h1 className="text-[20px] text-[#212121] dark:text-[#e4e4e4] tracking-[-0.4px]" style={{ fontWeight: 400 }}>Monitor</h1>
            <p className="text-[13px] text-[#888] dark:text-[#6b7280] mt-0.5" style={{ fontWeight: 300 }}>What did your AI team do today?</p>
          </div>
          {/* ─── Filters (inline with title) ─── */}
          <div className="flex items-center gap-2.5">
            {/* Search icon button */}
            {searchExpanded ? (
              <div className="flex items-center gap-2 px-3 py-[7px] border border-[#e5e9f0] dark:border-[#333a47] rounded-[8px] bg-white dark:bg-[#1e2229] w-[220px] transition-all">
                <Search className="w-3.5 h-3.5 text-[#999] dark:text-[#6b7280] shrink-0" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onBlur={() => { if (!searchQuery) setSearchExpanded(false); }}
                  placeholder="Search activities..."
                  className="flex-1 bg-transparent text-[13px] text-[#212121] dark:text-[#e4e4e4] placeholder:text-[#b0b0b0] dark:placeholder:text-[#4d5568] outline-none min-w-0"
                  style={{ fontWeight: 400 }}
                />
                <button onClick={() => { setSearchQuery(""); setSearchExpanded(false); }} className="shrink-0">
                  <X className="w-3 h-3 text-[#999] dark:text-[#6b7280]" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setSearchExpanded(true); closeAllDropdowns(); }}
                className="flex items-center justify-center size-[38px] border border-[#e5e9f0] dark:border-[#333a47] rounded-[8px] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340] transition-colors"
              >
                <Search className="w-3.5 h-3.5 text-[#999] dark:text-[#6b7280]" />
              </button>
            )}

            {/* Notification bell */}
            <div className="relative" ref={notifBellRef}>
              <button
                onClick={() => { setNotifPanelOpen(!notifPanelOpen); closeAllDropdowns(); }}
                className="relative flex items-center justify-center size-[38px] border border-[#e5e9f0] dark:border-[#333a47] rounded-[8px] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340] transition-colors"
              >
                <Bell className="w-4 h-4 text-[#555] dark:text-[#9ba2b0]" />
                {unresolvedCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-[#ef5350] text-white text-[10px] rounded-full tabular-nums" style={{ fontWeight: 400 }}>
                    {unresolvedCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown panel */}
              {notifPanelOpen && (
                <div className="absolute top-full right-0 mt-2 w-[400px] bg-white dark:bg-[#1e2229] border border-[#e5e9f0] dark:border-[#333a47] rounded-[12px] shadow-xl z-50 flex flex-col max-h-[480px] overflow-hidden">
                  {/* Panel header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f1f5] dark:border-[#2e3340]">
                    <h4 className="text-[14px] text-[#212121] dark:text-[#e4e4e4] tracking-[-0.28px]" style={{ fontWeight: 400 }}>
                      Notifications
                    </h4>
                    <div className="flex items-center gap-2">
                      {unresolvedCount > 0 && (
                        <span className="text-[11px] text-[#888] dark:text-[#6b7280] px-2 py-0.5 bg-[#f0f1f5] dark:bg-[#262b35] rounded-full" style={{ fontWeight: 300 }}>
                          {unresolvedCount} unresolved
                        </span>
                      )}
                      <button
                        onClick={() => setNotifPanelOpen(false)}
                        className="w-6 h-6 flex items-center justify-center rounded-[4px] hover:bg-[#f0f0f0] dark:hover:bg-[#2e3340] transition-colors"
                      >
                        <X className="w-3.5 h-3.5 text-[#999] dark:text-[#6b7280]" />
                      </button>
                    </div>
                  </div>

                  {/* Notification list */}
                  <div className="flex-1 overflow-y-auto divide-y divide-[#f0f1f5] dark:divide-[#2e3340]">
                    {/* Requires review section */}
                    {notificationItems.filter(n => n.severity === "warning" && !resolvedNotifs.has(n.id)).length > 0 && (
                      <div>
                        <div className="px-4 py-2">
                          <span className="text-[10px] text-[#F59E0B] tracking-[0.5px] uppercase" style={{ fontWeight: 400 }}>
                            Requires review
                          </span>
                        </div>
                        {notificationItems
                          .filter(n => n.severity === "warning" && !resolvedNotifs.has(n.id))
                          .map(n => (
                            <button
                              key={n.id}
                              onClick={() => handleNotifClick(n)}
                              className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[#f8f9fa] dark:hover:bg-[#1a1e26] transition-colors ${
                                !readNotifs.has(n.id) ? "bg-[#fffef5] dark:bg-[#1e2229]" : ""
                              }`}
                            >
                              <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] text-[#212121] dark:text-[#e4e4e4] truncate" style={{ fontWeight: 400 }}>{n.agentName}</p>
                                <p className="text-[12px] text-[#555] dark:text-[#9ba2b0] mt-0.5" style={{ fontWeight: 300 }}>{n.summary}</p>
                                <span className="text-[10px] text-[#999] dark:text-[#6b7280] tabular-nums" style={{ fontWeight: 300 }}>{n.time}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 mt-0.5">
                                <span
                                  onClick={(e) => { e.stopPropagation(); handleNotifClick(n); }}
                                  className="text-[11px] text-[#2552ED] dark:text-[#6b9bff] hover:underline cursor-pointer"
                                  style={{ fontWeight: 400 }}
                                >
                                  {n.quickAction}
                                </span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleResolveNotif(n.id); }}
                                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#e8f5e9] dark:hover:bg-[#1b3a2a] transition-colors"
                                  title="Mark as resolved"
                                >
                                  <CheckCircle2 className="w-3 h-3 text-[#4caf50]" />
                                </button>
                              </div>
                            </button>
                          ))}
                      </div>
                    )}

                    {/* Failed actions section */}
                    {notificationItems.filter(n => n.severity === "error" && !resolvedNotifs.has(n.id)).length > 0 && (
                      <div>
                        <div className="px-4 py-2">
                          <span className="text-[10px] text-[#ef5350] tracking-[0.5px] uppercase" style={{ fontWeight: 400 }}>
                            Failed actions
                          </span>
                        </div>
                        {notificationItems
                          .filter(n => n.severity === "error" && !resolvedNotifs.has(n.id))
                          .map(n => (
                            <button
                              key={n.id}
                              onClick={() => handleNotifClick(n)}
                              className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[#f8f9fa] dark:hover:bg-[#1a1e26] transition-colors ${
                                !readNotifs.has(n.id) ? "bg-[#fff5f5] dark:bg-[#1e2229]" : ""
                              }`}
                            >
                              <XCircle className="w-4 h-4 text-[#ef5350] shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] text-[#212121] dark:text-[#e4e4e4] truncate" style={{ fontWeight: 400 }}>{n.agentName}</p>
                                <p className="text-[12px] text-[#555] dark:text-[#9ba2b0] mt-0.5" style={{ fontWeight: 300 }}>{n.summary}</p>
                                <span className="text-[10px] text-[#999] dark:text-[#6b7280] tabular-nums" style={{ fontWeight: 300 }}>{n.time}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 mt-0.5">
                                <span
                                  onClick={(e) => { e.stopPropagation(); handleNotifClick(n); }}
                                  className="text-[11px] text-[#2552ED] dark:text-[#6b9bff] hover:underline cursor-pointer"
                                  style={{ fontWeight: 400 }}
                                >
                                  {n.quickAction}
                                </span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleResolveNotif(n.id); }}
                                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#e8f5e9] dark:hover:bg-[#1b3a2a] transition-colors"
                                  title="Mark as resolved"
                                >
                                  <CheckCircle2 className="w-3 h-3 text-[#4caf50]" />
                                </button>
                              </div>
                            </button>
                          ))}
                      </div>
                    )}

                    {/* Resolved section */}
                    {notificationItems.filter(n => resolvedNotifs.has(n.id)).length > 0 && (
                      <div>
                        <div className="px-4 py-2">
                          <span className="text-[10px] text-[#4caf50] tracking-[0.5px] uppercase" style={{ fontWeight: 400 }}>
                            Resolved
                          </span>
                        </div>
                        {notificationItems
                          .filter(n => resolvedNotifs.has(n.id))
                          .map(n => (
                            <div
                              key={n.id}
                              className="flex items-center gap-3 px-4 py-2.5 opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#4caf50] shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[12px] text-[#888] dark:text-[#6b7280] truncate" style={{ fontWeight: 300 }}>{n.agentName} — {n.summary}</p>
                              </div>
                              <span className="text-[10px] text-[#999] dark:text-[#6b7280] tabular-nums shrink-0" style={{ fontWeight: 300 }}>{n.time}</span>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Empty state */}
                    {unresolvedCount === 0 && notificationItems.filter(n => resolvedNotifs.has(n.id)).length === 0 && (
                      <div className="py-8 text-center">
                        <Bell className="w-5 h-5 text-[#999] dark:text-[#6b7280] mx-auto mb-2" />
                        <p className="text-[13px] text-[#888] dark:text-[#6b7280]" style={{ fontWeight: 300 }}>No notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <FilterDropdown label={agentFilter} options={agentOptions} isOpen={agentDropOpen} onToggle={() => { setAgentDropOpen(!agentDropOpen); setStatusDropOpen(false); setCategoryDropOpen(false); setDateDropOpen(false); }} onSelect={v => { setAgentFilter(v); setAgentDropOpen(false); }} />
            <FilterDropdown label={statusFilter} options={statusOptions} isOpen={statusDropOpen} onToggle={() => { setStatusDropOpen(!statusDropOpen); setAgentDropOpen(false); setCategoryDropOpen(false); setDateDropOpen(false); }} onSelect={v => { setStatusFilter(v); setStatusDropOpen(false); }} />
            <FilterDropdown label={categoryFilter} options={categoryOptions} isOpen={categoryDropOpen} onToggle={() => { setCategoryDropOpen(!categoryDropOpen); setAgentDropOpen(false); setStatusDropOpen(false); setDateDropOpen(false); }} onSelect={v => { setCategoryFilter(v); setCategoryDropOpen(false); }} />
            <FilterDropdown label={dateFilter} options={dateOptions} isOpen={dateDropOpen} onToggle={() => { setDateDropOpen(!dateDropOpen); setAgentDropOpen(false); setStatusDropOpen(false); setCategoryDropOpen(false); }} onSelect={v => { setDateFilter(v); setDateDropOpen(false); }} />
          </div>
        </div>

        {/* ��── Operational Metrics ─── */}
        <div className="grid grid-cols-4 gap-4 mb-5">
          {monitorMetrics.map(m => (
            <div key={m.label} className="bg-white dark:bg-[#1e2229] border border-[#E5E7EB] dark:border-[#2e3340] rounded-[12px] px-5 py-4 transition-colors">
              <div className="flex items-baseline gap-2 mb-1">
                <p className="text-[24px] text-[#212121] dark:text-[#e4e4e4] tracking-[-0.5px]" style={{ fontWeight: 400 }}>{m.value}</p>
                <m.icon className="w-4 h-4 self-center" style={{ color: m.color }} />
              </div>
              <span className="text-[12px] text-[#888] dark:text-[#6b7280] tracking-[-0.24px]" style={{ fontWeight: 400 }}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Two-Panel Body ─── */}
      <div className={`flex-1 flex min-h-0 overflow-hidden ${isResizing ? "select-none" : ""}`} ref={containerRef}>
        {/* Activity Feed (Left) */}
        <div
          className="overflow-y-auto min-w-0"
          style={
            selectedActivity && dividerPos !== null
              ? { width: `${dividerPos}px`, flexShrink: 0 }
              : { flex: 1 }
          }
        >
          <div className="px-6 pt-2 pb-4">
            <div className="flex items-center justify-between py-2 mb-1">
              <h3 className="text-[14px] text-[#212121] dark:text-[#e4e4e4] tracking-[-0.28px]" style={{ fontWeight: 400 }}>Agent activity</h3>
              
            </div>
            <div>
              {filteredActivities.map((item) => {
                const isSelected = selectedActivity?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedActivity(isSelected ? null : item)}
                    className={`w-full flex items-start gap-3 px-3 py-3.5 rounded-[6px] transition-colors text-left ${
                      isSelected
                        ? "bg-[#f0f4ff] dark:bg-[#1e2d5e]/40"
                        : "hover:bg-[#f8f9fa] dark:hover:bg-[#1a1e26]"
                    }`}
                  >
                    <span className="text-[11px] text-[#999] dark:text-[#6b7280] whitespace-nowrap mt-0.5 w-[65px] shrink-0 tabular-nums" style={{ fontWeight: 300 }}>{item.time}</span>
                    <StatusIcon status={item.status} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[13px] text-[#2552ED] dark:text-[#6b9bff]" style={{ fontWeight: 400 }}>{item.agentName}</span>
                        <CategoryBadge category={item.category} />
                      </div>
                      <span className="text-[13px] text-[#555] dark:text-[#9ba2b0] block" style={{ fontWeight: 300 }}>{item.action}</span>
                      {item.detail && (
                        <p className="text-[11px] text-[#999] dark:text-[#6b7280] mt-0.5" style={{ fontWeight: 300 }}>{item.detail}</p>
                      )}
                    </div>
                  </button>
                );
              })}
              {filteredActivities.length === 0 && (
                <div className="text-center py-12 text-[13px] text-[#999] dark:text-[#6b7280]" style={{ fontWeight: 300 }}>No activities match your filters</div>
              )}
            </div>
          </div>
        </div>

        {/* Figma-style resize handle */}
        {selectedActivity && (
          <div
            className="relative shrink-0 group"
            style={{ width: '9px' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onDoubleClick={handleDoubleClick}
          >
            {/* Visible line with vertical gradient fade */}
            <div
              className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px transition-all duration-150 group-hover:w-[3px] group-hover:rounded-full group-active:w-[3px] group-active:rounded-full"
              style={{
                background: "linear-gradient(to bottom, transparent 0%, rgba(229,231,235,0.8) 12%, rgba(229,231,235,1) 25%, rgba(229,231,235,1) 75%, rgba(229,231,235,0.8) 88%, transparent 100%)",
              }}
            />
            {/* Invisible grab area */}
            <div className="absolute inset-0 cursor-col-resize z-10" />
          </div>
        )}

        {/* Inspection Panel (Right) */}
        {selectedActivity && (
          <InspectionPanel activity={selectedActivity} onClose={() => setSelectedActivity(null)} />
        )}
      </div>
    </div>
  );
}

/* ─── Reusable Filter Dropdown ─── */
function FilterDropdown({ label, options, isOpen, onToggle, onSelect }: {
  label: string;
  options: string[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="relative">
      <button onClick={onToggle} className="flex items-center gap-1.5 px-3 py-2 text-[13px] text-[#212121] dark:text-[#e4e4e4] border border-[#e5e9f0] dark:border-[#333a47] rounded-[8px] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340] transition-colors whitespace-nowrap" style={{ fontWeight: 400 }}>
        {label}
        <ChevronDown className="w-3 h-3 text-[#999] dark:text-[#6b7280]" />
      </button>
      {isOpen && (
        <div className="absolute top-full mt-1 right-0 bg-white dark:bg-[#22262f] rounded-[8px] shadow-lg border border-[#e5e9f0] dark:border-[#333a47] py-1 z-50 min-w-[180px]">
          {options.map(opt => (
            <button key={opt} onClick={() => onSelect(opt)} className={`w-full text-left px-3 py-1.5 text-[13px] transition-colors ${opt === label ? "text-[#2552ED] bg-[#e8effe] dark:bg-[#1e2d5e]" : "text-[#212121] dark:text-[#e4e4e4] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340]"}`} style={{ fontWeight: 400 }}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}