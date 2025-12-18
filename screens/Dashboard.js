import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useContext, useEffect, useRef, useState, useCallback } from "react";
import {
  Alert,
  Text,
  TouchableHighlight,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import apiClient from "../src/api/client";
import authContext from "../src/auth/context";
import authStorage from "../src/auth/storage"
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
import DashboardSkeleton from "../src/components/appSkeleton/DashboardSkeleton";
import { useNavigation } from "@react-navigation/native";
import { getBrandConfig } from '../src/config/appConfig'
import { useModulePermission } from "../src/hooks/usePermissions";
import { MODULES } from "../src/auth/permissions";

const INPUNCH_URL = process.env.EXPO_PUBLIC_INPUNCH_URL;
const OUTPUNCH_URL = process.env.EXPO_PUBLIC_OUTPUNCH_URL;

function Dashboard() {
  const drawerNavigation = useNavigation();
  const [hasInpunch, setHasInpunch] = useState(false);
  const [inpunchId, setInpunchId] = useState(null);
  const [isPunchInLoading, setIsPunchInLoading] = useState(false);
  const [isPunchOutLoading, setIsPunchOutLoading] = useState(false);
  const { user, setUser, username, setUsername } = useContext(authContext);
  const swipeRef = useRef(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const insets = useSafeAreaInsets();
  const { brandName } = getBrandConfig();
  const { canRead: canReadFarmers, canCreate: canCreateFarmers } = useModulePermission(MODULES.FARMER) || {};
  const { canRead: canReadDealers, canCreate: canCreateDealers } = useModulePermission(MODULES.DEALER) || {};
  const hasInpunchRef = useRef(false);

  const inpunchIdRef = useRef(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);


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

  const onSwipeHandler = useCallback(() => {
    if (isPunchInLoading || isPunchOutLoading || actionLoading) return;

    const currentHasInpunch = hasInpunchRef.current;
    if (currentHasInpunch) {
      handleOutpunch();
    } else {
      handleInpunch();
    }
  }, [hasInpunchRef, handleInpunch, handleOutpunch, isPunchInLoading, isPunchOutLoading, actionLoading]);



  const {
    modalVisible,
    modalType,
    setModalVisible,
    checkRestrictions,
    openSettings,
  } = useDeviceRestrictions();

  const checkPunchStatus = useCallback(async (isRefresh = false, isAction = false) => {
    if (!isRefresh && !isAction) setInitialLoading(true);
    try {
      const response = await apiClient.get("track/dashboard/today/");
      setDashboardData(response.data);

      const fetchedUsername = response.data.user_name;
      if (fetchedUsername) {
        setUsername(fetchedUsername);
        await authStorage.saveUsername(fetchedUsername);
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
    } finally {
      if (!isRefresh && !isAction) setInitialLoading(false);
    }
  }, []);

  // Initial mount and auth changes trigger
  useEffect(() => {

    if (user) {
      const loadCachedUsername = async () => {
        const cachedName = await authStorage.getUsername();
        if (cachedName) setUsername(cachedName);
      };
      loadCachedUsername();
      if (user) checkPunchStatus(false, false);
    } else {
      // Clear state when user logs out
      setHasInpunch(false);
      setInpunchId(null);
      storage.remove("punchId");
    }
  }, [user]);


  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await checkPunchStatus(true, false);
    setRefreshing(false);
  }, [checkPunchStatus]);


  const handleInpunch = useCallback(async () => {

    const restrictionActive = await checkRestrictions();
    if (restrictionActive) {
      swipeRef.current?.reset();
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
              await checkPunchStatus(false, true);

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
              setIsPunchInLoading(false); // FIX
              setActionLoading(false);
              swipeRef.current?.reset();
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
              await checkPunchStatus(false, true);

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
              setIsPunchOutLoading(false); // FIX
              setActionLoading(false);
              swipeRef.current?.reset();
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

  return (
    <View style={styles.container}>

      {/* Custom Header */}
      <View style={styles.header}>

        <View style={styles.headerContent}>
          {/* Top Row */}
          <View style={styles.headerTopRow}>
            <View style={styles.headerBrandSection}>
              <View>
                <Text style={styles.headerTitle}>{brandName}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => drawerNavigation.openDrawer()}
              style={{ padding: 8, backgroundColor: 'rgba(38, 84, 55, 0.2)', borderRadius: 5 }}
            >
              <Ionicons name="menu" size={28} color={DESIGN.colors.surface} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {initialLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
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
            <View style={styles.mainContent}>

              <View style={styles.welcomeContainer}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '500',
                  color: DESIGN.colors.textSecondary,
                }}>{getTimeBasedGreeting()}!</Text>
                <Text style={{
                  fontSize: 22,
                  fontStyle: "normal",
                  fontWeight: '500',
                  color: DESIGN.colors.textPrimary,
                  paddingLeft: 20,
                }} numberOfLines={1}>
                  {dashboardData?.user_name || username}
                </Text>
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
                    if (!canReadFarmers) {
                      Alert.alert("Access Restricted", `You do not have permission to view Farmers.`);
                      return;
                    }
                    navigation.navigate("Farmer", { inpunch_id: inpunchId, canCreate: !!canCreateFarmers });
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
                    if (!canReadDealers) {
                      Alert.alert("Access Restricted", `You do not have permission to view Dealers.`);
                      return;
                    }
                    navigation.navigate("Dealer", { canCreate: !!canCreateDealers });
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
              <View style={{ marginHorizontal: DESIGN.spacing.sm }}>
                <View style={styles.activityHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: DESIGN.spacing.sm }}>
                    <Text style={styles.activityTitle}>Punch Activity</Text>
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
            </View>
          </ScrollView>

          <View style={{ marginHorizontal: DESIGN.spacing.md, marginBottom: DESIGN.spacing.md, alignItems: 'center', justifyContent: 'center' }}>
            <SwipePunchButton
              ref={swipeRef}
              hasInpunch={hasInpunch}
              loading={isPunchInLoading || isPunchOutLoading || actionLoading}
              onSwipe={onSwipeHandler}
            />
          </View>
        </>
      )}

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

    </View>
  );

}

export default Dashboard;
