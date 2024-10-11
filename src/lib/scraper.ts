import axios from "axios";
import * as cheerio from "cheerio";
import axiosRetry from "axios-retry";

// axios-retry
axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      error.code === "ECONNABORTED"
    );
  },
});

export async function scrapeWebsite(
  url: string,
  maxExecutionTime: number = 60000, // Default to 60 seconds
  filter: boolean = false,
  store: boolean = false
): Promise<string> {
  try {
    const response = await axios.get(url, {
      timeout: maxExecutionTime,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    console.log(`Successfully fetched content from ${url}`);

    const $ = cheerio.load(response.data);

    if (filter) {
      // Remove script and style elements
      $("script, style").remove();
    }

    // Get the text content
    let text = $("body").text();

    // Clean up whitespace
    text = text.replace(/\s+/g, " ").trim();

    console.log(`Extracted ${text.length} characters of cleaned text`);

    if (store) {
      console.log(
        "Storing content (first 100 characters):",
        text.slice(0, 100)
      );
    }

    return text;
  } catch (error) {
    console.error("Error scraping website:", error);
    let errorMessage: string;

    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        errorMessage = `Failed to scrape ${url}: Request timed out after ${maxExecutionTime}ms`;
      } else if (error.response) {
        errorMessage = `Failed to scrape ${url}: Received ${error.response.status} status`;
      } else if (error.request) {
        errorMessage = `Failed to scrape ${url}: No response received`;
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
