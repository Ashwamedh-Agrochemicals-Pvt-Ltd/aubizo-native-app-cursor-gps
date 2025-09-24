import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { lazyLoadScreen } from '../src/utility/performance';
import LoginScreen from '../screens/Login';

// Lazy load screens for better performance
// const LoginScreen = lazyLoadScreen(() => import('../screens/Login'));
// Import TabNavigation normally since it's a named export


const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName='Login'
      screenOptions={{
        // Add lazy loading for stack screens
        lazy: true,
        lazyPlaceholder: () => null,
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
