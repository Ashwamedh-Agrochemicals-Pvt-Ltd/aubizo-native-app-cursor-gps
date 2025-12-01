import axios from "axios";
import * as Location from "expo-location";
import Constants from "expo-constants";
import showToast from "./showToast";

const GOOGLE_API_KEY =
  Constants.expoConfig.extra.googleApiKey ||
  process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
const GOOGLE_URL = process.env.EXPO_PUBLIC_GOOGLE_URL;


const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getCurrentLocationDetails = async () => {
  try {
    const granted = await requestLocationWhenNeeded();
    if (!granted) return;

    await sleep(2000);

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
      maximumAge: 0,
      timeout: 10000,
      mayShowUserSettingsDialog: true,
    });
    const { latitude, longitude } = location.coords;

    const url = `${GOOGLE_URL}?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`;

    let address = null;
    let googleResults = null;

    try {
      const response = await axios.get(url, { timeout: 5000 });
      if (response.data.status === "OK" && response.data.results.length > 0) {
        googleResults = response.data.results;
        address = response.data.results[0].formatted_address;

        console.log("📍 Full Google Results:", googleResults);
      }
    } catch (geoError) {
      console.error("Google Geocoding API error:", geoError);
    }

    return {
      latitude,
      longitude,
      address,
      googleResults // Return the full results array
    };
  } catch (error) {
    console.error("Location service error:", error);
    return {
      latitude: null,
      longitude: null,
      address: null,
      googleResults: null
    };
  }
};

const getStrictLocation = async () => {
  try {
    // 1. Check current permission status
    const { status } = await Location.getForegroundPermissionsAsync();

    if (status === "granted") {

      return true;
    }

    if (status === "denied") {

      const { status: reqStatus } = await Location.requestForegroundPermissionsAsync();

      if (reqStatus === "granted") {
        return true;
      } else if (reqStatus === "denied") {
        // User denied again
        console.log("Location permission denied by user.");
        return false;
      }
    }

    // For other unexpected statuses
    return false;
  } catch (error) {
    console.error("Permission error:", error);
    return false;
  }
};

const requestLocationWhenNeeded = async () => {
  try {

    let { status, canAskAgain } = await Location.getForegroundPermissionsAsync();

    if (status === "granted") {
      return true;
    }

    if (canAskAgain) {
      let { status: newStatus } = await Location.requestForegroundPermissionsAsync();

      if (newStatus === "granted") {
        return true;
      }

      return false;
    }

    // Usage
    showToast.show(
      "Location permissions are permanently denied, you must enable location permission from settings to continue"
    );

    return false;
  } catch (err) {
    console.log("Permission error:", err);
    return false;
  }
};

export default {
  getCurrentLocationDetails,
  getStrictLocation,
  requestLocationWhenNeeded,
};
