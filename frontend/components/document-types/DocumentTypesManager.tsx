"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faFileAlt, faEdit } from "@fortawesome/free-solid-svg-icons";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { useDocumentTypes } from "../../lib/hooks/useDocumentTypes";
import { createDocumentType } from "../../lib/api/documentTypes";
import type { DocumentType } from "../../lib/types/models";

export function DocumentTypesManager() {
  const { documentTypes, isLoading, mutate } = useDocumentTypes();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateSuccess = () => {
    mutate();
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Types</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage document types and their templates
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" />
          Create Document Type
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading document types...</p>
        </div>
      ) : documentTypes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FontAwesomeIcon
            icon={faFileAlt}
            className="w-12 h-12 text-gray-400 mx-auto mb-4"
          />
          <p className="text-gray-500 mb-4">No document types yet</p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" />
            Create Your First Document Type
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documentTypes.map((docType) => (
            <DocumentTypeCard key={docType.id} documentType={docType} />
          ))}
        </div>
      )}

      <CreateDocumentTypeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
        error={error}
        setError={setError}
      />
    </div>
  );
}

function DocumentTypeCard({ documentType }: { documentType: DocumentType }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">
          {documentType.name}
        </h3>
        {documentType.is_active && (
          <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
            Active
          </span>
        )}
      </div>
      {documentType.description && (
        <p className="text-sm text-gray-600 mb-3">{documentType.description}</p>
      )}
      {documentType.example_output && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-500 mb-2">
            Example Output:
          </p>
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded max-h-32 overflow-y-auto">
            <pre className="whitespace-pre-wrap font-mono">
              {documentType.example_output.substring(0, 200)}
              {documentType.example_output.length > 200 ? "..." : ""}
            </pre>
          </div>
        </div>
      )}
      {documentType.template_prompt && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-500 mb-1">
            Has Template Prompt
          </p>
        </div>
      )}
      <div className="mt-4 text-xs text-gray-400">
        Created {new Date(documentType.created_at).toLocaleDateString()}
      </div>
    </div>
  );
}

interface CreateDocumentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  error: string | null;
  setError: (value: string | null) => void;
}

function CreateDocumentTypeModal({
  isOpen,
  onClose,
  onSuccess,
  isSubmitting,
  setIsSubmitting,
  error,
  setError,
}: CreateDocumentTypeModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [templatePrompt, setTemplatePrompt] = useState("");
  const [exampleOutputText, setExampleOutputText] = useState("");
  const [exampleOutputFile, setExampleOutputFile] = useState<File | null>(null);
  const [inputMethod, setInputMethod] = useState<"text" | "file">("text");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await createDocumentType({
        name: name.trim(),
        description: description.trim() || undefined,
        template_prompt: templatePrompt.trim() || undefined,
        example_output_text:
          inputMethod === "text" ? exampleOutputText.trim() || undefined : undefined,
        example_output_file: inputMethod === "file" ? exampleOutputFile || undefined : undefined,
      });
      // Reset form
      setName("");
      setDescription("");
      setTemplatePrompt("");
      setExampleOutputText("");
      setExampleOutputFile(null);
      setInputMethod("text");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create document type");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validExtensions = [".md", ".txt", ".markdown"];
      const fileName = file.name.toLowerCase();
      const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

      if (!isValid) {
        setError("Only markdown/text files (.md, .txt, .markdown) are supported");
        setExampleOutputFile(null);
        return;
      }
      setExampleOutputFile(file);
      setError(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Document Type" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Business Plan, Technical Specification"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this document type is used for"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Template Prompt (Optional)
          </label>
          <textarea
            value={templatePrompt}
            onChange={(e) => setTemplatePrompt(e.target.value)}
            placeholder="Base prompt template for generating this document type"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Example Output (Optional)
          </label>
          <div className="mb-3">
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="inputMethod"
                  value="text"
                  checked={inputMethod === "text"}
                  onChange={() => {
                    setInputMethod("text");
                    setExampleOutputFile(null);
                    setError(null);
                  }}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Paste Markdown</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="inputMethod"
                  value="file"
                  checked={inputMethod === "file"}
                  onChange={() => {
                    setInputMethod("file");
                    setExampleOutputText("");
                    setError(null);
                  }}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Upload File</span>
              </label>
            </div>
          </div>

          {inputMethod === "text" ? (
            <textarea
              value={exampleOutputText}
              onChange={(e) => setExampleOutputText(e.target.value)}
              placeholder="Paste example markdown output here..."
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
            />
          ) : (
            <div>
              <input
                type="file"
                accept=".md,.txt,.markdown"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {exampleOutputFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {exampleOutputFile.name}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Supported formats: .md, .txt, .markdown
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Create Document Type
          </Button>
        </div>
      </form>
    </Modal>
  );
}


