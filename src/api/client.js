import axios from "axios";
import { navigation } from "../../navigation/NavigationService";
import AuthStorage from "../auth/storage";
import { handleError } from "../utility/errorHandler";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (__DEV__) {
  console.log("API URL:", API_URL);
}

const apiClient = axios.create({
  baseURL: `${API_URL}`,
  timeout: 30000, //30 second
  headers: {
    'Content-Type': 'application/json',
  }
});
apiClient.interceptors.request.use(async (config) => {
  const token = await AuthStorage.getUser();
  if (__DEV__) {
    console.log("Token from storage:", token);
  }
  if (token) {
    config.headers.Authorization = `token ${token}`;
  }
  return config;
}, (error) => {
  if (__DEV__) {
    console.error("Request interceptor error:", error);
  }
  return Promise.reject(error);
});


apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 errors (session expiry)
    if (error.response && error.response.status === 401) {
      await AuthStorage.removeToken();

      // Use centralized error handler
      handleError(error, {
        context: 'API_Interceptor',
        showAlert: false, // Don't show alert, use toast instead
        showToast: true,
        logError: true
      });

      // Navigate to login
      if (navigation.current) {
        navigation.current.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }

      return Promise.reject(new Error('Unauthorized'));
    }

    // Handle other errors with centralized handler
    handleError(error, {
      context: 'API_Interceptor',
      showAlert: false,
      showToast: true,
      logError: true
    });

    return Promise.reject(error);
  }
);

// Add a centralized HTTP wrapper function
const http = {
  get: async (url, config = {}) => {
    try {
      return await apiClient.get(url, config);
    } catch (error) {
      if (__DEV__) {
        console.error('HTTP GET error:', error);
      }
      throw error;
    }
  },

  post: async (url, data = {}, config = {}) => {
    try {
      const response = await apiClient.post(url, data, config);
      return { ok: true, data: response.data };
    } catch (error) {
      if (__DEV__) {
        console.error('HTTP POST error:', error);
      }
      return { ok: false, error };
    }
  },

  put: async (url, data = {}, config = {}) => {
    try {
      const response = await apiClient.put(url, data, config);
      return { ok: true, data: response.data };
    } catch (error) {
      if (__DEV__) {
        console.error('HTTP PUT error:', error);
      }
      return { ok: false, error };
    }
  },

  delete: async (url, config = {}) => {
    try {
      const response = await apiClient.delete(url, config);
      return { ok: true, data: response.data };
    } catch (error) {
      if (__DEV__) {
        console.error('HTTP DELETE error:', error);
      }
      return { ok: false, error };
    }
  }
};

export default apiClient;
export { http };

