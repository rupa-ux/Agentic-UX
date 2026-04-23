import { useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { MAIN_VIEW_PRIMARY_HEADING_CLASS } from "@/app/components/layout/mainViewTitleClasses";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/components/ui/utils";
import { SocialPostPreviewSheet } from "@/app/components/social/SocialPostPreviewSheet";
import {
  type SocialCalendarPost,
  SocialPostPlatformIcon,
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
const imgDentalOffice = "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&h=300&fit=crop&auto=format";
const imgSmile = "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&h=300&fit=crop&auto=format";

/* ─── Mock copy (Aspen Dental–style practice social) ─── */
const POST_TEXT =
  "Healthy smiles start with care you can count on. Book a cleaning and comprehensive exam at Aspen Dental—most insurance accepted, flexible financing, and same-day appointments where available. Ask about whitening, implants, and dentures. Your neighborhood team is here to help you love your smile again.";
const POST_TEXT_SHORT =
  "New patient special: exam + X-rays + cleaning. Schedule online or call your local Aspen Dental practice today…";

const postsData: Record<number, SocialCalendarPost[]> = {
  1: [
    { id: "s1-1", time: "12:00 AM", platform: "facebook", text: POST_TEXT },
    { id: "s1-2", time: "6:30 AM", platform: "instagram", text: POST_TEXT_SHORT, image: imgSmile },
    { id: "s1-3", time: "2:15 PM", platform: "google", text: "Weekend hours update: our Eastside office is open Saturday 8–2 for hygiene visits and urgent care triage." },
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
      text: "April is Oral Cancer Awareness Month—book a screening with your hygiene visit. Early detection saves lives.",
    },
    {
      id: "s2-3",
      time: "4:40 PM",
      platform: "twitter",
      text: "Tip: replace your toothbrush every 3 months—or sooner after a cold. Your hygienist can show you the best brush for your gums.",
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
      text: "Invisalign® consults are free this month. Straighten teeth discreetly—ask your doctor if clear aligners are right for you.",
    },
    {
      id: "s3-3",
      time: "7:05 PM",
      platform: "facebook",
      text: POST_TEXT,
      aiScheduled: [{ time: "8:10 PM" }],
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
    {
      id: "s4-3",
      time: "3:20 PM",
      platform: "instagram",
      text: "Meet the team: Dr. Patel and our assistants make nervous patients feel at home. Comment with your first-visit story.",
      image: imgDentalOffice,
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
      text: "Same-day denture repairs in select locations—call ahead so we can fit you in and get you smiling again.",
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
    {
      id: "s6-3",
      time: "5:00 PM",
      platform: "google",
      text: "Review shout-out—thank you, Jordan, for the five stars on your whitening touch-up. We appreciate you!",
    },
  ],
  7: [
    { id: "s7-1", time: "12:00 AM", platform: "facebook", text: POST_TEXT_SHORT },
    {
      id: "s7-2",
      time: "10:28 AM",
      platform: "facebook",
      text: "Sports season reminder: custom mouthguards protect teeth better than boil-and-bite. Stop by front desk to get fitted.",
      image: imgFrame1000003574,
      aiScheduled: [{ time: "9:48 AM" }],
    },
    {
      id: "s7-3",
      time: "12:00 AM",
      platform: "facebook",
      text: "Financing question? CareCredit® and flexible payment options help many patients start treatment the same week.",
      image: imgBitmapCopy1,
      aiScheduled: [{ time: "6:48 PM" }],
    },
    {
      id: "s7-4",
      time: "8:30 PM",
      platform: "instagram",
      text: "Before & after: composite bonding closed a small gap in one visit. Swipe for the smile refresh.",
      image: imgSmile,
    },
  ],
  8: [
    { id: "s8-1", time: "9:00 AM", platform: "facebook", text: "Happy Monday—our phones open at 7 AM for scheduling. Text STOP to opt out of reminders." },
    { id: "s8-2", time: "11:30 AM", platform: "twitter", text: POST_TEXT_SHORT },
  ],
  9: [{ id: "s9-1", time: "2:00 PM", platform: "instagram", text: "Snack smart: cheese and nuts help neutralize acids between meals. Save sticky sweets for right after meals, then rinse.", image: imgRectangle4668 }],
  10: [
    { id: "s10-1", time: "8:15 AM", platform: "google", text: "We’re hiring a treatment coordinator—DM us “careers” for details. Great benefits, growth-minded team." },
    { id: "s10-2", time: "4:45 PM", platform: "facebook", text: POST_TEXT_SHORT, image: imgDentalOffice },
  ],
  11: [{ id: "s11-1", time: "12:30 PM", platform: "facebook", text: "Sedation options available for longer procedures—your comfort plan is personalized at every visit." }],
  12: [
    { id: "s12-1", time: "10:00 AM", platform: "instagram", text: "Floss threaders make cleaning around bridges easy—ask us for a demo at your next appointment.", image: imgFrame1000003571 },
    { id: "s12-2", time: "6:00 PM", platform: "twitter", text: POST_TEXT_SHORT },
  ],
  13: [{ id: "s13-1", time: "1:10 PM", platform: "facebook", text: "Implant consultation: learn about bone health, healing timelines, and realistic expectations in one visit." }],
  14: [
    { id: "s14-1", time: "7:45 AM", platform: "facebook", text: POST_TEXT_SHORT, aiScheduled: [{ time: "5:15 PM" }] },
    { id: "s14-2", time: "3:00 PM", platform: "instagram", text: "Community day recap—free kids’ screenings and toothbrush kits while supplies lasted. Thank you for showing up!", image: imgSmile },
  ],
  15: [{ id: "s15-1", time: "9:20 AM", platform: "google", text: "Parking tip: validated garage on 4th—bring your ticket to checkout for a stamp." }],
  16: [{ id: "s16-1", time: "11:00 AM", platform: "twitter", text: "Grinding at night? A night guard can protect enamel and reduce jaw soreness. Custom fit beats drugstore one-size." }],
  17: [{ id: "s17-1", time: "4:30 PM", platform: "facebook", text: POST_TEXT_SHORT, image: imgFrame1000003572 }],
  18: [
    { id: "s18-1", time: "8:00 AM", platform: "instagram", text: "Sensitive teeth? Try a desensitizing toothpaste for two weeks before whitening—we can recommend a brand.", image: imgRectangle4669 },
    { id: "s18-2", time: "7:15 PM", platform: "facebook", text: "Refer a friend—both of you save on your next hygiene visit when they complete their new patient exam." },
  ],
  19: [{ id: "s19-1", time: "12:45 PM", platform: "facebook", text: "Emergency? Knocked-out tooth: keep it moist in milk and call us immediately—time matters for reimplantation." }],
  20: [{ id: "s20-1", time: "2:30 PM", platform: "google", text: POST_TEXT_SHORT }],
  21: [{ id: "s21-1", time: "5:50 PM", platform: "instagram", text: "Thank you for 2,000 local followers—we’re honored to care for this community’s smiles.", image: imgDentalOffice }],
};

const MONTH_WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/** April 1, 2024 is Monday → one leading empty cell when week starts Sunday */
const APRIL_2024_LEADING_EMPTY = 1;
const APRIL_2024_DAYS = 30;

function buildApril2024MonthCells(): (number | null)[] {
  const cells: (number | null)[] = [];
  for (let i = 0; i < APRIL_2024_LEADING_EMPTY; i++) cells.push(null);
  for (let d = 1; d <= APRIL_2024_DAYS; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/** Shared shell for the month calendar: layout, border, and height chain. */
function SocialCalendarSurface({ children }: { children: ReactNode }) {
  return (
    <div className="mx-6 mb-6 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      {children}
    </div>
  );
}

/** Dense month cell row (Sprout / Later–style stacked publish items). */
function MonthPostChip({
  post,
  onClick,
}: {
  post: SocialCalendarPost;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full min-w-0 cursor-pointer items-start gap-2 rounded-md border border-border bg-muted/20 px-2 py-1 text-left transition-colors hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      <span className="shrink-0 pt-0.5">
        <SocialPostPlatformIcon platform={post.platform} size={12} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs text-muted-foreground">{post.time}</span>
        <span className="line-clamp-2 text-xs leading-snug text-foreground">{post.text}</span>
      </span>
    </button>
  );
}

function SocialMonthGrid({
  onOpenPreview,
}: {
  onOpenPreview: (post: SocialCalendarPost) => void;
}) {
  const cells = useMemo(() => buildApril2024MonthCells(), []);
  const rowCount = cells.length / 7;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden leading-normal">
      <div className="grid shrink-0 grid-cols-7 border-b border-border bg-background">
        {MONTH_WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="flex items-center justify-center py-2 text-xs font-medium text-muted-foreground"
          >
            {label}
          </div>
        ))}
      </div>
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
        <div
          className="grid h-full min-h-0 w-full grid-cols-7 border-l border-t border-border"
          style={{ gridTemplateRows: `repeat(${rowCount}, minmax(0, 1fr))` }}
        >
          {cells.map((dayNum, idx) => {
            if (dayNum === null) {
              return (
                <div
                  key={`e-${idx}`}
                  className="min-h-0 border-b border-r border-border bg-muted/15"
                  aria-hidden
                />
              );
            }
            const posts = postsData[dayNum] || [];
            const isToday = dayNum === 4;
            return (
              <div
                key={dayNum}
                className="flex min-h-0 min-w-0 flex-col gap-1 border-b border-r border-border bg-background p-2"
              >
                <div className="flex shrink-0 items-center justify-between gap-2">
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full text-xs",
                      isToday ? "bg-primary font-medium text-primary-foreground" : "text-muted-foreground",
                    )}
                  >
                    {dayNum}
                  </span>
                  {posts.length > 0 ? (
                    <span className="truncate text-xs tabular-nums text-muted-foreground">
                      {posts.length} {posts.length === 1 ? "post" : "posts"}
                    </span>
                  ) : null}
                </div>
                <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
                  {posts.slice(0, 3).map((post) => (
                    <MonthPostChip key={post.id} post={post} onClick={() => onOpenPreview(post)} />
                  ))}
                  {posts.length > 3 ? (
                    <button
                      type="button"
                      onClick={() => onOpenPreview(posts[3])}
                      className="w-full shrink-0 cursor-pointer rounded-md px-2 py-1 text-left text-xs font-medium text-primary hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    >
                      +{posts.length - 3} more
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Social View – Main export
   ═══════════════════════════════════════════ */
export function SocialView() {
  const [currentMonth] = useState("April 2024");
  const [previewPost, setPreviewPost] = useState<SocialCalendarPost | null>(null);

  const openPreview = (post: SocialCalendarPost) => setPreviewPost(post);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white transition-colors duration-300 dark:bg-[#13161b]">
      {/* ─── Header ─── */}
      <div className="flex shrink-0 items-center justify-between px-6 pt-5 pb-4">
        {/* Left: month nav + today (tight grouping) */}
        <div className="flex items-center gap-0">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ChevronLeft className="h-[14px] w-[14px] text-[#303030] dark:text-[#c0c6d4]" strokeWidth={1.6} absoluteStrokeWidth />
          </Button>
          <span className={cn(MAIN_VIEW_PRIMARY_HEADING_CLASS, "mx-0 shrink-0 px-0")} aria-live="polite">
            {currentMonth}
          </span>
          <Button variant="ghost" size="icon" className="shrink-0">
            <ChevronRight className="h-[14px] w-[14px] text-[#303030] dark:text-[#c0c6d4]" strokeWidth={1.6} absoluteStrokeWidth />
          </Button>
          <Button
            variant="ghost"
            className="ml-1 shrink-0 px-2 text-[#1976d2] hover:bg-[#e8effe] dark:hover:bg-[#1e2d5e]"
          >
            Today
          </Button>
        </div>

        {/* Right: filter */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Filter className="h-[14px] w-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <SocialCalendarSurface>
          <SocialMonthGrid onOpenPreview={openPreview} />
        </SocialCalendarSurface>
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
