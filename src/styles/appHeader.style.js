import { StyleSheet, Platform } from 'react-native';
import Constants from 'expo-constants';
import DESIGN from '../theme';

export default StyleSheet.create({
  container: {
    backgroundColor: DESIGN.colors.primary,
  },
  headerContainer: {
    backgroundColor: DESIGN.colors.primary,
    ...DESIGN.shadows.subtle,
  },
  headerContent: {
    height: Platform.OS === 'ios' ? 70 : 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DESIGN.spacing.lg,
   
  },
  headerTitle: {
    ...DESIGN.typography.title,
    color: DESIGN.colors.surface,
  },
  menuButton: {
    width: 48,
    height: 48,
    borderRadius: DESIGN.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: DESIGN.colors.overlay,
  },
  modalOverlayTouch: {
    flex: 1,
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: DESIGN.colors.surface,
    borderTopLeftRadius: DESIGN.borderRadius.xl,
    borderTopRightRadius: DESIGN.borderRadius.xl,
    paddingBottom: Platform.select({
      ios: Constants.statusBarHeight || DESIGN.spacing.lg,
      android: DESIGN.spacing.lg,
    }),
    maxHeight: '85%',
    ...DESIGN.shadows.strong,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: DESIGN.colors.surfaceElevated,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: DESIGN.spacing.sm,
    marginBottom: DESIGN.spacing.md,
  },
  modalHeader: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DESIGN.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 0 : DESIGN.spacing.md,
    paddingBottom: DESIGN.spacing.sm, // fixed typo 'xm'
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DESIGN.colors.surfaceElevated,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: DESIGN.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DESIGN.colors.surfaceElevated,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DESIGN.spacing.sm,
    marginHorizontal: DESIGN.spacing.lg,
    marginBottom: DESIGN.spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: DESIGN.spacing.sm,
    backgroundColor: DESIGN.colors.textTertiary,
  },
  statusText: {
    ...DESIGN.typography.caption,
    color: DESIGN.colors.textSecondary,
  },
  homeButton: {
    marginHorizontal: DESIGN.spacing.lg,
    marginBottom: DESIGN.spacing.md,
    backgroundColor: DESIGN.colors.primary,
    borderRadius: DESIGN.borderRadius.md,
    ...DESIGN.shadows.medium,
  },
  homeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DESIGN.spacing.md,
    paddingHorizontal: DESIGN.spacing.lg,
  },
  homeButtonText: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.surface,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    marginLeft: DESIGN.spacing.sm,
  },
  menuContainer: {
    paddingHorizontal: DESIGN.spacing.lg,
    paddingTop: DESIGN.spacing.sm,
    paddingBottom: DESIGN.spacing.lg,
  },
  menuItem: {
    marginBottom: DESIGN.spacing.sm,
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.borderRadius.md,
    ...DESIGN.shadows.subtle,

  },
  logoutItem: {
    backgroundColor: DESIGN.colors.surface,
    borderWidth: 1,
    borderColor: DESIGN.colors.error,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: DESIGN.spacing.md,
    paddingHorizontal: DESIGN.spacing.md,
    minHeight: 56,
  },
  menuIcon: {
    marginRight: DESIGN.spacing.md,
  },
  menuText: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textPrimary,
    flex: 1,
  },
  logoutText: {
    color: DESIGN.colors.error,
  },
});