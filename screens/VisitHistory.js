import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import DESIGN from "../src/theme";

export default function VisitHistory({ route }) {
  const { visits } = route.params;
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [refreshVisits, setRefreshVisits] = useState(visits);
  const [refreshing, setRefreshing] = useState(false);

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const fetchVisits = async () => {
        setLoading(true);
        try {
          // Here you can call your API for latest visits if needed
          // const response = await apiClient.get("track/dashboard/today/");
          // setRefreshVisits(response.data.recent_visits);

          // For now, just reload existing visits
          setRefreshVisits(visits);
        } catch (err) {
          console.error("Failed to fetch visits:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchVisits();
    }, [visits])
  );

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      // If API available, fetch new visits
      // const response = await apiClient.get("track/dashboard/today/");
      // setRefreshVisits(response.data.recent_visits);
      setRefreshVisits(visits); // For now, just reload existing visits
    } catch (err) {
      console.error("Failed to refresh visits:", err);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [visits]);

  const farmers = refreshVisits.filter((v) => v.entity_type === "Farmer");
  const dealers = refreshVisits.filter((v) => v.entity_type === "Dealer");

  const renderVisitCard = (item) => (
    <View
      key={item.id}
      style={[
        styles.visitCard,
        item.status === "ongoing" && { borderColor: DESIGN.colors.secondary },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.entityName}>{item.entity_name}</Text>
      </View>
      <Text
        style={[
          styles.visitStatus,
          item.status === "ongoing" && { color: DESIGN.colors.secondary },
        ]}
      >
        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.loaderContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={DESIGN.colors.primary} />
        <Text style={styles.loaderText}>Loading visits...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 20 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[DESIGN.colors.primary]}
          tintColor={DESIGN.colors.primary}
        />
      }
    >
      {/* Farmers Section */}
      <Text style={styles.sectionHeader}>Farmers</Text>
      {farmers.length === 0 ? (
        <Text style={styles.emptyText}>No farmer visits</Text>
      ) : (
        farmers.map(renderVisitCard)
      )}

      {/* Dealers Section */}
      <Text style={styles.sectionHeader}>Dealers</Text>
      {dealers.length === 0 ? (
        <Text style={styles.emptyText}>No dealer visits</Text>
      ) : (
        dealers.map(renderVisitCard)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DESIGN.colors.background },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loaderText: { marginTop: 12, color: DESIGN.colors.textSecondary },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: DESIGN.spacing.md,
    marginHorizontal: DESIGN.spacing.md,
    color: DESIGN.colors.textPrimary,
    
  },
  visitCard: {
    backgroundColor: DESIGN.colors.surface,
    marginHorizontal: DESIGN.spacing.md,
    marginVertical: DESIGN.spacing.xs,
    padding: DESIGN.spacing.md,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  entityName: {
    fontSize: 16,
    fontWeight: "600",
    color: DESIGN.colors.text,
  },
  visitTime: {
    fontSize: 13,
    color: DESIGN.colors.textSecondary,
    marginTop: 2,
  },
  visitStatus: {
    fontSize: 14,
    fontWeight: "500",
    color: DESIGN.colors.primary,
    marginLeft: DESIGN.spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: DESIGN.colors.textSecondary,
    marginHorizontal: DESIGN.spacing.md,
    marginVertical: DESIGN.spacing.xs,
  },
});
