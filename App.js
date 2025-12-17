// Core React & React Native
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View, Text, BackHandler, AppState } from "react-native";

// Navigation
import { NavigationContainer } from "@react-navigation/native";

// External Libraries
import Toast from "react-native-toast-message";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableScreens } from 'react-native-screens';
import * as SplashScreen from "expo-splash-screen";
import * as Sentry from '@sentry/react-native';

// App Components & Navigation
import AuthContext from "./src/auth/context";
import OfflineNotice from "./src/components/OfflineNotice";
import AppNavigation from "./navigation/AppNavigation";
import AuthNavigator from "./navigation/AuthNavigator";
import { navigation } from "./navigation/NavigationService";
import GenericSettingsModal from "./src/components/GenericSettingsModal";
import { PermissionsProvider, usePermissionsContext } from "./src/contexts/PermissionsContext";

// Utilities & Hooks
import location from "./src/utility/location";
import authStorage from "./src/auth/storage";
import useDeviceRestrictions from "./src/hooks/useDeviceRestrictions";
import showToast from "./src/utility/showToast";
import { setGlobalUserSetter } from "./src/auth/useAuth";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from "react-native-keyboard-controller";
import { StatusBar } from "react-native";


// ================================================================
// APP CONFIGURATION
// ================================================================

// Initialize Sentry for error tracking
if (!__DEV__) {
  Sentry.init({
    dsn: 'https://bba03d2bf58eed642001145c9997d48a@o4509722116882432.ingest.de.sentry.io/4510101474181200',
    sendDefaultPii: true,
    enableLogs: false,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    integrations: [
      Sentry.mobileReplayIntegration(),
      Sentry.feedbackIntegration()
    ],
  });
}

// Enable react-native-screens for better performance
enableScreens();

// Disable console logs in production
if (!__DEV__) {
  console.log = () => { };
  console.warn = () => { };
  console.error = () => { };
}

// Configure splash screen
SplashScreen.setOptions({ duration: 1000, fade: true });

// ================================================================
// ERROR BOUNDARY COMPONENT
// ================================================================

/**
 * Error Boundary to catch and handle React component errors
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (__DEV__) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
    // Report to Sentry in production
    Sentry.captureException(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.title}>Something went wrong</Text>
          <Text style={errorStyles.message}>Please restart the app</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

// Error boundary styles
const errorStyles = {
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FAFAFA",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
    color: "#1A1A1A",
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    color: "#666666",
  },
};

// ================================================================
// MAIN APP COMPONENT (INNER)
// ================================================================

/**
 * AppContent Component
 * Handles authentication, device restrictions, and coordination of permission loading
 * This component uses PermissionsContext
 */
