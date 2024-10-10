import axios from "axios";
import cheerio from "cheerio";

export async function scrapeWebsite(
  url: string,
  maxExecutionTime: number = 300000
): Promise<string> {
  try {
    const response = await axios.get(url, {
      timeout: maxExecutionTime,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    const $ = cheerio.load(response.data);

    // Remove script and style elements
    $("script, style").remove();

    // Get the text content
    let text = $("body").text();

    // Clean up whitespace
    text = text.replace(/\s+/g, " ").trim();

    return text;
  } catch (error) {
    console.error("Error scraping website:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to scrape ${url}: ${error.message}`);
    } else {
      throw new Error(`Failed to scrape ${url}: Unknown error occurred`);
    }
  }
}
