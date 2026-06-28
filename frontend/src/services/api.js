import axios from 'axios'

const API = axios.create({
  baseURL: '/api',
  timeout: 120000, // 2 min for large document processing
})

// Attach JWT on every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('lb_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
}

export const documentApi = {
  upload: (formData, onUploadProgress) =>
    API.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    }),
  getHistory: () => API.get('/documents/history'),
}

export default API
