import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('cf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response error handler
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cf_token');
      localStorage.removeItem('cf_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
};

// ─── Resume CRUD ─────────────────────────────────────────────────────────────
export const resumeAPI = {
  create: (data) => API.post('/resume', data),
  getAll: () => API.get('/resume'),
  getOne: (id) => API.get(`/resume/${id}`),
  update: (id, data) => API.put(`/resume/${id}`, data),
  delete: (id) => API.delete(`/resume/${id}`),
  duplicate: (id) => API.post(`/resume/${id}/duplicate`),
};

// ─── AI Features ─────────────────────────────────────────────────────────────
export const aiAPI = {
  analyzeJD: (data) => API.post('/ai/analyze-jd', data),
  rewriteExperience: (resumeId, data) => API.post(`/ai/rewrite-experience/${resumeId}`, data),
  rewriteSummary: (resumeId) => API.post(`/ai/rewrite-summary/${resumeId}`),
  suggestSkills: (resumeId) => API.post(`/ai/suggest-skills/${resumeId}`),
  generateCoverLetter: (resumeId, data) => API.post(`/ai/cover-letter/${resumeId}`, data),
  exportResumePDF: (resumeId) =>
    API.get(`/ai/export/${resumeId}`, { responseType: 'blob' }),
  exportCoverLetterPDF: (resumeId) =>
    API.get(`/ai/export-cover-letter/${resumeId}`, { responseType: 'blob' }),
};

// ─── Payment ─────────────────────────────────────────────────────────────────
export const paymentAPI = {
  createCheckout: () => API.post('/payment/create-checkout'),
  createPortal: () => API.post('/payment/portal'),
  getStatus: () => API.get('/payment/status'),
};

// ─── Helper: trigger browser download from blob ───────────────────────────────
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export default API;
