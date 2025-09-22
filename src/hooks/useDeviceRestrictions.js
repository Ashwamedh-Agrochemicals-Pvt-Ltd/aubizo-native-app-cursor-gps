import { useState, useCallback, useEffect } from "react";
import { Platform, Linking, AppState } from "react-native";
import * as Location from "expo-location";
import { NativeModules } from "react-native";

const { DeveloperOptionsModule } = NativeModules;

export default function useDeviceRestrictions() {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null); // "developer" or "location"

  // --- Check Developer Mode (Android only)
  const checkDeveloperMode = useCallback(async () => {
    if (Platform.OS === "android" && DeveloperOptionsModule?.isDeveloperOptionsEnabled) {
      try {
        return await DeveloperOptionsModule.isDeveloperOptionsEnabled();
      } catch (err) {
        console.log("Dev Mode Check Error:", err);
        return false;
      }
    }
    return false;
  }, []);

  // --- Check Location Services using Expo Location
  const checkLocationServices = useCallback(async () => {
    try {
      const isEnabled = await Location.hasServicesEnabledAsync();
      return !isEnabled; // true if location is OFF
    } catch (err) {
      console.log("Location Check Error:", err);
      return false;
    }
  }, []);

  // --- Check all restrictions and manage modal
  const checkRestrictions = useCallback(async () => {
    const isDevMode = await checkDeveloperMode();
    const isLocationOff = await checkLocationServices();

    if (isDevMode) {
      if (modalType !== "developer" || !modalVisible) {
        setModalType("developer");
        setModalVisible(true);
      }
      return true;
    }

    if (isLocationOff) {
      if (modalType !== "location" || !modalVisible) {
        setModalType("location");
        setModalVisible(true);
      }
      return true;
    }

    // Close modal if all restrictions are fine
    if (modalVisible) {
      setModalVisible(false);
      setModalType(null);
    }

    return false;
  }, [checkDeveloperMode, checkLocationServices, modalType, modalVisible]);


  const closeModal = useCallback(() => {
    if (checkDeveloperMode || checkLocationServices) {
      setModalVisible(false)
      setModalType(null)
    }
  })

  // --- Open device settings
  const openSettings = useCallback(() => {
    if (modalType === "developer") {
      DeveloperOptionsModule?.openDeveloperOptions?.();
    } else if (modalType === "location") {
      if (Platform.OS === "ios") {
        Linking.openURL("App-Prefs:Privacy&path=LOCATION");
      } else {
        Linking.sendIntent("android.settings.LOCATION_SOURCE_SETTINGS");
      }
    }
  }, [modalType]);

  // --- Monitor AppState to re-check restrictions when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
       closeModal();
      }
    });
    return () => subscription.remove();
  }, [closeModal]);

  return {
    modalVisible,
    modalType,
    setModalVisible,
    checkRestrictions,
    openSettings,
  };
}
