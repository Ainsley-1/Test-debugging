import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const bugAPI = {
  getAllBugs: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/bugs?${params}`);
    return response.data;
  },

  getBugById: async (id) => {
    const response = await api.get(`/bugs/${id}`);
    return response.data;
  },

  createBug: async (bugData) => {
    const response = await api.post('/bugs', bugData);
    return response.data;
  },

  updateBug: async (id, updates) => {
    const response = await api.put(`/bugs/${id}`, updates);
    return response.data;
  },

  deleteBug: async (id) => {
    const response = await api.delete(`/bugs/${id}`);
    return response.data;
  }
};

export default api;