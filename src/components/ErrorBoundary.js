import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DESIGN from '../theme';
import logger from '../utility/logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    
    if (__DEV__) {
      logger.error('ErrorBoundary caught an error:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        retryCount: this.state.retryCount
      });
    }

    // Report error for analytics
    this.reportError(error, errorInfo);
  }

  reportError = (error, errorInfo) => {
    // TODO: Integrate with error reporting service
    if (__DEV__) {
      logger.error('[ERROR_REPORT]', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        retryCount: this.state.retryCount
      });
    }
  };

  handleRetry = () => {
    const { retryCount } = this.state;
    const maxRetries = this.props.maxRetries || 3;

    if (retryCount < maxRetries) {
      this.setState({ 
        hasError: false, 
        error: null, 
        errorInfo: null,
        retryCount: retryCount + 1 
      });
    } else {
      // Max retries reached, show permanent error
      this.setState({ 
        hasError: true,
        retryCount: retryCount + 1 
      });
    }
  };

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0 
    });
  };

  render() {
    const { hasError, error, retryCount } = this.state;
    const { 
      children, 
      fallback: FallbackComponent,
      onError,
      maxRetries = 3,
      showRetry = true,
      showReset = true
    } = this.props;

    if (hasError) {
      // Call custom error handler if provided
      if (onError) {
        onError(error, this.state.errorInfo);
      }

      // Use custom fallback component if provided
      if (FallbackComponent) {
        return (
          <FallbackComponent 
            error={error}
            retryCount={retryCount}
            maxRetries={maxRetries}
            onRetry={this.handleRetry}
            onReset={this.handleReset}
          />
        );
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={64}
              color={DESIGN.colors.error}
            />
          </View>
          
          <Text style={styles.title}>
            {retryCount >= maxRetries ? 'Something went wrong' : 'Oops! Something went wrong'}
          </Text>
          
          <Text style={styles.message}>
            {retryCount >= maxRetries 
              ? 'We\'re having trouble loading this content. Please try again later.'
              : 'We encountered an unexpected error. Please try again.'
            }
          </Text>

          {__DEV__ && error && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>Debug Info:</Text>
              <Text style={styles.debugText}>{error.message}</Text>
              <Text style={styles.debugText}>Retry: {retryCount}/{maxRetries}</Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            {showRetry && retryCount < maxRetries && (
              <TouchableOpacity
                style={styles.retryButton}
                onPress={this.handleRetry}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="refresh"
                  size={20}
                  color={DESIGN.colors.surface}
                />
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            )}

            {showReset && (
              <TouchableOpacity
                style={styles.resetButton}
                onPress={this.handleReset}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="restore"
                  size={20}
                  color={DESIGN.colors.primary}
                />
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }

    return children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DESIGN.spacing.lg,
    backgroundColor: DESIGN.colors.background,
  },
  iconContainer: {
    marginBottom: DESIGN.spacing.lg,
  },
  title: {
    ...DESIGN.typography.heading,
    color: DESIGN.colors.textPrimary,
    textAlign: 'center',
    marginBottom: DESIGN.spacing.sm,
  },
  message: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: DESIGN.spacing.lg,
  },
  debugContainer: {
    backgroundColor: DESIGN.colors.surfaceElevated,
    padding: DESIGN.spacing.md,
    borderRadius: DESIGN.borderRadius.sm,
    marginBottom: DESIGN.spacing.lg,
    width: '100%',
  },
  debugTitle: {
    ...DESIGN.typography.caption,
    color: DESIGN.colors.error,
    fontWeight: 'bold',
    marginBottom: DESIGN.spacing.xs,
  },
  debugText: {
    ...DESIGN.typography.small,
    color: DESIGN.colors.textSecondary,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: DESIGN.spacing.md,
  },
  retryButton: {
    backgroundColor: DESIGN.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DESIGN.spacing.lg,
    paddingVertical: DESIGN.spacing.md,
    borderRadius: DESIGN.borderRadius.md,
    minWidth: 120,
    justifyContent: 'center',
  },
  retryButtonText: {
    ...DESIGN.typography.subtitle,
    color: DESIGN.colors.surface,
    marginLeft: DESIGN.spacing.xs,
  },
  resetButton: {
    backgroundColor: DESIGN.colors.surface,
    borderWidth: 1,
    borderColor: DESIGN.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DESIGN.spacing.lg,
    paddingVertical: DESIGN.spacing.md,
    borderRadius: DESIGN.borderRadius.md,
    minWidth: 120,
    justifyContent: 'center',
  },
  resetButtonText: {
    ...DESIGN.typography.subtitle,
    color: DESIGN.colors.primary,
    marginLeft: DESIGN.spacing.xs,
  },
});

export default ErrorBoundary;
