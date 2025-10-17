// auth/logoutHandler.js
import authStorage from "./storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import showToast from "../utility/showToast";
import logger from "../utility/logger";

// Accept a setter (setUser) which will come from global context
export const handleLogout = async (setUser = null) => {
    try {
        const token = await authStorage.getUser();
        logger.log("Logging out user:", token);

        if (!token) {
            logger.warn("No token found. Already logged out.");
            return { success: true };
        }

        await authStorage.clearAll();
        await AsyncStorage.clear();

        if (setUser) setUser(null); // This will update context

        showToast.success("Logout successful", "You have been logged out successfully.");

        logger.log("Logout successful and storage cleared.");

        return { success: true };
    } catch (error) {
        showToast.error("Logout failed", "An error occurred while logging out.");
        logger.error("Logout error:", error);
        return { success: false, error };
    }
};
