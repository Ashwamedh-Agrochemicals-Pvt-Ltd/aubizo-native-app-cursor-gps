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
  TouchableOpacity,
  Share,
  Linking,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import DESIGN from "../../theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import apiClient from "../../api/client";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const OrderDetails = ({ orderId, visible, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [order, setOrder] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchOrderDetails = async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      const response = await apiClient.get(`/order/api/individual/orders/${orderId}/`);
      if (response.data.success) {
        setOrder(response.data.data);
        setSelectedFile(null);
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

  const onShare = async () => {
    try {
      if (!order) return;

      const itemsText = order.order_items
        .map(
          (item, index) =>
            `${index + 1}) ${item.product_name} (${item.packing_size}) - Qty: ${item.quantity
            } ${item.quantity_unit}`)
        .join("\n");

      const message = `
🧾 *Order Summary*
Order No: ${order.order_number}
Status: ${order.status_display}

👤 *Dealer Details*
Name: ${order.dealer_name}
Owner: ${order.dealer_owner}

📍 *Billing Address*
${order.dealer_shipping_address}

📦 *Order Items*
${itemsText}

🚚 Expected Delivery: ${order.expected_delivery_date}
🧑‍💼 Added By: ${order.added_by_name}`;

      await Share.share({ message });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const pickLetterhead = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        setSelectedFile(result.assets[0]);
      }
    } catch (err) {
      console.error("Picker error:", err);
    }
  };

  const uploadLetterhead = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      const formData = new FormData();

      formData.append("dealer_id", String(order.dealer_id));

      const currentItems = order.order_items.map(item => ({
        product: item.product_id || item.product,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount || 0,
        tax: item.tax || 0,
      }));
      formData.append("order_items", JSON.stringify(currentItems));

      formData.append("letterhead_document", {
        uri: selectedFile.uri,
        type: selectedFile.mimeType || "application/octet-stream",
        name: selectedFile.name || `letterhead_${Date.now()}.pdf`,
      });

      const response = await apiClient.put(
        `/order/api/orders/${orderId}/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.success) {
        Alert.alert("Success", "Letterhead uploaded successfully!");
        fetchOrderDetails();
      }
    } catch (error) {
      Alert.alert("Upload Failed", "Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => setSelectedFile(null);

  const openLetterhead = () => {
    if (order?.letterhead_document) {
      const url = `${apiClient.defaults.baseURL}${order.letterhead_document}`;
      console.log(url)
      Linking.openURL(url).catch(() => Alert.alert("Error", "Cannot open file"));
    }
  };

  // Check if letterhead already exists
  const hasLetterhead = order?.letterhead_document;



  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Order Details</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>

              <TouchableOpacity onPress={onShare}>
                <MaterialCommunityIcons
                  name="share-variant"
                  size={24}
                  color={DESIGN.colors.primary}
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={onClose}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={DESIGN.colors.textPrimary}
                />
              </TouchableOpacity>

            </View>
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
                {/* Letterhead Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Letterhead Document</Text>

                  {hasLetterhead ? (
                    // Show only view option when letterhead exists
                    <TouchableOpacity onPress={openLetterhead} style={styles.letterheadButton}>
                      <MaterialCommunityIcons name="file-check" size={26} color={DESIGN.colors.success} />
                      <Text style={styles.letterheadText}>View Uploaded Letterhead</Text>
                    </TouchableOpacity>
                  ) : (
                    // Show upload option only when no letterhead exists
                    <>
                      {selectedFile ? (
                        <View style={styles.fileContainer}>
                          <View style={styles.fileInfo}>
                            <MaterialCommunityIcons
                              name={selectedFile.mimeType?.startsWith("image/") ? "image" : "file-document"}
                              size={20}
                              color={DESIGN.colors.primary}
                            />
                            <Text style={styles.fileName} numberOfLines={1}>
                              {selectedFile.name || "Letterhead"}
                            </Text>
                          </View>
                          <TouchableOpacity onPress={removeFile} style={styles.removeButton}>
                            <MaterialCommunityIcons name="close-circle" size={24} color={DESIGN.colors.error} />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity onPress={pickLetterhead} style={styles.uploadButton}>
                          <MaterialCommunityIcons name="plus-circle-outline" size={24} color={DESIGN.colors.primary} />
                          <Text style={styles.uploadButtonText}>Add Letterhead Document</Text>
                        </TouchableOpacity>
                      )}

                      {selectedFile && (
                        <TouchableOpacity
                          onPress={uploadLetterhead}
                          disabled={uploading}
                          style={[styles.uploadButton, { backgroundColor: DESIGN.colors.success, marginTop: 12 }]}
                        >
                          {uploading ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <>
                              <MaterialCommunityIcons name="upload" size={24} color="#fff" />
                              <Text style={[styles.uploadButtonText, { color: "#fff" }]}>Upload Letterhead</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </View>
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
  fileContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DESIGN.colors.surfaceElevated,
    borderRadius: DESIGN.borderRadius.sm,
    padding: DESIGN.spacing.md,
    borderWidth: 1,
    borderColor: DESIGN.colors.borderLight,
  },
  fileInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  fileName: {
    flex: 1,
    marginLeft: DESIGN.spacing.sm,
    fontSize: DESIGN.typography.body.fontSize,
    color: DESIGN.colors.textPrimary,
    fontWeight: "500",
  },
  removeButton: {
    padding: DESIGN.spacing.xs,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DESIGN.colors.surfaceElevated,
    borderRadius: DESIGN.borderRadius.sm,
    padding: DESIGN.spacing.md,
    borderWidth: 1,
    borderColor: DESIGN.colors.surface,
    borderStyle: "dashed",
  },
  uploadButtonText: {
    marginLeft: DESIGN.spacing.sm,
    fontSize: DESIGN.typography.body.fontSize,
    color: DESIGN.colors.primary,
    fontWeight: "500",
  },
  letterheadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.borderRadius.sm,
    borderWidth: 1.5,
    borderColor: DESIGN.colors.success + "60",
  },
  letterheadText: {
    marginLeft: 12,
    color: DESIGN.colors.success,
    fontWeight: "600",
    fontSize: 15.5,
  },
});

export default OrderDetails;