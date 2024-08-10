import { create } from "zustand";

interface VisibilityState {
  showList: boolean;
  showChat: boolean;
  showInfo: boolean;
  showDetail: boolean;
  isMobile: boolean;
  toggleList: (visible: boolean) => void;
  toggleChat: (visible: boolean) => void;
  toggleInfo: (visible: boolean) => void;
  toggleDetail: (visible: boolean) => void;
  updateIsMobile: (value: boolean) => void;
}

export const useWindowStore = create<VisibilityState>((set) => ({
  showList: true,
  showChat: false,
  showInfo: false,
  showDetail: false,
  isMobile: false,
  toggleList: (visible) =>
    set((state) => ({
      ...state,
      showList: visible !== undefined ? visible : !state.showList,
    })),
  toggleChat: (visible) =>
    set((state) => ({
      ...state,
      showChat: visible !== undefined ? visible : !state.showChat,
    })),
  toggleInfo: (visible) =>
    set((state) => ({
      ...state,
      showInfo: visible !== undefined ? visible : !state.showInfo,
    })),
  toggleDetail: (visible) =>
    set((state) => ({
      ...state,
      showDetail: visible !== undefined ? visible : !state.showDetail,
    })),
  updateIsMobile: (value: boolean) => set({ isMobile: value }),
}));
