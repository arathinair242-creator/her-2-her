const API_BASE_URL = 'http://localhost:5001/api';

console.log('API Client initialized with BASE_URL:', API_BASE_URL);

const apiClient = {
  get: async (endpoint) => {
    try {
      const token = localStorage.getItem('her2her_token');
      console.log(`[API GET] ${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Server returned an error');
      }
      return response.json();
    } catch (err) {
      if (err.name === 'TypeError') {
        throw new Error('Could not connect to the backend server. Please ensure the server is running on port 5001.');
      }
      throw err;
    }
  },

  post: async (endpoint, data) => {
    try {
      const token = localStorage.getItem('her2her_token');
      console.log(`[API POST] ${endpoint}`, data);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Server returned an error');
      }
      return response.json();
    } catch (err) {
      if (err.name === 'TypeError') {
        throw new Error('Could not connect to the backend server. Please ensure the server is running on port 5001.');
      }
      throw err;
    }
  },

  put: async (endpoint, data) => {
    try {
      const token = localStorage.getItem('her2her_token');
      console.log(`[API PUT] ${endpoint}`, data);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Server returned an error');
      }
      return response.json();
    } catch (err) {
      if (err.name === 'TypeError') {
        throw new Error('Could not connect to the backend server. Please ensure the server is running on port 5001.');
      }
      throw err;
    }
  },

  delete: async (endpoint) => {
    try {
      const token = localStorage.getItem('her2her_token');
      console.log(`[API DELETE] ${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Server returned an error');
      }
      return response.json();
    } catch (err) {
      if (err.name === 'TypeError') {
        throw new Error('Could not connect to the backend server. Please ensure the server is running on port 5001.');
      }
      throw err;
    }
  },

  uploadFile: async (file) => {
    try {
      const token = localStorage.getItem('her2her_token');
      const formData = new FormData();
      formData.append('file', file);
      
      console.log(`[API UPLOAD] /auth/upload`, file.name);
      const response = await fetch(`${API_BASE_URL}/auth/upload`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          // Note: browser automatically sets boundary for multipart/form-data when body is FormData,
          // do NOT manually set Content-Type header here
        },
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Server returned an error during upload');
      }
      return response.json();
    } catch (err) {
      if (err.name === 'TypeError') {
        throw new Error('Could not connect to the backend server. Please ensure the server is running on port 5001.');
      }
      throw err;
    }
  },
};

export const authApi = {
  registerUser: (data) => apiClient.post('/auth/register/user', data),
  loginUser: (data) => apiClient.post('/auth/login/user', data),
  registerExpert: (data) => apiClient.post('/auth/register/expert', data),
  loginExpert: (data) => apiClient.post('/auth/login/expert', data),
  registerPartner: (data) => apiClient.post('/auth/register/partner', data),
  loginPartner: (data) => apiClient.post('/auth/login/partner', data),
  googleLogin: (data) => apiClient.post('/auth/google', data),
  uploadFile: (file) => apiClient.uploadFile(file),
};

export const expertApi = {
  getExperts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiClient.get(`/experts${qs ? `?${qs}` : ''}`);
  },
  getExpertById: (id) => apiClient.get(`/experts/${id}`),
  addExpert: (data) => apiClient.post('/experts', data),
  updateExpert: (id, data) => apiClient.put(`/experts/${id}`, data),
  deleteExpert: (id) => apiClient.delete(`/experts/${id}`),
};

export const assessmentApi = {
  saveAssessment: (data) => apiClient.post('/assessments', data),
  getMyPlan: () => apiClient.get('/assessments/my-plan'),
  getHistory: () => apiClient.get('/assessments/history'),
};

export const communityApi = {
  getPosts: () => apiClient.get('/community/posts'),
  createPost: (data) => apiClient.post('/community/posts', data),
  likePost: (id) => apiClient.post(`/community/posts/${id}/like`),
  addComment: (id, data) => apiClient.post(`/community/posts/${id}/comments`, data),
};

export const consultApi = {
  bookSession: (data) => apiClient.post('/consultations/book', data),
  getMySessions: () => apiClient.get('/consultations/my'),
  getExpertSessions: () => apiClient.get('/consultations/expert-my'),
  updateStatus: (id, status) => apiClient.put(`/consultations/${id}/status`, { status }),
  getAiResponse: (message) => apiClient.post('/consultations/ai-chat', { message }),
};

export const userApi = {
  getProfile: () => apiClient.get('/users/profile'),
  updateProfile: (data) => apiClient.put('/users/profile', data),
  changePassword: (data) => apiClient.put('/users/change-password', data),
  updateSettings: (data) => apiClient.put('/users/settings', data),
  activateTrial: () => apiClient.post('/users/activate-trial'),
  getMyOrders: () => apiClient.get('/users/my-orders'),
};

export const partnerApi = {
  getProfile: () => apiClient.get('/partners/profile'),
  updateProfile: (data) => apiClient.put('/partners/profile', data),
  addEvent: (data) => apiClient.post('/partners/events', data),
  deleteEvent: (id) => apiClient.delete(`/partners/events/${id}`),
  addReferral: (data) => apiClient.post('/partners/referrals', data),
  deleteReferral: (id) => apiClient.delete(`/partners/referrals/${id}`),
  getAnalytics: () => apiClient.get('/partners/analytics'),
};

export const paymentApi = {
  createOrder: (data) => apiClient.post('/payments/create-order', data),
  verifyPayment: (data) => apiClient.post('/payments/verify', data),
  savePayment: (data) => apiClient.post('/payments/save', data),
};

export const adminApi = {
  loginAdmin: (data) => apiClient.post('/admin/login', data),
  getStats: () => apiClient.get('/admin/stats'),
  getAnalytics: () => apiClient.get('/admin/analytics'),
  getDoctors: () => apiClient.get('/admin/doctors'),
  updateDoctorStatus: (id, status) => apiClient.put(`/admin/doctors/${id}/status`, { status }),
  getUsers: () => apiClient.get('/admin/users'),
  getAppointments: () => apiClient.get('/admin/appointments'),
  getPartners: () => apiClient.get('/admin/partners'),
  updatePartnerStatus: (id, status) => apiClient.put(`/admin/partners/${id}/status`, { status }),
  getAllReviews: () => apiClient.get('/reviews/all'),
};

export const reviewApi = {
  submitReview: (data) => apiClient.post('/reviews', data),
  getPublicReviews: () => apiClient.get('/reviews'),
};

export default apiClient;
