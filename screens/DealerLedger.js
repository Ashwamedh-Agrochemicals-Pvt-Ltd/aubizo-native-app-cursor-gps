import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    RefreshControl,
    FlatList,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '../src/api/client';
import DESIGN from '../src/theme';

const DealerLedger = () => {
    const route = useRoute();
    const { dealer } = route.params;
    const [ledgerData, setLedgerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchLedgerData = async () => {
        try {
            const response = await apiClient.get(`/payment/ledger/dealer/?dealer_id=${dealer.id}`);

            if (response.data) {
                setLedgerData(response.data);
                console.log("Response:", response.data)
            } else {
                Alert.alert('Error', 'Failed to fetch ledger data');
            }
        } catch (error) {
            console.error('Error fetching ledger data:', error);
            Alert.alert(
                'Error',
                error.response?.data?.error || 'Failed to load ledger information'
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchLedgerData();
    }, [dealer.id]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchLedgerData();
    };

    const formatCurrency = (amount) => {
        return `₹ ${parseFloat(amount).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    // Render individual transaction item
    const renderTransactionItem = ({ item: entry }) => {
        // Determine display amount and sign
        const credit = parseFloat(entry.credit_amount) || 0;
        const debit = parseFloat(entry.debit_amount) || 0;
        const amount = credit > 0 ? credit : debit;
        const isCredit = credit > 0;

        return (
            <View style={styles.compactEntry}>
                <View style={styles.compactLeft}>
                    <Text style={styles.compactDate}>{formatDate(entry.transaction_date)}</Text>
                    <Text style={styles.compactTitle} numberOfLines={1}>
                        {entry.entry_number}
                    </Text>

                </View>

                <View style={styles.compactRight}>
                    <Text style={[styles.compactAmount, isCredit ? styles.creditAmount : styles.debitAmount]}>
                        {formatCurrency(amount)}
                    </Text>
                    {entry.balance !== undefined && (
                        <Text style={styles.compactDelta}>{formatCurrency(entry.balance)}</Text>
                    )}
                </View>
            </View>
        );
    };

    // Render empty state for FlatList
    const renderEmptyTransactions = () => (
        <View style={styles.emptyState}>
            <MaterialIcons name="receipt-long" size={48} color={DESIGN.colors.textSecondary} />
            <Text style={styles.emptyText}>No transactions found</Text>
        </View>
    );

    // Key extractor for FlatList
    const keyExtractor = (item) => item.id.toString();

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={DESIGN.colors.primary} />
                <Text style={styles.loadingText}>Loading Ledger...</Text>
            </View>
        );
    }

    if (!ledgerData) {
        return (
            <View style={[styles.container, styles.centered]}>
                <MaterialIcons name="error-outline" size={48} color={DESIGN.colors.error} />
                <Text style={styles.errorText}>No ledger data found</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchLedgerData}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }
    return (
        <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[DESIGN.colors.primary]}
                    />
                }
                contentContainerStyle={styles.scrollContent}
            >
                {/* Dealer Info Card */}
                <View style={styles.dealerCard}>
                    <View style={styles.dealerHeader}>
                        <View style={styles.avatar}>
                            <Ionicons name="person" size={30} color="#fff" />
                        </View>
                        <View style={styles.dealerInfo}>
                            <Text style={styles.dealerName}>{ledgerData.dealer_shop_name}</Text>
                            <Text style={styles.dealerCompany}>{ledgerData.dealer_name}</Text>
                        </View>
                    </View>
                </View>

                {/* Summary Cards - Top: Prominent Closing Balance */}
                <View style={styles.statsContainer}>
                    <View style={styles.closingWrapper}>
                        <View style={styles.closingInner}>
                            <Text style={styles.closingLabel}>Closing Balance</Text>
                            <Text style={styles.closingValue}>{formatCurrency(ledgerData.closing_balance)}</Text>
                        </View>
                    </View>

                    {/* Small stat cards grid */}
                    <View style={styles.statsGrid}>
                        <View style={styles.smallCard}>
                            <Text style={styles.smallLabel}>Opening Balance</Text>
                            <Text style={styles.smallValue}>{formatCurrency(ledgerData.opening_balance)}</Text>
                        </View>
                        <View style={styles.smallCard}>
                            <Text style={styles.smallLabel}>Total Debits</Text>
                            <Text style={[styles.smallValue, { color: DESIGN.colors.error }]}>{formatCurrency(ledgerData.total_debits)}</Text>
                        </View>
                        <View style={styles.smallCard}>
                            <Text style={styles.smallLabel}>Total Credits</Text>
                            <Text style={[styles.smallValue, { color: DESIGN.colors.success }]}>{formatCurrency(ledgerData.total_credits)}</Text>
                        </View>
                        <View style={styles.smallCard}>
                            <Text style={styles.smallLabel}>Credit Limit</Text>
                            <Text style={styles.smallValue}>{formatCurrency(ledgerData.credit_limit)}</Text>
                        </View>
                        <View style={styles.smallCard}>
                            <Text style={styles.smallLabel}>Credit Used</Text>
                            <Text style={styles.smallValue}>{formatCurrency(ledgerData.credit_used)}</Text>
                        </View>
                        <View style={styles.smallCard}>
                            <Text style={styles.smallLabel}>Credit Available</Text>
                            <Text style={styles.smallValue}>{formatCurrency(ledgerData.credit_available)}</Text>
                        </View>
                    </View>

                    {/* Credit Utilization Section */}
                    <View style={styles.summaryCard}>
                        <View style={styles.utilRow}>
                            <Text style={styles.utilLabel}>Credit Utilization</Text>
                            <Text style={[
                                styles.utilPercent,
                                { color: (ledgerData.credit_utilization_percentage || 0) > 100 ? DESIGN.colors.error : DESIGN.colors.success }
                            ]}>
                                {ledgerData.credit_utilization_percentage || 0}%
                            </Text>
                        </View>
                        <View style={styles.utilBarBackground}>
                            <View
                                style={[
                                    styles.utilBarFill,
                                    {
                                        width: `${Math.min(100, Number(ledgerData.credit_utilization_percentage || 0))}%`,
                                        backgroundColor: (ledgerData.credit_utilization_percentage || 0) > 100 ? DESIGN.colors.error : DESIGN.colors.success
                                    }
                                ]}
                            />
                        </View>
                    </View>
                </View>



                {/* Transaction History Section with FlatList */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Transaction History</Text>
                </View>

                <FlatList
                    data={ledgerData.entries.slice().reverse()}
                    renderItem={renderTransactionItem}
                    keyExtractor={keyExtractor}
                    ListEmptyComponent={renderEmptyTransactions}
                    scrollEnabled={false} // Disable internal scrolling since it's inside ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.flatListContent}
                    initialNumToRender={10}
                    maxToRenderPerBatch={5}
                    windowSize={5}
                    removeClippedSubviews={true}
                    updateCellsBatchingPeriod={50}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFF',
        marginHorizontal: DESIGN.spacing.xs,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    loadingText: {
        marginTop: 10,
        color: DESIGN.colors.textSecondary,
        fontSize: 16,
    },
    errorText: {
        fontSize: 16,
        color: DESIGN.colors.textSecondary,
        marginTop: 12,
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: DESIGN.colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: DESIGN.borderRadius.md,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },

    // Dealer Card Styles
    dealerCard: {

        margin: DESIGN.spacing.md,



    },
    dealerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: DESIGN.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: DESIGN.spacing.md,
    },
    dealerInfo: {
        flex: 1,
    },
    dealerName: {
        fontSize: 18,
        fontWeight: '600',
        color: DESIGN.colors.textPrimary,
        marginBottom: 4,
    },
    dealerCompany: {
        fontSize: 14,
        color: DESIGN.colors.textSecondary,
        marginBottom: 4,
    },

    // Stats Container
    statsContainer: {
        marginHorizontal: DESIGN.spacing.md,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        padding: DESIGN.spacing.sm,
        borderRadius: DESIGN.borderRadius.md,
        alignItems: 'center',
        ...DESIGN.shadows.subtle,
        backgroundColor: '#FFFF',
    },

    closingCard: {
        marginBottom: DESIGN.spacing.md,
    },
    halfWidth: {
        flex: 1,
        marginHorizontal: 6,
    },

    statNumber: {
        fontSize: 16,
        fontWeight: '700',
        marginVertical: 8,
        textAlign: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: DESIGN.colors.textSecondary,
        fontWeight: '500',
        textAlign: 'center',
    },

    // Section Header
    sectionHeader: {
        marginHorizontal: DESIGN.spacing.md,
        marginTop: DESIGN.spacing.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: DESIGN.colors.textPrimary,
        marginBottom: 4,
    },

    // FlatList Styles
    flatListContent: {
        marginHorizontal: DESIGN.spacing.md,
    },

    /* Compact list entry matching attached design */
    compactEntry: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: DESIGN.spacing.sm,
        paddingVertical: DESIGN.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: DESIGN.colors.border, // use a subtle border color
    },

    compactLeft: {
        flex: 1,
    },
    compactDate: {
        fontSize: 12,
        color: DESIGN.colors.textTertiary,
        marginBottom: 4,

    },
    compactTitle: {
        fontSize: 14,
        color: DESIGN.colors.textPrimary,
        fontWeight: '600',
    },
    compactSubtitle: {
        fontSize: 12,
        color: DESIGN.colors.textSecondary,
    },
    compactRight: {
        alignItems: 'flex-end',
        minWidth: 110,
    },
    compactAmount: {
        fontSize: 16,
        fontWeight: '700',
    },
    compactDelta: {
        fontSize: 12,
        color: DESIGN.colors.textTertiary,
        marginTop: 4,
    },

    // Empty State
    emptyState: {
        flex: 1,
        padding: DESIGN.spacing.xl,
        alignItems: 'center',

    },
    emptyText: {
        fontSize: 16,
        color: DESIGN.colors.textSecondary,
        marginTop: 12,
    },

    // Entry Card Styles
    entryCard: {
        backgroundColor: DESIGN.colors.surface,
        borderRadius: DESIGN.borderRadius.lg,
        padding: DESIGN.spacing.md,
        marginBottom: DESIGN.spacing.md,
        ...DESIGN.shadows.medium,
    },
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: DESIGN.spacing.sm,
        paddingBottom: DESIGN.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: DESIGN.colors.border,
    },
    entryLeft: {
        flex: 1,
    },
    entryNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: DESIGN.colors.textPrimary,
        marginBottom: 2,
    },
    voucherNumber: {
        fontSize: 12,
        color: DESIGN.colors.info,
        fontWeight: '500',
    },
    transactionDate: {
        fontSize: 12,
        color: DESIGN.colors.textTertiary,
        fontWeight: '500',
    },
    entryDetails: {
        gap: 8,
    },
    entryType: {
        fontSize: 15,
        fontWeight: '700',
        color: DESIGN.colors.primary,
    },
    description: {
        fontSize: 14,
        color: DESIGN.colors.textPrimary,
        lineHeight: 20,
    },
    amountsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 8,
    },
    amountItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    amountLabel: {
        fontSize: 12,
        color: DESIGN.colors.textSecondary,
        fontWeight: '500',
    },
    debitAmount: {
        fontSize: 14,
        fontWeight: '600',
        color: DESIGN.colors.error,
    },
    creditAmount: {
        fontSize: 14,
        fontWeight: '600',
        color: DESIGN.colors.success,
    },
    balanceAmount: {
        fontSize: 14,
        fontWeight: '600',
    },
    positiveAmount: {
        color: DESIGN.colors.success,
    },
    negativeAmount: {
        color: DESIGN.colors.error,
    },
    entryFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: DESIGN.colors.border,
    },
    footerLeft: {
        flex: 1,
    },
    accountType: {
        fontSize: 12,
        color: DESIGN.colors.textSecondary,
        fontWeight: '500',
        marginBottom: 2,
    },
    createdBy: {
        fontSize: 11,
        color: DESIGN.colors.textTertiary,
    },
    reconciledBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: DESIGN.colors.success,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: DESIGN.borderRadius.md,
        gap: 4,
    },
    reconciledText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: '600',
    },
    /* New stats styles */
    closingWrapper: {
        marginBottom: DESIGN.spacing.md,

    },
    closingInner: {
        backgroundColor: DESIGN.colors.surface,
        padding: DESIGN.spacing.md,
        borderRadius: DESIGN.borderRadius.lg,
        borderWidth: 1,
        borderColor: DESIGN.colors.textTertiary
    },
    closingLabel: {
        color: DESIGN.colors.textSecondary,
        fontSize: 13,
        marginBottom: 6,
    },
    closingValue: {
        fontSize: 28,
        fontWeight: '700',
        color: DESIGN.colors.textPrimary,
    },
    closingSubtitle: {
        color: DESIGN.colors.textTertiary,
        fontSize: 12,
        marginTop: 6,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: DESIGN.spacing.sm,
        justifyContent: 'space-between',
    },
    smallCard: {
        width: '48%',
        backgroundColor: DESIGN.colors.surface,
        padding: DESIGN.spacing.sm,
        borderRadius: DESIGN.borderRadius.md,
        marginBottom: DESIGN.spacing.sm,
        paddingLeft: DESIGN.spacing.md,
        ...DESIGN.shadows.subtle,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: DESIGN.colors.textTertiary
    },
    smallValue: {
        fontSize: 16,
        fontWeight: '700',
        color: DESIGN.colors.textPrimary,
    },
    smallLabel: {
        fontSize: 12,
        color: DESIGN.colors.textSecondary,
        marginTop: 6,
    },
    utilRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: DESIGN.spacing.md,
        marginTop: DESIGN.spacing.sm,
    },
    utilLabel: {
        fontSize: 12,
        color: DESIGN.colors.textSecondary,
    },
    utilPercent: {
        fontSize: 12,
        color: DESIGN.colors.textTertiary,
        fontWeight: '700',
    },
    utilBarBackground: {
        height: 8,
        backgroundColor: DESIGN.colors.surfaceElevated,
        borderRadius: 8,
        marginHorizontal: DESIGN.spacing.md,
        marginTop: 8,
        overflow: 'hidden',
    },
    utilBarFill: {
        height: '100%',
        backgroundColor: DESIGN.colors.primary,
    },
});

export default DealerLedger;