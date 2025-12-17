// External Libraries
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActivityIndicator, View } from "react-native";

// React Navigation
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
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
import DrawerContent from "../src/components/DrawerMenu"

// Permissions - use context instead of hook for app-level coordination
import { usePermissionsContext } from "../src/contexts/PermissionsContext";
import AnalyticsScreen from "../screens/Analytics";
import DESIGN from "../src/theme";
import DealerList from "../screens/DealerList";
import DealerVerification from "../screens/DealerVerification";
import FarmerList from "../screens/FarmerList";
import DealerLedger from "../screens/DealerLedger";
import HelpSupport from "../screens/Help&Support";

// ================================================================
// CONSTANTS & CONFIGURATIONS
// ================================================================

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

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
  backgroundColor: DESIGN.colors.background,
  borderTopWidth: 1,
  borderRadius: 12,
};

// Screens where tab bar should be hidden
const HIDDEN_TAB_SCREENS = {
  dashboard: ["Farmer", "FarmerUpdate", "FarmerVisit", "Dealer", "DealerUpdate", "DealerVisit", "VisitHistory", "Analytics", "DealerList", "DealerVerification", "FarmerList", "DealerLedger", "Hepl&Support"],
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
        options={{ headerShown: false }}
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
        options={{ title: "Farmers" }}
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
        options={{ title: "Dealers", }}
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

      {/* Analytics Screen */}
      <Stack.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          title: "Analytics",
          headerShown: false
        }}
      />

      <Stack.Screen
        name="DealerList"
        component={DealerList}
        options={{
          title: "Dealer List",
          headerShown: false
        }}
      />

      <Stack.Screen
        name="FarmerList"
        component={FarmerList}
        options={{
          title: "Farmer List",
          headerShown: false
        }}
      />

      <Stack.Screen
        name="DealerVerification"
        component={DealerVerification}
        options={{
          title: "Dealer Verification",
          headerShown: true
        }}
      />

      <Stack.Screen
        name="DealerLedger"
        component={DealerLedger}
        options={{
          title: "Dealer Ledger",
          headerShown: true
        }}
      />

      <Stack.Screen
        name="Hepl&Support"
        component={HelpSupport}
        options={{
          title: "Help & Support",
          headerShown: true
        }}
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
        options={{ headerShown: false }}
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
});

// ================================================================
// TAB NAVIGATOR (Wrapped in Drawer)
// ================================================================

/**
 * Bottom Tab Navigator containing all main app sections
 */
function TabNavigator() {
  const insets = useSafeAreaInsets();

  const {
    showProducts,
    showOrders,
    showCollections,
  } = usePermissionsContext();

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
        tabBarHideOnKeyboard: true
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

      {showProducts && (
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
      )}

      {showOrders && (
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
      )}

      {showCollections && (
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
      )}
    </Tab.Navigator>
  );
}

// ================================================================
// MAIN DRAWER NAVIGATOR
// ================================================================

/**
 * Main App Navigation Component with Drawer
 */
export function AppNavigation() {
  const {
    loading,
    isInitialized,
  } = usePermissionsContext();

  // Show loading indicator while permissions are being initialized
  if (loading || !isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' }}>
        <ActivityIndicator size="large" color={DESIGN.colors.primary} />
      </View>
    );
  }

  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerPosition: "right",
        drawerType: 'front',
        drawerStyle: {
          width: 300,
          backgroundColor: DESIGN.colors.surface,
        },
        overlayColor: 'rgba(0, 0, 0, 0.5)',
        swipeEnabled: true,
        swipeEdgeWidth: 50,
      }}
    >
      <Drawer.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{
          drawerLabel: () => null,
          drawerItemStyle: { display: 'none' }
        }}
      />
    </Drawer.Navigator>
  );
}

export default AppNavigation;