// ============================================
// FILE: client.js
// Location: src/api/client.js
// ============================================

import axios from "axios";
import AuthStorage from "../auth/storage";
import { Alert } from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (__DEV__) {
  console.log("🌐 API URL:", API_URL);
}

const apiClient = axios.create({
  baseURL: `${API_URL}`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ========================================
// 🔒 TOKEN REFRESH QUEUE MANAGEMENT
// ========================================
let isRefreshing = false;
let refreshPromise = null;

// ✅ Refresh access token using refresh token
const refreshAccessToken = async () => {
  try {
    const refreshToken = await AuthStorage.getRefreshToken();
    if (!refreshToken) throw new Error("NO_REFRESH_TOKEN");

    console.log("🔄 Refreshing access token...");

    const response = await axios.post(`${API_URL}/auth/refresh/`, {
      refresh: refreshToken,
    });

    const newAccessToken = response.data?.access;
    const newRefreshToken = response.data?.refresh;

    if (!newAccessToken) throw new Error("INVALID_REFRESH_RESPONSE");

    await AuthStorage.storeToken(newAccessToken);

    if (newRefreshToken) {
      await AuthStorage.storeRefreshToken(newRefreshToken);
      console.log("🔁 Refresh token rotated");
    }

    console.log("✅ Access token refreshed successfully");
    return newAccessToken;
  } catch (error) {
    console.error("❌ Token refresh failed:", error.response?.data || error.message);
    const { logoutFromClient } = await import("../auth/useAuth");
    await logoutFromClient(true);

    throw error;
  }
};

// ========================================
// 🎯 REQUEST INTERCEPTOR
// (Attach token + Show "Token valid for" time)
// ========================================
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AuthStorage.getToken();
    console.log("Token from storage:", token)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;

      // ✅ Show remaining token validity in development mode
      if (__DEV__) {
        const info = AuthStorage.getTokenInfo(token);
        if (info?.timeUntilExpiry !== undefined) {
          const mins = Math.floor(info.timeUntilExpiry / 60);
          const secs = info.timeUntilExpiry % 60;

          console.log(
            `⏳ Token valid for: ${mins}m ${secs}s`
          );
        }
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ========================================
// 🎯 RESPONSE INTERCEPTOR (401-based refresh)
// ========================================
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    console.log("originalRequest:", originalRequest)

    if (status === 401 && !originalRequest._retry) {
      console.log("🚨 401 detected, attempting token refresh...");

      originalRequest._retry = true;

      if (isRefreshing && refreshPromise) {
        console.log("⏳ Waiting for ongoing refresh...");
        const newToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      }

      isRefreshing = true;
      refreshPromise = refreshAccessToken()
        .then((newToken) => {
          isRefreshing = false;
          refreshPromise = null;
          return newToken;
        })
        .catch((err) => {
          isRefreshing = false;
          refreshPromise = null;
          throw err;
        });

      try {
        const newToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        console.log("✅ Token refreshed → Retrying original request...");
        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

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

    return Promise.reject({
      status: status || 500,
      reason: "API Error",
      detail: error.response.data || error.message,
    });
  }
);

export default apiClient;
