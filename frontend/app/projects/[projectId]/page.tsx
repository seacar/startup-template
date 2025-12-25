"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProject } from "../../../lib/hooks/useProjects";
import { useChats, useChatActions } from "../../../lib/hooks/useChats";
import { useDocumentTypes } from "../../../lib/hooks/useDocumentTypes";
import { ContextManager } from "../../../components/context/ContextManager";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Listbox } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useProjectStore } from "../../../stores/useProjectStore";
import { Spinner } from "../../../components/ui/Spinner";
import Link from "next/link";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { project, isLoading } = useProject(projectId);
  const { chats } = useChats(projectId);
  const { documentTypes } = useDocumentTypes();
  const { createChat } = useChatActions(projectId);
  const setSelectedProject = useProjectStore((state) => state.setSelectedProject);
  const [isCreateChatModalOpen, setIsCreateChatModalOpen] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (projectId) {
      setSelectedProject(projectId);
    }
  }, [projectId, setSelectedProject]);

  const handleCreateChat = async () => {
    if (!selectedDocumentType) return;

    setIsCreating(true);
    try {
      const chat = await createChat({ document_type: selectedDocumentType });
      setIsCreateChatModalOpen(false);
      setSelectedDocumentType("");
      router.push(`/projects/${projectId}/chats/${chat.id}`);
    } catch (error) {
      console.error("Failed to create chat:", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Project not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
        {project.description && (
          <p className="text-gray-600">{project.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Chats</h2>
              <Button onClick={() => setIsCreateChatModalOpen(true)}>
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                New Chat
              </Button>
            </div>
            {chats.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No chats yet. Create your first chat!
              </p>
            ) : (
              <div className="space-y-2">
                {chats.map((chat) => (
                  <Link
                    key={chat.id}
                    href={`/projects/${projectId}/chats/${chat.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900">{chat.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {chat.document_type} • {chat.message_count} messages
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <ContextManager projectId={projectId} />
        </div>
      </div>

      <Modal
        isOpen={isCreateChatModalOpen}
        onClose={() => setIsCreateChatModalOpen(false)}
        title="Create New Chat"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Type
            </label>
            <Listbox value={selectedDocumentType} onChange={setSelectedDocumentType}>
              <div className="relative">
                <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <span className="block truncate">
                    {selectedDocumentType || "Select document type"}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className="h-4 w-4 text-gray-400"
                    />
                  </span>
                </Listbox.Button>
                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {documentTypes.map((type) => (
                    <Listbox.Option
                      key={type.id}
                      value={type.name}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 pl-4 pr-4 ${
                          active ? "bg-indigo-100 text-indigo-900" : "text-gray-900"
                        }`
                      }
                    >
                      {type.name}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsCreateChatModalOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateChat} isLoading={isCreating}>
              Create Chat
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

