import DESIGN from "../theme";

export const styles = {
  // Container
  container: {
    flex: 1,
  },

  // Header
  header: {
    backgroundColor: DESIGN.colors.primary,
    height: "15%",
  },

  headerContent: {
    flex: 1,
    justifyContent: "center",
    left: DESIGN.spacing.sm,
  },

  headerTitle: {
    fontSize: DESIGN.typography.title.fontSize,
    fontWeight: DESIGN.typography.title.fontWeight,
    color: DESIGN.colors.surface,
  },

  headerDate: {
    position: "absolute",
    top: DESIGN.spacing.sm,
    right: DESIGN.spacing.lg,
    fontSize: DESIGN.typography.caption.fontSize,
    color: DESIGN.colors.surface,
  },

  logoutButton: {
    borderRadius: DESIGN.borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    padding: DESIGN.spacing.sm,
    backgroundColor: DESIGN.colors.surface,
    bottom: DESIGN.spacing.md,
    right: DESIGN.spacing.lg,
    position: "absolute",
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
    backgroundColor: DESIGN.colors.background,
  },

  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: DESIGN.spacing.lg,
  },

  greetingText: {
    flex: 1,
    fontSize: DESIGN.typography.title.fontSize,
    fontWeight: DESIGN.typography.subtitle.fontWeight,
    color: DESIGN.colors.textPrimary,
    marginRight: DESIGN.spacing.sm,
  },

  // Visit Overview Section
  section: {
    backgroundColor: DESIGN.colors.surface,
    padding: 14,
    borderRadius: DESIGN.borderRadius.sm,
    ...DESIGN.shadows.subtle,
    position: "relative",
  },

  visitTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: DESIGN.spacing.xs,
    marginBottom: DESIGN.spacing.sm,
  },

  visitTitleText: {
    fontSize: DESIGN.typography.body.fontSize,
    fontWeight: DESIGN.typography.subtitle.fontWeight,
    color: DESIGN.colors.primary,
  },

  visitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 5,
  },

  visitItem: {
    fontSize: DESIGN.typography.body.fontSize,
    color: DESIGN.colors.textPrimary,
  },

  sectionBadge: {
    position: "absolute",
    top: 0,
    right: DESIGN.spacing.md,
    paddingHorizontal: DESIGN.spacing.sm,
    height: DESIGN.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: DESIGN.borderRadius.lg,
    backgroundColor: DESIGN.colors.success + "20",
  },

  sectionBadgeText: {
    fontSize: DESIGN.typography.body.fontSize,
    color: DESIGN.colors.textPrimary,
    fontWeight: DESIGN.typography.subtitle.fontWeight,
  },

  // Actions Grid
  actionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: DESIGN.spacing.md,
    marginVertical: 30,
    marginBottom: 15,
  },

  actionCard: {
    flex: 1,
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.borderRadius.lg,
    padding: DESIGN.spacing.md,
    alignItems: "center",
    ...DESIGN.shadows.subtle,
    minHeight: 120,
  },

  actionCardDisabled: {
    backgroundColor: DESIGN.colors.surfaceElevated,
  },

  actionIcon: {
    marginBottom: DESIGN.spacing.sm,
  },

  actionTitle: {
    fontSize: DESIGN.typography.body.fontSize,
    fontWeight: DESIGN.typography.subtitle.fontWeight,
    color: DESIGN.colors.textPrimary,
    textAlign: "center",
    lineHeight: DESIGN.typography.body.lineHeight,
  },

  actionTitleDisabled: {
    opacity: 0.4,
    color: DESIGN.colors.textSecondary,
  },

  // Activity Section
  activitySection: {
    flex: 1,
    backgroundColor: DESIGN.colors.surface,
    padding: DESIGN.spacing.md,
  },

  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: DESIGN.spacing.md,
  },

  activityTitle: {
    fontSize: DESIGN.typography.body.fontSize,
    fontWeight: DESIGN.typography.body.fontWeight,
  },

  activitySubtitle: {
    fontSize: DESIGN.typography.body.fontSize,
    color: DESIGN.colors.textSecondary,
    fontStyle: "italic",
  },

  // Punch Section
  punchSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },

  punchSectionRow: {
    flexDirection: "row",
    gap: DESIGN.spacing.xs,
    alignItems: "center",
    justifyContent: "center",
  },

  punchIconWrapper: (bgColor) => ({
    height: DESIGN.spacing.xl,
    width: DESIGN.spacing.xl,
    backgroundColor: bgColor + "20",
    borderRadius: DESIGN.borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  }),

  punchLabel: {
    fontSize: DESIGN.typography.body.fontSize,
    color: DESIGN.colors.textPrimary,
    fontWeight: "400",
  },

  punchTime: {
    fontSize: DESIGN.typography.bodyLarge.fontSize,
    fontWeight: "400",
    color: DESIGN.colors.textPrimary,
  },
};
