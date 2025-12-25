import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ChatState {
  selectedChatId: string | null;
  setSelectedChat: (chatId: string | null) => void;
  documentContent: string;
  setDocumentContent: (content: string) => void;
  currentVersion: number | null;
  setCurrentVersion: (version: number | null) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      selectedChatId: null,
      setSelectedChat: (chatId) => set({ selectedChatId: chatId }),
      documentContent: "",
      setDocumentContent: (content) => set({ documentContent: content }),
      currentVersion: null,
      setCurrentVersion: (version) => set({ currentVersion: version }),
    }),
    {
      name: "chat-storage",
    }
  )
);

