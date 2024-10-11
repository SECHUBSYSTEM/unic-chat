import { useState, useCallback, useRef } from "react";
import axios, { CancelTokenSource } from "axios";

interface Message {
  role: string;
  content: string;
}

export function useLLMAPI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelTokenSourceRef = useRef<CancelTokenSource | null>(null);

  const sendMessage = useCallback(
    async (
      messages: Message[],
      onChunk: (chunk: string) => void
    ): Promise<void> => {
      setIsLoading(true);
      setError(null);

      // Create a new CancelTokenSource for this request
      cancelTokenSourceRef.current = axios.CancelToken.source();

      try {
        const response = await axios.post(
          "/api/chat",
          { messages },
          {
            responseType: "stream",
            cancelToken: cancelTokenSourceRef.current.token,
          }
        );

        const lines = response.data.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(5).trim();
            if (data === "[DONE]") {
              setIsLoading(false);
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                onChunk(parsed.content);
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log("Request canceled:", err.message);
        } else {
          setError(err instanceof Error ? err.message : "An error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const stopGeneration = useCallback(() => {
    if (cancelTokenSourceRef.current) {
      cancelTokenSourceRef.current.cancel("Operation canceled by the user.");
      cancelTokenSourceRef.current = null;
      setIsLoading(false);
    }
  }, []);

  return { sendMessage, isLoading, error, stopGeneration };
}
