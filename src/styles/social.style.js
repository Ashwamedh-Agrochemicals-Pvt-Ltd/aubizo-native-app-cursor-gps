import { StyleSheet } from "react-native";
import DESIGN from "../theme";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN.colors.background,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: DESIGN.spacing.lg,
  },

  headerContainer: {
    paddingVertical: DESIGN.spacing.md,
    alignItems: "center",
  },

  title: {
    ...DESIGN.typography.hero,
    color: DESIGN.colors.textPrimary,
    textAlign: "center",
    marginBottom: DESIGN.spacing.sm,
  },

  subtitle: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: DESIGN.spacing.md,
  },

  socialContainer: {
    marginBottom: DESIGN.spacing.xl,
  },

  sectionTitle: {
    ...DESIGN.typography.title,
    color: DESIGN.colors.textPrimary,
    marginBottom: DESIGN.spacing.lg,
    textAlign: "center",
  },

  socialItemContainer: {
    marginBottom: DESIGN.spacing.md,
  },

  socialItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.borderRadius.lg,
    padding: DESIGN.spacing.lg,
    ...DESIGN.shadows.medium,
  },

  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: DESIGN.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: DESIGN.spacing.md,
  },

  textContainer: {
    flex: 1,
  },

  socialName: {
    ...DESIGN.typography.subtitle,
    color: DESIGN.colors.textPrimary,
  },

  shareButton: {
    padding: DESIGN.spacing.sm,
    marginRight: DESIGN.spacing.sm,
    borderRadius: DESIGN.borderRadius.sm,
    backgroundColor: DESIGN.colors.surfaceElevated,
  },

  assistanceCard: {
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.borderRadius.lg,
    padding: DESIGN.spacing.lg,
    marginBottom: DESIGN.spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: DESIGN.colors.secondary,
    ...DESIGN.shadows.medium,
  },

  assistanceHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: DESIGN.spacing.lg,
  },

  assistanceHeaderText: {
    flex: 1,
    marginLeft: DESIGN.spacing.md,
  },

  assistanceTitle: {
    ...DESIGN.typography.subtitle,
    color: DESIGN.colors.textPrimary,
    marginBottom: DESIGN.spacing.xs,
  },

  assistanceSubtitle: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textSecondary,
    lineHeight: 22,
  },

  assistanceActions: {
    flexDirection: "row",
    gap: DESIGN.spacing.md,
  },

  assistanceButton: {
    flex: 1,
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: DESIGN.spacing.md,
    paddingHorizontal: DESIGN.spacing.lg,
    borderRadius: DESIGN.borderRadius.md,
    gap: DESIGN.spacing.sm,
  },

  callButton: {
    backgroundColor: DESIGN.colors.primary,
  },

  emailButton: {
    backgroundColor: DESIGN.colors.primary,
    borderWidth: 2,
    borderColor: DESIGN.colors.primary,
  },

  callButtonText: {
    ...DESIGN.typography.subtitle,
    color: DESIGN.colors.surface,
    fontSize: 16,
  },

  emailButtonText: {
    ...DESIGN.typography.subtitle,
    color: DESIGN.colors.surface,
    fontSize: 16,
  },

  contactCard: {
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.borderRadius.lg,
    padding: DESIGN.spacing.lg,
    marginBottom: DESIGN.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: DESIGN.colors.primary,
    ...DESIGN.shadows.subtle,
  },

  contactHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: DESIGN.spacing.md,
  },

  contactTitle: {
    ...DESIGN.typography.subtitle,
    color: DESIGN.colors.textPrimary,
    marginLeft: DESIGN.spacing.sm,
  },

  contactText: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textSecondary,
    lineHeight: 24,
  },

});
