import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface CommandInsertionProps {
  onInsert: (command: string) => void;
}

export const CommandInsertion: React.FC<CommandInsertionProps> = ({
  onInsert,
}) => {
  const [url, setUrl] = useState("");
  const [maxExecutionTime, setMaxExecutionTime] = useState(300);
  const [filter, setFilter] = useState(false);
  const [store, setStore] = useState(false);
  const [isAdvanced, setIsAdvanced] = useState(false);

  const handleInsert = () => {
    const command = `[include-url: ${url} max_execution_time:${maxExecutionTime} filter:${filter} store:${store}]`;
    onInsert(command);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Insert Command</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Insert URL Command</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="url" className="text-right">
              URL
            </Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="advanced-mode"
              checked={isAdvanced}
              onCheckedChange={setIsAdvanced}
            />
            <Label htmlFor="advanced-mode">Advanced Mode</Label>
          </div>
          {isAdvanced && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="max-execution-time" className="text-right">
                  Max Execution Time
                </Label>
                <Input
                  id="max-execution-time"
                  type="number"
                  value={maxExecutionTime}
                  onChange={(e) => setMaxExecutionTime(Number(e.target.value))}
                  className="col-span-3"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="filter"
                  checked={filter}
                  onCheckedChange={setFilter}
                />
                <Label htmlFor="filter">Filter</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="store" checked={store} onCheckedChange={setStore} />
                <Label htmlFor="store">Store</Label>
              </div>
            </>
          )}
        </div>
        <Button onClick={handleInsert}>Insert</Button>
      </DialogContent>
    </Dialog>
  );
};
