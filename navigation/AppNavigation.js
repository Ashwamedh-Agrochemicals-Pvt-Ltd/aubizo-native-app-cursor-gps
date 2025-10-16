// External Libraries
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// React Navigation
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";

// Main Screens
import Dashboard from "../screens/Dashboard";
import OrderScreen from "../screens/Orders";
import ProductScreen from "../screens/Pruducts"; 
import CollectionScreen from "../screens/Collections";
import VisitHistory from "../screens/VisitHistory";

// Farmer Related Screens
import FarmerScreen from "../screens/Farmer";
import FarmerVisitScreen from "../screens/FarmerVisit";
import FarmerUpdateScreen from "../screens/FarmerUpdate";

// Dealer Related Screens  
import DealerScreen from "../screens/Dealer";
import DealerUpdateScreen from "../screens/DealerUpdate";
import DealerVisitScreen from "../screens/DealerVisit";

// Product Related Screens
import ProductDetailScreen from "../screens/ProductDetails";

// Components
import OrderForm from "../src/components/orders/OrderForm";
import CollectionForm from "../src/components/collections/CollectionForm";

// ================================================================
// CONSTANTS & CONFIGURATIONS
// ================================================================

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Common screen options for all stack navigators
const COMMON_STACK_OPTIONS = {
  statusBarStyle: "dark",
  statusBarColor: "#FFFFFF",
};

// Tab bar styling constants
const TAB_BAR_CONFIG = {
  height: 60,
  activeTintColor: "#2E7D32",
  inactiveTintColor: "#B0BEC5",
  backgroundColor: "#FFFFFF",
  borderTopWidth: 1,
  borderRadius: 12,
};

// Screens where tab bar should be hidden
const HIDDEN_TAB_SCREENS = {
  dashboard: ["Farmer", "FarmerUpdate", "FarmerVisit", "Dealer", "DealerUpdate", "DealerVisit", "VisitHistory"],
  products: ["Product Details"],
  orders: ["OrderForm"],
  collections: ["CollectionForm"],
};

// ================================================================
// STACK NAVIGATORS
// ================================================================

/**
 * Dashboard Stack Navigator
 * Contains main dashboard and all farmer/dealer related screens
 */
function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={COMMON_STACK_OPTIONS}>
      <Stack.Screen
        name="Dashboard"
        component={Dashboard}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Products"
        component={ProductScreen}
        options={{ title: "Product List" }}
      />
      <Stack.Screen 
        name="Product Details" 
        component={ProductDetailScreen} 
        options={{ title: "Product Details" }} 
      />
      
      {/* Farmer Related Screens */}
      <Stack.Screen 
        name="Farmer" 
        component={FarmerScreen} 
        options={{ title: "Farmer" }} 
      />
      <Stack.Screen
        name="FarmerUpdate"
        component={FarmerUpdateScreen}
        options={{ title: "Update Farmer" }}
      />
      <Stack.Screen
        name="FarmerVisit"
        component={FarmerVisitScreen}
        options={{ title: "Farmer Visit" }}
      />

      {/* Dealer Related Screens */}
      <Stack.Screen 
        name="Dealer" 
        component={DealerScreen} 
        options={{ title: "Dealer" }} 
      />
      <Stack.Screen
        name="DealerVisit"
        component={DealerVisitScreen}
        options={{ title: "Dealer Visit" }}
      />
      <Stack.Screen
        name="DealerUpdate"
        component={DealerUpdateScreen}
        options={{ title: "Update Dealer" }}
      />
      
      {/* Other Screens */}
      <Stack.Screen 
        name="VisitHistory" 
        component={VisitHistory} 
        options={{ title: "Visit History" }} 
      />
    </Stack.Navigator>
  );
}

/**
 * Orders Stack Navigator  
 * Contains orders list and order creation form
 */
