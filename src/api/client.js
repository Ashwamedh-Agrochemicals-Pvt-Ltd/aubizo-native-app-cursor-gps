import axios from "axios";
import AuthStorage from "../auth/storage";
import { Alert } from "react-native";
import { handleLogout } from "../auth/logoutHandler";
import { logoutFromClient } from "../auth/useAuth";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (__DEV__) {
  console.log("API URL:", API_URL);
}

const apiClient = axios.create({
  baseURL: `${API_URL}`,
  timeout: 30000, // 10 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AuthStorage.getUser();
    if (__DEV__) {
      console.log("Token from storage:", token);
    }
    if (token) {
      config.headers.Authorization = `token ${token}`;
    }
    return config;
  },
  (error) => {
    if (__DEV__) {
      console.error("Request interceptor error:", error);
    }
    return Promise.reject(error);
  }
);
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("Response:", error.response);

    const response = error.response;
    const status = response?.status;
    const data = response?.data?.detail?.detail || response?.data?.detail || "";
    const message = (error.message || "").toLowerCase();

    // 1️⃣ Check for 401 Unauthorized
    if (
      status === 401 &&
      (data === "Authentication credentials were not provided." || data === "Invalid token.")
    ) {
      console.warn("Token invalid! Logging out...");
      await logoutFromClient();

    }

    // 2️⃣ DNS / Network fail check
    if (!response || message.includes("network") || message.includes("dns") || message.includes("enotfound")) {
      setTimeout(() => {
        Alert.alert(
          "Network Issue",
          "सर्व्हरशी कनेक्ट होत नाही. कृपया Wi-Fi/Data off-on करून पुन्हा प्रयत्न करा."
        );
      }, 100);

      return Promise.reject({
        status: 0,
        reason: "DNS/Network Error",
        detail: error.message || "Network Error",
      });
    }

    // 3️⃣ Other API errors
    return Promise.reject({
      status: status || 500,
      reason: "API Error",
      detail: response?.data || error.message,
    });
  }
);
export default apiClient;
