import * as secureStore from "expo-secure-store";
import logger from "../utility/logger";

const key = "authToken";
const USERNAME_KEY = "username";
const PERMISSIONS_KEY = "userPermissions";

const storeToken = async (authToken) => {
    try {
        await secureStore.setItemAsync(key, authToken);
    } catch (error) {
        logger.error("Error storing the auth token:", error);
    }
};

const getToken = async () => {
    try {
        const token = await secureStore.getItemAsync(key);
        return token;
    } catch (error) {
        logger.error("Error getting the auth token:", error);
        return null;
    }
};

const getUser = async () => {
    try {
        const partialToken = await getToken();

        if (!partialToken) {
            logger.warn("Token not found in storage");
            return null;
        }

        const token = partialToken.replace(/"/g, "");
        return token;
    } catch (error) {
        logger.error("Error decoding the auth token:", error);
        return null;
    }
};

const removeToken = async () => {
    try {
        await secureStore.deleteItemAsync(key);
    } catch (error) {
        logger.error("Error removing the auth token:", error);
    }
};

const saveUsername = async (username) => {
    try {
        await secureStore.setItemAsync(USERNAME_KEY, username);
    } catch (error) {
        console.error("Error saving username:", error);
    }
};

const getUsername = async () => {
    try {
        return await secureStore.getItemAsync(USERNAME_KEY);
    } catch (error) {
        console.error("Error getting username:", error);
        return null;
    }
};

const storePermissions = async (permissions) => {
    try {
        await secureStore.setItemAsync(PERMISSIONS_KEY, JSON.stringify(permissions));
    } catch (error) {
        logger.error("Error storing permissions:", error);
    }
};

const getPermissions = async () => {
    try {
        const permissions = await secureStore.getItemAsync(PERMISSIONS_KEY);
        return permissions ? JSON.parse(permissions) : null;
    } catch (error) {
        logger.error("Error getting permissions:", error);
        return null;
    }
};

const removePermissions = async () => {
    try {
        await secureStore.deleteItemAsync(PERMISSIONS_KEY);
    } catch (error) {
        logger.error("Error removing permissions:", error);
    }
};

const clearAll = async () => {
    try {
        await removeToken();
        await secureStore.deleteItemAsync(USERNAME_KEY);
        await removePermissions();
    } catch (error) {
        logger.error("Error clearing all auth data:", error);
    }
};

export default {
    storeToken,
    getToken,
    getUser,
    removeToken,
    saveUsername,
    getUsername,
    storePermissions,
    getPermissions,
    removePermissions,
    clearAll,
};
