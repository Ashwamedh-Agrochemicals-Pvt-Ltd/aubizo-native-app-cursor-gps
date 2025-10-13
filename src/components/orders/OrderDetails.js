/**
 * OrderDetails Component
 *
 * Modal component displaying detailed information for a selected order
 * Improved based on TransactionDetails.js patterns
 *
 * Updated: October 10, 2025
 */
import { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity
} from "react-native";
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
      const response = await apiClient.get(`/order/api/individual/orders/${orderId}/`);
      if (response.data.success) {
        setOrder(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      // Handle error silently or show toast
    } finally {
      setLoading(false);
    }
  };

  // Fetch order details when modal is opened
  useEffect(() => {
    if (visible && orderId) {
      fetchOrderDetails();
    }
  }, [visible, orderId]);

  if (!visible) {
    return null;
  }

  const formatCurrency = (amount) => {
    try {
      return `₹${Number(amount).toLocaleString()}`;
    } catch {
      return `₹${amount || 0}`;
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString || "N/A";
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Order Details</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={DESIGN.colors.textPrimary}
              />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={DESIGN.colors.primary} />
              <Text style={styles.loadingText}>Loading order details...</Text>
            </View>
          ) : !order ? (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={64}
                color={DESIGN.colors.textSecondary}
              />
              <Text style={styles.errorText}>
                Unable to load order details
              </Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.detailsCard}>
                {/* Basic Information */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Basic Information</Text>

                  {order.order_number && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Order Number:</Text>
                      <Text style={styles.detailValue}>
                        {order.order_number}
                      </Text>
                    </View>
                  )}

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <Text
                      style={[
                        styles.detailValue,
                        styles.statusText,
                        order.status === "completed" && styles.statusCompleted,
                        order.status === "pending" && styles.statusPending,
                        order.status === "cancelled" && styles.statusCancelled,
                      ]}
                    >
                      {order.status_display}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Total Order Value:</Text>
                    <Text style={[styles.detailValue, styles.amountText]}>
                      {formatCurrency(order.total_order_value)}
                    </Text>
                  </View>

                  {order.expected_delivery_date && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Expected Delivery:</Text>
                      <Text style={styles.detailValue}>
                        {formatDate(order.expected_delivery_date)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Dealer Information */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Dealer Information</Text>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Dealer Name:</Text>
                    <Text style={styles.detailValue}>
                      {order.dealer_name || "N/A"}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Owner:</Text>
                    <Text style={styles.detailValue}>
                      {order.dealer_owner || "N/A"}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Phone:</Text>
                    <Text style={styles.detailValue}>
                      {order.dealer_phone || "N/A"}
                    </Text>
                  </View>
                </View>

                {/* Order Items */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Order Items</Text>

                  {order.order_items && order.order_items.length > 0 ? (
                    order.order_items.map((item, index) => (
                      <View key={item.id || index} style={styles.itemCard}>
                        <View style={styles.itemHeader}>
                          <Text style={styles.itemName}>
                            {item.product_name}
                          </Text>
                          <Text style={styles.itemTotal}>
                            {formatCurrency(item.order_item_total_price)}
                          </Text>
                        </View>

                        <View style={styles.itemDetails}>
                          <View style={styles.itemDetailRow}>
                            <Text style={styles.itemLabel}>Pack Size:</Text>
                            <Text style={styles.itemValue}>
                              {item.packing_size || "N/A"}
                            </Text>
                          </View>

                          <View style={styles.itemDetailRow}>
                            <Text style={styles.itemLabel}>Quantity:</Text>
                            <Text style={styles.itemValue}>
                              {item.quantity} {item.quantity_unit}
                            </Text>
                          </View>

                          <View style={styles.itemDetailRow}>
                            <Text style={styles.itemLabel}>Unit Price:</Text>
                            <Text style={styles.itemValue}>
                              {formatCurrency(item.price)}
                            </Text>
                          </View>

                          {item.discount_amount > 0 && (
                            <View style={styles.itemDetailRow}>
                              <Text style={styles.itemLabel}>Discount:</Text>
                              <Text style={[styles.itemValue, styles.discountText]}>
                                -{formatCurrency(item.discount_amount)}
                              </Text>
                            </View>
                          )}

                          <View style={styles.itemDetailRow}>
                            <Text style={styles.itemLabel}>Tax:</Text>
                            <Text style={styles.itemValue}>
                              {formatCurrency(item.tax_amount)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))
                  ) : (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>No items found</Text>
                    </View>
                  )}
                </View>

                {/* Additional Information */}
                {order.remark && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Additional Information</Text>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Remarks:</Text>
                      <Text style={styles.detailValue}>
                        {order.remark}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
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
    padding: DESIGN.spacing.md,
  },
  modalContainer: {
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.borderRadius.sm,
    maxHeight: "90%",
    padding: DESIGN.spacing.md,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: DESIGN.spacing.md,
  },
  modalTitle: {
    fontSize: DESIGN.typography.subtitle.fontSize,
    fontWeight: DESIGN.typography.subtitle.fontWeight,
    color: DESIGN.colors.textPrimary,
  },
  content: {
    paddingBottom: DESIGN.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: DESIGN.spacing.xl,
  },
  loadingText: {
    marginTop: DESIGN.spacing.md,
    color: DESIGN.colors.textSecondary,
    fontSize: DESIGN.typography.body.fontSize,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: DESIGN.spacing.xl,
  },
  errorText: {
    marginTop: DESIGN.spacing.md,
    color: DESIGN.colors.textSecondary,
    fontSize: DESIGN.typography.body.fontSize,
    textAlign: "center",
  },
  detailsCard: {
    backgroundColor: DESIGN.colors.surfaceElevated,
    borderRadius: DESIGN.borderRadius.sm,
    padding: DESIGN.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: DESIGN.colors.primary,
  },
  section: {
    marginBottom: DESIGN.spacing.md,
  },
  sectionTitle: {
    ...DESIGN.typography.body,
    fontWeight: "600",
    color: DESIGN.colors.primary,
    marginBottom: DESIGN.spacing.sm,
    textTransform: "uppercase",
    fontSize: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: DESIGN.spacing.sm,
    paddingBottom: DESIGN.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN.colors.borderLight,
  },
  detailLabel: {
    ...DESIGN.typography.caption,
    color: DESIGN.colors.textSecondary,
    fontWeight: "500",
    flex: 1,
    marginRight: DESIGN.spacing.sm,
  },
  detailValue: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textPrimary,
    flex: 2,
    textAlign: "right",
  },
  amountText: {
    fontWeight: "600",
    color: DESIGN.colors.success,
    fontSize: 16,
  },
  statusText: {
    fontWeight: "500",
  },
  statusCompleted: {
    color: DESIGN.colors.success,
  },
  statusPending: {
    color: DESIGN.colors.warning,
  },
  statusCancelled: {
    color: DESIGN.colors.error,
  },
  itemCard: {
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.borderRadius.sm,
    padding: DESIGN.spacing.md,
    marginBottom: DESIGN.spacing.sm,
    borderWidth: 1,
    borderColor: DESIGN.colors.borderLight,
    shadowColor: DESIGN.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: DESIGN.spacing.sm,
    paddingBottom: DESIGN.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN.colors.borderLight,
  },
  itemName: {
    ...DESIGN.typography.body,
    fontWeight: "600",
    color: DESIGN.colors.textPrimary,
    flex: 1,
    marginRight: DESIGN.spacing.sm,
  },
  itemTotal: {
    ...DESIGN.typography.body,
    fontWeight: "600",
    color: DESIGN.colors.success,
    fontSize: 16,
  },
  itemDetails: {
    gap: DESIGN.spacing.xs,
  },
  itemDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemLabel: {
    ...DESIGN.typography.caption,
    color: DESIGN.colors.textSecondary,
    fontWeight: "500",
  },
  itemValue: {
    ...DESIGN.typography.caption,
    color: DESIGN.colors.textPrimary,
    fontWeight: "400",
  },
  discountText: {
    color: DESIGN.colors.success,
    fontWeight: "500",
  },
  emptyContainer: {
    padding: DESIGN.spacing.md,
    alignItems: "center",
  },
  emptyText: {
    ...DESIGN.typography.caption,
    color: DESIGN.colors.textSecondary,
    fontStyle: "italic",
  },
});

export default OrderDetails;
