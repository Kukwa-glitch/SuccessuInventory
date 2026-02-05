import api from './axios';

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  updatePassword: (passwords) => api.put('/auth/update-password', passwords),
  logout: () => api.post('/auth/logout'),
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (formData) => api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/products/${id}`),
  addStock: (id, data) => api.post(`/products/${id}/add-stock`, data),
  deductStock: (id, formData) => api.post(`/products/${id}/deduct-stock`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getCategories: () => api.get('/products/categories'),
};

// Transactions API
export const transactionsAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  getByProduct: (productId) => api.get(`/transactions/product/${productId}`),
  getRecent: (limit) => api.get('/transactions/recent', { params: { limit } }),
};

// Documents API
export const documentsAPI = {
  getAll: (params) => api.get('/documents', { params }),
  getById: (id) => api.get(`/documents/${id}`),
  getByProduct: (productId) => api.get(`/documents/product/${productId}`),
  delete: (id) => api.delete(`/documents/${id}`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getByCategory: () => api.get('/dashboard/by-category'),
  getLowStock: () => api.get('/dashboard/low-stock'),
};

// Reports API
export const reportsAPI = {
  exportInventory: (params) => api.get('/reports/inventory', {
    params,
    responseType: 'blob'
  }),
  exportDocuments: (params) => api.get('/reports/documents', {
    params,
    responseType: 'blob'
  }),
  getAnalytics: (days) => api.get('/reports/analytics', { params: { days } }),
};