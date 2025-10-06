/**
 * TransactionDetails Component
 * 
 * Modal component displaying detailed information for a selected transaction
 * 
 * Created: October 6, 2025
 */
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    Modal,
    TouchableOpacity,
    SafeAreaView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DESIGN from "../../theme";
import apiClient from "../../api/client";

const TransactionDetails = ({ 
    transactionId, 
    visible = false, 
    onClose 
}) => {
    const [transactionDetails, setTransactionDetails] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch transaction details when modal is opened
    useEffect(() => {
        if (visible && transactionId) {
            fetchTransactionDetails();
        }
    }, [visible, transactionId]);

    const fetchTransactionDetails = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/payment/transactions/${transactionId}/`);
            setTransactionDetails(response.data);
        } catch (error) {
            console.error("Error fetching transaction details:", error);
            // Handle error silently or show toast
        } finally {
            setLoading(false);
        }
    };

    if (!visible) {
        return null;
    }

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleString();
        } catch {
            return dateString || 'N/A';
        }
    };

    const formatCurrency = (amount) => {
        try {
            return `₹${Number(amount).toLocaleString()}`;
        } catch {
            return `₹${amount || 0}`;
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.modalContainer}>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <MaterialCommunityIcons
                            name="close"
                            size={24}
                            color={DESIGN.colors.textPrimary}
                        />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Transaction Details</Text>
                    <View style={styles.headerSpacer} />
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={DESIGN.colors.primary} />
                        <Text style={styles.loadingText}>Loading details...</Text>
                    </View>
                ) : !transactionDetails ? (
                    <View style={styles.errorContainer}>
                        <MaterialCommunityIcons
                            name="alert-circle-outline"
                            size={64}
                            color={DESIGN.colors.textSecondary}
                        />
                        <Text style={styles.errorText}>Unable to load transaction details</Text>
                    </View>
                ) : (
                    <ScrollView 
                        style={styles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                <View style={styles.detailsCard}>
                    {/* Basic Information */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Basic Information</Text>
                        
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Transaction Number:</Text>
                            <Text style={styles.detailValue}>
                                {transactionDetails.transaction_number}
                            </Text>
                        </View>
                        
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Amount:</Text>
                            <Text style={[styles.detailValue, styles.amountText]}>
                                {formatCurrency(transactionDetails.amount)}
                            </Text>
                        </View>
                        
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Status:</Text>
                            <Text style={[
                                styles.detailValue, 
                                styles.statusText,
                                transactionDetails.status === 'completed' && styles.statusCompleted,
                                transactionDetails.status === 'pending' && styles.statusPending,
                                transactionDetails.status === 'failed' && styles.statusFailed
                            ]}>
                                {transactionDetails.status_display}
                            </Text>
                        </View>
                        
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Type:</Text>
                            <Text style={styles.detailValue}>
                                {transactionDetails.transaction_type_display}
                            </Text>
                        </View>
                    </View>

                    {/* Payment Information */}
                    {transactionDetails.payment_info && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Payment Information</Text>
                            
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Dealer:</Text>
                                <Text style={styles.detailValue}>
                                    {transactionDetails.payment_info.dealer_name || 'N/A'}
                                </Text>
                            </View>
                            
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Invoice:</Text>
                                <Text style={styles.detailValue}>
                                    {transactionDetails.payment_info.payment_number || 'N/A'}
                                </Text>
                            </View>
                            
                            {transactionDetails.payment_info.total_amount && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Total Invoice Amount:</Text>
                                    <Text style={styles.detailValue}>
                                        {formatCurrency(transactionDetails.payment_info.total_amount)}
                                    </Text>
                                </View>
                            )}
                            
                            {transactionDetails.payment_info.pending_amount !== undefined && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Remaining Amount:</Text>
                                    <Text style={[
                                        styles.detailValue,
                                        Number(transactionDetails.payment_info.pending_amount) > 0 
                                            ? styles.pendingAmount 
                                            : styles.completedAmount
                                    ]}>
                                        {formatCurrency(transactionDetails.payment_info.pending_amount)}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Payment Method Information */}
                    {transactionDetails.payment_method_info && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Payment Method</Text>
                            
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Method:</Text>
                                <Text style={styles.detailValue}>
                                    {transactionDetails.payment_method_info.name || 'N/A'}
                                </Text>
                            </View>
                            
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Type:</Text>
                                <Text style={styles.detailValue}>
                                    {transactionDetails.payment_method_info.method_type_display || 'N/A'}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Transaction Details */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Transaction Details</Text>
                        
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Transaction Date:</Text>
                            <Text style={styles.detailValue}>
                                {formatDate(transactionDetails.transaction_date)}
                            </Text>
                        </View>
                        
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Value Date:</Text>
                            <Text style={styles.detailValue}>
                                {transactionDetails.value_date || 'N/A'}
                            </Text>
                        </View>
                        
                        {transactionDetails.utr_number && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>UTR Number:</Text>
                                <Text style={[styles.detailValue, styles.utrText]}>
                                    {transactionDetails.utr_number}
                                </Text>
                            </View>
                        )}
                        
                        {transactionDetails.cheque_number && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Cheque Number:</Text>
                                <Text style={styles.detailValue}>
                                    {transactionDetails.cheque_number}
                                </Text>
                            </View>
                        )}
                        
                        {transactionDetails.cheque_date && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Cheque Date:</Text>
                                <Text style={styles.detailValue}>
                                    {transactionDetails.cheque_date}
                                </Text>
                            </View>
                        )}
                        
                        {transactionDetails.bank_name && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Bank Name:</Text>
                                <Text style={styles.detailValue}>
                                    {transactionDetails.bank_name}
                                </Text>
                            </View>
                        )}
                        
                        {transactionDetails.beneficiary_name && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Beneficiary:</Text>
                                <Text style={styles.detailValue}>
                                    {transactionDetails.beneficiary_name}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Reconciliation Status */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Reconciliation</Text>
                        
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Reconciled:</Text>
                            <Text style={[
                                styles.detailValue, 
                                transactionDetails.is_reconciled ? styles.reconciledYes : styles.reconciledNo
                            ]}>
                                {transactionDetails.is_reconciled ? 'Yes' : 'No'}
                            </Text>
                        </View>
                        
                        {transactionDetails.is_reconciled && transactionDetails.reconciled_by_name && (
                            <>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Reconciled By:</Text>
                                    <Text style={styles.detailValue}>
                                        {transactionDetails.reconciled_by_name}
                                    </Text>
                                </View>
                                
                                {transactionDetails.reconciled_at && (
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Reconciled At:</Text>
                                        <Text style={styles.detailValue}>
                                            {formatDate(transactionDetails.reconciled_at)}
                                        </Text>
                                    </View>
                                )}
                            </>
                        )}
                    </View>

                    {/* Additional Information */}
                    {(transactionDetails.remarks || transactionDetails.added_by_name || transactionDetails.approved_by_name) && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Additional Information</Text>
                            
                            {transactionDetails.remarks && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Remarks:</Text>
                                    <Text style={styles.detailValue}>
                                        {transactionDetails.remarks}
                                    </Text>
                                </View>
                            )}
                            
                            {transactionDetails.added_by_name && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Added By:</Text>
                                    <Text style={styles.detailValue}>
                                        {transactionDetails.added_by_name}
                                    </Text>
                                </View>
                            )}
                            
                            {transactionDetails.approved_by_name && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Approved By:</Text>
                                    <Text style={styles.detailValue}>
                                        {transactionDetails.approved_by_name}
                                    </Text>
                                </View>
                            )}
                            
                            {transactionDetails.created_at && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Created At:</Text>
                                    <Text style={styles.detailValue}>
                                        {formatDate(transactionDetails.created_at)}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Attachment Information */}
                    {transactionDetails.attachment && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Attachment</Text>
                            
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>File:</Text>
                                <Text style={[styles.detailValue, styles.attachmentText]}>
                                    {transactionDetails.attachment.split('/').pop()}
                                </Text>
                            </View>
                        </View>
                    )}
                </View> {/* Close detailsCard */}
                    </ScrollView>
                )}
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: DESIGN.colors.background,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: DESIGN.spacing.md,
        paddingVertical: DESIGN.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: DESIGN.colors.borderLight,
        backgroundColor: DESIGN.colors.surface,
    },
    closeButton: {
        padding: DESIGN.spacing.xs,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: DESIGN.typography.subtitle.fontWeight,
        color: DESIGN.colors.textPrimary,
        flex: 1,
        textAlign: "center",
    },
    headerSpacer: {
        width: 40, // Balance the close button
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
    container: {
        flex: 1,
        backgroundColor: DESIGN.colors.background,
    },
    title: {
        ...DESIGN.typography.subtitle,
        color: DESIGN.colors.textPrimary,
        marginBottom: DESIGN.spacing.md,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: DESIGN.spacing.md,
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
    statusFailed: {
        color: DESIGN.colors.error,
    },
    pendingAmount: {
        color: DESIGN.colors.error,
        fontWeight: "500",
    },
    completedAmount: {
        color: DESIGN.colors.success,
        fontWeight: "500",
    },
    utrText: {
        fontFamily: "monospace",
        color: DESIGN.colors.primary,
    },
    reconciledYes: {
        color: DESIGN.colors.success,
        fontWeight: "500",
    },
    reconciledNo: {
        color: DESIGN.colors.error,
        fontWeight: "500",
    },
    attachmentText: {
        color: DESIGN.colors.primary,
        textDecorationLine: "underline",
    },
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: DESIGN.spacing.md,
        justifyContent: "center",
    },
    loadingText: {
        marginLeft: DESIGN.spacing.sm,
        color: DESIGN.colors.textSecondary,
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

export default TransactionDetails;