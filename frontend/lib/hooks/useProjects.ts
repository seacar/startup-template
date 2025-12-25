import useSWR from "swr";
import {
  getProjects,
  getProject,
  createProject as createProjectApi,
  updateProject as updateProjectApi,
  deleteProject as deleteProjectApi,
} from "../api/projects";
import type {
  Project,
  ProjectCreate,
  ProjectDetail,
  ProjectListResponse,
  ProjectUpdate,
} from "../types/models";

export function useProjects(limit: number = 50, offset: number = 0) {
  const { data, error, isLoading, mutate } = useSWR<ProjectListResponse>(
    `/api/v1/projects?limit=${limit}&offset=${offset}`,
    () => getProjects(limit, offset),
    {
      // Don't retry on errors - let the user see the error state
      shouldRetryOnError: false,
      // Revalidate on focus to catch when user cookie is set
      revalidateOnFocus: true,
      // Return empty data on error instead of throwing
      onError: (err) => {
        console.error("Failed to load projects:", err);
      },
    }
  );

  // Handle errors gracefully - return empty array if there's an error
  // This allows the UI to show "No projects yet" instead of an error state
  if (error && !data) {
    return {
      projects: [],
      total: 0,
      isLoading: false,
      isError: false, // Don't show error state - just show empty state
      mutate,
    };
  }

  return {
    projects: data?.projects || [],
    total: data?.total || 0,
    isLoading,
    isError: false, // Always false - we handle errors gracefully
    mutate,
  };
}

export function useProject(projectId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<ProjectDetail>(
    projectId ? `/api/v1/projects/${projectId}` : null,
    () => (projectId ? getProject(projectId) : null)
  );

  return {
    project: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useProjectActions() {
  const { mutate: mutateList } = useProjects();

  const createProject = async (data: ProjectCreate): Promise<Project> => {
    const project = await createProjectApi(data);
    await mutateList();
    return project;
  };

  const updateProject = async (
    projectId: string,
    data: ProjectUpdate
  ): Promise<Project> => {
    const project = await updateProjectApi(projectId, data);
    await mutateList();
    return project;
  };

  const deleteProject = async (projectId: string): Promise<void> => {
    await deleteProjectApi(projectId);
    await mutateList();
  };

  return {
    createProject,
    updateProject,
    deleteProject,
  };
}

