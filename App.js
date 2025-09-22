import React, { useEffect, useRef, useState } from "react";
import { NavigationContainer, CommonActions } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { ActivityIndicator, View, Text, BackHandler } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AuthContext from "./src/auth/context";
import OfflineNotice from "./src/components/OfflineNotice";
import AppNavigation from "./navigation/AppNavigation";
import AuthNavigator from "./navigation/AuthNavigator";
import { navigation } from "./navigation/NavigationService";
import location from "./src/utility/location";
import authStorage from "./src/auth/storage";
import * as SplashScreen from "expo-splash-screen";
import useDeviceRestrictions from "./src/hooks/useDeviceRestrictions";
import GenericSettingsModal from "./src/components/GenericSettingsModal";
import showToast from "./src/utility/showToast";
import { enableScreens } from 'react-native-screens';
enableScreens();




// Disable console logs in production
if (__DEV__ === false) {
  console.log = () => { };
  console.warn = () => { };
  console.error = () => { };
}

// SplashScreen options
SplashScreen.setOptions({ duration: 1000, fade: true });

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (__DEV__) console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <Text style={{ fontSize: 18, marginBottom: 10, textAlign: "center" }}>Something went wrong</Text>
          <Text style={{ fontSize: 14, textAlign: "center", color: "#666" }}>Please restart the app</Text>
        </View>
      );




    }
    return this.props.children;
  }
}

// Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

export default function App() {
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const [isHydrating, setIsHydrating] = useState(true);

  const { modalVisible, modalType, setModalVisible, checkRestrictions, openSettings } = useDeviceRestrictions();


  const backPressCount = useRef(0);

  useEffect(() => {
    const onBackPress = () => {
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

      return false; // allow default back behavior for other screens
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => backHandler.remove();
  }, []);

  // Load token and initial location
  useEffect(() => {
    (async () => {
      try {
        await loadToken();
        await location.getStrictLocation();
        // Wait until restrictions are OK before proceeding
        await checkRestrictions();
      } catch (error) {
        if (__DEV__) console.error("App init failed:", error);
      } finally {
        setIsReady(true);
        setIsHydrating(false);
      }
    })();
  }, []);

  // Load auth token
  const loadToken = async () => {
    try {
      const token = await authStorage.getUser();
      if (token) setUser(token);
    } catch (error) {
      if (__DEV__) console.error("Failed to load token", error);
    }
  };


  // Show loader until app ready
  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (

    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <OfflineNotice />
          <AuthContext.Provider value={{ user, setUser, isHydrating }}>
            <NavigationContainer ref={navigation}>
              {user ? <AppNavigation /> : <AuthNavigator />}
            </NavigationContainer>
          </AuthContext.Provider>

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
          <Toast />
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
