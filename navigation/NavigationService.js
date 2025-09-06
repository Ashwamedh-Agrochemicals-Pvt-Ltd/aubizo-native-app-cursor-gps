// NavigationService.js
import { createNavigationContainerRef, StackActions } from '@react-navigation/native';

export const navigation = createNavigationContainerRef();

// Helper functions so you can call them anywhere
export function navigate(name, params) {
  if (navigation.isReady()) {
    navigation.navigate(name, params);
  }
}

export function replace(name, params) {
  if (navigation.isReady()) {
    navigation.dispatch(StackActions.replace(name, params));
  }
}

export function reset(name, params) {
  if (navigation.isReady()) {
    navigation.reset({
      index: 0,
      routes: [{ name, params }],
    });
  }
}
