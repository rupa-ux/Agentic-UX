import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Switch } from "@/app/components/ui/switch";
import { Textarea } from "@/app/components/ui/textarea";
import { cn } from "@/app/components/ui/utils";

export interface AppointmentPolicy {
  id: string;
  name: string;
  /** One-line summary shown in the collapsed row. */
  description: string;
  /** Plain-English instruction the agent should follow. */
  prompt: string;
  /** Plain-English bullet guidelines that further qualify the policy. */
  guidelines: string[];
  enabled: boolean;
}

const DEFAULT_POLICIES: AppointmentPolicy[] = [
  {
    id: "same-day-urgent",
    name: "Same-day and urgent appointments",
    description: "Check the same-day queue and verify live availability before promising any urgent slot.",
    prompt:
      "When a patient describes urgent symptoms or asks to be seen today, check the same-day queue before offering any future slot. Never confirm a same-day slot without verifying live availability.",
    guidelines: [
      "Check the same-day queue for the patient's home location first before offering tomorrow.",
      "If no in-person same-day slot is available, offer a same-day telehealth visit.",
      "For pediatric sick visits under 12, route to the pediatric same-day queue only.",
      "If symptoms suggest an emergency (chest pain, difficulty breathing, signs of stroke), stop booking and surface 911 guidance.",
    ],
    enabled: true,
  },
  {
    id: "insurance-verification",
    name: "Insurance verification before booking",
    description: "Confirm insurance is active and in-network before any appointment is confirmed.",
    prompt:
      "Confirm the patient's insurance is active and in-network for the requested visit type before confirming any appointment.",
    guidelines: [
      "Pull the active payer record from the EHR; if older than 90 days, ask the patient to confirm or update.",
      "If eligibility check fails, hold the slot and explain that the appointment is tentative pending verification.",
      "For self-pay patients, surface the visit's cash price and confirm acceptance before booking.",
      "Never quote out-of-pocket cost without first checking the eligibility response.",
    ],
    enabled: true,
  },
  {
    id: "identity-hipaa",
    name: "Patient identity verification",
    description: "Verify identity before sharing PHI or making any schedule changes.",
    prompt:
      "Verify the patient's identity before sharing any protected health information, making schedule changes, or discussing visit details.",
    guidelines: [
      "Confirm full name plus one of: date of birth, last four of phone, or address on file.",
      "If verification fails twice, do not proceed; offer to transfer to staff.",
      "For callers acting on behalf of a patient, confirm authorization is on file before continuing.",
      "Never read back a full medical record number, SSN, or insurance ID over the phone or chat.",
    ],
    enabled: true,
  },
  {
    id: "clinical-escalation",
    name: "Clinical escalation for high-acuity requests",
    description: "Route high-acuity, post-op, and behavioral health requests to a care coordinator.",
    prompt:
      "Escalate to a care coordinator rather than auto-confirming any request flagged as high-acuity, post-op, or behavioral health.",
    guidelines: [
      "Hold the requested slot but do not confirm until a clinician approves.",
      "Notify the on-call coordinator through the escalation queue with the patient's stated concern.",
      "Tell the patient: \"A care team member will confirm your visit shortly.\"",
      "Never minimize symptoms or suggest the patient \"wait and see\" for flagged concerns.",
    ],
    enabled: true,
  },
  {
    id: "no-show-history",
    name: "Repeat no-show handling",
    description: "Add a confirmation step for patients with a recent history of no-shows.",
    prompt:
      "When a patient has a recent history of no-shows, add an extra confirmation step before booking and set expectations clearly.",
    guidelines: [
      "Flag patients with 3 or more no-shows in the last 90 days.",
      "Require a phone or SMS confirmation before holding the slot.",
      "Explain the practice's late-cancel and no-show policy in plain language.",
      "Do not deny booking outright; offer a same-week slot and document the confirmation.",
    ],
    enabled: true,
  },
  {
    id: "cancellation-window",
    name: "Cancellation and reschedule courtesy",
    description: "Honor the cancellation window and offer alternatives proactively.",
    prompt:
      "Honor the practice's cancellation window and offer rescheduling proactively when a patient cancels.",
    guidelines: [
      "Cancellations made at least 24 hours in advance release the slot immediately at no fee.",
      "Late cancellations are noted on the patient's record per the cancellation policy.",
      "Always offer 2-3 alternative times before ending the conversation.",
      "If the patient cancels twice in a row, ask if anything is making it hard to attend.",
    ],
    enabled: true,
  },
  {
    id: "provider-capacity",
    name: "Provider capacity and overbooking",
    description: "Respect daily capacity limits; offer alternatives instead of overbooking.",
    prompt:
      "Respect provider daily capacity limits; offer alternatives rather than overbooking a panel that has reached its cap.",
    guidelines: [
      "Once a provider hits 90% of daily capacity, prefer an alternate in-network provider or next available day.",
      "Never overbook a same-day urgent slot without explicit care-team approval.",
      "Preserve buffer slots reserved for established complex patients.",
      "Surface the wait time honestly rather than offering an unrealistic time.",
    ],
    enabled: true,
  },
  {
    id: "telehealth-eligibility",
    name: "Telehealth eligibility",
    description: "Offer telehealth only when the visit type and patient's state allow it.",
    prompt:
      "Offer telehealth only when the visit type and the patient's state of residence allow it.",
    guidelines: [
      "Match the visit type against the telehealth-eligible list before suggesting video.",
      "Confirm the provider is licensed in the patient's current state of residence.",
      "For new patients, follow the practice's policy on whether the first visit must be in-person.",
      "Share clear \"how to join\" instructions and a fallback phone number.",
    ],
    enabled: true,
  },
  {
    id: "pediatric-safeguards",
    name: "Pediatric visit safeguards",
    description: "Confirm guardian consent, required forms, and pediatric-specific routing.",
    prompt:
      "Apply extra care for pediatric visits — confirm guardian consent, required forms, and pediatric-specific routing.",
    guidelines: [
      "Confirm an adult guardian is present or authorized on file before booking.",
      "Remind the family to bring vaccination records and any required intake forms.",
      "For infants under 3 months with any fever, escalate to staff immediately.",
      "Use pediatric-specific same-day slots; do not book a sick child into an adult slot.",
    ],
    enabled: true,
  },
  {
    id: "after-hours",
    name: "After-hours booking requests",
    description: "Queue requests received outside business hours and respond first thing the next day.",
    prompt:
      "Queue booking requests received outside business hours and respond first thing the next business day.",
    guidelines: [
      "Acknowledge the request immediately and give a clear callback window.",
      "If the request sounds urgent, surface urgent-care and 911 options before queuing.",
      "Process queued requests in arrival order at the start of the next business day.",
      "Do not promise a specific slot until live availability is checked.",
    ],
    enabled: false,
  },
];

