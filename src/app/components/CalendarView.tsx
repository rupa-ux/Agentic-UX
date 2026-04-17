import { POST_DATA } from '../data/postData';
import { useState, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Filter, MoreVertical, Sparkles,
  Pencil, Copy, Tag, Trash2, CalendarDays, Send,
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { SocialPostPlatformIcon } from './social/socialPostShared';
import { cn } from './ui/utils';

interface CalendarViewProps {
  onPostClick: (postId: string) => void;
  onActivityClick: (postId: string) => void;
  onViewExpiredPosts?: () => void;
  highlightedPostId?: string | null;
  toastMessage?: string | null;
}

type StatusType = 'published' | 'draft' | 'rejected' | 'awaiting' | 'scheduled' | 'ai-suggested' | 'expired';
type ActionType = 'simple' | 'workflow';
type CalendarPlatform = 'facebook' | 'instagram' | 'linkedin';

interface PostCardProps {
  postId: string;
  status: StatusType;
  platforms: CalendarPlatform[];
  time: string;
  caption: string;
  image: string;
  actionType: ActionType;
  hasOuterBorder?: boolean;
  locationCount?: number;
  expiryDate?: string;
  highlighted?: boolean;
  onActivityClick: (postId: string) => void;
  onPostClick: (postId: string) => void;
}

const STATUS_BADGE_VARIANT: Record<StatusType, 'success' | 'secondary' | 'destructive' | 'warning' | 'default' | 'purple'> = {
  published:      'success',
  draft:          'secondary',
  rejected:       'destructive',
  awaiting:       'warning',
  scheduled:      'default',
  'ai-suggested': 'purple',
  expired:        'secondary',
};

const statusLabels: Record<StatusType, string> = {
  published:      'Published',
  draft:          'Draft',
  rejected:       'Rejected',
  awaiting:       'Awaiting approval',
  scheduled:      'Scheduled',
  'ai-suggested': 'AI-suggested',
  expired:        'Expired',
};

function SimpleActionIcons({ postId, onActivityClick, showActivity }: {
  postId?: string;
  onActivityClick?: (id: string) => void;
  showActivity?: boolean;
}) {
  return (
    <div className="flex gap-0.5 items-center -ml-1">
      <Button variant="ghost" size="iconXs" className="text-muted-foreground hover:text-foreground" onClick={(e) => e.stopPropagation()}>
        <Pencil className="size-3.5" />
      </Button>
      <Button variant="ghost" size="iconXs" className="text-muted-foreground hover:text-foreground" onClick={(e) => e.stopPropagation()}>
        <Copy className="size-3.5" />
      </Button>
      <Button variant="ghost" size="iconXs" className="text-muted-foreground hover:text-foreground" onClick={(e) => e.stopPropagation()}>
        <Tag className="size-3.5" />
      </Button>
      <Button variant="ghost" size="iconXs" className="text-muted-foreground hover:text-foreground" onClick={(e) => e.stopPropagation()}>
        <Trash2 className="size-3.5" />
      </Button>
      {showActivity && postId && onActivityClick && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="iconXs" className="text-muted-foreground hover:text-foreground" onClick={(e) => e.stopPropagation()}>
              <MoreVertical className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onActivityClick(postId); }}>
              Activity
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

function WorkflowActionIcons({ postId, onActivityClick }: {
  postId: string;
  onActivityClick: (id: string) => void;
}) {
  return (
    <div className="flex gap-0.5 items-center -ml-1">
      <Button variant="ghost" size="iconXs" className="text-muted-foreground hover:text-foreground" onClick={(e) => e.stopPropagation()}>
        <Pencil className="size-3.5" />
      </Button>
      <Button variant="ghost" size="iconXs" className="text-muted-foreground hover:text-foreground" onClick={(e) => e.stopPropagation()}>
        <CalendarDays className="size-3.5" />
      </Button>
      <Button variant="ghost" size="iconXs" className="text-muted-foreground hover:text-foreground" onClick={(e) => e.stopPropagation()}>
        <Send className="size-3.5" />
      </Button>
      <Button variant="ghost" size="iconXs" className="text-muted-foreground hover:text-foreground" onClick={(e) => e.stopPropagation()}>
        <Tag className="size-3.5" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="iconXs" className="text-muted-foreground hover:text-foreground" onClick={(e) => e.stopPropagation()}>
            <MoreVertical className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onActivityClick(postId); }}>
            Activity
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function PostCard({ postId, status, platforms, time, caption, image, actionType, hasOuterBorder = false, locationCount, expiryDate, highlighted = false, onActivityClick, onPostClick }: PostCardProps) {
  const isExpired = status === 'expired';

  const fmtExpiry = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={cn(
        'relative rounded-lg shrink-0 w-full cursor-pointer overflow-hidden bg-card border transition-colors duration-300',
        highlighted
          ? 'border-2 border-primary shadow-[0_0_0_3px_rgba(25,118,210,0.15)]'
          : hasOuterBorder
            ? 'border-border/60'
            : 'border-border',
        isExpired && 'opacity-60'
      )}
      onClick={() => onPostClick(postId)}
    >
      <div className="flex flex-col gap-2 items-start p-2 w-full">

        {/* Status chip + page count */}
        <div className="flex items-center justify-between w-full gap-2">
          <Badge variant={STATUS_BADGE_VARIANT[status]}>{statusLabels[status]}</Badge>
          {locationCount !== undefined && (
            <span className="text-xs text-muted-foreground shrink-0">{locationCount} pages</span>
          )}
        </div>

        {/* Platform chips + time */}
        <div className="flex flex-wrap gap-1 items-center">
          {platforms.map((platform) => (
            <span
              key={platform}
              className="inline-flex items-center justify-center rounded border border-border bg-background p-0.5"
            >
              <SocialPostPlatformIcon platform={platform} size={20} />
            </span>
          ))}
          <span className="text-xs text-muted-foreground ml-0.5">{time}</span>
        </div>

        {/* Expiry row */}
        {expiryDate && (
          <p className={cn('text-xs', isExpired ? 'text-muted-foreground' : 'text-[#c69204] dark:text-[#f0b429]')}>
            {isExpired ? 'Expired' : 'Expires'} {fmtExpiry(expiryDate)}
          </p>
        )}

        {/* Caption */}
        <p className="text-xs text-foreground leading-snug line-clamp-2 w-full">{caption}</p>

        {/* Image */}
        <div className="h-[110px] relative rounded shrink-0 w-full overflow-hidden">
          <img alt="" className="absolute inset-0 w-full h-full object-cover" src={image} />
        </div>

        {/* Action icons */}
        {actionType === 'simple' ? (
          <SimpleActionIcons postId={postId} onActivityClick={onActivityClick} showActivity={status !== 'ai-suggested'} />
        ) : (
          <WorkflowActionIcons postId={postId} onActivityClick={onActivityClick} />
        )}
      </div>
    </div>
  );
}

const DAY_HEADERS = [
  { label: 'Sun 1', isToday: false },
  { label: 'Mon 2', isToday: false },
  { label: 'Tue 3', isToday: false },
  { label: 'Wed', isToday: true, date: '4' },
  { label: 'Thu 5', isToday: false },
  { label: 'Fri 6', isToday: false },
  { label: 'Sat 7', isToday: false },
];

export function CalendarView({ onPostClick, onActivityClick, onViewExpiredPosts, highlightedPostId, toastMessage }: CalendarViewProps) {
  const [createdPostId, setCreatedPostId] = useState<string | null>(null);
  const [visibleToast, setVisibleToast] = useState<string | null>(null);

  useEffect(() => {
    if (highlightedPostId?.startsWith('post-new')) setCreatedPostId(highlightedPostId);
  }, [highlightedPostId]);

  useEffect(() => {
    if (toastMessage) {
      setVisibleToast(toastMessage);
      setTimeout(() => setVisibleToast(null), 4000);
    }
  }, [toastMessage]);

  const newPostId = createdPostId;
  const newPost = newPostId ? POST_DATA[newPostId] : null;

  return (
    <div className="bg-background relative w-full overflow-auto">

      {/* Toast */}
      {visibleToast && (
        <div
          className="fixed top-[72px] left-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-md shadow-lg bg-background border border-border pointer-events-none"
          style={{ transform: 'translateX(-50%)', minWidth: 280 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <circle cx="12" cy="12" r="10" fill="#4caf50" />
            <path d="M7 12.5l3.5 3.5L17 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-sm text-foreground">{visibleToast}</p>
        </div>
      )}

      {/* Calendar Header */}
      <div className="bg-background h-16 shrink-0 w-full sticky top-0 z-10 border-b border-border">
        <div className="flex items-center h-full px-6 gap-2">

          {/* Month navigation */}
          <div className="flex flex-1 items-center gap-1">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="size-5" />
            </Button>
            <p className="text-lg tracking-tight text-foreground whitespace-nowrap px-1">March 2026</p>
            <Button variant="ghost" size="icon">
              <ChevronRight className="size-5" />
            </Button>
            <Button variant="ghost" className="text-primary text-sm px-3">Today</Button>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* List/Week/Month toggle */}
            <div className="flex items-center gap-1 h-9 px-2 py-1.5 rounded border border-border">
              {['List', 'Week', 'Month'].map((view) => (
                <div
                  key={view}
                  className={cn(
                    'flex h-6 items-center justify-center px-2 rounded text-sm text-foreground cursor-pointer whitespace-nowrap',
                    view === 'Week' && 'bg-accent'
                  )}
                >
                  {view}
                </div>
              ))}
            </div>

            {/* AI button */}
            <Button variant="outline" size="icon">
              <Sparkles className="size-5 text-[#6834B7]" />
            </Button>

            {/* More dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewExpiredPosts?.()}>
                  View expired posts
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filter */}
            <Button variant="outline" size="icon">
              <Filter className="size-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Day Headers */}
      <div className="flex h-[45px] shrink-0 w-full border-b border-border">
        {DAY_HEADERS.map((day) => (
          <div key={day.label} className="flex flex-1 items-center justify-center bg-background">
            {day.isToday ? (
              <div className="flex items-center gap-1">
                <span className="text-xs text-primary">Wed</span>
                <div className="bg-primary rounded-full size-[19px] flex items-center justify-center">
                  <span className="text-[11px] text-primary-foreground leading-none">{day.date}</span>
                </div>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">{day.label}</span>
            )}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex w-full">

        {/* Sun 1 */}
        <div className="bg-muted/20 flex-1 min-h-[939px] relative border-r border-border">
          <div className="flex flex-col gap-2.5 p-2.5">
            <PostCard postId="post-3" status="published" platforms={POST_DATA['post-3'].platforms} time="9:00 AM" caption={POST_DATA['post-3'].caption} image={POST_DATA['post-3'].image} actionType="simple" onActivityClick={onActivityClick} onPostClick={onPostClick} />
          </div>
        </div>

        {/* Mon 2 */}
        <div className="bg-muted/20 flex-1 min-h-[939px] relative border-r border-border">
          <div className="flex flex-col gap-2.5 p-2.5">
            <PostCard postId="post-1" status="published" platforms={POST_DATA['post-1'].platforms} time="10:00 AM" caption={POST_DATA['post-1'].caption} image={POST_DATA['post-1'].image} actionType="simple" onActivityClick={onActivityClick} onPostClick={onPostClick} />
          </div>
        </div>

        {/* Tue 3 */}
        <div className="bg-muted/20 flex-1 min-h-[939px] relative border-r border-border">
          <div className="flex flex-col gap-2.5 p-2.5">
            <PostCard postId="post-2" status="draft" platforms={POST_DATA['post-2'].platforms} time="10:00 AM" caption={POST_DATA['post-2'].caption} image={POST_DATA['post-2'].image} actionType="simple" onActivityClick={onActivityClick} onPostClick={onPostClick} />
            <PostCard postId="post-3" status="rejected" platforms={POST_DATA['post-3'].platforms} time="10:00 AM" caption={POST_DATA['post-3'].caption} image={POST_DATA['post-3'].image} actionType="simple" onActivityClick={onActivityClick} onPostClick={onPostClick} />
          </div>
        </div>

        {/* Wed 4 — today */}
        <div className="bg-background flex-1 min-h-[976px] relative border-r border-border">
          <div className="flex flex-col gap-2.5 p-2.5">
            <PostCard postId="post-4" status="awaiting" platforms={POST_DATA['post-4'].platforms} time="10:00 AM" caption={POST_DATA['post-4'].caption} image={POST_DATA['post-4'].image} actionType="workflow" hasOuterBorder locationCount={8} onActivityClick={onActivityClick} onPostClick={onPostClick} />
            <PostCard postId="post-5" status="awaiting" platforms={POST_DATA['post-5'].platforms} time="10:00 AM" caption={POST_DATA['post-5'].caption} image={POST_DATA['post-5'].image} actionType="workflow" hasOuterBorder locationCount={5} onActivityClick={onActivityClick} onPostClick={onPostClick} />
            <PostCard postId="post-10" status="awaiting" platforms={POST_DATA['post-10'].platforms} time="2:00 PM" caption={POST_DATA['post-10'].caption} image={POST_DATA['post-10'].image} actionType="workflow" hasOuterBorder locationCount={12} onActivityClick={onActivityClick} onPostClick={onPostClick} />
            <PostCard postId="post-9" status="rejected" platforms={POST_DATA['post-9'].platforms} time="10:00 AM" caption={POST_DATA['post-9'].caption} image={POST_DATA['post-9'].image} actionType="simple" locationCount={3} onActivityClick={onActivityClick} onPostClick={onPostClick} />
          </div>
        </div>

        {/* Thu 5 */}
        <div className="bg-background flex-1 min-h-[939px] relative border-r border-border">
          <div className="flex flex-col gap-2.5 p-2.5">
            <PostCard postId="post-6" status="ai-suggested" platforms={POST_DATA['post-6'].platforms} time="10:00 AM" caption={POST_DATA['post-6'].caption} image={POST_DATA['post-6'].image} actionType="simple" onActivityClick={onActivityClick} onPostClick={onPostClick} />
            <PostCard postId="post-7" status="scheduled" platforms={POST_DATA['post-7'].platforms} time="10:00 AM" caption={POST_DATA['post-7'].caption} expiryDate={POST_DATA['post-7'].expiryDate} highlighted={highlightedPostId === 'post-7'} image={POST_DATA['post-7'].image} actionType="workflow" locationCount={10} onActivityClick={onActivityClick} onPostClick={onPostClick} />
          </div>
        </div>

        {/* Fri 6 */}
        <div className="bg-background flex-1 min-h-[939px] relative border-r border-border">
          <div className="flex flex-col gap-2.5 p-2.5">
            <PostCard postId="post-8" status="ai-suggested" platforms={POST_DATA['post-8'].platforms} time="10:00 AM" caption={POST_DATA['post-8'].caption} image={POST_DATA['post-8'].image} actionType="simple" onActivityClick={onActivityClick} onPostClick={onPostClick} />
            <PostCard postId="post-11" status="awaiting" platforms={POST_DATA['post-11'].platforms} time="11:00 AM" caption={POST_DATA['post-11'].caption} image={POST_DATA['post-11'].image} actionType="workflow" hasOuterBorder locationCount={6} onActivityClick={onActivityClick} onPostClick={onPostClick} />
          </div>
        </div>

        {/* Sat 7 — new post appears here after creation */}
        <div className="bg-background flex-1 min-h-[939px] relative border-r border-border">
          {newPost && (
            <div className="flex flex-col gap-2.5 p-2.5">
              <PostCard postId={newPostId!} status={newPost.status} platforms={newPost.platforms} time={newPost.time} caption={newPost.caption} image={newPost.image} actionType="simple" expiryDate={newPost.expiryDate} onActivityClick={onActivityClick} onPostClick={onPostClick} highlighted={highlightedPostId === newPostId} />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
