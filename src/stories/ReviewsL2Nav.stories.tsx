import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ChevronUp, ChevronDown, ExternalLink } from "lucide-react";

/**
 * Standalone renderer for the Reviews L2 Nav panel.
 * Accepts initial state so each story can demonstrate a different starting condition.
 * The component is fully interactive — click sections to collapse, click items to activate.
 */

const reviewsSections = [
  {
    label: "Actions",
    children: ["Reply manually", "Monitor agent replies"],
  },
  {
    label: "Reviews",
    children: [
      "All",
      "Google",
      "Yelp",
      "This month",
      "Last 30 days",
      "Last 7 days",
      "High rated (4, 5 stars)",
      "Low rated (1, 2, 3 stars)",
      "Archived",
    ],
  },
  {
    label: "Competitors",
    children: ["Benchmarking", "Head to head", "Reviews"],
  },
  {
    label: "Agents",
    children: [
      "Review generation agents",
      "Review response agents",
      "Review monitoring agents",
      "Review marketing agents",
    ],
  },
  {
    label: "Libraries",
    children: ["Request templates", "Response templates", "QR codes", "Widgets"],
  },
];

type SectionKey = (typeof reviewsSections)[number]["label"];

interface ReviewsNavProps {
  /** Which sections start expanded. Defaults to all. */
  initialExpanded?: SectionKey[];
  /** Which item starts active in "Section/Item" format. */
  initialActive?: string;
}

