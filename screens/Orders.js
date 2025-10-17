import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  BackHandler,
  Platform,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DESIGN from "../src/theme";
import { navigation } from "../navigation/NavigationService";
import apiClient from "../src/api/client"; // Your API client
import OrderDetails from "../src/components/orders/OrderDetails";
import { useFocusEffect } from "@react-navigation/native";
import { useModulePermission } from "../src/hooks/usePermissions";
import { MODULES } from "../src/auth/permissions";

const { width } = Dimensions.get("window");
const TABS = ["All", "Pending", "Dispatched", "Rejected"];
const TAB_COUNT = TABS.length;
const TAB_WIDTH = width / TAB_COUNT;

// 🔎 Separate Search Component
const SearchBar = ({ searchQuery, setSearchQuery, onClose }) => {
  const inputRef = useRef(null);


  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100); // small delay ensures component is mounted
  }, []);

  return (
    <View style={styles.searchContainer}>
      <MaterialCommunityIcons
        name="magnify"
        size={20}
        color={DESIGN.colors.textSecondary}
        style={{ marginRight: DESIGN.spacing.xs }}
      />
      <TextInput
        ref={inputRef}
        style={styles.searchInput}
        placeholder="Search by Dealer or Shop name..."
        placeholderTextColor={DESIGN.colors.textSecondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <TouchableOpacity onPress={onClose}>
        <MaterialCommunityIcons
          name="close-circle"
          size={28}
          color={DESIGN.colors.textPrimary}
        />
      </TouchableOpacity>
    </View>
  );
};

function OrderScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const { canCreate, canRead, canUpdate, canDelete, enabled, loading: permissionsLoading } = useModulePermission(MODULES.ORDER);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // 🔎 Search state
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCardPress = (orderId) => {
    setSelectedOrderId(orderId);
    setModalVisible(true);
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

      return () => subscription.remove(); // ✅ proper cleanup
    }, [showSearch])
  );

  // 🔄 Close search when leaving screen
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setShowSearch(false);
        setSearchQuery("");
      };
    }, [])
  );



  const statusMap = {
    0: "", // All
    1: "processing",
    2: "dispatched",
    3: "cancelled",

  };

  // Fetch orders by status
  const fetchOrders = async (status = "") => {
    try {
      setLoading(true);
      const response = await apiClient.get("/order/api/individual/orders/", {
        params: { status },
      });
      if (response.data.success) {
        setOrders(response.data.data.orders);
      }
    } catch (error) {
      console.log("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showSearch) {
      fetchOrders(""); // Always fetch all when searching
    } else {
      fetchOrders(statusMap[activeTab]);
    }
  }, [activeTab, showSearch]);

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
    await fetchOrders(statusMap[activeTab]);
    setRefreshing(false);
  };

  // ✅ Decide which data to render
  const dataToRender = showSearch
    ? orders.filter(
      (order) =>
        order.dealer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.dealer_owner?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : orders;


  const renderOrderCard = ({ item }) => (
    <TouchableOpacity onPress={() => handleCardPress(item.id)}>
      <View style={styles.card}>
        <Text style={styles.createdAt}>
          {new Date(item.created_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </Text>

        <Text style={styles.dealerName}>{item.dealer_name}</Text>
        <Text style={styles.ownerName}>Owner: {item.dealer_owner}</Text>

        <View style={styles.amountRow}>
          <Text style={styles.amount}>₹{item.total_order_value}</Text>
          <View
            style={[
              styles.statusContainer,
              item.status === "delivered" && styles.statusDelivered,
              item.status === "processing" && styles.statusPending,
              item.status === "cancelled" && styles.statusRejected,
              item.status === "hold" && styles.statusHold,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                item.status === "delivered" && { color: DESIGN.colors.success },
                item.status === "processing" && { color: DESIGN.colors.warning },
                item.status === "cancelled" && { color: DESIGN.colors.error },
                item.status === "hold" && { color: DESIGN.colors.info },
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
        <Text style={styles.headerTitle}>Orders</Text>
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


      {/* 🔎 Show Search OR Tabs */}
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

      {/* Order List */}
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
          renderItem={renderOrderCard}
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

            if (showSearch && searchQuery) {
              // Search mode with query
              iconName = "magnify";
              title = "No orders found";
              subtitle = "Try different search terms";
            } else if (activeTab === 1) {
              // Pending tab
              iconName = "clock-outline";
              title = "No pending orders";
              subtitle = "Pending orders will appear here";
            } else if (activeTab === 2) {
              // Delivered tab
              iconName = "truck-delivery-outline";
              title = "No delivered orders";
              subtitle = "Delivered orders will appear here";
            } else if (activeTab === 3) {
              // Rejected tab
              iconName = "close-circle-outline";
              title = "No rejected orders";
              subtitle = "Rejected orders will appear here";
            } else if (activeTab === 4) {
              // Hold tab
              iconName = "pause-circle-outline";
              title = "No orders on hold";
              subtitle = "Orders on hold will appear here";
            } else {
              // All tab or general empty state
              iconName = "package-variant-closed";
              title = "No orders found";
              subtitle = "Create your first order";
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
          <TouchableOpacity onPress={() => navigation.navigate("OrderForm")}
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

      {/* Order Details Modal */}
      <OrderDetails
        orderId={selectedOrderId}
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

  // 🔎 SearchBar styles
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  orderNumber: {
    fontWeight: "600",
    fontSize: DESIGN.typography.bodyLarge.fontSize,
    color: DESIGN.colors.textPrimary,
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
  statusDelivered: {
    backgroundColor: DESIGN.colors.success + "20",
  },
  statusPending: {
    backgroundColor: DESIGN.colors.warning + "20",
  },
  statusRejected: {
    backgroundColor: DESIGN.colors.error + "20",
  },
  statusHold: {
    backgroundColor: DESIGN.colors.info + "20",
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
    justifyContent: "center",
    ...DESIGN.shadows.medium,
  },
});
export default OrderScreen;