function OrdersStack() {
  return (
    <Stack.Navigator screenOptions={COMMON_STACK_OPTIONS}>
      <Stack.Screen
        name="Orders"
        component={OrderScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OrderForm"
        component={OrderForm}
        options={{ 
          title: "Create Order", 
          headerShown: true, 
          headerBackTitle: "Back" 
        }}
      />
    </Stack.Navigator>
  );
}

/**
 * Collections Stack Navigator
 * Contains collections list and collection creation form
 */
function CollectionsStack() {
  return (
    <Stack.Navigator screenOptions={COMMON_STACK_OPTIONS}>
      <Stack.Screen 
        name="CollectionsHome" 
        component={CollectionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CollectionForm" 
        component={CollectionForm} 
        options={{ 
          title: "Create Collection", 
          headerShown: true, 
          headerBackTitle: "Back" 
        }} 
      />
    </Stack.Navigator>
  );
}

/**
 * Products Stack Navigator
 * Contains product list and product details screens
 */
function ProductStack() {
  return (
    <Stack.Navigator screenOptions={COMMON_STACK_OPTIONS}>
      <Stack.Screen
        name="Product"
        component={ProductScreen}
        options={{ title: "Product List" }}
      />
      <Stack.Screen 
        name="Product Details" 
        component={ProductDetailScreen}
        options={{ title: "Product Details" }}
      />
    </Stack.Navigator>
  );
}

// ================================================================
// HELPER FUNCTIONS
// ================================================================

/**
 * Creates tab bar style configuration
 * @param {number} totalHeight - Total height including safe area
 * @param {number} safeAreaBottom - Safe area bottom padding
 * @returns {object} Tab bar style object
 */
const createTabBarStyle = (totalHeight, safeAreaBottom) => ({
  height: totalHeight,
  paddingBottom: safeAreaBottom,
  backgroundColor: TAB_BAR_CONFIG.backgroundColor,
  borderTopWidth: TAB_BAR_CONFIG.borderTopWidth,
  borderTopLeftRadius: TAB_BAR_CONFIG.borderRadius,
  borderTopRightRadius: TAB_BAR_CONFIG.borderRadius,
});

// ================================================================
// MAIN TAB NAVIGATOR
// ================================================================

/**
 * Main App Navigation Component
 * Bottom Tab Navigator containing all main app sections
 */
export function AppNavigation() {
  const insets = useSafeAreaInsets();
  
  const safeAreaBottom = insets.bottom || 10;
  const totalHeight = TAB_BAR_CONFIG.height + safeAreaBottom;
  const defaultTabBarStyle = createTabBarStyle(totalHeight, safeAreaBottom);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: TAB_BAR_CONFIG.activeTintColor,
        tabBarInactiveTintColor: TAB_BAR_CONFIG.inactiveTintColor,
        tabBarStyle: defaultTabBarStyle,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStack}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? "Dashboard";
          const shouldHideTabBar = HIDDEN_TAB_SCREENS.dashboard.includes(routeName);

          return {
            tabBarLabel: "Home",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="home" size={size} color={color} />
            ),
            headerShown: false,
            tabBarStyle: shouldHideTabBar ? { display: "none" } : defaultTabBarStyle,
          };
        }}
      />

      <Tab.Screen
        name="ProductsTab"
        component={ProductStack}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? "ProductScreen";
          const shouldHideTabBar = HIDDEN_TAB_SCREENS.products.includes(routeName);

          return {
            tabBarLabel: "Products",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="cube-outline"
                size={size}
                color={color}
              />
            ),
            headerShown: false,
            tabBarStyle: shouldHideTabBar ? { display: "none" } : defaultTabBarStyle,
          };
        }}
      />

      <Tab.Screen
        name="OrdersTab"
        component={OrdersStack}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? "OrderScreen";
          const shouldHideTabBar = HIDDEN_TAB_SCREENS.orders.includes(routeName);

          return {
            tabBarLabel: "Orders",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="cart-outline"
                size={size}
                color={color}
              />
            ),
            headerShown: false,
            tabBarStyle: shouldHideTabBar ? { display: "none" } : defaultTabBarStyle,
          };
        }}
      />

      <Tab.Screen
        name="CollectionsTab"
        component={CollectionsStack}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? "CollectionsHome";
          const shouldHideTabBar = HIDDEN_TAB_SCREENS.collections.includes(routeName);

          return {
            tabBarLabel: "Collections",
            tabBarIcon: ({ color, size }) => ( 
              <MaterialCommunityIcons
                name="folder"
                size={size}
                color={color}
              />
            ),
            headerShown: false,
            tabBarStyle: shouldHideTabBar ? { display: "none" } : defaultTabBarStyle,
          };
        }}
      />

    </Tab.Navigator>
  );
}

export default AppNavigation;
