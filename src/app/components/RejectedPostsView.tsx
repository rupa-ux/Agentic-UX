import { useState } from 'react';
import {
  Pencil, MessageSquare, Info, History, Copy, Trash2,
  Search, ChevronDown, MoreVertical, AlertCircle, Clock, RefreshCw
} from 'lucide-react';
import { POST_DATA } from '../data/postData';
import { APPROVAL_DATA } from '../data/approvalData';
import { PlatformIcons } from './PlatformIcons';

// ─── Status Badge ──────────────────────────────────────────────────────────────

type CardStatus = 'rejected' | 'expired';

const statusConfig: Record<CardStatus, { bg: string; color: string; label: string; icon: React.ReactNode }> = {
  rejected: { bg: '#fef6f5', color: '#de1b0c', label: 'Rejected',
    icon: <AlertCircle size={13} className="inline mr-[3px] mb-[1px]" /> },
  expired:  { bg: '#f0f0f0', color: '#555',    label: 'Expired',
    icon: <Clock size={13} className="inline mr-[3px] mb-[1px]" /> },
};

function StatusBadge({ status }: { status: CardStatus }) {
  const cfg = statusConfig[status];
  return (
    <span
      className="font-['Roboto:Regular',sans-serif] text-[12px] px-[8px] py-[3px] rounded-[4px] whitespace-nowrap shrink-0 flex items-center gap-[3px]"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {cfg.icon}{cfg.label}
    </span>
  );
}

// ─── Rejection Banner ──────────────────────────────────────────────────────────

