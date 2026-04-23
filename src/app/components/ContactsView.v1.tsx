import { useCallback, useMemo, useState, type ReactNode } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Eye,
  Mail,
  MessageSquare,
  MoreVertical,
  Pencil,
  Phone,
  Plus,
  Send,
  Sparkles,
  MapPin,
  Search,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Separator } from "@/app/components/ui/separator";
import { Sheet, SheetContent } from "@/app/components/ui/sheet";
import {
  FLOATING_SHEET_FRAME_CONTENT_CLASS,
  FloatingSheetFrame,
} from "@/app/components/layout/FloatingSheetFrame";
import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";
import { AppDataTable } from "@/app/components/ui/AppDataTable";
import { AppDataTableColumnSettingsTrigger } from "@/app/components/ui/AppDataTableColumnSettingsTrigger";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/components/ui/collapsible";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/app/components/ui/breadcrumb";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import { TextTabsRow } from "@/app/components/ui/text-tabs";
import { cn } from "@/app/components/ui/utils";

/* ─── L2 keys (must match `L2NavLayout` standalone labels) ─── */
export const CONTACTS_L2_KEY_ALL = "standalone/All contacts";
export const CONTACTS_L2_KEY_LISTS = "standalone/Lists & segments";
/** Must match `L2NavLayout` section `Settings` + child label. */
export const CONTACTS_L2_KEY_CUSTOM_FIELDS = "Settings/Custom fields";
export const CONTACTS_L2_KEY_TAGS = "Settings/Tags";

export type ContactsSheetMode = "none" | "quickView" | "addContact";

export type ContactsAppBridge = {
  l2ActiveItem: string;
  onL2ActiveItemChange: (key: string) => void;
  sheetMode: ContactsSheetMode;
  onSheetModeChange: (mode: ContactsSheetMode) => void;
  detailContactId: number | null;
  onDetailContactIdChange: (id: number | null) => void;
  quickViewContactId: number | null;
  onQuickViewContactIdChange: (id: number | null) => void;
};

export type ContactsViewProps = {
  app?: ContactsAppBridge;
};

type ScoreLevel = "green" | "yellow" | "red";

export interface Contact {
  id: number;
  name: string;
  score: number;
  scoreLevel: ScoreLevel;
  hasPhone: boolean;
  hasEmail: boolean;
  hasWhatsapp: boolean;
  isLead: boolean;
  location: string;
  locationCount?: number;
  lastActivity: string;
  email?: string;
  contactType?: string;
  segments?: string[];
  createdOn?: string;
  externalId?: string;
}

const mockContacts: Contact[] = [
  {
    id: 42,
    name: "B Peters",
    score: 8,
    scoreLevel: "green",
    hasPhone: true,
    hasEmail: true,
    hasWhatsapp: true,
    isLead: false,
    location: "San Francisco, CA",
    lastActivity: "Apr 14, 2026",
    email: "b.peters@example.com",
    contactType: "Customer",
    segments: ["High value", "Newsletter", "Dental reminders"],
    createdOn: "Jan 12, 2024",
    externalId: "ext-bp-001",
  },
  { id: 1, name: "Emma Reynolds", score: 4, scoreLevel: "green", hasPhone: true, hasEmail: true, hasWhatsapp: false, isLead: false, location: "Atlanta, GA", lastActivity: "Jul 05, 2024", email: "emma@example.com", contactType: "Lead", segments: ["Newsletter"], createdOn: "Mar 02, 2024", externalId: "ext-1" },
  { id: 2, name: "Liam Mitchell", score: 1, scoreLevel: "yellow", hasPhone: true, hasEmail: true, hasWhatsapp: true, isLead: false, location: "", locationCount: 2, lastActivity: "Jul 05, 2024" },
  { id: 3, name: "Ava Simmons", score: 6, scoreLevel: "red", hasPhone: true, hasEmail: false, hasWhatsapp: false, isLead: false, location: "", locationCount: 3, lastActivity: "Jul 05, 2024" },
  { id: 4, name: "Noah Hayes", score: 6, scoreLevel: "red", hasPhone: true, hasEmail: true, hasWhatsapp: false, isLead: false, location: "", locationCount: 3, lastActivity: "Jul 05, 2024" },
  { id: 5, name: "Isabella Cooper", score: 4, scoreLevel: "green", hasPhone: true, hasEmail: true, hasWhatsapp: true, isLead: false, location: "New York City, NY", lastActivity: "Jul 05, 2024" },
  { id: 6, name: "Ethan Brooks", score: 6, scoreLevel: "red", hasPhone: false, hasEmail: false, hasWhatsapp: false, isLead: true, location: "", locationCount: 3, lastActivity: "Jul 05, 2024" },
  { id: 7, name: "Mia Campbell", score: 4, scoreLevel: "green", hasPhone: true, hasEmail: true, hasWhatsapp: false, isLead: false, location: "Chicago, IL", lastActivity: "Jul 05, 2024" },
  { id: 8, name: "Jackson Rivera", score: 4, scoreLevel: "green", hasPhone: true, hasEmail: true, hasWhatsapp: true, isLead: true, location: "", locationCount: 3, lastActivity: "Jul 05, 2024" },
  { id: 9, name: "Harper Lewis", score: 6, scoreLevel: "red", hasPhone: true, hasEmail: true, hasWhatsapp: false, isLead: true, location: "San Diego, CA", lastActivity: "Jul 05, 2024" },
  { id: 10, name: "Benjamin Foster", score: 8, scoreLevel: "green", hasPhone: true, hasEmail: true, hasWhatsapp: false, isLead: false, location: "", locationCount: 3, lastActivity: "Jul 05, 2024" },
  { id: 11, name: "Chloe Bennett", score: 1, scoreLevel: "yellow", hasPhone: false, hasEmail: false, hasWhatsapp: false, isLead: true, location: "", locationCount: 2, lastActivity: "Jul 05, 2024" },
  { id: 12, name: "Caleb Morris", score: 6, scoreLevel: "red", hasPhone: true, hasEmail: true, hasWhatsapp: false, isLead: false, location: "", locationCount: 8, lastActivity: "Jul 05, 2024" },
  { id: 13, name: "Zoey Parker", score: 4, scoreLevel: "green", hasPhone: true, hasEmail: true, hasWhatsapp: true, isLead: false, location: "", locationCount: 3, lastActivity: "Jul 05, 2024" },
  { id: 14, name: "Harper Lewis", score: 1, scoreLevel: "yellow", hasPhone: true, hasEmail: true, hasWhatsapp: false, isLead: false, location: "", locationCount: 10, lastActivity: "Jul 05, 2024" },
  { id: 15, name: "Sophia Carter", score: 4, scoreLevel: "green", hasPhone: true, hasEmail: true, hasWhatsapp: false, isLead: false, location: "", locationCount: 3, lastActivity: "Jul 05, 2024" },
];

