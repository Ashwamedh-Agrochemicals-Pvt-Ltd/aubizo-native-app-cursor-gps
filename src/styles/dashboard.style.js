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
    height: "14%",
    shadowColor: DESIGN.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
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
    justifyContent: 'space-between',
    paddingHorizontal: DESIGN.spacing.xl,
    paddingTop: DESIGN.spacing.lg,
    paddingBottom: DESIGN.spacing.md,
  },

  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  headerBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: DESIGN.spacing.sm,
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

  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DESIGN.colors.surface + '20',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
  },

  logoutTextView: {
    position: "absolute",
    bottom: DESIGN.spacing.xl, // place above the button
    right: 70,
    backgroundColor: DESIGN.colors.surface,
    paddingVertical: DESIGN.spacing.xs,
    paddingHorizontal: DESIGN.spacing.md,
    borderRadius: DESIGN.borderRadius.sm,
    elevation: 3, // shadow on Android
    shadowColor: "#000", // shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  logoutText: {
    color: DESIGN.colors.error,
    fontWeight: "600",
    fontSize: DESIGN.spacing.md,
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
    padding: DESIGN.spacing.md,
    // backgroundColor: DESIGN.colors.background,
  },

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

  greetingText: {
    flex: 1,
    fontSize: 22,
    fontWeight: "600",
    color: DESIGN.colors.textPrimary,
    marginRight: DESIGN.spacing.sm,
  },

  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: DESIGN.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: DESIGN.spacing.md,
  },

  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: DESIGN.colors.surface,
  },

  welcomeContainer: {
    flex: 1,
  },

  welcomeText: {
    fontSize: 16,
    fontWeight: "400",
    color: DESIGN.colors.textSecondary,
    marginBottom: 2,
  },

  userNameText: {
    fontSize: 20,
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
    fontSize: 12,
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
    fontSize: 14,
    fontWeight: "600",
    color: DESIGN.colors.textPrimary,
    textAlign: "center",
    lineHeight: 18,
  },

  actionTitleDisabled: {
    opacity: 0.5,
    color: DESIGN.colors.textSecondary,
  },

  // Activity Section
  activitySection: {
    flex: 1,
    padding: DESIGN.spacing.md,
    padding: DESIGN.spacing.md,
    borderRadius: 16,
    marginBottom: DESIGN.spacing.md,

  },

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
    marginBottom: DESIGN.spacing.md,



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
    fontSize: 18,
    fontWeight: "600",
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
