import { useEffect, useMemo, useRef, useState } from "react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import {
  ArrowUp,
  AtSign,
  Ban,
  Bot,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  Filter,
  Globe,
  Image as ImageIcon,
  MessageSquare,
  MoreHorizontal,
  MoreVertical,
  Paperclip,
  Play,
  Search,
  Send,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Ticket,
  UserX,
  Volume2,
} from "lucide-react";
import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";
import { AppDataTable } from "@/app/components/ui/AppDataTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/app/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Textarea } from "@/app/components/ui/textarea";
import { cn } from "@/app/components/ui/utils";

type AppointmentStatus =
  | "confirmed"
  | "unconfirmed"
  | "rescheduling-requested"
  | "cancelled"
  | "no-show"
  | "waitlisted";

type BookedBySource = "agent" | "user";

type BookedBy = {
  source: BookedBySource;
  /** User name when source is "user"; ignored otherwise. */
  name?: string;
};

type ConversationChannel = "chat" | "voice";

type AppointmentRow = {
  id: string;
  patientName: string;
  patientAge: number;
  patientAvatarUrl?: string;
  provider: string;
  apptType: string;
  dateTimeIso: string;
  status: AppointmentStatus;
  bookedBy: BookedBy;
  conversationChannel?: ConversationChannel;
};

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  confirmed: "Confirmed",
  unconfirmed: "Unconfirmed",
  "rescheduling-requested": "Rescheduling requested",
  cancelled: "Cancelled",
  "no-show": "No-show",
  waitlisted: "Waitlisted",
};

const STATUS_CLASS: Record<AppointmentStatus, string> = {
  confirmed: "bg-emerald-50 text-emerald-700",
  unconfirmed: "bg-amber-50 text-amber-800",
  "rescheduling-requested": "bg-sky-50 text-sky-700",
  cancelled: "bg-rose-50 text-rose-700",
  "no-show": "bg-rose-50 text-rose-700",
  waitlisted: "bg-violet-50 text-violet-700",
};

const APPOINTMENTS: AppointmentRow[] = [
  {
    id: "a1",
    patientName: "Sarah Mitchell",
    patientAge: 40,
    patientAvatarUrl: "https://i.pravatar.cc/96?img=47",
    provider: "Dr. Karen Lee",
    apptType: "Annual physical",
    dateTimeIso: "2026-05-15T09:00",
    status: "confirmed",
    bookedBy: { source: "agent" },
    conversationChannel: "voice",
  },
  {
    id: "a2",
    patientName: "David Kim",
    patientAge: 27,
    patientAvatarUrl: "https://i.pravatar.cc/96?img=12",
    provider: "Dr. Karen Lee",
    apptType: "Follow-up",
    dateTimeIso: "2026-05-15T10:30",
    status: "unconfirmed",
    bookedBy: { source: "user", name: "Jamie Rivera" },
  },
  {
    id: "a3",
    patientName: "Sophia Patel",
    patientAge: 33,
    patientAvatarUrl: "https://i.pravatar.cc/96?img=45",
    provider: "Dr. Karen Lee",
    apptType: "Telehealth",
    dateTimeIso: "2026-05-15T11:00",
    status: "rescheduling-requested",
    bookedBy: { source: "agent" },
  },
  {
    id: "a4",
    patientName: "Ella Mitchell",
    patientAge: 26,
    patientAvatarUrl: "https://i.pravatar.cc/96?img=49",
    provider: "Dr. Nina Brooks",
    apptType: "New consult",
    dateTimeIso: "2026-05-16T09:30",
    status: "confirmed",
    bookedBy: { source: "agent" },
  },
  {
    id: "a5",
    patientName: "Priya Subramanian",
    patientAge: 35,
    patientAvatarUrl: "https://i.pravatar.cc/96?img=32",
    provider: "Dr. Alan Patel",
    apptType: "Urgent care",
    dateTimeIso: "2026-05-16T10:00",
    status: "confirmed",
    bookedBy: { source: "user", name: "Maria Chen" },
    conversationChannel: "voice",
  },
  {
    id: "a6",
    patientName: "Mason Clark",
    patientAge: 56,
    patientAvatarUrl: "https://i.pravatar.cc/96?img=15",
    provider: "Dr. Alan Patel",
    apptType: "Follow-up",
    dateTimeIso: "2026-05-16T14:00",
    status: "cancelled",
    bookedBy: { source: "agent" },
  },
  {
    id: "a7",
    patientName: "Nadia Hartwell",
    patientAge: 44,
    patientAvatarUrl: "https://i.pravatar.cc/96?img=23",
    provider: "Dr. Karen Lee",
    apptType: "Procedure",
    dateTimeIso: "2026-05-17T08:00",
    status: "confirmed",
    bookedBy: { source: "user", name: "Jamie Rivera" },
    conversationChannel: "voice",
  },
  {
    id: "a8",
    patientName: "Eleanor Moss",
    patientAge: 53,
    patientAvatarUrl: "https://i.pravatar.cc/96?img=44",
    provider: "Dr. Nina Brooks",
    apptType: "Annual physical",
    dateTimeIso: "2026-05-17T11:30",
    status: "no-show",
    bookedBy: { source: "agent" },
  },
  {
    id: "a9",
    patientName: "Chen Wei",
    patientAge: 42,
    patientAvatarUrl: "https://i.pravatar.cc/96?img=13",
    provider: "Dr. Alan Patel",
    apptType: "Telehealth",
    dateTimeIso: "2026-05-17T13:00",
    status: "unconfirmed",
    bookedBy: { source: "agent" },
  },
  {
    id: "a10",
    patientName: "Marcus Hill",
    patientAge: 61,
    patientAvatarUrl: "https://i.pravatar.cc/96?img=11",
    provider: "Dr. Karen Lee",
    apptType: "Follow-up",
    dateTimeIso: "2026-05-18T09:15",
    status: "cancelled",
    bookedBy: { source: "user", name: "Maria Chen" },
  },
  {
    id: "a11",
    patientName: "Lina Alvarez",
    patientAge: 29,
    patientAvatarUrl: "https://i.pravatar.cc/96?img=20",
    provider: "Dr. Nina Brooks",
    apptType: "New consult",
    dateTimeIso: "2026-05-18T10:45",
    status: "waitlisted",
    bookedBy: { source: "agent" },
  },
  {
    id: "a12",
    patientName: "Owen Schmidt",
    patientAge: 38,
    patientAvatarUrl: "https://i.pravatar.cc/96?img=33",
    provider: "Dr. Alan Patel",
    apptType: "Urgent care",
    dateTimeIso: "2026-05-18T15:30",
    status: "no-show",
    bookedBy: { source: "agent" },
  },
];

