import { Alert, BackHandler, NativeModules, Platform } from 'react-native';
const { DeveloperOptionsModule } = NativeModules;

export async function checkDeveloperOptions() {
  if (Platform.OS !== 'android') return;
  try {
    const isEnabled = await DeveloperOptionsModule.isDeveloperOptionsEnabled();
    if (isEnabled) {
      Alert.alert(
        'Developer Options Enabled',
        'Please turn them off to continue.',
        [
          { text: 'Go to Settings', onPress: () => {
              DeveloperOptionsModule.openDeveloperOptions();
              setTimeout(() => BackHandler.exitApp(), 500);
          }},
          { text: 'Exit App', onPress: () => BackHandler.exitApp() }
        ],
        { cancelable: false }
      );
    }
  } catch (err) {
    console.error(err);
  }
}
