import * as cheerio from "cheerio";

// Custom fetch function with retry logic
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3
): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      // Exponential backoff
      await new Promise((r) => setTimeout(r, 2 ** i * 1000));
    }
  }
  // This line is to satisfy TypeScript, it will never be reached due to the throw in the loop
  throw new Error("Max retries reached");
}

/**
 * Scrape website content
 * @param url - The URL of the website to scrape
 * @param maxExecutionTime - Maximum execution time in milliseconds (default: 60000ms)
 * @param filter - Whether to filter out script and style elements (default: false)
 * @param store - Whether to store the content (for logging purposes) (default: false)
 * @param maxWords - Maximum number of words to return (default: 4000)
 * @returns Promise<string> - The scraped and processed text content
 */
export async function scrapeWebsite(
  url: string,
  maxExecutionTime: number = 60000,
  filter: boolean = false,
  store: boolean = false,
  maxWords: number = 4000
): Promise<string> {
  try {
    // Set up AbortController for timeout functionality
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), maxExecutionTime);

    // Fetch the webpage content
    const response = await fetchWithRetry(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    // Clear the timeout as the request has completed
    clearTimeout(timeoutId);

    const html = await response.text();
    console.log(`Successfully fetched content from ${url}`);

    // Parse the HTML content
    const $ = cheerio.load(html);

    // Remove script and style elements if filter is true
    if (filter) {
      $("script, style").remove();
    }

    // Extract and clean the text content
    let text = $("body").text();
    text = text.replace(/\s+/g, " ").trim();

    // Apply word limit
    const words = text.split(/\s+/);
    if (words.length > maxWords) {
      text = words.slice(0, maxWords).join(" ") + "...";
    }

    console.log(`Extracted ${text.length} characters of cleaned text`);

    // Log stored content if store is true
    if (store) {
      console.log(
        "Storing content (first 60 characters):",
        text.slice(0, 60)
      );
    }

    return text;
  } catch (error) {
    console.error("Error scraping website:", error);
    let errorMessage: string;

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        errorMessage = `Failed to scrape ${url}: Request timed out after ${maxExecutionTime}ms`;
      } else {
        errorMessage = `Failed to scrape ${url}: ${error.message}`;
      }
    } else {
      errorMessage = `Failed to scrape ${url}: Unknown error occurred`;
    }

    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}
