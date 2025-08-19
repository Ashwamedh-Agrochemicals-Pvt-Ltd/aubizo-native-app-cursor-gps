// Auth/context.js
import React from 'react';

const authContext = React.createContext({
  user: null,
  setUser: () => {},
  isHydrating: true,
});

export default authContext;