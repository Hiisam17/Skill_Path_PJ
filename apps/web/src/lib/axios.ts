import axios from 'axios'

/**
 * Pre-configured Axios instance for the IT Career Roadmap API.
 * - baseURL: http://localhost:3000/api
 * - Request interceptor: attaches Authorization: Bearer <token>
 *   reading from localStorage.getItem('access_token')
 */
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
})

// ─── Request Interceptor ──────────────────────────────────────────────────
const TOKEN_KEY = 'access_token'

apiClient.interceptors.request.use(
  (config) => {
    // Do not attach token for public endpoints
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

// ─── Response Interceptor (optional – handles 401 globally) ──────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid – clear stored token but don't force redirect here
      localStorage.removeItem(TOKEN_KEY)
      console.warn('API client received 401; cleared token')
    }
    return Promise.reject(error)
  },
)

export default apiClient
