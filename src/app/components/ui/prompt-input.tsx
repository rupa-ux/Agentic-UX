"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "./utils";

// ─── Context ─────────────────────────────────────────────────────────────────
interface PromptInputContextValue {
  disabled: boolean;
  isLoading: boolean;
}

const PromptInputContext = React.createContext<PromptInputContextValue>({
  disabled: false,
  isLoading: false,
});

function usePromptInput() {
  return React.useContext(PromptInputContext);
}

// ─── PromptInput (Root) ──────────────────────────────────────────────────────
interface PromptInputProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading?: boolean;
  disabled?: boolean;
  onSubmit?: () => void;
}

const PromptInput = React.forwardRef<HTMLDivElement, PromptInputProps>(
  (
    {
      className,
      children,
      isLoading = false,
      disabled = false,
      onSubmit,
      ...props
    },
    ref
  ) => {
    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey && onSubmit && !disabled && !isLoading) {
          e.preventDefault();
          onSubmit();
        }
      },
      [onSubmit, disabled, isLoading]
    );

    return (
      <PromptInputContext.Provider value={{ disabled, isLoading }}>
        <div
          ref={ref}
          data-slot="prompt-input"
          data-loading={isLoading || undefined}
          data-disabled={disabled || undefined}
          onKeyDown={handleKeyDown}
          className={cn(
            "relative rounded-xl border border-[#e5e9f0] bg-white transition-all duration-200",
            "focus-within:border-[#c4d5e9] focus-within:shadow-[0_0_0_2px_rgba(25,118,210,0.08)]",
            "hover:border-[#d0d5dc]",
            disabled && "pointer-events-none opacity-50",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </PromptInputContext.Provider>
    );
  }
);
PromptInput.displayName = "PromptInput";

// ─── PromptInputTextarea ─────────────────────────────────────────────────────
interface PromptInputTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxRows?: number;
}

const PromptInputTextarea = React.forwardRef<
  HTMLTextAreaElement,
  PromptInputTextareaProps
>(({ className, maxRows = 5, value, onChange, ...props }, ref) => {
  const internalRef = React.useRef<HTMLTextAreaElement>(null);
  const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;
  const { disabled } = usePromptInput();

  const adjustHeight = React.useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const lineHeight = 20;
    const maxHeight = lineHeight * maxRows;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, [maxRows, textareaRef]);

  React.useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  return (
    <div className="px-3.5 pt-3 pb-1">
      <textarea
        ref={textareaRef}
        data-slot="prompt-input-textarea"
        value={value}
        onChange={onChange}
        disabled={disabled}
        rows={1}
        className={cn(
          "w-full resize-none bg-transparent text-[13px] text-[#212121] placeholder:text-[#a3a3a3] outline-none leading-[20px]",
          className
        )}
        style={{ minHeight: "20px" }}
        {...props}
      />
    </div>
  );
});
PromptInputTextarea.displayName = "PromptInputTextarea";

// ─── PromptInputActions ──────────────────────────────────────────────────────
const PromptInputActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="prompt-input-actions"
      className={cn("flex items-center justify-between px-2 pb-2", className)}
      {...props}
    >
      {children}
    </div>
  );
});
PromptInputActions.displayName = "PromptInputActions";

// ─── PromptInputAction ───────────────────────────────────────────────────────
interface PromptInputActionProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tooltip?: string;
  asChild?: boolean;
}

const PromptInputAction = React.forwardRef<
  HTMLButtonElement,
  PromptInputActionProps
>(({ className, tooltip, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      data-slot="prompt-input-action"
      type="button"
      title={tooltip}
      className={cn(
        "p-1.5 rounded-lg transition-colors",
        "hover:bg-[#f5f5f5] text-[#888] hover:text-[#555]",
        "disabled:pointer-events-none disabled:opacity-40",
        className
      )}
      {...props}
    />
  );
});
PromptInputAction.displayName = "PromptInputAction";

export {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
  PromptInputAction,
  usePromptInput,
};
