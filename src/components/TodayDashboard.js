// components/TodayDashboard.js
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import NetInfo from "@react-native-community/netinfo";
import DESIGN from "../theme";

const TodayDashboard = ({ dashboardData, onRefreshDashboard }) => {
  const [date, setDate] = useState(""); // initially blank
  const [userName, setUserName] = useState(""); // initially blank
  const [isSlowInternet, setIsSlowInternet] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Handle Date (API or Device)
  const loadDate = useCallback(async () => {
    setIsLoading(true);
    const netInfo = await NetInfo.fetch();

    if (!netInfo.isConnected || netInfo.details?.downlink < 0.2) {
      setIsSlowInternet(true);
      setIsLoading(false);
      return;
    }

    setIsSlowInternet(false);

    if (dashboardData?.date) {
      setDate(dashboardData.date);
    } else {
      const deviceDate = new Date().toLocaleDateString();
      setDate(deviceDate);
    }
    setIsLoading(false);
  }, [dashboardData]);

  // Handle User Name (SecureStore)
  const syncUserName = useCallback(async () => {
    if (dashboardData?.user_name) {
      await SecureStore.setItemAsync("user_name", dashboardData.user_name);
      setUserName(dashboardData.user_name);
    } else {
      const storedName = await SecureStore.getItemAsync("user_name");
      if (storedName) setUserName(storedName);
    }
  }, [dashboardData]);

  // Initial load
  useEffect(() => {
    loadDate();
    syncUserName();
  }, [dashboardData, loadDate, syncUserName]);

  // Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    if (onRefreshDashboard) {
      await onRefreshDashboard(); // call parent function to refetch data
    }
    await loadDate();
    await syncUserName();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={DESIGN.colors.primary} />
        <Text style={styles.loaderText}>Refreshing...</Text>
      </View>
    );
  }

  if (!dashboardData || isSlowInternet) {
    return <View style={styles.blankContainer}></View>;
  }

  const { punch_status, visit_summary } = dashboardData;
  const { punched_in, punched_out, punch_in_time, punch_out_time } =
    punch_status || {};

  // Data for FlatList (to keep pull-to-refresh)
  const dashboardSections = [
    {
      key: "header",
      render: () => (
        <View style={styles.header}>
          <Text style={styles.date}>{date || " "}</Text>
          <Text style={styles.userName}>Hello, {userName || " "}</Text>
        </View>
      ),
    },
   
    {
      key: "visitSummary",
      render: () =>
        visit_summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Visit Summary</Text>
            <View style={styles.visitRow}>
              <Text style={styles.visitItem}>
                Total Visits: {visit_summary.total_visits}
              </Text>
              <Text style={styles.visitItem}>
                Farmers: {visit_summary.farmer_visits}
              </Text>
              <Text style={styles.visitItem}>
                Dealers: {visit_summary.dealer_visits}
              </Text>
            </View>
          </View>
        ),
    },
     {
      key: "punchStatus",
      render: () =>
        (punched_in || punched_out) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Punch Status</Text>
            {punched_in && (
              <View style={styles.punchRow}>
                <Text style={styles.punchLabel}>Punch In: </Text>
                <Text style={styles.punchTime}>{punch_in_time || "--:--"}</Text>
              </View>
            )}
            {punched_out && (
              <View style={styles.punchRow}>
                <Text style={styles.punchLabel}>Punch Out: </Text>
                <Text style={styles.punchTime}>
                  {punch_out_time || "--:--"}
                </Text>
              </View>
            )}
          </View>
        ),
    },
  ];

  return (
    <FlatList
      data={dashboardSections}
      keyExtractor={(item) => item.key}
      renderItem={({ item }) => item.render()}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[DESIGN.colors.primary]}
          tintColor={DESIGN.colors.primary}
        />
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  blankContainer: {
    flex: 1,
    backgroundColor: DESIGN.colors.background,
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DESIGN.colors.background,
  },
  loaderText: {
    marginTop: 8,
    fontSize: 14,
    color: DESIGN.colors.primary,
  },
  header: {
    marginBottom: 20,
  },
  date: {
    fontSize: 16,
    color: DESIGN.colors.textSecondary,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: DESIGN.colors.textPrimary,
    marginTop: 4,
  },
  section: {
    backgroundColor: DESIGN.colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: DESIGN.colors.primary,
  },
  punchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  punchLabel: {
    fontSize: 16,
    color: DESIGN.colors.textSecondary,
    marginRight: 8,
  },
  punchTime: {
    fontSize: 18,
    fontWeight: "bold",
    color: DESIGN.colors.textPrimary,
  },
  visitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  visitItem: {
    fontSize: 14,
    color: DESIGN.colors.textPrimary,
  },
});

export default TodayDashboard;
