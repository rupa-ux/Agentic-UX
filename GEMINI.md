# Gemini — project rules for ShareConsolidated (Bird AI)

## Storybook story required for every new component

When you create a **new** component under `src/app/components/` (including `ui/`), you **must** also create a story under `src/stories/` in the same response.

**Do not** consider a component task complete without a story.

### Story rules

- File: `src/stories/<ComponentName>.stories.tsx`
- Title: `UI/<Name>` for primitives, `App/<Name>` for views/panels, `Design System/<name>` for token demos
- Always include a `Default` story + one story per key variant
- Use sentence case for story names
- Import the component directly — no mocks

### Minimum story

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { MyComponent } from "@/app/components/MyComponent";

const meta: Meta<typeof MyComponent> = {
  title: "UI/MyComponent",
  component: MyComponent,
};
export default meta;
type Story = StoryObj<typeof MyComponent>;

export const Default: Story = { args: {} };
```

---

## Design system

- Colour tokens: `src/styles/theme.css` — use Tailwind semantic classes (`bg-primary`, `text-muted-foreground`, `border-border`)
- Shell layout constants: `src/app/components/layout/mainViewTitleClasses.ts`, `appShellClasses.ts`
- Floating panel surface: `src/app/components/ui/floatingPanelSurface.ts`
- Modal overlay: `src/app/components/ui/modalOverlayClasses.ts`

## aero-ds package

- `@balajik-cmyk/aero-ds` is installed as an npm dependency from GitHub Package Registry
- It exports: `cn`, `DESIGN_VERSION`, shell layout classes, floating panel classes
- Do **not** modify files inside `aero-ds/` directly — it is a separate repo

## Stack

React · Vite · Tailwind v4 · shadcn-style primitives · Radix UI · TanStack Table · React Router v7 · Storybook 8
