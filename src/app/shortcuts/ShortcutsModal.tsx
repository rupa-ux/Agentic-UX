import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { cn } from "@/app/components/ui/utils";
import type { AppView } from "@/app/App";
import {
  shortcutScopeFromView,
  shortcutsForModal,
  type ShortcutDefinition,
  type ShortcutScope,
} from "./shortcuts";

function modifierLabel(): string {
  if (typeof navigator === "undefined") return "⌘";
  return /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent) ? "⌘" : "Ctrl";
}

function KeyChip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "pointer-events-none inline-flex h-5 min-w-5 select-none items-center justify-center rounded border border-border bg-muted px-2 font-mono text-[10px] font-medium text-muted-foreground",
        className,
      )}
    >
      {children}
    </kbd>
  );
}

function KeySequence({ keys }: { keys: string[] }) {
  const mod = modifierLabel();
  return (
    <span className="flex flex-wrap items-center gap-1">
      {keys.map((k, i) => (
        <span key={`${k}-${i}`} className="flex items-center gap-1">
          {i > 0 && <span className="text-muted-foreground text-xs">+</span>}
          <KeyChip>{k === "⌘" ? mod : k}</KeyChip>
        </span>
      ))}
    </span>
  );
}

function ShortcutKeys({ def }: { def: ShortcutDefinition }) {
  if (def.keySequences?.length) {
    return (
      <span className="flex flex-wrap items-center gap-2">
        {def.keySequences.map((seq, i) => (
          <span key={seq.join("-")} className="flex flex-wrap items-center gap-2">
            {i > 0 && <span className="text-muted-foreground text-xs">or</span>}
            <KeySequence keys={seq} />
          </span>
        ))}
      </span>
    );
  }
  if (def.id.startsWith("go-") && def.keys.length > 1) {
    return (
      <span className="flex shrink-0 flex-wrap items-center gap-1">
        <KeyChip>G</KeyChip>
        <span className="text-muted-foreground text-xs">then</span>
        <KeyChip>{def.keys[1]}</KeyChip>
      </span>
    );
  }
  return <KeySequence keys={def.keys} />;
}

const scopeLabel: Record<ShortcutScope, string> = {
  global: "Everywhere",
  reviews: "Reviews",
  inbox: "Inbox",
  agents: "BirdAI",
  social: "Social",
  dashboard: "Reports & dashboards",
  ticketing: "Ticketing",
  surveys: "Surveys",
  default: "This view",
};

function groupRowsBySection(rows: ShortcutDefinition[]): {
  sectionKey: ShortcutScope | "global";
  heading: string;
  rows: ShortcutDefinition[];
}[] {
  const groups: { sectionKey: ShortcutScope | "global"; heading: string; rows: ShortcutDefinition[] }[] = [];
  for (const row of rows) {
    const sectionKey = row.scope === "global" ? "global" : row.scope;
    const heading =
      sectionKey === "global"
        ? scopeLabel.global
        : scopeLabel[row.scope as ShortcutScope] ?? row.scope;
    const last = groups[groups.length - 1];
    if (!last || last.sectionKey !== sectionKey) {
      groups.push({ sectionKey, heading, rows: [row] });
    } else {
      last.rows.push(row);
    }
  }
  return groups;
}

interface ShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentView: AppView;
}

export function ShortcutsModal({ open, onOpenChange, currentView }: ShortcutsModalProps) {
  const scope = shortcutScopeFromView(currentView);
  const rows = shortcutsForModal(scope);
  const sectionGroups = groupRowsBySection(rows);
  const mod = modifierLabel();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[min(640px,90vh)] gap-0 overflow-hidden p-0 sm:max-w-5xl"
        data-shortcuts-ignore
      >
        <DialogHeader className="border-b border-border px-6 py-4 text-left">
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription className="text-left">
            Press ? or {mod}+K anytime to open this panel. Press G, then a letter, to jump to a main area.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[min(480px,70vh)] overflow-y-auto px-6 py-4">
          <div className="flex flex-col gap-8">
            {sectionGroups.map((group) => (
              <section
                key={group.sectionKey}
                aria-label={group.heading}
                className="flex flex-col gap-4"
              >
                <h2 className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                  {group.heading}
                </h2>
                <ul className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.rows.map((row) => (
                    <li key={row.id} className="flex min-w-0 items-start gap-4">
                      <div className="min-h-5 shrink-0 pt-1">
                        <ShortcutKeys def={row} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground text-sm font-semibold">{row.description}</p>
                        {row.detail ? (
                          <p className="text-muted-foreground mt-1 text-xs leading-snug">{row.detail}</p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
