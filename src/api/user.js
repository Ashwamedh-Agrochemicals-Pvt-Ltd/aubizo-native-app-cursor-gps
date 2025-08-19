import apiClient from "./client";

const register = (userInfo) => {
   return apiClient.post("auth/register/",userInfo)
};
export default {
    register,
}