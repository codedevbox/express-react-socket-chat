import { create } from "zustand";
import { User } from "../types";

interface ChatState {
  chatId: string | null;
  user: User | null;
  refreshChats: boolean;
  changeChat: (chatId: string, user: User) => void;
  needRefreshChats: () => void;
  resetRefreshChats: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  chatId: null,
  user: null,
  refreshChats: false,
  changeChat: (chatId, user) =>
    set({
      chatId,
      user,
    }),
  needRefreshChats: () => set({ refreshChats: true }),
  resetRefreshChats: () => set({ refreshChats: false }),
}));
