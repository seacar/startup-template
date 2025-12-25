import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProjectState {
  selectedProjectId: string | null;
  setSelectedProject: (projectId: string | null) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      selectedProjectId: null,
      setSelectedProject: (projectId) => set({ selectedProjectId: projectId }),
    }),
    {
      name: "project-storage",
    }
  )
);

