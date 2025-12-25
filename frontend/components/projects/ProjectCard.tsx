"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder, faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { Dropdown } from "../ui/Dropdown";
import { useProjectActions } from "../../lib/hooks/useProjects";
import type { ProjectListItem } from "../../lib/types/models";
import { useRouter } from "next/navigation";

export interface ProjectCardProps {
  project: ProjectListItem;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { deleteProject } = useProjectActions();
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this project?")) {
      await deleteProject(project.id);
      router.push("/");
    }
  };

  const dropdownItems = [
    {
      label: "Delete Project",
      onClick: handleDelete,
      danger: true,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <FontAwesomeIcon
              icon={faFolder}
              className="h-5 w-5 text-indigo-600"
            />
          </div>
          <div>
            <Link
              href={`/projects/${project.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-indigo-600"
            >
              {project.name}
            </Link>
            {project.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
        </div>
        <Dropdown
          trigger={<FontAwesomeIcon icon={faEllipsisVertical} className="h-5 w-5" />}
          items={dropdownItems}
        />
      </div>
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{project.chat_count} chats</span>
        <span>
          {new Date(project.updated_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

