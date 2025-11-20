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

// ---------- RESPONSE INTERCEPTOR (401 -> refresh) ----------
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const errMsg = (error.message || "").toLowerCase();
    const url = (originalRequest?.url || "").toLowerCase();

    console.log("originalRequest:", url);
    console.log("error.status:", status, "error.message:", error.message);

    // --------------------------------------------------------
    // 1) BLOCK refresh logic for refresh/logout endpoints
    // --------------------------------------------------------
    if (url.includes("auth/refresh") || url.includes("auth/logout")) {
      console.log("⚠️ Auth endpoint hit → not attempting refresh.");
      return Promise.reject(error);
    }

    // --------------------------------------------------------
    // 2) Network / DNS Errors
    // --------------------------------------------------------
    if (!error.response || errMsg.includes("network") || errMsg.includes("dns") || errMsg.includes("enotfound")) {
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

    // --------------------------------------------------------
    // 3) CHECK AGAIN → Logout endpoint should not refresh
    // --------------------------------------------------------
    if (url.includes("auth/logout")) {
      console.log("🟡 Skipping refresh for logout API");
      return Promise.reject(error);
    }

    // --------------------------------------------------------
    // 4) Handle 401 (Token Expired)
    // --------------------------------------------------------
    if (status === 401 && !originalRequest._retry) {
      console.log("🚨 401 detected → attempting token refresh...");
      originalRequest._retry = true;

      // If refresh is in progress → wait for it
      if (isRefreshing && refreshPromise) {
        console.log("⏳ Waiting for ongoing refresh…");
        try {
          const newToken = await refreshPromise;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } catch (waitErr) {
          console.error("❌ Error while waiting for refresh:", waitErr);
          return Promise.reject(waitErr);
        }
      }

      // Start new refresh
      isRefreshing = true;

      const refreshWithTimeout = () => {
        const REFRESH_TIMEOUT_MS = 10000;
        return Promise.race([
          refreshAccessToken(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("REFRESH_TIMEOUT")), REFRESH_TIMEOUT_MS)
          ),
        ]);
      };

      refreshPromise = refreshWithTimeout()
        .then((newToken) => newToken)
        .finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });

      try {
        const newToken = await refreshPromise;
        console.log("✅ Token refreshed → retrying original request…");
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        console.error("❌ Refresh failed:", refreshErr);

        // Clean tokens BEFORE logout (PREVENT LOOP)
        await AuthStorage.removeToken();
        await AuthStorage.removeRefreshToken();

        const { logoutFromClient } = await import("../auth/useAuth");
        await logoutFromClient(true);
        return Promise.reject(refreshErr);
      }
    }

    // --------------------------------------------------------
    // 5) Default API errors
    // --------------------------------------------------------
    return Promise.reject({
      status: status || 500,
      reason: "API Error",
      detail: error.response?.data || error.message,
    });
  }
);



export default apiClient;
