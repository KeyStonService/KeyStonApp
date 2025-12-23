import { Plus, MessageSquare } from "lucide-react";
import Chat from "@/components/Chat";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const {
    messages,
    sessions,
    currentSessionId,
    isLoading,
    sendMessage,
    approvePlan,
    dryRunPlan,
    rollbackPlan,
    createSession,
    selectSession,
  } = useChat();

  return (
    <div className="flex h-full">
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={createSession}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {sessions.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No sessions yet
            </p>
          ) : (
            <ul className="space-y-1">
              {sessions.map((session) => (
                <li key={session.id}>
                  <button
                    onClick={() => selectSession(session.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded-lg transition-colors",
                      currentSessionId === session.id
                        ? "bg-primary-50 text-primary-700"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex-1">
        <Chat
          messages={messages}
          onSendMessage={sendMessage}
          onApprovePlan={approvePlan}
          onDryRunPlan={dryRunPlan}
          onRollbackPlan={rollbackPlan}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
