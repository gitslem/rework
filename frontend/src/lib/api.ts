import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = response.data;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; role: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  googleAuth: (data: { token: string; role?: string }) =>
    api.post('/auth/google', data),
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refresh_token: refreshToken }),
};

// Users API
export const usersAPI = {
  getMe: () => api.get('/users/me'),
  getMyProfile: () => api.get('/users/me/profile'),
  updateMyProfile: (data: any) => api.patch('/users/me/profile', data),
  getStats: () => api.get('/users/me/stats'),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/users/me/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadResume: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/users/me/profile/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Projects API
export const projectsAPI = {
  getAll: (params?: any) => api.get('/projects/', { params }),
  getById: (id: number) => api.get(`/projects/${id}`),
  create: (data: any) => api.post('/projects/', data),
  update: (id: number, data: any) => api.patch(`/projects/${id}`, data),
  delete: (id: number) => api.delete(`/projects/${id}`),
  getMyProjects: () => api.get('/projects/my/projects'),
};

// Applications API
export const applicationsAPI = {
  create: (data: any) => api.post('/applications/', data),
  getAll: () => api.get('/applications/'),
  getByProject: (projectId: number) =>
    api.get(`/applications/project/${projectId}`),
  update: (id: number, data: any) => api.patch(`/applications/${id}`, data),
  withdraw: (id: number) => api.delete(`/applications/${id}`),
};

// Sandboxes API
export const sandboxesAPI = {
  getAll: (params?: any) => api.get('/sandboxes/', { params }),
  getById: (id: number) => api.get(`/sandboxes/${id}`),
  create: (data: any) => api.post('/sandboxes/', data),
  update: (id: number, data: any) => api.patch(`/sandboxes/${id}`, data),
  delete: (id: number) => api.delete(`/sandboxes/${id}`),
  execute: (id: number, data: any) => api.post(`/sandboxes/${id}/execute`, data),
  manageFile: (id: number, data: any) => api.post(`/sandboxes/${id}/files`, data),
  share: (id: number, userIds: number[]) => api.post(`/sandboxes/${id}/share`, userIds),
  getCollaborators: (id: number) => api.get(`/sandboxes/${id}/collaborators`),
  createSnapshot: (id: number, name: string) => api.post(`/sandboxes/${id}/snapshot`, { name }),
};

// Payments API
export const paymentsAPI = {
  createIntent: (data: { project_id: number; amount: number; metadata?: any }) =>
    api.post('/payments/create-intent', data),
  confirm: (data: { payment_id: number; payment_method_id: string }) =>
    api.post('/payments/confirm', data),
  getAll: () => api.get('/payments/'),
  getById: (id: number) => api.get(`/payments/${id}`),
  getByProject: (projectId: number) => api.get(`/payments/project/${projectId}`),
  refund: (id: number, data?: { amount?: number; reason?: string }) =>
    api.post(`/payments/${id}/refund`, data),
};

// Escrow API
export const escrowAPI = {
  create: (data: { payment_id: number; project_id: number; amount: number; release_condition?: string }) =>
    api.post('/escrows/', data),
  getAll: () => api.get('/escrows/'),
  getHeld: () => api.get('/escrows/held'),
  getById: (id: number) => api.get(`/escrows/${id}`),
  getByProject: (projectId: number) => api.get(`/escrows/project/${projectId}`),
  release: (id: number, data?: { proof_id?: number }) =>
    api.post(`/escrows/${id}/release`, data),
  dispute: (id: number, data: { reason: string }) =>
    api.post(`/escrows/${id}/dispute`, data),
  refund: (id: number, data?: { reason?: string }) =>
    api.post(`/escrows/${id}/refund`, data),
};

// Reviews API
export const reviewsAPI = {
  create: (data: { project_id: number; reviewee_id: number; rating: number; comment?: string }) =>
    api.post('/reviews/', data),
  getUserReviews: (userId: number, params?: { skip?: number; limit?: number }) =>
    api.get(`/reviews/user/${userId}`, { params }),
  getReviewSummary: (userId: number) =>
    api.get(`/reviews/user/${userId}/summary`),
  getProjectReviews: (projectId: number) =>
    api.get(`/reviews/project/${projectId}`),
  getReviewsGiven: (params?: { skip?: number; limit?: number }) =>
    api.get('/reviews/given', { params }),
  getReviewsReceived: (params?: { skip?: number; limit?: number }) =>
    api.get('/reviews/received', { params }),
  getById: (id: number) => api.get(`/reviews/${id}`),
  update: (id: number, data: { rating: number; comment?: string }) =>
    api.put(`/reviews/${id}`, data),
  delete: (id: number) => api.delete(`/reviews/${id}`),
};

// Candidate Projects API (Email notifications for Firebase projects)
export const candidateProjectsAPI = {
  sendCreationEmail: (data: {
    candidate_email: string;
    candidate_name: string;
    agent_name: string;
    project_title: string;
    project_description: string;
    project_id: string;
    platform?: string;
  }) => api.post('/candidate-projects/send-creation-email', data),

  sendUpdateEmail: (data: {
    candidate_email: string;
    candidate_name: string;
    agent_name: string;
    project_title: string;
    project_id: string;
    update_summary?: string;
  }) => api.post('/candidate-projects/send-update-email', data),
};

export default api;
