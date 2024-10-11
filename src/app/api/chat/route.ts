import { NextRequest, NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";

const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
if (!HF_TOKEN) {
  throw new Error("HUGGINGFACE_API_TOKEN is not set in environment variables");
}

const inference = new HfInference(HF_TOKEN);
const MODEL = "microsoft/Phi-3-mini-4k-instruct";

export const runtime = "edge";

interface Message {
  role: string;
  content: string;
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  try {
    const { messages }: { messages: Message[] } = await req.json();

    const stream = await inference.textGenerationStream({
      model: MODEL,
      inputs:
        messages.map((m) => `${m.role}: ${m.content}`).join("\n") +
        "\nassistant:",
      parameters: {
        max_new_tokens: 1024,
        temperature: 0.5,
        top_p: 0.7,
      },
    });

    return new Response(
      new ReadableStream({
        async start(controller) {
          for await (const chunk of stream) {
            const content = chunk.token.text;
            if (content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      }),
      {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      }
    );
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
