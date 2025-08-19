import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Set item with expiry
 * @param {string} key
 * @param {any} value
 * @param {number} ttl - time to live in milliseconds
 */
export const setItemWithExpiry = async (key, value, ttl) => {
  try {
    const item = {
      value,
      expiry: Date.now() + ttl, // timestamp when it should expire
    };
    await AsyncStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error('Error setting item with expiry:', error);
  }
};

/**
 * Get item and check expiry
 * @param {string} key
 * @returns {any|null}
 */
export const getItemWithExpiry = async (key) => {
  try {
    const itemStr = await AsyncStorage.getItem(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);

    // Check expiry
    if (Date.now() > item.expiry) {
      await AsyncStorage.removeItem(key);
      return null;
    }

    return item.value;
  } catch (error) {
    console.error('Error getting item with expiry:', error);
    return null;
  }
};

/**
 * Remove expired keys automatically (optional cleanup)
 */
export const cleanExpiredItems = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const now = Date.now();

    for (const key of keys) {
      const itemStr = await AsyncStorage.getItem(key);
      if (!itemStr) continue;

      const item = JSON.parse(itemStr);
      if (item.expiry && now > item.expiry) {
        await AsyncStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error('Error cleaning expired items:', error);
  }
};
