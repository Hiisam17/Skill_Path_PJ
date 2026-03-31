/**
 * API Service Layer
 * Single axios instance with centralized configuration
 * Handles base URL, request/response interceptors, token management
 *
 * Usage:
 * ```
 * import { api } from '@/services/api';
 * const careerPaths = await api.get('/career-paths');
 * ```
 */

import axios from "axios";
import type { AxiosInstance, AxiosError, AxiosResponse } from "axios";

// ───── CONSTANTS ─────
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const TOKEN_KEY = "access_token";

// ───── CREATE AXIOS INSTANCE ─────
/**
 * Configured axios instance for all API calls
 * @type {AxiosInstance}
 */
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ───── REQUEST INTERCEPTOR ─────
/**
 * Automatically attach JWT token to all requests
 * Reads token from localStorage under 'auth_token' key
 */
// Tìm đoạn này trong api.ts của bạn
api.interceptors.request.use((config) => {
  // 1. Kiểm tra nếu URL là login hoặc register thì KHÔNG đính kèm token
  const isAuthRoute = config.url?.includes('/auth/login') || config.url?.includes('/auth/register');

  if (isAuthRoute) {
    return config; // Cho đi thẳng, không thêm Header Authorization
  }

  // 2. Với các request khác mới lấy token từ LocalStorage
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// ───── RESPONSE INTERCEPTOR ─────
/**
 * Handle global errors:
 * - 401: Token expired or invalid → logout and redirect to login
 * - Other errors: Pass through to caller
 */
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
/**
 * Save JWT token to localStorage
 * @param {string} token - JWT token from auth response
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Remove JWT token from localStorage (logout)
 */
export const clearAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Get stored JWT token
 * @returns {string | null} Token or null if not found
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Check if user is authenticated
 * @returns {boolean} true if token exists
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};