function newPolicyId() {
  return `policy-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

interface PolicyFormState {
  name: string;
  description: string;
  prompt: string;
  guidelines: string[];
  enabled: boolean;
}

function emptyForm(): PolicyFormState {
  return { name: "", description: "", prompt: "", guidelines: [""], enabled: true };
}

function formFromPolicy(p: AppointmentPolicy): PolicyFormState {
  return {
    name: p.name,
    description: p.description,
    prompt: p.prompt,
    guidelines: p.guidelines.length > 0 ? p.guidelines : [""],
    enabled: p.enabled,
  };
}

function PolicyForm({
  state,
  onChange,
}: {
  state: PolicyFormState;
  onChange: (next: PolicyFormState) => void;
}) {
  const setGuideline = (idx: number, value: string) => {
    const next = [...state.guidelines];
    next[idx] = value;
    onChange({ ...state, guidelines: next });
  };

  const addGuideline = () =>
    onChange({ ...state, guidelines: [...state.guidelines, ""] });

  const removeGuideline = (idx: number) => {
    if (state.guidelines.length === 1) {
      onChange({ ...state, guidelines: [""] });
      return;
    }
    onChange({
      ...state,
      guidelines: state.guidelines.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="policy-name">Policy name</Label>
        <Input
          id="policy-name"
          value={state.name}
          placeholder="e.g. Same-day and urgent appointments"
          onChange={(e) => onChange({ ...state, name: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="policy-description">Short description</Label>
        <p className="text-[12px] text-muted-foreground">
          One line summarizing what this policy does — shown when the row is collapsed.
        </p>
        <Input
          id="policy-description"
          value={state.description}
          placeholder="e.g. Check the same-day queue before promising any urgent slot."
          onChange={(e) => onChange({ ...state, description: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="policy-prompt">Instruction to the agent</Label>
        <p className="text-[12px] text-muted-foreground">
          Write what the agent should do in plain English — as if you were telling a new teammate.
        </p>
        <Textarea
          id="policy-prompt"
          value={state.prompt}
          rows={3}
          placeholder="When a patient describes urgent symptoms, check the same-day queue before offering a future slot..."
          onChange={(e) => onChange({ ...state, prompt: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label>Conditions and guidelines</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-[13px]"
            onClick={addGuideline}
          >
            <Plus className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
            Add bullet
          </Button>
        </div>
        <p className="text-[12px] text-muted-foreground">
          One condition per bullet. Phrase each like a sentence — the agent reads them as guardrails.
        </p>
        <ul className="flex flex-col gap-2">
          {state.guidelines.map((g, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span
                aria-hidden
                className="mt-3 size-1.5 shrink-0 rounded-full bg-muted-foreground/60"
              />
              <Textarea
                value={g}
                rows={2}
                placeholder="If the same-day queue is empty, offer a telehealth slot before suggesting tomorrow."
                onChange={(e) => setGuideline(idx, e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 shrink-0 p-0 text-muted-foreground hover:text-foreground"
                aria-label="Remove bullet"
                onClick={() => removeGuideline(idx)}
              >
                <X className="size-4" strokeWidth={1.6} absoluteStrokeWidth />
              </Button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
        <Switch
          id="policy-enabled"
          checked={state.enabled}
          onCheckedChange={(enabled) => onChange({ ...state, enabled })}
        />
        <Label htmlFor="policy-enabled" className="text-[13px] text-foreground">
          {state.enabled ? "Policy active" : "Policy inactive"}
        </Label>
      </div>
    </div>
  );
}

function PolicyRowHeader({
  policy,
  isOpen,
  onToggle,
  onEdit,
  onDelete,
}: {
  policy: AppointmentPolicy;
  isOpen: boolean;
  onToggle: (enabled: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex w-full items-center gap-3 px-4 py-3">
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-3 rounded-md text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          aria-label={isOpen ? "Collapse policy" : "Expand policy"}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-[14px] font-medium text-foreground">
              {policy.name}
            </span>
          </div>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
              !isOpen && "-rotate-90",
            )}
            strokeWidth={1.6}
            absoluteStrokeWidth
            aria-hidden
          />
        </button>
      </CollapsibleTrigger>
      <div
        className="flex shrink-0 items-center gap-1"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Switch
          checked={policy.enabled}
          onCheckedChange={onToggle}
          aria-label={policy.enabled ? "Disable policy" : "Enable policy"}
        />
        {/* modal={false}: scrollable agent tab; native button: DropdownMenuTrigger needs a ref (Button is not forwardRef). */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-8 w-8 p-0 text-muted-foreground hover:text-foreground",
              )}
              aria-label="Policy actions"
            >
              <MoreVertical className="size-4" strokeWidth={1.6} absoluteStrokeWidth />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem className="gap-2 text-[13px]" onClick={onEdit}>
              <Pencil className="size-4" strokeWidth={1.6} absoluteStrokeWidth />
              Edit policy
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="gap-2 text-[13px]"
              onClick={onDelete}
            >
              <Trash2 className="size-4" strokeWidth={1.6} absoluteStrokeWidth />
              Delete policy
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function PolicyView({ policy }: { policy: AppointmentPolicy }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13px] leading-relaxed text-foreground">{policy.prompt}</p>
      {policy.guidelines.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Conditions and guidelines
          </span>
          <ul className="flex flex-col gap-1.5 text-[13px] leading-relaxed text-muted-foreground">
            {policy.guidelines.map((g, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span
                  aria-hidden
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/60"
                />
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function PolicyEditor({
  state,
  onChange,
  onSave,
  onCancel,
}: {
  state: PolicyFormState;
  onChange: (next: PolicyFormState) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const canSave = state.name.trim().length > 0 && state.prompt.trim().length > 0;
  return (
    <div className="flex flex-col gap-6 pl-5">
      <PolicyForm state={state} onChange={onChange} />
      <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          className="gap-1.5"
          disabled={!canSave}
          onClick={onSave}
        >
          <Check className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
          Save changes
        </Button>
      </div>
    </div>
  );
}

export interface AppointmentPoliciesTabProps {
  initialPolicies?: AppointmentPolicy[];
}

export function AppointmentPoliciesTab({
  initialPolicies,
}: AppointmentPoliciesTabProps = {}) {
  const [policies, setPolicies] = useState<AppointmentPolicy[]>(
    () => initialPolicies ?? DEFAULT_POLICIES,
  );
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [openId, setOpenId] = useState<string | undefined>(() => {
    const source = initialPolicies ?? DEFAULT_POLICIES;
    return source[0]?.id;
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState<PolicyFormState>(emptyForm);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<PolicyFormState>(emptyForm);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return policies;
    return policies.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.prompt.toLowerCase().includes(q) ||
        p.guidelines.some((g) => g.toLowerCase().includes(q))
      );
    });
  }, [policies, query]);

  const activeCount = policies.filter((p) => p.enabled).length;
  const deletingPolicy = policies.find((p) => p.id === deletingId) ?? null;

  const startEdit = (policy: AppointmentPolicy) => {
    setEditingId(policy.id);
    setEditingForm(formFromPolicy(policy));
    setOpenId(policy.id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingForm(emptyForm());
  };

  const saveEdit = () => {
    if (!editingId) return;
    setPolicies((prev) =>
      prev.map((p) =>
        p.id === editingId
          ? {
              ...p,
              name: editingForm.name.trim(),
              description: editingForm.description.trim(),
              prompt: editingForm.prompt.trim(),
              guidelines: editingForm.guidelines
                .map((g) => g.trim())
                .filter((g) => g.length > 0),
              enabled: editingForm.enabled,
            }
          : p,
      ),
    );
    cancelEdit();
  };

  const togglePolicy = (id: string, enabled: boolean) => {
    setPolicies((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled } : p)),
    );
  };

  const confirmDelete = () => {
    if (!deletingId) return;
    setPolicies((prev) => prev.filter((p) => p.id !== deletingId));
    if (editingId === deletingId) cancelEdit();
    if (openId === deletingId) setOpenId(undefined);
    setDeletingId(null);
  };

  const addPolicy = () => {
    const trimmedGuidelines = addForm.guidelines
      .map((g) => g.trim())
      .filter((g) => g.length > 0);
    const next: AppointmentPolicy = {
      id: newPolicyId(),
      name: addForm.name.trim(),
      description: addForm.description.trim(),
      prompt: addForm.prompt.trim(),
      guidelines: trimmedGuidelines,
      enabled: addForm.enabled,
    };
    setPolicies((prev) => [next, ...prev]);
    setAddForm(emptyForm());
    setAddOpen(false);
    setOpenId(next.id);
  };

  const addCanSave =
    addForm.name.trim().length > 0 && addForm.prompt.trim().length > 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 pb-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="text-[13px] text-muted-foreground">
              Business policies the agent must enforce before confirming or modifying any appointment.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            {searchOpen ? (
              <div className="relative h-9 w-[240px] shrink-0">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  strokeWidth={1.6}
                  absoluteStrokeWidth
                  aria-hidden
                />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onBlur={() => {
                    if (query === "") setSearchOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setQuery("");
                      setSearchOpen(false);
                    }
                  }}
                  autoFocus
                  placeholder="Search policies"
                  className="h-9 pl-9"
                  aria-label="Search policies"
                />
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-9 shrink-0 rounded-md"
                aria-label="Search policies"
                title="Search policies"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
              </Button>
            )}

            <Button
              type="button"
              size="sm"
              className="h-9 gap-1.5 rounded-lg px-4"
              onClick={() => {
                setAddForm(emptyForm());
                setAddOpen(true);
              }}
            >
              <Plus className="size-4" strokeWidth={1.6} absoluteStrokeWidth />
              Add
            </Button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState onAdd={() => setAddOpen(true)} hasQuery={query.length > 0} />
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((policy) => {
            const isEditing = editingId === policy.id;
            const isOpen = openId === policy.id;
            return (
              <li key={policy.id}>
                <Collapsible
                  open={isOpen}
                  onOpenChange={(open) => {
                    if (!open && editingId === policy.id) cancelEdit();
                    setOpenId(open ? policy.id : undefined);
                  }}
                  className={cn(
                    "rounded-lg border border-border bg-card transition-opacity",
                    !policy.enabled && !isEditing && "opacity-60",
                    isEditing && "ring-1 ring-primary/30",
                  )}
                >
                  <PolicyRowHeader
                    policy={policy}
                    isOpen={isOpen}
                    onToggle={(enabled) => togglePolicy(policy.id, enabled)}
                    onEdit={() => startEdit(policy)}
                    onDelete={() => setDeletingId(policy.id)}
                  />
                  <CollapsibleContent>
                    <div className="border-t border-border px-4 py-4">
                      {isEditing ? (
                        <PolicyEditor
                          state={editingForm}
                          onChange={setEditingForm}
                          onSave={saveEdit}
                          onCancel={cancelEdit}
                        />
                      ) : (
                        <PolicyView policy={policy} />
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" strokeWidth={1.6} absoluteStrokeWidth />
              Add a new policy
            </DialogTitle>
            <DialogDescription>
              Describe what the agent should do, then add bullet conditions to clarify when the policy applies.
            </DialogDescription>
          </DialogHeader>
          <PolicyForm state={addForm} onChange={setAddForm} />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={!addCanSave} onClick={addPolicy}>
              Create policy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deletingId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-rose-600" strokeWidth={1.6} absoluteStrokeWidth />
              Delete this policy?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deletingPolicy
                ? `The agent will no longer follow "${deletingPolicy.name}" when handling appointments. This cannot be undone.`
                : "This cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-rose-600 text-white hover:bg-rose-600/90"
            >
              Delete policy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EmptyState({
  onAdd,
  hasQuery,
}: {
  onAdd: () => void;
  hasQuery: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
      <p className="text-[14px] font-medium text-foreground">
        {hasQuery ? "No policies match your search" : "No policies yet"}
      </p>
      <p className="max-w-md text-[13px] text-muted-foreground">
        {hasQuery
          ? "Try a different keyword, or add a new policy that covers this scenario."
          : "Add your first policy so the appointment agent knows the guardrails to follow."}
      </p>
      <Button type="button" size="sm" className="mt-2 gap-1.5" onClick={onAdd}>
        <Plus className="size-4" strokeWidth={1.6} absoluteStrokeWidth />
        Add policy
      </Button>
    </div>
  );
}

export const APPOINTMENT_DEFAULT_POLICIES = DEFAULT_POLICIES;
