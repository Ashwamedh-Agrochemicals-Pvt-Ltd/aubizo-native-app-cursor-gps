// Core React & React Native
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View, Text, BackHandler } from "react-native";

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

// Utilities & Hooks
import location from "./src/utility/location";
import authStorage from "./src/auth/storage";
import useDeviceRestrictions from "./src/hooks/useDeviceRestrictions";
import showToast from "./src/utility/showToast";
import { setGlobalUserSetter } from "./src/auth/useAuth";

// ================================================================
// APP CONFIGURATION
// ================================================================

// Initialize Sentry for error tracking
Sentry.init({
  dsn: 'https://bba03d2bf58eed642001145c9997d48a@o4509722116882432.ingest.de.sentry.io/4510101474181200',
  sendDefaultPii: true,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.mobileReplayIntegration(), 
    Sentry.feedbackIntegration()
  ],
});

// Enable react-native-screens for better performance
enableScreens();

// Disable console logs in production
if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
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
// MAIN APP COMPONENT
// ================================================================

/**
 * Main App Component
 * Handles authentication, device restrictions, and navigation setup
 */
function App() {
  // App state
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  
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
   * Initialize app on startup
   * Load authentication token, setup location, check device restrictions
   */
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await loadToken();
        setGlobalUserSetter(setUser);
        await location.getStrictLocation();
        await checkRestrictions();
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
   * Load authentication token from storage
   */
  const loadToken = async () => {
    try {
      const token = await authStorage.getUser();
      if (token) setUser(token);
    } catch (error) {
      if (__DEV__) console.error("Failed to load authentication token:", error);
      Sentry.captureException(error);
    }
  };

  // Show loading screen while app initializes
  if (!isReady) {
    return (
      <View style={loadingStyles.container}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <OfflineNotice />
        <AuthContext.Provider value={{ user, setUser, isHydrating }}>
          <NavigationContainer ref={navigation}>
            {user ? <AppNavigation /> : <AuthNavigator />}
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
};

// Export with Sentry error tracking
export default Sentry.wrap(App);