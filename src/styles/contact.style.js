import { StyleSheet } from "react-native";
import DESIGN from "../theme";
export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN.colors.background,
  },

  scrollContainer: {
    paddingBottom: DESIGN.spacing.xxxl,
  },

  // Header Styles
  headerContainer: {
    position: "relative",
    height: 200,
    marginBottom: DESIGN.spacing.xl,
  },

  headerImage: {
    width: "100%",
    height: "100%",
  },

  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(46, 125, 50, 0.7)",
    justifyContent: "space-between",
    padding: DESIGN.spacing.xl,
  },

  headerContent: {
    flex: 1,
    justifyContent: "center",
  },

  headerTitle: {
    ...DESIGN.typography.hero,
    color: "#FFFFFF",
    marginBottom: DESIGN.spacing.sm,
  },

  headerSubtitle: {
    ...DESIGN.typography.body,
    color: "rgba(255, 255, 255, 0.9)",
  },

  quickActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: DESIGN.spacing.lg,
  },

  quickActionButton: {
    width: 48,
    height: 48,
    borderRadius: DESIGN.borderRadius.xl,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },

  // Contact Section
  contactSection: {
    paddingHorizontal: DESIGN.spacing.lg,
    gap: DESIGN.spacing.md,
    marginBottom: DESIGN.spacing.xl,
  },

  contactCard: {
    marginBottom: DESIGN.spacing.sm,
  },

  contactCardContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.borderRadius.lg,
    padding: DESIGN.spacing.lg,
    ...DESIGN.shadows.medium,
    minHeight: 80,
  },

  pressedCard: {
    backgroundColor: DESIGN.colors.surfaceElevated,
    ...DESIGN.shadows.subtle,
  },

  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: DESIGN.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: DESIGN.spacing.md,
  },

  contactContent: {
    flex: 1,
    paddingRight: DESIGN.spacing.sm,
  },

  contactTitle: {
    ...DESIGN.typography.subtitle,
    color: DESIGN.colors.textPrimary,
    marginBottom: DESIGN.spacing.xs,
  },

  contactSubtitle: {
    ...DESIGN.typography.caption,
    color: DESIGN.colors.textSecondary,
    lineHeight: 20,
  },

  actionButton: {
    width: 32,
    height: 32,
    borderRadius: DESIGN.borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },

  // Map Section
  mapSection: {
    paddingHorizontal: DESIGN.spacing.lg,
    marginBottom: DESIGN.spacing.xl,
  },

  mapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: DESIGN.spacing.md,
  },

  mapTitle: {
    ...DESIGN.typography.title,
    color: DESIGN.colors.textPrimary,
  },

  directionsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${DESIGN.colors.primary}15`,
    paddingHorizontal: DESIGN.spacing.md,
    paddingVertical: DESIGN.spacing.sm,
    borderRadius: DESIGN.borderRadius.md,
  },

  directionsText: {
    ...DESIGN.typography.caption,
    color: DESIGN.colors.primary,
    marginLeft: DESIGN.spacing.xs,
    fontWeight: "600",
  },

  mapContainer: {
    position: "relative",
    height: 250,
    borderRadius: DESIGN.borderRadius.lg,
    overflow: "hidden",
    ...DESIGN.shadows.medium,
  },

  map: {
    width: "100%",
    height: "100%",
  },

  mapOverlayButton: {
    position: "absolute",
    top: DESIGN.spacing.md,
    right: DESIGN.spacing.md,
    width: 40,
    height: 40,
    borderRadius: DESIGN.borderRadius.sm,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    ...DESIGN.shadows.subtle,
  },
});