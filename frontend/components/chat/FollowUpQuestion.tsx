"use client";

import { Button } from "../ui/Button";

export interface FollowUpQuestionProps {
  question: string;
  suggestedResponses: string[];
  onSelect: (response: string) => void;
}

export function FollowUpQuestion({
  question,
  suggestedResponses,
  onSelect,
}: FollowUpQuestionProps) {
  return (
    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg mb-4">
      <p className="text-sm font-medium text-indigo-900 mb-3">{question}</p>
      <div className="flex flex-wrap gap-2">
        {suggestedResponses.map((response, index) => (
          <Button
            key={index}
            variant="secondary"
            size="sm"
            onClick={() => onSelect(response)}
          >
            {response}
          </Button>
        ))}
      </div>
    </div>
  );
}

