"use client";
import { useEffect, useRef, useState } from "react";

export default function SuggestPage() {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  async function askGemini() {
    setResponse("");
    setLoading(true);

    const res = await fetch("/api/suggest-messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: input,
      }),
    });

    if (!res.body) {
      setLoading(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });

      for (const word of chunk.split("---")) {
        if (!word) continue;
        await new Promise((r) => setTimeout(r, 60)); // 60ms per word
        setResponse((prev) => prev + word + " ");
      }
    }

    setLoading(false);
  }
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [response]);
  return (
    <div className="max-w-md mx-auto py-24">
      <h1 className="text-xl font-bold mb-4">Gemini</h1>
      <button
        onClick={() => {
          setInput("");
          askGemini();
        }}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {loading ? "Streaming..." : "Ask Gemini"}
      </button>
      <input
        type="text"
        className="border border-white block p-2 mt-3"
        placeholder="write here"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <pre className="whitespace-pre-wrap mt-6 border p-3 rounded bg-zinc-100 dark:bg-zinc-900">
        {response}
      </pre>
      <div ref={bottomRef} />
    </div>
  );
}
