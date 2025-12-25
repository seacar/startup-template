"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

export interface DocumentArtifactProps {
  content: string;
  isGenerating: boolean;
  version?: number;
  onCopy?: () => void;
  onDownload?: () => void;
  onVersionChange?: (version: number) => void;
}

export function DocumentArtifact({
  content,
  isGenerating,
  version,
  onCopy,
  onDownload,
  onVersionChange,
}: DocumentArtifactProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when content changes
  useEffect(() => {
    if (contentRef.current && isGenerating) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [content, isGenerating]);

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      <div className="flex-1 overflow-y-auto p-6" ref={contentRef}>
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {content}
          </ReactMarkdown>
          {isGenerating && (
            <span className="inline-block w-2 h-4 bg-indigo-600 animate-pulse ml-1">
              |
            </span>
          )}
        </div>
        {content === "" && !isGenerating && (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Document will appear here...</p>
          </div>
        )}
      </div>
      {version && (
        <div className="border-t border-gray-200 px-4 py-2 text-xs text-gray-500">
          Version {version}
        </div>
      )}
    </div>
  );
}

