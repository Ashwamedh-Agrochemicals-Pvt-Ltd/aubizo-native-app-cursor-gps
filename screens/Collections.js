import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Dimensions,
  Alert,
  BackHandler,
  RefreshControl,
  Animated,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DESIGN from "../src/theme";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import apiClient from "../src/api/client";
import TransactionDetails from "../src/components/collections/TransactionDetails";
import { useModulePermission } from "../src/hooks/usePermissions";
import { MODULES } from "../src/auth/permissions";
import OrderSkeleton from "../src/components/appSkeleton/OrderSkeleton";
import SearchBar from "../src/components/SearchBar";

const TABS = ["All", "Completed", "Pending"];
const { width } = Dimensions.get("window");
const TAB_COUNT = TABS.length;
const TAB_WIDTH = width / TAB_COUNT;

function CollectionScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const { canCreate } = useModulePermission(MODULES.PAYMENT);
  const translateX = useRef(new Animated.Value(0)).current;
  const [initialLoad, setInitialLoad] = useState(true);

  const statusMap = {
    0: "",
    1: "completed",
    2: "pending",
  };

  // 🔙 Handle Back Button
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (showSearch) {
          setShowSearch(false);
          setSearchQuery("");
          return true; // stop default back
        }
        return false; // allow default back
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [showSearch])
  );

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setShowSearch(false);
        setSearchQuery("");
      };
    }, [])
  );

  // Fetch all transactions (we'll filter client-side for better UX)
  const fetchTransactions = async (status = "") => {
    try {
      if (initialLoad) setLoading(true);
      // Always fetch all transactions for better filtering experience
      const response = await apiClient.get("payment/transactions/individual/", {
        params: { status },
      });


      console.log("API Response:", response.data);
      if (
        response.data &&
        response.data.success &&
        response.data.data &&
        response.data.data.transactions
      ) {
        console.log(
          "Setting transactions:",
          response.data.data.transactions.length,
          "items"
        );
        setTransactions(response.data.data.transactions);
      } else if (response.data && Array.isArray(response.data)) {
        // Fallback for direct array response
        console.log(
          "Setting transactions from direct array:",
          response.data.length,
          "items"
        );
        setTransactions(response.data);
      } else if (response.data && response.data.results) {
        // Fallback for paginated response
        console.log(
          "Setting transactions from results:",
          response.data.results.length,
          "items"
        );
        setTransactions(response.data.results);
      } else {
        console.log("No transactions found in response");
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      Alert.alert("Error", "Failed to load transactions. Please try again.");
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };


  useEffect(() => {
    if (showSearch) {
      fetchTransactions(""); // Always fetch all when searching
    } else {
      fetchTransactions(statusMap[activeTab]);
    }
  }, [activeTab, showSearch]);

  // Handle card press to show details
  const handleCardPress = (transactionId) => {
    setSelectedTransactionId(transactionId);
    setModalVisible(true);
  };


  // Handle tab press with animation
  const handleTabPress = (index) => {
    setActiveTab(index);
    Animated.spring(translateX, {
      toValue: index * TAB_WIDTH,
      useNativeDriver: true,
    }).start();
  };

  // Pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions(statusMap[activeTab]); // fetch current tab data
    setRefreshing(false);
  };

  // ✅ Decide which data to render
  const dataToRender = showSearch
    ? transactions.filter(
      (transaction) =>
        transaction.dealer_info.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.dealer_info.shop_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : transactions;

  // Render transaction card
  const renderTransactionCard = ({ item }) => (
    <TouchableOpacity onPress={() => handleCardPress(item.id)}>
      <View style={styles.card}>
        <Text style={styles.createdAt}>
          {new Date(item.transaction_date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </Text>
        <Text style={styles.dealerName}>{item.dealer_info?.shop_name || ""}</Text>
        <Text style={styles.ownerName}>Owner: {item.dealer_info?.name || "N/A"}</Text>

        <View style={styles.amountRow}>
          <Text style={styles.amount}>₹ {item.amount}</Text>
          <View
            style={[
              styles.statusContainer,
              item.status === "completed" && styles.statusCompleted,
              item.status === "pending" && styles.statusPending,
              item.status === "failed" && styles.statusFailed,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                item.status === "completed" && { color: DESIGN.colors.success },
                item.status === "pending" && { color: DESIGN.colors.warning },
                item.status === "failed" && { color: DESIGN.colors.error },
              ]}
            >
              {item.status_display ||
                item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar
        backgroundColor={DESIGN.colors.background}
        barStyle="dark-content"
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Collections</Text>
        <View style={styles.headerIcons}>
          {/* Search Toggle */}
          <TouchableOpacity
            onPress={() => {
              if (showSearch) {
                setShowSearch(false);
                setSearchQuery("");
              } else {
                setShowSearch(true);
              }
            }}
          >
            <MaterialCommunityIcons
              name="magnify"
              size={30}
              color={DESIGN.colors.textPrimary}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {showSearch ? (
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onClose={() => {
            setShowSearch(false);
            setSearchQuery("");
          }}
        />
      ) : (
        <>
          {/* Tabs */}
          <View style={styles.tabRow}>
            {TABS.map((tab, index) => (
              <TouchableOpacity
                key={index}
                style={styles.tab}
                onPress={() => handleTabPress(index)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === index && styles.activeTabText,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Animated Underline */}
          <Animated.View
            style={[styles.indicator, { transform: [{ translateX }] }]}
          />
        </>
      )}

      {/* Transaction List */}
      {initialLoad && loading ? (
        <OrderSkeleton count={6} />
      ) : (
        <FlatList
          data={dataToRender}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTransactionCard}
          contentContainerStyle={{ padding: DESIGN.spacing.md }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[DESIGN.colors.primary]}
              tintColor={DESIGN.colors.primary}
            />
          }
          ListEmptyComponent={() => {
            // Determine empty state based on context
            let iconName, title, subtitle;

            if (showSearch && (searchQuery)) {
              // Search mode with query/dealer selected
              iconName = "magnify";
              title = "No collections found";
              subtitle = "Try different search terms";
            } else if (activeTab === 1) {
              // Completed tab
              iconName = "check-circle-outline";
              title = "No completed collections";
              subtitle = "Completed payments will appear here";
            } else if (activeTab === 2) {
              // Pending tab
              iconName = "clock-outline";
              title = "No pending collections";
              subtitle = "Pending payments will appear here";
            } else {
              // All tab or general empty state
              iconName = "credit-card-outline";
              title = "No collections found";
              subtitle = "Create your first payment collection";
            }

            return (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name={iconName}
                  size={64}
                  color={DESIGN.colors.textSecondary}
                />
                <Text style={styles.emptyText}>{title}</Text>
                <Text style={styles.emptySubtext}>{subtitle}</Text>
              </View>
            );
          }}
        />
      )}

      {/* Bottom Add Button */}
      {canCreate && (
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate("CollectionForm")}
            style={styles.addButton}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="plus"
              size={24}
              color={DESIGN.colors.surface}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Transaction Details Modal */}
      <TransactionDetails
        transactionId={selectedTransactionId}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: DESIGN.spacing.md,
    paddingVertical: DESIGN.spacing.sm,
  },
  headerTitle: {
    flex: 1,
    marginLeft: DESIGN.spacing.sm,
    fontSize: 18,
    fontWeight: DESIGN.typography.subtitle.fontWeight,
    color: DESIGN.colors.textPrimary,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginLeft: DESIGN.spacing.md,
  },

  // Search Bar styles
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DESIGN.colors.surface,
    marginVertical: DESIGN.spacing.sm,
    borderRadius: DESIGN.borderRadius.sm,
    paddingHorizontal: DESIGN.spacing.sm,
    marginHorizontal: DESIGN.spacing.md,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: DESIGN.typography.body.fontSize,
    paddingHorizontal: DESIGN.spacing.sm,

    color: DESIGN.colors.textPrimary,
  },

  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: DESIGN.colors.borderLight,
    paddingVertical: DESIGN.spacing.sm,
  },
  tab: {
    width: TAB_WIDTH,
    paddingVertical: DESIGN.spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: DESIGN.typography.caption.fontSize,
    color: DESIGN.colors.textSecondary,
    fontWeight: "700",
  },
  activeTabText: {
    color: DESIGN.colors.primary,
    fontWeight: "600",
  },
  indicator: {
    height: 3,
    width: TAB_WIDTH,
    backgroundColor: DESIGN.colors.primary,
  },

  card: {
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.borderRadius.sm,
    padding: DESIGN.spacing.md,
    marginBottom: DESIGN.spacing.md,
    ...DESIGN.shadows.medium,
  },
  createdAt: {
    fontWeight: "400",
    fontSize: DESIGN.typography.caption.fontSize,
    position: "absolute",
    top: DESIGN.spacing.sm,
    right: DESIGN.spacing.md,
    zIndex: 10,
    color: DESIGN.colors.textSecondary,
  },
  dealerName: {
    color: DESIGN.colors.primary,
    marginVertical: DESIGN.spacing.xs,
    fontWeight: "700",
    marginTop: DESIGN.spacing.sm,
    fontSize: DESIGN.typography.body.fontSize,
  },
  ownerName: {
    fontStyle: "italic",
    fontWeight: "400",
    fontSize: DESIGN.typography.body.fontSize,
    color: DESIGN.colors.textPrimary,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: DESIGN.spacing.sm,
  },
  amount: {
    fontWeight: "600",
    fontSize: DESIGN.typography.body.fontSize,
    color: DESIGN.colors.textPrimary,
  },
  paymentMethod: {
    color: DESIGN.colors.accent,
    fontSize: DESIGN.typography.caption.fontSize,
    marginTop: DESIGN.spacing.xs,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: DESIGN.spacing.sm,
    paddingVertical: DESIGN.spacing.xs,
    borderRadius: DESIGN.borderRadius.sm,
    backgroundColor: DESIGN.colors.surfaceElevated,
  },
  statusCompleted: {
    backgroundColor: DESIGN.colors.success + "20",
  },
  statusPending: {
    backgroundColor: DESIGN.colors.warning + "20",
  },
  statusFailed: {
    backgroundColor: DESIGN.colors.error + "20",
  },
  statusText: {
    fontSize: DESIGN.typography.caption.fontSize,
    fontWeight: "500",
    color: DESIGN.colors.textSecondary,
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? DESIGN.spacing.xl : DESIGN.spacing.lg,
    right: DESIGN.spacing.lg,
  },
  addButton: {
    backgroundColor: DESIGN.colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28, // perfect circle
    alignItems: "center",
    justifyContent: "center",
    ...DESIGN.shadows.medium,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: DESIGN.spacing.xl * 2,
  },
  emptyText: {
    fontSize: DESIGN.typography.subtitle.fontSize,
    fontWeight: "600",
    color: DESIGN.colors.textSecondary,
    marginTop: DESIGN.spacing.md,
  },
  emptySubtext: {
    fontSize: DESIGN.typography.body.fontSize,
    color: DESIGN.colors.textSecondary,
    marginTop: DESIGN.spacing.xs,
    textAlign: "center",
  },
});

export default CollectionScreen;