type StatFilter = "all" | "unconfirmed" | "cancelled" | "no-show";

const STAT_FILTERS: {
  key: StatFilter;
  label: string;
  icon: React.ReactNode;
  count: (c: { total: number; unconfirmed: number; cancelled: number; noShow: number }) => number;
}[] = [
  {
    key: "all",
    label: "Appointments",
    icon: <CalendarDays className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />,
    count: (c) => c.total,
  },
  {
    key: "unconfirmed",
    label: "Unconfirmed",
    icon: <Clock className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />,
    count: (c) => c.unconfirmed,
  },
  {
    key: "cancelled",
    label: "Cancellations received",
    icon: <Ban className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />,
    count: (c) => c.cancelled,
  },
  {
    key: "no-show",
    label: "No-shows",
    icon: <UserX className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />,
    count: (c) => c.noShow,
  },
];

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${date} ${time}`;
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type ChatTurn = {
  speaker: "patient" | "agent";
  text: string;
  time: string;
};

const CONVERSATIONS: Record<string, ChatTurn[]> = {
  a1: [
    { speaker: "patient", text: "Hi, I need to schedule my annual physical for next month.", time: "May 10, 2:14 PM" },
    { speaker: "agent", text: "Happy to help, Sarah. I see you’re due — Dr. Karen Lee has openings on May 15 at 9:00 AM or May 20 at 11:30 AM. Which works better?", time: "May 10, 2:14 PM" },
    { speaker: "patient", text: "May 15 at 9 works.", time: "May 10, 2:15 PM" },
    { speaker: "agent", text: "Booked — you’re confirmed with Dr. Karen Lee on May 15 at 9:00 AM. I’ll send a reminder 48 hours before. Anything else?", time: "May 10, 2:15 PM" },
    { speaker: "patient", text: "That’s it, thanks!", time: "May 10, 2:16 PM" },
  ],
  a2: [
    { speaker: "patient", text: "Need a follow-up after my visit last week.", time: "May 12, 9:02 AM" },
    { speaker: "agent", text: "Got it, David. Dr. Karen Lee can see you May 15 at 10:30 AM. Want me to hold it?", time: "May 12, 9:02 AM" },
    { speaker: "patient", text: "Yes please.", time: "May 12, 9:03 AM" },
    { speaker: "agent", text: "Held. Please reply YES to this message to confirm. The slot will release in 24 hours otherwise.", time: "May 12, 9:03 AM" },
  ],
  a3: [
    { speaker: "patient", text: "Can we move my telehealth visit on May 15?", time: "May 13, 4:48 PM" },
    { speaker: "agent", text: "Of course. What times work for you this week?", time: "May 13, 4:48 PM" },
    { speaker: "patient", text: "Maybe Friday afternoon?", time: "May 13, 4:50 PM" },
    { speaker: "agent", text: "I’ve flagged the original slot for rescheduling and reserved Friday May 16 at 3:15 PM pending your confirmation. Should I lock it in?", time: "May 13, 4:50 PM" },
  ],
};

function ChatBubble({
  turn,
  patientName,
  patientAvatarUrl,
  onThumbsUp,
  onThumbsDown,
}: {
  turn: ChatTurn;
  patientName: string;
  patientAvatarUrl?: string;
  onThumbsUp?: () => void;
  onThumbsDown?: () => void;
}) {
  const isAgent = turn.speaker === "agent";
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  const handleUp = () => {
    const next = feedback === "up" ? null : "up";
    setFeedback(next);
    if (next === "up") onThumbsUp?.();
  };

  const handleDown = () => {
    const next = feedback === "down" ? null : "down";
    setFeedback(next);
    if (next === "down") onThumbsDown?.();
  };

  return (
    <div className={cn("flex flex-col gap-1", isAgent ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[72%] rounded-2xl px-4 py-3 text-[13px] leading-[1.6] text-foreground",
          isAgent ? "bg-blue-50" : "border border-border bg-card",
        )}
      >
        {turn.text}
      </div>

      <div className={cn("flex items-center gap-2 px-1", isAgent ? "flex-row-reverse" : "flex-row")}>
        <span className="text-[11px] italic text-muted-foreground">
          {isAgent ? "Agent" : patientName}
          <span className="mx-1 not-italic">·</span>
          {turn.time}
        </span>
        {isAgent ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Thumbs up"
              onClick={handleUp}
              className={cn(
                "inline-flex size-6 items-center justify-center rounded-md transition-colors",
                feedback === "up"
                  ? "text-emerald-600"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <ThumbsUp className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
            </button>
            <button
              type="button"
              aria-label="Thumbs down"
              onClick={handleDown}
              className={cn(
                "inline-flex size-6 items-center justify-center rounded-md transition-colors",
                feedback === "down"
                  ? "text-rose-600"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <ThumbsDown className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ─── Voice call drawer ──────────────────────────────────────────────────────

type CallMarker = { atSeconds: number; color: string };

type VoiceCall = {
  durationSeconds: number;
  timestampLabel: string;
  agentName: string;
  resolution: "Resolved" | "Open" | "Pending";
  tag?: string;
  summary: string;
  actionItems: string[];
  transcript: ChatTurn[];
  /** Waveform bar heights (0..1). */
  waveform: number[];
  markers: CallMarker[];
};

function makeWaveform(seed: number, count = 96): number[] {
  // Deterministic-ish pseudo-random heights so the bars don't reshuffle each render.
  const out: number[] = [];
  let x = seed;
  for (let i = 0; i < count; i++) {
    x = (x * 9301 + 49297) % 233280;
    const r = x / 233280;
    out.push(0.18 + r * 0.78);
  }
  return out;
}

const VOICE_AGENT_NAME = "Aria · Voice agent";

const VOICE_CALLS: Record<string, VoiceCall> = {
  a1: {
    durationSeconds: 210,
    timestampLabel: "Today, 2:14 PM",
    agentName: VOICE_AGENT_NAME,
    resolution: "Resolved",
    tag: "Annual physical",
    summary:
      "Patient called to schedule her annual physical. Agent confirmed eligibility, offered May 15 at 9:00 AM with Dr. Karen Lee, and booked the slot. Reminder set for 48 hours before. No outstanding follow-ups.",
    actionItems: [
      "Send 48-hour reminder SMS on May 13",
      "Email pre-visit intake form to patient",
      "Flag fasting requirement on the appointment note",
    ],
    transcript: [
      {
        speaker: "patient",
        text: "Hi, I’d like to schedule my annual physical for next month if there’s an opening.",
        time: "Today, 2:14 PM",
      },
      {
        speaker: "agent",
        text: "Of course, Sarah. I see Dr. Karen Lee has openings on May 15 at 9 AM or May 20 at 11:30 AM — which works better?",
        time: "Today, 2:14 PM",
      },
      { speaker: "patient", text: "May 15 at 9 is perfect.", time: "Today, 2:15 PM" },
      {
        speaker: "agent",
        text: "Done — you’re confirmed with Dr. Karen Lee on May 15 at 9 AM. I’ll send a reminder 48 hours before. Anything else?",
        time: "Today, 2:15 PM",
      },
    ],
    waveform: makeWaveform(101),
    markers: [
      { atSeconds: 5, color: "bg-sky-500" },
      { atSeconds: 65, color: "bg-rose-500" },
      { atSeconds: 80, color: "bg-amber-500" },
      { atSeconds: 145, color: "bg-emerald-500" },
    ],
  },
  a5: {
    durationSeconds: 248,
    timestampLabel: "Yesterday, 11:02 AM",
    agentName: VOICE_AGENT_NAME,
    resolution: "Resolved",
    tag: "Urgent care",
    summary:
      "Patient called with acute back pain. Agent triaged severity, confirmed insurance eligibility, and booked a same-day urgent care visit with Dr. Alan Patel. Patient advised to bring current medications list.",
    actionItems: [
      "Confirm Dr. Alan Patel availability for May 16 10:00 AM",
      "Send pre-visit medication checklist",
      "Verify Aetna coverage before visit",
    ],
    transcript: [
      {
        speaker: "patient",
        text: "Hi, I’ve had really bad lower back pain since yesterday. Can I be seen today?",
        time: "Yesterday, 11:02 AM",
      },
      {
        speaker: "agent",
        text: "Sorry to hear that, Priya. Let me check our urgent care slots — I see Dr. Alan Patel can see you today at 10 AM. Should I hold it?",
        time: "Yesterday, 11:02 AM",
      },
      { speaker: "patient", text: "Yes please.", time: "Yesterday, 11:03 AM" },
      {
        speaker: "agent",
        text: "Confirmed. Please bring your current medications list. The clinic is on the 2nd floor — front desk will check you in.",
        time: "Yesterday, 11:03 AM",
      },
    ],
    waveform: makeWaveform(207),
    markers: [
      { atSeconds: 12, color: "bg-sky-500" },
      { atSeconds: 110, color: "bg-amber-500" },
      { atSeconds: 200, color: "bg-emerald-500" },
    ],
  },
  a7: {
    durationSeconds: 326,
    timestampLabel: "Today, 9:18 AM",
    agentName: VOICE_AGENT_NAME,
    resolution: "Resolved",
    tag: "Procedure",
    summary:
      "Patient called to prepare for an upcoming procedure. Agent reviewed pre-op fasting instructions, confirmed transportation plan, and verified consent forms were on file. Follow-up reminder scheduled.",
    actionItems: [
      "Send pre-op fasting reminder May 16 evening",
      "Confirm transportation arrangement with patient on May 16",
      "Upload signed consent form to Athena",
    ],
    transcript: [
      {
        speaker: "patient",
        text: "Hi, I want to confirm what I need to do before my procedure on Thursday.",
        time: "Today, 9:18 AM",
      },
      {
        speaker: "agent",
        text: "Sure, Nadia. You’ll want to fast from midnight the night before, and arrange a ride home since you can’t drive after. I’ll send the full instructions over text.",
        time: "Today, 9:18 AM",
      },
      { speaker: "patient", text: "Got it. Do I need to bring anything?", time: "Today, 9:19 AM" },
      {
        speaker: "agent",
        text: "Just a photo ID, your insurance card, and the consent form I emailed last week. I’ll resend it now to be safe.",
        time: "Today, 9:19 AM",
      },
    ],
    waveform: makeWaveform(355),
    markers: [
      { atSeconds: 18, color: "bg-sky-500" },
      { atSeconds: 142, color: "bg-amber-500" },
      { atSeconds: 250, color: "bg-emerald-500" },
    ],
  },
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function Waveform({ call }: { call: VoiceCall }) {
  // Show ~10% of the playhead as a visual cue (not a real player).
  const playheadIndex = Math.floor(call.waveform.length * 0.04);
  return (
    <div className="relative">
      {/* Marker dots above the bars */}
      <div className="relative mb-1 h-2 w-full">
        {call.markers.map((m, i) => {
          const pct = (m.atSeconds / call.durationSeconds) * 100;
          return (
            <span
              key={i}
              className={cn("absolute top-0 size-2 rounded-full", m.color)}
              style={{ left: `calc(${pct}% - 4px)` }}
              aria-hidden
            />
          );
        })}
      </div>
      {/* Bars */}
      <div className="flex h-16 items-end gap-[2px]">
        {call.waveform.map((h, i) => {
          const active = i <= playheadIndex;
          return (
            <span
              key={i}
              className={cn(
                "block flex-1 rounded-full",
                active ? "bg-primary" : "bg-border",
              )}
              style={{ height: `${Math.round(h * 100)}%` }}
              aria-hidden
            />
          );
        })}
      </div>
      <div className="mt-1 flex items-center justify-between text-[11px] tabular-nums text-muted-foreground">
        <span>0:00</span>
        <span>{formatDuration(call.durationSeconds)}</span>
      </div>
    </div>
  );
}

function PlaybackControls() {
  const [speed, setSpeed] = useState<"1x" | "2.5x" | "3x">("1x");
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Play"
          className="inline-flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90"
        >
          <Play className="size-4 fill-current" strokeWidth={0} />
        </button>
        <button type="button" aria-label="Skip back" className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted">
          <SkipBack className="size-4" strokeWidth={1.6} absoluteStrokeWidth />
        </button>
        <button type="button" aria-label="Skip forward" className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted">
          <SkipForward className="size-4" strokeWidth={1.6} absoluteStrokeWidth />
        </button>
        {(["1x", "2.5x", "3x"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSpeed(s)}
            className={cn(
              "h-7 rounded-md px-2 text-[12px] font-medium",
              speed === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
            )}
          >
            {s}
          </button>
        ))}
        <button type="button" aria-label="Volume" className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted">
          <Volume2 className="size-4" strokeWidth={1.6} absoluteStrokeWidth />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-card px-2 text-[12px] text-foreground hover:bg-muted"
        >
          <Globe className="size-3.5 text-muted-foreground" strokeWidth={1.6} absoluteStrokeWidth />
          English
          <ChevronDown className="size-3 text-muted-foreground" strokeWidth={1.6} absoluteStrokeWidth />
        </button>
        <button
          type="button"
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-[12px] text-foreground hover:bg-muted"
        >
          <Ticket className="size-3.5 text-muted-foreground" strokeWidth={1.6} absoluteStrokeWidth />
          Ticket
        </button>
      </div>
    </div>
  );
}

// ─── Agent feedback interaction ────────────────────────────────────────────

const APPOINTMENT_FEEDBACK_REASONS = [
  "Wrong tone",
  "Incorrect information",
  "Poor scheduling",
  "Missing details",
  "Too long",
];

function useAgentFeedback() {
  const [selectedFeedback, setSelectedFeedback] = useState<"up" | "down" | null>(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [feedbackDetails, setFeedbackDetails] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastVariant, setToastVariant] = useState<"thanks" | "working">("thanks");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const showToast = (variant: "thanks" | "working") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToastVariant(variant);
    setToastVisible(true);
    timerRef.current = setTimeout(() => {
      setToastVisible(false);
      timerRef.current = null;
    }, variant === "working" ? 6000 : 2200);
  };

  const toggleReason = (reason: string) =>
    setSelectedReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason],
    );

  const handleThumbsUp = () => { setSelectedFeedback("up"); showToast("thanks"); };
  const handleThumbsDown = () => { setSelectedFeedback("down"); setFeedbackDialogOpen(true); };
  const handleSubmitFeedback = () => { setFeedbackDialogOpen(false); showToast("working"); };
  const handleDismissToast = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    setToastVisible(false);
  };

  return {
    selectedFeedback,
    feedbackDialogOpen, setFeedbackDialogOpen,
    selectedReasons, toggleReason,
    feedbackDetails, setFeedbackDetails,
    toastVisible, toastVariant,
    handleThumbsUp, handleThumbsDown, handleSubmitFeedback, handleDismissToast,
  };
}

function AgentFeedbackThumbButtons({
  selectedFeedback,
  onThumbsUp,
  onThumbsDown,
}: {
  selectedFeedback: "up" | "down" | null;
  onThumbsUp: () => void;
  onThumbsDown: () => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        aria-label="Good response"
        aria-pressed={selectedFeedback === "up"}
        onClick={onThumbsUp}
        className={cn(
          "inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          selectedFeedback === "up" &&
            "border border-[#138a36] bg-[#f1faf0] text-[#138a36] hover:bg-[#e8f6eb] hover:text-[#138a36] dark:bg-[#1a3d1f] dark:text-[#6fcf74]",
        )}
      >
        <ThumbsUp className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
      </button>
      <button
        type="button"
        aria-label="Poor response"
        aria-pressed={selectedFeedback === "down"}
        onClick={onThumbsDown}
        className={cn(
          "inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          selectedFeedback === "down" &&
            "border border-destructive bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive",
        )}
      >
        <ThumbsDown className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
      </button>
    </div>
  );
}


function AgentFeedbackToast({
  visible,
  variant,
  onDismiss,
}: {
  visible: boolean;
  variant: "thanks" | "working";
  onDismiss: () => void;
}) {
  if (!visible) return null;
  return (
    <div
      className={cn(
        "fixed top-6 left-1/2 z-[100] flex min-h-11 max-w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 items-center justify-center gap-2.5 rounded-lg bg-foreground px-4 py-2.5 text-background shadow-lg",
        variant === "working" ? "pointer-events-auto" : "pointer-events-none",
      )}
      role="status"
      aria-live="polite"
    >
      <Check className="h-4 w-4 shrink-0 text-emerald-500" strokeWidth={1.8} absoluteStrokeWidth aria-hidden />
      {variant === "thanks" ? (
        <span className="text-[14px] font-medium leading-5">Thanks for the feedback!</span>
      ) : (
        <span className="text-center text-[14px] font-medium leading-5">
          Working on your feedback.{" "}
          <a
            href="#"
            className="underline underline-offset-2 hover:opacity-90"
            onClick={(e) => { e.preventDefault(); onDismiss(); }}
          >
            View progress
          </a>
        </span>
      )}
    </div>
  );
}

function AgentFeedbackDialog({
  open,
  onOpenChange,
  selectedReasons,
  onToggleReason,
  feedbackDetails,
  onFeedbackDetailsChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedReasons: string[];
  onToggleReason: (reason: string) => void;
  feedbackDetails: string;
  onFeedbackDetailsChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="!bg-[#9CA3AF]/80 !backdrop-blur-0 dark:!bg-slate-500/85"
        className="h-[420px] w-[480px] max-w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-[0_24px_60px_-12px_rgba(15,23,42,0.18),0_8px_20px_-8px_rgba(15,23,42,0.08)] sm:max-w-[480px]"
      >
        <DialogHeader className="w-full px-7 pb-2 pt-7 pr-14">
          <DialogTitle className="text-[17px] font-semibold leading-6 tracking-[-0.01em] text-foreground">
            Share feedback
          </DialogTitle>
          <DialogDescription className="mt-1.5 max-w-[420px] text-[13px] leading-[19px] text-muted-foreground">
            Give an instruction to improve the appointment agent. The agent will apply your feedback to future interactions.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-7 py-4">
          <div className="flex flex-wrap gap-2">
            {APPOINTMENT_FEEDBACK_REASONS.map((reason) => {
              const selected = selectedReasons.includes(reason);
              return (
                <button
                  key={reason}
                  type="button"
                  onClick={() => onToggleReason(reason)}
                  className={cn(
                    "h-8 rounded-full border px-3.5 text-[13px] font-normal leading-5 transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35",
                    selected
                      ? "border-primary/60 bg-primary/8 text-primary"
                      : "border-[#E4E7EC] bg-white text-foreground hover:border-[#D0D5DD] hover:bg-[#F9FAFB]",
                  )}
                >
                  {reason}
                </button>
              );
            })}
          </div>

          <Textarea
            value={feedbackDetails}
            onChange={(e) => onFeedbackDetailsChange(e.target.value)}
            placeholder="Please provide feedback on what to improve about this response."
            className="min-h-[120px] resize-none rounded-lg border border-[#E4E7EC] bg-white px-3.5 py-2.5 text-[13px] leading-5 shadow-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/15"
          />
        </div>

        <DialogFooter className="items-center gap-2 px-7 pb-6 pt-3 sm:justify-end">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              className="h-9 rounded-lg px-3.5 text-[13px] font-medium text-muted-foreground hover:bg-[#F2F4F7] hover:text-foreground"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-9 rounded-lg px-4 text-[13px] font-medium shadow-sm"
              onClick={onSubmit}
            >
              Submit feedback
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AISummary({
  call,
  onThumbsUp,
  onThumbsDown,
}: {
  call: VoiceCall;
  onThumbsUp: () => void;
  onThumbsDown: () => void;
}) {
  const [open, setOpen] = useState(true);
  const [summaryFeedback, setSummaryFeedback] = useState<"up" | "down" | null>(null);

  const handleUp = () => {
    setSummaryFeedback("up");
    onThumbsUp();
  };

  const handleDown = () => {
    setSummaryFeedback("down");
    onThumbsDown();
  };

  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3"
      >
        <span className="flex items-center gap-2 text-[14px] font-medium text-foreground">
          <Sparkles className="size-4 text-violet-500" strokeWidth={1.6} absoluteStrokeWidth />
          AI Summary
        </span>
        {open ? (
          <ChevronUp className="size-4 text-muted-foreground" strokeWidth={1.6} absoluteStrokeWidth />
        ) : (
          <ChevronDown className="size-4 text-muted-foreground" strokeWidth={1.6} absoluteStrokeWidth />
        )}
      </button>
      {open ? (
        <div className="flex flex-col gap-4 border-t border-border px-4 py-4">
          <p className="text-[13px] leading-[1.6] text-foreground">{call.summary}</p>
          <div className="flex flex-col gap-1.5">
            <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              Action items
            </span>
            <ul className="flex flex-col gap-1.5">
              {call.actionItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-foreground">
                  <input type="checkbox" className="mt-0.5 size-3.5 rounded border-border" aria-label={item} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-[12px] text-muted-foreground">Was this summary helpful?</span>
            <AgentFeedbackThumbButtons
              selectedFeedback={summaryFeedback}
              onThumbsUp={handleUp}
              onThumbsDown={handleDown}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function VoiceCallDrawer({
  appointment,
  open,
  onOpenChange,
}: {
  appointment: AppointmentRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const call =
    VOICE_CALLS[appointment.id] ?? {
      durationSeconds: 180,
      timestampLabel: "Earlier",
      agentName: "Appointment agent",
      resolution: "Resolved" as const,
      tag: appointment.apptType,
      summary: "Patient and agent discussed the appointment over a voice call.",
      actionItems: ["Send confirmation SMS", "Update Athena record"],
      transcript: [
        {
          speaker: "patient" as const,
          text: `Hi, I'm calling about my appointment with ${appointment.provider}.`,
          time: "Earlier",
        },
      ],
      waveform: makeWaveform(appointment.id.charCodeAt(1) * 31),
      markers: [{ atSeconds: 10, color: "bg-sky-500" }],
    };

  const fb = useAgentFeedback();

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" inset="floating" floatingSize="lg" className="flex flex-col gap-0 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Call with {appointment.patientName}</SheetTitle>
            <SheetDescription>
              Voice call recording and transcript with the appointment agent
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            {/* ── Top header strip ── */}
            <div className="flex items-center justify-between gap-3 bg-muted/40 px-5 py-3">
              <h2 className="text-[18px] font-medium leading-tight text-foreground">
                {appointment.patientName}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex h-8 items-center gap-2 rounded-md px-2 hover:bg-muted"
                  aria-label={`Voice agent: ${call.agentName}`}
                >
                  <Avatar className="size-6">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Bot className="size-3" strokeWidth={1.6} absoluteStrokeWidth />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[13px] text-foreground">{call.agentName}</span>
                  <ChevronDown className="size-3 text-muted-foreground" strokeWidth={1.6} absoluteStrokeWidth />
                </button>
                <button type="button" aria-label="More" className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted">
                  <MoreHorizontal className="size-4" strokeWidth={1.6} absoluteStrokeWidth />
                </button>
              </div>
            </div>

            {/* ── Call player block ── */}
            <div className="bg-muted/40 px-5 pb-5">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
                <span className="text-foreground">{call.timestampLabel}</span>
                <span>·</span>
                <span>{formatDuration(call.durationSeconds)}</span>
                <span>·</span>
                <span>Agent: {call.agentName}</span>
                <span className="ml-1 inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                  {call.resolution}
                </span>
                {call.tag ? (
                  <span className="inline-flex items-center rounded-full border border-border bg-card px-2 py-0.5 text-[11px] text-foreground">
                    {call.tag}
                  </span>
                ) : null}
              </div>

              <Waveform call={call} />

              <div className="mt-3">
                <PlaybackControls />
              </div>
            </div>

            {/* ── AI Summary ── */}
            <div className="px-5 pt-5">
              <AISummary
                call={call}
                onThumbsUp={fb.handleThumbsUp}
                onThumbsDown={fb.handleThumbsDown}
              />
            </div>

            {/* ── Transcript ── */}
            <div className="my-5 flex items-center gap-3 px-5">
              <span className="h-px flex-1 bg-border" aria-hidden />
              <span className="text-[11px] text-muted-foreground">
                {call.timestampLabel} · Call Recording · {formatDuration(call.durationSeconds)}
              </span>
              <span className="h-px flex-1 bg-border" aria-hidden />
            </div>
            <div className="flex flex-col gap-4 px-5 pb-5">
              {call.transcript.map((t, i) => (
                <ChatBubble
                  key={i}
                  turn={t}
                  patientName={appointment.patientName}
                  patientAvatarUrl={appointment.patientAvatarUrl}
                  onThumbsUp={fb.handleThumbsUp}
                  onThumbsDown={fb.handleThumbsDown}
                />
              ))}
            </div>
          </div>

          {/* ── Ask anything footer ── */}
          <div className="border-t border-border px-5 py-3">
            <div className="rounded-xl border border-border bg-card">
              <input
                type="text"
                placeholder="Ask anything, use @ to tag files and collections"
                className="w-full rounded-t-xl bg-transparent px-3 py-2.5 text-[13px] outline-none placeholder:text-muted-foreground"
              />
              <div className="flex items-center justify-between gap-2 border-t border-border px-2 py-1.5">
                <div className="flex items-center gap-0.5">
                  <button type="button" aria-label="Attach" className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted">
                    <Paperclip className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
                  </button>
                  <button type="button" aria-label="Image" className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted">
                    <ImageIcon className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
                  </button>
                  <button type="button" aria-label="Mention" className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted">
                    <AtSign className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
                  </button>
                  <span className="mx-1 inline-block h-4 w-px bg-border" aria-hidden />
                  <button type="button" aria-label="Settings" className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted">
                    <SlidersHorizontal className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
                  </button>
                </div>
                <Button type="button" size="icon" aria-label="Send" className="size-8 rounded-md">
                  <ArrowUp className="size-4" strokeWidth={1.8} absoluteStrokeWidth />
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AgentFeedbackToast
        visible={fb.toastVisible}
        variant={fb.toastVariant}
        onDismiss={fb.handleDismissToast}
      />
      <AgentFeedbackDialog
        open={fb.feedbackDialogOpen}
        onOpenChange={fb.setFeedbackDialogOpen}
        selectedReasons={fb.selectedReasons}
        onToggleReason={fb.toggleReason}
        feedbackDetails={fb.feedbackDetails}
        onFeedbackDetailsChange={fb.setFeedbackDetails}
        onSubmit={fb.handleSubmitFeedback}
      />
    </>
  );
}

