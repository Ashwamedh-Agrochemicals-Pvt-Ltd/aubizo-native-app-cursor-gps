import AsyncStorage from "@react-native-async-storage/async-storage";
import logger from "./logger";

const storage = {
  async get(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      return value !== null ? value : null;
    } catch (error) {
      logger.log(`Getting Error ${key}`, error);
      return null;
    }
  },
  async set(key, value) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      logger.log(`Error setting ${key}`, error);
    }
  },
  async remove(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      logger.log(`Error Removing ${key}`, error);
    }
  },

  async multiRemove(keys) {
    try {
      if (!Array.isArray(keys)) {
        throw new Error("Keys must be provided as an array of strings.");
      }
      await AsyncStorage.multiRemove(keys);
      logger.log("Keys removed successfully:", keys);
    } catch (error) {
      logger.log("Error removing multiple keys:", error);
    }
  },

  async getAllKeys() {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      logger.error("Storage GetAllKeys Error:", error);
      return [];
    }
  },
};
export default storage;
