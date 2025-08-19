import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform, Keyboard } from "react-native";
import React, { useEffect, useState } from "react";
import { tabNavigatorOptions } from "../src/styles/appNavigation.style";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { lazyLoadScreen } from "../src/utility/performance";

// Disable console logs in production
if (__DEV__ === false) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

// Lazy load screens for better performance
const Dashboard = lazyLoadScreen(() => import("../screens/Dashboard"));
const PaymentScreen = lazyLoadScreen(() => import("../screens/Payments"));
const OrderScreen = lazyLoadScreen(() => import("../screens/Orders"));
const ProductScreen = lazyLoadScreen(() => import("../screens/Pruducts"));
const FarmerScreen = lazyLoadScreen(() => import("../screens/Farmer"));
const FarmerVisitScreen = lazyLoadScreen(() => import("../screens/FarmerVisit"));
const DealerScreen = lazyLoadScreen(() => import("../screens/Dealer"));
const DealerUpdateScreen = lazyLoadScreen(() => import("../screens/DealerUpdate"));
const DealerVisitScreen = lazyLoadScreen(() => import("../screens/DealerVisit"));
const ProductDetailScreen = lazyLoadScreen(() => import("../screens/ProductDetails"));
const FarmerUpdateScreen = lazyLoadScreen(() => import("../screens/FarmerUpdate"));

// Import CustomHeader normally since it's used in header
import CustomHeader from "../src/components/appHeader/CustomHeader";
import ScreenWrapper from "../src/components/ScreenWrapper";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AUTHENTICATED_MENU_ITEMS = [
  { id: "products", label: "Products", route: "Product", icon: "leaf" },
  { id: "logout", label: "Logout", route: "Login", icon: "logout" },
];

export function TabNavigation() {
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Calculate tab bar height with safe area
  const tabBarHeight = 60; // Base height
  const safeAreaBottom = insets.bottom || 10; // Minimum 10px for devices with no inset
  const totalHeight = tabBarHeight + safeAreaBottom;
  
  return (
    <Tab.Navigator
      initialRouteName="DashboardTab"
      screenOptions={{
        ...tabNavigatorOptions,
        tabBarStyle: {
          ...tabNavigatorOptions.tabBarStyle,
          height: totalHeight,
          paddingBottom: safeAreaBottom,
          paddingTop: 8,
          // Hide tab bar when keyboard is visible
          display: keyboardVisible ? 'none' : 'flex',
          // Solid background to avoid transparent gaps
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        // Add lazy loading for tab screens
        lazy: true,
        lazyPlaceholder: () => null,
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={(props) => (
          <ScreenWrapper>
            <Dashboard {...props} />
          </ScreenWrapper>
        )}
        options={{
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Orders"
        component={(props) => (
          <ScreenWrapper>
            <OrderScreen {...props} />
          </ScreenWrapper>
        )}
        options={{
          tabBarLabel: "Orders",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="cart-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Payments"
        component={(props) => (
          <ScreenWrapper>
            <PaymentScreen {...props} />
          </ScreenWrapper>
        )}
        options={{
          tabBarLabel: "Payments",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="currency-inr"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigation() {
  return (
    <Stack.Navigator
      initialRouteName="Main"
      screenOptions={{
        header: () => (
          <CustomHeader userType="auth" menuItems={AUTHENTICATED_MENU_ITEMS} />
        ),
        headerMode: "screen",
        animation:
          Platform.OS === "ios" ? "slide_from_right" : "fade_from_bottom",
        // Add lazy loading for stack screens
        lazy: true,
        lazyPlaceholder: () => null,
      }}
    >
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="Main" component={TabNavigation} />
      <Stack.Screen name="Product" component={ProductScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Farmer" component={FarmerScreen} />
      <Stack.Screen name="Dealer" component={DealerScreen} />
      <Stack.Screen name="FarmerUpdate" component={FarmerUpdateScreen} />
      <Stack.Screen name="FarmerVisit" component={FarmerVisitScreen} />
      <Stack.Screen name="DealerVisit" component={DealerVisitScreen} />
      <Stack.Screen name="DealerUpdate" component={DealerUpdateScreen} />
    </Stack.Navigator>
  );
}

export default AppNavigation;
