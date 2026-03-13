import { useState } from "react";
import {
  Bot, Activity, AlertTriangle, TrendingUp, ExternalLink, ChevronRight,
  CheckCircle2, XCircle, Clock, Zap, MessageSquare, Share2, Tag, Ticket,
} from "lucide-react";

/* ─── Types ─── */
interface Agent {
  id: string;
  name: string;
  description: string;
  status: "active" | "paused" | "error";
  tasksToday: number;
  icon: typeof Bot;
}

interface ActivityItem {
  id: string;
  time: string;
  agentName: string;
  action: string;
  status: "success" | "warning" | "error";
}

interface AttentionItem {
  id: string;
  agentName: string;
  issue: string;
  count: number;
  severity: "warning" | "error";
}

/* ─── Mock Data ─── */
const summaryMetrics = [
  { label: "Active agents", value: "6", change: "+2 this week", icon: Bot, color: "#2552ED" },
  { label: "Tasks completed today", value: "342", change: "+18% vs yesterday", icon: CheckCircle2, color: "#4caf50" },
  { label: "Needs attention", value: "3", change: "2 approvals pending", icon: AlertTriangle, color: "#F59E0B" },
  { label: "Automation rate", value: "94.2%", change: "+1.3% this month", icon: TrendingUp, color: "#2552ED" },
];

const agents: Agent[] = [
  { id: "a1", name: "Review response agent", description: "Automatically replies to incoming reviews based on sentiment and context", status: "active", tasksToday: 87, icon: MessageSquare },
  { id: "a2", name: "Review generation agent", description: "Sends review requests to customers after transactions", status: "active", tasksToday: 124, icon: Share2 },
  { id: "a3", name: "Listing optimization agent", description: "Monitors and updates business listings for accuracy and completeness", status: "active", tasksToday: 43, icon: Tag },
  { id: "a4", name: "Social publishing agent", description: "Schedules and publishes social media posts across platforms", status: "active", tasksToday: 56, icon: Share2 },
  { id: "a5", name: "Social engagement agent", description: "Responds to comments and messages on social channels", status: "paused", tasksToday: 0, icon: MessageSquare },
  { id: "a6", name: "Ticketing agent", description: "Triages incoming support tickets and routes to appropriate teams", status: "error", tasksToday: 32, icon: Ticket },
];

const recentActivity: ActivityItem[] = [
  { id: "act1", time: "10:42 AM", agentName: "Review response agent", action: "Replied to a 2-star review on Google", status: "success" },
  { id: "act2", time: "10:39 AM", agentName: "Social publishing agent", action: "Scheduled a campaign post on Instagram", status: "success" },
  { id: "act3", time: "10:34 AM", agentName: "Ticketing agent", action: "Escalated a support request to Tier 2", status: "warning" },
  { id: "act4", time: "10:28 AM", agentName: "Review generation agent", action: "Sent 15 review requests via SMS", status: "success" },
  { id: "act5", time: "10:22 AM", agentName: "Listing optimization agent", action: "Updated hours on 3 Google Business profiles", status: "success" },
  { id: "act6", time: "10:15 AM", agentName: "Social publishing agent", action: "Failed to publish post — token expired", status: "error" },
  { id: "act7", time: "10:08 AM", agentName: "Review response agent", action: "Drafted response for 1-star review (pending approval)", status: "warning" },
];

const needsAttention: AttentionItem[] = [
  { id: "att1", agentName: "Review response agent", issue: "Responses require approval", count: 2, severity: "warning" },
  { id: "att2", agentName: "Social publishing agent", issue: "Failed post", count: 1, severity: "error" },
  { id: "att3", agentName: "Ticketing agent", issue: "Agent errors detected", count: 3, severity: "error" },
];

/* ─── Agent name → slug mapping ─── */
const agentSlugMap: Record<string, string> = {
  "Review response agent": "review-response",
  "Review generation agent": "review-generation",
  "Listing optimization agent": "listing-optimization",
  "Social publishing agent": "social-publishing",
  "Social engagement agent": "social-engagement",
  "Ticketing agent": "ticket-resolution",
};

