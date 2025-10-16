import { FontAwesome, Ionicons } from "@expo/vector-icons";
import React, { useContext, useEffect, useRef, useState, useCallback, use } from "react";
import {
  Alert,
  Text,
  TouchableHighlight,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Pressable,
  ActivityIndicator
} from "react-native";
import apiClient from "../src/api/client";
import authContext from "../src/auth/context";
import authStorage from "../src/auth/storage";
import { navigation } from "../navigation/NavigationService";
import styles from "../src/styles/dashboard.style"
import Location from "../src/utility/location";
import storage from "../src/utility/storage";
import logger from "../src/utility/logger";
import SwipePunchButton from "../src/components/dashboard/SwipePunchButton";
import showToast from "../src/utility/showToast";
import useDeviceRestrictions from "../src/hooks/useDeviceRestrictions";
import GenericSettingsModal from "../src/components/GenericSettingsModal";
import DESIGN from "../src/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useAuth from "../src/auth/useAuth";
import { useFocusEffect } from "@react-navigation/native";

const INPUNCH_URL = process.env.EXPO_PUBLIC_INPUNCH_URL;
const OUTPUNCH_URL = process.env.EXPO_PUBLIC_OUTPUNCH_URL;

function Dashboard() {
  const [hasInpunch, setHasInpunch] = useState(false);
  const [inpunchId, setInpunchId] = useState(null);
  const [isPunchInLoading, setIsPunchInLoading] = useState(false);
  const [isPunchOutLoading, setIsPunchOutLoading] = useState(false);
  const { user, setUser } = useContext(authContext);
  const swipeRef = useRef(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const insets = useSafeAreaInsets();
  const hasInpunchRef = useRef(false);
  const { logOut } = useAuth();
  const inpunchIdRef = useRef(null);
  const [showLogoutText, setShowLogoutText] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("User");

  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "Good Morning";
    } else if (hour < 17) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  };

  // Create stable function reference for onSwipe
  const onSwipeHandler = useCallback(() => {
    // Use ref to get the most current state value
    const currentHasInpunch = hasInpunchRef.current;

    if (currentHasInpunch) {
      handleOutpunch();
    } else {
      handleInpunch();
    }
  }, [handleOutpunch, handleInpunch]);

  const {
    modalVisible,
    modalType,
    setModalVisible,
    checkRestrictions,
    openSettings,
  } = useDeviceRestrictions();

  const checkPunchStatus = useCallback(async () => {
    setLoading(true);
    try {

      const response = await apiClient.get("track/dashboard/today/");
      setDashboardData(response.data);

      const fetchedUsername = response.data.user_name;
      if (fetchedUsername) {
        setUsername(fetchedUsername);
        await authStorage.saveUsername(fetchedUsername); // save in SecureStore
      }

      const { punched_in, punched_out, punch_id } = response.data.punch_status;
      if (punched_in == true && punched_out == false) {
        const punchId = String(punch_id);

        // Sync local storage with server state
        await storage.set("punchId", punchId);
        setInpunchId(punchId);
        inpunchIdRef.current = punchId; // Update ref
        setHasInpunch(true);
        hasInpunchRef.current = true; // Update ref

        // Ensure user stays logged in
        const token = await authStorage.getUser();

        if (token) {
          setUser(token);
        }
      } else if (punched_in == true && punched_out == true) {
        setHasInpunch(false);
        hasInpunchRef.current = false; // Update ref
        setInpunchId(null);
        inpunchIdRef.current = null; // Update ref
        // Clear storage after punch out - user should not have access
        await storage.remove("punchId");
      } else {
        setHasInpunch(false);
        hasInpunchRef.current = false; // Update ref
        setInpunchId(null);
        inpunchIdRef.current = null; // Update ref
        // Clear storage when no punch record exists
        await storage.remove("punchId");
      }
    } catch (error) {
      logger.error("Error checking punch status:", error);
      console.log("Error checking punch status:", error);
      // Offline fallback: load username from SecureStore
      const cachedName = await authStorage.getUsername();
      console.log("Cached username:", cachedName);
      if (cachedName) setUsername(cachedName);
      console.log("Using cached username due to error.", use);
    } finally {
      setLoading(false); // hide loader
    }
  }, [setUser, hasInpunch]);

  // Initial mount and auth changes trigger
  useEffect(() => {
    if (user) {
      const loadCachedUsername = async () => {
        const cachedName = await authStorage.getUsername();
        console.log("Cached username:", cachedName);
        if (cachedName) setUsername(cachedName);
      };
      loadCachedUsername();
      checkPunchStatus();
    } else {
      // Clear state when user logs out
      setHasInpunch(false);
      setInpunchId(null);
      storage.remove("punchId");
    }
  }, [user, checkPunchStatus]);

  useFocusEffect(
    React.useCallback(() => {

      setShowLogoutText(false);

    }, [])
  );

  const onRefresh = useCallback(async () => {

    setRefreshing(true);

    await checkPunchStatus();
    setShowLogoutText(false);


    // your existing API call
    setRefreshing(false);
  }, [checkPunchStatus]);

  const handleInpunch = useCallback(async () => {
    if (isPunchInLoading) return; // Prevent double-clicks
    const restrictionActive = await checkRestrictions();
    if (restrictionActive) {
      swipeRef.current?.reset(); // stop swipe if restriction modal is showing
      return;
    }

    Alert.alert(
      "Confirm Punch In",
      "Are you sure you want to punch in?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            swipeRef.current?.reset();
          },
        },
        {
          text: "Yes",
          onPress: async () => {
            setIsPunchInLoading(true);
            try {
              const { latitude, longitude } =
                await Location.getCurrentLocationDetails();

              const payload = {
                latitude: Number(latitude.toFixed(6)),
                longitude: Number(longitude.toFixed(6)),
              };

              console.log("Calling inpunch API with payload:", payload);
              const response = await apiClient.post(INPUNCH_URL, payload);
              console.log("API call finished");
              console.log("Response:", response.data);
              const id = String(response.data.data.id);

              console.log("Response:", response.data);

              // Store punch ID with correct key
              await storage.set("punchId", id);
              setInpunchId(id);
              inpunchIdRef.current = id; // Update ref

              // Refresh status from server to ensure state consistency
              await checkPunchStatus();

              // ✅ Success toast (same style as outpunch)
              showToast.success(
                "Punch In Successful",
                "Your inpunch was recorded successfully"
              );
              // Remove manual state setting - let checkPunchStatus handle it
            } catch (error) {
              logger.error("Punch in error:", error);
              Alert.alert(
                "Punch In Restricted",
                "You can only record one inpunch per day"
              );
            } finally {
              setIsPunchInLoading(false);
            }
          },
        },
      ],
      {
        cancelable: true,
        onDismiss: () => {
          swipeRef.current?.reset(); // reset if dismissed by tapping outside
        },
      }
    );
  }, [isPunchInLoading, swipeRef, checkPunchStatus, checkRestrictions]);

  const handleOutpunch = useCallback(async () => {
    if (isPunchOutLoading) return; // Prevent double-clicks

    const restrictionActive = await checkRestrictions();
    if (restrictionActive) {
      swipeRef.current?.reset(); // stop swipe if restriction modal is showing
      return;
    }

    Alert.alert(
      "Confirm Punch Out",
      "Are you sure you want to punch out?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            // Reset swipe thumb if cancelled
            swipeRef.current?.reset();
          },
        },
        {
          text: "Yes",
          onPress: async () => {
            setIsPunchOutLoading(true);
            try {
              const { latitude, longitude } =
                await Location.getCurrentLocationDetails();

              const payload = {
                latitude: Number(latitude.toFixed(6)),
                longitude: Number(longitude.toFixed(6)),
              };

              await apiClient.patch(
                `${OUTPUNCH_URL}${inpunchIdRef.current}/`,
                payload
              );

              // Refresh status from server to ensure consistency
              await checkPunchStatus();

              // ✅ Success Toast instead of Alert
              showToast.success(
                "Punch Out Successful",
                "Your outpunch was recorded successfully"
              );
            } catch (error) {
              logger.error("Punch out error:", error);

              if (error.response?.status === 401) {
              } else if (!error.response) {
                return;
              } else if (error.response?.status === 404) {
                Alert.alert(
                  "API Error",
                  "Punch out endpoint not found. Please check the API configuration."
                );
              } else {
              }
            } finally {
              setIsPunchOutLoading(false);
            }
          },
        },
      ],
      {
        cancelable: true,
        onDismiss: () => {
          swipeRef.current?.reset(); // reset if dismissed by tapping outside
        },
      }
    );
  }, [
    isPunchOutLoading,
    swipeRef,
    checkPunchStatus,
    inpunchId,
    checkRestrictions,
  ]);

  const handleLogout = async () => {
    try {

      const result = await logOut();
      if (__DEV__) {
        console.log("Logout result:", result);
      }
      if (result && result.success) {
        // Logout successful - the auth context will handle navigation to Login
        showToast.success("Logged out successfully.");
      } else {
        showToast.error("Failed to log out. Try again.", "Error");
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Logout error:", error);
      }
      showToast.error("Failed to log out. Try again.", "Error");
    }
    return;
  };


  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color={DESIGN.colors.primary} />
        </View>
      )}
      <Pressable
        style={{ flex: 1 }}
        onPress={() => showLogoutText && setShowLogoutText(false)} // close on outside press
      >
        {/* Custom Header */}
        <View style={styles.header}>
          {/* Gradient Overlay Effect */}
          <View style={[styles.headerGradientOverlay, { backgroundColor: '#000' }]} />

          <View style={styles.headerContent}>
            {/* Top Row */}
            <View style={styles.headerTopRow}>
              <View style={styles.headerBrandSection}>
                <View>
                  <Text style={styles.headerTitle}>Aubizo</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.enhancedLogoutButton}
                onPress={() => setShowLogoutText(prev => !prev)}
                activeOpacity={0.8}
              >
                <View style={styles.logoutButtonInner}>
                  <FontAwesome
                    name="power-off"
                    size={20}
                    color={DESIGN.colors.surface} />
                </View>
                <View style={styles.logoutButtonGlow} />
              </TouchableOpacity>

            </View>
          </View>

          {/* Enhanced Logout Confirmation */}
          {showLogoutText && (
            <TouchableOpacity style={styles.modernLogoutPopup} onPress={handleLogout}>
              <View style={styles.logoutPopupContent}>
                <View style={styles.logoutIconCircle}>
                  <FontAwesome
                    name="sign-out"
                    size={16}
                    color={DESIGN.colors.error}
                  />
                </View>
                <Text style={styles.enhancedLogoutText}>Sign Out</Text>
                <FontAwesome
                  name="angle-right"
                  size={14}
                  color={DESIGN.colors.textSecondary}
                />
              </View>
              <View style={styles.logoutPopupArrow} />
            </TouchableOpacity>
          )}
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[DESIGN.colors.primary]}
              tintColor={DESIGN.colors.primary}
            />
          }
         >
          {/* Main Content */}
          <View style={styles.mainContent}>
            
            {/* Enhanced Greeting Section */}
            <View style={styles.enhancedGreetingCard}>
              {/* Gradient Background */}
              <View style={styles.greetingGradientOverlay} />
              
              {/* Decorative Elements */}
              <View style={styles.greetingDecorations}>
                <View style={styles.decorativeCircle1} />
                <View style={styles.decorativeCircle2} />
              </View>

              <View style={styles.greetingContent}>
              
                {/* Welcome Text Section */}
                <View style={styles.enhancedWelcomeContainer}>
                  <Text style={styles.enhancedWelcomeText}>
                    {getTimeBasedGreeting()}!
                  </Text>
                  <Text
                    style={styles.enhancedUserNameText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {dashboardData?.user_name || username}
                  </Text>
                 
                </View>

              </View>

              {/* Animated Pulse Effect */}
              <View style={styles.pulseEffect} />
            </View>

            {/* Visit Overview */}
            <TouchableHighlight
              underlayColor="transparent"
              onPress={() => {
                if (!dashboardData?.recent_visits?.length) return;
                navigation.navigate("VisitHistory", {
                  visits: dashboardData.recent_visits,
                });
              }
              }
            >
              <View style={styles.section}>
                <View style={styles.visitTitleRow}>
                  <Text style={styles.visitTitleText}>
                    Visit Overview
                  </Text>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>
                      Today
                    </Text>
                  </View>
                </View>

                {/* Chevron in the middle of the card */}
                {(dashboardData?.visit_summary?.total_visits || 0) > 0 && (
                  <View style={styles.visitChevronContainer}>
                    <View style={styles.visitChevron}>
                      <FontAwesome
                        name="angle-right"
                        size={20}
                        color={DESIGN.colors.textSecondary}
                      />
                    </View>
                  </View>
                )}

                <View style={styles.visitRow}>
                  <View style={styles.visitItemContainer}>
                    <Text style={styles.visitCount}>
                      {dashboardData?.visit_summary?.total_visits || 0}
                    </Text>
                    <Text style={styles.visitLabel}>Total Visits</Text>
                  </View>

                  <View style={styles.visitDivider} />

                  <View style={styles.visitItemContainer}>
                    <Text style={styles.visitCount}>
                      {dashboardData?.visit_summary?.farmer_visits || 0}
                    </Text>
                    <Text style={styles.visitLabel}>Farmers</Text>
                  </View>

                  <View style={styles.visitDivider} />

                  <View style={styles.visitItemContainer}>
                    <Text style={styles.visitCount}>
                      {dashboardData?.visit_summary?.dealer_visits || 0}
                    </Text>
                    <Text style={styles.visitLabel}>Dealers</Text>
                  </View>
                </View>

              </View>
            </TouchableHighlight>

            {/* Action Cards */}
            <View style={styles.actionsGrid}>
              <TouchableHighlight
                style={[styles.actionCard, !hasInpunch && styles.actionCardDisabled]}
                onPress={() => {
                  if (!hasInpunch) {
                    Alert.alert("Access Restricted", `You must be punched in to access Farmer Enquiry.`);
                    return;
                  }
                  navigation.navigate("Farmer", { inpunch_id: inpunchId });
                }}
                underlayColor={DESIGN.colors.surfaceElevated}
                activeOpacity={hasInpunch ? 0.7 : 1}
              >
                <View style={{ alignItems: "center" }}>
                  <FontAwesome
                    name="leaf"
                    size={DESIGN.iconSize.lg}
                    color={hasInpunch ? DESIGN.colors.primary : DESIGN.colors.textSecondary}
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

              <TouchableHighlight
                style={[styles.actionCard, !hasInpunch && styles.actionCardDisabled]}
                onPress={() => {
                  if (!hasInpunch) {
                    Alert.alert("Access Restricted", `You must be punched in to access Dealer Enquiry.`);
                    return;
                  }
                  navigation.navigate("Dealer");
                }}
                underlayColor={DESIGN.colors.surfaceElevated}
                activeOpacity={hasInpunch ? 0.7 : 1}
              >
                <View style={{ alignItems: "center" }}>
                  <Ionicons
                    name="storefront-outline"
                    size={DESIGN.iconSize.lg}
                    color={hasInpunch ? DESIGN.colors.secondary : DESIGN.colors.textSecondary}
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
            </View>
          

           {/* Activity Section */} 
          
            <View style={styles.activityHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: DESIGN.spacing.sm }}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={DESIGN.colors.textPrimary}
                />
                <Text style={styles.activityTitle}>Today's Activity</Text>
              </View>
              {dashboardData?.punch_status?.punched_out && (
                <Text style={styles.activitySubtitle}>
                  {
                    (() => {
                      const totalHours = dashboardData.working_hours;
                      const hrs = Math.floor(totalHours);
                      const mins = Math.round((totalHours - hrs) * 60);

                      if (hrs === 0) return `${mins} min`;
                      return `${hrs}h ${mins}m`;
                    })()
                  }
                </Text>
              )}
            </View>

            {/* Punch In */}
            {dashboardData?.punch_status?.punched_in && (
              <View style={styles.punchSection}>
                <View style={styles.punchSectionRow}>
                  <View style={styles.punchIconWrapper(DESIGN.colors.success)}>
                    <Ionicons name="arrow-up" size={DESIGN.iconSize.md} color={DESIGN.colors.success} />
                  </View>
                  <Text style={styles.punchLabel}> Punch In </Text>
                </View>
                <Text style={styles.punchTime}>{dashboardData?.punch_status?.punch_in_time || "--:--"}</Text>
              </View>
            )}

            {/* Punch Out */}
            {dashboardData?.punch_status?.punched_out && (
              <View style={styles.punchSection}>
                <View style={styles.punchSectionRow}>
                  <View style={styles.punchIconWrapper(DESIGN.colors.error)}>
                    <Ionicons name="arrow-down" size={DESIGN.iconSize.md} color={DESIGN.colors.error} />
                  </View>
                  <Text style={styles.punchLabel}> Punch Out </Text>
                </View>
                <Text style={styles.punchTime}>{dashboardData?.punch_status?.punch_out_time || "--:--"}</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Punch Button */}
        <SwipePunchButton
          ref={swipeRef}
          hasInpunch={hasInpunch}
          loading={isPunchInLoading || isPunchOutLoading}
          onSwipe={onSwipeHandler}
        />

        {/* Modal */}
        {modalVisible && (
          <GenericSettingsModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            title={modalType === "developer" ? "Developer Mode Detected" : "Location Disabled"}
            message={
              modalType === "developer"
                ? "Your device is in Developer Mode. Disable it to continue."
                : "Location is turned off. Enable location services to continue."
            }
            primaryText="Open Settings"
            onPrimaryPress={openSettings}
            secondaryText="Will do it later"
          />
        )}
      </Pressable>
    </View>
  );

}

export default Dashboard;
