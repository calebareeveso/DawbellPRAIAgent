"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { TextShimmer } from "../loader/text-shimmer";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ChatInterface({
  reportText,
  setReportText,
}: {
  reportText: string;
  setReportText: (text: string) => void;
}) {
  const [mode, setMode] = useState<any>("chat");
  const [messages, setMessages] = useState<any>([]);
  const [input, setInput] = useState<any>("");
  const [isLoading, setIsLoading] = useState<any>(false);
  const [appliedMessageIds, setAppliedMessageIds] = useState<Set<number>>(
    new Set()
  );
  const messagesEndRef = useRef<any>(null);
  const textareaRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      let response: any;
      if (mode === "chat") {
        response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: newMessages,
            context: reportText,
          }),
        });
      } else if (mode === "edit") {
        response = await fetch("/api/chat-edit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: newMessages,
            context: reportText,
          }),
        });
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = "";

      // Add AI message placeholder
      const aiMessage = { role: "assistant", content: "" };
      setMessages([...newMessages, aiMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        aiResponse += chunk;

        // Update the AI message content
        setMessages([
          ...newMessages,
          { role: "assistant", content: aiResponse },
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, there was an error processing your request.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Function to parse and render message content with XML tags
  const renderMessageContent = (content: string) => {
    const targetRegex = /<TARGET>([\s\S]*?)<\/TARGET>/g;
    const replaceRegex = /<REPLACE>([\s\S]*?)<\/REPLACE>/g;

    let parts = [];
    let lastIndex = 0;

    // Split content by XML tags and process each part
    const allMatches = [];
    let match;

    // Find all TARGET matches
    while ((match = targetRegex.exec(content)) !== null) {
      allMatches.push({
        type: "target",
        start: match.index,
        end: match.index + match[0].length,
        content: match[1],
        fullMatch: match[0],
      });
    }

    // Reset regex
    replaceRegex.lastIndex = 0;

    // Find all REPLACE matches
    while ((match = replaceRegex.exec(content)) !== null) {
      allMatches.push({
        type: "replace",
        start: match.index,
        end: match.index + match[0].length,
        content: match[1],
        fullMatch: match[0],
      });
    }

    // Sort matches by position
    allMatches.sort((a, b) => a.start - b.start);

    // Build the rendered content
    allMatches.forEach((match, index) => {
      // Add text before this match
      if (match.start > lastIndex) {
        const textBefore = content.slice(lastIndex, match.start);
        // Only add non-empty text that isn't just whitespace
        if (textBefore.trim()) {
          parts.push(<span key={`text-${index}-before`}>{textBefore}</span>);
        }
      }

      // Add the styled match
      if (match.type === "target") {
        parts.push(
          <div
            key={`target-${index}`}
            className="bg-red-100 border border-red-200 rounded px-2 py-1 my-1 block w-full"
          >
            {match.content}
          </div>
        );
      } else if (match.type === "replace") {
        parts.push(
          <div
            key={`replace-${index}`}
            className="bg-green-100 border border-green-200 rounded px-2 py-1 my-1 block w-full"
          >
            {match.content}
          </div>
        );
      }

      lastIndex = match.end;
    });

    // Add remaining text
    if (lastIndex < content.length) {
      const remainingText = content.slice(lastIndex);
      // Only add non-empty text that isn't just whitespace
      if (remainingText.trim()) {
        parts.push(<span key="text-end">{remainingText}</span>);
      }
    }

    return parts.length > 0 ? parts : content;
  };

  // Function to check if a specific message contains TARGET and REPLACE tags
  const messageHasApplicableChanges = (message: any, index: number) => {
    return (
      message.role === "assistant" &&
      message.content.includes("<TARGET>") &&
      message.content.includes("<REPLACE>")
    );
  };

  // Function to apply changes for a specific message
  const applyChanges = (messageIndex: number) => {
    const message = messages[messageIndex];
    let updatedReportText = reportText;

    const targetMatch = message.content.match(/<TARGET>([\s\S]*?)<\/TARGET>/);
    const replaceMatch = message.content.match(
      /<REPLACE>([\s\S]*?)<\/REPLACE>/
    );

    if (targetMatch && replaceMatch) {
      const targetText = targetMatch[1];
      const replaceText = replaceMatch[1];

      // Replace the target text with replace text in reportText
      updatedReportText = updatedReportText.replace(targetText, replaceText);
      setReportText(updatedReportText);

      // Mark this message as applied
      setAppliedMessageIds((prev) => new Set([...prev, messageIndex]));
    }
  };

  return (
    <div className="bg-[#FAF9F8] border-l border-t border-[#E9E4E2] h-[92vh] flex flex-col w-full">
      {/* Header */}
      {/* <div className="border-b px-6 py-[10.5px] bg-[#FAF9F8]">
        <h1 className="text-xl font-semibold text-gray-900">
          Report Assistant
        </h1>
        <p className="text-sm text-gray-600">
          Ask questions about the formal Report report
        </p>
      </div> */}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            {mode === "chat" ? (
              <p>Ask me anything about the PR report</p>
            ) : (
              <p>Ask me to edit the PR report</p>
            )}
          </div>
        )}

        {messages.map((message: any, index: any) => (
          <div key={index}>
            <div
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 shadow-sm border border-[#E9E4E2] ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-900"
                }`}
              >
                <div className="whitespace-pre-wrap">
                  {renderMessageContent(message.content)}
                </div>
              </div>
            </div>

            {/* Apply Changes Button for this specific message */}
            {messageHasApplicableChanges(message, index) && (
              <div
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } mt-2`}
              >
                <Button
                  onClick={() => applyChanges(index)}
                  disabled={appliedMessageIds.has(index)}
                  className={`text-white text-sm px-3 py-1 ${
                    appliedMessageIds.has(index)
                      ? "bg-gray-400 opacity-50 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {appliedMessageIds.has(index)
                    ? "Applied Changes!"
                    : "Apply Changes"}
                </Button>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-900 rounded-lg px-4 py-2 border border-[#E9E4E2]">
              <div className="flex items-center space-x-2">
                <TextShimmer
                  duration={1.6}
                  className="text-base font-normal pt-0 font-display [--base-color:#11111133] [--base-gradient-color:#11111199] "
                >
                  Thinking...
                </TextShimmer>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#E9E4E2] p-6 bg-[#FAF9F8]">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-1 bg-white border border-[#E9E4E2] rounded-md"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about the Report report..."
            className="flex-1 min-h-[60px] max-h-[300px] resize-none px-3 py-2.5 outline-0"
            disabled={isLoading}
          />
          <div className="flex justify-between">
            <div className="p-2">
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger className="w-[80px]">
                  <SelectValue defaultValue="chat" placeholder="Select Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chat">Chat</SelectItem>
                  <SelectItem value="edit">Edit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="self-end text-black bg-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
