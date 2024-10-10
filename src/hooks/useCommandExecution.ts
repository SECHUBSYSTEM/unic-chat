import { useState, useCallback } from "react";
import axios from "axios";

interface CommandOptions {
  url: string;
  maxExecutionTime: number;
  filter: boolean;
  store: boolean;
}

export const useCommandExecution = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeCommand = useCallback(
    async (command: string): Promise<string> => {
      setIsExecuting(true);
      setError(null);

      const regex =
        /\[include-url:\s*([^\]]+)\s*max_execution_time:(\d+)\s*filter:(true|false)\s*store:(true|false)\]/;
      const match = command.match(regex);

      if (!match) {
        setIsExecuting(false);
        setError("Invalid command format");
        return command;
      }

      const [, url, maxExecutionTime, filter, store] = match;
      const options: CommandOptions = {
        url,
        maxExecutionTime: parseInt(maxExecutionTime),
        filter: filter === "true",
        store: store === "true",
      };

      try {
        const response = await axios.post("/api/scrape", options);
        setIsExecuting(false);
        return response.data.content;
      } catch (err) {
        setIsExecuting(false);
        setError(err instanceof Error ? err.message : "An error occurred");
        return command;
      }
    },
    []
  );

  return { executeCommand, isExecuting, error };
};
