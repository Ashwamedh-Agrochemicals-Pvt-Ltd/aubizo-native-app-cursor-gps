// ============================================
// FILE 2: storage.js
// Location: src/auth/storage.js
// ============================================


import * as secureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import logger from "../utility/logger";
import { jwtDecode } from "jwt-decode";


const ACCESS_TOKEN_KEY = "authToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USERNAME_KEY = "username";
const PERMISSIONS_KEY = "userPermissions";


// ✅ Store access token
const storeToken = async (authToken) => {
  try {
    if (!authToken) {
      logger.warn("⚠️ Attempted to store null/undefined token");
      return false;
    }


    // Check token size (SecureStore has limits: ~2KB on iOS)
    const tokenSize = new Blob([authToken]).size;
    if (tokenSize > 2000) {
      logger.warn(
        `⚠️ Token size (${tokenSize} bytes) approaching SecureStore limit`
      );
    }


    await secureStore.setItemAsync(ACCESS_TOKEN_KEY, authToken);
    logger.log("✅ Access token stored");
    return true;
  } catch (error) {
    logger.error("❌ Error storing access token:", error);
    // Attempt to clear corrupted data
    try {
      await secureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    } catch (clearError) {
      logger.error("Failed to clear corrupted token", clearError);
    }
    return false;
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
    if (!token) {
      logger.log("ℹ️ No access token found in storage");
      return null;
    }
    return token.replace(/"/g, "");
  } catch (error) {
    logger.error("❌ Error getting access token:", error);


    // If SecureStore is corrupted, clear it
    if (
      error.message?.includes("decrypt") ||
      error.message?.includes("parse")
    ) {
      logger.warn("⚠️ Corrupted token detected, clearing storage");
      try {
        await secureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      } catch (clearError) {
        logger.error("Failed to clear corrupted token", clearError);
      }
    }


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
      logger.log(
        `⏰ Token expires in ${timeUntilExpiry}s (${minutesLeft}m ${secondsLeft}s) - needs refresh`
      );
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


// ========================================
// 🔄 MIGRATION: Move permissions from SecureStore to AsyncStorage
// ========================================
const migratePermissionsToAsync = async () => {
  try {
    // Check if permissions exist in SecureStore (old location)
    const oldPermissions = await secureStore.getItemAsync(PERMISSIONS_KEY);


    if (oldPermissions) {
      logger.log(
        "🔄 Migrating permissions from SecureStore to AsyncStorage..."
      );


      // Save to AsyncStorage
      await AsyncStorage.setItem(PERMISSIONS_KEY, oldPermissions);


      // Remove from SecureStore
      await secureStore.deleteItemAsync(PERMISSIONS_KEY);


      logger.log("✅ Permissions migrated successfully");
      return true;
    }
  } catch (error) {
    logger.error("⚠️ Permission migration failed (non-critical):", error);
    // Non-critical error - permissions will be re-fetched from API
  }
  return false;
};


// ========================================
// 📦 PERMISSIONS STORAGE (AsyncStorage for large data)
// ========================================


// Store permissions in AsyncStorage (handles large JSON data)
const storePermissions = async (permissions) => {
  try {
    if (!permissions) {
      logger.warn("⚠️ Attempted to store null/undefined permissions");
      return false;
    }


    const permissionsString = JSON.stringify(permissions);
    const size = new Blob([permissionsString]).size;


    logger.log(`📦 Storing permissions (${size} bytes) in AsyncStorage`);


    await AsyncStorage.setItem(PERMISSIONS_KEY, permissionsString);
    logger.log("✅ Permissions stored successfully");
    return true;
  } catch (error) {
    logger.error("❌ Error storing permissions:", error);


    // Attempt to clear corrupted data
    try {
      await AsyncStorage.removeItem(PERMISSIONS_KEY);
    } catch (clearError) {
      logger.error("Failed to clear corrupted permissions", clearError);
    }
    return false;
  }
};


// Get permissions from AsyncStorage with migration fallback
const getPermissions = async () => {
  try {
    // First, try to get from AsyncStorage (new location)
    let permissions = await AsyncStorage.getItem(PERMISSIONS_KEY);


    // If not found, try migration from SecureStore (old location)
    if (!permissions) {
      const migrated = await migratePermissionsToAsync();
      if (migrated) {
        permissions = await AsyncStorage.getItem(PERMISSIONS_KEY);
      }
    }


    if (!permissions) {
      logger.log("ℹ️ No permissions found in storage");
      return null;
    }


    const parsed = JSON.parse(permissions);
    logger.log("✅ Permissions loaded from storage");
    return parsed;
  } catch (error) {
    logger.error("❌ Error getting permissions:", error);


    // If parsing fails, clear corrupted data
    if (error instanceof SyntaxError) {
      logger.warn("⚠️ Corrupted permissions detected, clearing storage");
      try {
        await AsyncStorage.removeItem(PERMISSIONS_KEY);
      } catch (clearError) {
        logger.error("Failed to clear corrupted permissions", clearError);
      }
    }


    return null;
  }
};


// Remove permissions from AsyncStorage
const removePermissions = async () => {
  try {
    await AsyncStorage.removeItem(PERMISSIONS_KEY);


    // Also clean up from SecureStore if it exists (migration cleanup)
    try {
      await secureStore.deleteItemAsync(PERMISSIONS_KEY);
    } catch (e) {
      // Ignore if not found
    }


    logger.log("✅ Permissions removed");
    return true;
  } catch (error) {
    logger.error("❌ Error removing permissions:", error);
    return false;
  }
};


// ✅ Clear all secure auth data
const clearAll = async () => {
  try {
    logger.log("🧹 Clearing all auth data...");


    // Clear SecureStore items
    await removeToken();
    await removeRefreshToken();


    try {
      await secureStore.deleteItemAsync(USERNAME_KEY);
    } catch (e) {
      logger.warn("Username already cleared or not found");
    }


    // Clear AsyncStorage items (permissions)
    await removePermissions();


    logger.log("✅ All auth data cleared successfully");
    return true;
  } catch (error) {
    logger.error("❌ Error clearing auth data:", error);


    // Even if clearing fails, ensure we remove as much as possible
    try {
      await AsyncStorage.multiRemove([PERMISSIONS_KEY]);
      await secureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await secureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (forceClearError) {
      logger.error("Failed to force clear storage", forceClearError);
    }


    return false;
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
  migratePermissionsToAsync,
};



