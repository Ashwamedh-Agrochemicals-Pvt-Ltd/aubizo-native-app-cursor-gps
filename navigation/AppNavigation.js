import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import Dashboard from "../screens/Dashboard";
import OrderScreen from "../screens/Orders";
import ProductScreen from "../screens/Pruducts";
import FarmerScreen from "../screens/Farmer";
import FarmerVisitScreen from "../screens/FarmerVisit";
import DealerScreen from "../screens/Dealer";
import DealerUpdateScreen from "../screens/DealerUpdate";
import DealerVisitScreen from "../screens/DealerVisit";
import ProductDetailScreen from "../screens/ProductDetails";
import FarmerUpdateScreen from "../screens/FarmerUpdate";
import ScreenWrapper from "../src/components/ScreenWrapper";
import LoginScreen from "../screens/Login";
import OrderForm from "../src/components/orders/OrderForm";
import VisitHistory from "../screens/VisitHistory";
import CollectionScreen from "../screens/Collections";



const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function DashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        statusBarStyle: "dark",
        statusBarColor: "#FFFFFF",
      }}
    >
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
      <Stack.Screen name="Product Details" component={ProductDetailScreen} />
      <Stack.Screen name="Farmer" component={FarmerScreen} />
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

      <Stack.Screen name="Dealer" component={DealerScreen} />
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
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="VisitHistory" component={VisitHistory} options={{ title: "Visit History" }} />
    </Stack.Navigator>
  );
}

function OrdersStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        statusBarStyle: "dark",
        statusBarColor: "#FFFFFF",
      }}
    >
      <Stack.Screen
        name="Orders"
        component={OrderScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OrderForm"
        component={OrderForm}
        options={{ title: "Order Form" }}
      />
    </Stack.Navigator>
  );
}

function CollectionsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        statusBarStyle: "dark",
        statusBarColor: "#FFFFFF",
      }}
    >
      <Stack.Screen name="CollectionsHome" options={{ title: "Collection" }}>
        {(props) => (
          <ScreenWrapper>
            <CollectionScreen {...props} />
          </ScreenWrapper>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}



function ProductStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        statusBarStyle: "dark",
        statusBarColor: "#FFFFFF",
      }}
    >
      <Stack.Screen
        name="Product"
        component={ProductScreen}
        options={{ title: "Product List" }}
      />
      <Stack.Screen name="Product Details" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}

//
// 🔹 Tab Navigator (Root)
//
export function AppNavigation() {
  const insets = useSafeAreaInsets();

  const tabBarHeight = 60;
  const safeAreaBottom = insets.bottom || 10;
  const totalHeight = tabBarHeight + safeAreaBottom;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#2E7D32",
        tabBarInactiveTintColor: "#B0BEC5",
        tabBarStyle: {
          height: totalHeight,
          paddingBottom: safeAreaBottom,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopLeftRadius: 12, // Top Left
          borderTopRightRadius: 12, // Top Right

          headerShown: false,
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStack}
        options={({ route }) => {
          // 👇 get the active route inside DashboardStack
          const routeName = getFocusedRouteNameFromRoute(route) ?? "Dashboard";

          // hide tab bar if not on DashboardHome
          const hideOnScreens = [
            "Farmer",
            "FarmerUpdate",
            "FarmerVisit",
            "Dealer",
            "DealerUpdate",
            "DealerVisit",
            "VisitHistory",
          ];

          return {
            tabBarLabel: "Home",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="home" size={size} color={color} />
            ),
            headerShown: false,
            tabBarStyle: hideOnScreens.includes(routeName)
              ? { display: "none" }
              : {
                height: totalHeight,
                paddingBottom: safeAreaBottom,
                backgroundColor: "#FFFFFF",
                borderTopWidth: 1,
                borderTopLeftRadius: 12, // Top Left
                borderTopRightRadius: 12, // Top Right

              },
          };
        }}
      />


      <Tab.Screen
        name="ProductsTab"
        component={ProductStack}
        options={({ route }) => {
          // 👇 get the active route inside OrdersStack
          const routeName =
            getFocusedRouteNameFromRoute(route) ?? "ProductScreen";

          // screens where tab bar should be hidden
          const hideOnScreens = ["Product Details"];

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
            tabBarStyle: hideOnScreens.includes(routeName)
              ? { display: "none" }
              : {
                height: totalHeight,
                paddingBottom: safeAreaBottom,
                backgroundColor: "#070101ff",


              },

          };
        }}
      />

      <Tab.Screen
        name="OrdersTab"
        component={OrdersStack}
        options={({ route }) => {
          // 👇 get the active route inside OrdersStack
          const routeName =
            getFocusedRouteNameFromRoute(route) ?? "OrderScreen";

          // screens where tab bar should be hidden
          const hideOnScreens = ["OrderForm"];

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
            tabBarStyle: hideOnScreens.includes(routeName)
              ? { display: "none" }
              : {
                height: totalHeight,
                paddingBottom: safeAreaBottom,
                backgroundColor: "#FFFFFF",
                borderTopWidth: 1,
                borderTopLeftRadius: 12, // Top Left
                borderTopRightRadius: 12, // Top Right
              },
          };
        }}
      />

      {/* <Tab.Screen
        name="CollectionsTab"
        component={CollectionsStack}
        options={{
          tabBarLabel: "Collection",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="folder"
              size={size}
              color={color}
            />
          ),
          headerShown: false,
        }}
      /> */}

    </Tab.Navigator>
  );
}

export default AppNavigation;
