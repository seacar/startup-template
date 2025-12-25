"use client";

import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faCopy,
  faDownload,
  faFileLines,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "../ui/Button";
import { useDocuments } from "../../lib/hooks/useDocuments";
import { downloadDocument } from "../../lib/api/documents";

export interface DocumentToolbarProps {
  chatId: string | null;
  currentVersion?: number;
  onCopy?: () => void;
  onDownload?: () => void;
  onVersionChange?: (version: number) => void;
}

export function DocumentToolbar({
  chatId,
  currentVersion,
  onCopy,
  onDownload,
  onVersionChange,
}: DocumentToolbarProps) {
  const { documents } = useDocuments(chatId);

  const handleCopy = async () => {
    if (onCopy) {
      onCopy();
    } else {
      // Fallback: copy current document content
      // This would need access to content, so better handled by parent
    }
  };

  const handleDownload = async () => {
    if (onDownload) {
      onDownload();
    } else if (currentVersion && documents.length > 0) {
      // Find document with current version
      const doc = documents.find((d) => d.version === currentVersion);
      if (doc) {
        try {
          const blob = await downloadDocument(doc.id);
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `document-v${doc.version}.md`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } catch (error) {
          console.error("Failed to download document:", error);
        }
      }
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center gap-2">
        <FontAwesomeIcon icon={faFileLines} className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Document</span>
      </div>
      <div className="flex items-center gap-2">
        {documents.length > 1 && (
          <Listbox
            value={currentVersion || documents[0]?.version}
            onChange={(version) => onVersionChange?.(version)}
          >
            <div className="relative">
              <Listbox.Button className="relative w-32 cursor-pointer rounded-md bg-white py-1.5 pl-3 pr-8 text-left text-sm shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <span className="block truncate">
                  Version {currentVersion || documents[0]?.version}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="h-4 w-4 text-gray-400"
                  />
                </span>
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute right-0 z-10 mt-1 max-h-60 w-32 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {documents.map((doc) => (
                    <Listbox.Option
                      key={doc.id}
                      value={doc.version}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 pl-4 pr-4 ${
                          active ? "bg-indigo-100 text-indigo-900" : "text-gray-900"
                        }`
                      }
                    >
                      Version {doc.version}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        )}
        <Button variant="ghost" size="sm" onClick={handleCopy}>
          <FontAwesomeIcon icon={faCopy} className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDownload}>
          <FontAwesomeIcon icon={faDownload} className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

