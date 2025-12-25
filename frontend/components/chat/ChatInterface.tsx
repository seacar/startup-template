"use client";

import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { FollowUpQuestion } from "./FollowUpQuestion";
import type { Message } from "../../lib/types/models";
import type { FollowUpQuestion as FollowUpQuestionType } from "../../lib/hooks/useWebSocket";

export interface ChatInterfaceProps {
  messages: Message[];
  suggestedQuestions?: string[];
  followUpQuestion?: FollowUpQuestionType | null;
  onSendMessage: (message: string) => void;
  isGenerating?: boolean;
  isConnected?: boolean;
}

export function ChatInterface({
  messages,
  suggestedQuestions = [],
  followUpQuestion,
  onSendMessage,
  isGenerating = false,
  isConnected = true,
}: ChatInterfaceProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {!isConnected && (
          <div className="bg-yellow-100 text-yellow-800 p-2 text-sm rounded-lg mb-4">
            Connecting to server...
          </div>
        )}
        <MessageList messages={messages} />
        {followUpQuestion && (
          <FollowUpQuestion
            question={followUpQuestion.question}
            suggestedResponses={followUpQuestion.suggested_responses}
            onSelect={(response) => onSendMessage(response)}
          />
        )}
      </div>
      {suggestedQuestions.length > 0 && (
        <SuggestedQuestions
          questions={suggestedQuestions}
          onSelect={onSendMessage}
        />
      )}
      <MessageInput
        onSend={onSendMessage}
        disabled={isGenerating || !isConnected}
      />
    </div>
  );
}

