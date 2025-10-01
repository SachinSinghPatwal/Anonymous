import NormalizeError from "@/helpers/normalizeError";
import { ApiResponse } from "@/types/ApiResponse";
import { NextResponse } from "next/server";
import { streamText } from "ai";
import { google } from "@ai-sdk/google";

export const runtime = "edge";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { body, messages } = await req.json().catch(() => ({}));
  const prompt: string =
    body?.prompt ??
    "Create a list of three open-ended questions separated by '||'";

  const result = streamText({
    model: google("gemini-2.5-flash"),
    prompt,
    messages,
    maxOutputTokens: 200,
  });

  return result.toUIMessageStreamResponse();
}
