import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ReactQueryWrapper from './ReactQueryWrapper';
import DESIGN from '../theme';

// Error Boundary for individual screens
class ScreenErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (__DEV__) {
      console.error('Screen ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            Please try again or restart the app
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

// Screen wrapper with error boundary and React Query
const ScreenWrapper = ({ children }) => {
  return (
    <ScreenErrorBoundary>
      <ReactQueryWrapper>
        {children}
      </ReactQueryWrapper>
    </ScreenErrorBoundary>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DESIGN.spacing.lg,
    backgroundColor: DESIGN.colors.background,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DESIGN.colors.textPrimary,
    marginBottom: DESIGN.spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: DESIGN.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ScreenWrapper;
