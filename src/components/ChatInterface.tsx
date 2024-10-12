"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import logo from "../../public/logo.svg";
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
  Send,
  Menu,
  MoreHorizontal,
  Sun,
  Moon,
  Edit,
  Copy,
  RotateCcw,
  Check,
  X,
  StopCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { WYSIWYGEditor } from "./Editor";
import { CommandInsertion } from "./CommandInsertion";
import { ResponseRenderer } from "./ResponseRenderer";
import { useCommandExecution } from "@/hooks/useCommandExecution";
import { useLLMAPI } from "@/hooks/useLLMAPI";
import { Textarea } from "./ui/textarea";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import Image from "next/image";

interface Message {
  id: number;
  role: "assistant" | "user";
  content: string;
}

export default function ChatInterface() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] =
    useState<boolean>(false);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: "How can I help you today?",
    },
  ]);
  const [inputContent, setInputContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const mobileSidebarRef = useRef<HTMLDivElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { executeCommand } = useCommandExecution();
  const { sendMessage, isLoading, stopGeneration } = useLLMAPI();

  // Toggle functions
  const toggleMobileSidebar = () => setIsMobileSidebarOpen((prev) => !prev);
  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  // Effect for theme toggle
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  // Effect for closing mobile sidebar when clicking outside
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

  // Effect for focusing on edit textarea
  useEffect(() => {
    if (editingMessageId !== null && editTextareaRef.current) {
      editTextareaRef.current.focus();
    }
  }, [editingMessageId]);

  // Effect for scrolling to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  // Function to scroll to bottom
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // Function to handle sending a message
  const handleSendMessage = useCallback(async () => {
    if (inputContent.trim()) {
      // Check for commands
      const commandRegex = /\[include-url:[^\]]+\]/g;
      const commands = inputContent.match(commandRegex);

      let content = inputContent;
      if (commands) {
        for (const command of commands) {
          try {
            const result = await executeCommand(command);
            content = content.replace(command, result);
          } catch (error) {
            console.error("Error executing command:", error);
            toast({
              title: "Error",
              description:
                error instanceof Error
                  ? error.message
                  : "An error occurred while executing the command",
              variant: "destructive",
            });
            return;
          }
        }
      }

      // Add user message
      const newUserMessage: Message = {
        id: Date.now(),
        role: "user",
        content: content,
      };
      setMessages((prev) => [...prev, newUserMessage]);
      setInputContent("");
      setIsGenerating(true);

      try {
        // Send message to API
        await sendMessage(
          messages
            .concat(newUserMessage)
            .map(({ role, content }) => ({ role, content })),
          (chunk) => {
            setMessages((prev) => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage.role === "assistant") {
                return [
                  ...prev.slice(0, -1),
                  { ...lastMessage, content: lastMessage.content + chunk },
                ];
              } else {
                return [
                  ...prev,
                  { id: Date.now(), role: "assistant", content: chunk },
                ];
              }
            });
            scrollToBottom();
          }
        );
      } catch (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Error",
          description:
            "An error occurred while processing your request. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsGenerating(false);
      }
    }
  }, [inputContent, messages, sendMessage, executeCommand]);

  // Function to retry last message
  const retryLastMessage = useCallback(async () => {
    if (messages.length > 1) {
      const lastUserMessage = messages.filter((m) => m.role === "user").pop();
      if (lastUserMessage) {
        setMessages((prev) => prev.slice(0, -1));
        setIsGenerating(true);

        try {
          await sendMessage(
            messages
              .slice(0, -1)
              .concat(lastUserMessage)
              .map(({ role, content }) => ({ role, content })),
            (chunk) => {
              setMessages((prev) => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage.role === "assistant") {
                  return [
                    ...prev.slice(0, -1),
                    { ...lastMessage, content: lastMessage.content + chunk },
                  ];
                } else {
                  return [
                    ...prev,
                    { id: Date.now(), role: "assistant", content: chunk },
                  ];
                }
              });
              scrollToBottom();
            }
          );
        } catch (error) {
          console.error("Error retrying message:", error);
          toast({
            title: "Error",
            description:
              "An error occurred while retrying the message. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsGenerating(false);
        }
      }
    }
  }, [messages, sendMessage]);

  // Function to handle editing a message
  const handleEditMessage = (id: number) => {
    setEditingMessageId(id);
  };

  // Function to handle saving an edited message
  const handleSaveEdit = async (id: number) => {
    if (editTextareaRef.current) {
      const editedContent = editTextareaRef.current.value;
      if (editedContent.trim()) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === id ? { ...msg, content: editedContent } : msg
          )
        );
        setEditingMessageId(null);

        const editedMessageIndex = messages.findIndex((msg) => msg.id === id);
        const relevantMessages = messages.slice(0, editedMessageIndex + 1);
        relevantMessages[relevantMessages.length - 1] = {
          ...relevantMessages[relevantMessages.length - 1],
          content: editedContent,
        };

        setIsGenerating(true);

        try {
          await sendMessage(
            relevantMessages.map(({ role, content }) => ({ role, content })),
            (chunk) => {
              setMessages((prev) => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage.role === "assistant") {
                  return [
                    ...prev.slice(0, -1),
                    { ...lastMessage, content: lastMessage.content + chunk },
                  ];
                } else {
                  return [
                    ...prev,
                    { id: Date.now(), role: "assistant", content: chunk },
                  ];
                }
              });
              scrollToBottom();
            }
          );
        } catch (error) {
          console.error("Error regenerating response:", error);
          toast({
            title: "Error",
            description:
              "An error occurred while regenerating the response. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsGenerating(false);
        }
      }
    }
  };

  // Function to copy message to clipboard
  const copyToClipboard = (id: number, text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedMessageId(id);
        setTimeout(() => setCopiedMessageId(null), 2000);
        toast({
          title: "Copied to clipboard",
          description: "The message has been copied to your clipboard.",
        });
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        toast({
          title: "Error",
          description: "Failed to copy text to clipboard.",
          variant: "destructive",
        });
      });
  };

  // Function to cancel editing
  const handleCancelEdit = () => {
    setEditingMessageId(null);
  };

  // Function to insert a command
  const handleInsertCommand = async (command: string) => {
    setInputContent((prev) => prev + command);
    try {
      const result = await executeCommand(command);
      setInputContent((prev) => prev.replace(command, result));
    } catch (error) {
      console.error("Error executing command:", error);
      toast({
        title: "Error",
        description: "An error occurred while executing the command.",
        variant: "destructive",
      });
    }
  };

  // Function to stop generation
  const handleStopGeneration = () => {
    stopGeneration();
    setIsGenerating(false);
  };

  // Loader component
  const Loader = () => (
    <div className="flex justify-center items-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  // Sidebar component
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
      {/* Desktop Sidebar */}
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

        {/* Header */}
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

            <Link href="/">
              <Image src={logo} height={50} width={50} alt="logo" />
            </Link>
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
          <ScrollArea
            className="h-full p-2 sm:p-4 space-y-4 overflow-y-auto"
            ref={scrollAreaRef}
          >
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
                    className={`w-full sm:w-auto sm:max-w-[80%] md:max-w-2xl p-3 sm:p-4 rounded-xl shadow-md transition-all duration-200 overflow-x-auto ${
                      message.role === "assistant"
                        ? "bg-blue-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    <div className="flex items-center mb-2 text-sm sm:text-base">
                      {message.role === "assistant" ? (
                        <Bot className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                      ) : (
                        <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                      )}
                      <span className="font-semibold">
                        {message.role === "assistant" ? "AI Assistant" : "You"}
                      </span>
                      <div className="flex space-x-2 ml-auto">
                        <AnimatePresence>
                          {copiedMessageId === message.id ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Check className="h-4 w-4 text-green-500" />
                            </motion.div>
                          ) : (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  copyToClipboard(message.id, message.content)
                                }
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        {message.role === "assistant" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={retryLastMessage}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
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
                      <div className="flex flex-col mt-2">
                        <Textarea
                          ref={editTextareaRef}
                          defaultValue={message.content}
                          className="flex-grow mb-2 min-h-[100px]"
                        />
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSaveEdit(message.id)}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <ResponseRenderer
                        content={message.content}
                        isUser={message.role === "user"}
                      />
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isGenerating && <Loader />}
            <div ref={messagesEndRef} />
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-gray-800 p-2 sm:p-4 border-t border-gray-200 dark:border-gray-700 shadow-lg fixed bottom-0 left-0 right-0 z-10">
          <div className="flex items-end space-x-2 max-w-4xl mx-auto">
            <div className="flex-shrink-0 flex items-center space-x-0">
              <CommandInsertion onInsert={handleInsertCommand} />
            </div>
            <div className="flex-grow w-full overflow-auto sm:max-w-2xl">
              <WYSIWYGEditor
                content={inputContent}
                onChange={setInputContent}
                placeholder="Type your message here..."
                minHeight="35px"
              />
            </div>
            <div className="flex-shrink-0 flex items-center space-x-2">
              {isGenerating ? (
                <Button
                  size="icon"
                  className="rounded-full bg-red-500 hover:bg-red-600 text-white shadow-md transition-all duration-200"
                  onClick={handleStopGeneration}
                >
                  <StopCircle className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  className={`rounded-full ${
                    inputContent.trim() || isLoading
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                  } text-white shadow-md transition-all duration-200`}
                  onClick={handleSendMessage}
                  disabled={!inputContent.trim() || isLoading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