// ─── Chat drawer (existing) ─────────────────────────────────────────────────

function ConversationDrawer({
  appointment,
  open,
  onOpenChange,
}: {
  appointment: AppointmentRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const fb = useAgentFeedback();

  if (!appointment) return null;
  const turns = CONVERSATIONS[appointment.id] ?? [
    {
      speaker: "agent" as const,
      text: `Hi ${appointment.patientName.split(" ")[0]}, I’ve booked your ${appointment.apptType.toLowerCase()} with ${appointment.provider} for ${formatDateTime(appointment.dateTimeIso)}. Let me know if you need to change anything.`,
      time: "Earlier today",
    },
    { speaker: "patient" as const, text: "Thanks!", time: "Earlier today" },
  ];

  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" inset="floating" floatingSize="md" className="flex flex-col gap-0 p-0">
        <SheetHeader className="border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 shrink-0">
              {appointment.patientAvatarUrl ? (
                <AvatarImage src={appointment.patientAvatarUrl} alt={appointment.patientName} />
              ) : null}
              <AvatarFallback className="text-[11px]">{initials(appointment.patientName)}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <SheetTitle className="text-[15px] font-medium leading-tight">
                {appointment.patientName}
              </SheetTitle>
              <SheetDescription className="text-[12px]">
                {appointment.apptType} · {appointment.provider} · {formatDateTime(appointment.dateTimeIso)}
              </SheetDescription>
            </div>
          </div>
          <div className="flex items-center gap-1.5 pt-1">
            <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              <Sparkles className="size-3" strokeWidth={1.6} absoluteStrokeWidth />
              Appointment agent
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium",
                STATUS_CLASS[appointment.status],
              )}
            >
              {STATUS_LABEL[appointment.status]}
            </span>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="flex flex-col gap-4">
            {turns.map((turn, i) => (
              <ChatBubble
                key={i}
                turn={turn}
                patientName={appointment.patientName}
                patientAvatarUrl={appointment.patientAvatarUrl}
                onThumbsUp={fb.handleThumbsUp}
                onThumbsDown={fb.handleThumbsDown}
              />
            ))}
          </div>
        </div>

        <div className="border-t border-border px-5 py-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[12px] text-muted-foreground">Rate this conversation</span>
            <AgentFeedbackThumbButtons
              selectedFeedback={fb.selectedFeedback}
              onThumbsUp={fb.handleThumbsUp}
              onThumbsDown={fb.handleThumbsDown}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Reply on behalf of the agent…"
              className="flex-1 rounded-md border border-border bg-card px-3 py-2 text-[13px] outline-none placeholder:text-muted-foreground focus:border-primary"
            />
            <Button type="button" size="icon" aria-label="Send">
              <Send className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>

    <AgentFeedbackToast
      visible={fb.toastVisible}
      variant={fb.toastVariant}
      onDismiss={fb.handleDismissToast}
    />
    <AgentFeedbackDialog
      open={fb.feedbackDialogOpen}
      onOpenChange={fb.setFeedbackDialogOpen}
      selectedReasons={fb.selectedReasons}
      onToggleReason={fb.toggleReason}
      feedbackDetails={fb.feedbackDetails}
      onFeedbackDetailsChange={fb.setFeedbackDetails}
      onSubmit={fb.handleSubmitFeedback}
    />
    </>
  );
}

