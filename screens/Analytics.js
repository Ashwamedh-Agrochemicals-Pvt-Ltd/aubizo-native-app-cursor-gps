import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DESIGN from '../src/theme';
import apiClient from '../src/api/client';

const { width: screenWidth } = Dimensions.get('window');

const AnalyticsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch analytics data on component mount
  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard data from the same API as frontend
      const response = await apiClient.get('/core/api/dashboard/');

      if (response.data) {
        setAnalyticsData(response.data);
      } else {
        throw new Error('No data received from dashboard API');
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);

      // Fallback to mock data if API fails
      setAnalyticsData({
        company_name: 'Aubizo',
        user_role: 'Admin',
        orders_today: 0,
        sales_today: 0,
        payment_count_today: 0,
        collection_today: 0,
        active_dealers: 0,
        active_farmers: 2,
        active_employees: 2,
        total_active_products: 1,
        pending_dispatches: 0,
        pending_payments: 0,
        pending_stock_alerts: 0,
        pending_order_approvals: 1,
        employees_orders_today: [],
        employees_payments_today: [],
        employees_dealer_visits: [],
        employees_farmer_visits: []
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalyticsData();
  };

  // Compact StatCard for mobile
  const CompactStatCard = ({ title, value, icon, color, subtitle }) => (
    <View style={styles.compactStatCard}>
      <View style={styles.compactStatHeader}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
        <Text style={styles.compactStatTitle}>{title}</Text>
      </View>
      <Text style={styles.compactStatValue}>{value}</Text>
      {subtitle && <Text style={styles.compactStatSubtitle}>{subtitle}</Text>}
    </View>
  );

  // Mini StatCard for grid layout
  const MiniStatCard = ({ title, value, icon, color }) => (
    <View style={styles.miniStatCard}>
      <MaterialCommunityIcons name={icon} size={18} color={color} />
      <Text style={styles.miniStatValue}>{value}</Text>
      <Text style={styles.miniStatTitle}>{title}</Text>
    </View>
  );

  // Helper function to combine employee data from different sources
  const combineEmployeeData = () => {
    if (!analyticsData) return [];

    const employeeMap = new Map();

    // Add orders data
    analyticsData.employees_orders_today?.forEach(emp => {
      if (!employeeMap.has(emp.name)) {
        employeeMap.set(emp.name, { name: emp.name });
      }
      const existing = employeeMap.get(emp.name);
      existing.orders = { count: emp.order_count || 0, value: emp.total_value || 0 };
    });

    // Add payments data
    analyticsData.employees_payments_today?.forEach(emp => {
      if (!employeeMap.has(emp.name)) {
        employeeMap.set(emp.name, { name: emp.name });
      }
      const existing = employeeMap.get(emp.name);
      existing.payments = { count: emp.payment_count || 0, amount: emp.total_amount || 0 };
    });

    // Add dealer visits data
    analyticsData.employees_dealer_visits?.forEach(emp => {
      if (!employeeMap.has(emp.name)) {
        employeeMap.set(emp.name, { name: emp.name });
      }
      const existing = employeeMap.get(emp.name);
      existing.dealerVisits = emp.visit_count || 0;
    });

    // Add farmer visits data
    analyticsData.employees_farmer_visits?.forEach(emp => {
      if (!employeeMap.has(emp.name)) {
        employeeMap.set(emp.name, { name: emp.name });
      }
      const existing = employeeMap.get(emp.name);
      existing.farmerVisits = emp.visit_count || 0;
    });

    return Array.from(employeeMap.values());
  };

  // Filter employees based on search query
  const getFilteredEmployees = () => {
    const employees = combineEmployeeData();
    if (!searchQuery.trim()) return employees;

    return employees.filter(employee =>
      employee.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };


  // Simplified Employee Performance Card Component
  const CombinedEmployeeCard = ({ employee }) => {
    const totalVisits = (employee.dealerVisits || 0) + (employee.farmerVisits || 0);
    const hasOrders = employee.orders && employee.orders.count > 0;
    const hasPayments = employee.payments && employee.payments.count > 0;
    const hasVisits = totalVisits > 0;

    return (
      <View style={styles.simplifiedEmployeeCard}>
        {/* Employee Header */}
        <View style={styles.simpleEmployeeHeader}>
          <View style={styles.simpleEmployeeAvatar}>
            <Text style={styles.simpleEmployeeAvatarText}>
              {employee.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.simpleEmployeeInfo}>
            <Text style={styles.simpleEmployeeName}>{employee.name}</Text>
            <Text style={styles.simpleEmployeeRole}>Field Agent</Text>
          </View>
        </View>

        {/* Performance Summary */}
        <View style={styles.performanceSummary}>
          {/* Orders Section */}
          {hasOrders && (
            <View style={styles.simpleMetricRow}>
              <View style={styles.metricIconWrapper}>
                <MaterialCommunityIcons
                  name="cart-outline"
                  size={18}
                  color={DESIGN.colors.primary}
                />
              </View>
              <Text style={styles.simpleMetricLabel}>Orders</Text>
              <View style={styles.simpleMetricValues}>
                <Text style={styles.simpleMetricCount}>{employee.orders.count}</Text>
                <Text style={styles.simpleMetricAmount}>
                  ₹{Number(employee.orders.value || 0).toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          )}

          {/* Payments Section */}
          {hasPayments && (
            <View style={styles.simpleMetricRow}>
              <View style={styles.metricIconWrapper}>
                <MaterialCommunityIcons
                  name="cash-multiple"
                  size={18}
                  color={DESIGN.colors.success}
                />
              </View>
              <Text style={styles.simpleMetricLabel}>Payments</Text>
              <View style={styles.simpleMetricValues}>
                <Text style={styles.simpleMetricCount}>{employee.payments.count}</Text>
                <Text style={styles.simpleMetricAmount}>
                  ₹{Number(employee.payments.amount || 0).toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          )}

          {/* Visits Section */}
          {hasVisits && (
            <View style={styles.simpleMetricRow}>
              <View style={styles.metricIconWrapper}>
                <MaterialCommunityIcons
                  name="map-marker-radius"
                  size={18}
                  color={DESIGN.colors.info}
                />
              </View>
              <Text style={styles.simpleMetricLabel}>Visits</Text>
              <View style={styles.simpleMetricValues}>
                <View style={styles.visitDetailRow}>
                  {employee.dealerVisits > 0 && (
                    <Text style={styles.visitDetailText}>
                      Dealers: {employee.dealerVisits}
                    </Text>
                  )}
                  {employee.farmerVisits > 0 && (
                    <Text style={styles.visitDetailText}>
                      Farmers: {employee.farmerVisits}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* No Activity Message */}
          {!hasOrders && !hasPayments && !hasVisits && (
            <View style={styles.noActivityContainer}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={20}
                color={DESIGN.colors.textTertiary}
              />
              <Text style={styles.noActivityText}>No activity today</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const tabs = [
    { id: 'overview', title: 'Overview', icon: 'chart-line' },
    { id: 'performance', title: 'Performance', icon: 'chart-bar' },
    { id: 'pending', title: 'Pending', icon: 'clock-outline' },
  ];

  const renderTabContent = () => {
    if (!analyticsData) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.tabContent}>
            {/* Key Metrics - 2x2 Grid */}
            <View style={styles.metricsGrid}>
              <MiniStatCard
                title="Orders Today"
                value={analyticsData.orders_today || 0}
                icon="cart"
                color={DESIGN.colors.primary}
              />
              <MiniStatCard
                title="Sales Today"
                value={`₹${(analyticsData.sales_today || 0).toLocaleString('en-IN')}`}
                icon="currency-inr"
                color={DESIGN.colors.success}
              />
              <MiniStatCard
                title="Payments"
                value={analyticsData.payment_count_today || 0}
                icon="cash"
                color={DESIGN.colors.warning}
              />
              <MiniStatCard
                title="Collections"
                value={`₹${(analyticsData.collection_today || 0).toLocaleString('en-IN')}`}
                icon="wallet"
                color={DESIGN.colors.info}
              />
            </View>

            {/* Business Overview */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Business Overview</Text>
              <View style={styles.businessGrid}>
                <CompactStatCard
                  title="Active Dealers"
                  value={analyticsData.active_dealers || 0}
                  icon="store"
                  color={DESIGN.colors.success}
                />
                <CompactStatCard
                  title="Active Farmers"
                  value={analyticsData.active_farmers || 0}
                  icon="account-group"
                  color={DESIGN.colors.info}
                />
                <CompactStatCard
                  title="Active Employees"
                  value={analyticsData.active_employees || 0}
                  icon="account-tie"
                  color={DESIGN.colors.primary}
                />
                <CompactStatCard
                  title="Active Products"
                  value={analyticsData.total_active_products || 0}
                  icon="package-variant"
                  color={DESIGN.colors.warning}
                />
              </View>
            </View>
          </View>
        );

      case 'performance':
        const filteredEmployees = getFilteredEmployees();

        return (
          <View style={styles.tabContent}>
            {/* Search Section */}
            <View style={styles.searchSection}>
              <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                  <MaterialCommunityIcons
                    name="magnify"
                    size={20}
                    color={DESIGN.colors.textSecondary}
                    style={styles.searchIcon}
                  />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search employees..."
                    placeholderTextColor={DESIGN.colors.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity
                      style={styles.clearSearchButton}
                      onPress={() => setSearchQuery('')}
                    >
                      <MaterialCommunityIcons
                        name="close"
                        size={18}
                        color={DESIGN.colors.textSecondary}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            {/* Employee Performance Cards */}
            <View style={styles.section}>
              {filteredEmployees.length > 0 ? (
                <>
                  {filteredEmployees.map((employee, index) => (
                    <CombinedEmployeeCard key={`${employee.name}-${index}`} employee={employee} />
                  ))}
                </>
              ) : searchQuery.length > 0 ? (
                <View style={styles.noResultsContainer}>
                  <MaterialCommunityIcons
                    name="account-search"
                    size={48}
                    color={DESIGN.colors.textTertiary}
                  />
                  <Text style={styles.noResultsTitle}>No employees found</Text>
                  <Text style={styles.noResultsMessage}>
                    Try searching with a different name
                  </Text>
                </View>
              ) : (
                <View style={styles.noResultsContainer}>
                  <MaterialCommunityIcons
                    name="account-group"
                    size={48}
                    color={DESIGN.colors.textTertiary}
                  />
                  <Text style={styles.noResultsTitle}>No performance data</Text>
                  <Text style={styles.noResultsMessage}>
                    Employee performance data will appear here
                  </Text>
                </View>
              )}
            </View>
          </View>
        );

      case 'pending':
        return (
          <View style={styles.tabContent}>
            {/* Pending Operations */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pending Operations</Text>
              <View style={styles.pendingGrid}>
                <CompactStatCard
                  title="Pending Dispatches"
                  value={analyticsData.pending_dispatches || 0}
                  icon="truck-delivery"
                  color={DESIGN.colors.warning}
                />
                <CompactStatCard
                  title="Pending Payments"
                  value={analyticsData.pending_payments || 0}
                  icon="cash-clock"
                  color={DESIGN.colors.error}
                />
                <CompactStatCard
                  title="Stock Alerts"
                  value={analyticsData.pending_stock_alerts || 0}
                  icon="alert-circle"
                  color={DESIGN.colors.warning}
                />
                <CompactStatCard
                  title="Order Approvals"
                  value={analyticsData.pending_order_approvals || 0}
                  icon="check-circle"
                  color={DESIGN.colors.info}
                />
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Enhanced Header */}
      <View style={styles.enhancedHeader}>
        {/* Header Background Gradient */}
        <View style={styles.headerGradientOverlay} />

        <View style={styles.headerContent}>
          {/* Back Navigation */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.backButtonInner}>
              <MaterialCommunityIcons
                name="chevron-left"
                size={24}
                color={DESIGN.colors.surface}
              />
            </View>
          </TouchableOpacity>

          {/* Header Title */}
          <View style={styles.headerTitleContainer}>
            <Text style={styles.enhancedHeaderTitle}>Analytics</Text>
            <Text style={styles.headerSubtitle}>Business Insights</Text>
          </View>

          {/* Header Actions */}
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={onRefresh}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="refresh"
                size={20}
                color={DESIGN.colors.surface}
              />
            </TouchableOpacity>

          </View>
        </View>
      </View>

      {/* Enhanced Tab Navigation - Fixed Position */}
      <View style={styles.enhancedTabContainer}>
        <View style={styles.tabScrollWrapper}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.enhancedTab,
                activeTab === tab.id && styles.enhancedActiveTab
              ]}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.tabIconContainer,
                activeTab === tab.id && styles.activeTabIconContainer
              ]}>
                <MaterialCommunityIcons
                  name={tab.icon}
                  size={20}
                  color={activeTab === tab.id ? DESIGN.colors.primary : DESIGN.colors.textSecondary}
                />
              </View>
              <Text style={[
                styles.enhancedTabText,
                activeTab === tab.id && styles.enhancedActiveTabText
              ]}>
                {tab.title}
              </Text>
              {activeTab === tab.id && (
                <View style={styles.activeTabIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content Container - Flex grows to fill remaining space */}
      <View style={styles.contentContainer}>
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[DESIGN.colors.primary]}
              tintColor={DESIGN.colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={DESIGN.colors.primary} />
              <Text style={styles.loadingText}>Loading analytics data...</Text>
            </View>
          ) : analyticsData ? (
            renderTabContent()
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="chart-line"
                size={64}
                color={DESIGN.colors.textTertiary}
              />
              <Text style={styles.emptyTitle}>No Analytics Data</Text>
              <Text style={styles.emptyMessage}>
                Unable to load analytics data. Please try again.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN.colors.background,
  },

  // Enhanced Header Styles
  enhancedHeader: {
    backgroundColor: DESIGN.colors.primary,
    position: 'relative',
    paddingBottom: DESIGN.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },

  headerGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DESIGN.spacing.md,
    paddingVertical: DESIGN.spacing.sm,
  },

  backButton: {
    marginRight: DESIGN.spacing.md,
  },

  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitleContainer: {
    flex: 1,
  },

  enhancedHeaderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: DESIGN.colors.surface,
    letterSpacing: -0.5,
  },

  headerSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN.spacing.sm,
  },

  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Enhanced Tab Navigation Styles
  enhancedTabContainer: {
    backgroundColor: DESIGN.colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
    position: 'relative',
  },

  tabScrollWrapper: {
    flexDirection: 'row',
    paddingHorizontal: DESIGN.spacing.xs,
  },

  enhancedTab: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    paddingVertical: DESIGN.spacing.md,
    paddingHorizontal: DESIGN.spacing.sm,
    marginHorizontal: DESIGN.spacing.xs,
    borderRadius: DESIGN.borderRadius.sm,
  },

  enhancedActiveTab: {
    backgroundColor: 'rgba(46, 125, 50, 0.08)',
  },

  tabIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(102, 102, 102, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DESIGN.spacing.xs,
  },

  activeTabIconContainer: {
    backgroundColor: 'rgba(46, 125, 50, 0.15)',
  },

  enhancedTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: DESIGN.colors.textSecondary,
    textAlign: 'center',
  },

  enhancedActiveTabText: {
    color: DESIGN.colors.primary,
    fontWeight: '600',
  },

  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 3,
    backgroundColor: DESIGN.colors.primary,
    borderRadius: 2,
  },

  // Legacy Styles (keeping for compatibility)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DESIGN.spacing.md,
    paddingVertical: DESIGN.spacing.sm,
    backgroundColor: DESIGN.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN.colors.border,
  },
  headerTitle: {
    ...DESIGN.typography.title,
    color: DESIGN.colors.textPrimary,
    fontWeight: '600',
  },
  headerRight: {
    width: 40, // Same width as hamburger button for balance
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: DESIGN.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN.colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DESIGN.spacing.sm,
    paddingHorizontal: DESIGN.spacing.xs,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: DESIGN.colors.primary,
  },
  tabText: {
    ...DESIGN.typography.caption,
    color: DESIGN.colors.textSecondary,
    marginLeft: DESIGN.spacing.xs,
    fontWeight: '500',
  },
  activeTabText: {
    color: DESIGN.colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },

  // New Content Container Styles
  contentContainer: {
    flex: 1,
    backgroundColor: DESIGN.colors.background,
  },

  scrollContent: {
    flex: 1,
  },

  scrollContentContainer: {
    flexGrow: 1,
  },

  tabContent: {
    padding: DESIGN.spacing.md,
    minHeight: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: DESIGN.spacing.xxxl,
  },
  loadingText: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textSecondary,
    marginTop: DESIGN.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: DESIGN.spacing.xxxl,
    paddingHorizontal: DESIGN.spacing.lg,
  },
  emptyTitle: {
    ...DESIGN.typography.title,
    color: DESIGN.colors.textPrimary,
    marginTop: DESIGN.spacing.lg,
    textAlign: 'center',
  },
  emptyMessage: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textSecondary,
    marginTop: DESIGN.spacing.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginVertical: DESIGN.spacing.md,
  },
  sectionTitle: {
    ...DESIGN.typography.subtitle,
    color: DESIGN.colors.textPrimary,
    fontWeight: '600',
    marginBottom: DESIGN.spacing.md,
  },
  // Mini Stat Cards (2x2 Grid)
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: DESIGN.spacing.lg,
  },
  miniStatCard: {
    width: (screenWidth - DESIGN.spacing.md * 3) / 2,
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.borderRadius.md,
    padding: DESIGN.spacing.md,
    alignItems: 'center',
    marginBottom: DESIGN.spacing.sm,
    ...DESIGN.shadows.subtle,
  },
  miniStatValue: {
    ...DESIGN.typography.title,
    color: DESIGN.colors.textPrimary,
    fontWeight: '700',
    marginTop: DESIGN.spacing.xs,
  },
  miniStatTitle: {
    ...DESIGN.typography.caption,
    color: DESIGN.colors.textSecondary,
    textAlign: 'center',
    marginTop: DESIGN.spacing.xs / 2,
  },
  // Business Grid (2x2)
  businessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  compactStatCard: {
    width: (screenWidth - DESIGN.spacing.md * 3) / 2,
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.borderRadius.md,
    padding: DESIGN.spacing.md,
    marginBottom: DESIGN.spacing.sm,
    ...DESIGN.shadows.subtle,
  },
  compactStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DESIGN.spacing.xs,
  },
  compactStatTitle: {
    ...DESIGN.typography.caption,
    color: DESIGN.colors.textSecondary,
    marginLeft: DESIGN.spacing.xs,
    flex: 1,
  },
  compactStatValue: {
    ...DESIGN.typography.subtitle,
    color: DESIGN.colors.textPrimary,
    fontWeight: '600',
  },
  compactStatSubtitle: {
    ...DESIGN.typography.caption,
    color: DESIGN.colors.textTertiary,
    marginTop: DESIGN.spacing.xs / 2,
  },
  // Pending Grid (2x2)
  pendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  // Performance Section
  performanceSection: {
    marginBottom: DESIGN.spacing.lg,
  },
  performanceSubtitle: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textSecondary,
    fontWeight: '500',
    marginBottom: DESIGN.spacing.sm,
  },
  employeeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.borderRadius.sm,
    padding: DESIGN.spacing.md,
    marginBottom: DESIGN.spacing.xs,
    ...DESIGN.shadows.subtle,
  },
  employeeName: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textPrimary,
    fontWeight: '500',
  },
  employeeDetail: {
    ...DESIGN.typography.caption,
    color: DESIGN.colors.textSecondary,
    marginTop: DESIGN.spacing.xs / 2,
  },
  employeeValue: {
    alignItems: 'flex-end',
  },
  employeeAmount: {
    ...DESIGN.typography.subtitle,
    fontWeight: '600',
  },

  // Search Styles
  searchSection: {
    marginBottom: DESIGN.spacing.sm,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.borderRadius.sm,
    paddingHorizontal: DESIGN.spacing.md,
    paddingVertical: DESIGN.spacing.sm,
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
    ...DESIGN.shadows.subtle,
  },
  searchIcon: {
    marginRight: DESIGN.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: DESIGN.colors.textPrimary,
    paddingVertical: DESIGN.spacing.xs,
  },
  clearSearchButton: {
    padding: DESIGN.spacing.xs,
    marginLeft: DESIGN.spacing.sm,
  },
  resultsHeader: {
    marginBottom: DESIGN.spacing.md,
  },
  resultsCount: {
    fontSize: 14,
    color: DESIGN.colors.textSecondary,
    fontWeight: '500',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: DESIGN.spacing.xxxl,
    paddingHorizontal: DESIGN.spacing.lg,
  },
  noResultsTitle: {
    ...DESIGN.typography.subtitle,
    color: DESIGN.colors.textPrimary,
    fontWeight: '600',
    marginTop: DESIGN.spacing.md,
    textAlign: 'center',
  },
  noResultsMessage: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textSecondary,
    marginTop: DESIGN.spacing.sm,
    textAlign: 'center',
  },

  // Combined Employee Card Styles
  combinedEmployeeCard: {
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.borderRadius.lg,
    // padding: DESIGN.spacing.,
    marginBottom: DESIGN.spacing.md,
    ...DESIGN.shadows.subtle,
    borderWidth: 1,
    borderColor: DESIGN.colors.borderLight,
  },
  employeeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DESIGN.spacing.md,
  },
  employeeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: DESIGN.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DESIGN.spacing.md,
  },
  employeeAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: DESIGN.colors.surface,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeRole: {
    fontSize: 12,
    color: DESIGN.colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  employeeMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: (screenWidth - DESIGN.spacing.md * 4 - DESIGN.spacing.lg * 2) / 2,
    backgroundColor: DESIGN.colors.background,
    borderRadius: DESIGN.borderRadius.md,
    padding: DESIGN.spacing.md,
    marginBottom: DESIGN.spacing.sm,
    borderWidth: 1,
    borderColor: DESIGN.colors.borderLight,
  },
  metricIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DESIGN.spacing.xs,
  },
  metricLabel: {
    fontSize: 11,
    color: DESIGN.colors.textSecondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  metricAmount: {
    fontSize: 12,
    color: DESIGN.colors.textSecondary,
    fontWeight: '500',
  },
  visitBreakdown: {
    flexDirection: 'row',
    gap: DESIGN.spacing.xs,
  },
  visitBreakdownText: {
    fontSize: 10,
    color: DESIGN.colors.textTertiary,
    fontWeight: '500',
    backgroundColor: DESIGN.colors.borderLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  // Simplified Employee Card Styles
  simplifiedEmployeeCard: {
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.borderRadius.md,
    padding: DESIGN.spacing.md,
    marginBottom: DESIGN.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: DESIGN.colors.borderLight,
  },

  simpleEmployeeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DESIGN.spacing.sm,
  },

  simpleEmployeeAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DESIGN.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DESIGN.spacing.md,
  },

  simpleEmployeeAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: DESIGN.colors.surface,
  },

  simpleEmployeeInfo: {
    flex: 1,
  },

  simpleEmployeeName: {
    fontSize: 18,
    fontWeight: '600',
    color: DESIGN.colors.textPrimary,
    marginBottom: 2,
  },

  simpleEmployeeRole: {
    fontSize: 13,
    color: DESIGN.colors.textSecondary,
    fontWeight: '500',
  },

  performanceIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  performanceStatus: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  performanceSummary: {
    gap: DESIGN.spacing.sm,
  },

  simpleMetricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: DESIGN.spacing.sm,
    paddingHorizontal: DESIGN.spacing.md,
    backgroundColor: DESIGN.colors.background,
    borderRadius: DESIGN.borderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: DESIGN.colors.primary,
  },

  metricIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: DESIGN.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DESIGN.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },

  simpleMetricLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: DESIGN.colors.textPrimary,
  },

  simpleMetricValues: {
    alignItems: 'flex-end',
  },

  simpleMetricCount: {
    fontSize: 18,
    fontWeight: '700',
    color: DESIGN.colors.textPrimary,
    marginBottom: 2,
  },

  simpleMetricAmount: {
    fontSize: 13,
    fontWeight: '500',
    color: DESIGN.colors.textSecondary,
  },

  visitDetailRow: {
    alignItems: 'flex-end',
    gap: 4,
  },

  visitDetailText: {
    fontSize: 11,
    color: DESIGN.colors.textTertiary,
    fontWeight: '500',
  },

  noActivityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DESIGN.spacing.lg,
    gap: DESIGN.spacing.sm,
  },

  noActivityText: {
    fontSize: 14,
    color: DESIGN.colors.textTertiary,
    fontWeight: '500',
  },
});

export default AnalyticsScreen;