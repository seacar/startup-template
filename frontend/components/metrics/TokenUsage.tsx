"use client";

export interface TokenUsageProps {
  inputTokens: number;
  outputTokens: number;
  maxInputTokens?: number;
  maxOutputTokens?: number;
}

export function TokenUsage({
  inputTokens,
  outputTokens,
  maxInputTokens = 1000000,
  maxOutputTokens = 68000,
}: TokenUsageProps) {
  const inputPercentage = (inputTokens / maxInputTokens) * 100;
  const outputPercentage = (outputTokens / maxOutputTokens) * 100;
  const totalTokens = inputTokens + outputTokens;

  return (
    <div className="flex gap-4 text-sm text-gray-600 items-center">
      <div className="flex items-center gap-2">
        <span>Input:</span>
        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${Math.min(inputPercentage, 100)}%` }}
          />
        </div>
        <span className="font-mono">{inputTokens.toLocaleString()}</span>
      </div>

      <div className="flex items-center gap-2">
        <span>Output:</span>
        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${Math.min(outputPercentage, 100)}%` }}
          />
        </div>
        <span className="font-mono">{outputTokens.toLocaleString()}</span>
      </div>

      <div>
        <span className="font-semibold">Total: {totalTokens.toLocaleString()}</span>
      </div>
    </div>
  );
}

