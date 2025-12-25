"use client";

import { useState } from "react";
import { ProjectList } from "../components/projects/ProjectList";
import { CreateProjectModal } from "../components/projects/CreateProjectModal";
import { Button } from "../components/ui/Button";
import { useProjects } from "../lib/hooks/useProjects";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faFileLines, faFolder } from "@fortawesome/free-solid-svg-icons";

export default function HomePage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { projects, total } = useProjects();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to AI Document Generator
        </h1>
        <p className="text-gray-600">
          Create high-quality documents powered by AI
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon
                icon={faFolder}
                className="h-5 w-5 text-indigo-600"
              />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
              <p className="text-sm text-gray-500">Projects</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon
                icon={faFileLines}
                className="h-5 w-5 text-green-600"
              />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {projects.reduce((acc, p) => acc + p.chat_count, 0)}
              </p>
              <p className="text-sm text-gray-500">Total Chats</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Your Projects</h2>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Create New Project
        </Button>
      </div>

      <ProjectList />

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
