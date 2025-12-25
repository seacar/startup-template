"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useChat } from "../../../../../lib/hooks/useChats";
import { useWebSocket } from "../../../../../lib/hooks/useWebSocket";
import { ChatInterface } from "../../../../../components/chat/ChatInterface";
import { DocumentViewer } from "../../../../../components/document/DocumentViewer";
import { DocumentToolbar } from "../../../../../components/document/DocumentToolbar";
import { TokenUsage } from "../../../../../components/metrics/TokenUsage";
import { useChatStore } from "../../../../../stores/useChatStore";
import { Spinner } from "../../../../../components/ui/Spinner";
import { downloadDocument } from "../../../../../lib/api/documents";

export default function ChatPage() {
  const params = useParams();
  const chatId = params.chatId as string;
  const projectId = params.projectId as string;
  const { chat, isLoading } = useChat(chatId);
  const {
    content,
    isConnected,
    isGenerating,
    followUpQuestion,
    metrics,
    sendMessage,
  } = useWebSocket(chatId);
  const { setSelectedChat, currentVersion, setCurrentVersion } = useChatStore();

  useEffect(() => {
    if (chatId) {
      setSelectedChat(chatId);
    }
  }, [chatId, setSelectedChat]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleDownload = async () => {
    if (!chat?.current_document) return;
    try {
      const blob = await downloadDocument(chat.current_document.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `document-v${chat.current_document.version}.md`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Chat not found</p>
      </div>
    );
  }

  const documentVersion = chat.current_document?.version || currentVersion || 1;
  const documentContent = content || chat.current_document?.content || "";

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col -m-6">
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{chat.title}</h2>
          {metrics && (
            <TokenUsage
              inputTokens={metrics.input_tokens}
              outputTokens={metrics.output_tokens}
            />
          )}
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 border-r border-gray-200 flex flex-col overflow-hidden">
          <ChatInterface
            messages={chat.messages || []}
            suggestedQuestions={[]}
            followUpQuestion={followUpQuestion}
            onSendMessage={sendMessage}
            isGenerating={isGenerating}
            isConnected={isConnected}
          />
        </div>
        <div className="w-1/2 flex flex-col overflow-hidden">
          <DocumentToolbar
            chatId={chatId}
            currentVersion={documentVersion}
            onCopy={handleCopy}
            onDownload={handleDownload}
            onVersionChange={setCurrentVersion}
          />
          <DocumentViewer
            content={documentContent}
            isGenerating={isGenerating}
            version={documentVersion}
            onCopy={handleCopy}
            onDownload={handleDownload}
          />
        </div>
      </div>
    </div>
  );
}

