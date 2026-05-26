import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, MessageSquare, Sparkles, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/components/ui/utils";

export const APPOINTMENT_AGENT_SANDBOX_PANEL_WIDTH = 480;

type SandboxMessage = { role: "user" | "assistant"; text: string };

export interface AppointmentAgentSandboxPanelProps {
  onClose: () => void;
  agentName?: string;
}

export function AppointmentAgentSandboxPanel({
  onClose,
  agentName = "Appointment agent",
}: AppointmentAgentSandboxPanelProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<SandboxMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isThinking) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setIsThinking(true);
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Thanks — I’m the ${agentName} sandbox. I’d check same-day availability before offering tomorrow, based on your latest procedure updates.`,
        },
      ]);
      setIsThinking(false);
    }, 900);
  }, [agentName, input, isThinking]);

  const showEmpty = messages.length === 0 && !isThinking;

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-4">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
            aria-hidden
          >
            <Sparkles className="size-4" strokeWidth={1.6} absoluteStrokeWidth />
          </span>
          <span className="text-[15px] font-semibold text-foreground">Test agent</span>
        </div>
        <button
          type="button"
          aria-label="Close"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={onClose}
        >
          <X className="size-4" strokeWidth={1.6} absoluteStrokeWidth />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4">
        {showEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
            <MessageSquare
              className="size-10 text-muted-foreground/40"
              strokeWidth={1.6}
              absoluteStrokeWidth
              aria-hidden
            />
            <p className="mt-4 text-[14px] font-medium text-foreground">
              Start a test conversation with your agent.
            </p>
            <p className="mt-2 max-w-[300px] text-[13px] leading-relaxed text-muted-foreground">
              This is a safe way to test your updates and shape the agent&apos;s replies.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-2">
            {messages.map((msg, index) => (
              <div
                key={`${msg.role}-${index}`}
                className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                <p
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-[13px] leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  {msg.text}
                </p>
              </div>
            ))}
            {isThinking ? (
              <p className="text-[12px] text-muted-foreground">Agent is typing…</p>
            ) : null}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border px-4 py-4">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={2}
            placeholder="Type a message…"
            className="min-h-[72px] w-full resize-none rounded-lg border border-border bg-background px-3 py-2 pr-12 text-[13px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
          <Button
            type="button"
            size="icon"
            className="absolute right-2 bottom-2 size-8 shrink-0 rounded-lg"
            disabled={!input.trim() || isThinking}
            onClick={handleSend}
            aria-label="Send message"
          >
            <ArrowUp className="size-4" strokeWidth={1.6} absoluteStrokeWidth />
          </Button>
        </div>
      </div>
    </div>
  );
}
