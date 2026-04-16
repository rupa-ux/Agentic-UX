import { ArrowLeft, Clock3, Sparkles } from "lucide-react";
import { ActivityFeed } from "./ActivityFeed";

interface ActivityDrawerContentProps {
  postId: string;
  onClose: () => void;
}

export function ActivityDrawerContent({ postId, onClose }: ActivityDrawerContentProps) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[#f7f8fb] dark:bg-[#181b22] transition-colors duration-300">
      <div className="border-b border-[#e3e8f1] dark:border-[#2e3340] bg-[rgba(247,248,251,0.92)] dark:bg-[rgba(24,27,34,0.92)] px-6 py-5 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dfe5ef] dark:border-[#2e3340] bg-white dark:bg-[#252a35] text-[#303030] dark:text-[#c0c6d4] transition-colors hover:bg-[#f3f6fb] dark:hover:bg-[#2e3340]"
              onClick={onClose}
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[22px] tracking-[-0.6px] text-[#212121] dark:text-[#e4e8f0]">Activity</p>
                <span className="rounded-full bg-[#eef4ff] dark:bg-[#1a2d4a] px-3 py-1 text-[12px] text-[#1f78d1] dark:text-[#5b9cf6]">
                  Timeline
                </span>
              </div>
              <p className="mt-1 text-[13px] text-[#667085] dark:text-[#6b7a94]">
                A cleaner audit trail for content edits, approvals, scheduling, and delivery changes.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-[#667085] dark:text-[#6b7a94]">
            <div className="flex items-center gap-2 rounded-full border border-[#e3e8f1] dark:border-[#2e3340] bg-white dark:bg-[#252a35] px-3 py-2">
              <Clock3 size={14} />
              <span>Most recent first</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[#e3e8f1] dark:border-[#2e3340] bg-white dark:bg-[#252a35] px-3 py-2 text-[#6b36b7] dark:text-[#b48ae0]">
              <Sparkles size={14} />
              <span>Premium audit view</span>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-6 py-6">
        <div className="mx-auto max-w-[920px] rounded-[24px] border border-[#e5e9f0] dark:border-[#2e3340] bg-white dark:bg-[#1e2229] p-2 shadow-[0_24px_60px_rgba(15,23,42,0.06)] dark:shadow-none">
          <div className="rounded-[20px] bg-[linear-gradient(180deg,#ffffff_0%,#fafbfd_100%)] dark:bg-[#1e2229] px-2 py-2">
            <ActivityFeed postId={postId} />
          </div>
        </div>
      </div>
    </div>
  );
}
