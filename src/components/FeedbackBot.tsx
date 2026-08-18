"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  BOT_GREETING,
  BOT_SUGGESTIONS_ADMIN,
  BOT_SUGGESTIONS_IDLE,
  emptyDraft,
  handleBotTurn,
  type BotMessage,
  type ChatStep,
  type DraftFeedback,
} from "@/lib/bot";

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function FeedbackBot() {
  const pathname = usePathname();
  const panelId = useId();
  const onAdmin = pathname.startsWith("/admin");
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [step, setStep] = useState<ChatStep>("idle");
  const [draft, setDraft] = useState<DraftFeedback>(emptyDraft);
  const [suggestions, setSuggestions] = useState(
    onAdmin ? BOT_SUGGESTIONS_ADMIN : BOT_SUGGESTIONS_IDLE,
  );
  const [messages, setMessages] = useState<BotMessage[]>([
    { id: "greeting", role: "bot", text: BOT_GREETING },
  ]);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open, typing]);

  async function submitDraft(nextDraft: DraftFeedback) {
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextDraft),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return data.error || "Could not save feedback. Try again.";
    }
    return "Thanks — your feedback is in the review queue. Staff will see it on the Admin desk.";
  }

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    const userMsg: BotMessage = { id: makeId(), role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    const turn = handleBotTurn(trimmed, step, draft);

    window.setTimeout(async () => {
      let reply = turn.reply;
      let nextStep = turn.step;
      let nextDraft = turn.draft;
      let nextSuggestions = turn.suggestions;

      if (turn.shouldSubmit) {
        reply = await submitDraft(turn.draft);
        nextStep = "idle";
        nextDraft = emptyDraft();
        nextSuggestions = BOT_SUGGESTIONS_IDLE;
      }

      setStep(nextStep);
      setDraft(nextDraft);
      setSuggestions(nextSuggestions);
      setMessages((prev) => [
        ...prev,
        { id: makeId(), role: "bot", text: reply },
      ]);
      setTyping(false);
    }, 450);
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
          aria-label="CampusBot chatbot"
        >
          <header className="voicebot__header">
            <div className="voicebot__identity">
              <span className="voicebot__avatar" aria-hidden="true">
                CB
              </span>
              <div>
                <p className="voicebot__eyebrow">CampusVoice chatbot</p>
                <h2>CampusBot</h2>
                <p className="voicebot__status">
                  <span className="voicebot__dot" /> Online
                </p>
              </div>
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
            {typing && (
              <div
                className="voicebot__bubble voicebot__bubble--bot voicebot__typing"
                aria-live="polite"
              >
                <span />
                <span />
                <span />
              </div>
            )}
          </div>

          {suggestions.length > 0 && (
            <div className="voicebot__suggestions">
              {suggestions.map((suggestion) => (
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
          )}

          <form className="voicebot__form" onSubmit={onSubmit}>
            <label className="sr-only" htmlFor="voicebot-input">
              Message CampusBot
            </label>
            <input
              id="voicebot-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask or submit feedback…"
              autoComplete="off"
              disabled={typing}
            />
            <button
              type="submit"
              className="btn btn--primary voicebot__send"
              disabled={typing}
            >
              Send
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="voicebot__launcher"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Close chat" : "Chat with CampusBot"}
      </button>
    </div>
  );
}
