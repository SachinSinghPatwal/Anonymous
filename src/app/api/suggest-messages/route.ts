// app/api/suggest-messages/route.ts
import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { ApiResponse } from "@/types/ApiResponse";
import { NextResponse } from "next/server";
import NormalizeError from "@/helpers/normalizeError";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { prompt: incomingPrompt, input } = await req.json().catch(() => ({}));
  const prompt =
    incomingPrompt ??
    "Create a list of three open-ended questions separated by '||'";

  const result = await streamText({
    model: google("gemini-2.5-flash"),
    prompt,
    maxOutputTokens: 200,
  });

  // Take the model's text stream, split to words, emit each word as its own chunk
  const encoder = new TextEncoder();
  let carry = ""; // buffer for partial tokens crossing chunk boundaries

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = result.textStream.getReader();

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          // value is a string chunk; prepend any carry from previous chunk
          const text = carry + value;
          // split on whitespace but keep delimiters as spaces when rejoining
          const parts = text.split(/(\s+)/);

          // if the last part might be an incomplete word, keep it in carry
          carry = parts.pop() ?? "";

          for (const part of parts) {
            if (part.length === 0) continue;
            controller.enqueue(encoder.encode(part));
          }
        }
        // flush any remaining carry
        if (carry) controller.enqueue(encoder.encode(carry));
      } catch (error) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            message: "Error registering user",
            error: NormalizeError("Error registering user", error),
          },
          { status: 500 }
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
