import apiClient from "./client";
import logger from "../utility/logger";


const logoutAction = async () => {
    try {
        const response = await apiClient.post('auth/logout/', null);
        return response;
        
    } catch (error) {
        logger.error("Logout error:", error);
        throw error; // Re-throw the error so it can be handled by the calling function
    }
};
export default {
    logoutAction,
}

