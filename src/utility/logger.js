// Logger utility to handle console logs in production vs development
const logger = {
  log: (...args) => {
    if (__DEV__) {
      console.log(...args);
    }
  },
  
  warn: (...args) => {
    if (__DEV__) {
      console.warn(...args);
    }
  },
  
  error: (...args) => {
    if (__DEV__) {
      console.error(...args);
    }
  },
  
  info: (...args) => {
    if (__DEV__) {
      console.info(...args);
    }
  },
  
  debug: (...args) => {
    if (__DEV__) {
      console.debug(...args);
    }
  }
};

export default logger;
