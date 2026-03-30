import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Design System/Tokens",
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj;

/* ── shared label ────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
      {children}
    </p>
  );
}

/* ══════════════════════════════════════════════════════
   COLOURS
   ══════════════════════════════════════════════════════ */
const baseColors = [
  { name: "Primary",            token: "--primary",            cls: "bg-primary" },
  { name: "Primary foreground", token: "--primary-foreground", cls: "bg-primary-foreground border" },
  { name: "Secondary",          token: "--secondary",          cls: "bg-secondary" },
  { name: "Muted",              token: "--muted",              cls: "bg-muted" },
  { name: "Accent",             token: "--accent",             cls: "bg-accent border" },
  { name: "Destructive",        token: "--destructive",        cls: "bg-destructive" },
  { name: "Background",         token: "--background",         cls: "bg-background border" },
  { name: "Card",               token: "--card",               cls: "bg-card border" },
  { name: "Border",             token: "--border",             cls: "bg-border" },
  { name: "Input background",   token: "--input-background",   cls: "bg-input-background border" },
  { name: "Foreground",         token: "--foreground",         cls: "bg-foreground" },
  { name: "Muted foreground",   token: "--muted-foreground",   cls: "bg-muted-foreground" },
];

const chartColors = [
  { name: "Chart 1", token: "--chart-1", cls: "bg-chart-1" },
  { name: "Chart 2", token: "--chart-2", cls: "bg-chart-2" },
  { name: "Chart 3", token: "--chart-3", cls: "bg-chart-3" },
  { name: "Chart 4", token: "--chart-4", cls: "bg-chart-4" },
  { name: "Chart 5", token: "--chart-5", cls: "bg-chart-5" },
];

const sidebarColors = [
  { name: "Sidebar",              token: "--sidebar",              cls: "bg-sidebar border" },
  { name: "Sidebar primary",      token: "--sidebar-primary",      cls: "bg-sidebar-primary" },
  { name: "Sidebar accent",       token: "--sidebar-accent",       cls: "bg-sidebar-accent border" },
  { name: "Sidebar foreground",   token: "--sidebar-foreground",   cls: "bg-sidebar-foreground" },
  { name: "Sidebar border",       token: "--sidebar-border",       cls: "bg-sidebar-border" },
];

