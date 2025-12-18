import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  // Add your state here
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Add your state and actions here
    }),
    {
      name: "app-storage",
    },
  ),
);

