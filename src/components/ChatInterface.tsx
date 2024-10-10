"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageSquare,
  Library,
  FileText,
  Users,
  Bot,
  Share2,
  Trash2,
  Plus,
  ChevronDown,
  Mic,
  Send,
  Menu,
  MoreHorizontal,
  Sun,
  Moon,
  Pause,
  Edit,
  Check,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { WYSIWYGEditor } from "./Editor";
import { CommandInsertion } from "./CommandInsertion";
import { ResponseRenderer } from "./ResponseRenderer";
import { useCommandExecution } from "@/hooks/useCommandExecution";
import { useLLMAPI } from "@/hooks/useLLMAPI";
import { Input } from "./ui/input";

interface Message {
  id: number;
  role: "assistant" | "user";
  content: string;
}

export default function ChatInterface() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] =
    useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: "How can I help you today?",
    },
  ]);
  const [inputContent, setInputContent] = useState("");

  const mobileSidebarRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const {
    executeCommand,
    isExecuting,
    error: commandError,
  } = useCommandExecution();
  const { sendMessage, isLoading, error: llmError } = useLLMAPI();

  const toggleMobileSidebar = () => setIsMobileSidebarOpen((prev) => !prev);
  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileSidebarRef.current &&
        !mobileSidebarRef.current.contains(event.target as Node)
      ) {
        setIsMobileSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (editingMessageId !== null && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingMessageId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = useCallback(async () => {
    if (inputContent.trim()) {
      const newMessage: Message = {
        id: Date.now(),
        role: "user",
        content: inputContent,
      };
      setMessages((prev) => [...prev, newMessage]);
      setInputContent("");
      setIsGenerating(true);

      try {
        const cancel = await sendMessage(
          messages
            .concat(newMessage)
            .map(({ role, content }) => ({ role, content })),
          (chunk) => {
            setMessages((prev) => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage.role === "assistant") {
                return prev.map((msg) =>
                  msg.id === lastMessage.id
                    ? { ...msg, content: msg.content + chunk }
                    : msg
                );
              } else {
                return [
                  ...prev,
                  { id: Date.now(), role: "assistant", content: chunk },
                ];
              }
            });
          }
        );

        return cancel;
      } catch (error) {
        console.error("Error sending message:", error);
      } finally {
        setIsGenerating(false);
      }
    }
  }, [inputContent, messages, sendMessage]);

  const handleEditMessage = (id: number) => {
    setEditingMessageId(id);
  };

  const handleSaveEdit = (id: number) => {
    if (editInputRef.current) {
      const editedContent = editInputRef.current.value;
      if (editedContent.trim()) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === id ? { ...msg, content: editedContent } : msg
          )
        );
        handleSendMessage();
      }
      setEditingMessageId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
  };

  const handleInsertCommand = async (command: string) => {
    setInputContent((prev) => prev + command);
    try {
      const result = await executeCommand(command);
      setInputContent((prev) => prev.replace(command, result));
    } catch (error) {
      console.error("Error executing command:", error);
    }
  };

  const Sidebar: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => (
    <div
      className={`${
        isMobile ? "p-4" : "p-4 border-r border-gray-200 dark:border-gray-700"
      } bg-white dark:bg-gray-800 h-full flex flex-col`}
    >
      <Button className="mb-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-md transition-all duration-200">
        <Plus className="mr-2 h-4 w-4" /> New Chat
      </Button>
      <nav className="space-y-2">
        {["Recents", "Library", "App Files", "Shared", "Recently Deleted"].map(
          (item, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              onClick={() => isMobile && setIsMobileSidebarOpen(false)}
            >
              {item === "Recents" && <MessageSquare className="mr-2 h-4 w-4" />}
              {item === "Library" && <Library className="mr-2 h-4 w-4" />}
              {item === "App Files" && <FileText className="mr-2 h-4 w-4" />}
              {item === "Shared" && <Share2 className="mr-2 h-4 w-4" />}
              {item === "Recently Deleted" && (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              {item}
            </Button>
          )
        )}
      </nav>
    </div>
  );

  return (
    <div
      className={`flex h-screen overflow-hidden ${isDarkMode ? "dark" : ""}`}
    >
      <div className="hidden md:block w-72">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-grow bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200 ease-in-out">
        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isMobileSidebarOpen && (
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              ref={mobileSidebarRef}
              className="fixed inset-y-0 left-0 z-50 w-72 md:hidden"
            >
              <Sidebar isMobile={true} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Header */}
        <header className="bg-white dark:bg-gray-800 p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 shadow-sm fixed top-0 left-0 right-0 z-10">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMobileSidebar}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-bold">Chat UI</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full transition-colors duration-200"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full hidden md:flex"
                >
                  ChatGPT 4.0 <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>GPT-3.5</DropdownMenuItem>
                <DropdownMenuItem>GPT-4</DropdownMenuItem>
                <DropdownMenuItem>Custom Model</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden pt-16 pb-24">
          <ScrollArea className="h-full p-4 space-y-4" ref={scrollAreaRef}>
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${
                    message.role === "assistant"
                      ? "justify-start"
                      : "justify-end"
                  } mb-4`}
                >
                  <div
                    className={`w-3/4 p-4 rounded-xl shadow-md transition-all duration-200 ${
                      message.role === "assistant"
                        ? "bg-blue-50 dark:bg-gray-800"
                        : "bg-white dark:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      {message.role === "assistant" ? (
                        <Bot className="mr-2 h-5 w-5 text-blue-500" />
                      ) : (
                        <Users className="mr-2 h-5 w-5 text-green-500" />
                      )}
                      <span className="font-semibold text-sm sm:text-base">
                        {message.role === "assistant" ? "AI Assistant" : "You"}
                      </span>
                      {message.role === "user" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="ml-auto"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={() => handleEditMessage(message.id)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    {editingMessageId === message.id ? (
                      <div className="flex items-center mt-2">
                        <Input
                          ref={editInputRef}
                          defaultValue={message.content}
                          className="flex-grow mr-2"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSaveEdit(message.id)}
                        >
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ) : (
                      <ResponseRenderer content={message.content} />
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </ScrollArea>
        </div>

        {/* Floating Input Area */}
        <div className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 shadow-lg fixed bottom-0 left-0 right-0 z-10">
          <div className="flex items-end space-x-2 max-w-4xl mx-auto">
            <div className="flex-grow">
              <WYSIWYGEditor
                value={inputContent}
                onChange={setInputContent}
                placeholder="Type your message here..."
                minHeight="35px"
              />
            </div>
            <div className="flex-shrink-0 flex items-center space-x-2">
              <CommandInsertion onInsert={handleInsertCommand} />
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                className={`rounded-full ${
                  inputContent.trim() || isGenerating
                    ? "bg-blue-500  hover:bg-blue-600"
                    : "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                } text-white shadow-md transition-all duration-200`}
                onClick={handleSendMessage}
                disabled={!inputContent.trim() && !isGenerating}
              >
                {isGenerating ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
