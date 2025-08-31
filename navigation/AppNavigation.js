import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import Dashboard from "../screens/Dashboard";
import PaymentScreen from "../screens/Payments";
import OrderScreen from "../screens/Orders";
import ProductScreen from "../screens/Pruducts";
import FarmerScreen from "../screens/Farmer";
import FarmerVisitScreen from "../screens/FarmerVisit";
import DealerScreen from "../screens/Dealer";
import DealerUpdateScreen from "../screens/DealerUpdate";
import DealerVisitScreen from "../screens/DealerVisit";
import ProductDetailScreen from "../screens/ProductDetails";
import FarmerUpdateScreen from "../screens/FarmerUpdate";
import CustomHeader from "../src/components/appHeader/CustomHeader";
import ScreenWrapper from "../src/components/ScreenWrapper";
import LoginScreen from "../screens/Login"
import OrderForm from "../src/components/orders/OrderForm"

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AUTHENTICATED_MENU_ITEMS = [
  { id: "products", label: "Products", route: "Product", icon: "leaf" },
  { id: "logout", label: "Logout", route: "Login", icon: "logout" }, 
];

function DashboardStack() {
  return (
    <Stack.Navigator
     screenOptions={{
        statusBarStyle: "dark",        // for Expo (use "dark-content" if pure RN)
        statusBarColor: "#FFFFFF",     // Android background
      }}>
      <Stack.Screen
        name="DashboardHome"
        options={{
          header: () => (
            <CustomHeader
              userType="auth"
              menuItems={AUTHENTICATED_MENU_ITEMS}
            />
          ),
        }}
      >
        {(props) => (
          <ScreenWrapper>
            <Dashboard {...props} />
          </ScreenWrapper>
        )}
      </Stack.Screen>
      <Stack.Screen name="Product" component={ProductScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Farmer" component={FarmerScreen} />
      <Stack.Screen name="FarmerUpdate" component={FarmerUpdateScreen} />
      <Stack.Screen name="FarmerVisit" component={FarmerVisitScreen} />
      <Stack.Screen name="Dealer" component={DealerScreen} />
      <Stack.Screen name="DealerVisit" component={DealerVisitScreen} />
      <Stack.Screen name="DealerUpdate" component={DealerUpdateScreen} />
      <Stack.Screen name="Login" component={LoginScreen}/>
    </Stack.Navigator>
  );
}

function OrdersStack() {
  return (
     <Stack.Navigator>
        <Stack.Screen
          name="OrdersHome"
          options={{ headerShown: true }}
        >
          {(props) => (
            <ScreenWrapper>
              <OrderScreen {...props} />
            </ScreenWrapper>
          )}
        </Stack.Screen>
        <Stack.Screen name="OrderForm"  component={OrderForm} />
      </Stack.Navigator>
  );
}


function PaymentsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="PaymentsHome"
        options={{
          statusBarStyle: "dark",        
          statusBarColor: "#FFFFFF",     
        }}>
        {(props) => (
          <ScreenWrapper>
            <PaymentScreen {...props} />
          </ScreenWrapper>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

//
// 🔹 Tab Navigator (Root)
//
export function AppNavigation() {
  const insets = useSafeAreaInsets()

  const tabBarHeight = 60;
  const safeAreaBottom = insets.bottom || 10;
  const totalHeight = tabBarHeight + safeAreaBottom;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#00796B",
        tabBarInactiveTintColor: "#B0BEC5",
        tabBarStyle: {
          height: totalHeight,
          paddingBottom: safeAreaBottom,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 2,
          headerShown: false,
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStack}
        options={({ route }) => {
          // 👇 get the active route inside DashboardStack
          const routeName = getFocusedRouteNameFromRoute(route) ?? "DashboardHome";

          // hide tab bar if not on DashboardHome
          const hideOnScreens = [
            "Farmer",
            "FarmerUpdate",
            "FarmerVisit",
            "Dealer",
            "DealerUpdate",
            "DealerVisit",
            "Product",
            "ProductDetail",
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
                borderTopWidth: 2,
              },
          };
        }}
      />

      <Tab.Screen
        name="OrdersTab"
        component={OrdersStack}
        options={{
          tabBarLabel: "Orders",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="cart-outline"
              size={size}
              color={color}
            />
          ),
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="PaymentsTab"
        component={PaymentsStack}
        options={{
          tabBarLabel: "Payments",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="currency-inr"
              size={size}
              color={color}
            />
          ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

export default AppNavigation;
