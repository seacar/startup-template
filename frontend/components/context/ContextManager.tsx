"use client";

import { Tab } from "@headlessui/react";
import { ContextList } from "./ContextList";
import { AddContextModal } from "./AddContextModal";
import { Button } from "../ui/Button";
import { useContextItems, useContextActions } from "../../lib/hooks/useContext";
import { useState } from "react";
import type { ContextScope } from "../../lib/types/models";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

export interface ContextManagerProps {
  projectId?: string;
  chatId?: string;
}

export function ContextManager({ projectId, chatId }: ContextManagerProps) {
  const [activeTab, setActiveTab] = useState<ContextScope>("user");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { contextItems: userItems, isLoading: userLoading, mutate: mutateUser } =
    useContextItems({ scope: "user" });
  const { contextItems: projectItems, isLoading: projectLoading, mutate: mutateProject } =
    useContextItems({ scope: "project", project_id: projectId });
  const { contextItems: chatItems, isLoading: chatLoading, mutate: mutateChat } =
    useContextItems({ scope: "chat", chat_id: chatId });
  const { deleteContextItem } = useContextActions();

  const tabs: { scope: ContextScope; label: string; items: typeof userItems; isLoading: boolean }[] = [
    { scope: "user", label: "User Context", items: userItems, isLoading: userLoading },
    { scope: "project", label: "Project Context", items: projectItems, isLoading: projectLoading },
    { scope: "chat", label: "Chat Context", items: chatItems, isLoading: chatLoading },
  ];

  const handleDelete = async (id: string) => {
    await deleteContextItem(id);
    mutateUser();
    mutateProject();
    mutateChat();
  };

  const handleAddSuccess = () => {
    mutateUser();
    mutateProject();
    mutateChat();
  };

  const currentTab = tabs.find((t) => t.scope === activeTab) || tabs[0];

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="border-b border-gray-200">
        <Tab.Group selectedIndex={tabs.findIndex((t) => t.scope === activeTab)} onChange={(index) => setActiveTab(tabs[index].scope)}>
          <Tab.List className="flex">
            {tabs.map((tab) => (
              <Tab
                key={tab.scope}
                className={({ selected }) =>
                  `px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    selected
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`
                }
              >
                {tab.label}
              </Tab>
            ))}
          </Tab.List>
        </Tab.Group>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {currentTab.label}
          </h3>
          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            disabled={activeTab === "project" && !projectId || activeTab === "chat" && !chatId}
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Add Context
          </Button>
        </div>
        <ContextList
          items={currentTab.items}
          isLoading={currentTab.isLoading}
          onDelete={handleDelete}
        />
      </div>
      <AddContextModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        scope={activeTab}
        projectId={projectId}
        chatId={chatId}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
}

