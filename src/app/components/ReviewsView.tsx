import { useState } from "react";
import { Search, ChevronDown, Filter, MoreVertical, Star, ChevronLeft, ChevronRight } from "lucide-react";
import svgPaths from "../../imports/svg-k7qrt1366a";
import imgRectangle2429 from "figma:asset/446cb492f3fe73044c118c6d9307137e24590ff8.png";
import imgRectangle2430 from "figma:asset/1a7a907737a6c2339fef56676725c1199e301f9b.png";
import imgRectangle2431 from "figma:asset/57a5d0bf0d5a390c1d7dcf58044f6d1bf9302043.png";
import imgRectangle2432 from "figma:asset/af71c7009ab80e3144130b7e0ae3de25145587b4.png";
import imgRectangle2436 from "figma:asset/ea0dd05780c7ac1c213dfa21dd362e49975c1e8a.png";
import imgRectangle2437 from "figma:asset/5d5e04295f071059b2e008ccd620f3c679cac0dc.png";
import imgRectangle2435 from "figma:asset/2530e5b572972c8fac2f940c826bbb855650f616.png";
import { FilterPanel, type FilterItem } from "./FilterPanel";

// Types
interface Review {
  id: number;
  site: "yelp" | "google";
  rating: number;
  reviewer: string;
  date: string;
  photoCount?: number;
  featured?: boolean;
  employees: number;
  location: string;
  photos: string[];
  text: string;
  replyStatus: "post" | "edit";
  hasReplyDots?: boolean;
}

// Mock data matching Figma reference 2
const mockReviews: Review[] = [
  {
    id: 1,
    site: "yelp",
    rating: 5,
    reviewer: "Arya Stark",
    date: "Jan 7, 2023",
    photoCount: 12,
    featured: true,
    employees: 2,
    location: "Georgia",
    photos: [imgRectangle2429, imgRectangle2430, imgRectangle2431, imgRectangle2432, imgRectangle2436, imgRectangle2437, imgRectangle2435],
    text: "I had a great time here, the place is situated near Wagle circle. It has top notch ambience and a really cool vibe. The food and drinks were pretty good and would definitely recommend this out to all the non veg lovers. The restaurant is pretty big and can accommodate a huge crowd with indoor as well as an outdoor seating. The prices for the dishes are pretty reasonable and totally worth it! My personal preference were the desserts, especially the DIY cake. Would definitely visit again! ❤️",
    replyStatus: "post",
  },
  {
    id: 2,
    site: "google",
    rating: 4,
    reviewer: "Daniel Peirre",
    date: "Jan 7, 2023",
    employees: 2,
    location: "Georgia",
    photos: [],
    text: "I recently had a experience of dining at Magna and I must say that it was an outstanding experience from start to end. The menu is so diverse and thoughtfully curated.",
    replyStatus: "post",
  },
  {
    id: 3,
    site: "yelp",
    rating: 5,
    reviewer: "Austin Dale",
    date: "Jan 7, 2023",
    employees: 2,
    location: "Georgia",
    photos: [],
    text: "A huge place where you can hang out with your friend/relative. A huge place where you can hang out with your friend/relative. A huge place where you can hang out with your friend/relative.",
    replyStatus: "edit",
    hasReplyDots: true,
  },
  {
    id: 4,
    site: "yelp",
    rating: 5,
    reviewer: "Austin Dale",
    date: "Jan 7, 2023",
    employees: 2,
    location: "Georgia",
    photos: [],
    text: "This place is super amazing. The ambience is beautiful. The staff is very cooperative. I tried out there lunch express you should definitely try it out. The menu have variety of dishes. The best part was that desert. I ordered paint pastry. It was super delicious.",
    replyStatus: "post",
    hasReplyDots: true,
  },
];

