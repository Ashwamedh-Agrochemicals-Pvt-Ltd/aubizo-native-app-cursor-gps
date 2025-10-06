import { useContext } from "react";
import authContext from "./context";
import authStorage from "./storage"
import logger from "../utility/logger";
import { handleLogout } from "./logoutHandler";

let globalSetUser = null;

export const setGlobalUserSetter = (setter) => {
  globalSetUser = setter;
};

// This can be called anywhere, even in client.js
export const logoutFromClient = async () => {
  const { handleLogout } = await import("./logoutHandler");
  await handleLogout(globalSetUser);
  console.log("Logged out from client.js", globalSetUser);
};


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
    return await handleLogout(setUser);
  };

  return { user, logIn, logOut };
};

export default useAuth;
