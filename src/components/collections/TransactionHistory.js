/**
 * TransactionHistory Component
 * 
 * Handles transaction listing and details display using documented APIs
 * 
 * API Endpoints Used:
 * - GET /payment/transactions/ - List all transactions
 * - GET /payment/transactions/{id}/ - Get transaction details
 * 
 * Authentication: Token-based as per documentation
 * Base URL: Configured via EXPO_PUBLIC_API_URL environment variable
 * 
 * Created: October 6, 2025
 */
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from "react-native";
import apiClient from "../../api/client";
import DESIGN from "../../theme";

const TransactionHistory = ({ onTransactionSelect, refreshTrigger }) => {
    // Transaction States
    const [transactions, setTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [transactionDetails, setTransactionDetails] = useState(null);
    const [loadingTransactionDetails, setLoadingTransactionDetails] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    // Fetch transactions when component mounts or refresh is triggered
    useEffect(() => {
        if (showHistory || refreshTrigger) {
            fetchTransactionHistory();
        }
    }, [showHistory, refreshTrigger]);

    // ========== API Functions ==========
    const fetchTransactionHistory = async () => {
        try {
            setLoadingTransactions(true);
            const response = await apiClient.get("/payment/transactions/");

            console.log("Transaction History API Response:", response.data);

            // Handle the response - it should be an array of transactions
            if (Array.isArray(response.data)) {
                setTransactions(response.data);
            } else if (response.data?.success && response.data?.data) {
                const transactionData = Array.isArray(response.data.data) ? response.data.data : [];
                setTransactions(transactionData);
            } else {
                console.log("Transaction history API response structure unexpected:", response.data);
                setTransactions([]);
            }
        } catch (error) {
            console.log("Error fetching transaction history:", error);
            setTransactions([]);
            Alert.alert("Error", "Failed to fetch transaction history. Please try again.");
        } finally {
            setLoadingTransactions(false);
        }
    };

    const fetchTransactionDetails = async (transactionId) => {
        try {
            setLoadingTransactionDetails(true);
            const response = await apiClient.get(`/payment/transactions/${transactionId}/`);

            console.log("Transaction Details API Response:", response.data);

            if (response.data) {
                setTransactionDetails(response.data);
                if (onTransactionSelect) {
                    onTransactionSelect(response.data);
                }
            } else {
                console.log("Transaction details API response is empty:", response.data);
                setTransactionDetails(null);
            }
        } catch (error) {
            console.log("Error fetching transaction details:", error);
            setTransactionDetails(null);
            Alert.alert("Error", "Failed to fetch transaction details. Please try again.");
        } finally {
            setLoadingTransactionDetails(false);
        }
    };

    // ========== Event Handlers ==========
    const handleToggleHistory = () => {
        setShowHistory(!showHistory);
        if (!showHistory && transactions.length === 0) {
            fetchTransactionHistory();
        }
    };

    const handleSelectTransaction = (transaction) => {
        setSelectedTransaction(transaction);
        fetchTransactionDetails(transaction.id);
    };

    // ========== Render Transaction Item ==========
    const renderTransactionItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.transactionCard,
                selectedTransaction?.id === item.id && styles.transactionCardSelected
            ]}
            onPress={() => handleSelectTransaction(item)}
        >
            <View style={styles.transactionHeader}>
                <Text style={styles.transactionNumber}>
                    {item.transaction_number}
                </Text>
                <Text style={[
                    styles.transactionStatus,
                    item.status === 'completed' && styles.statusCompleted,
                    item.status === 'pending' && styles.statusPending,
                    item.status === 'failed' && styles.statusFailed
                ]}>
                    {item.status_display}
                </Text>
            </View>
            
            <View style={styles.transactionDetails}>
                <Text style={styles.transactionAmount}>
                    {`₹${Number(item.amount).toLocaleString()}`}
                </Text>
                <Text style={styles.transactionDate}>
                    {new Date(item.transaction_date).toLocaleDateString()}
                </Text>
            </View>
            
            <Text style={styles.transactionDealer}>
                {item.payment_info?.dealer_name || 'Unknown Dealer'}
            </Text>
            <Text style={styles.transactionMethod}>
                {item.payment_method_name}
            </Text>
            
            {item.utr_number && (
                <Text style={styles.transactionUtr}>
                    UTR: {item.utr_number}
                </Text>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Transaction History</Text>
                <TouchableOpacity 
                    style={styles.toggleButton} 
                    onPress={handleToggleHistory}
                >
                    <Text style={styles.toggleButtonText}>
                        {showHistory ? 'Hide' : 'Show'}
                    </Text>
                </TouchableOpacity>
            </View>
            
            {showHistory && (
                <>
                    {loadingTransactions ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="#007bff" />
                            <Text style={styles.loadingText}>Loading transactions...</Text>
                        </View>
                    ) : transactions.length > 0 ? (
                        <FlatList
                            data={transactions}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderTransactionItem}
                            style={transactions.length > 3 ? styles.scrollableList : null}
                            scrollEnabled={transactions.length > 3}
                            showsVerticalScrollIndicator={transactions.length > 3}
                            nestedScrollEnabled={true}
                        />
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No transactions found</Text>
                            <TouchableOpacity 
                                style={styles.refreshButton} 
                                onPress={fetchTransactionHistory}
                            >
                                <Text style={styles.refreshButtonText}>Refresh</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: DESIGN.colors.surface,
        borderRadius: DESIGN.borderRadius.md,
        padding: DESIGN.spacing.md,
        marginBottom: DESIGN.spacing.md,
        ...DESIGN.shadows.medium,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: DESIGN.spacing.sm,
    },
    title: {
        ...DESIGN.typography.subtitle,
        color: DESIGN.colors.textPrimary,
    },
    toggleButton: {
        backgroundColor: DESIGN.colors.surface,
        paddingHorizontal: DESIGN.spacing.md,
        paddingVertical: DESIGN.spacing.sm,
        borderRadius: DESIGN.borderRadius.md,
        borderWidth: 1,
        borderColor: DESIGN.colors.border,
        ...DESIGN.shadows.small,
    },
    toggleButtonText: {
        ...DESIGN.typography.body,
        color: DESIGN.colors.textPrimary,
        fontWeight: "600",
        textAlign: "center",
    },
    scrollableList: {
        maxHeight: 300,
    },
    transactionCard: {
        borderWidth: 1,
        borderColor: DESIGN.colors.border,
        borderRadius: DESIGN.borderRadius.sm,
        padding: DESIGN.spacing.sm,
        marginBottom: DESIGN.spacing.sm,
        backgroundColor: DESIGN.colors.surfaceElevated,
    },
    transactionCardSelected: {
        borderColor: DESIGN.colors.primary,
        backgroundColor: DESIGN.colors.surfaceElevated,
    },
    transactionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: DESIGN.spacing.sm,
    },
    transactionNumber: {
        ...DESIGN.typography.body,
        fontWeight: "600",
        color: DESIGN.colors.textPrimary,
        flex: 1,
    },
    transactionStatus: {
        ...DESIGN.typography.small,
        color: DESIGN.colors.textSecondary,
        backgroundColor: DESIGN.colors.borderLight,
        paddingHorizontal: DESIGN.spacing.sm,
        paddingVertical: DESIGN.spacing.xs,
        borderRadius: DESIGN.borderRadius.xs,
    },
    statusCompleted: {
        backgroundColor: DESIGN.colors.success + '20',
        color: DESIGN.colors.success,
    },
    statusPending: {
        backgroundColor: DESIGN.colors.warning + '20',
        color: DESIGN.colors.warning,
    },
    statusFailed: {
        backgroundColor: DESIGN.colors.error + '20',
        color: DESIGN.colors.error,
    },
    transactionDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: DESIGN.spacing.xs,
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: "600",
        color: DESIGN.colors.success,
    },
    transactionDate: {
        fontSize: 14,
        color: DESIGN.colors.textSecondary,
    },
    transactionDealer: {
        ...DESIGN.typography.caption,
        color: DESIGN.colors.textPrimary,
        marginBottom: DESIGN.spacing.xs,
    },
    transactionMethod: {
        ...DESIGN.typography.small,
        color: DESIGN.colors.textSecondary,
    },
    transactionUtr: {
        ...DESIGN.typography.small,
        color: DESIGN.colors.primary,
        marginTop: DESIGN.spacing.xs,
        fontStyle: "italic",
    },
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: DESIGN.spacing.sm,
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
        marginBottom: DESIGN.spacing.md,
    },
    refreshButton: {
        backgroundColor: DESIGN.colors.primary,
        paddingHorizontal: DESIGN.spacing.md,
        paddingVertical: DESIGN.spacing.sm,
        borderRadius: DESIGN.borderRadius.sm,
    },
    refreshButtonText: {
        color: DESIGN.colors.surface,
        ...DESIGN.typography.caption,
        fontWeight: "600",
    },
});

export default TransactionHistory;