/* ─── Yelp Logo ─── */
function YelpLogo() {
  return (
    <div className="bg-white flex items-center justify-center p-[5px] rounded-full size-[40px] relative border border-[#eaeaea] dark:border-[#333a47] dark:bg-[#262b35]">
      <div className="h-[27.435px] w-[22.881px]">
        <svg className="w-full h-full" viewBox="0 0 22.8814 27.4352" fill="none">
          <path d={svgPaths.p53b0d00} fill="#FF1A1A" />
          <path d={svgPaths.pf0e0dc0} fill="#FF1A1A" />
          <path d={svgPaths.p27030500} fill="#FF1A1A" />
          <path d={svgPaths.p3643f600} fill="#FF1A1A" />
          <path d={svgPaths.p5cc3100} fill="#FF1A1A" />
        </svg>
      </div>
    </div>
  );
}

/* ─── Google Logo (full color G) ─── */
function GoogleLogo() {
  return (
    <div className="relative shrink-0 size-[40px]">
      <svg className="w-full h-full" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" fill="white" r="19.5833" stroke="#EAEAEA" strokeWidth="0.833333" />
        <path d={svgPaths.p27765500} fill="#4285F4" />
        <path d={svgPaths.p266b3f00} fill="#34A853" />
        <path d={svgPaths.p39b489f0} fill="#FBBC05" />
        <path d={svgPaths.p16fc1f80} fill="#EB4335" />
      </svg>
    </div>
  );
}

/* ─── Star Rating (Yelp-style red stars) ─── */
function StarRating({ rating, size = 20 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-[2px]">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={
            i < rating
              ? "fill-[#FB433C] text-[#FB433C]"
              : "fill-[#ccc] text-[#ccc] dark:fill-[#555] dark:text-[#555]"
          }
        />
      ))}
    </div>
  );
}

