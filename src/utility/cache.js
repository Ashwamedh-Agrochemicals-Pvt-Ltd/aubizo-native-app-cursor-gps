import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import logger from "./logger";

const prefix = "cache";

const store = async (key, value) => {
  const item = {
    value,
    timeStamp: Date.now(),
  };

  try {
    await AsyncStorage.setItem(prefix + key, JSON.stringify(item));
  } catch (error) {
    logger.log("Error storing cache:", error);
  }
};

const isExpired = (item) => {
  const now = moment(Date.now());
  const storedTime = moment(item.timeStamp);
  return now.diff(storedTime, "minutes") > 60; // 1 hour expiration
};

const get = async (key) => {
  try {
    const value = await AsyncStorage.getItem(prefix + key);
    const item = JSON.parse(value);

    if (!item) return null;

    if (isExpired(item)) {
      await AsyncStorage.removeItem(prefix + key);
      return null;
    }

    return item.value; 
  } catch (error) {
    logger.log("Error getting cache:", error);
    return null;
  }
};

export default {
  store,
  get,
};
