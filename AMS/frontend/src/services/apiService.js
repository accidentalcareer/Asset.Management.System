import api from './api'

// ── Auth ──────────────────────────────────────────────────────────
export const authService = {
  register:       (data) => api.post('/auth/register', data),
  login:          (data) => api.post('/auth/login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword:  (data) => api.post('/auth/reset-password', data),
}

// ── Assets ────────────────────────────────────────────────────────
export const assetService = {
  getAll:  (type)      => api.get('/assets', { params: { type } }),
  getOne:  (id)        => api.get(`/assets/${id}`),
  create:  (data)      => api.post('/assets', data),
  update:  (id, data)  => api.put(`/assets/${id}`, data),
  remove:  (id)        => api.delete(`/assets/${id}`),
}

// ── SIPs ──────────────────────────────────────────────────────────
export const sipService = {
  getAll:  ()          => api.get('/sips'),
  getOne:  (id)        => api.get(`/sips/${id}`),
  create:  (data)      => api.post('/sips', data),
  update:  (id, data)  => api.put(`/sips/${id}`, data),
  remove:  (id)        => api.delete(`/sips/${id}`),
}

// ── Transactions ──────────────────────────────────────────────────
export const transactionService = {
  getAll:    (params) => api.get('/transactions', { params }),
  create:    (data)   => api.post('/transactions', data),
  update:    (id, data) => api.put(`/transactions/${id}`, data),
  remove:    (id)     => api.delete(`/transactions/${id}`),
  exportCsv: ()       => api.get('/transactions/export/csv', { responseType: 'blob' }),
  exportPdf: ()       => api.get('/transactions/export/pdf', { responseType: 'blob' }),
}

// ── Dashboard ─────────────────────────────────────────────────────
export const dashboardService = {
  get: () => api.get('/dashboard'),
}

// ── Projections ───────────────────────────────────────────────────
export const projectionService = {
  calculate:  (data)   => api.post('/projections/calculate', data),
  getSaved:   ()       => api.get('/projections'),
  remove:     (id)     => api.delete(`/projections/${id}`),
  retirement: (params) => api.get('/projections/retirement', { params }),
}
