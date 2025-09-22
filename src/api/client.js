import axios from "axios";
import AuthStorage from "../auth/storage";
import { Alert } from "react-native";

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

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const errorMsg = error.response?.data?.detail || "";
    const message = (error.message || "").toLowerCase();

    console.log("------ API Error Interceptor ------");
    console.log("Status:", status);
    console.log("Error message:", errorMsg);
    console.log("Axios message:", message);
    console.log("Full error object:", error);
    console.log("----------------------------------");

    // 1️⃣ DNS / Network fail check
    if (!error.response || message.includes("network") || message.includes("dns") || message.includes("enotfound")) {
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


    // Other errors
    return Promise.reject({
      status: status || 500,
      reason: "API Error",
      detail: error.response?.data || error.message,
    });
  }
);

export default apiClient;
