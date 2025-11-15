import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Dimensions,
  Alert,
  ActivityIndicator,
  BackHandler,
  RefreshControl,
  TextInput,
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

const { width } = Dimensions.get("window");
const TAB_WIDTH = width / 3;
const DROPDOWN_ROW_HEIGHT = 56;
const MAX_DROPDOWN_HEIGHT = Math.round(Dimensions.get("window").height * 0.4);

// Enhanced Search Bar Component with Dealer Dropdown
const SearchBarWithDropdown = ({
  searchQuery,
  setSearchQuery,
  onClose,
  dealers,
  loadingDealer,
  showDealerList,
  onSelectDealer,
}) => (
  <View style={styles.searchDropdownContainer}>
    <View style={styles.searchContainer}>
      <MaterialCommunityIcons
        name="magnify"
        size={20}
        color={DESIGN.colors.textSecondary}
        style={{ marginRight: DESIGN.spacing.xs }}
      />
      <TextInput
        style={styles.searchInput}
        placeholder="Search dealers by name or shop..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoFocus={true}
        placeholderTextColor={DESIGN.colors.textSecondary}
      />
      <TouchableOpacity onPress={onClose}>
        <MaterialCommunityIcons
          name="close-circle"
          size={28}
          color={DESIGN.colors.textPrimary}
        />
      </TouchableOpacity>
    </View>

    {/* Dealer Dropdown */}
    {loadingDealer && (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={DESIGN.colors.primary} />
        <Text style={styles.loadingText}>Searching dealers...</Text>
      </View>
    )}

    {showDealerList && dealers.length > 0 && (
      <View
        style={[
          styles.dealerDropdownList,
          dealers.length > 3
            ? styles.scrollableDealerList
            : styles.listNonScrollable,
        ]}
      >
        {dealers.length > 3 && (
          <View style={styles.scrollIndicator}>
            <Text style={styles.scrollIndicatorText}>
              {dealers.length} dealers found - scroll to see more
            </Text>
          </View>
        )}
        <FlatList
          data={dealers}
          keyExtractor={(item) => (item.id || Math.random()).toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.dealerItem}
              onPress={() => onSelectDealer(item)}
            >
              <Text style={styles.dealerItemText}>
                {item.shop_name || "Unknown Shop"}
              </Text>
              <Text style={styles.dealerItemSubtext}>
                {`${item.owner_name || "Unknown Owner"} • ${item.phone || "No Phone"
                  }`}
              </Text>
            </TouchableOpacity>
          )}
          scrollEnabled={dealers.length > 3}
          showsVerticalScrollIndicator={dealers.length > 3}
          nestedScrollEnabled={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={4}
          removeClippedSubviews={false}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    )}

  </View>
);

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

  // Dealer dropdown states
  const [dealers, setDealers] = useState([]);
  const [loadingDealer, setLoadingDealer] = useState(false);
  const [showDealerList, setShowDealerList] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const suppressDealerFetchRef = useRef(false);
  const { canCreate, loading: permissionsLoading } = useModulePermission(MODULES.PAYMENT);




  
  const translateX = useRef(new Animated.Value(0)).current;

  const TABS = ["All", "Completed", "Pending"];
  const statusMap = {
    0: "", // All transactions
    1: "completed",
    2: "pending",
  };

  // Handle hardware back button
  useFocusEffect(
    useCallback(() => {

      const onBackPress = () => {
        if (modalVisible) {
          setModalVisible(false);
          return true;
        }
        if (showSearch) {
          setShowSearch(false);
          setSearchQuery("");
          setDealers([]);
          setShowDealerList(false);
          setSelectedDealer(null);
          return true;
        }
        navigation.goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription?.remove();
    }, [navigation, modalVisible, showSearch])
  );


  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setShowSearch(false);
        setSearchQuery("");
      };
    }, [])
  );

  // Fetch dealers based on search query
  const fetchDealers = async (search) => {
    if (!search || search.trim().length < 2) {
      setDealers([]);
      setShowDealerList(false);
      return;
    }
    try {
      setLoadingDealer(true);
      const response = await apiClient.get("/order/api/dealers/search/", {
        params: { q: search },
        timeout: 10000, // 10 second timeout
      });

      console.log("Dealer search response:", response.data);
      if (response.data && response.data.success && response.data.data) {
        // Handle different possible response structures
        const dealersData = response.data.data.dealers || response.data.data;
        const dealersArray = Array.isArray(dealersData) ? dealersData : [];
        console.log("Found dealers:", dealersArray.length);
        setDealers(dealersArray);
        setShowDealerList(true); // Always show the list to display results or "no results"
      } else {
        console.log("Dealer search failed:", response.data);
        setDealers([]);
        setShowDealerList(true); // Show list to display "no results" message
      }
    } catch (error) {
      console.log("Error fetching dealers", error);
      setDealers([]);
      setShowDealerList(false);
    } finally {
      setLoadingDealer(false);
    }
  };

  // Effect to handle debounced dealer search
  useEffect(() => {
    if (suppressDealerFetchRef.current || !showSearch) {
      return;
    }
    const delayDebounce = setTimeout(() => {
      fetchDealers(searchQuery);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, showSearch]);

  // Handle dealer selection from dropdown
  const handleSelectDealer = (dealer) => {
    setSelectedDealer(dealer);
    setSearchQuery(dealer.shop_name || dealer.owner_name || "");
    setShowDealerList(false);
    setDealers([]);
    suppressDealerFetchRef.current = true;

    // Reset suppression after a delay
    setTimeout(() => {
      suppressDealerFetchRef.current = false;
    }, 500);
  };

  // Fetch all transactions (we'll filter client-side for better UX)
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // Always fetch all transactions for better filtering experience
      const response = await apiClient.get("payment/transactions/individual/");

      console.log("API Response:", response.data);

      // Handle the API response structure: { success: true, data: { transactions: [...] } }
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
    }
  };

  // Load initial data
  useEffect(() => {
    fetchTransactions();
  }, []);

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
    await fetchTransactions();
    setRefreshing(false);
  };

  // Filter data based on status and search/dealer selection
  const getFilteredTransactions = () => {
    let filteredData = transactions;

    // Filter by status first
    const selectedStatus = statusMap[activeTab];
    if (selectedStatus) {
      filteredData = filteredData.filter(
        (transaction) => transaction.status === selectedStatus
      );
    }

    // Then filter by search or selected dealer
    if (showSearch) {
      if (selectedDealer) {
        // Filter by selected dealer ID
        filteredData = filteredData.filter(
          (transaction) => transaction.dealer_info?.id === selectedDealer.id
        );
      } else if (searchQuery.trim()) {
        // Filter by search query
        filteredData = filteredData.filter(
          (transaction) =>
            transaction.dealer_info?.name
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            transaction.dealer_info?.shop_name
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            transaction.transaction_number
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase())
        );
      }
    }

    return filteredData;
  };

  const dataToRender = getFilteredTransactions();

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
                setDealers([]);
                setShowDealerList(false);
                setSelectedDealer(null);
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

      {/* Show Search OR Tabs */}
      {showSearch ? (
        <SearchBarWithDropdown
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          dealers={dealers}
          loadingDealer={loadingDealer}
          showDealerList={showDealerList}
          onSelectDealer={handleSelectDealer}
          onClose={() => {
            setShowSearch(false);
            setSearchQuery("");
            setDealers([]);
            setShowDealerList(false);
            setSelectedDealer(null);
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
      {loading ? (
        <ActivityIndicator
          size="large"
          color={DESIGN.colors.primary}
          style={{ marginTop: 20 }}
        />
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

            if (showSearch && (searchQuery || selectedDealer)) {
              // Search mode with query/dealer selected
              iconName = "magnify";
              title = "No collections found";
              subtitle = selectedDealer
                ? `No collections for ${selectedDealer.shop_name}`
                : "Try different search terms";
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
    fontSize: DESIGN.typography.body.fontSize,
  },
  shopName: {
    color: DESIGN.colors.textSecondary,
    fontSize: DESIGN.typography.caption.fontSize,
    fontWeight: "500",
    marginBottom: DESIGN.spacing.xs,
  },
  ownerName: {
    marginVertical: DESIGN.spacing.xs,
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
