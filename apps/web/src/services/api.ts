/**
 * Centralized API service layer.
 * Single Axios instance with request/response interceptors and token management.
 */

import axios from "axios";
import type { AxiosInstance, AxiosError, AxiosResponse } from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";
const TOKEN_KEY = "access_token";

/** Configured Axios instance for all API calls. */
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attaches JWT token to requests, skipping auth and public endpoints.
api.interceptors.request.use((config) => {
  const isAuthRoute = config.url?.includes('/auth/login') || config.url?.includes('/auth/register');

  if (isAuthRoute) {
    return config;
  }

  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handles 401 responses globally by clearing the stored token.
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear stored token so subsequent requests won't reuse it
      localStorage.removeItem(TOKEN_KEY);
      console.warn("401 Unauthorized - token may be expired");
    }
    return Promise.reject(error);
  },
);

// ───── HELPER FUNCTIONS ─────
/** Persists the JWT token to localStorage. */
export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/** Removes the JWT token from localStorage. */
export const clearAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/** Returns the stored JWT token, or null if absent. */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/** Returns true if a JWT token exists in localStorage. */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

/** Marks a skill as completed for the current user. */
export const completeSkill = async (skillId: string): Promise<void> => {
  await api.post(`/skills/${skillId}/complete`);
};
