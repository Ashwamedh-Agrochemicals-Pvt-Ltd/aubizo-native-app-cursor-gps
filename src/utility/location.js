import axios from "axios";
import * as Location from "expo-location";
import { Alert, BackHandler } from "react-native";
import Constants from "expo-constants";

const GOOGLE_API_KEY =
  Constants.expoConfig.extra.googleApiKey ||
  process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
const GOOGLE_URL = process.env.EXPO_PUBLIC_GOOGLE_URL;

// ✅ Get current location and address
const getCurrentLocationDetails = async () => {
  try {
    // Step 1: Permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Location Permission Required",
        "Please enable location permission in Settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Settings", onPress: () => Location.openSettings() },
        ]
      );
      return { latitude: null, longitude: null, address: null };
    }

    // Step 2: Get GPS coordinates
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const { latitude, longitude } = location.coords;

    // Step 3: Reverse Geocoding
    const url = `${GOOGLE_URL}?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`;
    let address = null;

    try {
      const response = await axios.get(url, { timeout: 5000 });
      if (response.data.status === "OK" && response.data.results.length > 0) {
        address = response.data.results[0].formatted_address;
      }
    } catch (geoError) {
      address = null;
    }

    return { latitude, longitude, address };
  } catch (error) {
    Alert.alert("Location Error", "Unable to fetch location. Please try again.");
    return { latitude: null, longitude: null, address: null };
  }
};

// ✅ Force strict permission (close app if denied)
const getStrictLocation = async () => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== "granted") {
      const { status: newStatus } =
        await Location.requestForegroundPermissionsAsync();

      if (newStatus !== "granted") {
        Alert.alert(
          "Location Required",
          "Location permission is required to use this app.",
          [
            {
              text: "Exit App",
              onPress: () => BackHandler.exitApp(),
              style: "destructive",
            },
          ],
          { cancelable: false }
        );
        return null;
      }
    }
    return true;
  } catch (error) {
    Alert.alert("Location Error", "Unable to retrieve location.", [
      {
        text: "Exit",
        onPress: () => BackHandler.exitApp(),
        style: "destructive",
      },
    ]);
    return null;
  }
};

// ✅ Request permission only if needed
const requestLocationWhenNeeded = async () => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();

    if (status === "granted") return true;

    if (status === "denied") {
      Alert.alert(
        "Location Permission",
        "This feature requires location access. Please enable it in Settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Settings", onPress: () => Location.openSettings() },
        ]
      );
      return false;
    }

    const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
    return newStatus === "granted";
  } catch {
    return false;
  }
};

export default {
  getCurrentLocationDetails,
  getStrictLocation,
  requestLocationWhenNeeded,
};
