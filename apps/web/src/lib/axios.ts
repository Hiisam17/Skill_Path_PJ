import axios from 'axios'

/**
 * Pre-configured Axios instance for the IT Career Roadmap API.
 * - baseURL: http://localhost:8080/api
 * - Request interceptor: attaches Authorization: Bearer <token>
 *   reading from localStorage.getItem('token')
 */
const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
})

// ─── Request Interceptor ──────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ─── Response Interceptor (optional – handles 401 globally) ──────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid – clear storage and redirect to login
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default apiClient
