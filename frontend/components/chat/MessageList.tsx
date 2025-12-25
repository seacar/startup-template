"use client";

import type { Message } from "../../lib/types/models";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faRobot } from "@fortawesome/free-solid-svg-icons";

export interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>No messages yet. Start a conversation!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-3 ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          {message.role === "assistant" && (
            <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
              <FontAwesomeIcon
                icon={faRobot}
                className="h-4 w-4 text-indigo-600"
              />
            </div>
          )}
          <div
            className={`max-w-[80%] rounded-lg px-4 py-2 ${
              message.role === "user"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-900"
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            {message.metadata && (
              <div className="mt-2 text-xs opacity-75">
                {message.metadata.input_tokens && (
                  <span>Input: {message.metadata.input_tokens} tokens</span>
                )}
                {message.metadata.output_tokens && (
                  <span className="ml-2">
                    Output: {message.metadata.output_tokens} tokens
                  </span>
                )}
              </div>
            )}
          </div>
          {message.role === "user" && (
            <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-gray-600" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

