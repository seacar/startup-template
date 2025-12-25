"use client";

import { useChatMetrics } from "../../lib/hooks/useMetrics";
import { TokenUsage } from "./TokenUsage";
import { Spinner } from "../ui/Spinner";

export interface GenerationMetricsProps {
  chatId: string;
}

export function GenerationMetrics({ chatId }: GenerationMetricsProps) {
  const { metrics, isLoading } = useChatMetrics(chatId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner size="sm" />
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        Generation Metrics
      </h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Generations:</span>
            <span className="ml-2 font-semibold">{metrics.generation_count}</span>
          </div>
          <div>
            <span className="text-gray-600">Average Latency:</span>
            <span className="ml-2 font-semibold">
              {metrics.average_latency_ms}ms
            </span>
          </div>
          <div>
            <span className="text-gray-600">Differential Updates:</span>
            <span className="ml-2 font-semibold">
              {metrics.differential_generations}
            </span>
          </div>
        </div>
        <TokenUsage
          inputTokens={metrics.total_input_tokens}
          outputTokens={metrics.total_output_tokens}
        />
      </div>
    </div>
  );
}

