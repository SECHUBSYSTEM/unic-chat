import { NextRequest, NextResponse } from "next/server";
import { scrapeWebsite } from "@/lib/scraper";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { url, maxExecutionTime, filter, store, maxWords } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const content = await scrapeWebsite(
      url,
      maxExecutionTime,
      filter,
      store,
      maxWords
    );
    return NextResponse.json({ content });
  } catch (error) {
    console.error("Scrape API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to scrape website",
      },
      { status: 500 }
    );
  }
}
