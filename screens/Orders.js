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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DESIGN from "../src/theme";
import { navigation } from "../navigation/NavigationService";
import apiClient from "../src/api/client"; // Your API client
import OrderDetails from "../src/components/orders/OrderDetails";

const { width } = Dimensions.get("window");
const TABS = ["All", "Pending", "Approved", "Rejected", "Hold"];
const TAB_COUNT = TABS.length;
const TAB_WIDTH = width / TAB_COUNT;

function OrderScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  // inside OrderScreen component
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const handleCardPress = (orderId) => {
    setSelectedOrderId(orderId);
    setModalVisible(true);
  };

  const statusMap = {
    0: "", // All
    1: "processing",
    2: "approved",
    3: "cancelled",
    4: "hold",
  };

  // 🔹 fetch orders only by status
  const fetchOrders = async (status = "") => {
    try {
      setLoading(true);
      const response = await apiClient.get("/order/api/orders/", {
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

  // 🔹 only depends on activeTab
  useEffect(() => {
    fetchOrders(statusMap[activeTab]);
  }, [activeTab]);

  const handleTabPress = (index) => {
    setActiveTab(index);
    Animated.spring(translateX, {
      toValue: index * TAB_WIDTH,
      useNativeDriver: true,
    }).start();
  };

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
        <Text style={styles.dealerName}>{item.dealer_owner}</Text>

        <View style={styles.amountRow}>
          <Text style={styles.totalValue}>
            Amount : ₹ {item.total_order_value}
          </Text>
          <View
            style={[
              styles.statusContainer,
              item.status === "draft" && styles.statusdrafted,
              item.status === "approved" && styles.statusApproved,
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
                item.status === "approved" && { color: "#07883dff" },
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
    <View style={{ flex: 1, backgroundColor: DESIGN.colors.surface }}>
      {/* Header with Safe Area */}
      <View
        style={{
          paddingTop: insets.top,
          backgroundColor: DESIGN.colors.searchInput,
        }}
      >
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
              <TouchableOpacity onPress={() => navigation.navigate("OrderForm")}>
                <MaterialCommunityIcons
                  name="plus-circle"
                  size={30}
                  color={DESIGN.colors.primary}
                  style={styles.icon}
                />
              </TouchableOpacity>
              <TouchableOpacity>
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
      </View>

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

      {/* Order List */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={DESIGN.colors.primary}
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrderCard}
          contentContainerStyle={{ padding: DESIGN.spacing.md }}
          showsVerticalScrollIndicator={false}
        />
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
    fontWeight: "600",
    color: DESIGN.colors.textPrimary,
  },
  headerIcons: { flexDirection: "row", alignItems: "center" },
  icon: { marginLeft: DESIGN.spacing.md },
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: DESIGN.spacing.xm,
  },
  tab: {
    width: TAB_WIDTH,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: { fontSize: 14, color: "#555", fontWeight: 700 },
  activeTabText: { color: DESIGN.colors.primary, fontWeight: "600" },
  indicator: {
    height: 3,
    width: TAB_WIDTH,
    backgroundColor: DESIGN.colors.primary,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: DESIGN.spacing.md,
    marginBottom: DESIGN.spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between" },
  orderNumber: { fontWeight: "600", fontSize: 16 },
  createdAt: {
    fontWeight: "100",
    fontSize: 14,
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
  },
  dealerName: {
    color: DESIGN.colors.primary,
    marginVertical: 4,
    fontWeight: "800",
    fontSize: 16,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalValue: { fontWeight: "600", fontSize: 15 },
  paymentType: { color: "#3498db", fontSize: 12 },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: { fontSize: 12, marginRight: 4, fontWeight: 50 },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 18,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginLeft: 10,
  },
});

export default OrderScreen;