/* ─── BirdAI Suggested Reply ─── */
function BirdAIReply({ hasThreeDots }: { hasThreeDots?: boolean }) {
  return (
    <div className="relative bg-[#f9f7fd] dark:bg-[#1e1a2e] rounded-[8px] p-5 w-full">
      <div className="flex flex-col gap-[6px]">
        {/* Header row */}
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#555] dark:text-[#8b92a5]">BirdAI suggested reply</span>
          <div className="size-[4px] rounded-full bg-[#555] dark:bg-[#8b92a5]" />
          <div className="flex items-center">
            <span className="text-[12px] text-[#555] dark:text-[#8b92a5]">Reply as</span>
            <div className="flex items-center gap-[2px] px-1 rounded-full">
              <span className="text-[12px] text-[#1976d2]">Sampada (me)</span>
              <svg className="w-[7.5px] h-[3.75px]" viewBox="0 0 7.5 3.75" fill="none">
                <path d="M0 0L3.75 3.75L7.5 0H0Z" fill="#49454F" />
              </svg>
            </div>
          </div>
        </div>
        {/* Reply text */}
        <p className="text-[15px] text-[#212121] dark:text-[#d0d0d0] leading-[20px]">
          We appreciate your feedback! Thank you for taking the time to share your experience with us.
        </p>
      </div>
      {/* Optional 3-dot menu on reply */}
      {hasThreeDots && (
        <div className="absolute right-3 top-2 bg-[#f9f7fd] dark:bg-[#1e1a2e] rounded-full size-[24px] flex items-center justify-center">
          <svg className="w-[12px] h-[3px] rotate-90" viewBox="0 0 12 3" fill="none">
            <path clipRule="evenodd" d={svgPaths.p2d3a0500} fill="#757575" fillRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
}

/* ─── Chat Icon ─── */
function ChatIcon() {
  return (
    <svg className="w-[14px] h-[14px]" viewBox="0 0 19 19" fill="none">
      <g clipPath="url(#chatClip)">
        <path d={svgPaths.p84b0100} fill="#555555" className="dark:fill-[#8b92a5]" />
      </g>
      <defs>
        <clipPath id="chatClip">
          <rect fill="white" height="19" width="19" />
        </clipPath>
      </defs>
    </svg>
  );
}

/* ─── More Dots (vertical) ─── */
function MoreDots() {
  return (
    <svg className="w-[12px] h-[3px] rotate-90" viewBox="0 0 12 3" fill="none">
      <path clipRule="evenodd" d={svgPaths.p2d3a0500} fill="#555555" fillRule="evenodd" className="dark:fill-[#8b92a5]" />
    </svg>
  );
}

/* ─── Action Row (Post reply / Edit reply + chat + more) ─── */
function ActionRow({ replyStatus }: { replyStatus: "post" | "edit" }) {
  return (
    <div className="flex flex-col gap-6 items-end w-full">
      <div className="flex items-center gap-3">
        {/* Reply CTA */}
        <button className="px-[15px] py-[8px] rounded-[8px] bg-[#6834b7] dark:bg-[#7c3aed] hover:bg-[#5a2da0] dark:hover:bg-[#6d28d9] transition-colors">
          <span className="text-[14px] text-white">
            {replyStatus === "post" ? "Post reply" : "Edit reply"}
          </span>
        </button>
        {/* Chat button */}
        <button className="h-[36px] w-[36px] rounded-[8px] border border-[#e5e9f0] dark:border-[#333a47] bg-white dark:bg-[#262b35] flex items-center justify-center hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340] transition-colors">
          <ChatIcon />
        </button>
        {/* More button */}
        <button className="h-[36px] w-[36px] rounded-[8px] border border-[#e5e9f0] dark:border-[#333a47] bg-white dark:bg-[#262b35] flex items-center justify-center hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340] transition-colors">
          <MoreDots />
        </button>
      </div>
    </div>
  );
}

/* ─── Photo Carousel ─── */
function PhotoCarousel({ photos }: { photos: string[] }) {
  const [scrollOffset, setScrollOffset] = useState(0);
  const visibleCount = 6;

  const canScrollLeft = scrollOffset > 0;
  const canScrollRight = scrollOffset < photos.length - visibleCount;

  const scrollLeft = () => setScrollOffset((prev) => Math.max(0, prev - 1));
  const scrollRight = () => setScrollOffset((prev) => Math.min(photos.length - visibleCount, prev + 1));

  const visiblePhotos = photos.slice(scrollOffset, scrollOffset + visibleCount + 1);

  return (
    <div className="relative w-full">
      <div className="flex gap-[2px] overflow-hidden">
        {visiblePhotos.map((photo, idx) => {
          const isLast = idx === visiblePhotos.length - 1 && scrollOffset + visibleCount < photos.length;
          return (
            <div
              key={scrollOffset + idx}
              className="w-[180px] h-[120px] rounded-[4px] overflow-hidden shrink-0 relative"
            >
              <img
                src={photo}
                alt={`Review photo ${scrollOffset + idx + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border border-[#f4f6f7] dark:border-[#333a47] rounded-[4px]" />
              {/* Fade gradient on last visible photo */}
              {isLast && (
                <div
                  className="absolute inset-0 rounded-[4px]"
                  style={{
                    backgroundImage: "linear-gradient(-90deg, rgba(33, 33, 33, 0.9) 0%, rgba(0, 0, 0, 0) 100.83%)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation arrows */}
      {photos.length > visibleCount && (
        <>
          {canScrollLeft && (
            <button
              onClick={scrollLeft}
              className="absolute left-2 top-1/2 -translate-y-1/2 size-[40px] rounded-full bg-white/60 dark:bg-black/40 border border-[#212121] dark:border-[#888] flex items-center justify-center hover:bg-white/80 dark:hover:bg-black/60 transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-[#0A0A0A] dark:text-white" />
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={scrollRight}
              className="absolute right-2 top-1/2 -translate-y-1/2 size-[40px] rounded-full bg-white/60 dark:bg-black/40 border border-[#212121] dark:border-[#888] flex items-center justify-center hover:bg-white/80 dark:hover:bg-black/60 transition-all"
            >
              <ChevronRight className="w-5 h-5 text-[#212121] dark:text-white" />
            </button>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Review Card ─── */
function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Header: logo + details + employee/location */}
      <div className="flex items-start justify-between w-full">
        <div className="flex items-center gap-3">
          {review.site === "yelp" ? <YelpLogo /> : <GoogleLogo />}
          <div className="flex flex-col gap-[2px]">
            <StarRating rating={review.rating} />
            <div className="flex items-center gap-2 text-[15px]">
              <span className="text-[#212121] dark:text-[#e4e4e4]">{review.reviewer}</span>
              <div className="size-[4px] rounded-full bg-[#555] dark:bg-[#8b92a5]" />
              <span className="text-[#555] dark:text-[#8b92a5]">{review.date}</span>
              {review.photoCount && (
                <>
                  <div className="size-[4px] rounded-full bg-[#555] dark:bg-[#8b92a5]" />
                  <span className="text-[#555] dark:text-[#8b92a5]">{review.photoCount} Photos</span>
                </>
              )}
              {review.featured && (
                <>
                  <div className="size-[4px] rounded-full bg-[#555] dark:bg-[#8b92a5]" />
                  <div className="bg-[#eaeaea] dark:bg-[#333a47] px-2 py-1 rounded-[4px]">
                    <span className="text-[12px] text-[#212121] dark:text-[#e4e4e4]">Featured</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Employee & location meta */}
        <div className="flex items-center gap-3 text-[13px] text-[#999] dark:text-[#8b92a5]">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" viewBox="0 0 11.2937 12" fill="none">
              <path clipRule="evenodd" d={svgPaths.pa635500} fill="currentColor" fillRule="evenodd" />
            </svg>
            <span>{review.employees} employees</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" viewBox="0 0 9.7974 11.8269" fill="none">
              <path d={svgPaths.p12721780} fill="currentColor" />
            </svg>
            <span>{review.location}</span>
          </div>
        </div>
      </div>

      {/* Review text */}
      <p className="text-[14px] text-[#212121] dark:text-[#d0d0d0] leading-[20px]">{review.text}</p>

      {/* Photo carousel */}
      {review.photos.length > 0 && <PhotoCarousel photos={review.photos} />}

      {/* BirdAI suggested reply */}
      <BirdAIReply hasThreeDots={review.hasReplyDots} />

      {/* Action row */}
      <ActionRow replyStatus={review.replyStatus} />
    </div>
  );
}

/* ─── Reviews filter definitions ─── */
const reviewFilters: FilterItem[] = [
  {
    id: "review_source",
    label: "Source",
    options: ["All sources", "Google", "Yelp", "Facebook", "TripAdvisor"],
  },
  {
    id: "review_rating",
    label: "Rating",
    options: ["All ratings", "5 stars", "4 stars", "3 stars", "2 stars", "1 star"],
  },
  {
    id: "review_status",
    label: "Reply status",
    options: ["All statuses", "Replied", "Not replied", "Draft"],
  },
  {
    id: "review_date",
    label: "Date range",
    options: ["All time", "Today", "Last 7 days", "Last 30 days", "Last 90 days", "Last year"],
  },
  {
    id: "review_location",
    label: "Location",
    options: ["All locations", "Georgia", "New York", "California", "Texas", "Florida"],
  },
  {
    id: "review_sentiment",
    label: "Sentiment",
    options: ["All sentiments", "Positive", "Neutral", "Negative"],
  },
  {
    id: "review_keyword",
    label: "Keywords",
    options: ["All keywords", "Ambience", "Food", "Service", "Price", "Cleanliness"],
  },
  {
    id: "review_featured",
    label: "Featured",
    options: ["All", "Featured only", "Not featured"],
  },
  {
    id: "review_photos",
    label: "Has photos",
    options: ["All", "With photos", "Without photos"],
  },
  {
    id: "review_employee",
    label: "Employee",
    options: ["All employees", "Unassigned", "Sampada", "John", "Maria"],
  },
];

/* ─── Main ReviewsView ─── */
export function ReviewsView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState<FilterItem[]>(reviewFilters);

  const filteredReviews = mockReviews.filter((review) =>
    searchQuery
      ? review.reviewer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.text.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden bg-white dark:bg-[#1e2229] transition-colors duration-300">
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0">
          <div className="flex flex-col gap-1">
            <h1 className="text-[17px] text-[#212121] dark:text-[#e4e4e4]">All reviews</h1>
            <div className="flex items-center gap-1 text-[12px] text-[#555] dark:text-[#8b92a5]">
              <span>832 total reviews</span>
              <div className="size-[3px] rounded-full bg-[#555] dark:bg-[#8b92a5] mx-0.5" />
              <span>4.1</span>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-[10px] h-[10px] ${
                      i < 4
                        ? "fill-[#f57c00] text-[#f57c00]"
                        : "fill-[#ccc] text-[#ccc] dark:fill-[#555] dark:text-[#555]"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search icon button */}
            <button className="h-[36px] w-[36px] bg-white dark:bg-[#262b35] border border-[#e5e9f0] dark:border-[#333a47] rounded-[8px] flex items-center justify-center hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340] transition-colors">
              <Search className="w-[14px] h-[14px] text-[#303030] dark:text-[#8b92a5]" />
            </button>

            {/* Recent reviews dropdown */}
            <button className="h-[36px] px-2 bg-white dark:bg-[#262b35] border border-[#e5e9f0] dark:border-[#333a47] rounded-[8px] flex items-center gap-2 text-[14px] text-[#757575] dark:text-[#8b92a5] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340] transition-colors">
              <span>Recent reviews</span>
              <svg className="w-[9px] h-[5px]" viewBox="0 0 9.01782 5.0176" fill="none">
                <path d={svgPaths.p5ccaa80} fill="#303030" className="dark:fill-[#8b92a5]" />
              </svg>
            </button>

            {/* More options */}
            <button className="h-[36px] w-[36px] bg-white dark:bg-[#262b35] border border-[#e5e9f0] dark:border-[#333a47] rounded-[8px] flex items-center justify-center hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340] transition-colors">
              <MoreVertical className="w-[14px] h-[14px] text-[#303030] dark:text-[#8b92a5]" />
            </button>

            {/* AI button */}
            <button className="h-[36px] w-[36px] bg-white dark:bg-[#262b35] border border-[#e5e9f0] dark:border-[#333a47] rounded-[8px] flex items-center justify-center hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340] transition-colors">
              <svg className="w-[14px] h-[14px]" viewBox="0 0 16.6975 14.8252" fill="none">
                <path d={svgPaths.p33170700} fill="#6834B7" />
                <path d={svgPaths.p2d8f3b80} fill="#6834B7" />
                <path clipRule="evenodd" d={svgPaths.p1692000} fill="#6834B7" fillRule="evenodd" />
                <path d={svgPaths.p4cf0c70} fill="#6834B7" />
              </svg>
            </button>

            {/* Filter button */}
            <button
              onClick={() => setFilterPanelOpen(!filterPanelOpen)}
              className={`h-[36px] w-[36px] border rounded-[8px] flex items-center justify-center transition-colors ${
                filterPanelOpen
                  ? "bg-[#e8effe] dark:bg-[#1e2d5e] border-[#2552ED] dark:border-[#2552ED]"
                  : "bg-white dark:bg-[#262b35] border-[#e5e9f0] dark:border-[#333a47] hover:bg-[#f5f5f5] dark:hover:bg-[#2e3340]"
              }`}
            >
              <Filter className={`w-[14px] h-[14px] ${filterPanelOpen ? "text-[#2552ED]" : "text-[#555] dark:text-[#8b92a5]"}`} />
            </button>
          </div>
        </div>

        {/* Reviews feed */}
        <div className="flex-1 overflow-y-auto px-5 pb-6">
          <div className="flex flex-col gap-6">
            {filteredReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      </div>

      {/* ─── Filter panel (collapsible) ─── */}
      {filterPanelOpen && (
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          collapsed={false}
          onToggleCollapse={() => setFilterPanelOpen(false)}
          title="Review filters"
          storageKey="birdeye_reviews_filters"
        />
      )}
    </div>
  );
}