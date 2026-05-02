import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5255',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const t = localStorage.getItem('token');
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

// Unwrap ApiResponse<T> envelope
api.interceptors.response.use(
  (response) => {
    const d = response.data;
    // If it's an ApiResponse envelope { success, data, message }, unwrap it
    if (d && typeof d === 'object' && 'success' in d && 'data' in d) {
      response.data = d.data;
    }
    return response;
  },
  (error) => {
    const envelope = error?.response?.data;
    const msg = (envelope && typeof envelope === 'object' && envelope.message)
      || (envelope && typeof envelope === 'object' && envelope.error)
      || error.message
      || 'An error occurred';
    if (error.response) error.response.data = { error: msg, message: msg };
    return Promise.reject(error);
  }
);

export default api;
