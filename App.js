import React, { useEffect, useState } from "react";
import { NavigationContainer, CommonActions } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { ActivityIndicator, View, Platform, Text } from "react-native";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthContext from "./src/auth/context";
import OfflineNotice from "./src/components/OfflineNotice";
import AppNavigation from "./navigation/AppNavigation";
import AuthNavigator from "./navigation/AuthNavigator";
import { navigation } from "./navigation/NavigationService";
import location from "./src/utility/location";
import authStorage from "./src/auth/storage";
import * as SplashScreen from "expo-splash-screen";
import { checkDeveloperOptions } from "./src/components/checkDeveloperOptions";

// Disable console logs in production
if (__DEV__ === false) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

// Error Boundary Component
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
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ 
          flex: 1, 
          justifyContent: "center", 
          alignItems: "center",
          padding: 20
        }}>
          <Text style={{ fontSize: 18, marginBottom: 10, textAlign: 'center' }}>
            Something went wrong
          </Text>
          <Text style={{ fontSize: 14, textAlign: 'center', color: '#666' }}>
            Please restart the app
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
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

  useEffect(() => {
    (async () => {
      try {
        // ✅ Run Developer Options check before anything else
        if (Platform.OS === "android") {
          await checkDeveloperOptions();
        }

        await loadToken();
        // Only request location permission when needed, not on app start
        // await location.getStrictLocation();
      } catch (error) {
        if (__DEV__) {
          console.error("App init failed:", error);
        }
      } finally {
        setIsReady(true);
        setIsHydrating(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (isReady) {
      if (user) {
        navigation.current?.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Main" }],
          })
        );
      } else {
        navigation.current?.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Login" }],
          })
        );
      }
    }
  }, [user, isReady]);

  const loadToken = async () => {
    try {
      const token = await authStorage.getUser();
      if (token) {
        if (__DEV__) {
          console.log("Token loaded and setting user:", token);
        }
        setUser(token);
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Failed to load token", error);
      }
    }
  };

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
            <NavigationContainer ref={navigation} key={user ? "auth" : "guest"}>
              {user ? <AppNavigation /> : <AuthNavigator />}
            </NavigationContainer>
          </AuthContext.Provider>
          <Toast />
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
