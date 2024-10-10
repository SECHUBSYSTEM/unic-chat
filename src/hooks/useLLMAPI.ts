import { useState, useCallback } from "react";
import axios from "axios";

interface Message {
  role: string;
  content: string;
}

export function useLLMAPI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (
      messages: Message[],
      onChunk: (chunk: string) => void
    ): Promise<() => void> => {
      setIsLoading(true);
      setError(null);

      const source = axios.CancelToken.source();

      try {
        const response = await axios.post(
          "/api/chat",
          { messages },
          {
            responseType: "stream",
            cancelToken: source.token,
          }
        );

        const reader = response.data.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = JSON.parse(line.slice(6));
              if (data === "[DONE]") {
                setIsLoading(false);
                return () => {};
              }
              onChunk(data.content);
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

      return () => {
        source.cancel("Operation canceled by the user.");
      };
    },
    []
  );

  return { sendMessage, isLoading, error };
}
