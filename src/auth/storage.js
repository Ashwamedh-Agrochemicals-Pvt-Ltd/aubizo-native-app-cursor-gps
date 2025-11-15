// ============================================
// FILE 2: storage.js
// Location: src/auth/storage.js
// ============================================

import * as secureStore from "expo-secure-store";
import logger from "../utility/logger";
import { jwtDecode } from "jwt-decode";

const ACCESS_TOKEN_KEY = "authToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USERNAME_KEY = "username";
const PERMISSIONS_KEY = "userPermissions";

// ✅ Store access token
const storeToken = async (authToken) => {
    try {
        await secureStore.setItemAsync(ACCESS_TOKEN_KEY, authToken);
        logger.log("✅ Access token stored");
    } catch (error) {
        logger.error("❌ Error storing access token:", error);
    }
};

// ✅ Store refresh token
const storeRefreshToken = async (refreshToken) => {
    try {
        await secureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
        logger.log("✅ Refresh token stored");
    } catch (error) {
        logger.error("❌ Error storing refresh token:", error);
    }
};

// ✅ Get access token
const getToken = async () => {
    try {
        const token = await secureStore.getItemAsync(ACCESS_TOKEN_KEY);
        return token ? token.replace(/"/g, "") : null;
    } catch (error) {
        logger.error("❌ Error getting access token:", error);
        return null;
    }
};

// ✅ Get refresh token
const getRefreshToken = async () => {
    try {
        const token = await secureStore.getItemAsync(REFRESH_TOKEN_KEY);
        return token ? token.replace(/"/g, "") : null;
    } catch (error) {
        logger.error("❌ Error getting refresh token:", error);
        return null;
    }
};

// ✅ Decode token info (for debugging/logging)
const getTokenInfo = (token) => {
    try {
        if (!token) return null;

        const decoded = jwtDecode(token);
        const currentTime = Math.floor(Date.now() / 1000);

        return {
            userId: decoded.user_id,
            tokenType: decoded.token_type,
            expiresAt: new Date(decoded.exp * 1000),
            issuedAt: new Date(decoded.iat * 1000),
            timeUntilExpiry: decoded.exp - currentTime,
        };
    } catch (error) {
        logger.error("❌ Error decoding token:", error);
        return null;
    }
};

// ✅ Return token as "user" (actual decoding handled elsewhere)
const getUser = async () => {
    try {
        const token = await getToken();
        if (!token) return null;
        return token;
    } catch (error) {
        logger.error("❌ Error getting user:", error);
        return null;
    }
};

const isTokenExpired = (token) => {
    try {
        if (!token) {
            logger.log("⚠️ No token provided");
            return true;
        }

        const decoded = jwtDecode(token);
        const currentTime = Math.floor(Date.now() / 1000);

        // 🎯 Buffer time: Refresh when token has less than 30 seconds left
        // This is critical for 1-minute token expiry to prevent mid-request failures
        const BUFFER_TIME_SECONDS = 30;

        const expiryTime = decoded.exp;
        const timeUntilExpiry = expiryTime - currentTime;
        const isExpired = timeUntilExpiry <= BUFFER_TIME_SECONDS;

        if (isExpired && __DEV__) {
            const minutesLeft = Math.floor(timeUntilExpiry / 60);
            const secondsLeft = timeUntilExpiry % 60;
            logger.log(`⏰ Token expires in ${timeUntilExpiry}s (${minutesLeft}m ${secondsLeft}s) - needs refresh`);
        }

        return isExpired;
    } catch (error) {
        logger.error("❌ Error checking token expiry:", error);
        return true; // Treat as expired if we can't decode
    }
};

// ✅ Remove access token
const removeToken = async () => {
    try {
        await secureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        logger.log("✅ Access token removed");
    } catch (error) {
        logger.error("❌ Error removing access token:", error);
    }
};

// ✅ Remove refresh token
const removeRefreshToken = async () => {
    try {
        await secureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        logger.log("✅ Refresh token removed");
    } catch (error) {
        logger.error("❌ Error removing refresh token:", error);
    }
};

// Optional saved username
const saveUsername = async (username) => {
    try {
        await secureStore.setItemAsync(USERNAME_KEY, username);
    } catch (error) {
        logger.error("❌ Error saving username:", error);
    }
};

const getUsername = async () => {
    try {
        return await secureStore.getItemAsync(USERNAME_KEY);
    } catch (error) {
        logger.error("❌ Error getting username:", error);
        return null;
    }
};

// Optional user permissions
const storePermissions = async (permissions) => {
    try {
        await secureStore.setItemAsync(PERMISSIONS_KEY, JSON.stringify(permissions));
    } catch (error) {
        logger.error("❌ Error storing permissions:", error);
    }
};

const getPermissions = async () => {
    try {
        const permissions = await secureStore.getItemAsync(PERMISSIONS_KEY);
        return permissions ? JSON.parse(permissions) : null;
    } catch (error) {
        logger.error("❌ Error getting permissions:", error);
        return null;
    }
};

const removePermissions = async () => {
    try {
        await secureStore.deleteItemAsync(PERMISSIONS_KEY);
    } catch (error) {
        logger.error("❌ Error removing permissions:", error);
    }
};

// ✅ Clear all secure auth data
const clearAll = async () => {
    try {
        await removeToken();
        await removeRefreshToken();
        await secureStore.deleteItemAsync(USERNAME_KEY);
        await removePermissions();
        logger.log("✅ All auth data cleared");
    } catch (error) {
        logger.error("❌ Error clearing auth data:", error);
    }
};

export default {
    storeToken,
    storeRefreshToken,
    getToken,
    getRefreshToken,
    removeToken,
    isTokenExpired,
    removeRefreshToken,
    getTokenInfo,
    getUser,
    saveUsername,
    getUsername,
    storePermissions,
    getPermissions,
    removePermissions,
    clearAll,
};
