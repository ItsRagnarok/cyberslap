"use client";

import { useEffect, useRef, useState } from "react";
import NavBar from "@/components/NavBar";

type Entry = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/chat")
      .then((r) => r.json())
      .then((d) => setEntries(d.entries ?? []));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries]);

  async function send() {
    if (!input.trim() || sending) return;
    const text = input;
    setInput("");
    setEntries((e) => [...e, { role: "user", content: text }]);
    setSending(true);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    const data = await res.json();
    setSending(false);
    if (data.reply) {
      setEntries((e) => [...e, { role: "assistant", content: data.reply }]);
    }
  }

  return (
    <main className="flex min-h-screen flex-col">
      <NavBar />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6">
        <div className="flex-1 space-y-4 overflow-y-auto pb-4">
          {entries.length === 0 && (
            <p className="opacity-50 text-sm">Spune-mi ce ai făcut azi.</p>
          )}
          {entries.map((e, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                e.role === "user"
                  ? "ml-auto bg-accent text-white"
                  : "bg-white/10"
              }`}
            >
              {e.content}
            </div>
          ))}
          {sending && <div className="text-sm opacity-50">...</div>}
          <div ref={bottomRef} />
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="mt-4 flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Scrie..."
            className="flex-1 rounded-full border border-white/20 bg-transparent px-4 py-3 outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={sending}
            className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            Trimite
          </button>
        </form>
      </div>
    </main>
  );
}
