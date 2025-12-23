import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import PlanCard from "./PlanCard";
import type { ChatMessage } from "@shared/types";

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  onApprovePlan?: (planId: string) => void;
  onDryRunPlan?: (planId: string) => void;
  onRollbackPlan?: (planId: string) => void;
  isLoading?: boolean;
}

export default function Chat({
  messages,
  onSendMessage,
  onApprovePlan,
  onDryRunPlan,
  onRollbackPlan,
  isLoading,
}: ChatProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="w-16 h-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-medium text-gray-700">
              ChatOps Assistant
            </h2>
            <p className="text-gray-500 mt-2 max-w-md">
              I can help you manage your infrastructure across multiple
              platforms. Ask me to deploy, scale, or monitor your services.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role !== "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-600" />
                </div>
              )}

              <div
                className={cn(
                  "max-w-[80%] space-y-2",
                  message.role === "user" && "order-1"
                )}
              >
                {message.content && (
                  <div
                    className={cn(
                      "px-4 py-2 rounded-lg",
                      message.role === "user"
                        ? "bg-primary-600 text-white"
                        : "bg-white border border-gray-200 text-gray-900"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                )}

                {message.planCard && (
                  <PlanCard
                    plan={message.planCard}
                    onApprove={onApprovePlan}
                    onDryRun={onDryRunPlan}
                    onRollback={onRollbackPlan}
                  />
                )}
              </div>

              {message.role === "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-600" />
            </div>
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-4 bg-white border-t border-gray-200"
      >
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={cn(
              "p-2 rounded-lg transition-colors",
              input.trim() && !isLoading
                ? "bg-primary-600 text-white hover:bg-primary-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
