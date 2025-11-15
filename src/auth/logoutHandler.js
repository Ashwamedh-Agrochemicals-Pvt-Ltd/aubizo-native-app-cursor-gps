// ============================================
// FILE: logoutHandler.js
// ============================================

import authStorage from "./storage";
import showToast from "../utility/showToast";
import logger from "../utility/logger";
import apiClient from "../api/client";

let isLoggingOut = false;

export const handleLogout = async (setUser) => {
    if (isLoggingOut) {
        logger.log("⏸️ Logout already in progress, skipping...");
        return { success: true };
    }

    isLoggingOut = true;

    let wasExpiredLogout = false;

    try {
        const refreshToken = await authStorage.getRefreshToken();
        logger.log("🚪 Logging out user...");

        if (refreshToken) {
            try {
                const isExpired = authStorage.isTokenExpired(refreshToken);

                if (!isExpired) {

                    await apiClient.post("auth/logout/", { refresh: refreshToken });
                    logger.log("✅ Refresh token blacklisted on server");
                } else {
                    // ✅ Token expired → auto logout scenario
                    wasExpiredLogout = true;
                    logger.warn("⚠️ Refresh token expired, skipping logout API call");
                }
            } catch (apiError) {
                const backendError = apiError?.response?.data || apiError?.message;
                logger.warn("⚠️ Logout API failed, continuing cleanup:", backendError);
            }
        }


        await authStorage.clearAll();
        if (setUser) setUser(null);


        if (wasExpiredLogout) {
            showToast.error("Session expired", "Please login again.");
            logger.log("🔐 Logged out due to expired session.");
        } else {
            showToast.success('Logged out successfully', 'Goodbye!');
            logger.log("✅ Logged out successfully.");
        }

        return { success: true };

    } catch (error) {
        showToast.error("Logout failed", "Something went wrong while logging out.");
        logger.error("❌ Logout error:", error);
        return { success: false, error };

    } finally {
        isLoggingOut = false;
    }
};
