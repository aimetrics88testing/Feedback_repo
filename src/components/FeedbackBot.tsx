"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  BOT_GREETING,
  BOT_SUGGESTIONS,
  getBotReply,
  type BotMessage,
} from "@/lib/bot";

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function FeedbackBot() {
  const pathname = usePathname();
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<BotMessage[]>([
    { id: "greeting", role: "bot", text: BOT_GREETING },
  ]);
  const listRef = useRef<HTMLDivElement>(null);

  const hideOnAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open]);

  if (hideOnAdmin) return null;

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: BotMessage = { id: makeId(), role: "user", text: trimmed };
    const botMsg: BotMessage = {
      id: makeId(),
      role: "bot",
      text: getBotReply(trimmed),
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    send(input);
  }

  return (
    <div className="voicebot">
      {open && (
        <section
          className="voicebot__panel"
          id={panelId}
          aria-label="VoiceBot help chat"
        >
          <header className="voicebot__header">
            <div>
              <p className="voicebot__eyebrow">Help</p>
              <h2>VoiceBot</h2>
            </div>
            <button
              type="button"
              className="voicebot__close"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </header>

          <div className="voicebot__messages" ref={listRef}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`voicebot__bubble voicebot__bubble--${message.role}`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <div className="voicebot__suggestions">
            {BOT_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="voicebot__chip"
                onClick={() => send(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>

          <form className="voicebot__form" onSubmit={onSubmit}>
            <label className="sr-only" htmlFor="voicebot-input">
              Message VoiceBot
            </label>
            <input
              id="voicebot-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about feedback…"
              autoComplete="off"
            />
            <button type="submit" className="btn btn--primary voicebot__send">
              Send
            </button>
          </form>

          <p className="voicebot__cta">
            Ready to write?{" "}
            <Link href="/submit" onClick={() => setOpen(false)}>
              Share feedback
            </Link>
          </p>
        </section>
      )}

      <button
        type="button"
        className="voicebot__launcher"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Close" : "Ask VoiceBot"}
      </button>
    </div>
  );
}
