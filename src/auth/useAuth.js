// ============================================
// FILE: src/auth/useAuth.js
// ============================================

import { useContext } from "react";
import authContext from "./context";
import authStorage from "./storage";
import logger from "../utility/logger";
import { handleLogout } from "./logoutHandler";

// Global reference to setUser (for logout from client.js)
let globalSetUser = null;

/**
 * Set global user setter
 */
export const setGlobalUserSetter = (setter) => {
  globalSetUser = setter;
};

/**
 * Logout from anywhere (client.js, utils, etc.)
 * @param {boolean} isSessionExpired - If true, shows "Session Expired" message
 */
export const logoutFromClient = async (setUser, setUsername, isSessionExpired = false) => {
  logger.log(`🔵 logoutFromClient called with isSessionExpired: ${isSessionExpired}`);

  // Call the handler with both setters
  await handleLogout(setUser, setUsername, isSessionExpired);

  logger.log(`🚪 Logout completed (Session Expired: ${isSessionExpired})`);
};


/**
 * Authentication Hook
 */
const useAuth = () => {
  const { user, setUser, username, setUsername } = useContext(authContext);


  /**
   * Login user and store tokens
   */
  const logIn = async (authToken, refreshToken, name) => {
    try {
      setUser(authToken);
      setUsername(name);
      await authStorage.storeToken(authToken);
      await authStorage.storeRefreshToken(refreshToken);
      await authStorage.saveUsername(name);


      if (__DEV__) {
        const tokenInfo = authStorage.getTokenInfo(authToken);
        logger.log("✅ User logged in");
        logger.log("📅 Token expires:", tokenInfo?.expiresAt);
        logger.log("👤 User ID:", tokenInfo?.userId);
      }
    } catch (error) {
      logger.error("❌ Login failed:", error);
    }
  };

  /**
   * Normal logout (user clicks logout button)
   * Will call backend API to blacklist refresh token
   */
  const logOut = async () => {
    logger.log("🔵 User clicked logout button - calling logoutFromClient(false)");
    return await logoutFromClient(setUser, setUsername, false);
  };


  return { user, username, logIn, logOut, };
};

export default useAuth;