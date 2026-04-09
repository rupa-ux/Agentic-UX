import type { Meta, StoryObj } from "@storybook/react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  type SheetFloatingSize,
} from "@/app/components/ui/sheet";
import { Button } from "@/app/components/ui/button";
import {
  FLOATING_SHEET_FRAME_CONTENT_CLASS,
  FloatingSheetFrame,
} from "@/app/components/layout/FloatingSheetFrame";

const meta: Meta = {
  title: "UI/Sheet",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Floating **side panels** only: **Radix `Sheet`** with `side=\"right\"`, `inset=\"floating\"`, and `floatingSize` (**sm** 340px, **md** 480px, **lg** 640px). Inset from top, right, and bottom with rounded corners. Dismiss with the **top-right** close control on **`SheetContent`** (single close affordance; avoid duplicating it in the footer). Prefer **`FloatingSheetFrame`** (`@/app/components/layout/FloatingSheetFrame`) for edging header, scrollable body only, and sticky footer actions; set **`SheetContent`** `className` to include **`FLOATING_SHEET_FRAME_CONTENT_CLASS`** (`overflow-hidden`) so the frame body owns vertical scroll. For a full product example on **medium** (profile + password), see **App/Settings/Account settings**.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

function FloatingPlaceholder({
  floatingSize,
  title,
}: {
  floatingSize: SheetFloatingSize;
  title: string;
}) {
  const px = floatingSize === "sm" ? 340 : floatingSize === "md" ? 480 : 640;
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open {title.toLowerCase()} panel</Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        inset="floating"
        floatingSize={floatingSize}
        className={FLOATING_SHEET_FRAME_CONTENT_CLASS}
      >
        <FloatingSheetFrame
          title={title}
          description={
            <>
              Generic floating shell — <strong>{floatingSize}</strong> ({px}px max width, capped on
              narrow viewports).
            </>
          }
          primaryAction={{
            label: "Continue",
            onClick: () => {
              // Storybook demo only
            },
          }}
        >
          <p className="text-sm text-muted-foreground">
            Only this region changes per feature. Pass <code className="text-xs">floatingSize</code>{" "}
            on <code className="text-xs">SheetContent</code>.
          </p>
          <div className="mt-8 flex flex-col gap-4 text-sm text-muted-foreground">
            {Array.from({ length: 12 }, (_, i) => (
              <p key={i}>
                Scrollable body line {i + 1} — header and footer stay fixed while this area scrolls.
              </p>
            ))}
          </div>
        </FloatingSheetFrame>
      </SheetContent>
    </Sheet>
  );
}

export const Small: Story = {
  render: () => <FloatingPlaceholder floatingSize="sm" title="Small panel" />,
};

export const Medium: Story = {
  render: () => <FloatingPlaceholder floatingSize="md" title="Medium panel" />,
};

export const Large: Story = {
  render: () => <FloatingPlaceholder floatingSize="lg" title="Large panel" />,
};
