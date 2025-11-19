import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useAuth from '../auth/useAuth';
import { useModulePermission } from '../hooks/usePermissions';
import { MODULES } from '../auth/permissions';
import permissionManager from '../auth/permissions';
import DESIGN from '../theme';
import showToast from '../utility/showToast';
import apiClient from '../api/client';

const DrawerMenu = ({ navigation, onClose, username }) => {
  const insets = useSafeAreaInsets();
  const { user, logOut } = useAuth();
  const { canRead: canViewAnalytics } = useModulePermission(MODULES.CORE);
  const [userRole, setUserRole] = useState(null);
  const [comingSoonModal, setComingSoonModal] = useState({ visible: false, title: '' });

  // Fetch user role from dashboard API
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await apiClient.get('/core/api/dashboard/');
        if (response.data && response.data.user_role) {
          setUserRole(response.data.user_role);
        }
      } catch (error) {
        console.error('Failed to fetch user role:', error);
        // Default to non-admin if API fails
        setUserRole('User');
      }
    };

    fetchUserRole();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear permissions from memory before logout
              permissionManager.clearPermissions();
              await logOut();

            } catch (error) {
              showToast.error('Logout failed', 'Please try again');
            }
          },
        },
      ]
    );
  };

  const handleProfile = () => {
    setComingSoonModal({ visible: true, title: 'Profile' });
  };

  const handleDealerList = () => {
    onClose();
    navigation.navigate('DealerList');
  };

  const handleFarmerList = () => {
    onClose();
    navigation.navigate('FarmerList');
  };


  const handleAnalytics = () => {
    onClose();
    navigation.navigate('Analytics');
  };

  const handleHelp = () => {
    onClose();
    navigation.navigate("Hepl&Support")
  };

  const closeComingSoonModal = () => {
    setComingSoonModal({ visible: false, title: '' });
  };

  const menuItems = [
    {
      id: 'profile',
      title: 'Profile',
      icon: 'account-circle',
      onPress: handleProfile,
      show: true,
    },

    {
      id: 'dealer-list',
      title: 'My Dealer List',
      icon: 'account-group',
      onPress: handleDealerList,
      show: true,
    },

    {
      id: 'Farmer-list',
      title: 'My Farmer List',
      icon: 'leaf',
      onPress: handleFarmerList,
      show: true,
    },

    {
      id: 'help',
      title: 'Help & Support',
      icon: 'help-circle',
      onPress: handleHelp,
      show: true,
    },

    {
      id: 'analytics',
      title: 'Analytics',
      icon: 'chart-line',
      onPress: handleAnalytics,
      show: userRole === 'Admin', // Only show for Admin role
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons
              name="account"
              size={32}
              color={DESIGN.colors.primary}
            />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{username}</Text>
            <Text style={styles.userRole}>{userRole}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons
            name="close"
            size={24}
            color={DESIGN.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => {
          if (!item.show) return null;

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemContent}>
                <MaterialCommunityIcons
                  name={item.icon}
                  size={24}
                  color={DESIGN.colors.textPrimary}
                />
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={DESIGN.colors.textTertiary}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.appInfo}>
          <Text style={styles.appName}>Aubizo</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="logout"
            size={20}
            color={DESIGN.colors.surface}
          />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Coming Soon Modal */}
      <Modal
        visible={comingSoonModal.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeComingSoonModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.comingSoonModal}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={32}
                color={DESIGN.colors.primary}
              />
              <Text style={styles.modalTitle}>Coming Soon</Text>
            </View>

            <Text style={styles.modalMessage}>
              {comingSoonModal.title} feature is currently under development and will be available in a future update.
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={closeComingSoonModal}
              activeOpacity={0.8}
            >
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN.colors.surface,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DESIGN.spacing.lg,
    paddingVertical: DESIGN.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN.colors.border,
    backgroundColor: DESIGN.colors.background,
  },

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: DESIGN.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DESIGN.spacing.md,
  },

  userDetails: {
    flex: 1,
  },

  userName: {
    ...DESIGN.typography.subtitle,
    color: DESIGN.colors.textPrimary,
    marginBottom: 2,
  },

  userRole: {
    ...DESIGN.typography.caption,
    color: DESIGN.colors.textSecondary,
  },

  closeButton: {
    padding: DESIGN.spacing.xs,
  },

  menuContainer: {
    flex: 1,
    paddingTop: DESIGN.spacing.md,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DESIGN.spacing.lg,
    paddingVertical: DESIGN.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN.colors.border,
  },

  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  menuItemText: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textPrimary,
    marginLeft: DESIGN.spacing.md,
  },

  footer: {
    paddingHorizontal: DESIGN.spacing.lg,
    paddingVertical: DESIGN.spacing.md,
    borderTopWidth: 1,
    borderTopColor: DESIGN.colors.border,
    backgroundColor: DESIGN.colors.background,
  },

  appInfo: {
    alignItems: 'center',
    marginBottom: DESIGN.spacing.md,
  },

  appName: {
    ...DESIGN.typography.subtitle,
    color: DESIGN.colors.primary,
    fontWeight: '600',
  },

  appVersion: {
    ...DESIGN.typography.caption,
    color: DESIGN.colors.textTertiary,
    marginTop: 2,
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DESIGN.colors.error,
    paddingVertical: DESIGN.spacing.md,
    borderRadius: DESIGN.borderRadius.md,
  },

  logoutText: {
    ...DESIGN.typography.subtitle,
    color: DESIGN.colors.surface,
    marginLeft: DESIGN.spacing.sm,
    fontWeight: '600',
  },

  // Coming Soon Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DESIGN.spacing.lg,
  },

  comingSoonModal: {
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.borderRadius.lg,
    padding: DESIGN.spacing.xl,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    ...DESIGN.shadows.medium,
  },

  modalHeader: {
    alignItems: 'center',
    marginBottom: DESIGN.spacing.lg,
  },

  modalTitle: {
    ...DESIGN.typography.title,
    color: DESIGN.colors.textPrimary,
    marginTop: DESIGN.spacing.sm,
    fontWeight: '600',
  },

  modalMessage: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: DESIGN.spacing.xl,
  },

  modalButton: {
    backgroundColor: DESIGN.colors.primary,
    paddingHorizontal: DESIGN.spacing.xl,
    paddingVertical: DESIGN.spacing.md,
    borderRadius: DESIGN.borderRadius.md,
    minWidth: 120,
    alignItems: 'center',
  },

  modalButtonText: {
    ...DESIGN.typography.subtitle,
    color: DESIGN.colors.surface,
    fontWeight: '600',
  },
});

export default DrawerMenu;
