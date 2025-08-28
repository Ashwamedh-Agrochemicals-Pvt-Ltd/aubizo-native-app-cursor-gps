import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { lazyLoadScreen } from '../src/utility/performance';
import ScreenWrapper from '../src/components/ScreenWrapper';

// Disable console logs in production
if (__DEV__ === false) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

// Lazy load screens for better performance
const LoginScreen = lazyLoadScreen(() => import('../screens/Login'));
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
        component={(props) => (
          <ScreenWrapper>
            <LoginScreen {...props} />
          </ScreenWrapper>
        )}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