/* ─── Status Badge ─── */
function StatusBadge({ status }: { status: "active" | "paused" | "error" }) {
  const config = {
    active: { label: "Active", bg: "bg-[#e8f5e9] dark:bg-[#1b3a2a]", text: "text-[#2e7d32] dark:text-[#66bb6a]" },
    paused: { label: "Paused", bg: "bg-[#fff3e0] dark:bg-[#3a2e1b]", text: "text-[#e65100] dark:text-[#ffb74d]" },
    error: { label: "Error", bg: "bg-[#fce4ec] dark:bg-[#3a1b1b]", text: "text-[#c62828] dark:text-[#ef5350]" },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] ${c.bg} ${c.text}`} style={{ fontWeight: 400 }}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "active" ? "bg-[#4caf50]" : status === "paused" ? "bg-[#ff9800]" : "bg-[#ef5350]"}`} />
      {c.label}
    </span>
  );
}

/* ─── Activity Status Icon ─── */
function ActivityIcon({ status }: { status: "success" | "warning" | "error" }) {
  if (status === "success") return <CheckCircle2 className="w-3.5 h-3.5 text-[#4caf50] shrink-0" />;
  if (status === "warning") return <Clock className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />;
  return <XCircle className="w-3.5 h-3.5 text-[#ef5350] shrink-0" />;
}

/* ═══════════════════════════════════════════
   Main Agents View
   ═══════════════════════════════════════════ */
