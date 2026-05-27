import { useRef, useState } from "react";
import {
  Braces,
  Check,
  ChevronDown,
  Database,
  FileText,
  Home,
  Link2,
  MapPin,
  MessageSquare,
  Mic,
  Package,
  Plus,
  Smartphone,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import { cn } from "@/app/components/ui/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type TriggerChannel = "voice" | "chat" | "sms";

interface ChannelConfig {
  channel: TriggerChannel;
  enabled: boolean;
}

interface ChannelRule {
  id: string;
  intent: string;
  event: string;
  timing: string;
}

type SettingsContextKind = "json" | "file" | "link" | "brand" | "style" | "industry";

interface SettingsContextItem {
  id: string;
  kind: SettingsContextKind;
  label: string;
}

interface AgentSettingsState {
  channels: ChannelConfig[];
  locations: string[];
  additionalContext: SettingsContextItem[];
}

const DEFAULT_SETTINGS: AgentSettingsState = {
  channels: [
    {
      channel: "voice",
      enabled: true,
    },
    {
      channel: "chat",
      enabled: true,
    },
    {
      channel: "sms",
      enabled: false,
    },
  ],
  locations: [
    "Atlanta, GA",
    "Boston, MA",
    "Chicago, IL",
    "Detroit, MI",
    "New York City, NY",
    "Philadelphia, PA",
    "Pittsburgh, PA",
  ],
  additionalContext: [],
};

const CHANNEL_LABELS: Record<TriggerChannel, string> = {
  voice: "Voice",
  chat: "Chat",
  sms: "SMS",
};

const CHANNEL_ICONS: Record<TriggerChannel, typeof Mic> = {
  voice: Mic,
  chat: MessageSquare,
  sms: Smartphone,
};

function channelRuleId() {
  return `rule-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
}

const DEFAULT_CHANNEL_RULES: Record<TriggerChannel, ChannelRule[]> = {
  voice: [
    {
      id: channelRuleId(),
      intent: "Voice",
      event: "Incoming call",
      timing: "During work hours",
    },
  ],
  chat: [
    {
      id: channelRuleId(),
      intent: "Chat",
      event: "Message received",
      timing: "During work hours",
    },
  ],
  sms: [],
};

const SETTINGS_CONTEXT_ICON: Record<SettingsContextKind, typeof Braces> = {
  json: Braces,
  file: FileText,
  link: Link2,
  brand: Home,
  style: Home,
  industry: Package,
};

const SETTINGS_CONTEXT_CHIP_STYLE: Record<
  SettingsContextKind,
  { border: string; iconPane: string; icon: string }
> = {
  json: {
    border: "border-sky-200 dark:border-sky-800",
    iconPane: "bg-sky-50 dark:bg-sky-950/50",
    icon: "text-sky-600 dark:text-sky-400",
  },
  file: {
    border: "border-emerald-200 dark:border-emerald-800",
    iconPane: "bg-emerald-50 dark:bg-emerald-950/50",
    icon: "text-emerald-600 dark:text-emerald-400",
  },
  link: {
    border: "border-fuchsia-200 dark:border-fuchsia-800",
    iconPane: "bg-fuchsia-50 dark:bg-fuchsia-950/50",
    icon: "text-fuchsia-600 dark:text-fuchsia-400",
  },
  brand: {
    border: "border-indigo-200 dark:border-indigo-800",
    iconPane: "bg-indigo-50 dark:bg-indigo-950/50",
    icon: "text-indigo-600 dark:text-indigo-400",
  },
  style: {
    border: "border-indigo-200 dark:border-indigo-800",
    iconPane: "bg-indigo-50 dark:bg-indigo-950/50",
    icon: "text-indigo-600 dark:text-indigo-400",
  },
  industry: {
    border: "border-amber-200 dark:border-amber-800",
    iconPane: "bg-amber-50 dark:bg-amber-950/50",
    icon: "text-amber-600 dark:text-amber-500",
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: typeof MessageSquare;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex size-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
      </span>
      <span className="text-[13px] font-medium text-foreground">{children}</span>
    </div>
  );
}

function SectionBox({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-lg border border-border bg-card", className)}>
      {children}
    </div>
  );
}

function LocationPill({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/60 px-2.5 py-1 text-[12px] text-foreground">
      <MapPin className="size-3 shrink-0 text-muted-foreground" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        className="ml-0.5 inline-flex size-4 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="size-3" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
      </button>
    </span>
  );
}

function SettingsContextChip({
  item,
  onRemove,
}: {
  item: SettingsContextItem;
  onRemove: () => void;
}) {
  const Icon = SETTINGS_CONTEXT_ICON[item.kind];
  const style = SETTINGS_CONTEXT_CHIP_STYLE[item.kind];

  return (
    <span
      className={cn(
        "inline-flex max-w-full overflow-hidden rounded-md border bg-card shadow-none",
        style.border,
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center self-stretch border-r px-2 py-1.5",
          style.border,
          style.iconPane,
        )}
      >
        <Icon className={cn("size-4 shrink-0", style.icon)} strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
      </span>
      <span className="flex min-w-0 items-center gap-2 bg-card py-1.5 pl-2 pr-1">
        <span className="truncate text-[13px] leading-none text-foreground">{item.label}</span>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex size-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={`Remove ${item.label}`}
        >
          <X className="size-3" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
        </button>
      </span>
    </span>
  );
}

/** Context panel — title above container, same pattern as Trigger events. */
function AdditionalContextPanel({
  items,
  onAdd,
  onRemove,
}: {
  items: SettingsContextItem[];
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <SectionLabel icon={Database}>Additional context</SectionLabel>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[12px] text-primary transition-colors hover:bg-primary/10"
        >
          <Plus className="size-3" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
          Add
        </button>
      </div>
      <SectionBox className="px-4 py-4">
        <div className="flex flex-wrap items-start gap-2">
          {items.length === 0 ? (
            <span className="text-[12px] text-muted-foreground">No context added.</span>
          ) : (
            items.map((item) => (
              <SettingsContextChip
                key={item.id}
                item={item}
                onRemove={() => onRemove(item.id)}
              />
            ))
          )}
        </div>
      </SectionBox>
    </section>
  );
}

function ChannelRuleSelect({
  value,
  ariaLabel,
}: {
  value: string;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className="flex h-[44px] w-full items-center justify-between rounded-lg border border-border bg-background px-4 text-left text-[13px] text-foreground transition-colors hover:border-ring"
    >
      <span className="truncate">{value}</span>
      <ChevronDown className="size-5 shrink-0 text-foreground/80" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export interface AppointmentSettingsTabProps {
  initialSettings?: Partial<AgentSettingsState>;
}

export function AppointmentSettingsTab({
  initialSettings,
}: AppointmentSettingsTabProps = {}) {
  const [settings, setSettings] = useState<AgentSettingsState>({
    ...DEFAULT_SETTINGS,
    ...initialSettings,
  });
  const [saved, setSaved] = useState(true);
  const [channelRules, setChannelRules] = useState<Record<TriggerChannel, ChannelRule[]>>(
    DEFAULT_CHANNEL_RULES,
  );
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const update = <K extends keyof AgentSettingsState>(key: K, value: AgentSettingsState[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
  };

  // ── Channel helpers ──────────────────────────────────────────────────────

  const toggleChannel = (ch: TriggerChannel, enabled: boolean) => {
    const next = settings.channels.map((c) =>
      c.channel === ch ? { ...c, enabled } : c,
    );
    update("channels", next);
  };

  const addRule = (channel: TriggerChannel) => {
    const nextRule: ChannelRule = {
      id: channelRuleId(),
      intent: CHANNEL_LABELS[channel],
      event: channel === "voice" ? "Incoming call" : channel === "chat" ? "Message received" : "SMS received",
      timing: "During work hours",
    };
    setChannelRules((prev) => ({ ...prev, [channel]: [...prev[channel], nextRule] }));
    setSaved(false);
  };

  const removeRule = (channel: TriggerChannel, id: string) => {
    setChannelRules((prev) => ({
      ...prev,
      [channel]: prev[channel].filter((rule) => rule.id !== id),
    }));
    setSaved(false);
  };

  // ── Location helpers ─────────────────────────────────────────────────────

  const removeLocation = (loc: string) => {
    update("locations", settings.locations.filter((l) => l !== loc));
  };

  const addContext = () => {
    toast.message("Add context is not wired yet in this prototype.");
  };

  const removeContext = (id: string) => {
    update(
      "additionalContext",
      settings.additionalContext.filter((item) => item.id !== id),
    );
  };

  const enabledChannels = settings.channels.filter((c) => c.enabled);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="flex flex-col gap-8 px-6 pb-32 pt-2">
        <div className="flex w-full gap-10">
          <div className="min-w-0 flex-1 max-w-[720px]">

          {/* ── Trigger events ─────────────────────────────────────────── */}
          <section className="flex flex-col gap-3">
            <SectionLabel icon={Zap}>Trigger events</SectionLabel>
            <SectionBox className="px-4 py-3">
              <div className="flex flex-col gap-3">
                {settings.channels.map((ch) => {
                  const Icon = CHANNEL_ICONS[ch.channel];
                  return (
                    <label
                      key={ch.channel}
                      className="flex cursor-pointer items-center gap-3 rounded-md py-1 hover:text-foreground"
                    >
                      <Checkbox
                        id={`trigger-${ch.channel}`}
                        checked={ch.enabled}
                        onCheckedChange={(checked) =>
                          toggleChannel(ch.channel, checked === true)
                        }
                      />
                      <span className="inline-flex items-center gap-2 text-[13px] text-foreground">
                        <Icon
                          className="size-3.5 shrink-0 text-muted-foreground"
                          strokeWidth={1.6}
                          absoluteStrokeWidth
                          aria-hidden
                        />
                        {CHANNEL_LABELS[ch.channel]}
                      </span>
                    </label>
                  );
                })}
              </div>
            </SectionBox>
          </section>

          {/* ── Channel settings ───────────────────────────────────────── */}
          {enabledChannels.length > 0 ? (
            <section className="mt-8 flex flex-col gap-3">
              <SectionLabel icon={MessageSquare}>Channel settings</SectionLabel>
              <div className="flex flex-col gap-3">
                {enabledChannels.map((ch) => {
                  const Icon = CHANNEL_ICONS[ch.channel];
                  const rules = channelRules[ch.channel] ?? [];
                  return (
                    <SectionBox key={ch.channel} className="px-4 py-4">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex size-6 items-center justify-center rounded-md bg-muted">
                            <Icon
                              className="size-3.5 text-muted-foreground"
                              strokeWidth={1.6}
                              absoluteStrokeWidth
                              aria-hidden
                            />
                          </span>
                          <span className="text-[13px] font-medium text-foreground">
                            {CHANNEL_LABELS[ch.channel]}
                          </span>
                        </div>
                        {rules.map((rule, idx) => (
                          <div key={rule.id} className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                              <div className="min-w-0 flex-1">
                                <ChannelRuleSelect value={rule.intent} ariaLabel={`${CHANNEL_LABELS[ch.channel]} channel`} />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeRule(ch.channel, rule.id)}
                                aria-label={`Remove ${CHANNEL_LABELS[ch.channel]} rule`}
                                className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              >
                                <X className="size-5" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                              </button>
                            </div>
                            <ChannelRuleSelect value={rule.event} ariaLabel={`${CHANNEL_LABELS[ch.channel]} event`} />
                            <ChannelRuleSelect value={rule.timing} ariaLabel={`${CHANNEL_LABELS[ch.channel]} timing`} />
                            <div className="inline-flex items-center gap-2 text-[12px] text-primary">
                              <button
                                type="button"
                                onClick={() => addRule(ch.channel)}
                                className="inline-flex items-center gap-1 rounded-md px-1 py-0.5 transition-colors hover:bg-primary/10"
                              >
                                <Plus className="size-4" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                                Add
                              </button>
                              <ChevronDown className="size-4" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                            </div>
                            {idx < rules.length - 1 ? (
                              <div className="inline-flex items-center gap-1 text-[12px] font-medium uppercase tracking-wide text-muted-foreground">
                                <span>OR</span>
                                <ChevronDown className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                              </div>
                            ) : null}
                          </div>
                        ))}
                        {rules.length === 0 ? (
                          <button
                            type="button"
                            onClick={() => addRule(ch.channel)}
                            className="inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 text-[12px] text-primary transition-colors hover:bg-primary/10"
                          >
                            <Plus className="size-4" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
                            Add
                          </button>
                        ) : null}
                      </div>
                    </SectionBox>
                  );
                })}
              </div>
            </section>
          ) : null}

          {/* ── Location scope ─────────────────────────────────────────── */}
          <section className="mt-8 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <SectionLabel icon={MapPin}>Location scope</SectionLabel>
              <span className="text-[12px] text-muted-foreground">
                {settings.locations.length} location{settings.locations.length !== 1 ? "s" : ""}
              </span>
            </div>
            <SectionBox className="px-4 py-4">
              <div className="flex flex-col gap-4">
                {settings.locations.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {settings.locations.map((loc) => (
                      <LocationPill
                        key={loc}
                        label={loc}
                        onRemove={() => removeLocation(loc)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-muted-foreground">
                    No locations added. This agent will apply to all locations.
                  </p>
                )}
              </div>
            </SectionBox>
          </section>
          </div>

          {/* ── Context sidebar (matches procedure detail) ─────────────── */}
          <aside className="hidden w-[400px] shrink-0 flex-col gap-4 lg:flex">
            <AdditionalContextPanel
              items={settings.additionalContext}
              onAdd={addContext}
              onRemove={removeContext}
            />
          </aside>
        </div>
      </div>

      {/* ── Save footer ────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 flex items-center justify-between border-t border-border bg-background/95 backdrop-blur-sm px-6 py-4 transition-all duration-200",
          saved ? "translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100",
        )}
        aria-live="polite"
      >
        <p className="text-[13px] text-muted-foreground">You have unsaved changes.</p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 rounded-lg text-[13px]"
            onClick={() => {
              setSettings({ ...DEFAULT_SETTINGS, ...initialSettings });
              setChannelRules(DEFAULT_CHANNEL_RULES);
              setSaved(true);
            }}
          >
            Discard
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-9 gap-1.5 rounded-lg text-[13px]"
            onClick={handleSave}
          >
            <Check className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}
