import { Ionicons } from "@expo/vector-icons";
import { useContext, useEffect, useRef, useState, useCallback } from "react";
import { ActivityIndicator, Alert, Animated, Text, TouchableHighlight, View } from "react-native";
import apiClient from "../src/api/client"
import authContext from "../src/auth/context"
import authStorage from "../src/auth/storage";
import {navigation} from "../navigation/NavigationService"
import { styles } from "../src/styles/dashboard.style";
import Location from "../src/utility/location";
import storage from "../src/utility/storage";
import logger from "../src/utility/logger";
import { debounce } from "../src/utility/performance";


const INPUNCH_URL = process.env.EXPO_PUBLIC_INPUNCH_URL;
const OUTPUNCH_URL = process.env.EXPO_PUBLIC_OUTPUNCH_URL;

// Centralized messages
const MESSAGES = {
  SESSION_EXPIRED: "Session expired. Please login again.",
  NETWORK_ERROR: "Network error. Please check your connection.",
  PUNCH_IN_RESTRICTED: "You can only record one inpunch per day.",
  PUNCH_OUT_FAILED: "Failed to record outpunch. Please try again.",
  ACCESS_RESTRICTED: "You must be punched in to access",
  GENERIC_ERROR: "An error occurred. Please try again."
};


function Dashboard() {
  const [hasInpunch, setHasInpunch] = useState(false);
  const [inpunchId, setInpunchId] = useState(null);
  const [isPunchInLoading, setIsPunchInLoading] = useState(false);
  const [isPunchOutLoading, setIsPunchOutLoading] = useState(false);
  const { user, setUser } = useContext(authContext); 


  // Check punch status and maintain login state
  const checkPunchStatus = useCallback(async () => {
    try {
      // First, try to load existing punch ID from storage
      const existingPunchId = await storage.get("punchId");
      
      const response = await apiClient.get("/track/punch-in/");
      const { punched_in, punched_out, punch_id } = response.data;

      if (punched_in == true && punched_out == false) {
        const punchId = String(punch_id);
        // Sync local storage with server state
        await storage.set("punchId", punchId);
        setInpunchId(punchId);
        setHasInpunch(true);

        // Ensure user stays logged in
        const token = await authStorage.getUser();
        if (token) {
          setUser(token);
        }
      } else if (punched_in == true && punched_out == true) {
        setHasInpunch(false);
        setInpunchId(null);
        // Clear storage after punch out - user should not have access
        await storage.remove("punchId");
      } else {
        setHasInpunch(false);
        setInpunchId(null);
        // Clear storage when no punch record exists
        await storage.remove("punchId");
      }
    } catch (error) {
      logger.error("Error checking punch status:", error);
      
      if (error.response?.status === 401) {
        Alert.alert("Session Expired", MESSAGES.SESSION_EXPIRED);
      } else if (!error.response) {
        Alert.alert("Network Error", MESSAGES.NETWORK_ERROR);
      } else {
        Alert.alert("Error", MESSAGES.GENERIC_ERROR);
      }
    }
  }, [setUser]);

  // Initial mount and auth changes trigger
  useEffect(() => {
    if (user) {
      checkPunchStatus();
    } else {
      // Clear state when user logs out
      setHasInpunch(false);
      setInpunchId(null);
      storage.remove("punchId");
    }
  }, [user, checkPunchStatus]);

const handleInpunch = useCallback(async () => {
  if (isPunchInLoading) return; // Prevent double-clicks

  setIsPunchInLoading(true);
  try {
    const { latitude, longitude } = await Location.getCurrentLocationDetails();

    const payload = {
      latitude: Number(latitude.toFixed(6)),
      longitude: Number(longitude.toFixed(6)),
    };

    const response = await apiClient.post(INPUNCH_URL, payload);
    const id = String(response.data.data.id);
    console.log("DashBoard punch Id:",id)
    // Use consistent storage approach
    await storage.set("punchId", id);
    setInpunchId(id);
    setHasInpunch(true);

    Alert.alert(
      "Success",
      "Inpunch recorded successfully",
      [{ text: "OK" }],
      { cancelable: true }
    );
  } catch (error) {
    logger.error("Punch in error:", error);

    if (error.response?.status === 401) {
      Alert.alert("Session Expired", MESSAGES.SESSION_EXPIRED);
    } else if (!error.response) {
       Alert.alert(
        "Punch In Restricted",
        "You can only record one inpunch per day", // Proper message
        [{ text: "OK" }],
        { cancelable: true }
      );
    } else if (error.response?.status === 400) {
      Alert.alert(
        "Punch In Restricted",
        "You can only record one inpunch per day", // Proper message
        [{ text: "OK" }],
        { cancelable: true }
      );
    } else {
      Alert.alert("Error", MESSAGES.GENERIC_ERROR);
    }
  } finally {
    setIsPunchInLoading(false);
  }
}, [isPunchInLoading]);


  const handleOutpunch = useCallback(async () => {
    if (isPunchOutLoading) return; // Prevent double-clicks
    
    setIsPunchOutLoading(true);
    try {
      const { latitude, longitude } = await Location.getCurrentLocationDetails(
        {}
      );

      const payload = {
        latitude: Number(latitude.toFixed(6)),
        longitude: Number(longitude.toFixed(6)),
      };

      await apiClient.patch(`${OUTPUNCH_URL}${inpunchId}/`, payload);

      // Clear punch state after successful punch out
      // User should not have access to Farmer/Dealer after punching out
      setHasInpunch(false);
      setInpunchId(null);
      await storage.remove("punchId");
      
      Alert.alert(
        "Success",
        "Outpunch recorded successfully",
         [{ text: "OK"}],
        { cancelable: true }
      );
    } catch (error) {
      logger.error("Punch out error:", error);
      
      if (error.response?.status === 401) {
        Alert.alert("Session Expired", MESSAGES.SESSION_EXPIRED);
      } else if (!error.response) {
        Alert.alert("Network Error", MESSAGES.NETWORK_ERROR);
      } else {
        Alert.alert("Error", MESSAGES.PUNCH_OUT_FAILED);
      }
    } finally {
      setIsPunchOutLoading(false);
    }
  }, [isPunchOutLoading, inpunchId]);

  // Debounced handlers to prevent rapid taps
  const debouncedHandleInpunch = useCallback(
    debounce(() => {
      handleInpunch();
    }, 300),
    [handleInpunch]
  );

  const debouncedHandleOutpunch = useCallback(
    debounce(() => {
      handleOutpunch();
    }, 300),
    [handleOutpunch]
  );

  const AnimatedSubContainer = ({ children, delay = 0 }) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
          tension: 100,
          delay,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          delay,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    return (
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }}
      >
        {children}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      
      {/* Status Badge */}
      <View
        style={[
          styles.statusBadge,
          hasInpunch
            ? styles.statusBadgeActive
            : styles.statusBadgeInactive,
        ]}
      >
        <Ionicons
          name={hasInpunch ? "checkmark-circle" : "time-outline"}
          size={16}
          color={hasInpunch ? "#2E7D32" : "#FF8F00"}
        />
        <Text
          style={[
            styles.statusText,
            hasInpunch
              ? styles.statusTextActive
              : styles.statusTextInactive,
          ]}
        >
          {hasInpunch ? "Punched In" : "Not Punched"}
        </Text>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Punch Button Section */}
        <AnimatedSubContainer delay={100}>
          <View style={styles.punchSection}>
            <TouchableHighlight
              style={[
                styles.punchButton,
                hasInpunch
                  ? styles.punchButtonActive
                  : styles.punchButtonInactive,
                (isPunchInLoading || isPunchOutLoading) && styles.punchButtonDisabled,
              ]}
              onPress={hasInpunch ? debouncedHandleOutpunch : debouncedHandleInpunch}
              underlayColor={hasInpunch ? "#45A049" : "#E53935"}
              activeOpacity={0.8}
              disabled={isPunchInLoading || isPunchOutLoading}
            >
              <View style={{ alignItems: "center" }}>
                {(isPunchInLoading || isPunchOutLoading) ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.punchButtonText}>
                      {isPunchInLoading ? "Processing..." : "Processing..."}
                    </Text>
                  </View>
                ) : (
                  <>
                    <Ionicons
                      name={hasInpunch ? "log-out-outline" : "log-in-outline"}
                      size={32}
                      color="#FFFFFF"
                      style={styles.punchIcon}
                    />
                    <Text style={styles.punchButtonText}>
                      {hasInpunch ? "Punch Out" : "Punch In"}
                    </Text>
                  </>
                )}
              </View>
            </TouchableHighlight>
          </View>
        </AnimatedSubContainer>

        {/* Action Cards Grid */}
        <View style={styles.actionsGrid}>
          <AnimatedSubContainer delay={200}>
            <TouchableHighlight
              style={[
                styles.actionCard,
                !hasInpunch && styles.actionCardDisabled,
              ]}
              onPress={() => {
                if (!hasInpunch) {
                  Alert.alert(
                    "Access Restricted",
                    `${MESSAGES.ACCESS_RESTRICTED} Farmer Enquiry.`
                  );
                  return;
                }
                navigation.navigate("Farmer", { inpunch_id: inpunchId });
              }}
              underlayColor="#F5F5F5"
              activeOpacity={hasInpunch ? 0.7 : 1}
            >
              <View style={{ alignItems: "center" }}>
                <Ionicons
                  name="leaf-outline"
                  size={32}
                  color={hasInpunch ? "#2E7D32" : "#757575"}
                  style={styles.actionIcon}
                />
                <Text
                  style={[
                    styles.actionTitle,
                    !hasInpunch && styles.actionTitleDisabled,
                  ]}
                >
                  Farmer Enquiry
                </Text>
              </View>
            </TouchableHighlight>
          </AnimatedSubContainer>

          <AnimatedSubContainer delay={300}>
            <TouchableHighlight
              style={[
                styles.actionCard,
                !hasInpunch && styles.actionCardDisabled,
              ]}
              onPress={() => {
                if (!hasInpunch) {
                  Alert.alert(
                    "Access Restricted",
                    `${MESSAGES.ACCESS_RESTRICTED} Dealer Enquiry.`
                  );
                  return;
                }
                navigation.navigate("Dealer");
              }}
              underlayColor="#F5F5F5"
              activeOpacity={hasInpunch ? 0.7 : 1}
            >
              <View style={{ alignItems: "center" }}>
                <Ionicons
                  name="storefront-outline"
                  size={32}
                  color={hasInpunch ? "#FF8F00" : "#757575"}
                  style={styles.actionIcon}
                />
                <Text
                  style={[
                    styles.actionTitle,
                    !hasInpunch && styles.actionTitleDisabled,
                  ]}
                >
                  Dealer Enquiry
                </Text>
              </View>
            </TouchableHighlight>
          </AnimatedSubContainer>
        </View>
      </View>
    </View>
  );
}

export default Dashboard;

