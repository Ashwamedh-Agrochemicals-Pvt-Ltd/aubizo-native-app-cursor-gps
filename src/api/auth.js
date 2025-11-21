import apiClient from "./client"

// ===================================
// Login with JWT (default and only method)
// ===================================
const login = (username, password) => {
    return apiClient.post("/auth/login/", {
        username,
        password,
    });
};

// ===================================
// Refresh JWT access token
// ===================================
const refreshToken = (refreshToken) => {
    return apiClient.post("/auth/refresh/", {
        refresh: refreshToken
    });
};

// ===================================
// Logout (blacklist JWT)
// ===================================
const logout = (refreshToken) => {
    if (refreshToken) {
        return apiClient.post("/auth/logout/", { refresh: refreshToken });
    } else {
        return apiClient.post("/auth/logout/", {});
    }
};

export default {
    login,
    refreshToken,
    logout,
};
