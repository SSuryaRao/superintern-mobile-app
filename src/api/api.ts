import axios from 'axios';
import { getAuth } from '@react-native-firebase/auth';

// Replace with your actual API base URL from Postman variables if needed
const API_BASE_URL = 'https://superintern-local.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
});

// Add a request interceptor to include the Firebase token in the headers
api.interceptors.request.use(
  async (config) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      // Only add the authentication token if a user is logged in AND
      // the request is NOT for the public '/tasks/available' endpoint.
      if (user && config.url !== '/tasks/available') {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log requests in development for debugging
      if (__DEV__) {
        console.log('API Request:', config.method?.toUpperCase(), config.url);
      }
      return config;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for better error handling and logging
api.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log('API Response:', response.config.url, response.status);
      console.log('Response Data for ' + response.config.url + ':', response.data);
    }
    return response;
  },
  async (error) => {
    if (__DEV__) {
      console.error('API Error:', error.response?.status, error.response?.data || error.message);
    }
    
    // Handle 401 Unauthorized - token might be expired
    if (error.response?.status === 401) {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        try {
          // Force token refresh
          await user.getIdToken(true);
          // Retry the original request
          const originalRequest = error.config;
          const newToken = await user.getIdToken();
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return api(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// --- Authentication ---
export const loginOrRegister = (referralCode?: string) => {
  return api.post('/auth/login', { referralCode });
};

export const getCurrentUser = () => {
  return api.get('/auth/users/me');
};

// --- Users ---
export const getMyProfile = () => {
  return api.get('/users/me');
};

export const updateMyProfile = (profileData: any) => {
  return api.put('/users/me', profileData);
};

export const getLeaderboard = () => {
  return api.get('/users/leaderboard');
};

export const uploadCV = (formData: FormData) => {
  return api.post('/users/upload-cv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const downloadCV = () => {
  return api.get('/users/download-cv');
};

export const deleteCV = () => {
  return api.delete('/users/delete-cv');
};

// Replace the old uploadIntroVideo function with this one

export const uploadIntroVideo = (formData: FormData) => {
  // The 'headers' object has been removed to let Axios set it automatically
  return api.post('/users/upload-video', formData); 
};

export const deleteIntroVideo = () => {
  return api.delete('/users/delete-video');
};

// --- Tasks ---
export const getAvailableTasks = () => {
  return api.get('/tasks/available');
};

export const getTaskById = (taskId: string) => {
  return api.get(`/tasks/${taskId}`);
};

export const applyForTask = (taskId: string) => {
  return api.post(`/tasks/${taskId}/apply`);
};

export const getMyApplications = () => {
  return api.get('/tasks/my-applications');
};

export const getMyAssignedTasks = () => {
  return api.get('/tasks/my');
};

export const submitCodeLink = (taskId: string, codeLink: string) => {
  return api.post(`/tasks/${taskId}/submit-code-link`, { codeLink });
};

export const submitVideoLink = (taskId: string, videoLink: string) => {
  return api.post(`/tasks/${taskId}/submit-video-link`, { videoLink });
};

export const submitVideoFile = (taskId: string, formData: FormData) => {
  return api.post(`/tasks/${taskId}/submit-video`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const completeTask = (taskId: string) => {
  return api.post(`/tasks/${taskId}/complete`);
};

export const withdrawApplication = (taskId: string) => {
  return api.delete(`/tasks/${taskId}/application`);
};

// --- Jobs ---
export const getAllJobs = (params?: any) => {
  return api.get('/jobs', { params });
};

export const getJobById = (jobId: string) => {
  return api.get(`/jobs/${jobId}`);
};

export const getJobStatistics = () => {
    return api.get('/jobs/stats/overview');
};

// --- Job Applications ---
export const applyForJob = (jobId: string) => {
  return api.post('/job-applications', { jobId });
};

export const getMyJobApplications = () => {
  return api.get('/job-applications/my');
};

// --- Referrals ---
export const generateReferralCode = () => {
  return api.post('/referrals/generate');
};

export const getReferralStats = () => {
  return api.get('/referrals/stats');
};

export const validateReferralCode = (referralCode: string) => {
  return api.get(`/referrals/validate/${referralCode}`);
};

export const trackReferralClick = (referralCode: string) => {
  return api.post(`/referrals/click/${referralCode}`);
};

export const checkBonusEligibility = () => {
  return api.get('/referrals/check-bonus');
};

export const claimReferralBonus = () => {
  return api.post('/referrals/claim-bonus');
};

// --- Chat ---
export const getAllChats = () => {
  return api.get('/chat');
};

export const startOrGetChat = (participantId: string) => {
  return api.post('/chat/start', { participantId });
};

export const getChatMessages = (chatId: string) => {
  return api.get(`/chat/${chatId}`);
};

export const sendMessage = (chatId: string, content: string) => {
  return api.post(`/chat/${chatId}/messages`, { content });
};

export const getAdminsForChat = () => {
  return api.get('/chat/users/admins');
};

// --- Requirements ---
export const submitRequirement = (requirementData: any) => {
  return api.post('/requirements', requirementData);
};

// --- Admin Functions ---

// USERS (Admin)
export const getAllUsersAdmin = () => {
  return api.get('/users');
};

// TASKS (Admin)
export const createTaskAdmin = (taskData: any) => {
  return api.post('/tasks', taskData);
};

export const getAllTasksAdmin = () => {
  return api.get('/tasks');
};

export const getAllApplicationsAdmin = () => {
  return api.get('/tasks/applications');
};

export const approveApplicationAdmin = (applicationId: string) => {
  return api.post(`/tasks/applications/${applicationId}/approve`);
};

export const rejectApplicationAdmin = (applicationId: string, rejectionData: any) => {
  return api.post(`/tasks/applications/${applicationId}/reject`, rejectionData);
};

export const updateTaskAdmin = (taskId: string, taskData: any) => {
  return api.put(`/tasks/${taskId}`, taskData);
};

export const deleteTaskAdmin = (taskId: string) => {
  return api.delete(`/tasks/${taskId}`);
};

// JOBS (Admin)
export const createJobAdmin = (jobData: any) => {
  return api.post('/jobs', jobData);
};

// JOB APPLICATIONS (Admin)
export const getAllJobApplicationsAdmin = () => {
  return api.get('/job-applications');
};

export const updateApplicationStatusAdmin = (applicationId: string, status: string) => {
  return api.patch(`/job-applications/${applicationId}`, { status });
};

// REFERRALS (Admin)
export const getAllReferralsAdmin = () => {
  return api.get('/referrals/all');
};

// CHAT (Admin)
export const getUsersForAdminChat = () => {
  return api.get('/chat/users/admin');
};

// REQUIREMENTS (Admin)
export const getAllRequirementsAdmin = () => {
  return api.get('/requirements');
};

// ANALYTICS (Admin)
export const getCurrentAnalyticsAdmin = () => {
  return api.get('/analytics/current');
};

export const manualAnalyticsSyncAdmin = () => {
  return api.post('/analytics/sync');
};

export const getSyncStatusAdmin = () => {
  return api.get('/analytics/status');
};

export default api;