function BookedByCell({ bookedBy }: { bookedBy: BookedBy }) {
  if (bookedBy.source === "user") {
    return <span className="text-foreground">{bookedBy.name ?? "Unknown user"}</span>;
  }
  return (
    <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[12px] font-medium text-muted-foreground">
      Agent
    </span>
  );
}

function StatCard({
  value,
  label,
  icon,
  selected,
  onClick,
  isLast,
}: {
  value: number;
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  isLast?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-1 flex-col gap-2 py-5 pl-2 text-left transition-colors",
        selected
          ? "bg-primary/[0.05] border-b-2 border-b-primary"
          : "hover:bg-muted/40",
        !isLast && "border-r border-border",
      )}
    >
      <span
        className={cn(
          "text-[32px] font-medium leading-none tracking-[-0.02em] tabular-nums",
          selected ? "text-primary" : "text-foreground",
        )}
      >
        {value}
      </span>
      <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
        {icon}
        {label}
      </span>
    </button>
  );
}

function RowActionButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          onClick={onClick}
          className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

function RowActions() {
  return (
    <div className="flex items-center gap-1.5 opacity-0 transition-opacity group-hover/table-row:opacity-100 focus-within:opacity-100">
      <RowActionButton label="Quick send">
        <Send className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
      </RowActionButton>
      <RowActionButton label="Message">
        <MessageSquare className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
      </RowActionButton>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="More options"
                className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <MoreVertical className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="top">More options</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem className="text-[13px]">View patient</DropdownMenuItem>
          <DropdownMenuItem className="text-[13px]">Reschedule</DropdownMenuItem>
          <DropdownMenuItem className="text-[13px]">Mark as confirmed</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-[13px] text-destructive focus:text-destructive">
            Cancel appointment
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

const columnHelper = createColumnHelper<AppointmentRow>();

export function AppointmentsReviewPage() {
  const [activeFilter, setActiveFilter] = useState<StatFilter>("all");
  const [columnSheetOpen, setColumnSheetOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentRow | null>(null);

  const counts = useMemo(() => ({
    total: APPOINTMENTS.length,
    unconfirmed: APPOINTMENTS.filter((a) => a.status === "unconfirmed").length,
    cancelled: APPOINTMENTS.filter((a) => a.status === "cancelled").length,
    noShow: APPOINTMENTS.filter((a) => a.status === "no-show").length,
  }), []);

  const rows = useMemo(
    () => activeFilter === "all" ? APPOINTMENTS : APPOINTMENTS.filter((a) => a.status === activeFilter),
    [activeFilter],
  );

  const columns = useMemo<ColumnDef<AppointmentRow, unknown>[]>(
    () => [
      columnHelper.accessor("patientName", {
        id: "bookedFor",
        header: "Booked for",
        size: 280,
        meta: { settingsLabel: "Booked for" },
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="size-9 shrink-0">
                {row.patientAvatarUrl ? <AvatarImage src={row.patientAvatarUrl} alt={row.patientName} /> : null}
                <AvatarFallback className="text-[11px]">{initials(row.patientName)}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-[13px] text-foreground">{row.patientName}</span>
                <span className="text-[12px] text-muted-foreground">{row.patientAge} yrs</span>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("provider", {
        id: "provider",
        header: "Provider",
        size: 180,
        meta: { settingsLabel: "Provider" },
        cell: (info) => <span className="text-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor("apptType", {
        id: "appointmentType",
        header: "Appointment type",
        size: 180,
        meta: { settingsLabel: "Appointment type" },
        cell: (info) => <span className="text-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor("dateTimeIso", {
        id: "appointmentTime",
        header: "Appointment time",
        size: 220,
        meta: { settingsLabel: "Appointment time" },
        cell: (info) => (
          <span className="tabular-nums text-foreground">{formatDateTime(info.getValue())}</span>
        ),
      }),
      columnHelper.accessor("status", {
        id: "status",
        header: "Status",
        size: 180,
        meta: { settingsLabel: "Status" },
        cell: (info) => {
          const status = info.getValue();
          return (
            <span
              className={cn(
                "inline-flex items-center rounded-md px-2 py-0.5 text-[12px] font-medium",
                STATUS_CLASS[status],
              )}
            >
              {STATUS_LABEL[status]}
            </span>
          );
        },
      }),
      columnHelper.accessor((row) => row.bookedBy, {
        id: "bookedBy",
        header: "Booked by",
        size: 160,
        meta: { settingsLabel: "Booked by" },
        sortingFn: (a, b) => {
          const aLabel = a.original.bookedBy.source === "user" ? a.original.bookedBy.name ?? "" : a.original.bookedBy.source;
          const bLabel = b.original.bookedBy.source === "user" ? b.original.bookedBy.name ?? "" : b.original.bookedBy.source;
          return aLabel.localeCompare(bLabel);
        },
        cell: (info) => <BookedByCell bookedBy={info.getValue()} />,
      }),
      columnHelper.display({
        id: "rowActions",
        header: "",
        enableSorting: false,
        enableResizing: false,
        size: 140,
        meta: { settingsLabel: "Actions" },
        cell: () => (
          <div className="flex w-full justify-end pr-2">
            <RowActions />
          </div>
        ),
      }),
    ],
    [],
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <MainCanvasViewHeader
        title="Review appointments"
        actions={
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="icon" aria-label="Search appointments">
              <Search className="h-[14px] w-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
            </Button>
            <Button type="button" variant="outline" size="icon" aria-label="Filter appointments">
              <Filter className="h-[14px] w-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
            </Button>
            <Button type="button" className="h-9 gap-1.5 rounded-lg text-sm">
              <Download className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
              Export
            </Button>
          </div>
        }
      />

      {/* Stat filter cards */}
      <div className="mx-6 flex shrink-0 border-b border-border/50">
        {STAT_FILTERS.map((f, i) => (
          <StatCard
            key={f.key}
            value={f.count(counts)}
            label={f.label}
            icon={f.icon}
            selected={activeFilter === f.key}
            onClick={() => setActiveFilter(f.key)}
            isLast={i === STAT_FILTERS.length - 1}
          />
        ))}
      </div>

      {/* Table */}
      <div className="min-h-0 flex-1 px-6 pb-6 pt-4">
        <AppDataTable<AppointmentRow>
          tableId="appointments.review.v3"
          persist={false}
          data={rows}
          columns={columns}
          initialSorting={[{ id: "appointmentTime", desc: false }]}
          getRowId={(row) => row.id}
          className="h-full min-h-0 px-0"
          columnSheetTitle="Appointment columns"
          hideColumnsButton
          columnSheetOpen={columnSheetOpen}
          onColumnSheetOpenChange={setColumnSheetOpen}
          stickyFirstColumn={false}
          rowDensity="default"
          onRowClick={setSelectedAppointment}
        />
      </div>

      {selectedAppointment?.conversationChannel === "voice" ? (
        <VoiceCallDrawer
          appointment={selectedAppointment}
          open
          onOpenChange={(open) => {
            if (!open) setSelectedAppointment(null);
          }}
        />
      ) : (
        <ConversationDrawer
          appointment={selectedAppointment}
          open={selectedAppointment !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedAppointment(null);
          }}
        />
      )}
    </div>
  );
}
