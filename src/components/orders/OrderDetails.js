// OrderDetails.js
import React, { useEffect, useState } from "react";
import { View, Text, Modal, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import DESIGN from "../../theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import apiClient from "../../api/client";

const OrderDetails = ({ orderId, visible, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);

  const fetchOrderDetails = async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      const response = await apiClient.get(`/order/api/orders/${orderId}/`);
      if (response.data.success) {
        setOrder(response.data.data);
      }
    } catch (error) {
      console.log("Error fetching order details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchOrderDetails();
    }
  }, [visible, orderId]);

  return (
    <Modal visible={visible} animationType="slide" transparent={true} >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Order Details</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={DESIGN.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={DESIGN.colors.primary} style={{ marginTop: 20 }} />
          ) : (
            order && (
              <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* <Text style={styles.label}>Order Number:</Text>
                <Text style={styles.value}>{order.order_number}</Text> */}

                <Text style={styles.label}>Dealer:</Text>
                <Text style={styles.value}>{order.dealer_owner} ({order.dealer_name})</Text>

                <Text style={styles.label}>Phone:</Text>
                <Text style={styles.value}>{order.dealer_phone}</Text>

                <Text style={styles.label}>Status:</Text>
                <Text style={styles.value}>{order.status_display}</Text>

                <Text style={styles.label}>Remark:</Text>
                <Text style={styles.value}>{order.remark || "-"}</Text>

                {/* <Text style={styles.label}>Expected Delivery:</Text>
                <Text style={styles.value}>{order.expected_delivery_date || "-"}</Text> */}

                <Text style={styles.label}>Total Order Value:</Text>
                <Text style={styles.value}>₹ {order.total_order_value}</Text>

                <Text style={styles.label}>Items:</Text>
                {order.order_items.map((item) => (
                  <View key={item.id} style={styles.itemCard}>
                    <Text style={styles.value}>{item.product_name} ({item.packing_size})</Text>
                    <Text style={styles.value}>Qty: {item.quantity} {item.quantity_unit}</Text>
                    <Text style={styles.value}>Price: ₹ {item.price}</Text>
                    <Text style={styles.value}>Discount: ₹ {item.discount_amount}</Text>
                    <Text style={styles.value}>Tax: ₹ {item.tax_amount}</Text>
                    <Text style={styles.value}>Total: ₹ {item.order_item_total_price}</Text>
                  </View>
                ))}
              </ScrollView>
            )
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 16,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    maxHeight: "90%",
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: "600", color: DESIGN.colors.textPrimary },
  content: { paddingBottom: 20 },
  label: { fontWeight: "600", marginTop: 10 },
  value: { marginBottom: 4, color: "#333" },
  itemCard: {
    backgroundColor: "#f9f9f9",
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
  },
});

export default OrderDetails;
