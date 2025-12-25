import { apiClient } from "./client";
import type {
  Project,
  ProjectCreate,
  ProjectDetail,
  ProjectListResponse,
  ProjectUpdate,
} from "../types/models";

export async function getProjects(
  limit: number = 50,
  offset: number = 0
): Promise<ProjectListResponse> {
  return apiClient.get<ProjectListResponse>(
    `/projects?limit=${limit}&offset=${offset}`
  );
}

export async function getProject(projectId: string): Promise<ProjectDetail> {
  return apiClient.get<ProjectDetail>(`/projects/${projectId}`);
}

export async function createProject(
  data: ProjectCreate
): Promise<Project> {
  return apiClient.post<Project>("/projects", data);
}

export async function updateProject(
  projectId: string,
  data: ProjectUpdate
): Promise<Project> {
  return apiClient.patch<Project>(`/projects/${projectId}`, data);
}

export async function deleteProject(projectId: string): Promise<void> {
  return apiClient.delete<void>(`/projects/${projectId}`);
}

