import { useContext } from "react";
import logoutApi from "../api/logout"
import authContext from "./context";
import authStorage from "./storage"
import AsyncStorage from "@react-native-async-storage/async-storage";
import showToast from "../utility/showToast";
import logger from "../utility/logger";

const useAuth = () => {
  const { user, setUser } = useContext(authContext);

  const logIn = async (authToken) => {
    try {
      setUser(authToken);
      await authStorage.storeToken(authToken);
    } catch (error) {
      logger.error("Login failed to decode or store token:", error);
    }
  };

  const logOut = async () => {
    try {
      if (__DEV__) {
        console.log("logOut function called");
      }
      
      const token = await authStorage.getUser();

      logger.log("Logging out user:", token);

      if (!token) {
        logger.warn("No token found. User already logged out.");
        return { success: true }; // Return success even if no token
      }

      if (__DEV__) {
        console.log("Calling logout API...");
      }
      
      await logoutApi.logoutAction();

      if (__DEV__) {
        console.log("Logout API completed, clearing local data...");
      }

      // Clear all data first
      await authStorage.removeToken();
      await AsyncStorage.clear();
      
      // Set user to null to trigger auth context change
      // This will automatically trigger the App.js useEffect to navigate to Login
      setUser(null);
      
      showToast.success(
        "Logout successful",
        "You have been logged out successfully."
      );
      logger.log("Logout successful and storage cleared.");
      return { success: true };
    } catch (error) {
      if (__DEV__) {
        console.error("Logout error in useAuth:", error);
      }
      showToast.error("Logout failed", "An error occurred while logging out.");
      return { success: false, error };
    }
  };

  return { user, logIn, logOut };
};

export default useAuth;
