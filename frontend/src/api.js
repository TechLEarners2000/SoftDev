import axios from 'axios';

const api = axios.create({
  baseURL: 'https://soft-dev-nqzn.vercel.app//api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = (userData) => api.post('/register', userData);
export const login = (credentials) => api.post('/login', credentials);
export const getIdeas = () => api.get('/ideas');
export const getIdeaDetail = (id) => api.get(`/ideas/${id}`);
export const createIdea = (ideaData) => api.post('/ideas', ideaData);
export const updateIdea = (id, data) => api.put(`/ideas/${id}`, data);
export const addUpdate = (id, message) => api.post(`/ideas/${id}/updates`, { message });
export const getDevelopers = () => api.get('/developers');
export const getStats = () => api.get('/stats');

export default api;
