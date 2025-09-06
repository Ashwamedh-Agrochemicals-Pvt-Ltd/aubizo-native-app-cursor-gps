import { MaterialCommunityIcons } from "@expo/vector-icons";
import moment from "moment";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
  Alert,
  BackHandler,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCallback, useMemo } from "react";
import DESIGN from "../../theme";
import useVisitHistory from "./useVisitHistory";
import VisitTable from "./VisitTable";
import VisitForm from "./VisitTemplate";
import logger from "../../utility/logger";
import { useFocusEffect } from "@react-navigation/native";
import { navigation } from "../../../navigation/NavigationService";

const VisitScreen = ({ location_id, storageKey, navigateTo }) => {
  const { remarksList, isLoading, error, refetch } = useVisitHistory(location_id);


  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (navigation.isReady()) {
          navigation.goBack(); // 👈 only remove current screen
        }
        return true; // prevent default back action
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [])
  );


  if (__DEV__) {
    logger.info("Visit History:", remarksList);
  }

  const currentDate = moment().format("DD-MMM-YYYY");
  const dayName = moment().format("dddd");
  const insets = useSafeAreaInsets();

  // Handle errors with safe fallbacks
  if (error) {
    if (__DEV__) {
      logger.error("Visit history error:", error);
    }

    // Show user-friendly error message
    Alert.alert(
      "Connection Error",
      "Unable to load visit history. Please check your connection and try again.",
      [
        {
          text: "Retry",
          onPress: () => refetch(),
        },
        {
          text: "OK",
          style: "cancel",
        },
      ]
    );
  }

  // Memoized header component for performance
  const renderHeader = useCallback(() => (
    <>
      {/* Date & Time Card */}
      <View style={modernStyles.dateTimeCard}>
        <View style={modernStyles.dateTimeContent}>
          <View style={modernStyles.dateSection}>
            <MaterialCommunityIcons
              name="calendar-today"
              size={24}
              color={DESIGN.colors.primary}
            />
            <View style={modernStyles.dateInfo}>
              <Text style={modernStyles.dateText}>{currentDate}</Text>
              <Text style={modernStyles.dayText}>{dayName}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Visit Form Section */}
      <VisitForm storageKey={storageKey} navigateTo={navigateTo} />
    </>
  ), [currentDate, dayName, storageKey, navigateTo]);

  // Memoized footer component for performance
  const renderFooter = useCallback(() => (
    <VisitTable data={remarksList} isLoading={isLoading} />
  ), [remarksList, isLoading]);

  // Memoized data for FlatList
  const flatListData = useMemo(() => [], []);

  // Memoized key extractor for FlatList
  const keyExtractor = useCallback((_item, index) => index.toString(), []);

  return (
    <KeyboardAvoidingView
      style={[modernStyles.container, { paddingBottom: insets.bottom }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header Section */}
      <View style={modernStyles.header}>
        <View style={modernStyles.headerContent}>
          <View style={modernStyles.headerIcon}>
            <MaterialCommunityIcons
              name="clipboard-check"
              size={32}
              color={DESIGN.colors.primary}
            />
          </View>
          <View style={modernStyles.headerText}>
            <Text style={modernStyles.headerTitle}>Visit Management</Text>
            <Text style={modernStyles.headerSubtitle}>
              Complete your visit and view history
            </Text>
          </View>
        </View>
      </View>

      {/* FlatList Wrapper */}
      <FlatList
        data={flatListData} // FlatList just wraps static components here
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={modernStyles.scrollContent}
        removeClippedSubviews={false}
        initialNumToRender={1}
        windowSize={3}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      />
    </KeyboardAvoidingView>
  );
};

const modernStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: DESIGN.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: DESIGN.colors.background,
  },
  header: {
    backgroundColor: DESIGN.colors.surface,
    paddingHorizontal: DESIGN.spacing.lg,
    paddingVertical: DESIGN.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN.colors.border,
    ...DESIGN.shadows.subtle,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: DESIGN.colors.accent,
    justifyContent: "center",
    alignItems: "center",
    marginRight: DESIGN.spacing.md,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    ...DESIGN.typography.subtitle,
    color: DESIGN.colors.textPrimary,
    marginBottom: DESIGN.spacing.xs,
  },
  headerSubtitle: {
    ...DESIGN.typography.caption,
    color: DESIGN.colors.textSecondary,
    lineHeight: 18,
  },
  dateTimeCard: {
    backgroundColor: DESIGN.colors.surface,
    marginHorizontal: DESIGN.spacing.md,
    borderRadius: DESIGN.borderRadius.sm,
    ...DESIGN.shadows.medium,
    overflow: "hidden",
  },
  dateTimeContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: DESIGN.spacing.sm,
  },
  dateSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dateInfo: {
    marginLeft: DESIGN.spacing.md,
  },
  dateText: {
    ...DESIGN.typography.subheading,
    color: DESIGN.colors.textPrimary,
    marginBottom: DESIGN.spacing.xs,
  },
  dayText: {
    ...DESIGN.typography.caption,
    color: DESIGN.colors.textSecondary,
  },
  scrollContent: {
    paddingBottom: DESIGN.spacing.xl,
    marginTop: DESIGN.spacing.md,
  },
});

export default VisitScreen;
