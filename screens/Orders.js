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
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const TABS = ["All", "Pending", "Delivered", "Rejected", "Hold"];
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
      <TextInput
        ref={inputRef}
        style={styles.searchInput}
        placeholder="Search by Dealer or Shop name..."
        placeholderTextColor="#888"
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
    2: "delivered",
    3: "cancelled",
    4: "hold",
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
        <Text style={styles.shopName}>{item.dealer_name}</Text>
        <Text style={styles.dealerName}>{item.dealer_owner}</Text>

        <View style={styles.amountRow}>
          <Text style={styles.totalValue}>Amount : ₹ {item.total_order_value}</Text>
          <View
            style={[
              styles.statusContainer,
              item.status === "draft" && styles.statusdrafted,
              item.status === "delivered" && styles.statusDelivered,
              item.status === "processing" && styles.statusPending,
              item.status === "cancelled" && styles.statusRejected,
              item.status === "hold" && styles.statusHold,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { fontSize: 14 },
                item.status === "draft" && { color: "#080808ff" },
                item.status === "delivered" && { color: "#07883dff" },
                item.status === "processing" && { color: "#f5cd2cff" },
                item.status === "cancelled" && { color: "#e42712ff" },
                item.status === "hold" && { color: "#3498db" },
              ]}
            >
              {item.status_display}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={DESIGN.colors.textPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>List of Orders</Text>
        <View style={styles.headerIcons}>
          {/* 🔎 Toggle search */}
          <TouchableOpacity
            onPress={() => {
              if (showSearch) {
                setShowSearch(false);
                setSearchQuery(""); // reset text too
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

          <TouchableOpacity>
            <MaterialCommunityIcons
              name="filter-variant"
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
        />
      )}
      {/* Bottom Add Button */}
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
          {/* <Text style={modernStyles.addButtonText}>Add {type}</Text> */}
        </TouchableOpacity>
      </View>

      {/* Order Details Modal */}
      <OrderDetails
        orderId={selectedOrderId}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />

    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: DESIGN.spacing.md,
    paddingVertical: DESIGN.spacing.md,
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
    margin: DESIGN.spacing.md,
    borderRadius: DESIGN.borderRadius.sm,
    paddingHorizontal: DESIGN.spacing.sm,
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
    marginVertical: DESIGN.spacing.xs,
    fontStyle: 'italic',
    fontWeight: "400",
    fontSize: DESIGN.typography.body.fontSize,
    color: DESIGN.colors.textPrimary,
  },
  shopName: {
    color: DESIGN.colors.primary,
    marginVertical: DESIGN.spacing.xs,
    fontWeight: "700",
    fontSize: DESIGN.typography.body.fontSize,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalValue: {
    fontWeight: "600",
    fontSize: DESIGN.typography.body.fontSize,
    color: DESIGN.colors.textPrimary,
  },
  paymentType: {
    color: DESIGN.colors.accent,
    fontSize: DESIGN.typography.caption.fontSize,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: DESIGN.spacing.sm,
    alignSelf: "flex-start",
    paddingHorizontal: DESIGN.spacing.sm,
    paddingVertical: DESIGN.spacing.xs,
    borderRadius: DESIGN.borderRadius.sm,
    backgroundColor: DESIGN.colors.surfaceElevated,
  },
  statusText: {
    fontSize: DESIGN.typography.caption.fontSize,
    marginRight: DESIGN.spacing.xs,
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
});
export default OrderScreen;
