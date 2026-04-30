import { useState } from "react";
import {
  Pencil, MessageSquare, Info, History, Copy, Trash2,
  Search, ChevronDown, MoreVertical, AlertCircle, Clock, RefreshCw
} from "lucide-react";
import { POST_DATA } from "../data/postData";
import { APPROVAL_DATA } from "../data/approvalData";
import { PlatformIcons } from "./PlatformIcons";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  MAIN_VIEW_HEADER_BAND_CLASS,
  MAIN_VIEW_PRIMARY_HEADING_CLASS,
} from "./layout/mainViewTitleClasses";

// ─── Status Badge ──────────────────────────────────────────────────────────────

type CardStatus = "rejected" | "expired";

const statusConfig: Record<CardStatus, { label: string; icon: React.ReactNode }> = {
  rejected: { label: "Rejected",
    icon: <AlertCircle size={13} className="inline mr-[3px] mb-[1px]" /> },
  expired:  { label: "Expired",
    icon: <Clock size={13} className="inline mr-[3px] mb-[1px]" /> },
};

function StatusBadge({ status }: { status: CardStatus }) {
  const cfg = statusConfig[status];
  return (
    <Badge variant={status === "rejected" ? "destructive" : "outline"}>{cfg.icon}{cfg.label}</Badge>
  );
}

// ─── Rejection Banner ──────────────────────────────────────────────────────────

