import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FlatList, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { useCallback, useMemo } from "react";
import DESIGN from "../../theme";

const VisitTable = ({ data = [], isLoading = false }) => {
  // Memoized render item for FlatList performance
  const renderVisitItem = useCallback(({ item, index }) => {
    const isOngoing = !item.remark;
    const visitDate = new Date(item.visit_start_time)
      .toISOString()
      .slice(0, 10);

    return (
      <View style={modernStyles.visitItem}>
        {/* Visit Header */}
        <View style={modernStyles.visitHeader}>
          <View style={modernStyles.visitNumber}>
            <Text style={modernStyles.visitNumberText}>
              {data.length - index}
            </Text>
          </View>
          <View style={modernStyles.visitDate}>
            <Text style={modernStyles.visitDateText}>{visitDate}</Text>
          </View>

          <MaterialCommunityIcons
            name={isOngoing ? "progress-clock" : "check-circle"}
            size={20}
            color={DESIGN.colors.surface}
            style={{
              backgroundColor: isOngoing
                ? DESIGN.colors.warning
                : DESIGN.colors.success,
            }}
          />
        </View>

        {/* Visit Details */}
        <View style={modernStyles.visitDetails}>
          <View
            style={[
              modernStyles.remarksHeader,
              { marginBottom: DESIGN.spacing.sm },
            ]}
          >
            <MaterialCommunityIcons
              name={isOngoing ? "account" : "account-check"}
              size={16}
              color={DESIGN.colors.textSecondary}
            />
            <Text style={modernStyles.remarksLabel}>Visited By:</Text>
            <Text style={modernStyles.visitedText}>{item.employee}</Text>
          </View>

          <View style={modernStyles.remarksHeader}>
            <MaterialCommunityIcons
              name="note-text"
              size={16}
              color={DESIGN.colors.textSecondary}
            />
            <Text style={modernStyles.remarksLabel}>Remarks:</Text>
            <Text
              style={[
                modernStyles.remarksText,
                { fontStyle: isOngoing ? "normal" : "italic" },
              ]}
            >
              {item.remark || "N/A"}
            </Text>
          </View>
          <View style={modernStyles.remarksHeader}>
            <MaterialCommunityIcons
              name="note-text"
              size={16}
              color={DESIGN.colors.textSecondary}
            />
            <Text style={modernStyles.remarksLabel}>Visit Purpose:</Text>
            <Text
              style={[
                modernStyles.remarksText,
                { fontStyle: isOngoing ? "normal" : "italic" },
              ]}
            >
              {item.visit_purpose_display || "N/A"}
            </Text>
          </View>
        </View>
      </View>
    );
  }, [data.length]);

  // Memoized key extractor for FlatList performance
  const keyExtractor = useCallback((_item, index) => `visit-${index}`, []);

  // Memoized separator component for FlatList performance
  const ItemSeparatorComponent = useCallback(() => (
    <View style={modernStyles.separator} />
  ), []);

  // Memoized empty state component
  const EmptyState = useCallback(() => (
    <View style={modernStyles.emptyContainer}>
      <MaterialCommunityIcons
        name="history"
        size={64}
        color={DESIGN.colors.textTertiary}
      />
      <Text style={modernStyles.emptyTitle}>No Visit History</Text>
      <Text style={modernStyles.emptyMessage}>
        Your visit history will appear here once you complete visits
      </Text>
    </View>
  ), []);

  // Memoized loading state component
  const LoadingState = useCallback(() => (
    <View style={modernStyles.loadingContainer}>
      <ActivityIndicator size="large" color={DESIGN.colors.primary} />
      <Text style={modernStyles.loadingText}>Loading visit history...</Text>
    </View>
  ), []);

  // Memoized content container style
  const contentContainerStyle = useMemo(() => [
    modernStyles.listContainer,
    data.length === 0 && modernStyles.emptyListContainer,
  ], [data.length]);

  return (
    <View style={modernStyles.container}>
      {/* Header */}
      <View style={modernStyles.header}>
        <View style={modernStyles.headerContent}>
          <MaterialCommunityIcons
            name="history"
            size={24}
            color={DESIGN.colors.primary}
          />
          <Text style={modernStyles.headerTitle}>Visit History</Text>
        </View>
        <Text style={modernStyles.headerSubtitle}>
          {isLoading ? "Loading..." : `${data.length} visit${data.length !== 1 ? "s" : ""} recorded`}
        </Text>
      </View>

      {/* Visit List */}
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderVisitItem}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={isLoading ? LoadingState : EmptyState}
        ItemSeparatorComponent={ItemSeparatorComponent}
        removeClippedSubviews={true}
        initialNumToRender={5}
        maxToRenderPerBatch={10}
        windowSize={10}
        updateCellsBatchingPeriod={50}
        getItemLayout={undefined} // Let FlatList calculate layout
      />
    </View>
  );
};

const modernStyles = StyleSheet.create({
  container: {
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.borderRadius.sm,
    marginHorizontal: DESIGN.spacing.md,
    marginTop: DESIGN.spacing.md,
    ...DESIGN.shadows.medium,
    overflow: "hidden",
  },
  header: {
    backgroundColor: DESIGN.colors.accent,
    padding: DESIGN.spacing.sm,
    paddingLeft: DESIGN.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN.colors.borderLight,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    ...DESIGN.typography.heading,
    color: DESIGN.colors.textPrimary,
    marginLeft: DESIGN.spacing.sm,
  },
  headerSubtitle: {
    ...DESIGN.typography.caption,
    color: DESIGN.colors.textSecondary,
  },
  listContainer: {
    paddingBottom: DESIGN.spacing.lg,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: "center",
    minHeight: 200,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: DESIGN.spacing.xl,
    paddingHorizontal: DESIGN.spacing.lg,
  },
  loadingText: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textSecondary,
    marginTop: DESIGN.spacing.md,
  },
  visitItem: {
    padding: DESIGN.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN.colors.borderLight,
  },
  visitHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: DESIGN.spacing.md,
  },
  visitNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: DESIGN.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: DESIGN.spacing.md,
  },
  visitNumberText: {
    ...DESIGN.typography.caption,
    color: DESIGN.colors.surface,
    fontWeight: "bold",
  },
  visitDate: {
    flex: 1,
  },
  visitDateText: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textPrimary,
    fontWeight: "600",
  },
  statusBadge: {
    marginRight: DESIGN.spacing.sm,
  },
  statusText: {
    ...DESIGN.typography.small,
    color: DESIGN.colors.surface,
    fontWeight: "600",
    marginLeft: DESIGN.spacing.xs,
  },
  visitDetails: {
    backgroundColor: DESIGN.colors.background,
    padding: DESIGN.spacing.sm,
  },
  remarksHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  remarksLabel: {
    ...DESIGN.typography.caption,
    color: DESIGN.colors.textSecondary,
    marginLeft: DESIGN.spacing.xs,
    marginRight: DESIGN.spacing.xs,
    fontWeight: "600",
  },
  remarksText: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textPrimary,
  },
  visitedText: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textPrimary,
    fontWeight: "600",
  },
  separator: {
    height: 1,
    backgroundColor: DESIGN.colors.borderLight,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: DESIGN.spacing.xl,
    paddingHorizontal: DESIGN.spacing.lg,
  },
  emptyTitle: {
    ...DESIGN.typography.heading,
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
});

export default VisitTable;
