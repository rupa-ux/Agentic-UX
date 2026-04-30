import { useState } from "react";
import { POST_DATA } from "../data/postData";
import { FacebookIcon, InstagramIcon, LinkedInIcon } from "./PlatformIcons";
import { Clock, RotateCcw, AlertTriangle, Info } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  MAIN_VIEW_HEADER_BAND_CLASS,
  MAIN_VIEW_PRIMARY_HEADING_CLASS,
  MAIN_VIEW_SUBHEADING_CLASS,
} from "./layout/mainViewTitleClasses";

interface ExpiredPostsViewProps {
  onCreatePost: () => void;
  onOpenActivity: (postId: string) => void;
}

// ── Platform icons row ───────────────────────────────────────────────────────
function PlatformRow({ platforms }: { platforms: ("facebook" | "instagram" | "linkedin")[] }) {
  return (
    <div className="flex items-center gap-[4px]">
      {platforms.map((p) => (
        <div key={p} className="shrink-0 size-[18px]">
          {p === "facebook" ? <FacebookIcon /> : p === "instagram" ? <InstagramIcon /> : <LinkedInIcon />}
        </div>
      ))}
    </div>
  );
}

// ── Status badge ─────────────────────────────────────────────────────────────
function ExpiredBadge() {
  return (
    <Badge variant="outline"><Clock size={11} />Expired</Badge>
  );
}

// ── Platform failure warning ─────────────────────────────────────────────────
function PartialFailureBanner({ failedPlatforms }: { failedPlatforms: string[] }) {
  const names: Record<string, string> = { instagram: 'Instagram', facebook: 'Facebook', linkedin: 'LinkedIn' };
  return (
    <div className="mt-2 flex items-start gap-2 rounded-md border border-amber-300/60 bg-amber-100/60 px-3 py-2 dark:border-amber-900 dark:bg-amber-950/30">
      <AlertTriangle size={13} className="mt-[1px] shrink-0 text-amber-700 dark:text-amber-400" />
      <p className="text-xs leading-5 text-amber-900 dark:text-amber-200">
        Post could not be removed from <strong>{failedPlatforms.map(p => names[p]).join(', ')}</strong> — the platform's API does not support automatic deletion. The post remains visible there but is marked expired in BirdEye.
      </p>
    </div>
  );
}

// ── Single expired post card ─────────────────────────────────────────────────
function ExpiredPostCard({
  postId,
  onReschedule,
  onOpenActivity,
}: {
  postId: string;
  onReschedule: () => void;
  onOpenActivity: (id: string) => void;
}) {
  const post = POST_DATA[postId];
  if (!post) return null;

  const expiryLabel = post.expiryDate
    ? new Date(post.expiryDate).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })
    : "No expiry date set";

  return (
    <div
      className="mb-3 overflow-hidden rounded-lg border border-border bg-card"
    >
      <div className="flex gap-[0] items-stretch">
        {/* Thumbnail */}
        <div style={{ width: 80, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
          <img
            src={post.image}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(60%) opacity(0.75)' }}
          />
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.28)' }}
          >
            <Clock size={20} color="white" style={{ opacity: 0.8 }} />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 px-[14px] py-[12px] min-w-0">
          {/* Top row */}
          <div className="flex items-center gap-[8px] mb-[6px]">
            <PlatformRow platforms={post.platforms} />
            <ExpiredBadge />
            <span className="ml-auto text-xs text-muted-foreground">
              {post.location}
            </span>
          </div>

          {/* Caption */}
          <p className="mb-[6px] line-clamp-2 text-sm leading-5 text-foreground">
            {post.caption}
          </p>

          {/* Expiry + schedule meta */}
          <div className="flex items-center gap-[14px] flex-wrap">
            <div className="flex items-center gap-[4px]">
              <Clock size={12} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Expired: {expiryLabel}
              </span>
            </div>
            {post.scheduledFor && (
              <span className="text-xs text-muted-foreground">
                Originally: {post.scheduledFor}
              </span>
            )}
          </div>

          {/* Partial failure banner */}
          {post.expiryFailedPlatforms && post.expiryFailedPlatforms.length > 0 && (
            <PartialFailureBanner failedPlatforms={post.expiryFailedPlatforms} />
          )}
        </div>

        {/* Action column */}
        <div className="flex flex-col items-end justify-between px-[14px] py-[12px] shrink-0 gap-[8px]">
          <Button onClick={onReschedule} size="sm" className="h-8 gap-1 px-3 text-xs">
            <RotateCcw size={11} />
            Reschedule
          </Button>
          <Button onClick={() => onOpenActivity(postId)} variant="link" size="sm" className="h-auto p-0 text-xs">View history</Button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function ExpiredPostsView({ onCreatePost, onOpenActivity }: ExpiredPostsViewProps) {
  const [search, setSearch] = useState("");

  const expiredPosts = Object.values(POST_DATA).filter(p => p.status === 'expired');

  const filtered = expiredPosts.filter(p =>
    !search || p.caption.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase())
  );

  const failedCount = expiredPosts.filter(p => p.expiryFailedPlatforms && p.expiryFailedPlatforms.length > 0).length;

  return (
    <div className="h-full bg-background flex flex-col transition-colors duration-300">

      {/* Header */}
      <div className={`${MAIN_VIEW_HEADER_BAND_CLASS} items-start border-b border-border`}>
        <div>
          <p className={MAIN_VIEW_PRIMARY_HEADING_CLASS}>
            Expired posts
          </p>
          <p className={MAIN_VIEW_SUBHEADING_CLASS}>
            {expiredPosts.length} post{expiredPosts.length !== 1 ? 's' : ''} expired
          </p>
        </div>
      </div>

      {/* Platform failure notice banner (shown if any partial failures) */}
      {failedCount > 0 && (
        <div
          className="mx-6 mt-4 flex items-start gap-2.5 rounded-md border border-amber-300/60 bg-amber-100/60 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/30"
        >
          <Info size={15} className="mt-[1px] shrink-0 text-amber-700 dark:text-amber-400" />
          <p className="text-sm leading-5 text-amber-900 dark:text-amber-200">
            <strong>{failedCount} post{failedCount !== 1 ? 's' : ''}</strong> could not be fully removed from all platforms due to API limitations. These posts remain visible on the affected platforms but are marked as expired in BirdEye.
          </p>
        </div>
      )}

      <div className="px-6 pt-3">
        <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="var(--s-text-muted)" strokeWidth="2"/>
            <path d="M16.5 16.5L21 21" stroke="var(--s-text-muted)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search expired posts…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, border: "none", outline: "none", background: "transparent" }}
            className="text-sm text-foreground"
          />
        </div>
      </div>

      {/* Edge case: empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 gap-[12px]">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
            <Clock size={20} className="text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            {search ? 'No expired posts match your search' : 'No expired posts yet'}
          </p>
          {!search && (
            <p className="max-w-80 text-center text-xs leading-5 text-muted-foreground">
              Posts with an expiry date set will appear here once they expire. You can set an expiry date when creating or editing a post.
            </p>
          )}
        </div>
      )}

      {/* Post list */}
      {filtered.length > 0 && (
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filtered.map(post => (
            <ExpiredPostCard
              key={post.postId}
              postId={post.postId}
              onReschedule={onCreatePost}
              onOpenActivity={onOpenActivity}
            />
          ))}
        </div>
      )}
    </div>
  );
}