function RejectionBanner({ reason, rejectedBy }: { reason: string; rejectedBy?: string }) {
  return (
    <div className="bg-[#fef6f5] dark:bg-[#2d1c1a] border border-[#f5c6c2] dark:border-[#5c2a24] rounded-[6px] px-[14px] py-[10px] mb-[12px]">
      <div className="flex items-start gap-[8px]">
        <AlertCircle size={16} className="text-[#de1b0c] shrink-0 mt-[1px]" />
        <div>
          {rejectedBy && (
            <p className="font-['Roboto:Medium',sans-serif] text-[12px] text-[#de1b0c] mb-[2px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              Rejected by {rejectedBy}
            </p>
          )}
          <p className="font-['Roboto:Regular',sans-serif] text-[13px] text-[#de1b0c] dark:text-[#f08080] leading-[18px]" style={{ fontVariationSettings: "'wdth' 100" }}>
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
    <div className="bg-[#f5f5f5] dark:bg-[#252a35] border border-[#e0e0e0] dark:border-[#2e3340] rounded-[6px] px-[14px] py-[10px] mb-[12px]">
      <div className="flex items-start gap-[8px]">
        <Clock size={16} className="text-[#777] dark:text-[#6b7a94] shrink-0 mt-[1px]" />
        <div>
          <p className="font-['Roboto:Medium',sans-serif] text-[12px] text-[#555] dark:text-[#9ba2b0] mb-[2px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Approval window expired
          </p>
          <p className="font-['Roboto:Regular',sans-serif] text-[13px] text-[#777] dark:text-[#6b7a94] leading-[18px]" style={{ fontVariationSettings: "'wdth' 100" }}>
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
      className="bg-white dark:bg-[#1e2229] border border-[#eaeaea] dark:border-[#2e3340] rounded-[8px] overflow-hidden cursor-pointer hover:border-[#1976d2] dark:hover:border-[#5b9cf6] transition-colors"
      onClick={() => onOpenDetails(postId)}
    >
      <div className="px-[16px] pt-[16px] pb-[0px]">
        {/* Top row: channel icons + status badge */}
        <div className="flex items-center justify-between mb-[10px]">
          <PlatformIcons platforms={post.platforms.length > 1 ? post.platforms : ['facebook', 'instagram', 'linkedin']} />
          <StatusBadge status={cardStatus} />
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-[6px] mb-[12px] flex-wrap">
          <span className="font-['Roboto:Regular',sans-serif] text-[13px] text-[#555] dark:text-[#9ba2b0]">{displayDate}</span>
          <span className="text-[#aaa] dark:text-[#6b7a94] text-[12px]">•</span>
          <span className="font-['Roboto:Regular',sans-serif] text-[13px] text-[#555] dark:text-[#9ba2b0]">{locationCount} locations</span>
          <span className="text-[#aaa] dark:text-[#6b7a94] text-[12px]">•</span>
          <span className="font-['Roboto:Regular',sans-serif] text-[13px] text-[#555] dark:text-[#9ba2b0]">{approval?.submittedBy ?? 'Creator name'}</span>
          <span className="text-[#aaa] dark:text-[#6b7a94] text-[12px]">•</span>
          <span className="font-['Roboto:Regular',sans-serif] text-[13px] text-[#555] dark:text-[#9ba2b0]">{approval?.workflowTitle ?? 'Workflow name'}</span>
        </div>

        {/* Rejection / Expired banner */}
        {cardStatus === 'rejected' && rejectionReason && (
          <RejectionBanner reason={rejectionReason} rejectedBy={rejectedBy} />
        )}
        {cardStatus === 'expired' && <ExpiredBanner />}

        {/* Caption */}
        <p className="font-['Roboto:Regular',sans-serif] text-[14px] text-[#212121] dark:text-[#e4e8f0] leading-[22px] mb-[12px] line-clamp-2" style={{ fontVariationSettings: "'wdth' 100" }}>
          {post.caption}
        </p>

        {/* Hashtags */}
        <p className="font-['Roboto:Regular',sans-serif] text-[13px] text-[#1976d2] dark:text-[#5b9cf6] leading-[20px] mb-[14px] line-clamp-1">
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
        className="border-t border-[#eaeaea] dark:border-[#2e3340] px-[16px] py-[10px] flex items-center justify-between"
        onClick={e => e.stopPropagation()}
      >
        {/* Left icons */}
        <div className="flex items-center gap-[12px]">
          <button className="text-[#555] dark:text-[#9ba2b0] hover:text-[#212121] dark:hover:text-[#e4e8f0] p-[2px]" title="Edit">
            <Pencil size={18} />
          </button>
          <button className="text-[#555] dark:text-[#9ba2b0] hover:text-[#212121] dark:hover:text-[#e4e8f0] p-[2px]" title="Comment">
            <MessageSquare size={18} />
          </button>
          <button className="text-[#555] dark:text-[#9ba2b0] hover:text-[#212121] dark:hover:text-[#e4e8f0] p-[2px]" title="Info">
            <Info size={18} />
          </button>
          <button
            className="text-[#555] dark:text-[#9ba2b0] hover:text-[#1976d2] dark:hover:text-[#5b9cf6] p-[2px]"
            title="Activity"
            onClick={() => onOpenActivity(postId)}
          >
            <History size={18} />
          </button>
          <button className="text-[#555] dark:text-[#9ba2b0] hover:text-[#212121] dark:hover:text-[#e4e8f0] p-[2px]" title="Copy">
            <Copy size={18} />
          </button>
          <button className="text-[#555] dark:text-[#9ba2b0] hover:text-[#de1b0c] p-[2px]" title="Delete">
            <Trash2 size={18} />
          </button>
        </div>

        {/* Right: Edit & Resubmit */}
        <div className="flex items-center gap-[8px]">
          <button className="h-[36px] px-[16px] flex items-center gap-[6px] rounded-[4px] border border-[#e5e9f0] dark:border-[#2e3340] bg-white dark:bg-[#252a35] font-['Roboto:Regular',sans-serif] text-[14px] text-[#212121] dark:text-[#e4e8f0] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340] transition-colors">
            <Pencil size={14} /> Edit
          </button>
          <button className="h-[36px] px-[16px] flex items-center gap-[6px] rounded-[4px] bg-[#1976d2] font-['Roboto:Regular',sans-serif] text-[14px] text-white hover:bg-[#1565c0] transition-colors">
            <RefreshCw size={14} /> Resubmit
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Mock Expired Posts ────────────────────────────────────────────────────────
// These are additional expired posts (awaiting posts that timed out)
const EXPIRED_POST_IDS = ['post-7']; // Post 7 is scheduled — we'll show it as expired for demo

// ─── Main View ─────────────────────────────────────────────────────────────────

interface RejectedPostsViewProps {
  onOpenDetails: (postId: string) => void;
  onOpenActivity: (postId: string) => void;
}

type FilterTab = 'all' | 'rejected' | 'expired';

export function RejectedPostsView({ onOpenDetails, onOpenActivity }: RejectedPostsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  // Rejected posts from data
  const rejectedPostIds = Object.keys(POST_DATA).filter(
    id => POST_DATA[id].status === 'rejected'
  );

  // All cards: rejected + expired
  type CardEntry = { postId: string; cardStatus: CardStatus };
  const allCards: CardEntry[] = [
    ...rejectedPostIds.map(id => ({ postId: id, cardStatus: 'rejected' as CardStatus })),
    ...EXPIRED_POST_IDS.map(id => ({ postId: id, cardStatus: 'expired' as CardStatus })),
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
    { id: 'all', label: 'All', count: allCards.length },
    { id: 'rejected', label: 'Rejected', count: rejectedPostIds.length },
    { id: 'expired', label: 'Expired', count: EXPIRED_POST_IDS.length },
  ];

  return (
    <div className="flex flex-col h-full transition-colors duration-300">
      {/* Page header */}
      <div className="border-b border-[#eaeaea] dark:border-[#2e3340] px-[24px] h-[64px] flex items-center justify-between shrink-0 bg-white dark:bg-[#1e2229]">
        <h1 className="font-['Roboto:Regular',sans-serif] font-normal text-[20px] text-[#212121] dark:text-[#e4e8f0] tracking-[-0.4px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Fix rejected posts
        </h1>
        <div className="flex items-center gap-[8px]">
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-[10px] text-[#aaa] dark:text-[#6b7a94]" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-[36px] pl-[32px] pr-[12px] rounded-[4px] border border-[#e5e9f0] dark:border-[#2e3340] bg-white dark:bg-[#252a35] font-['Roboto:Regular',sans-serif] text-[14px] text-[#212121] dark:text-[#e4e8f0] outline-none focus:border-[#1976d2] dark:focus:border-[#5b9cf6] w-[200px] placeholder:text-[#aaa] dark:placeholder:text-[#6b7a94]"
            />
          </div>
          <button className="h-[36px] px-[12px] flex items-center gap-[6px] rounded-[4px] border border-[#e5e9f0] dark:border-[#2e3340] bg-white dark:bg-[#252a35] font-['Roboto:Regular',sans-serif] text-[14px] text-[#212121] dark:text-[#e4e8f0] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340]">
            Newest <ChevronDown size={16} />
          </button>
          <button className="h-[36px] w-[36px] flex items-center justify-center rounded-[4px] border border-[#e5e9f0] dark:border-[#2e3340] bg-white dark:bg-[#252a35] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340]">
            <MoreVertical size={16} className="text-[#555] dark:text-[#9ba2b0]" />
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-[0px] border-b border-[#eaeaea] dark:border-[#2e3340] px-[24px] bg-white dark:bg-[#1e2229] shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`px-[16px] py-[12px] font-['Roboto:Regular',sans-serif] text-[14px] border-b-2 -mb-[1px] flex items-center gap-[6px] transition-colors ${
              activeTab === tab.id
                ? 'border-[#1976d2] dark:border-[#5b9cf6] text-[#1976d2] dark:text-[#5b9cf6]'
                : 'border-transparent text-[#555] dark:text-[#9ba2b0] hover:text-[#212121] dark:hover:text-[#e4e8f0]'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            <span
              className={`text-[11px] px-[6px] py-[1px] rounded-[10px] ${
                activeTab === tab.id ? 'bg-[#1976d2] dark:bg-[#5b9cf6] text-white' : 'bg-[#eaeaea] dark:bg-[#252a35] text-[#555] dark:text-[#9ba2b0]'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Posts list */}
      <div className="flex-1 overflow-y-auto px-[24px] py-[16px] bg-[#fafafa] dark:bg-[#181b22]">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] gap-[8px]">
            <p className="font-['Roboto:Regular',sans-serif] text-[16px] text-[#555] dark:text-[#9ba2b0]">No posts here</p>
            <p className="font-['Roboto:Regular',sans-serif] text-[13px] text-[#aaa] dark:text-[#6b7a94]">All posts are approved and on track!</p>
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
