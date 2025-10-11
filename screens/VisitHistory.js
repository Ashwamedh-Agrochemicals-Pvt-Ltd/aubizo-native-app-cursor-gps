import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import DESIGN from "../src/theme";
import apiClient from "../src/api/client";
import { useSafeAreaInsets } from "react-native-safe-area-context";


export default function VisitHistory({ route }) {
  const { visits } = route.params;

  const [refreshVisits, setRefreshVisits] = useState(visits);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all"); // all, farmers, dealers
  const insert= useSafeAreaInsets()

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const fetchVisits = async () => {
        try {
          const response = await apiClient.get("track/dashboard/today/");
          
          if (response.data.success && response.data.recent_visits) {
            setRefreshVisits(response.data.recent_visits);
          } else {
            setRefreshVisits(visits);
          }
        } catch (err) {
          console.error("Failed to fetch visits:", err);
          setRefreshVisits(visits);
        }
      };

      fetchVisits();
    }, [visits])
  );

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    
    try {
      const response = await apiClient.get("track/dashboard/today/");
      
      if (response.data.success && response.data.recent_visits) {
        setRefreshVisits(response.data.recent_visits);
      } else {
        setRefreshVisits(visits);
      }
    } catch (err) {
      console.error("Failed to refresh visits:", err);
      setRefreshVisits(visits);
    } finally {
      setRefreshing(false);
    }
  }, [visits]);

  // Filter logic
  const filteredVisits = refreshVisits.filter((visit) => {
    return activeFilter === "all" || 
      (activeFilter === "farmers" && visit.entity_type === "Farmer") ||
      (activeFilter === "dealers" && visit.entity_type === "Dealer");
  });

  const farmers = filteredVisits.filter((v) => v.entity_type === "Farmer");
  const dealers = filteredVisits.filter((v) => v.entity_type === "Dealer");

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'ongoing': return DESIGN.colors.warning;
      case 'completed': return DESIGN.colors.success;
      case 'pending': return DESIGN.colors.info;
      default: return DESIGN.colors.textSecondary;
    }
  };



  const formatVisitTime = (timestamp) => {
    if (!timestamp) return 'Time not available';
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return 'Invalid time';
    }
  };

  const renderVisitCard = (item) => (
    <View
      key={item.id}
      style={[
        styles.visitCard,
        item.status === "ongoing" && { borderLeftColor: DESIGN.colors.warning, borderLeftWidth: 4 }
      ]}
    >
      <View style={styles.visitCardHeader}>
        <View style={styles.entityInfo}>
          <View style={styles.entityDetails}>
            {activeFilter === "all" && (
              <>
                <Text style={styles.entityName}>{item.entity_name}</Text>
                <Text style={styles.entityType}>{item.entity_type}</Text>
              </>
            )}
            {activeFilter !== "all" && (
              <Text style={styles.entityName}>{item.entity_name}</Text>
            )}
          </View>
        </View>
        <View style={[
          styles.statusBadge, 
          { backgroundColor: getStatusColor(item.status) + '20' }
        ]}>
          <Text style={[
            styles.visitStatus,
            { color: getStatusColor(item.status) }
          ]}>
            {item.status?.charAt(0).toUpperCase() + item.status?.slice(1) || 'Unknown'}
          </Text>
        </View>
      </View>
      
      <View style={styles.visitDetails}>
        {item.visit_time && (
          <Text style={styles.visitTime}>🕒 {formatVisitTime(item.visit_time)}</Text>
        )}
        {item.location && (
          <Text style={styles.visitLocation} numberOfLines={1}>📍 {item.location}</Text>
        )}
      </View>
    </View>
  );



  const renderFilterButton = (filterType, label) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        activeFilter === filterType && styles.filterButtonActive
      ]}
      onPress={() => setActiveFilter(filterType)}
    >
      <Text style={[
        styles.filterButtonText,
        activeFilter === filterType && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No visits found</Text>
      <Text style={styles.emptyMessage}>
        No visits available for the selected filter
      </Text>
    </View>
  );

  return (
    <View style={[styles.container,{paddingBottom:insert.bottom}]}>
      {/* Filter Tabs */}
      <View style={styles.filtersContainer}>
        {renderFilterButton("all", "All")}
        {renderFilterButton("farmers", "Farmers")}
        {renderFilterButton("dealers", "Dealers")}
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[DESIGN.colors.primary]}
            tintColor={DESIGN.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredVisits.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {/* Farmers Section */}
            {(activeFilter === "all" || activeFilter === "farmers") && farmers.length > 0 && (
              <>
                <Text style={styles.sectionHeader}>👨‍🌾 Farmers </Text>
                {farmers.map(renderVisitCard)}
              </>
            )}

            {/* Dealers Section */}
            {(activeFilter === "all" || activeFilter === "dealers") && dealers.length > 0 && (
              <>
                <Text style={styles.sectionHeader}>🏪 Dealers </Text>
                {dealers.map(renderVisitCard)}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: DESIGN.colors.background 
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: DESIGN.spacing.md,
    paddingVertical: DESIGN.spacing.md,
    borderRadius: DESIGN.borderRadius.md,
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
  
    gap: DESIGN.spacing.sm,
  },
  filterButton: {
    paddingVertical: DESIGN.spacing.sm,
    paddingHorizontal: DESIGN.spacing.sm,
    borderRadius: 20,
    backgroundColor: DESIGN.colors.background,
    flex: 1,
    borderWidth: 1,
    justifyContent:'space-between',
    borderColor: DESIGN.colors.border,
  },
  filterButtonActive: {
    backgroundColor: DESIGN.colors.primary,
    borderColor: DESIGN.colors.primary,
  },
  filterButtonText: {
    fontSize: 16,
    color: DESIGN.colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
    textTransform: 'capitalize',
   
  },
  filterButtonTextActive: {
    color: DESIGN.colors.surface,
  },
  scrollContent: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: DESIGN.spacing.lg,
    marginBottom: DESIGN.spacing.sm,
    marginHorizontal: DESIGN.spacing.md,
    color: DESIGN.colors.textPrimary,
  },
  visitCard: {
    backgroundColor: DESIGN.colors.surface,
    marginHorizontal: DESIGN.spacing.md,
    marginVertical: DESIGN.spacing.xs,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DESIGN.colors.borderLight,
    padding: DESIGN.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  visitCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DESIGN.spacing.sm,
  },
  entityInfo: {
    flex: 1,
  },
  entityDetails: {
    flex: 1,
  },
  entityName: {
    fontSize: 16,
    fontWeight: '600',
    color: DESIGN.colors.textPrimary,
    marginBottom: 4,
  },
  entityType: {
    fontSize: 13,
    color: DESIGN.colors.textSecondary,
    fontWeight: '500',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: DESIGN.spacing.sm,
  },
  visitStatus: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  visitDetails: {
    gap: 6,
  },
  visitTime: {
    fontSize: 13,
    color: DESIGN.colors.textSecondary,
    fontWeight: '500',
  },
  visitLocation: {
    fontSize: 13,
    color: DESIGN.colors.textSecondary,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DESIGN.spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DESIGN.colors.textPrimary,
    marginBottom: DESIGN.spacing.xs,
  },
  emptyMessage: {
    fontSize: 14,
    color: DESIGN.colors.textSecondary,
    textAlign: 'center',
  },
});
