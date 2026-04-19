import axios from 'axios'

/**
 * Pre-configured Axios instance for the IT Career Roadmap API.
 * - baseURL: import.meta.env.VITE_API_BASE_URL (defaults to http://localhost:3000/api)
 * - Request interceptor: attaches Authorization: Bearer <token>
 *   reading from localStorage.getItem('access_token')
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
})

// ─── Request Interceptor ──────────────────────────────────────────────────
const TOKEN_KEY = 'access_token'

apiClient.interceptors.request.use(
  (config) => {
    const url = config.url || ''
    const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register')
    const isPublicCareerPaths = config.method === 'get' && url.includes('/career-paths')

    if (isAuthRoute || isPublicCareerPaths) return config

    const token = localStorage.getItem(TOKEN_KEY)
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error),
)

// Handles 401 responses globally by clearing the stored token.──
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      console.warn('API client received 401; cleared token')
    }
    return Promise.reject(error)
  },
)

export default apiClient