function RejectionBanner({ reason, rejectedBy }: { reason: string; rejectedBy?: string }) {
  return (
    <div className="mb-3 rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3">
      <div className="flex items-start gap-[8px]">
        <AlertCircle size={16} className="mt-[1px] shrink-0 text-destructive" />
        <div>
          {rejectedBy && (
            <p className="mb-0.5 text-xs text-destructive">
              Rejected by {rejectedBy}
            </p>
          )}
          <p className="text-sm leading-5 text-destructive">
            {reason}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Expired Banner ────────────────────────────────────────────────────────────

function ExpiredBanner() {
  return (
    <div className="mb-3 rounded-md border border-border bg-muted/30 px-4 py-3">
      <div className="flex items-start gap-[8px]">
        <Clock size={16} className="mt-[1px] shrink-0 text-muted-foreground" />
        <div>
          <p className="mb-0.5 text-xs text-foreground">
            Approval window expired
          </p>
          <p className="text-sm leading-5 text-muted-foreground">
            The scheduled time passed without completing the approval process. Edit and resubmit to publish this post.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Post Card ─────────────────────────────────────────────────────────────────

interface RejectedPostCardProps {
  postId: string;
  cardStatus: CardStatus;
  onOpenDetails: (postId: string) => void;
  onOpenActivity: (postId: string) => void;
}

function RejectedPostCard({ postId, cardStatus, onOpenDetails, onOpenActivity }: RejectedPostCardProps) {
  const post = POST_DATA[postId];
  const approval = APPROVAL_DATA[postId];
  if (!post) return null;

  const locationCount = approval?.locations?.length ?? 3;
  const displayDate = `${post.date.split(',')[1]?.trim() ?? post.date}, ${post.time}`;

  // Find primary rejection reason
  let rejectionReason = '';
  let rejectedBy = '';
  if (approval) {
    for (const step of approval.steps) {
      for (const approver of step.approvers) {
        if (approver.action === 'rejected' && approver.rejectionReason) {
          rejectionReason = approver.rejectionReason;
          rejectedBy = approver.isCurrentUser ? 'You' : approver.name;
          break;
        }
      }
      if (rejectionReason) break;
    }
    // Fallback to location rejection
    if (!rejectionReason) {
      const rejectedLoc = approval.locations.find(l => l.status === 'rejected' && l.rejectionReason);
      if (rejectedLoc) {
        rejectionReason = rejectedLoc.rejectionReason ?? '';
        rejectedBy = rejectedLoc.actionedBy ?? '';
      }
    }
  }

  return (
    <div
      className="cursor-pointer overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary"
      onClick={() => onOpenDetails(postId)}
    >
      <div className="px-[16px] pt-[16px] pb-[0px]">
        {/* Top row: channel icons + status badge */}
        <div className="flex items-center justify-between mb-[10px]">
          <PlatformIcons platforms={post.platforms.length > 1 ? post.platforms : ['facebook', 'instagram', 'linkedin']} />
          <StatusBadge status={cardStatus} />
        </div>

        {/* Meta row */}
        <div className="mb-3 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          <span>{displayDate}</span>
          <span aria-hidden>·</span>
          <span>{locationCount} locations</span>
          <span aria-hidden>·</span>
          <span>{approval?.submittedBy ?? "Creator name"}</span>
          <span aria-hidden>·</span>
          <span>{approval?.workflowTitle ?? "Workflow name"}</span>
        </div>

        {/* Rejection / Expired banner */}
        {cardStatus === 'rejected' && rejectionReason && (
          <RejectionBanner reason={rejectionReason} rejectedBy={rejectedBy} />
        )}
        {cardStatus === 'expired' && <ExpiredBanner />}

        {/* Caption */}
        <p className="mb-3 line-clamp-2 text-sm leading-6 text-foreground">
          {post.caption}
        </p>

        {/* Hashtags */}
        <p className="mb-4 line-clamp-1 text-sm text-primary">
          {post.hashtags}
        </p>

        {/* Image */}
        <div className="flex gap-[8px] mb-[14px]">
          <div className="relative rounded-[6px] overflow-hidden shrink-0" style={{ width: 112, height: 112 }}>
            <img src={post.image} alt="Post" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3"
        onClick={e => e.stopPropagation()}
      >
        {/* Left icons */}
        <div className="flex items-center gap-3 text-muted-foreground">
          <button className="p-0.5 transition-colors hover:text-foreground" title="Edit">
            <Pencil size={18} />
          </button>
          <button className="p-0.5 transition-colors hover:text-foreground" title="Comment">
            <MessageSquare size={18} />
          </button>
          <button className="p-0.5 transition-colors hover:text-foreground" title="Info">
            <Info size={18} />
          </button>
          <button
            className="p-0.5 transition-colors hover:text-primary"
            title="Activity"
            onClick={() => onOpenActivity(postId)}
          >
            <History size={18} />
          </button>
          <button className="p-0.5 transition-colors hover:text-foreground" title="Copy">
            <Copy size={18} />
          </button>
          <button className="p-0.5 transition-colors hover:text-destructive" title="Delete">
            <Trash2 size={18} />
          </button>
        </div>

        {/* Right: Edit & Resubmit */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Pencil size={14} /> Edit
          </Button>
          <Button size="sm" className="gap-1.5">
            <RefreshCw size={14} /> Resubmit
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Mock Expired Posts ────────────────────────────────────────────────────────
// These are additional expired posts (awaiting posts that timed out)
const EXPIRED_POST_IDS = ["post-7"];

// ─── Main View ─────────────────────────────────────────────────────────────────

interface RejectedPostsViewProps {
  onOpenDetails: (postId: string) => void;
  onOpenActivity: (postId: string) => void;
}

type FilterTab = "all" | "rejected" | "expired";

export function RejectedPostsView({ onOpenDetails, onOpenActivity }: RejectedPostsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  // Rejected posts from data
  const rejectedPostIds = Object.keys(POST_DATA).filter(
    id => POST_DATA[id].status === "rejected"
  );

  // All cards: rejected + expired
  type CardEntry = { postId: string; cardStatus: CardStatus };
  const allCards: CardEntry[] = [
    ...rejectedPostIds.map(id => ({ postId: id, cardStatus: "rejected" as CardStatus })),
    ...EXPIRED_POST_IDS.map(id => ({ postId: id, cardStatus: "expired" as CardStatus })),
  ];

  const filtered = allCards.filter(({ postId, cardStatus }) => {
    if (activeTab !== 'all' && cardStatus !== activeTab) return false;
    if (searchQuery) {
      const post = POST_DATA[postId];
      return post?.caption?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const tabs: { id: FilterTab; label: string; count: number }[] = [
    { id: "all", label: "All", count: allCards.length },
    { id: "rejected", label: "Rejected", count: rejectedPostIds.length },
    { id: "expired", label: "Expired", count: EXPIRED_POST_IDS.length },
  ];

  return (
    <div className="flex flex-col h-full transition-colors duration-300">
      {/* Page header */}
      <div className={`${MAIN_VIEW_HEADER_BAND_CLASS} border-b border-border bg-background`}>
        <h1 className={MAIN_VIEW_PRIMARY_HEADING_CLASS}>
          Fix rejected posts
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-[200px] rounded-md border border-input bg-background pl-8 pr-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </div>
          <Button variant="outline" size="sm">Newest <ChevronDown size={16} /></Button>
          <Button variant="outline" size="icon" className="h-9 w-9" aria-label="More"><MoreVertical size={16} /></Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="shrink-0 border-b border-border bg-background px-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`-mb-px flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[11px] ${
                activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Posts list */}
      <div className="flex-1 overflow-y-auto bg-muted/20 px-6 py-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] gap-[8px]">
            <p className="text-base text-muted-foreground">No posts here</p>
            <p className="text-xs text-muted-foreground">All posts are approved and on track.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-[16px] max-w-[700px] mx-auto">
            {filtered.map(({ postId, cardStatus }) => (
              <RejectedPostCard
                key={postId}
                postId={postId}
                cardStatus={cardStatus}
                onOpenDetails={onOpenDetails}
                onOpenActivity={onOpenActivity}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