export const Colors: Story = {
  name: "Colours",
  render: () => (
    <div className="flex flex-col gap-10 max-w-4xl">

      <div>
        <SectionLabel>Base colours</SectionLabel>
        <div className="grid grid-cols-4 gap-3">
          {baseColors.map(({ name, token, cls }) => (
            <div key={token} className="flex flex-col gap-2">
              <div className={`h-14 w-full rounded-lg ${cls}`} />
              <div className="flex flex-col gap-0.5">
                <p className="text-sm text-foreground">{name}</p>
                <p className="font-mono text-xs text-muted-foreground">{token}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Chart colours</SectionLabel>
        <div className="grid grid-cols-5 gap-3">
          {chartColors.map(({ name, token, cls }) => (
            <div key={token} className="flex flex-col gap-2">
              <div className={`h-14 w-full rounded-lg ${cls}`} />
              <div className="flex flex-col gap-0.5">
                <p className="text-sm text-foreground">{name}</p>
                <p className="font-mono text-xs text-muted-foreground">{token}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Sidebar colours</SectionLabel>
        <div className="grid grid-cols-5 gap-3">
          {sidebarColors.map(({ name, token, cls }) => (
            <div key={token} className="flex flex-col gap-2">
              <div className={`h-14 w-full rounded-lg ${cls}`} />
              <div className="flex flex-col gap-0.5">
                <p className="text-sm text-foreground">{name}</p>
                <p className="font-mono text-xs text-muted-foreground">{token}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  ),
};

/* ══════════════════════════════════════════════════════
   BORDER RADIUS
   ══════════════════════════════════════════════════════ */
const radiusTokens = [
  {
    name: "None",
    token: "--",
    cls: "rounded-none",
    tw: "rounded-none",
    value: "0px",
    use: "Flat / flush elements",
  },
  {
    name: "SM",
    token: "--radius-sm",
    cls: "rounded-sm",
    tw: "rounded-sm",
    value: "6px",
    use: "Tight UI chips, small badges",
  },
  {
    name: "MD",
    token: "--radius-md",
    cls: "rounded-md",
    tw: "rounded-md",
    value: "8px",
    use: "Buttons, inputs, select",
  },
  {
    name: "LG",
    token: "--radius-lg",
    cls: "rounded-lg",
    tw: "rounded-lg",
    value: "10px (base)",
    use: "Cards, popovers, dropdowns",
  },
  {
    name: "XL",
    token: "--radius-xl",
    cls: "rounded-xl",
    tw: "rounded-xl",
    value: "14px",
    use: "Modals, dialogs, panels",
  },
  {
    name: "2XL",
    token: "--",
    cls: "rounded-2xl",
    tw: "rounded-2xl",
    value: "16px",
    use: "Large feature cards",
  },
  {
    name: "3XL",
    token: "--",
    cls: "rounded-3xl",
    tw: "rounded-3xl",
    value: "24px",
    use: "Hero sections, splash cards",
  },
  {
    name: "Full",
    token: "--",
    cls: "rounded-full",
    tw: "rounded-full",
    value: "9999px",
    use: "Avatars, pills, toggles",
  },
];

export const BorderRadius: Story = {
  name: "Border Radius",
  render: () => (
    <div className="flex flex-col gap-10 max-w-4xl">

      {/* Visual swatch grid */}
      <div>
        <SectionLabel>Radius scale</SectionLabel>
        <div className="grid grid-cols-4 gap-4">
          {radiusTokens.map(({ name, token, tw, value, use }) => (
            <div key={tw} className="flex flex-col gap-3">
              <div
                className={`h-20 w-full bg-primary/10 border-2 border-primary/30 ${tw} flex items-center justify-center`}
              >
                <span className="text-xs text-primary font-mono">{tw}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-baseline justify-between">
                  <p className="text-sm text-foreground">{name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{value}</p>
                </div>
                {token !== "--" && (
                  <p className="font-mono text-[10px] text-primary">{token}</p>
                )}
                <p className="text-[11px] text-muted-foreground">{use}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table reference */}
      <div>
        <SectionLabel>Quick reference</SectionLabel>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["Token", "Tailwind class", "Value", "Used on"].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {radiusTokens.map(({ name, token, tw, value, use }) => (
                <tr key={tw} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-primary">{token !== "--" ? token : "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground">{tw}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{value}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real component examples */}
      <div>
        <SectionLabel>Radius in real components</SectionLabel>
        <div className="flex flex-wrap gap-4 items-start">
          <button className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-md">
            Button — rounded-md
          </button>
          <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded-full border border-border">
            Badge — rounded-full
          </span>
          <div className="px-4 py-3 bg-card border border-border rounded-lg text-sm text-foreground">
            Card — rounded-lg
          </div>
          <div className="px-5 py-4 bg-card border border-border rounded-xl text-sm text-foreground shadow-md">
            Dialog — rounded-xl
          </div>
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm">
            JD
          </div>
        </div>
      </div>

    </div>
  ),
};

/* ══════════════════════════════════════════════════════
   SHADOWS
   ══════════════════════════════════════════════════════ */
const shadowTokens = [
  {
    name: "None",
    tw: "shadow-none",
    use: "Flat, borderless surfaces",
  },
  {
    name: "SM",
    tw: "shadow-sm",
    use: "Subtle lift — inputs, tags",
  },
  {
    name: "Default",
    tw: "shadow",
    use: "Default card elevation",
  },
  {
    name: "MD",
    tw: "shadow-md",
    use: "Dropdowns, popovers",
  },
  {
    name: "LG",
    tw: "shadow-lg",
    use: "Floating panels, tooltips",
  },
  {
    name: "XL",
    tw: "shadow-xl",
    use: "Dialogs, modals",
  },
  {
    name: "2XL",
    tw: "shadow-2xl",
    use: "Large overlays, drawers",
  },
  {
    name: "Inner",
    tw: "shadow-inner",
    use: "Pressed states, inset wells",
  },
];

export const Shadows: Story = {
  name: "Shadows",
  render: () => (
    <div className="flex flex-col gap-10 max-w-4xl">

      {/* Visual swatch grid */}
      <div>
        <SectionLabel>Shadow scale</SectionLabel>
        <div className="grid grid-cols-4 gap-6">
          {shadowTokens.map(({ name, tw, use }) => (
            <div key={tw} className="flex flex-col gap-3">
              <div
                className={`h-20 w-full bg-card rounded-xl border border-border ${tw} flex items-center justify-center`}
              >
                <span className="font-mono text-xs text-muted-foreground">{tw}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm text-foreground">{name}</p>
                <p className="text-[11px] text-muted-foreground">{use}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table reference */}
      <div>
        <SectionLabel>Quick reference</SectionLabel>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["Tailwind class", "Level", "Used on"].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shadowTokens.map(({ name, tw, use }) => (
                <tr key={tw} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-foreground">{tw}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{name}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real component elevation examples */}
      <div>
        <SectionLabel>Elevation in real components</SectionLabel>
        <div className="flex flex-wrap gap-6 items-end">
          {[
            { label: "Input",   tw: "shadow-sm",  radius: "rounded-md",  extra: "px-3 py-2 border border-border bg-input-background" },
            { label: "Card",    tw: "shadow",      radius: "rounded-lg",  extra: "px-5 py-4 border border-border bg-card" },
            { label: "Popover", tw: "shadow-md",   radius: "rounded-xl",  extra: "px-5 py-4 border border-border bg-card" },
            { label: "Dialog",  tw: "shadow-xl",   radius: "rounded-xl",  extra: "px-6 py-5 border border-border bg-card" },
            { label: "Drawer",  tw: "shadow-2xl",  radius: "rounded-xl",  extra: "px-6 py-5 border border-border bg-card" },
          ].map(({ label, tw, radius, extra }) => (
            <div key={label} className="flex flex-col gap-2 items-center">
              <div className={`${extra} ${tw} ${radius} text-sm text-foreground min-w-[100px] text-center`}>
                {label}
              </div>
              <p className="font-mono text-[10px] text-muted-foreground">{tw}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  ),
};

/* ══════════════════════════════════════════════════════
   ELEVATION MAP — radius + shadow together
   ══════════════════════════════════════════════════════ */
export const ElevationMap: Story = {
  name: "Elevation Map",
  render: () => (
    <div className="flex flex-col gap-8 max-w-3xl">
      <SectionLabel>Elevation map — radius + shadow per surface type</SectionLabel>

      <div className="flex flex-col gap-4">
        {[
          {
            level: "0 — Flat",
            shadow: "shadow-none",
            radius: "rounded-md",
            bg: "bg-muted",
            border: "border border-border",
            desc: "Badges, chips, inline labels",
            example: "badge",
          },
          {
            level: "1 — Raised",
            shadow: "shadow-sm",
            radius: "rounded-md",
            bg: "bg-card",
            border: "border border-border",
            desc: "Inputs, selects, small buttons",
            example: "input",
          },
          {
            level: "2 — Card",
            shadow: "shadow",
            radius: "rounded-lg",
            bg: "bg-card",
            border: "border border-border",
            desc: "Content cards, list items",
            example: "card",
          },
          {
            level: "3 — Floating",
            shadow: "shadow-md",
            radius: "rounded-xl",
            bg: "bg-card",
            border: "border border-border",
            desc: "Dropdowns, popovers, command palette",
            example: "dropdown",
          },
          {
            level: "4 — Overlay",
            shadow: "shadow-xl",
            radius: "rounded-xl",
            bg: "bg-card",
            border: "border border-border",
            desc: "Dialogs, modals, sheets",
            example: "modal",
          },
          {
            level: "5 — Temporary",
            shadow: "shadow-2xl",
            radius: "rounded-2xl",
            bg: "bg-card",
            border: "border border-border",
            desc: "Side drawers, full-screen panels",
            example: "drawer",
          },
        ].map(({ level, shadow, radius, bg, border, desc, example }) => (
          <div key={level} className="flex items-center gap-6">
            {/* Swatch */}
            <div
              className={`w-24 h-14 shrink-0 ${bg} ${border} ${shadow} ${radius} flex items-center justify-center`}
            >
              <span className="text-[10px] font-mono text-muted-foreground">{example}</span>
            </div>
            {/* Metadata */}
            <div className="flex flex-col gap-1 flex-1">
              <p className="text-sm text-foreground">{level}</p>
              <p className="text-[11px] text-muted-foreground">{desc}</p>
            </div>
            {/* Tokens */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="font-mono text-[10px] text-primary">{shadow}</span>
              <span className="font-mono text-[10px] text-muted-foreground">{radius}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};
