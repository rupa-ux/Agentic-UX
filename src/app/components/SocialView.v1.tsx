import { useState } from "react";
import { ChevronLeft, ChevronRight, Filter, MoreHorizontal } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { SocialPostPreviewSheet } from "@/app/components/social/SocialPostPreviewSheet";
import {
  type SocialCalendarPost,
  SocialPostPreviewBody,
} from "@/app/components/social/socialPostShared";

const imgFrame1000003570 = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&auto=format";
const imgFrame1000003571 = "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop&auto=format";
const imgFrame1000003572 = "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop&auto=format";
const imgFrame1000003573 = "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&h=300&fit=crop&auto=format";
const imgFrame1000003574 = "https://images.unsplash.com/photo-1586816001966-79b736744398?w=400&h=300&fit=crop&auto=format";
const imgRectangle4668 = "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop&auto=format";
const imgRectangle4669 = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop&auto=format";
const imgBitmapCopy1 = "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&h=300&fit=crop&auto=format";

/* ─── Post action icons (inline SVGs) ─── */
function EditIcon() {
  return (
    <svg className="w-[14px] h-[14px]" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M8.38.58a1.92 1.92 0 012.83 0 1.92 1.92 0 010 2.83L3.78 10.83l-3.22.94.94-3.22L8.38.58z"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-[14px] h-[14px]" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M1 5h12M4 1v2m6-2v2M2 3h10a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V4a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}

type ViewMode = "list" | "week" | "month";

/* ─── Mock data ─── */
const WEEK_DAYS = [
  { label: "Sun", date: 1 },
  { label: "Mon", date: 2 },
  { label: "Tue", date: 3 },
  { label: "Wed", date: 4, isToday: true },
  { label: "Thu", date: 5 },
  { label: "Fri", date: 6 },
  { label: "Sat", date: 7 },
];

const POST_TEXT =
  "McDonald's meals in every celebration that brings smiles, happiness, and togetherness. Enjoy this festive season with your loved ones at a McDonald's store or download the McDelivery App to order online McDonald's meals in every celebration that brings smiles, happiness, and togetherness. Enjoy this festive season with your loved ones at a lon…";
const POST_TEXT_SHORT =
  "McDonald's meals in every celebration that brings smiles, happiness, and tog…";

const postsData: Record<number, SocialCalendarPost[]> = {
  1: [
    { id: "s1-1", time: "12:00 AM", platform: "facebook", text: POST_TEXT },
    { id: "s1-2", time: "12:00 AM", platform: "facebook", text: POST_TEXT },
  ],
  2: [
    {
      id: "s2-1",
      time: "10:28 AM",
      platform: "facebook",
      text: POST_TEXT_SHORT,
      image: imgFrame1000003570,
    },
    {
      id: "s2-2",
      time: "12:00 AM",
      platform: "facebook",
      text: "McDonald's meals in every celebration that brings smiles, happiness, and togetherness.",
    },
  ],
  3: [
    {
      id: "s3-1",
      time: "12:00 AM",
      platform: "instagram",
      text: POST_TEXT_SHORT,
      image: imgRectangle4668,
    },
    {
      id: "s3-2",
      time: "12:00 AM",
      platform: "twitter",
      text: "McDonald's meals in every celebration that brings smiles, happiness, and togetherness. Enjoy this festive season with your loved ones at a McDonald's store or download the McDelivery App to order online McDonald's meals in every celebration that brings smiles, happiness, and togetherness. Enjoy this festive season with your loved ones at a lon…",
    },
  ],
  4: [
    {
      id: "s4-1",
      time: "10:28 AM",
      platform: "facebook",
      text: POST_TEXT_SHORT,
      image: imgFrame1000003571,
    },
    {
      id: "s4-2",
      time: "12:00 AM",
      platform: "facebook",
      text: POST_TEXT_SHORT,
      aiScheduled: [{ time: "12:48 PM" }],
    },
  ],
  5: [
    {
      id: "s5-1",
      time: "10:28 AM",
      platform: "facebook",
      text: POST_TEXT_SHORT,
      image: imgFrame1000003572,
    },
    {
      id: "s5-2",
      time: "12:50 PM",
      platform: "facebook",
      text: "McDonald's meals in every celebration that brings smiles, happiness, and togetherness. Enjoy this festive season with your loved ones at a McDonald's store or download the McDelivery App to order online McDonald's meals in every celebration that brings smiles, happiness, and togetherness.",
      aiScheduled: [{ time: "6:48 PM" }],
    },
  ],
  6: [
    {
      id: "s6-1",
      time: "12:48 PM",
      platform: "facebook",
      text: POST_TEXT_SHORT,
      image: imgFrame1000003573,
      aiScheduled: [{ time: "10:48 PM" }, { time: "6:48 PM" }, { time: "8:48 PM" }],
    },
    {
      id: "s6-2",
      time: "12:48 PM",
      platform: "facebook",
      text: POST_TEXT_SHORT,
      image: imgRectangle4669,
    },
  ],
  7: [
    { id: "s7-1", time: "12:00 AM", platform: "facebook", text: POST_TEXT_SHORT },
    {
      id: "s7-2",
      time: "10:28 AM",
      platform: "facebook",
      text: "McDonald's meals in every celebration that brings smiles, happiness, and tog…",
      image: imgFrame1000003574,
      aiScheduled: [{ time: "9:48 AM" }],
    },
    {
      id: "s7-3",
      time: "12:00 AM",
      platform: "facebook",
      text: "McDonald's meals in every celebration that brings smiles, happiness, and togetherness. Enjoy this festive season with your loved ones at a McDonald's store or download the McDelivery App to order online",
      image: imgBitmapCopy1,
      aiScheduled: [{ time: "6:48 PM" }],
    },
  ],
};

function PostCardComponent({
  post,
  onOpenPreview,
}: {
  post: SocialCalendarPost;
  onOpenPreview: () => void;
}) {
  return (
    <div className="w-full rounded-[6px] border border-[#e9e9eb] bg-[#f4f6f7] p-2 transition-colors dark:border-[#333a47] dark:bg-[#22262f]">
      <div className="flex flex-col gap-2">
        <button
          type="button"
          aria-label="Open post preview"
          onClick={onOpenPreview}
          className="flex w-full cursor-pointer flex-col gap-2 rounded-[4px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <SocialPostPreviewBody post={post} variant="compact" />
        </button>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-0.5 text-[#555] transition-colors hover:text-[#212121] dark:text-[#8b92a5] dark:hover:text-[#e4e4e4]"
              aria-label="Edit post"
            >
              <EditIcon />
            </button>
            <button
              type="button"
              className="p-0.5 text-[#555] transition-colors hover:text-[#212121] dark:text-[#8b92a5] dark:hover:text-[#e4e4e4]"
              aria-label="Schedule"
            >
              <CalendarIcon />
            </button>
          </div>
          <button
            type="button"
            className="-rotate-90 p-0.5 text-[#555] transition-colors hover:text-[#212121] dark:text-[#8b92a5] dark:hover:text-[#e4e4e4]"
            aria-label="More options"
          >
            <MoreHorizontal className="h-[14px] w-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Social View – Main export
   ═══════════════════════════════════════════ */
export function SocialView() {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [currentMonth] = useState("April 2024");
  const [previewPost, setPreviewPost] = useState<SocialCalendarPost | null>(null);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white transition-colors duration-300 dark:bg-[#13161b]">
      {/* ─── Header ─── */}
      <div className="flex shrink-0 items-center justify-between px-6 py-4">
        {/* Left: month nav */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-[14px] w-[14px] text-[#303030] dark:text-[#c0c6d4]" strokeWidth={1.6} absoluteStrokeWidth />
          </Button>
          <span className="mx-1 text-[17px] text-[#212121] dark:text-[#e4e4e4]" style={{ fontWeight: 400 }}>
            {currentMonth}
          </span>
          <Button variant="ghost" size="icon">
            <ChevronRight className="h-[14px] w-[14px] text-[#303030] dark:text-[#c0c6d4]" strokeWidth={1.6} absoluteStrokeWidth />
          </Button>
          <Button variant="ghost" className="ml-2 text-[#1976d2] hover:bg-[#e8effe] dark:hover:bg-[#1e2d5e]">
            Today
          </Button>
        </div>

        {/* Right: view toggle + filter */}
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center rounded-[8px] border border-[#e5e9f0] bg-white p-1 dark:border-[#333a47] dark:bg-[#262b35]">
            {(["list", "week", "month"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`rounded-[4px] px-2 py-0.5 text-[13px] capitalize transition-colors ${
                  viewMode === mode
                    ? "bg-[#e5e9f0] text-[#212121] dark:bg-[#333a47] dark:text-[#e4e4e4]"
                    : "text-[#555] hover:text-[#212121] dark:text-[#8b92a5] dark:hover:text-[#e4e4e4]"
                }`}
                style={{ fontWeight: 400 }}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Filter button */}
          <Button variant="outline" size="icon">
            <Filter className="h-[14px] w-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
          </Button>
        </div>
      </div>

      {/* ─── Calendar grid ─── */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Day headers */}
        <div className="flex shrink-0 border-b border-[#e9e9eb] dark:border-[#333a47]">
          {WEEK_DAYS.map((day) => (
            <div key={day.date} className="flex flex-1 items-center justify-center bg-white py-3 dark:bg-[#1e2229]">
              {day.isToday ? (
                <div className="flex items-center gap-1">
                  <span className="text-[13px] text-[#125598] dark:text-[#6b9bff]">{day.label}</span>
                  <span
                    className="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#125598] text-[11px] text-white dark:bg-[#2552ED]"
                    style={{ fontWeight: 400 }}
                  >
                    {day.date}
                  </span>
                </div>
              ) : (
                <span className="text-[13px] text-[#555] dark:text-[#8b92a5]">
                  {day.label} {day.date}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Day columns with posts */}
        <div className="flex min-h-0 flex-1 overflow-y-auto">
          {WEEK_DAYS.map((day) => {
            const posts = postsData[day.date] || [];
            return (
              <div
                key={day.date}
                className={`flex min-w-0 flex-1 flex-col gap-2 border-r border-[#e9e9eb] p-2 last:border-r-0 dark:border-[#333a47] ${
                  day.isToday ? "bg-white dark:bg-[#1e2229]" : "bg-[#f9fafb] dark:bg-[#181b22]"
                }`}
              >
                {posts.map((post) => (
                  <PostCardComponent key={post.id} post={post} onOpenPreview={() => setPreviewPost(post)} />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <SocialPostPreviewSheet
        open={previewPost !== null}
        onOpenChange={(next) => {
          if (!next) setPreviewPost(null);
        }}
        post={previewPost}
      />
    </div>
  );
}
