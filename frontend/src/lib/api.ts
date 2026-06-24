import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const auth = JSON.parse(localStorage.getItem('vedaai-auth') || '{}');
      if (auth?.state?.token) {
        config.headers.Authorization = `Bearer ${auth.state.token}`;
      }
    } catch {}
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('vedaai-auth');
      window.location.href = '/auth/login';
    }
    return Promise.reject(err);
  }
);

export default api;
