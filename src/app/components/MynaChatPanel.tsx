"use client";

import { useState } from "react";
import { X, SendHorizontal } from "lucide-react";
import {
  ChatContainerContent,
  ChatContainerRoot,
  ChatContainerScrollAnchor,
} from "@/app/components/ui/chat-container";
import { Message, MessageAvatar, MessageContent } from "@/app/components/ui/message";
import {
  PromptInput,
  PromptInputActions,
  PromptInputTextarea,
} from "@/app/components/ui/prompt-input";
import { PromptSuggestion } from "@/app/components/ui/prompt-suggestion";
import { ScrollButton } from "@/app/components/ui/scroll-button";

type ChatLine = { id: string; role: "user" | "assistant"; text: string };

const PLACEHOLDER_PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const seedMessages: ChatLine[] = [
  {
    id: "1",
    role: "assistant",
    text:
      "Hi — I am **Myna**. Ask about reports, agents, or your workspace. I can summarize data and suggest next steps.",
  },
];

export function MynaChatPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatLine[]>(seedMessages);
  const [draft, setDraft] = useState("");

  const send = () => {
    const t = draft.trim();
    if (!t) return;
    setMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), role: "user", text: t },
      {
        id: crypto.randomUUID(),
        role: "assistant",
        text:
          "Thanks for your message. This panel is wired with **prompt-kit** chat UI; connect your backend to stream real answers here.",
      },
    ]);
    setDraft("");
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-[#e5e9f0] px-4 py-2 dark:border-[#333a47]">
        <p className="text-[14px] text-[#212121] dark:text-[#e4e4e4]" style={{ fontWeight: 500 }}>
          Myna AI
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-[#555] hover:bg-[#f0f1f5] dark:text-[#8b92a5] dark:hover:bg-[#2e3340]"
          aria-label="Close chat"
        >
          <X className="size-4" />
        </button>
      </div>

      <ChatContainerRoot className="relative min-h-0 flex-1">
        <ChatContainerContent className="gap-4 px-4 pb-4 pt-2">
          {messages.map((msg) => (
            <Message key={msg.id}>
              {msg.role === "assistant" ? (
                <MessageAvatar src={PLACEHOLDER_PIXEL} alt="Myna" fallback="M" />
              ) : (
                <MessageAvatar src={PLACEHOLDER_PIXEL} alt="You" fallback="Y" />
              )}
              <MessageContent markdown={msg.role === "assistant"}>{msg.text}</MessageContent>
            </Message>
          ))}
          <ChatContainerScrollAnchor />
        </ChatContainerContent>
        <div className="pointer-events-none absolute bottom-24 left-1/2 z-10 -translate-x-1/2">
          <ScrollButton type="button" className="pointer-events-auto shadow-md" />
        </div>
      </ChatContainerRoot>

      <div className="shrink-0 border-t border-[#e5e9f0] px-4 py-2 dark:border-[#333a47]">
        <div className="mb-2 flex flex-wrap gap-2">
          {["Summarize last week", "Draft a report email", "Explain this view"].map((label) => (
            <PromptSuggestion
              key={label}
              variant="outline"
              size="sm"
              className="rounded-lg text-[12px]"
              type="button"
              onClick={() => setDraft(label)}
            >
              {label}
            </PromptSuggestion>
          ))}
        </div>
        <PromptInput onSubmit={send} className="rounded-lg">
          <PromptInputTextarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Message Myna…"
            className="min-h-[44px] text-[13px]"
          />
          <PromptInputActions className="justify-end p-2">
            <button
              type="button"
              onClick={send}
              className="inline-flex size-8 items-center justify-center rounded-lg bg-[#2552ED] text-white hover:opacity-90"
              aria-label="Send"
            >
              <SendHorizontal className="size-4" />
            </button>
          </PromptInputActions>
        </PromptInput>
      </div>
    </div>
  );
}