export function AgentsView({ onNavigateToMonitor, onNavigateToDetail }: { onNavigateToMonitor: () => void; onNavigateToDetail: (slug: string) => void }) {
  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-[#13161b] transition-colors duration-300 rounded-tr-[8px]">
      <div className="px-6 py-6 space-y-5">

        {/* ─── Page Header ─── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] text-[#212121] dark:text-[#e4e4e4] tracking-[-0.4px]" style={{ fontWeight: 400 }}>
              Overview
            </h1>
            <p className="text-[13px] text-[#888] dark:text-[#6b7280] mt-0.5" style={{ fontWeight: 300 }}>
              Manage and monitor AI agents across your business
            </p>
          </div>
        </div>

        {/* ─── Summary Metrics ─── */}
        <div className="grid grid-cols-4 gap-4">
          {summaryMetrics.map(metric => (
            <div key={metric.label} className="bg-white dark:bg-[#1e2229] border border-[#E5E7EB] dark:border-[#2e3340] rounded-[12px] px-5 py-4 transition-colors">
              <div className="flex items-baseline gap-2 mb-1">
                <p className="text-[24px] text-[#212121] dark:text-[#e4e4e4] tracking-[-0.5px]" style={{ fontWeight: 400 }}>{metric.value}</p>
                <metric.icon className="w-4 h-4" style={{ color: metric.color }} />
              </div>
              <span className="text-[12px] text-[#888] dark:text-[#6b7280] tracking-[-0.24px]" style={{ fontWeight: 400 }}>{metric.label}</span>
              <p className="text-[11px] text-[#888] dark:text-[#6b7280] mt-0.5" style={{ fontWeight: 300 }}>{metric.change}</p>
            </div>
          ))}
        </div>

        {/* ─── Agent Directory ─── */}
        <div className="bg-white dark:bg-[#1e2229] border border-[#E5E7EB] dark:border-[#2e3340] rounded-[12px] px-6 py-5 transition-colors">
          <h2 className="text-[15px] text-[#212121] dark:text-[#e4e4e4] mb-4 tracking-[-0.3px]" style={{ fontWeight: 400 }}>Agent directory</h2>
          <div className="grid grid-cols-3 gap-4">
            {agents.map(agent => (
              <div key={agent.id} className="border border-[#E5E7EB] dark:border-[#2e3340] rounded-[8px] p-4 hover:border-[#c0c6d4] dark:hover:border-[#4d5568] transition-colors group">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-8 h-8 rounded-[8px] bg-[#f0f1f5] dark:bg-[#262b35] flex items-center justify-center">
                    <agent.icon className="w-4 h-4 text-[#2552ED]" />
                  </div>
                  <StatusBadge status={agent.status} />
                </div>
                <h3 className="text-[14px] text-[#212121] dark:text-[#e4e4e4] mb-1 tracking-[-0.28px]" style={{ fontWeight: 400 }}>{agent.name}</h3>
                <p className="text-[12px] text-[#888] dark:text-[#6b7280] mb-3 line-clamp-2" style={{ fontWeight: 300 }}>{agent.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[#888] dark:text-[#6b7280]" style={{ fontWeight: 300 }}>
                    {agent.status === "paused" ? "Paused" : `${agent.tasksToday} tasks today`}
                  </span>
                  <button
                    className="flex items-center gap-1 text-[12px] text-[#2552ED] hover:text-[#1E44CC] opacity-0 group-hover:opacity-100 transition-all"
                    style={{ fontWeight: 400 }}
                    onClick={() => {
                      const slug = agentSlugMap[agent.name];
                      if (slug) onNavigateToDetail(slug);
                    }}
                  >
                    Open
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Bottom Row: Recent Activity + Needs Attention ─── */}
        <div className="grid grid-cols-[1fr_380px] gap-5">
          {/* Recent Activity */}
          <div className="bg-white dark:bg-[#1e2229] border border-[#E5E7EB] dark:border-[#2e3340] rounded-[12px] px-6 py-5 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] text-[#212121] dark:text-[#e4e4e4] tracking-[-0.3px]" style={{ fontWeight: 400 }}>Recent activity</h2>
              <button
                onClick={onNavigateToMonitor}
                className="flex items-center gap-1 text-[12px] text-[#2552ED] hover:text-[#1E44CC] transition-colors"
                style={{ fontWeight: 400 }}
              >
                View all
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-0">
              {recentActivity.map((item, idx) => (
                <button key={item.id} className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-[6px] hover:bg-[#f8f9fa] dark:hover:bg-[#262b35] transition-colors text-left ${idx < recentActivity.length - 1 ? "border-b border-[#f0f0f0] dark:border-[#2e3340]" : ""}`}>
                  <span className="text-[11px] text-[#999] dark:text-[#6b7280] whitespace-nowrap mt-0.5 w-[60px] shrink-0" style={{ fontWeight: 300 }}>{item.time}</span>
                  <ActivityIcon status={item.status} />
                  <div className="min-w-0 flex-1">
                    <span className="text-[13px] text-[#2552ED] dark:text-[#6b9bff]" style={{ fontWeight: 400 }}>{item.agentName}</span>
                    <span className="text-[13px] text-[#555] dark:text-[#9ba2b0]" style={{ fontWeight: 300 }}>{" "}{item.action}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Needs Attention */}
          <div className="bg-white dark:bg-[#1e2229] border border-[#E5E7EB] dark:border-[#2e3340] rounded-[12px] px-6 py-5 transition-colors">
            <h2 className="text-[15px] text-[#212121] dark:text-[#e4e4e4] mb-4 tracking-[-0.3px]" style={{ fontWeight: 400 }}>Needs attention</h2>
            <div className="space-y-3">
              {needsAttention.map(item => (
                <button key={item.id} className="w-full flex items-start gap-3 p-3 rounded-[8px] border border-[#E5E7EB] dark:border-[#2e3340] hover:border-[#c0c6d4] dark:hover:border-[#4d5568] transition-colors text-left">
                  <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 ${item.severity === "error" ? "bg-[#fce4ec] dark:bg-[#3a1b1b]" : "bg-[#fff3e0] dark:bg-[#3a2e1b]"}`}>
                    <AlertTriangle className={`w-4 h-4 ${item.severity === "error" ? "text-[#ef5350]" : "text-[#F59E0B]"}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-[#212121] dark:text-[#e4e4e4] tracking-[-0.26px]" style={{ fontWeight: 400 }}>{item.agentName}</p>
                    <p className="text-[12px] text-[#888] dark:text-[#6b7280] mt-0.5" style={{ fontWeight: 300 }}>
                      {item.count} {item.issue}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#999] dark:text-[#6b7280] shrink-0 mt-1" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}