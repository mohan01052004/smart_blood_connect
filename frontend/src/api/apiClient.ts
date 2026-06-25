import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercept requests to add JWT token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('blood_bank_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Donor endpoints
export const donorAPI = {
  getAll: () => axiosInstance.get('/donors/'),
  create: (data: any) => axiosInstance.post('/donors/', data),
  find: (bloodGroup: string) => 
    axiosInstance.get(`/donors/?blood_group=${bloodGroup}`),
  delete: (id: string) => axiosInstance.delete(`/donors/${id}`),
  updateLastDonated: (id: string, last_donated_at: string | null) =>
    axiosInstance.patch(`/donors/${id}/last-donated`, { last_donated_at }),
}

// Auth endpoints
export const authAPI = {
  signup: (data: any) => axiosInstance.post('/auth/signup', data),
  login: (data: any) => axiosInstance.post('/auth/login', data),
  getProfile: () => axiosInstance.get('/auth/me'),
}

// Inventory endpoints
export const inventoryAPI = {
  getAll: () => axiosInstance.get('/inventory/'),
  create: (data: any) => axiosInstance.post('/inventory/', data),
  update: (id: string, data: any) => 
    axiosInstance.put(`/inventory/${id}`, data),
  delete: (id: string) => 
    axiosInstance.delete(`/inventory/${id}`),
}

// Health check
export const healthAPI = {
  check: () => axiosInstance.get('/health'),
}

// Dashboard endpoints
export const dashboardAPI = {
  getStats: () => axiosInstance.get('/dashboard/stats'),
  getMyStats: () => axiosInstance.get('/dashboard/my-stats'),
}

export const apiClient = {
  auth: authAPI,
  donor: donorAPI,
  inventory: inventoryAPI,
  health: healthAPI,
  dashboard: dashboardAPI,
  post: (url: string, data: any) => axiosInstance.post(url, data),
  get: (url: string, config?: any) => axiosInstance.get(url, config),
}