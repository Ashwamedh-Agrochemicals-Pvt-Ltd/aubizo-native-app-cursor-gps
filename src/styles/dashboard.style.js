import DESIGN from "../theme";
import { StyleSheet } from "react-native";
export default StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: DESIGN.colors.background,
  },

  // Header
  header: {
    backgroundColor: DESIGN.colors.primary,
    height: "15%",
    position: 'relative',
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

  // ScrollView
  scrollView: {
    flex: 1,
  },

  scrollViewContent: {
    flexGrow: 1,
  },

  // Main Content
  mainContent: {
    paddingHorizontal: DESIGN.spacing.md,
  },

  welcomeContainer: {
    flex: 1,
    marginVertical: DESIGN.spacing.md
  },

  welcomeText: {
    fontSize: 18,
    fontWeight: '500',
    color: DESIGN.colors.textSecondary,
  },

  userNameText: {
    fontSize: 22,
    fontStyle: "italic",
    fontWeight: '500',
    color: DESIGN.colors.textPrimary,
    paddingLeft: 20,
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
    borderRadius: DESIGN.borderRadius.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
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
    color: DESIGN.colors.textPrimary,
  },

  visitChevronContainer: {
    position: 'absolute',
    right: DESIGN.spacing.sm,
    top: '70%',
    transform: [{ translateY: -10 }],
    zIndex: 1,
  },

  visitChevron: {
    borderRadius: DESIGN.borderRadius.sm,
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
    borderRadius: DESIGN.borderRadius.md,
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
    borderRadius: DESIGN.borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    borderWidth: 1,
    borderColor: DESIGN.colors.textPrimary + "30",
  },

  actionCardDisabled: {
    backgroundColor: DESIGN.colors.surfaceElevated,
    opacity: 0.6,
    borderWidth: 1,
    borderColor: DESIGN.colors.textPrimary + "30",
  },

  actionIcon: {
    marginBottom: DESIGN.spacing.md,
    padding: DESIGN.spacing.sm,
    borderRadius: DESIGN.borderRadius.md,
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

  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: DESIGN.spacing.md,
  },

  activityTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: DESIGN.colors.textPrimary,
  },

  activitySubtitle: {
    borderBottomWidth: 2,
    borderColor: DESIGN.colors.border,
    color: DESIGN.colors.primary,
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
    height: 35,
    width: 35,
    backgroundColor: bgColor + "20",
    borderRadius: DESIGN.borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  }),

  punchLabel: {
    fontSize: 16,
    color: DESIGN.colors.textPrimary,
  },

  punchTime: {
    fontSize: 16,
    color: DESIGN.colors.textPrimary,
  },
});
