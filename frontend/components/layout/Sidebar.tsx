"use client";

import { Disclosure } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faFolder,
  faMessage,
  faPlus,
  faFileLines,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useProjects } from "../../lib/hooks/useProjects";
import { useChats } from "../../lib/hooks/useChats";
import { useProjectStore } from "../../stores/useProjectStore";
import { useUIStore } from "../../stores/useUIStore";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { useRouter } from "next/navigation";

export function Sidebar() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);
  const setSelectedProject = useProjectStore((state) => state.setSelectedProject);
  const { projects, isLoading: projectsLoading } = useProjects();
  const { chats, isLoading: chatsLoading } = useChats(selectedProjectId);
  const router = useRouter();

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto z-30 transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 lg:z-20`
    }>
      <div className="p-4">
        <div className="mb-4 space-y-2">
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            onClick={() => router.push("/")}
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            New Project
          </Button>
          <Link
            href="/document-types"
            className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FontAwesomeIcon icon={faFileLines} className="h-4 w-4" />
            Document Types
          </Link>
        </div>

        <Disclosure as="div" defaultOpen>
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-900 hover:bg-gray-100">
                <span className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faFolder} className="h-4 w-4" />
                  Projects
                </span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`h-4 w-4 transition-transform ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="mt-2 space-y-1">
                {projectsLoading ? (
                  <div className="flex justify-center py-4">
                    <Spinner size="sm" />
                  </div>
                ) : projects.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-gray-500">
                    No projects yet
                  </p>
                ) : (
                  projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      onClick={() => setSelectedProject(project.id)}
                      className={`block rounded-lg px-3 py-2 text-sm ${
                        selectedProjectId === project.id
                          ? "bg-indigo-50 text-indigo-900 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {project.name}
                    </Link>
                  ))
                )}
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {selectedProjectId && (
          <Disclosure as="div" defaultOpen className="mt-4">
            {({ open }) => (
              <>
                <Disclosure.Button className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-900 hover:bg-gray-100">
                  <span className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faMessage} className="h-4 w-4" />
                    Chats
                  </span>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`h-4 w-4 transition-transform ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </Disclosure.Button>
                <Disclosure.Panel className="mt-2 space-y-1">
                  {chatsLoading ? (
                    <div className="flex justify-center py-4">
                      <Spinner size="sm" />
                    </div>
                  ) : chats.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-gray-500">
                      No chats yet
                    </p>
                  ) : (
                    chats.map((chat) => (
                      <Link
                        key={chat.id}
                        href={`/projects/${selectedProjectId}/chats/${chat.id}`}
                        className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {chat.title}
                      </Link>
                    ))
                  )}
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
        )}
      </div>
    </aside>
  );
}

