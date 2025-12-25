"use client";

import { Listbox } from "@headlessui/react";
import { useDocuments } from "../../lib/hooks/useDocuments";

export interface DocumentVersionsProps {
  chatId: string;
  currentVersion?: number;
  onVersionSelect: (version: number) => void;
}

export function DocumentVersions({
  chatId,
  currentVersion,
  onVersionSelect,
}: DocumentVersionsProps) {
  const { documents } = useDocuments(chatId);

  if (documents.length <= 1) {
    return null;
  }

  return (
    <div className="p-4 border-b border-gray-200">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Document Version
      </label>
      <Listbox value={currentVersion} onChange={onVersionSelect}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-pointer rounded-md bg-white py-2 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <span className="block truncate">
              Version {currentVersion || documents[0]?.version}
            </span>
          </Listbox.Button>
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
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
                Version {doc.version} - {new Date(doc.created_at).toLocaleDateString()}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
}

