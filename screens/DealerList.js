import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DESIGN from '../src/theme';
import { navigation } from '../navigation/NavigationService';
import apiClient from '../src/api/client';

// Updated TABS to include Blacklisted
const TABS = ["All", "Registered", "Unregistered", "Blacklisted"];

const SearchBar = ({ searchQuery, setSearchQuery, onClose }) => {
    const inputRef = useRef(null);

    useEffect(() => {
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 100);
    }, []);
    return (
        <View style={styles.searchContainer}>
            <FontAwesome
                name="search"
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
                <FontAwesome
                    name="times-circle"
                    size={28}
                    color={DESIGN.colors.textPrimary}
                />
            </TouchableOpacity>
        </View>
    );
};

function DealerList(props) {
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchDealers(statusMap[TABS[activeTab]]);
        setRefreshing(false);
    };

    const [dealers, setDealers] = useState([]);

    const statusMap = {
        "All": "",
        "Registered": "registered",
        "Unregistered": "unregistered",
        "Blacklisted": "blacklisted"
    };

    // Business status configuration
    const businessStatusConfig = {
        "active": {
            label: "Active",
            icon: "check-circle",
            color: DESIGN.colors.success,
            bgColor: '#E8F5E9'
        },
        "credit_hold": {
            label: "Credit Hold",
            icon: "pause-circle",
            color: DESIGN.colors.warning,
            bgColor: '#FFF3E0'
        },
        "under_scrutiny": {
            label: "Under Scrutiny",
            icon: "visibility",
            color: DESIGN.colors.info,
            bgColor: '#E3F2FD'
        },
        "notice_issued": {
            label: "Notice Issued",
            icon: "warning",
            color: DESIGN.colors.warning,
            bgColor: '#FFF3E0'
        },
        "court_case": {
            label: "Court Case",
            icon: "gavel",
            color: DESIGN.colors.error,
            bgColor: '#FFEBEE'
        },
        "blacklisted": {
            label: "Blacklisted",
            icon: "block",
            color: DESIGN.colors.error,
            bgColor: '#FFEBEE'
        }
    };

    const fetchDealers = async (registration_status = "") => {
        setLoading(true);
        try {
            // For blacklisted tab, use the flagged-dealers endpoint
            if (registration_status === "blacklisted") {
                const response = await apiClient.get("dealer/flagged-dealers/");
                // Filter only blacklisted dealers
                const blacklistedData = response.data.filter(dealer =>
                    dealer.business_status === "blacklisted"
                );
                setDealers(blacklistedData);
            } else {
                // For other tabs, use the regular endpoint
                const response = await apiClient.get("dealer/individual/", { params: { status: registration_status } });

                console.log("Dealer list", response.data)

                // Filter by status if provided
                const data = registration_status ? response.data.filter(dealer => dealer.registration_status === registration_status) : [...response.data];
                setDealers(data);
            }
        } catch (error) {
            console.error("Error fetching dealers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (showSearch) {
            fetchDealers(searchQuery);
        } else {
            fetchDealers(statusMap[TABS[activeTab]]);
        }
    }, [activeTab, showSearch]);

    const handleOnPress = (dealer) => {
        navigation.navigate('DealerVerification', { dealer: dealer.id });
    }

    const query = searchQuery?.toLowerCase() || '';
    const dataToRender = showSearch
        ? dealers.filter(dealer =>
            (dealer?.shop_name?.toLowerCase() || dealer?.owner_name?.toLowerCase() || '').includes(query)
        )
        : dealers;

    // In your dealer list component where you have the "View Ledger" button
    const handleViewLedger = (dealer) => {
        navigation.navigate('DealerLedger', {
            dealer: {
                id: dealer.id,
                shop_name: dealer.shop_name,
                owner_name: dealer.owner_name
            }
        });
    };

    const renderBusinessStatusBadge = (dealer) => {
        const status = dealer.business_status;
        const config = businessStatusConfig[status];

        // Don't show any business status badges in the Blacklisted tab
        if (!config || TABS[activeTab] === "Blacklisted") return null;

        return (
            <View style={[styles.businessStatusBadge, { backgroundColor: config.bgColor }]}>
                <MaterialIcons name={config.icon} size={14} color={config.color} />
                <Text style={[styles.businessStatusText, { color: config.color }]}>
                    {config.label}
                </Text>
            </View>
        );
    };

    const renderDealerItem = (dealer) => (
        <View style={styles.card}>
            {/* Main Dealer Info - Touchable */}
            <TouchableOpacity
                style={styles.mainContent}
                onPress={() => handleOnPress(dealer)}
                activeOpacity={0.7}
            >

                {/* Show business status badge for all tabs except when dealer is active */}
                {renderBusinessStatusBadge(dealer)}

                {/* Left Section - Avatar and Info */}
                <View style={styles.leftSection}>
                    {/* Avatar */}
                    <View style={[
                        styles.avatar,
                    ]}>
                        <Ionicons name="person" size={24} color={DESIGN.colors.surface} />
                    </View>

                    {/* Dealer Info */}
                    <View style={styles.dealerInfo}>
                        <View style={styles.nameRow}>
                            <Text style={[
                                styles.dealerName,

                            ]}>
                                {dealer.shop_name}
                            </Text>
                        </View>

                        <Text style={[
                            styles.company,
                        ]}>
                            {dealer.owner_name}
                        </Text>

                        {/* Contact Details */}
                        <View style={styles.contactRow}>
                            <MaterialIcons name="phone" size={14} color={DESIGN.colors.textSecondary} />
                            <Text style={styles.contactText}>{dealer.phone}</Text>
                        </View>

                        {/* Registration Date or Status Date */}
                        <Text style={styles.registeredDate}>
                            {dealer.business_status && dealer.business_status !== "active" && dealer.business_status_date
                                ? `${businessStatusConfig[dealer.business_status]?.label || 'Status'}: ${new Date(dealer.business_status_date).toLocaleDateString()}`
                                : `Registered: ${dealer.registration_date || 'N/A'}`
                            }
                        </Text>
                    </View>
                </View>

                {/* Right Section - Arrow */}
                <Ionicons name="chevron-forward" size={20} color={DESIGN.colors.textTertiary} />
            </TouchableOpacity>

            {/* Bottom Section - Vertical Line, Note Icon and View Ledger - Separate Touchable */}
            <TouchableOpacity
                style={styles.ledgerSection}
                onPress={() => handleViewLedger(dealer)}
                activeOpacity={0.7}
            >
                <View style={styles.verticalLine} />
                <View style={styles.ledgerContainer}>
                    <MaterialIcons name="receipt-long" size={25} color={DESIGN.colors.textSecondary} />
                    <Text style={styles.ledgerText}>View Ledger</Text>
                </View>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ marginRight: 8 }}
                >
                    <Ionicons name="arrow-back" size={24} color={DESIGN.colors.textPrimary} />
                </TouchableOpacity>

                <Text style={styles.headerText}>Dealer List</Text>
                <TouchableOpacity onPress={() => {
                    if (showSearch) {
                        setShowSearch(false);
                    } else {
                        setShowSearch(true);
                    }
                }}>
                    <FontAwesome name="search" size={24} color="black" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
            </View>

            {showSearch ? (
                <SearchBar
                    onClose={() => setShowSearch(false)}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />
            ) : (

                <View style={styles.tabBar}>
                    {TABS.map((tab, index) => (
                        <TouchableOpacity key={index} style={styles.tab} activeOpacity={0.7} onPress={() => setActiveTab(index)}>
                            <Text style={[styles.tabText, {
                                color: activeTab === index ? DESIGN.colors.primary : DESIGN.colors.textSecondary,
                                fontWeight: activeTab === index ? 'bold' : 'normal',
                            }]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {loading ? (
                <ActivityIndicator size="large" color={DESIGN.colors.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={dataToRender}
                    renderItem={({ item }) => renderDealerItem(item)}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 16 }}
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
                        // Customize empty state depending on whether user is searching or which tab is active
                        const isSearch = showSearch && searchQuery.trim().length > 0;
                        if (isSearch) {
                            return (
                                <View style={{ padding: 24, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ color: DESIGN.colors.textSecondary, fontSize: 16 }}>No dealers found for "{searchQuery}"</Text>
                                </View>
                            );
                        }

                        // Not searching — show state based messages
                        const currentTab = TABS[activeTab];
                        let title = 'No dealers found';
                        let subtitle = 'There are no dealers to display.';

                        if (currentTab === 'Registered') {
                            title = 'No registered dealers';
                            subtitle = 'You have not registered any dealers yet.';
                        } else if (currentTab === 'Unregistered') {
                            title = 'No unregistered dealers';
                            subtitle = 'All dealers are registered.';
                        } else if (currentTab === 'Blacklisted') {
                            title = 'No blacklisted dealers';
                            subtitle = 'There are no blacklisted dealers.';
                        }

                        return (
                            <View style={{ flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 18, fontWeight: '600', color: DESIGN.colors.textPrimary }}>{title}</Text>
                                <Text style={{ marginTop: 8, color: DESIGN.colors.textSecondary, textAlign: 'center' }}>{subtitle}</Text>
                            </View>
                        );
                    }}

                />
            )}

        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: DESIGN.colors.background,

    },
    header: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,

    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    tabBar: {
        flexDirection: "row",
        justifyContent: "space-around",
        borderBottomWidth: 2,
        borderBottomColor: DESIGN.colors.border,
        paddingVertical: DESIGN.spacing.sm,


    },
    tab: {
        paddingVertical: 8,
    },
    tabText: {
        fontSize: 16,
    },
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
    card: {
        backgroundColor: DESIGN.colors.surface,
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    mainContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: DESIGN.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    blacklistedAvatar: {
        backgroundColor: DESIGN.colors.error,
    },
    dealerInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    dealerName: {
        fontSize: 16,
        fontWeight: '600',
        color: DESIGN.colors.textPrimary,
    },
    company: {
        fontSize: 14,
        color: DESIGN.colors.textSecondary,
        marginBottom: 4,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    contactText: {
        fontSize: 12,
        color: DESIGN.colors.textSecondary,
        marginLeft: 4,
    },
    registeredDate: {
        fontSize: 12,
        color: DESIGN.colors.textTertiary,
    },
    verifiedBadge: {
        position: 'absolute',
        top: 0,
        right: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: DESIGN.spacing.sm,
        paddingVertical: 3,
        borderRadius: DESIGN.borderRadius.md,
        gap: 4,
    },
    verifiedText: {
        fontSize: 12,
        color: DESIGN.colors.success,
        marginLeft: 4,
        fontWeight: '500',
    },
    businessStatusBadge: {
        position: 'absolute',
        bottom: 0,
        right: 10,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: DESIGN.spacing.sm,
        paddingVertical: 3,
        borderRadius: DESIGN.borderRadius.md,
        gap: 4,
    },
    businessStatusText: {
        fontSize: 12,
        marginLeft: 4,
        fontWeight: '500',
    },

    // Ledger Section Styles
    ledgerSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: DESIGN.colors.border,
    },
    verticalLine: {
        width: 2,
        height: 18,
        backgroundColor: DESIGN.colors.textPrimary,
        marginRight: 8,
        borderRadius: 1,
    },
    ledgerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    ledgerText: {
        fontSize: 16,
        color: DESIGN.colors.primary,
        fontWeight: '500',
    },

});

export default DealerList;