type SavedListRow = { id: string; name: string; contacts: string; description: string; lastUpdated: string };

const savedListColumnHelper = createColumnHelper<SavedListRow>();
const contactColumnHelper = createColumnHelper<Contact>();

const mockSavedLists: SavedListRow[] = [
  { id: "s1", name: "VIP customers", contacts: "1,204", description: "Top spenders last quarter", lastUpdated: "Apr 02, 2026" },
  { id: "s2", name: "Churn risk", contacts: "88", description: "Declining engagement signals", lastUpdated: "Mar 18, 2026" },
  { id: "s3", name: "Newsletter — west", contacts: "42.1K", description: "Opted in, west region", lastUpdated: "Feb 04, 2026" },
];

type AiSegmentRow = { id: string; name: string; contacts: string; description: string };

const aiSegmentColumnHelper = createColumnHelper<AiSegmentRow>();

const mockAiSegments: AiSegmentRow[] = [
  { id: "a1", name: "Likely to book", contacts: "264K", description: "Contacts who opened scheduling content in the last 90 days and have not booked." },
  { id: "a2", name: "High engagement readers", contacts: "210.2K", description: "Opened at least three campaigns in the last 60 days." },
  { id: "a3", name: "Patients with recent appointments", contacts: "0", description: "Had an appointment in the last 30 days — currently no matches in this workspace." },
  { id: "a4", name: "Upcoming appointments", contacts: "0", description: "Scheduled visit in the next 14 days." },
];

type CustomFieldDefRow = {
  id: string;
  name: string;
  fieldType: string;
  required: string;
  lastUpdated: string;
};

const customFieldColumnHelper = createColumnHelper<CustomFieldDefRow>();

const mockCustomFieldDefinitions: CustomFieldDefRow[] = [
  { id: "cf1", name: "Notes", fieldType: "Long text", required: "No", lastUpdated: "Apr 02, 2026" },
  { id: "cf2", name: "Lifetime value", fieldType: "Currency", required: "No", lastUpdated: "Mar 18, 2026" },
  { id: "cf3", name: "Preferred location", fieldType: "Short text", required: "No", lastUpdated: "Feb 04, 2026" },
  { id: "cf4", name: "Referral code", fieldType: "Short text", required: "No", lastUpdated: "Jan 12, 2026" },
  { id: "cf5", name: "Patient chart id", fieldType: "Short text", required: "Yes", lastUpdated: "Dec 08, 2025" },
];

type WorkspaceTagRow = { id: string; name: string; contacts: string; created: string };

const workspaceTagColumnHelper = createColumnHelper<WorkspaceTagRow>();

const mockWorkspaceTags: WorkspaceTagRow[] = [
  { id: "t1", name: "High value", contacts: "1,204", created: "Jan 04, 2024" },
  { id: "t2", name: "Newsletter", contacts: "42.1K", created: "Mar 02, 2024" },
  { id: "t3", name: "Dental reminders", contacts: "890", created: "Jun 18, 2024" },
  { id: "t4", name: "Churn risk", contacts: "88", created: "Mar 18, 2026" },
  { id: "t5", name: "VIP — west region", contacts: "312", created: "Nov 22, 2025" },
];

