import axios from "axios";

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const apiRequest = axios.create({
  baseURL: `${apiBaseUrl}/api`,
  withCredentials: true,
});
