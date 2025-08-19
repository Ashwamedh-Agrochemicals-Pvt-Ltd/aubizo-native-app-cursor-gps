import DESIGN from "../theme";

export const styles = {
  container: {
    flex: 1,
    backgroundColor: DESIGN.colors.background,
    paddingTop: DESIGN.spacing.lg,
  },

  mainContent: {
    flex: 1,
    paddingHorizontal: DESIGN.spacing.md,
    paddingTop: DESIGN.spacing.md,
  },

  punchSection: {
    alignItems: "center",
    marginBottom: DESIGN.spacing.xxl,
  },

  punchButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
    ...DESIGN.shadows.medium,
  },

  punchButtonActive: {
    backgroundColor: DESIGN.colors.accent,
  },

  punchButtonInactive: {
    backgroundColor: "#F44336", // ❗ You might want to add this to theme if reused
  },

  punchButtonDisabled: {
    opacity: 0.6,
    backgroundColor: "#9E9E9E", // Grayed out when disabled
  },

  punchButtonText: {
    color: DESIGN.colors.surface,
    fontSize: DESIGN.typography.bodyLarge.fontSize,
    fontWeight: DESIGN.typography.subtitle.fontWeight,
    marginTop: DESIGN.spacing.sm,
  },

  punchIcon: {
    marginBottom: DESIGN.spacing.xs,
  },

  actionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: DESIGN.spacing.md,
  },

  actionCard: {
    flex: 1,
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.borderRadius.lg,
    padding: DESIGN.spacing.lg,
    alignItems: "center",
    ...DESIGN.shadows.subtle,
    minHeight: 120,
  },

  actionCardDisabled: {
    opacity: 0.4,
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
    color: DESIGN.colors.textSecondary,
  },

  pulseAnimation: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: DESIGN.colors.accent,
    opacity: 0.3,
  },

  statusBadge: {
    alignSelf: "center",
    paddingHorizontal: DESIGN.spacing.md,
    paddingVertical: DESIGN.spacing.sm,
    borderRadius: DESIGN.borderRadius.xl,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: DESIGN.spacing.lg,
  },

  statusBadgeActive: {
    backgroundColor: "#E8F5E8", // could also be added to theme as a "successBackground"
  },

  statusBadgeInactive: {
    backgroundColor: "#FFF3E0", // could also be added to theme as a "warningBackground"
  },

  statusText: {
    fontSize: DESIGN.typography.body.fontSize - 2,
    fontWeight: DESIGN.typography.subtitle.fontWeight,
    marginLeft: DESIGN.spacing.xs,
  },

  statusTextActive: {
    color: DESIGN.colors.primary,
  },

  statusTextInactive: {
    color: DESIGN.colors.secondary,
  },
};
