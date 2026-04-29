import { useState } from 'react';
import {
  Pencil, MessageSquare, Info, History, Copy, Trash2,
  Search, SlidersHorizontal, ChevronDown, MoreVertical
} from 'lucide-react';
import { POST_DATA } from '../data/postData';
import { APPROVAL_DATA } from '../data/approvalData';
import { PlatformIcons } from './PlatformIcons';

// ─── Status Badge ──────────────────────────────────────────────────────────────

const statusConfig = {
  awaiting: { bg: '#fef3d6', color: '#c69204', label: 'Awaiting approval' },
};

function StatusBadge({ status }: { status: 'awaiting' }) {
  const cfg = statusConfig[status];
  return (
    <span
      className="font-['Roboto:Regular',sans-serif] text-[12px] px-[8px] py-[3px] rounded-[4px] whitespace-nowrap shrink-0"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

// ─── Post Card ─────────────────────────────────────────────────────────────────

interface PostCardProps {
  postId: string;
  onOpenDetails: (postId: string) => void;
  onOpenActivity: (postId: string) => void;
}

function PostCard({ postId, onOpenDetails, onOpenActivity }: PostCardProps) {
  const post = POST_DATA[postId];
  const approval = APPROVAL_DATA[postId];
  if (!post || post.status !== 'awaiting') return null;

  const locationCount = approval?.locations?.length ?? 10;
  const creatorName = approval?.submittedBy ?? 'Creator name';
  const workflowName = approval?.workflowTitle ?? 'Workflow name';
  const displayDate = `${post.date.split(',')[1]?.trim() ?? post.date}, ${post.time}`;

  // Show multiple images layout
  const images = [post.image, post.image, post.image, post.image, post.image];

  return (
    <div
      className="bg-white dark:bg-[#1e2229] border border-[#eaeaea] dark:border-[#2e3340] rounded-[8px] overflow-hidden cursor-pointer hover:border-[#1976d2] dark:hover:border-[#5b9cf6] transition-colors"
      onClick={() => onOpenDetails(postId)}
    >
      <div className="px-[16px] pt-[16px] pb-[0px]">
        {/* Top row: channel icons + status badge */}
        <div className="flex items-center justify-between mb-[10px]">
          <PlatformIcons platforms={post.platforms.length > 1 ? post.platforms : ['facebook', 'instagram', 'linkedin']} />
          <StatusBadge status="awaiting" />
        </div>

        {/* Meta row: date • locations • creator • workflow */}
        <div className="flex items-center gap-[6px] mb-[12px] flex-wrap">
          <span className="font-['Roboto:Regular',sans-serif] text-[13px] text-[#555] dark:text-[#9ba2b0]">{displayDate}</span>
          <span className="text-[#aaa] dark:text-[#6b7a94] text-[12px]">•</span>
          <span className="font-['Roboto:Regular',sans-serif] text-[13px] text-[#555] dark:text-[#9ba2b0]">{locationCount} locations</span>
          <span className="text-[#aaa] dark:text-[#6b7a94] text-[12px]">•</span>
          <span className="font-['Roboto:Regular',sans-serif] text-[13px] text-[#555] dark:text-[#9ba2b0]">{creatorName}</span>
          <span className="text-[#aaa] dark:text-[#6b7a94] text-[12px]">•</span>
          <span className="font-['Roboto:Regular',sans-serif] text-[13px] text-[#555] dark:text-[#9ba2b0]">{workflowName}</span>
        </div>

        {/* Caption */}
        <p className="font-['Roboto:Regular',sans-serif] text-[14px] text-[#212121] dark:text-[#e4e8f0] leading-[22px] mb-[12px] line-clamp-3" style={{ fontVariationSettings: "'wdth' 100" }}>
          {post.caption}
        </p>

        {/* Hashtags */}
        <p className="font-['Roboto:Regular',sans-serif] text-[13px] text-[#1976d2] dark:text-[#5b9cf6] leading-[20px] mb-[14px] line-clamp-2">
          {post.hashtags}
        </p>

        {/* Images row */}
        <div className="flex gap-[8px] mb-[14px]">
          <div className="relative rounded-[6px] overflow-hidden shrink-0" style={{ width: 112, height: 112 }}>
            <img src={post.image} alt="Post" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div
        className="border-t border-[#eaeaea] dark:border-[#2e3340] px-[16px] py-[10px] flex items-center justify-between"
        onClick={(e) => e.stopPropagation()}
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

        {/* Right: Reject + Approve */}
        <div className="flex items-center gap-[8px]">
          <button className="h-[36px] px-[16px] rounded-[4px] border border-[#e5e9f0] dark:border-[#2e3340] bg-white dark:bg-[#252a35] font-['Roboto:Regular',sans-serif] text-[14px] text-[#212121] dark:text-[#e4e8f0] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340] transition-colors">
            Reject
          </button>
          <button className="h-[36px] px-[16px] rounded-[4px] bg-[#1976d2] font-['Roboto:Regular',sans-serif] text-[14px] text-white hover:bg-[#1565c0] transition-colors">
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main View ─────────────────────────────────────────────────────────────────

interface ApprovePostsViewProps {
  onOpenDetails: (postId: string) => void;
  onOpenActivity: (postId: string) => void;
}

export function ApprovePostsView({ onOpenDetails, onOpenActivity }: ApprovePostsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Posts that need approval
  const approvalPostIds = Object.keys(POST_DATA).filter(
    id => POST_DATA[id].status === 'awaiting'
  );

  const filtered = approvalPostIds.filter(id => {
    if (!searchQuery) return true;
    const post = POST_DATA[id];
    return post.caption.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full transition-colors duration-300">
      {/* Page header */}
      <div className="border-b border-[#eaeaea] dark:border-[#2e3340] px-[24px] h-[64px] flex items-center justify-between shrink-0 bg-white dark:bg-[#1e2229]">
        <h1 className="font-['Roboto:Regular',sans-serif] font-normal text-[20px] text-[#212121] dark:text-[#e4e8f0] tracking-[-0.4px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Approve posts
        </h1>
        <div className="flex items-center gap-[8px]">
          {/* Search */}
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
          {/* Sort */}
          <button className="h-[36px] px-[12px] flex items-center gap-[6px] rounded-[4px] border border-[#e5e9f0] dark:border-[#2e3340] bg-white dark:bg-[#252a35] font-['Roboto:Regular',sans-serif] text-[14px] text-[#212121] dark:text-[#e4e8f0] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340]">
            Newest <ChevronDown size={16} />
          </button>
          {/* Filter */}
          <button className="h-[36px] w-[36px] flex items-center justify-center rounded-[4px] border border-[#e5e9f0] dark:border-[#2e3340] bg-white dark:bg-[#252a35] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340]">
            <SlidersHorizontal size={16} className="text-[#555] dark:text-[#9ba2b0]" />
          </button>
          {/* More */}
          <button className="h-[36px] w-[36px] flex items-center justify-center rounded-[4px] border border-[#e5e9f0] dark:border-[#2e3340] bg-white dark:bg-[#252a35] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340]">
            <MoreVertical size={16} className="text-[#555] dark:text-[#9ba2b0]" />
          </button>
        </div>
      </div>

      {/* Posts list */}
      <div className="flex-1 overflow-y-auto px-[24px] py-[16px] bg-[#fafafa] dark:bg-[#181b22]">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] gap-[8px]">
            <p className="font-['Roboto:Regular',sans-serif] text-[16px] text-[#555] dark:text-[#9ba2b0]">No posts awaiting approval</p>
            <p className="font-['Roboto:Regular',sans-serif] text-[13px] text-[#aaa] dark:text-[#6b7a94]">All caught up! Check back later.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-[16px] max-w-[700px] mx-auto">
            {filtered.map(id => (
              <PostCard
                key={id}
                postId={id}
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
