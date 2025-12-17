// ============================================
// FILE: logoutHandler.js
// ============================================

import authStorage from "./storage";
import showToast from "../utility/showToast";
import logger from "../utility/logger";
import apiClient from "../api/client";

let isLoggingOut = false;

export const handleLogout = async (setUser, setUsername, isSessionExpired = false) => {
    if (isLoggingOut) {
        logger.log("⏸️ Logout already in progress, skipping...");
        return { success: true };
    }

    isLoggingOut = true;

    try {
        const refreshToken = await authStorage.getRefreshToken();
        logger.log("🚪 Logging out user...");

        // Try to blacklist refresh token on backend (if token is valid)
        if (refreshToken) {
            try {
                // Use isRefreshTokenExpired (no buffer) for actual expiry check
                const isExpired = authStorage.isRefreshTokenExpired(refreshToken);

                if (!isExpired) {
                    // Token is still valid, try to blacklist it
                    await apiClient.post("auth/logout/", { refresh: refreshToken });
                    logger.log("✅ Refresh token blacklisted on server");
                } else {
                    // Token expired - already invalid on backend
                    logger.warn("⚠️ Refresh token expired, skipping logout API call");
                }
            } catch (apiError) {
                // Don't fail logout if backend call fails
                const backendError = apiError?.response?.data || apiError?.message;
                logger.warn("⚠️ Logout API failed (non-critical), continuing cleanup:", backendError);
            }
        }

        // Always clear local storage regardless of API success
        await authStorage.clearAll();
        if (setUser) setUser(null);
        if (setUsername) setUsername(null);


        // Show appropriate message
        if (isSessionExpired) {
            showToast.error("Session expired", "Please login again");
            logger.log("🔐 Logged out due to expired session");
        } else {
            showToast.success('Logged out successfully', 'Goodbye!');
            logger.log("✅ Logged out successfully");
        }

        return { success: true };

    } catch (error) {
        // Even if logout fails, try to clear storage
        logger.error("❌ Logout error:", error);

        try {
            await authStorage.clearAll();
            if (setUser) setUser(null);
        } catch (clearError) {
            logger.error("❌ Failed to clear storage during error recovery:", clearError);
        }

        showToast.error("Logout completed", "Please login again");
        return { success: false, error };

    } finally {
        isLoggingOut = false;
    }
};
