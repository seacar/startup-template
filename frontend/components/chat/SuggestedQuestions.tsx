"use client";

export interface SuggestedQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
}

export function SuggestedQuestions({
  questions,
  onSelect,
}: SuggestedQuestionsProps) {
  if (questions.length === 0) {
    return null;
  }

  return (
    <div className="p-4 bg-gray-50 border-t border-gray-200">
      <p className="text-sm font-medium text-gray-700 mb-3">
        Suggested Questions:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onSelect(question)}
            className="text-left px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-sm"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}