type ActivityEvent = { id: string; icon: "eye" | "send"; label: string; at: string };
const mockActivity: ActivityEvent[] = [
  { id: "e1", icon: "eye", label: "Opened automation “Welcome series”", at: "Apr 14, 2026 – 01:54 AM" },
  { id: "e2", icon: "send", label: "Campaign “Spring promo” was sent", at: "Apr 12, 2026 – 04:12 PM" },
  { id: "e3", icon: "eye", label: "Viewed appointment reminder", at: "Apr 10, 2026 – 09:00 AM" },
  { id: "e4", icon: "send", label: "Feedback request sent", at: "Apr 08, 2026 – 11:30 AM" },
  { id: "e5", icon: "eye", label: "Opened location announcement", at: "Apr 01, 2026 – 08:15 PM" },
];

function ScoreChip({ score, level }: { score: number; level: ScoreLevel }) {
  const colors: Record<ScoreLevel, string> = {
    green: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    yellow: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
    red: "bg-destructive/15 text-destructive dark:text-red-300",
  };
  return (
    <span
      className={cn(
        "inline-flex min-w-8 items-center justify-center rounded-sm px-2 py-1 text-[length:var(--font-size)] font-medium",
        colors[level],
      )}
    >
      {score}
    </span>
  );
}

function contactById(id: number | null): Contact | undefined {
  if (id == null) return undefined;
  return mockContacts.find((c) => c.id === id);
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function useContactsShell(app?: ContactsAppBridge) {
  const [l2, setL2] = useState(CONTACTS_L2_KEY_ALL);
  const [sheet, setSheet] = useState<ContactsSheetMode>("none");
  const [detailId, setDetailId] = useState<number | null>(null);
  const [qvId, setQvId] = useState<number | null>(null);

  return useMemo(() => {
    if (app) {
      return {
        l2ActiveItem: app.l2ActiveItem,
        setL2ActiveItem: app.onL2ActiveItemChange,
        sheetMode: app.sheetMode,
        setSheetMode: app.onSheetModeChange,
        detailContactId: app.detailContactId,
        setDetailContactId: app.onDetailContactIdChange,
        quickViewContactId: app.quickViewContactId,
        setQuickViewContactId: app.onQuickViewContactIdChange,
      };
    }
    return {
      l2ActiveItem: l2,
      setL2ActiveItem: setL2,
      sheetMode: sheet,
      setSheetMode: setSheet,
      detailContactId: detailId,
      setDetailContactId: setDetailId,
      quickViewContactId: qvId,
      setQuickViewContactId: setQvId,
    };
  }, [
    app,
    app?.l2ActiveItem,
    app?.onL2ActiveItemChange,
    app?.sheetMode,
    app?.onSheetModeChange,
    app?.detailContactId,
    app?.onDetailContactIdChange,
    app?.quickViewContactId,
    app?.onQuickViewContactIdChange,
    l2,
    sheet,
    detailId,
    qvId,
  ]);
}

function ChannelIcons({ c }: { c: Contact }) {
  const dim = "text-muted-foreground/35";
  const on = "text-foreground";
  return (
    <div className="flex items-center gap-2">
      <Phone className={cn("size-4", c.hasPhone ? on : dim)} aria-hidden />
      <Mail className={cn("size-4", c.hasEmail ? on : dim)} aria-hidden />
      <MessageSquare className={cn("size-4", c.hasWhatsapp ? on : dim)} aria-label="WhatsApp" />
    </div>
  );
}

function DetailRows({ c }: { c: Contact }) {
  const segs = c.segments ?? [];
  const primarySeg = segs[0] ?? "—";
  const more = segs.length > 1 ? segs.length - 1 : 0;
  return (
    <dl className="flex flex-col gap-4 text-sm">
      <div className="flex flex-col gap-1">
        <dt className="text-muted-foreground">Email</dt>
        <dd className="text-foreground">{c.email ?? "—"}</dd>
      </div>
      <div className="flex flex-col gap-1">
        <dt className="text-muted-foreground">Location</dt>
        <dd className="text-foreground">{c.location || (c.locationCount != null ? `${c.locationCount} locations` : "—")}</dd>
      </div>
      <div className="flex flex-col gap-1">
        <dt className="text-muted-foreground">Contact type</dt>
        <dd className="text-foreground">{c.contactType ?? "—"}</dd>
      </div>
      <div className="flex flex-col gap-1">
        <dt className="text-muted-foreground">Segments</dt>
        <dd className="text-foreground">
          {primarySeg}
          {more > 0 ? (
            <span className="text-muted-foreground mt-1 block text-xs">+{more} more</span>
          ) : null}
        </dd>
      </div>
      <div className="flex flex-col gap-1">
        <dt className="text-muted-foreground">Last activity</dt>
        <dd className="text-foreground">{c.lastActivity}</dd>
      </div>
      <div className="flex flex-col gap-1">
        <dt className="text-muted-foreground">Created on</dt>
        <dd className="text-foreground">{c.createdOn ?? "—"}</dd>
      </div>
      <div className="flex flex-col gap-1">
        <dt className="text-muted-foreground">External Id</dt>
        <dd className="text-foreground">{c.externalId ?? "—"}</dd>
      </div>
    </dl>
  );
}

function ProfileBlock({
  c,
  className,
}: {
  c: Contact;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <Avatar className="size-24 border border-border">
        <AvatarFallback className="bg-primary/15 text-lg font-medium text-primary">
          {initials(c.name)}
        </AvatarFallback>
      </Avatar>
      <p className="text-center text-lg font-medium text-foreground">{c.name}</p>
      <div className="flex items-center gap-2">
        <Button type="button" size="icon" variant="outline" className="size-10 rounded-md" aria-label="Message">
          <Send className="size-4" />
        </Button>
        <Button type="button" size="icon" variant="outline" className="size-10 rounded-md" aria-label="Email">
          <Mail className="size-4" />
        </Button>
        <Button type="button" size="icon" variant="outline" className="size-10 rounded-md" aria-label="More">
          <MoreVertical className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function AiInsightsStrip({ name, onGenerate }: { name: string; onGenerate?: () => void }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-accent/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2 text-sm text-foreground">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <span>
          AI — Get insights and actions for <span className="font-medium">{name}</span>
        </span>
      </div>
      {onGenerate ? (
        <Button type="button" className="shrink-0" onClick={onGenerate}>
          Generate summary
        </Button>
      ) : null}
    </div>
  );
}

function QuickViewSheet({
  open,
  onOpenChange,
  contact,
  onViewAllDetails,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact | undefined;
  onViewAllDetails: () => void;
}) {
  const [basicOpen, setBasicOpen] = useState(true);
  const [commOpen, setCommOpen] = useState(false);

  if (!contact) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        inset="floating"
        floatingSize="md"
        className={FLOATING_SHEET_FRAME_CONTENT_CLASS}
      >
        <FloatingSheetFrame
          title="Quick view"
          primaryAction={{
            label: "Generate summary",
            onClick: () => toast.message("Summary generation is a prototype action."),
          }}
          secondaryAction={{
            label: "Back",
            onClick: () => onOpenChange(false),
          }}
        >
          <div className="flex flex-col gap-6 pb-4">
            <div className="flex justify-end">
              <button
                type="button"
                className="text-primary text-sm font-medium hover:underline"
                onClick={onViewAllDetails}
              >
                View all details
              </button>
            </div>

            <ProfileBlock c={contact} />

            <AiInsightsStrip name={contact.name} />

            <Collapsible open={basicOpen} onOpenChange={setBasicOpen}>
              <div className="flex items-center justify-between gap-2">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="text-foreground flex flex-1 items-center gap-2 text-left text-sm font-semibold"
                  >
                    {basicOpen ? <ChevronUp className="size-4 shrink-0" /> : <ChevronDown className="size-4 shrink-0" />}
                    Basic details
                  </button>
                </CollapsibleTrigger>
                <Button type="button" variant="ghost" size="icon" className="shrink-0" aria-label="Edit details">
                  <Pencil className="size-4" />
                </Button>
              </div>
              <CollapsibleContent className="pt-4">
                <DetailRows c={contact} />
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            <Collapsible open={commOpen} onOpenChange={setCommOpen}>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="text-foreground flex w-full items-center gap-2 text-left text-sm font-semibold"
                >
                  {commOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  Communication preferences
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="text-muted-foreground pt-4 text-sm">
                Preferences are collapsed in the reference layout. Toggle to expand this section in the prototype.
              </CollapsibleContent>
            </Collapsible>
          </div>
        </FloatingSheetFrame>
      </SheetContent>
    </Sheet>
  );
}

function AddContactSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [sameWa, setSameWa] = useState(true);

  const onSave = () => {
    toast.success("Contact saved (prototype)");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        inset="floating"
        floatingSize="md"
        className={FLOATING_SHEET_FRAME_CONTENT_CLASS}
      >
        <FloatingSheetFrame
          title="Add a contact"
          primaryAction={{ label: "Save", onClick: onSave }}
          secondaryAction={{
            label: "Back",
            onClick: () => onOpenChange(false),
          }}
        >
          <div className="flex flex-col gap-6 pb-4">
            <section className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-foreground">Contact details</h3>
              <div className="flex flex-col gap-2">
                <Label htmlFor="ac-name">Name</Label>
                <div className="relative">
                  <User className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input id="ac-name" className="pl-10" placeholder="Full name" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="ac-email">Email</Label>
                <div className="relative">
                  <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input id="ac-email" className="pl-10" type="email" placeholder="name@company.com" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Phone</Label>
                <div className="flex flex-row gap-2">
                  <Select defaultValue="+1">
                    <SelectTrigger className="w-[100px] shrink-0">
                      <SelectValue placeholder="Code" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+1">+1</SelectItem>
                      <SelectItem value="+44">+44</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input className="flex-1" type="tel" placeholder="Phone number" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="ac-loc">Location</Label>
                <div className="relative">
                  <MapPin className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input id="ac-loc" className="pl-10" placeholder="Select location" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="ac-samewa" checked={sameWa} onCheckedChange={(v) => setSameWa(v === true)} />
                <Label htmlFor="ac-samewa" className="text-sm font-normal">
                  Phone number and WhatsApp number are the same
                </Label>
              </div>
            </section>

            <Separator />

            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">Communication preference</h3>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">All emails</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Checkbox id="em-fb" defaultChecked disabled />
                      <Label htmlFor="em-fb" className="font-normal">Feedback</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="em-mk" />
                      <Label htmlFor="em-mk" className="font-normal">Marketing</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="em-svc" defaultChecked />
                      <Label htmlFor="em-svc" className="font-normal">Service updates</Label>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">All texts</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Checkbox id="tx-fb" />
                      <Label htmlFor="tx-fb" className="font-normal">Feedback</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="tx-mk" disabled />
                      <Label htmlFor="tx-mk" className="font-normal">Marketing</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="tx-svc" />
                      <Label htmlFor="tx-svc" className="font-normal">Service updates</Label>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">WhatsApp opt in</p>
                  <div className="flex items-center gap-2">
                    <Checkbox id="wa-opt" />
                    <Label htmlFor="wa-opt" className="font-normal">Opt in</Label>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            <section className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-foreground">Custom fields</h3>
              <p className="text-muted-foreground text-sm">
                Optional information about a contact.{" "}
                <button type="button" className="text-primary font-medium hover:underline">
                  Click here
                </button>{" "}
                to view or manage all your fields.
              </p>
              {[
                { id: "cf1", label: "Notes", hint: "Text" },
                { id: "cf2", label: "Lifetime value", hint: "Currency" },
                { id: "cf3", label: "Preferred location", hint: "Text" },
                { id: "cf4", label: "Referral code", hint: "Text" },
              ].map((row) => (
                <div key={row.id} className="flex flex-col gap-2">
                  <Label htmlFor={row.id}>
                    {row.label}{" "}
                    <span className="text-muted-foreground font-normal">({row.hint})</span>
                  </Label>
                  <Input id={row.id} placeholder="—" />
                </div>
              ))}
            </section>
          </div>
        </FloatingSheetFrame>
      </SheetContent>
    </Sheet>
  );
}

function ListsSegmentsView() {
  const [topTab, setTopTab] = useState<"saved" | "ai">("ai");

  const aiColumns = useMemo(
    () => [
      aiSegmentColumnHelper.accessor("name", {
        id: "name",
        header: "Name",
        meta: { settingsLabel: "Name" },
        size: 200,
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      aiSegmentColumnHelper.accessor("contacts", {
        id: "contacts",
        header: "Contacts",
        meta: { settingsLabel: "Contacts" },
        size: 120,
      }),
      aiSegmentColumnHelper.accessor("description", {
        id: "description",
        header: "Description",
        meta: { settingsLabel: "Description" },
        size: 400,
        cell: (info) => (
          <span className="max-w-md whitespace-normal text-muted-foreground">{info.getValue()}</span>
        ),
      }),
    ],
    [],
  );

  const savedListColumns = useMemo(
    () => [
      savedListColumnHelper.accessor("name", {
        id: "name",
        header: "Name",
        meta: { settingsLabel: "Name" },
        size: 200,
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      savedListColumnHelper.accessor("contacts", {
        id: "contacts",
        header: "Contacts",
        meta: { settingsLabel: "Contacts" },
        size: 120,
      }),
      savedListColumnHelper.accessor("description", {
        id: "description",
        header: "Description",
        meta: { settingsLabel: "Description" },
        size: 280,
        cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      }),
      savedListColumnHelper.accessor("lastUpdated", {
        id: "lastUpdated",
        header: "Last updated",
        meta: { settingsLabel: "Last updated" },
        size: 140,
        enableSorting: true,
        cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      }),
    ],
    [],
  );

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
      <MainCanvasViewHeader
        title="Lists & segments"
        description="Create and manage your lists and segments or explore AI-recommended segments to reach the right audience."
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden px-6 py-4">
        <TextTabsRow
          className="shrink-0"
          ariaLabel="List source"
          value={topTab}
          onChange={setTopTab}
          items={[
            {
              id: "saved",
              label: "Saved",
              suffix: (
                <Badge variant="secondary" className="font-normal">
                  56
                </Badge>
              ),
            },
            {
              id: "ai",
              label: "AI recommendations",
              suffix: (
                <Badge variant="secondary" className="font-normal">
                  19
                </Badge>
              ),
            },
          ]}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-auto">
          {topTab === "ai" ? (
            <AppDataTable<AiSegmentRow>
              tableId="contacts.lists.ai"
              data={mockAiSegments}
              columns={aiColumns}
              getRowId={(r) => r.id}
              columnSheetTitle="Segment columns"
              className="min-w-0 px-0"
            />
          ) : (
            <AppDataTable<SavedListRow>
              tableId="contacts.lists.saved"
              data={mockSavedLists}
              columns={savedListColumns}
              getRowId={(r) => r.id}
              columnSheetTitle="List columns"
              className="min-w-0 px-0"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function CustomFieldsSettingsView() {
  const [columnSheetOpen, setColumnSheetOpen] = useState(false);

  const columns = useMemo(
    () => [
      customFieldColumnHelper.accessor("name", {
        id: "name",
        header: "Field name",
        meta: { settingsLabel: "Field name" },
        size: 220,
        cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
      }),
      customFieldColumnHelper.accessor("fieldType", {
        id: "fieldType",
        header: "Type",
        meta: { settingsLabel: "Type" },
        size: 160,
        cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      }),
      customFieldColumnHelper.accessor("required", {
        id: "required",
        header: "Required",
        meta: { settingsLabel: "Required" },
        size: 120,
        cell: (info) => (
          <span className={info.getValue() === "Yes" ? "text-foreground" : "text-muted-foreground"}>
            {info.getValue()}
          </span>
        ),
      }),
      customFieldColumnHelper.accessor("lastUpdated", {
        id: "lastUpdated",
        header: "Last updated",
        meta: { settingsLabel: "Last updated" },
        size: 160,
        enableSorting: true,
        cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      }),
    ],
    [],
  );

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
      <MainCanvasViewHeader
        title="Custom fields"
        actions={
          <>
            <AppDataTableColumnSettingsTrigger
              sheetTitle="Field columns"
              onClick={() => setColumnSheetOpen(true)}
            />
            <Button
              type="button"
              className="gap-2"
              onClick={() => toast.message("Add field", { description: "Connect your CRM to create fields from this UI." })}
            >
              <Plus className="size-4 shrink-0" strokeWidth={2} aria-hidden />
              Add field
            </Button>
          </>
        }
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-6 py-4">
        <div className="min-h-0 flex-1 overflow-auto">
          <AppDataTable<CustomFieldDefRow>
            tableId="contacts.settings.customFields"
            data={mockCustomFieldDefinitions}
            columns={columns}
            getRowId={(r) => r.id}
            columnSheetTitle="Field columns"
            className="min-w-0 px-0"
            hideColumnsButton
            columnSheetOpen={columnSheetOpen}
            onColumnSheetOpenChange={setColumnSheetOpen}
          />
        </div>
      </div>
    </div>
  );
}

function TagsSettingsView() {
  const [columnSheetOpen, setColumnSheetOpen] = useState(false);

  const columns = useMemo(
    () => [
      workspaceTagColumnHelper.accessor("name", {
        id: "name",
        header: "Tag",
        meta: { settingsLabel: "Tag" },
        size: 240,
        cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
      }),
      workspaceTagColumnHelper.accessor("contacts", {
        id: "contacts",
        header: "Contacts",
        meta: { settingsLabel: "Contacts" },
        size: 140,
        enableSorting: true,
      }),
      workspaceTagColumnHelper.accessor("created", {
        id: "created",
        header: "Created",
        meta: { settingsLabel: "Created" },
        size: 160,
        enableSorting: true,
        cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      }),
    ],
    [],
  );

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
      <MainCanvasViewHeader
        title="Tags"
        actions={
          <>
            <AppDataTableColumnSettingsTrigger
              sheetTitle="Tag columns"
              onClick={() => setColumnSheetOpen(true)}
            />
            <Button
              type="button"
              className="gap-2"
              onClick={() => toast.message("Create tag", { description: "Tag creation will sync from your connected directory." })}
            >
              <Plus className="size-4 shrink-0" strokeWidth={2} aria-hidden />
              Create tag
            </Button>
          </>
        }
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-6 py-4">
        <div className="min-h-0 flex-1 overflow-auto">
          <AppDataTable<WorkspaceTagRow>
            tableId="contacts.settings.tags"
            data={mockWorkspaceTags}
            columns={columns}
            getRowId={(r) => r.id}
            columnSheetTitle="Tag columns"
            className="min-w-0 px-0"
            hideColumnsButton
            columnSheetOpen={columnSheetOpen}
            onColumnSheetOpenChange={setColumnSheetOpen}
          />
        </div>
      </div>
    </div>
  );
}

function ContactDetailsView({
  contact,
  onBackToList,
}: {
  contact: Contact;
  onBackToList: () => void;
}) {
  const [mainTab, setMainTab] = useState<"activity" | "feedback" | "appointments" | "intel">("activity");
  const [basicOpen, setBasicOpen] = useState(true);
  const [commOpen, setCommOpen] = useState(false);

  const tabs: { id: typeof mainTab; label: ReactNode }[] = [
    { id: "activity", label: "All activity" },
    { id: "feedback", label: "Feedback" },
    { id: "appointments", label: "Appointments" },
    { id: "intel", label: (<><Sparkles className="inline size-3.5 align-[-2px]" aria-hidden /> Intelligence</>) },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      <div className="flex shrink-0 flex-col gap-4 border-b border-border px-6 py-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <button type="button" className="cursor-pointer bg-transparent" onClick={onBackToList}>
                  All contacts
                </button>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{contact.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 overflow-hidden lg:grid-cols-[minmax(260px,320px)_1fr]">
        <aside className="border-border lg:border-r overflow-y-auto px-6 py-6">
          <div className="flex flex-col gap-8">
            <ProfileBlock c={contact} className="items-stretch sm:items-center" />
            <Collapsible open={basicOpen} onOpenChange={setBasicOpen}>
              <div className="flex items-center justify-between gap-2">
                <CollapsibleTrigger asChild>
                  <button type="button" className="text-foreground flex flex-1 items-center gap-2 text-left text-sm font-semibold">
                    {basicOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    Basic details
                  </button>
                </CollapsibleTrigger>
                <Button type="button" variant="ghost" size="icon" aria-label="Edit">
                  <Pencil className="size-4" />
                </Button>
              </div>
              <CollapsibleContent className="pt-4">
                <DetailRows c={contact} />
              </CollapsibleContent>
            </Collapsible>
            <Separator />
            <Collapsible open={commOpen} onOpenChange={setCommOpen}>
              <CollapsibleTrigger asChild>
                <button type="button" className="text-foreground flex w-full items-center gap-2 text-left text-sm font-semibold">
                  {commOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  Communication preferences
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="text-muted-foreground pt-4 text-sm">
                Collapsed in the reference. Expand to show preference toggles in a later iteration.
              </CollapsibleContent>
            </Collapsible>
          </div>
        </aside>

        <main className="flex min-h-0 flex-col overflow-y-auto px-6 py-6">
          <div className="flex flex-col gap-6">
            <AiInsightsStrip
              name={contact.name}
              onGenerate={() => toast.message("Summary generation is a prototype action.")}
            />

            <TextTabsRow
              ariaLabel="Contact detail sections"
              value={mainTab}
              onChange={setMainTab}
              items={tabs.map((t) => ({ id: t.id, label: t.label }))}
            />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative max-w-sm flex-1">
                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" aria-hidden />
                <Input placeholder="Search activity" className="pl-10" />
              </div>
              <Select defaultValue="12m">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12m">Last 12 months</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Entities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All entities</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mainTab === "activity" ? (
              <div className="relative flex flex-col pl-2">
                <div className="bg-border absolute top-2 bottom-2 left-[11px] w-px" aria-hidden />
                {mockActivity.map((ev) => (
                  <div key={ev.id} className="relative flex gap-4 py-4 pl-8">
                    <div className="bg-background absolute top-5 left-0 flex size-6 items-center justify-center rounded-full border border-border">
                      {ev.icon === "eye" ? <Eye className="size-3.5" /> : <Send className="size-3.5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground">{ev.label}</p>
                    </div>
                    <time className="text-muted-foreground shrink-0 text-xs whitespace-nowrap">{ev.at}</time>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">This tab is a placeholder in the prototype.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export function ContactsView({ app }: ContactsViewProps) {
  const shell = useContactsShell(app);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [directoryColumnSheetOpen, setDirectoryColumnSheetOpen] = useState(false);

  const totalContacts = 262_164;
  const pageSize = 15;
  const totalPages = Math.max(1, Math.ceil(totalContacts / pageSize));

  const pageRows = useMemo(() => mockContacts, []);

  const qContact = contactById(shell.quickViewContactId);
  const detailContact = contactById(shell.detailContactId);

  const openQuickView = useCallback(
    (id: number) => {
      shell.setQuickViewContactId(id);
      shell.setSheetMode("quickView");
    },
    [shell],
  );

  const contactColumns = useMemo(
    () => [
      contactColumnHelper.accessor("name", {
        id: "name",
        header: "Contact name",
        meta: { settingsLabel: "Contact name" },
        size: 220,
        enableSorting: true,
        cell: ({ row }) => {
          const contact = row.original;
          const isSelected = selectedRow === contact.id;
          return (
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn(isSelected ? "font-medium text-primary" : "text-foreground")}>
                {contact.name}
              </span>
              {contact.isLead ? (
                <Badge variant="secondary" className="font-normal text-[length:var(--font-size)]">
                  Lead
                </Badge>
              ) : null}
            </div>
          );
        },
      }),
      contactColumnHelper.display({
        id: "channels",
        header: "Channel",
        meta: { settingsLabel: "Channel" },
        size: 128,
        cell: ({ row }) => <ChannelIcons c={row.original} />,
      }),
      contactColumnHelper.accessor("score", {
        id: "score",
        header: "Experience score",
        meta: { settingsLabel: "Experience score" },
        size: 176,
        minSize: 168,
        enableSorting: true,
        cell: (info) => (
          <ScoreChip score={info.getValue()} level={info.row.original.scoreLevel} />
        ),
      }),
      contactColumnHelper.display({
        id: "location",
        header: "Location",
        meta: { settingsLabel: "Location" },
        size: 200,
        cell: ({ row }) => {
          const c = row.original;
          return (
            <span className="text-foreground">
              {c.location
                ? c.location
                : c.locationCount != null
                  ? `${c.locationCount} locations`
                  : "—"}
            </span>
          );
        },
      }),
      contactColumnHelper.display({
        id: "actions",
        header: "",
        meta: { settingsLabel: "Actions" },
        size: 56,
        enableResizing: false,
        enableHiding: false,
        cell: ({ row }) => {
          const contact = row.original;
          return (
            <div className="text-left">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" aria-label="Row actions">
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[180px]">
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedRow(contact.id);
                      shell.setDetailContactId(contact.id);
                      shell.setSheetMode("none");
                      shell.setQuickViewContactId(null);
                    }}
                  >
                    View details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openQuickView(contact.id)}>Quick view</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }),
    ],
    [openQuickView, selectedRow, shell],
  );

  const onQuickSheetOpenChange = (open: boolean) => {
    if (!open) {
      shell.setSheetMode("none");
      shell.setQuickViewContactId(null);
    }
  };

  const onAddSheetOpenChange = (open: boolean) => {
    if (!open) shell.setSheetMode("none");
  };

  const goDetailsFromQuick = () => {
    if (qContact) {
      shell.setDetailContactId(qContact.id);
      shell.setSheetMode("none");
      shell.setQuickViewContactId(null);
    }
  };

  const backToListFromDetails = () => {
    shell.setDetailContactId(null);
    shell.setL2ActiveItem(CONTACTS_L2_KEY_ALL);
  };

  const mainSurface =
    shell.detailContactId != null && detailContact ? (
      <ContactDetailsView contact={detailContact} onBackToList={backToListFromDetails} />
    ) : shell.l2ActiveItem === CONTACTS_L2_KEY_LISTS ? (
      <ListsSegmentsView />
    ) : shell.l2ActiveItem === CONTACTS_L2_KEY_CUSTOM_FIELDS ? (
      <CustomFieldsSettingsView />
    ) : shell.l2ActiveItem === CONTACTS_L2_KEY_TAGS ? (
      <TagsSettingsView />
    ) : (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background transition-colors duration-300">
      <div className="flex min-h-0 flex-1 flex-col">
        <MainCanvasViewHeader
          title="Contacts"
          actions={
            <>
              <AppDataTableColumnSettingsTrigger
                sheetTitle="Contact columns"
                onClick={() => setDirectoryColumnSheetOpen(true)}
              />
              <Button type="button" variant="outline" size="icon" aria-label="More options">
                <MoreVertical className="size-4" />
              </Button>
            </>
          }
        />

        <div className="min-h-0 flex-1 overflow-auto">
          <AppDataTable<Contact>
            tableId="contacts.directory"
            data={pageRows}
            columns={contactColumns}
            getRowId={(c) => String(c.id)}
            onRowClick={(c) => {
              setSelectedRow(c.id);
              openQuickView(c.id);
            }}
            isRowSelected={(c) => selectedRow === c.id}
            columnSheetTitle="Contact columns"
            className="min-w-0"
            hideColumnsButton
            columnSheetOpen={directoryColumnSheetOpen}
            onColumnSheetOpenChange={setDirectoryColumnSheetOpen}
          />
        </div>

        <div className="bg-background flex shrink-0 items-center justify-between border-t border-border px-6 py-4">
          <span className="text-muted-foreground text-sm">
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalContacts)} of{" "}
            {totalContacts.toLocaleString()} contacts
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </Button>
            {[1, 2, 3].map((p) => (
              <Button
                key={p}
                type="button"
                variant={currentPage === p ? "default" : "outline"}
                size="icon"
                className="min-w-8"
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </Button>
            ))}
            <span className="text-muted-foreground px-2 text-sm">…</span>
            <Button type="button" variant="outline" size="icon" onClick={() => setCurrentPage(totalPages)}>
              {String(totalPages).slice(-3)}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
    );

  return (
    <>
      {mainSurface}
      <QuickViewSheet
        open={shell.sheetMode === "quickView"}
        onOpenChange={onQuickSheetOpenChange}
        contact={qContact}
        onViewAllDetails={goDetailsFromQuick}
      />
      <AddContactSheet open={shell.sheetMode === "addContact"} onOpenChange={onAddSheetOpenChange} />
    </>
  );
}
