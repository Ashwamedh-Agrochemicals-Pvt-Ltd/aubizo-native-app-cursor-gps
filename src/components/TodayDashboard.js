// components/TodayDashboard.js
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import DESIGN from "../theme";

// Individual Section Components
const HeaderSection = ({ date, userName }) => (
  <View style={styles.header}>
    <Text style={styles.date}>{date || "--/--/----"}</Text>
    <Text style={styles.userName}>Hello, {userName || "User"}</Text>
  </View>
);

const VisitSummarySection = ({ visit_summary }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Visit Summary</Text>
    <View style={styles.visitRow}>
      <Text style={styles.visitItem}>
        Total Visits: {visit_summary?.total_visits ?? 0}
      </Text>
      <Text style={styles.visitItem}>
        Farmers: {visit_summary?.farmer_visits ?? 0}
      </Text>
      <Text style={styles.visitItem}>
        Dealers: {visit_summary?.dealer_visits ?? 0}
      </Text>
    </View>
  </View>
);

const PunchStatusSection = ({ punch_status }) => {
  if (!punch_status) return null;

  const { punched_in, punched_out, punch_in_time, punch_out_time } = punch_status;

  if (!punched_in && !punched_out) return null;

  return (
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
          <Text style={styles.punchTime}>{punch_out_time || "--:--"}</Text>
        </View>
      )}
    </View>
  );
};

const TodayDashboard = ({ dashboardData, onRefreshDashboard }) => {
  const [date, setDate] = useState(new Date().toLocaleDateString());
  const [userName, setUserName] = useState("User");
  const [refreshing, setRefreshing] = useState(false);

  // Sync username from dashboardData or SecureStore
  const syncUserName = useCallback(async () => {
    if (dashboardData?.user_name) {
      await SecureStore.setItemAsync("user_name", dashboardData.user_name);
      setUserName(dashboardData.user_name);
    } else {
      const storedName = await SecureStore.getItemAsync("user_name");
      if (storedName) setUserName(storedName);
    }
  }, [dashboardData]);

  useEffect(() => {
    if (dashboardData?.date) setDate(dashboardData.date);
    syncUserName();
  }, [dashboardData, syncUserName]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (onRefreshDashboard) await onRefreshDashboard();
    if (dashboardData?.date) setDate(dashboardData.date);
    syncUserName();
    setRefreshing(false);
  };

  const { visit_summary, punch_status } = dashboardData || {};

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[DESIGN.colors.primary]}
          tintColor={DESIGN.colors.primary}
        />
      }
    >
      <HeaderSection date={date} userName={userName} />
      <VisitSummarySection visit_summary={visit_summary} />
      <PunchStatusSection punch_status={punch_status} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: DESIGN.spacing.lg,
  },
  date: {
    fontSize: DESIGN.typography.body.fontSize,
    fontWeight: DESIGN.typography.body.fontWeight,
    color: DESIGN.colors.textSecondary,
  },
  userName: {
    fontSize: DESIGN.typography.title.fontSize,
    fontWeight: "bold",
    color: DESIGN.colors.textPrimary,
    marginTop: DESIGN.spacing.xs,
  },
  section: {
    backgroundColor: DESIGN.colors.surface,
    padding: DESIGN.spacing.md,
    borderRadius: DESIGN.borderRadius.sm,
    marginBottom: DESIGN.spacing.lg,
    ...DESIGN.shadows.subtle,
  },
  sectionTitle: {
    fontSize: DESIGN.typography.subtitle.fontSize,
    fontWeight: "bold",
    marginBottom: DESIGN.spacing.md,
    color: DESIGN.colors.primary,
  },
  punchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: DESIGN.spacing.sm,
  },
  punchLabel: {
    fontSize: DESIGN.typography.body.fontSize,
    color: DESIGN.colors.textSecondary,
    marginRight: DESIGN.spacing.sm,
  },
  punchTime: {
    fontSize: DESIGN.typography.bodyLarge.fontSize,
    fontWeight: "bold",
    color: DESIGN.colors.textPrimary,
  },
  visitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  visitItem: {
    fontSize: DESIGN.typography.body.fontSize,
    color: DESIGN.colors.textPrimary,
  },
});

export default TodayDashboard;
