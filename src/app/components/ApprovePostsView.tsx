import { useState } from "react";
import {
  Pencil,
  MessageSquare,
  Info,
  History,
  Copy,
  Trash2,
  Search,
  SlidersHorizontal,
  ChevronDown,
  MoreVertical,
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

function StatusBadge() {
  return (
    <Badge variant="warning">Awaiting approval</Badge>
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
  if (!post || post.status !== "awaiting") return null;

  const locationCount = approval?.locations?.length ?? 10;
  const creatorName = approval?.submittedBy ?? 'Creator name';
  const workflowName = approval?.workflowTitle ?? 'Workflow name';
  const displayDate = `${post.date.split(',')[1]?.trim() ?? post.date}, ${post.time}`;

  // Show multiple images layout
  void [post.image];

  return (
    <div
      className="cursor-pointer overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary"
      onClick={() => onOpenDetails(postId)}
    >
      <div className="px-4 pt-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <PlatformIcons platforms={post.platforms.length > 1 ? post.platforms : ["facebook", "instagram", "linkedin"]} />
          <StatusBadge />
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          <span>{displayDate}</span>
          <span aria-hidden>·</span>
          <span>{locationCount} locations</span>
          <span aria-hidden>·</span>
          <span>{creatorName}</span>
          <span aria-hidden>·</span>
          <span>{workflowName}</span>
        </div>

        <p className="mb-3 line-clamp-3 text-sm leading-6 text-foreground">
          {post.caption}
        </p>

        <p className="mb-4 line-clamp-2 text-sm text-primary">
          {post.hashtags}
        </p>

        <div className="mb-4 flex gap-2">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-md">
            <img src={post.image} alt="Post" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <div
        className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3"
        onClick={(e) => e.stopPropagation()}
      >
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

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Reject</Button>
          <Button size="sm">Approve</Button>
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
  const [searchQuery, setSearchQuery] = useState("");

  // Posts that need approval
  const approvalPostIds = Object.keys(POST_DATA).filter((id) => POST_DATA[id].status === "awaiting");

  const filtered = approvalPostIds.filter((id) => {
    if (!searchQuery) return true;
    const post = POST_DATA[id];
    return post.caption.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full transition-colors duration-300">
      <div className={`${MAIN_VIEW_HEADER_BAND_CLASS} border-b border-border bg-background`}>
        <h1 className={MAIN_VIEW_PRIMARY_HEADING_CLASS}>
          Approve posts
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
          <Button variant="outline" size="icon" className="h-9 w-9" aria-label="Filter"><SlidersHorizontal size={16} /></Button>
          <Button variant="outline" size="icon" className="h-9 w-9" aria-label="More"><MoreVertical size={16} /></Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-muted/20 px-6 py-4">
        {filtered.length === 0 ? (
          <div className="flex h-[300px] flex-col items-center justify-center gap-2">
            <p className="text-base text-muted-foreground">No posts awaiting approval</p>
            <p className="text-xs text-muted-foreground">All caught up. Check back later.</p>
          </div>
        ) : (
          <div className="mx-auto flex max-w-[700px] flex-col gap-4">
            {filtered.map((id) => (
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