function AppContent() {
  // App state
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);

  // Permissions context for coordinating permission loading at app level
  const { loadPermissions, clearPermissions, error: permissionError } = usePermissionsContext();

  // Device restrictions hook
  const {
    modalVisible,
    modalType,
    setModalVisible,
    checkRestrictions,
    openSettings
  } = useDeviceRestrictions();

  // Back press handling
  const backPressCount = useRef(0);

  // AppState for background/foreground detection
  const appState = useRef(AppState.currentState);

  /**
   * Handle Android hardware back button
   * Double tap to exit on Dashboard screen
   */
  useEffect(() => {
    const handleBackPress = () => {
      const currentRoute = navigation.current?.getCurrentRoute()?.name;

      if (currentRoute === 'Dashboard') {
        if (backPressCount.current === 0) {
          backPressCount.current = 1;
          showToast.show("Press back again to exit");
          setTimeout(() => (backPressCount.current = 0), 2000);
          return true;
        } else if (backPressCount.current === 1) {
          BackHandler.exitApp();
        }
      }

      return false; // Allow default back behavior for other screens
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, []);

  /**
   * Monitor AppState changes to validate tokens when app comes to foreground
   * Critical for preventing white screens after app has been in background
   */
  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      // App is coming to foreground from background
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        if (__DEV__) console.log('🔄 App came to foreground, validating tokens...');

        if (user) {
          try {
            // Check if tokens are still valid
            const accessToken = await authStorage.getToken();
            const refreshToken = await authStorage.getRefreshToken();

            if (!accessToken || !refreshToken) {
              if (__DEV__) console.warn('⚠️ Missing tokens, logging out...');
              showToast.error('Session expired', 'Please login again');
              await authStorage.clearAll();
              setUser(null);
              clearPermissions();
              return;
            }

            // Check if refresh token is ACTUALLY expired (no buffer)
            const isRefreshExpired = authStorage.isRefreshTokenExpired(refreshToken);
            if (isRefreshExpired) {
              if (__DEV__) console.warn('⚠️ Refresh token expired, logging out...');
              showToast.error('Session expired', 'Please login again');
              await authStorage.clearAll();
              setUser(null);
              clearPermissions();
              return;
            }

            if (__DEV__) console.log('✅ Tokens validated successfully');
          } catch (error) {
            if (__DEV__) console.error('❌ Token validation failed:', error);
            Sentry.captureException(error);
          }
        }
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [user, clearPermissions]);

  /**
   * Initialize app on startup
   * Coordinates: token loading → validation → device restrictions → permission loading → ready
   * 
   * This ensures:
   * 1. User is authenticated before loading permissions
   * 2. Expired tokens are cleared immediately
   * 3. Navigation doesn't mount until permissions are loaded
   * 4. No blank screens during permission initialization
   */
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Step 1: Load and validate authentication tokens
        await loadAndValidateToken();
        setGlobalUserSetter(setUser);

        // Step 2: Check device restrictions
        await checkRestrictions();

        // Step 3: Request location permission in background (non-blocking)
        location.getStrictLocation().catch((error) => {
          if (__DEV__) console.warn("Background location request failed:", error);
        });
      } catch (error) {
        if (__DEV__) console.error("App initialization failed:", error);
        Sentry.captureException(error);
      } finally {
        setIsReady(true);
        setIsHydrating(false);
      }
    };

    initializeApp();
  }, [checkRestrictions]);

  /**
   * Load permissions when user changes
   * Called after user token is loaded, before navigation renders
   * Note: loadPermissions and clearPermissions are wrapped in useCallback in PermissionsContext,
   * maintaining referential equality across renders
   */
  useEffect(() => {
    if (user) {
      // User just logged in or app started with existing token
      loadPermissions();
    } else {
      // User logged out
      clearPermissions();
    }
  }, [user]);

  /**
   * Monitor permission loading errors
   * If UNAUTHORIZED error occurs, logout user to prevent white screen
   */
  useEffect(() => {
    if (permissionError === 'UNAUTHORIZED' && user) {
      if (__DEV__) console.warn('⚠️ UNAUTHORIZED error detected, logging out user...');
      setUser(null);
    }
  }, [permissionError, user]);

  /**
   * Load and validate authentication tokens from storage
   * Clears tokens if they are expired to prevent white screen
   */
  const loadAndValidateToken = async () => {
    try {
      const accessToken = await authStorage.getToken();
      const refreshToken = await authStorage.getRefreshToken();

      // If no tokens exist, user needs to login
      if (!accessToken || !refreshToken) {
        if (__DEV__) console.log('ℹ️ No stored tokens found');
        return;
      }

      // Check if refresh token is ACTUALLY expired (no buffer)
      const isRefreshExpired = authStorage.isRefreshTokenExpired(refreshToken);

      if (isRefreshExpired) {
        if (__DEV__) console.warn('⚠️ Stored refresh token is expired, clearing...');
        await authStorage.clearAll();
        return;
      }

      // Tokens are valid, set user
      if (__DEV__) console.log('✅ Valid tokens found, user authenticated');
      setUser(accessToken);

      // ✅ Load username separately
      const storedUsername = await authStorage.getUsername();
      if (storedUsername) {
        setUsername(storedUsername);
        if (__DEV__) console.log("Username loaded:", storedUsername);
      }

    } catch (error) {
      if (__DEV__) console.error("Failed to load/validate tokens:", error);
      Sentry.captureException(error);
      // Clear potentially corrupted tokens
      await authStorage.clearAll().catch(() => { });
    }
  };

  // Show loading screen while app initializes
  if (!isReady) {
    return (
      <View style={loadingStyles.container}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={loadingStyles.text}>Initializing...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
      <SafeAreaProvider>
        <ErrorBoundary>
          <OfflineNotice />
          <AuthContext.Provider value={{ user, setUser, username, setUsername, isHydrating }}>
            <NavigationContainer ref={navigation}>
              {/* <KeyboardProvider statusBarTranslucent={false}> */}
              {user ? <AppNavigation /> : <AuthNavigator />}
              {/* </KeyboardProvider> */}
            </NavigationContainer>
          </AuthContext.Provider>
          {/* Device Restrictions Modal */}
          {modalVisible && (
            <GenericSettingsModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              title={modalType === "developer" ? "Developer Mode Detected" : "Location Disabled"}
              message={
                modalType === "developer"
                  ? "Your device is in Developer Mode. Disable it to continue."
                  : "Location is turned off. Enable location services to continue."
              }
              primaryText="Open Settings"
              onPrimaryPress={openSettings}
              secondaryText="Will do it later"
            />
          )}

          {/* Global Toast Notifications */}
          <Toast />
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>

  );
}

/**
 * Outer App Component
 * Wraps AppContent with PermissionsProvider for app-level permission management
 */
function App() {
  return (
    <PermissionsProvider>
      <AppContent />
    </PermissionsProvider>
  );
}

// Loading screen styles
const loadingStyles = {
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
  },
};

// Export with Sentry error tracking
export default Sentry.wrap(App);