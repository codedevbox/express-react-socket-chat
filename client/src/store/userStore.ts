import { create } from "zustand";
import { apiRequest } from "../lib/apiRequest";
import { AxiosError } from "axios";

interface User {
  id: string;
  email: string;
  username: string;
  avatar: string | null;
}

interface UserState {
  currentUser: User | null;
  register: (
    formData: FormData
  ) => Promise<{ success: boolean; message?: string }>;
  update: (
    formData: FormData
  ) => Promise<{ success: boolean; message?: string }>;
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  currentUser: null,
  isLoading: true,
  register: async (formData) => {
    try {
      const response = await apiRequest.post("/auth/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status === 201 && response.data) {
        return {
          success: true,
          message:
            response.data.message || "Account created! You can login now!",
        };
      } else {
        return { success: false, message: "Unexpected response from server" };
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response) {
          return {
            success: false,
            message:
              error.response.data.message ||
              "An error occurred during register",
          };
        } else if (error.request) {
          return {
            success: false,
            message: "No response received from server",
          };
        }
      }
      return { success: false, message: "An unexpected error occurred" };
    }
  },
  update: async (formData) => {
    try {
      const { currentUser } = get();
      if (!currentUser) {
        return { success: false, message: "No user is currently logged in" };
      }
      const response = await apiRequest.put(
        "/users/" + currentUser?.id,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 200 && response.data) {
        set({ currentUser: response.data });
        return {
          success: true,
          message: response.data.message || "Account updated!",
        };
      } else {
        console.log(response);
        return { success: false, message: "Unexpected response from server" };
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response) {
          return {
            success: false,
            message:
              error.response.data.message || "An error occurred during update",
          };
        } else if (error.request) {
          return {
            success: false,
            message: "No response received from server",
          };
        }
      }
      return { success: false, message: "An unexpected error occurred" };
    }
  },
  login: async (username, password) => {
    try {
      const response = await apiRequest.post("/auth/login", {
        username,
        password,
      });
      if (response.status === 200 && response.data) {
        set({ currentUser: response.data });
        return { success: true };
      } else {
        set({ currentUser: null });
        return { success: false, message: "Unexpected response from server" };
      }
    } catch (error) {
      set({ currentUser: null });
      if (error instanceof AxiosError) {
        if (error.response) {
          return {
            success: false,
            message:
              error.response.data.message || "An error occurred during login",
          };
        } else if (error.request) {
          return {
            success: false,
            message: "No response received from server",
          };
        }
      }
      return { success: false, message: "An unexpected error occurred" };
    }
  },
  logout: async () => {
    try {
      await apiRequest.post("/auth/logout", {});
      set({ currentUser: null });
    } catch (error) {
      console.error("Logout error:", error);
    }
  },
  checkAuth: async () => {
    try {
      const response = await apiRequest.get<User>("/auth/check-auth");
      if (response.status === 200 && response.data && "id" in response.data) {
        set({ currentUser: response.data });
      } else {
        set({ currentUser: null });
      }
    } catch (error) {
      set({ currentUser: null });
    }
  },
}));
