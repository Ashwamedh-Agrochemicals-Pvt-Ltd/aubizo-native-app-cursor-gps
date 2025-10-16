import DESIGN from "../theme";
import { StyleSheet } from "react-native";
export default StyleSheet.create({
  // Container
  container: {
    flex: 1,
  },

  // Header
  header: {
    backgroundColor: DESIGN.colors.primary,
    height: "10%",
    position: 'relative',
  },

  headerGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },

  headerContent: {
    flex: 1,
    paddingHorizontal: DESIGN.spacing.md,
    justifyContent: 'center',
  },

  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },


  headerBrandSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: DESIGN.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DESIGN.spacing.sm,
  },

  headerLogoText: {
    fontSize: 16,
    fontWeight: '700',
    color: DESIGN.colors.primary,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: DESIGN.colors.surface,
    letterSpacing: 0.5,
  },

  headerSubtitle: {
    fontSize: 14,
    fontWeight: "400",
    color: DESIGN.colors.surface,
    opacity: 0.85,
    marginTop: 2,
  },

  headerDateTimeSection: {
    alignItems: 'flex-end',
  },

  headerTime: {
    fontSize: 18,
    fontWeight: '600',
    color: DESIGN.colors.surface,
  },

  headerDate: {
    fontSize: 12,
    color: DESIGN.colors.surface,
    fontWeight: "300",


  },

  headerStatusSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: DESIGN.colors.success,
    marginRight: DESIGN.spacing.xs,
  },

  headerStatusText: {
    fontSize: 12,
    color: DESIGN.colors.surface,
    fontWeight: '500',
    opacity: 0.9,
  },

  headerActionsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN.spacing.sm,
  },

  notificationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: DESIGN.colors.surface + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DESIGN.colors.surface + '30',
  },

  // Enhanced Logout Button
  enhancedLogoutButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    right: DESIGN.spacing.sm,
    overflow: 'hidden',
  },

  logoutButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',

    borderColor: DESIGN.colors.surface + '40',

  },

  logoutButtonGlow: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: DESIGN.colors.surface + '10',

  },

  // Modern Logout Popup
  modernLogoutPopup: {
    position: "absolute",
    top: 60,
    right: DESIGN.spacing.lg,
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.borderRadius.lg,
    elevation: 10,
    zIndex: 1000,
  },

  logoutPopupContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DESIGN.spacing.lg,
    paddingVertical: DESIGN.spacing.md,
    gap: DESIGN.spacing.sm,
  },

  logoutIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: DESIGN.colors.error + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },

  enhancedLogoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: DESIGN.colors.error,
    marginRight: DESIGN.spacing.xs,
  },

  logoutPopupArrow: {
    position: 'absolute',
    top: -8,
    right: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: DESIGN.colors.surface,
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },

  scrollViewContent: {
    flexGrow: 1,
  },

  // Main Content
  mainContent: {
    padding: DESIGN.spacing.sm,
  },

  // Enhanced Greeting Styles
  enhancedGreetingCard: {
    position: 'relative',
    marginBottom: DESIGN.spacing.lg,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: DESIGN.colors.surface,
  },

  greetingGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: `rgba(46, 125, 50, 0.08)`, // primary color with transparency
  },

  greetingDecorations: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  decorativeCircle1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `rgba(76, 175, 80, 0.1)`,
  },

  decorativeCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -15,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `rgba(255, 143, 0, 0.08)`,
  },

  greetingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DESIGN.spacing.md,
   
  },


  enhancedWelcomeContainer: {
    flex: 1,
    position: 'relative',
  },

  enhancedWelcomeText: {
    fontSize: 18,
    fontWeight: '500',
    color: DESIGN.colors.textSecondary,
    marginBottom: 4,
    letterSpacing: 0.5,
  },

  enhancedUserNameText: {
    fontSize: 26,
    fontWeight: '600',
    color: DESIGN.colors.textPrimary,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  pulseEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: `rgba(76, 175, 80, 0.05)`,
    borderRadius: 24,
  },

  // Legacy styles (keeping for compatibility)
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: DESIGN.spacing.lg,
    backgroundColor: DESIGN.colors.surface,
    padding: DESIGN.spacing.md,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  welcomeText: {
    fontSize: 16,
    fontWeight: "400",
    color: DESIGN.colors.textSecondary,
  },

  userNameText: {
    fontSize: 16,
    fontWeight: "600",
    color: DESIGN.colors.textPrimary,
  },

  // Visit Overview Section
  section: {
    backgroundColor: DESIGN.colors.surface,
    marginBottom: DESIGN.spacing.lg,
    padding: DESIGN.spacing.md,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: "relative",

  },

  visitTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: DESIGN.spacing.sm,
    marginBottom: DESIGN.spacing.xs,
  },

  visitTitleSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: DESIGN.spacing.sm,
  },

  visitTitleText: {
    fontSize: 18,
    fontWeight: "600",
    color: DESIGN.colors.primary,
  },

  visitChevronContainer: {
    position: 'absolute',
    right: DESIGN.spacing.sm,
    top: '70%',
    transform: [{ translateY: -10 }],
    zIndex: 1,
  },

  visitChevron: {

    borderRadius: 15,
    padding: DESIGN.spacing.xs,



  },

  visitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  visitItem: {
    fontSize: 16,
    color: DESIGN.colors.textPrimary,
    fontWeight: "500",
    textAlign: "center",
    flex: 1,
  },

  visitCount: {
    fontSize: 24,
    fontWeight: "700",
    color: DESIGN.colors.primary,
    textAlign: "center",
  },

  visitLabel: {
    fontSize: 14,
    color: DESIGN.colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
    fontWeight: "500",
  },

  visitItemContainer: {
    alignItems: "center",
    flex: 1,
  },

  visitDivider: {
    width: 1,
    height: 40,
    backgroundColor: DESIGN.colors.border,
    marginHorizontal: DESIGN.spacing.sm,
  },

  sectionBadge: {
    position: "absolute",
    right: DESIGN.spacing.sm,
    paddingHorizontal: DESIGN.spacing.md,
    paddingVertical: DESIGN.spacing.xs,
    backgroundColor: DESIGN.colors.primary + "15",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DESIGN.colors.primary + "30",
  },

  sectionBadgeText: {
    fontSize: 11,
    color: DESIGN.colors.primary,
    fontWeight: "600",
    textTransform: "uppercase",
  },

  // Actions Grid
  actionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: DESIGN.spacing.md,
    marginBottom: DESIGN.spacing.lg,

  },

  actionCard: {
    flex: 1,
    padding: DESIGN.spacing.md,
    backgroundColor: DESIGN.colors.surface,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 100,
    borderWidth: 1,
    borderColor: DESIGN.colors.border + "30",
  },

  actionCardDisabled: {
    backgroundColor: DESIGN.colors.surfaceElevated,
    opacity: 0.6,
  },

  actionIcon: {
    marginBottom: DESIGN.spacing.md,
    padding: DESIGN.spacing.sm,
    borderRadius: 12,
    backgroundColor: DESIGN.colors.background,
  },

  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: DESIGN.colors.textPrimary,
    textAlign: "center",
    lineHeight: 18,
  },

  actionTitleDisabled: {
    opacity: 0.5,
    color: DESIGN.colors.textSecondary,
  },

  // // Activity Section
  // activitySection: {
  //   flex: 1,
  //   padding: DESIGN.spacing.md,
  //   padding: DESIGN.spacing.md,
  //   borderRadius: 16,  
  // },

  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: DESIGN.spacing.md,
  },

  activityTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: DESIGN.colors.textPrimary,
  },

  activitySubtitle: {
    fontSize: 12,
    color: DESIGN.colors.textSecondary,
    fontWeight: "500",
    backgroundColor: DESIGN.colors.success + "15",
    paddingHorizontal: DESIGN.spacing.sm,
    paddingVertical: DESIGN.spacing.xs,
    borderRadius: 8,
  },

  // Punch Section
  punchSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: DESIGN.spacing.sm,
  },

  punchSectionRow: {
    flexDirection: "row",
    gap: DESIGN.spacing.sm,
    alignItems: "center",
  },

  punchIconWrapper: (bgColor) => ({
    height: 40,
    width: 40,
    backgroundColor: bgColor + "20",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  }),

  punchLabel: {
    fontSize: 16,
    color: DESIGN.colors.textPrimary,
    fontWeight: "500",
  },

  punchTime: {
    fontSize: 16,
    fontWeight: "500",
    color: DESIGN.colors.textPrimary,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject, // fills the entire screen
    backgroundColor: "rgba(0, 0, 0, 0.2)", // semi-transparent
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999, // ensures it appears above all content
  },

});
