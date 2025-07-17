import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ideas API
export const ideasApi = {
  getAll: (params = {}) => api.get('/api/ideas/', { params }),
  getById: (id) => api.get(`/api/ideas/${id}`),
  create: (data) => api.post('/api/ideas/', data),
  update: (id, data) => api.put(`/api/ideas/${id}`, data),
  delete: (id) => api.delete(`/api/ideas/${id}`),
  vote: (id, voteType) => api.post(`/api/ideas/${id}/vote?vote_type=${voteType}`),
};

// Alerts API
export const alertsApi = {
  getAll: (params = {}) => api.get('/api/alerts/', { params }),
  getActive: (params = {}) => api.get('/api/alerts/active', { params }),
  getById: (id) => api.get(`/api/alerts/${id}`),
  create: (data) => api.post('/api/alerts/', data),
  update: (id, data) => api.put(`/api/alerts/${id}`, data),
  resolve: (id) => api.post(`/api/alerts/${id}/resolve`),
  delete: (id) => api.delete(`/api/alerts/${id}`),
};

// Marketplace API
export const marketplaceApi = {
  getAll: (params = {}) => api.get('/api/marketplace/', { params }),
  getMyItems: (params = {}) => api.get('/api/marketplace/my-items', { params }),
  getBorrowed: () => api.get('/api/marketplace/borrowed'),
  getById: (id) => api.get(`/api/marketplace/${id}`),
  create: (data) => api.post('/api/marketplace/', data),
  update: (id, data) => api.put(`/api/marketplace/${id}`, data),
  borrow: (id, days) => api.post(`/api/marketplace/${id}/borrow?days=${days}`),
  return: (id) => api.post(`/api/marketplace/${id}/return`),
  delete: (id) => api.delete(`/api/marketplace/${id}`),
};

// Expenses API
export const expensesApi = {
  getAll: (params = {}) => api.get('/api/expenses/', { params }),
  getMySplits: () => api.get('/api/expenses/my-splits'),
  getPendingPayments: () => api.get('/api/expenses/pending-payments'),
  getById: (id) => api.get(`/api/expenses/${id}`),
  create: (data) => api.post('/api/expenses/', data),
  update: (id, data) => api.put(`/api/expenses/${id}`, data),
  pay: (id, amount) => api.post(`/api/expenses/${id}/pay?amount=${amount}`),
  delete: (id) => api.delete(`/api/expenses/${id}`),
};

// Users API
export const usersApi = {
  getAll: (params = {}) => api.get('/api/users/', { params }),
  getById: (id) => api.get(`/api/users/${id}`),
  updateProfile: (data) => api.put('/api/users/me', data),
};