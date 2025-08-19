import {
  FlatList,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { navigation } from "../../../navigation/NavigationService";
import useVisitManager from "./useVisitManager";
import { useEffect } from "react";
import DESIGN from "../../theme";
import storage from "../../utility/storage";
import apiClient from "../../api/client";
function EntityVisitList({
  type,
  loading,
  punch_id,
  handleForm,
  data,
  ScreenUpdate,
  visitScreen,
  endpoint,
  onRefresh,
  refreshing = false,
}) {
  const { startVisit, endVisit, activeStartId, visitStatusTrigger } =
    useVisitManager(type);

  // Log whenever active IDs change
  useEffect(() => {
    console.log("Active Id:", activeStartId);
  }, [activeStartId]);

  const renderItem = ({ item, index }) => {
    const isActive = activeStartId === item.id;
    const displayName = item.farmer_name || item.owner_name || "Unnamed";

    const handleStartVisit = async () => {
      const visitKeys = ["VISIT_ID_Farmer", "VISIT_ID_Dealer"];
      const payload = { remark: "-" };

      for (const key of visitKeys) {
        const visitId = await storage.get(key);

        if (visitId) {
          try {
            const response = await apiClient.patch(
              `track/end-visit/${visitId}/`,
              payload
            );
            console.log(`${key} visit ended successfully:`, response.data);

            // Remove only this key if visit existed
            await storage.remove(key);
            await storage.remove(key.replace("VISIT", "START"));
          } catch (error) {
            console.error(`Error ending ${key} visit:`, error);
          }
        } else {
          console.log(`No visit ID found for ${key} — skipping.`);
        }
      }

      // Now start the new visit
      const result = await startVisit(
        item.id,
        item.location_id,
        punch_id,
        endpoint
      );

      if (result?.error) {
        Alert.alert("Error", result.error);
      } else {
        console.log("Visit started successfully:", result);
      }
    };


    const handleEndVisit = async () => {
      try {
        await endVisit(item.id, () => {
          navigation.navigate(visitScreen, {
            id: item.id,
            location_id: item.location_id,
          });
        });
      } catch (error) {
        console.error("Failed to end visit:", error);
        Alert.alert("Error", "Could not end visit.");
      }
    };

    return (
      <View
        style={[
          modernStyles.listItem,
          {
            backgroundColor:
              index % 2 === 0
                ? DESIGN.colors.surface
                : DESIGN.colors.background,
          },
        ]}
      >
        {/* Entity Info Section */}
        <View style={modernStyles.entityInfo}>
          <View style={modernStyles.entityHeader}>
            <View
              style={[
                modernStyles.indexBadge,
                { backgroundColor: DESIGN.colors.primary },
              ]}
            >
              <Text style={modernStyles.indexText}>{index + 1}</Text>
            </View>
            <View style={modernStyles.entityDetails}>
              <Text style={modernStyles.entityName} numberOfLines={2}>
                {displayName}
              </Text>
            </View>
            {/* Visit Actions */}
            <View style={modernStyles.visitActions}>
              <TouchableOpacity
                style={modernStyles.actionButton}
                onPress={() =>
                  navigation.navigate(ScreenUpdate, { id: item.id })
                }
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="square-edit-outline"
                  size={22}
                  color={DESIGN.colors.info}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  modernStyles.visitButton,
                  modernStyles.startButton,
                  { opacity: isActive ? 0.4 : 1 },
                ]}
                onPress={handleStartVisit}
                activeOpacity={0.7}
                disabled={isActive}
              >
                <MaterialCommunityIcons
                  name="map-marker-check"
                  size={20}
                  color={DESIGN.colors.surface}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  modernStyles.visitButton,
                  modernStyles.endButton,
                  { opacity: isActive ? 1 : 0.4 },
                ]}
                onPress={handleEndVisit}
                activeOpacity={0.7}
                disabled={!isActive}
              >
                <MaterialCommunityIcons
                  name="map-marker-off"
                  size={20}
                  color={DESIGN.colors.surface}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {isActive && (
          <View style={modernStyles.activeIndicator}>
            <View style={modernStyles.activeDot} />
            <Text style={modernStyles.activeText}>Active Visit</Text>
          </View>
        )}
      </View>
    );
  };

  const ListEmptyComponent = () => (
    <View style={modernStyles.emptyContainer}>
      <MaterialCommunityIcons
        name="account-search"
        size={64}
        color={DESIGN.colors.textTertiary}
      />
      <Text style={modernStyles.emptyTitle}>No {type}s Found</Text>
      <Text style={modernStyles.emptyMessage}>
        Try adding a new {type.toLowerCase()} or check your location settings
      </Text>
    </View>
  );

  return (
    <View style={modernStyles.container}>
      {/* Header Section */}
      <View style={modernStyles.header}>
        <View style={modernStyles.headerContent}>
          <Text style={modernStyles.headerTitle}>{type} Management</Text>
          <Text style={modernStyles.headerSubtitle}>
            {data.length} {type.toLowerCase()}
            {data.length !== 1 ? "s" : ""} nearby
          </Text>
        </View>
      </View>

      {/* Table Header */}
      <View style={modernStyles.tableHeader}>
        <View style={modernStyles.tableHeaderSection}>
          <Text style={modernStyles.tableHeaderText}>{type} Details</Text>
        </View>
        <View style={modernStyles.tableHeaderActions}>
          <Text style={modernStyles.tableHeaderText}>Actions</Text>
        </View>
      </View>

      {/* Loading Indicator for Entity Data */}
      {refreshing && (
        <View style={modernStyles.loadingContainer}>
          <Text style={modernStyles.loadingText}>
            Loading {type.toLowerCase()}s...
          </Text>
        </View>
      )}

      {/* Main List */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          modernStyles.listContainer,
          data.length === 0 && modernStyles.listContainerEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={DESIGN.colors.primary}
            colors={[DESIGN.colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        extraData={visitStatusTrigger}
        ListEmptyComponent={!refreshing ? ListEmptyComponent : null}
        ItemSeparatorComponent={() => <View style={modernStyles.separator} />}
      />

      {/* Bottom Add Button */}
      <View style={modernStyles.bottomButtonContainer}>
        <TouchableOpacity
          style={modernStyles.addButton}
          onPress={handleForm}
          activeOpacity={0.8}
          disabled={loading}
        >
          <MaterialCommunityIcons
            name="plus"
            size={24}
            color={DESIGN.colors.surface}
          />
          <Text style={modernStyles.addButtonText}>Add {type}</Text>
        </TouchableOpacity>
      </View>

      {/* Global Loading Overlay */}
      {loading && (
        <View style={modernStyles.loadingOverlay}>
          <View style={modernStyles.loadingModal}>
            <ActivityIndicator size="large" color={DESIGN.colors.primary} />
            <Text style={modernStyles.loadingModalText}>
              Getting location...
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const modernStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN.colors.background,
  },

  header: {
    backgroundColor: DESIGN.colors.surface,
    paddingHorizontal: DESIGN.spacing.lg,
    paddingVertical: DESIGN.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN.colors.border,
    ...DESIGN.shadows.subtle,
  },

  headerContent: {
    alignItems: "center",
  },

  headerTitle: {
    ...DESIGN.typography.subtitle,
    color: DESIGN.colors.textPrimary,
    marginBottom: DESIGN.spacing.xs,
  },

  headerSubtitle: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textSecondary,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: DESIGN.colors.primary,
    paddingHorizontal: DESIGN.spacing.lg,
    paddingVertical: DESIGN.spacing.md,
    alignItems: "center",
  },

  tableHeaderSection: {
    flex: 2,
  },

  tableHeaderActions: {
    flex: 1,
    alignItems: "center",
  },

  tableHeaderText: {
    ...DESIGN.typography.subtitle,
    color: DESIGN.colors.surface,
  },

  listContainer: {
    paddingBottom: 100,
  },

  listContainerEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },

  listItem: {
    paddingHorizontal: DESIGN.spacing.md,
    paddingVertical: DESIGN.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN.colors.border,
  },

  entityInfo: {
    marginBottom: DESIGN.spacing.sm,
  },

  entityHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  indexBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: DESIGN.spacing.md,
  },

  indexText: {
    ...DESIGN.typography.subtitle,
    color: DESIGN.colors.surface,
    fontWeight: "bold",
  },

  entityDetails: {
    flex: 1,
  },

  entityName: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textPrimary,
    fontWeight: "600",
    marginBottom: DESIGN.spacing.xs,
    textTransform: "capitalize",
  },

  entityId: {
    ...DESIGN.typography.subtitle,
    color: DESIGN.colors.textSecondary,
  },

  actionButton: {
    width: 44,
    height: 44,
    borderRadius: DESIGN.borderRadius.sm,
    backgroundColor: DESIGN.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    ...DESIGN.shadows.subtle,
  },

  visitActions: {
    justifyContent: "flex-end",
    flexDirection: "row",
    gap: DESIGN.spacing.md,
  },

  visitButton: {
    width: 44,
    height: 44,
    borderRadius: DESIGN.borderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    ...DESIGN.shadows.subtle,
  },

  startButton: {
    backgroundColor: DESIGN.colors.success,
  },

  endButton: {
    backgroundColor: DESIGN.colors.error,
  },

  activeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: DESIGN.spacing.sm,
    paddingHorizontal: DESIGN.spacing.sm,
    paddingVertical: DESIGN.spacing.xs,
    backgroundColor: DESIGN.colors.success,
    borderRadius: DESIGN.borderRadius.sm,
    alignSelf: "flex-start",
  },

  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: DESIGN.colors.surface,
    marginRight: DESIGN.spacing.xs,
  },

  activeText: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.surface,
    fontWeight: "600",
  },

  separator: {
    height: 1,
    backgroundColor: DESIGN.colors.border,
    marginHorizontal: DESIGN.spacing.lg,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: DESIGN.spacing.xl,
  },

  emptyTitle: {
    ...DESIGN.typography.subtitle,
    color: DESIGN.colors.textSecondary,
    marginTop: DESIGN.spacing.lg,
    marginBottom: DESIGN.spacing.sm,
  },

  emptyMessage: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textTertiary,
    textAlign: "center",
    lineHeight: 22,
  },

  loadingContainer: {
    paddingVertical: DESIGN.spacing.xs,
    marginBottom: DESIGN.spacing.md,
    alignItems: "center",
  },

  loadingText: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textSecondary,
    marginTop: DESIGN.spacing.md,
  },

  bottomButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: DESIGN.colors.surface,
    paddingHorizontal: DESIGN.spacing.xl,
    paddingBottom:
      Platform.OS === "ios" ? DESIGN.spacing.xl : DESIGN.spacing.md,


  },

  addButton: {
    backgroundColor: DESIGN.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: DESIGN.spacing.md,
    borderRadius: DESIGN.borderRadius.md,
    ...DESIGN.shadows.medium,
  },

  addButtonText: {
    ...DESIGN.typography.subtitle,
    color: DESIGN.colors.surface,
    marginLeft: DESIGN.spacing.sm,
  },

  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: DESIGN.colors.overlay,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingModal: {
    backgroundColor: DESIGN.colors.surface,
    paddingHorizontal: DESIGN.spacing.xl,
    paddingVertical: DESIGN.spacing.lg,
    borderRadius: DESIGN.borderRadius.lg,
    alignItems: "center",
    ...DESIGN.shadows.medium,
  },

  loadingModalText: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textPrimary,
    marginTop: DESIGN.spacing.md,
  },
});

export default EntityVisitList;
