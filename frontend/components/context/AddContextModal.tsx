"use client";

import { useState } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { useContextActions } from "../../lib/hooks/useContext";
import type { ContextScope } from "../../lib/types/models";

export interface AddContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  scope: ContextScope;
  projectId?: string;
  chatId?: string;
  onSuccess?: () => void;
}

export function AddContextModal({
  isOpen,
  onClose,
  scope,
  projectId,
  chatId,
  onSuccess,
}: AddContextModalProps) {
  const { createContextItem } = useContextActions();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!content.trim() && !file) {
      setError("Either content or a file is required");
      return;
    }

    setIsLoading(true);
    try {
      await createContextItem({
        scope,
        project_id: projectId,
        chat_id: chatId,
        title: title.trim(),
        content: content.trim() || undefined,
        file: file || undefined,
      });
      onClose();
      setTitle("");
      setContent("");
      setFile(null);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create context item");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Context Item" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter context title"
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter context content (optional if file provided)"
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Or upload a file
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Add Context
          </Button>
        </div>
      </form>
    </Modal>
  );
}