function ReviewsNav({ initialExpanded, initialActive = "Reviews/All" }: ReviewsNavProps) {
  const defaultExpanded = initialExpanded
    ? Object.fromEntries(reviewsSections.map(s => [s.label, initialExpanded.includes(s.label as SectionKey)]))
    : Object.fromEntries(reviewsSections.map(s => [s.label, true]));

  const [expanded, setExpanded] = useState<Record<string, boolean>>(defaultExpanded);
  const [activeItem, setActiveItem] = useState(initialActive);

  const toggle = (label: string) =>
    setExpanded(prev => ({ ...prev, [label]: !prev[label] }));

  const childCls = (active: boolean) =>
    `text-left w-full px-[14px] py-[6px] text-[13px] rounded-[4px] transition-colors tracking-[-0.26px] ${
      active
        ? "text-[#1E44CC] bg-[#dce5ff] dark:bg-[#1e2d5e] dark:text-[#7fa8ff]"
        : "text-[#555] dark:text-[#9ba2b0] hover:bg-[#e4e6ea] dark:hover:bg-[#2e3340]"
    }`;

  return (
    <div className="w-[220px] bg-[#f0f1f5] dark:bg-[#1e2229] border-r border-[#e5e9f0] dark:border-[#2e3340] flex flex-col h-full overflow-hidden shrink-0 transition-colors duration-300">
      <div className="flex-1 overflow-y-auto px-2 pt-3 pb-4 flex flex-col gap-0.5">

        {/* Send a review request */}
        <button className="flex items-center justify-between px-2 py-[7px] w-full rounded-[4px] hover:bg-[#e4e6ea] dark:hover:bg-[#2e3340] transition-colors mb-1">
          <span className="text-[14px] text-[#212121] dark:text-[#e4e4e4] tracking-[-0.28px]">
            Send a review request
          </span>
          <div className="w-5 h-5 bg-[#1E44CC] rounded-full flex items-center justify-center shrink-0">
            <span className="text-white text-[13px] leading-none select-none">+</span>
          </div>
        </button>

        {/* Collapsible sections */}
        {reviewsSections.map(section => (
          <div key={section.label}>
            <button
              onClick={() => toggle(section.label)}
              className="flex items-center justify-between px-2 py-[7px] w-full rounded-[4px] hover:bg-[#e4e6ea] dark:hover:bg-[#2e3340] transition-colors"
            >
              <span className="text-[13px] text-[#212121] dark:text-[#e4e4e4] tracking-[-0.26px]" style={{ fontWeight: 400 }}>
                {section.label}
              </span>
              {expanded[section.label]
                ? <ChevronUp className="w-3.5 h-3.5 text-[#888] dark:text-[#6b7280] shrink-0" />
                : <ChevronDown className="w-3.5 h-3.5 text-[#888] dark:text-[#6b7280] shrink-0" />
              }
            </button>

            {expanded[section.label] && (
              <div className="flex flex-col gap-0.5 mb-1">
                {section.children.map(child => {
                  const key = `${section.label}/${child}`;
                  return (
                    <button
                      key={child}
                      onClick={() => setActiveItem(key)}
                      className={childCls(activeItem === key)}
                      style={{ fontWeight: activeItem === key ? 400 : 300 }}
                    >
                      {child}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* Reports — external link */}
        <button className="flex items-center justify-between px-2 py-[7px] w-full rounded-[4px] hover:bg-[#e4e6ea] dark:hover:bg-[#2e3340] transition-colors mt-0.5">
          <span className="text-[13px] text-[#212121] dark:text-[#e4e4e4] tracking-[-0.26px]" style={{ fontWeight: 400 }}>
            Reports
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-[#888] dark:text-[#6b7280] shrink-0" />
        </button>

      </div>
    </div>
  );
}

/* ── frame helper ──────────────────────────────────── */
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#e0e5eb] dark:bg-[#13161b] transition-colors duration-300">
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   META
   ══════════════════════════════════════════════════════ */
const meta: Meta = {
  title: "App/Reviews L2 Nav",
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

/* ══════════════════════════════════════════════════════
   STATES
   ══════════════════════════════════════════════════════ */

/** Default — all sections expanded, "All" active (the entry point for the Reviews module) */
export const Default: Story = {
  name: "State / Default — All Reviews active",
  render: () => (
    <Frame>
      <ReviewsNav />
    </Frame>
  ),
};

/** Active — a specific platform filter selected */
export const GoogleActive: Story = {
  name: "State / Active — Google",
  render: () => (
    <Frame>
      <ReviewsNav initialActive="Reviews/Google" />
    </Frame>
  ),
};

export const YelpActive: Story = {
  name: "State / Active — Yelp",
  render: () => (
    <Frame>
      <ReviewsNav initialActive="Reviews/Yelp" />
    </Frame>
  ),
};

export const HighRatedActive: Story = {
  name: "State / Active — High rated",
  render: () => (
    <Frame>
      <ReviewsNav initialActive="Reviews/High rated (4, 5 stars)" />
    </Frame>
  ),
};

export const LowRatedActive: Story = {
  name: "State / Active — Low rated",
  render: () => (
    <Frame>
      <ReviewsNav initialActive="Reviews/Low rated (1, 2, 3 stars)" />
    </Frame>
  ),
};

export const ArchivedActive: Story = {
  name: "State / Active — Archived",
  render: () => (
    <Frame>
      <ReviewsNav initialActive="Reviews/Archived" />
    </Frame>
  ),
};

export const CompetitorBenchmarking: Story = {
  name: "State / Active — Competitors: Benchmarking",
  render: () => (
    <Frame>
      <ReviewsNav initialActive="Competitors/Benchmarking" />
    </Frame>
  ),
};

export const AgentGeneration: Story = {
  name: "State / Active — Agents: Review generation",
  render: () => (
    <Frame>
      <ReviewsNav initialActive="Agents/Review generation agents" />
    </Frame>
  ),
};

export const LibraryTemplates: Story = {
  name: "State / Active — Libraries: Request templates",
  render: () => (
    <Frame>
      <ReviewsNav initialActive="Libraries/Request templates" />
    </Frame>
  ),
};

/** Collapsed — Reviews section collapsed, showing only headers */
export const ReviewsCollapsed: Story = {
  name: "State / Reviews section collapsed",
  render: () => (
    <Frame>
      <ReviewsNav
        initialExpanded={["Actions", "Competitors", "Agents", "Libraries"]}
        initialActive="Reviews/All"
      />
    </Frame>
  ),
};

/** All sections collapsed — maximum compact view */
export const AllCollapsed: Story = {
  name: "State / All sections collapsed",
  render: () => (
    <Frame>
      <ReviewsNav initialExpanded={[]} />
    </Frame>
  ),
};

/** Only Reviews section open */
export const OnlyReviewsExpanded: Story = {
  name: "State / Only Reviews section open",
  render: () => (
    <Frame>
      <ReviewsNav initialExpanded={["Reviews"]} />
    </Frame>
  ),
};

/** Only Actions section open */
export const OnlyActionsExpanded: Story = {
  name: "State / Only Actions section open",
  render: () => (
    <Frame>
      <ReviewsNav initialExpanded={["Actions"]} />
    </Frame>
  ),
};
