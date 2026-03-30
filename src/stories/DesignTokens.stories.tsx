import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Design System/Tokens",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

const colors = [
  { name: "Background", var: "--background", class: "bg-background" },
  { name: "Foreground", var: "--foreground", class: "bg-foreground" },
  { name: "Primary", var: "--primary", class: "bg-primary" },
  { name: "Primary Foreground", var: "--primary-foreground", class: "bg-primary-foreground border" },
  { name: "Secondary", var: "--secondary", class: "bg-secondary" },
  { name: "Muted", var: "--muted", class: "bg-muted" },
  { name: "Muted Foreground", var: "--muted-foreground", class: "bg-muted-foreground" },
  { name: "Accent", var: "--accent", class: "bg-accent" },
  { name: "Destructive", var: "--destructive", class: "bg-destructive" },
  { name: "Border", var: "--border", class: "bg-border" },
  { name: "Input Background", var: "--input-background", class: "bg-input-background border" },
  { name: "Card", var: "--card", class: "bg-card border" },
];

const chartColors = [
  { name: "Chart 1", class: "bg-chart-1" },
  { name: "Chart 2", class: "bg-chart-2" },
  { name: "Chart 3", class: "bg-chart-3" },
  { name: "Chart 4", class: "bg-chart-4" },
  { name: "Chart 5", class: "bg-chart-5" },
];

const sidebarColors = [
  { name: "Sidebar", class: "bg-sidebar border" },
  { name: "Sidebar Primary", class: "bg-sidebar-primary" },
  { name: "Sidebar Accent", class: "bg-sidebar-accent border" },
  { name: "Sidebar Border", class: "bg-sidebar-border" },
];

export const Colors: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="text-lg mb-4">Base Colors</h3>
        <div className="grid grid-cols-4 gap-3">
          {colors.map(({ name, var: cssVar, class: cls }) => (
            <div key={name} className="flex flex-col gap-1.5">
              <div className={`h-12 w-full rounded-lg ${cls}`} />
              <p className="text-sm">{name}</p>
              <p className="text-xs text-muted-foreground font-mono">{cssVar}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg mb-4">Chart Colors</h3>
        <div className="grid grid-cols-5 gap-3">
          {chartColors.map(({ name, class: cls }) => (
            <div key={name} className="flex flex-col gap-1.5">
              <div className={`h-12 w-full rounded-lg ${cls}`} />
              <p className="text-sm">{name}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg mb-4">Sidebar Colors</h3>
        <div className="grid grid-cols-4 gap-3">
          {sidebarColors.map(({ name, class: cls }) => (
            <div key={name} className="flex flex-col gap-1.5">
              <div className={`h-12 w-full rounded-lg ${cls}`} />
              <p className="text-sm">{name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};

export const Typography: Story = {
  render: () => (
    <div className="flex flex-col gap-6 max-w-xl">
      <div>
        <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide">Headings</p>
        <h1>Heading 1 — 2xl / weight 400</h1>
        <h2>Heading 2 — xl / weight 400</h2>
        <h3>Heading 3 — lg / weight 400</h3>
        <h4>Heading 4 — base / weight 400</h4>
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide">Body</p>
        <p className="text-base">Base text — Inter Regular (400)</p>
        <p className="text-sm">Small text — text-sm</p>
        <p className="text-xs">Extra small — text-xs</p>
        <p className="text-base font-light">Light text — weight 300</p>
        <p className="text-sm text-muted-foreground">Muted text</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide">Font weights (all clamped to 300–400)</p>
        <p className="font-thin">font-thin → 300</p>
        <p className="font-light">font-light → 300</p>
        <p className="font-normal">font-normal → 300</p>
        <p className="font-medium">font-medium → 400</p>
        <p className="font-semibold">font-semibold → 400</p>
        <p className="font-bold">font-bold → 400</p>
      </div>
    </div>
  ),
};

export const Spacing: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">Border Radius</p>
      <div className="flex flex-wrap gap-4 items-end">
        {[
          { name: "radius-sm", cls: "rounded-sm" },
          { name: "radius-md", cls: "rounded-md" },
          { name: "radius-lg", cls: "rounded-lg" },
          { name: "radius-xl", cls: "rounded-xl" },
          { name: "radius-full", cls: "rounded-full" },
        ].map(({ name, cls }) => (
          <div key={name} className="flex flex-col items-center gap-2">
            <div className={`w-16 h-16 bg-primary ${cls}`} />
            <p className="text-xs text-muted-foreground">{name}</p>
          </div>
        ))}
      </div>
    </div>
  ),
};
