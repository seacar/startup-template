"use client";

import { Disclosure } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../ui/Button";
import type { ContextItem as ContextItemType } from "../../lib/types/models";

export interface ContextItemProps {
  item: ContextItemType;
  onDelete: (id: string) => void;
}

export function ContextItem({ item, onDelete }: ContextItemProps) {
  return (
    <Disclosure>
      {({ open }) => (
        <div className="border border-gray-200 rounded-lg">
          <Disclosure.Button className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
              <p className="text-xs text-gray-500 mt-1">
                {item.scope} • {new Date(item.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Are you sure you want to delete this context item?")) {
                    onDelete(item.id);
                  }
                }}
              >
                <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
              </Button>
              <FontAwesomeIcon
                icon={faChevronDown}
                className={`h-4 w-4 text-gray-400 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </div>
          </Disclosure.Button>
          <Disclosure.Panel className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {item.content}
            </p>
            {item.file_url && (
              <a
                href={item.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:text-indigo-700 mt-2 inline-block"
              >
                View file
              </a>
            )}
          </Disclosure.Panel>
        </div>
      )}
    </Disclosure>
  );
}

