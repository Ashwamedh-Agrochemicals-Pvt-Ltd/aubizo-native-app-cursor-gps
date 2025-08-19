import { Alert } from 'react-native';
import logger from './logger';
import showToast from './showToast';

// Error types for consistent handling
export const ERROR_TYPES = {
  NETWORK: 'NETWORK',
  AUTH: 'AUTH',
  VALIDATION: 'VALIDATION',
  SERVER: 'SERVER',
  TIMEOUT: 'TIMEOUT',
  PERMISSION: 'PERMISSION',
  STORAGE: 'STORAGE',
  UNKNOWN: 'UNKNOWN'
};

// Error messages for consistent user feedback
export const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK]: {
    title: 'Network Error',
    message: 'Please check your internet connection and try again.',
    action: 'Retry'
  },
  [ERROR_TYPES.AUTH]: {
    title: 'Session Expired',
    message: 'Please log in again to continue.',
    action: 'Login'
  },
  [ERROR_TYPES.VALIDATION]: {
    title: 'Validation Error',
    message: 'Please check your input and try again.',
    action: 'Fix'
  },
  [ERROR_TYPES.SERVER]: {
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again later.',
    action: 'Retry'
  },
  [ERROR_TYPES.TIMEOUT]: {
    title: 'Connection Timeout',
    message: 'Request took too long. Please check your connection and try again.',
    action: 'Retry'
  },
  [ERROR_TYPES.PERMISSION]: {
    title: 'Permission Required',
    message: 'This feature requires additional permissions.',
    action: 'Settings'
  },
  [ERROR_TYPES.STORAGE]: {
    title: 'Storage Error',
    message: 'Unable to save data. Please try again.',
    action: 'Retry'
  },
  [ERROR_TYPES.UNKNOWN]: {
    title: 'Unexpected Error',
    message: 'Something went wrong. Please try again.',
    action: 'Retry'
  }
};

// Error classification function
export const classifyError = (error) => {
  if (!error) return ERROR_TYPES.UNKNOWN;

  // Network errors
  if (!error.response) {
    return ERROR_TYPES.NETWORK;
  }

  // HTTP status code classification
  const { status } = error.response;
  
  if (status === 401) {
    return ERROR_TYPES.AUTH;
  }
  
  if (status >= 400 && status < 500) {
    return ERROR_TYPES.VALIDATION;
  }
  
  if (status >= 500) {
    return ERROR_TYPES.SERVER;
  }

  // Timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return ERROR_TYPES.TIMEOUT;
  }

  // Permission errors
  if (error.message?.includes('permission') || error.message?.includes('denied')) {
    return ERROR_TYPES.PERMISSION;
  }

  // Storage errors
  if (error.message?.includes('storage') || error.message?.includes('secure')) {
    return ERROR_TYPES.STORAGE;
  }

  return ERROR_TYPES.UNKNOWN;
};

// Centralized error handler
export const handleError = (error, options = {}) => {
  const {
    showAlert = true,
    showToast = false,
    logError = true,
    context = 'Unknown',
    onError = null,
    retryAction = null
  } = options;

  // Classify the error
  const errorType = classifyError(error);
  const errorInfo = ERROR_MESSAGES[errorType];

  // Log error in development
  if (logError && __DEV__) {
    logger.error(`[${context}] ${errorType} Error:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      stack: error.stack
    });
  }

  // Show user feedback
  if (showAlert) {
    const alertButtons = [
      { text: 'OK', style: 'cancel' }
    ];

    if (retryAction) {
      alertButtons.unshift({
        text: errorInfo.action,
        onPress: retryAction
      });
    }

    Alert.alert(
      errorInfo.title,
      errorInfo.message,
      alertButtons
    );
  }

  if (showToast) {
    showToast.error(errorInfo.message, errorInfo.title);
  }

  // Call custom error handler if provided
  if (onError) {
    onError(error, errorType, errorInfo);
  }

  return {
    type: errorType,
    message: errorInfo.message,
    title: errorInfo.title,
    originalError: error
  };
};

// Specialized error handlers
export const handleAPIError = (error, context = 'API') => {
  return handleError(error, {
    context,
    showAlert: true,
    logError: true
  });
};

export const handleFormError = (error, context = 'Form') => {
  return handleError(error, {
    context,
    showAlert: false,
    showToast: true,
    logError: true
  });
};

export const handleSilentError = (error, context = 'Silent') => {
  return handleError(error, {
    context,
    showAlert: false,
    showToast: false,
    logError: true
  });
};

// Error recovery utilities
export const withErrorHandling = (asyncFunction, options = {}) => {
  return async (...args) => {
    try {
      return await asyncFunction(...args);
    } catch (error) {
      handleError(error, options);
      throw error; // Re-throw for caller to handle if needed
    }
  };
};

export const withRetry = (asyncFunction, maxRetries = 3, delay = 1000) => {
  return async (...args) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await asyncFunction(...args);
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  };
};

// Error reporting (placeholder for future analytics integration)
export const reportError = (error, context = 'Unknown') => {
  if (__DEV__) {
    logger.error(`[REPORT] ${context}:`, error);
  }
  
  // TODO: Integrate with error reporting service (Sentry, Crashlytics, etc.)
  // Example:
  // Sentry.captureException(error, {
  //   tags: { context },
  //   extra: { timestamp: new Date().toISOString() }
  // });
};

export default {
  handleError,
  handleAPIError,
  handleFormError,
  handleSilentError,
  withErrorHandling,
  withRetry,
  reportError,
  classifyError,
  ERROR_TYPES,
  ERROR_MESSAGES
};
