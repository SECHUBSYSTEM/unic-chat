import { NextRequest } from "next/server";
import { HfInference } from "@huggingface/inference";

const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN!;
const inference = new HfInference(HF_TOKEN);
const MODEL = "microsoft/Phi-3-mini-4k-instruct";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const stream = await inference.chatCompletionStream({
      model: MODEL,
      messages,
      temperature: 0.5,
      max_tokens: 1000,
      top_p: 0.7,
    });

    const encoder = new TextEncoder();

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || "";
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              );
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          } catch (error) {
            console.error("Streaming error:", error);
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  error: "Streaming error occurred",
                })}\n\n`
              )
            );
          } finally {
            controller.close();
          }
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
    return new Response(
      JSON.stringify({
        error: "An error occurred while processing your request",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
