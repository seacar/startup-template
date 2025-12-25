"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getWebSocketUrl, createMessageRequest } from "../api/messages";
import type {
  WebSocketEvent,
  WebSocketFollowUpEvent,
  WebSocketMetricsEvent,
} from "../types/models";

export interface FollowUpQuestion {
  question: string;
  suggested_responses: string[];
  id: string;
}

export interface GenerationMetrics {
  input_tokens: number;
  output_tokens: number;
  latency_ms: number;
}

export function useWebSocket(chatId: string | null) {
  const [content, setContent] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] =
    useState<FollowUpQuestion | null>(null);
  const [metrics, setMetrics] = useState<GenerationMetrics | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!chatId) return;

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
    }

    const wsUrl = getWebSocketUrl(chatId);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketEvent = JSON.parse(event.data);

        switch (data.type) {
          case "token":
            setContent((prev) => prev + data.token);
            break;

          case "follow_up":
            setFollowUpQuestion({
              question: data.question,
              suggested_responses: data.suggested_responses,
              id: data.id,
            });
            break;

          case "metrics":
            setMetrics({
              input_tokens: data.input_tokens,
              output_tokens: data.output_tokens,
              latency_ms: data.latency_ms,
            });
            break;

          case "complete":
            setIsGenerating(false);
            // Don't clear content - keep the generated document
            break;

          case "error":
            console.error("WebSocket error:", data.error);
            setIsGenerating(false);
            break;
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);

      // Attempt to reconnect if we haven't exceeded max attempts
      if (
        reconnectAttemptsRef.current < maxReconnectAttempts &&
        chatId
      ) {
        reconnectAttemptsRef.current += 1;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      }
    };

    wsRef.current = ws;
  }, [chatId]);

  useEffect(() => {
    if (chatId) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [chatId, connect]);

  const sendMessage = useCallback(
    (
      message: string,
      selectedResponseId?: string,
      regenerate: boolean = false
    ) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        console.error("WebSocket is not connected");
        return;
      }

      setIsGenerating(true);
      setContent("");
      setFollowUpQuestion(null);
      setMetrics(null);

      const request = createMessageRequest(
        message,
        selectedResponseId,
        regenerate
      );
      wsRef.current.send(JSON.stringify(request));
    },
    []
  );

  const clearContent = useCallback(() => {
    setContent("");
    setFollowUpQuestion(null);
    setMetrics(null);
  }, []);

  return {
    content,
    isConnected,
    isGenerating,
    followUpQuestion,
    metrics,
    sendMessage,
    clearContent,
  };
}

