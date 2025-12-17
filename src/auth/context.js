// src/auth/context.js
import React from "react";

const authContext = React.createContext({
  user: null,
  setUser: () => { },
  username: null,
  setUsername: () => { },
});

export default authContext;
