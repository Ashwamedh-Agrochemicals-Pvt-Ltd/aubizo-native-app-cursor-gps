import { StyleSheet, Platform } from "react-native";
import DESIGN from "../theme";

export default StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: DESIGN.colors.background,
  },

  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: DESIGN.spacing.lg,
    paddingVertical: DESIGN.spacing.lg,
  },

  keyboardView: {
    flex: 1,
  },

  headerContainer: {
    backgroundColor: DESIGN.colors.primary,
    paddingBottom: DESIGN.spacing.sm,
    ...DESIGN.shadows.subtle,
  },

  headerContent: {
    height: Platform.OS === 'ios' ? 60 : 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: DESIGN.spacing.lg,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: DESIGN.colors.surface,
    letterSpacing: 1,
  },

  loginCard: {
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.borderRadius.xl,
    paddingHorizontal: DESIGN.spacing.lg,
    paddingVertical: DESIGN.spacing.lg,
    width: "100%",
    ...DESIGN.shadows.medium,
    borderWidth: 1,
    borderColor: DESIGN.colors.borderLight,
  },

  welcomeSection: {
    alignItems: "center",
    marginBottom: DESIGN.spacing.lg,
    paddingBottom: DESIGN.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN.colors.borderLight,
  },

  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: DESIGN.colors.textPrimary,
    marginBottom: DESIGN.spacing.xs,
    textAlign: "center",
    letterSpacing: -0.5,
  },

  welcomeSubtitle: {
    fontSize: 16,
    color: DESIGN.colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    fontWeight: '400',
  },

  formSection: {
    width: "100%",
  },

  fieldContainer: {
    marginBottom: DESIGN.spacing.sm,
  },

  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: DESIGN.colors.textPrimary,
    marginBottom: DESIGN.spacing.sm,
    letterSpacing: 0.2,
  },

  error: {
    marginTop: DESIGN.spacing.xs,
    fontSize: 13,
    color: '#E53E3E', // Softer red color
    fontWeight: "500",
    marginLeft: DESIGN.spacing.sm,
    opacity: 0.9,
  },

  // Alternative modern error style
  errorModern: {
    marginTop: DESIGN.spacing.xs,
    fontSize: 13,
    color: '#DC2626',
    fontWeight: "500",
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: DESIGN.borderRadius.sm,
    paddingHorizontal: DESIGN.spacing.sm,
    paddingVertical: DESIGN.spacing.xs,
    alignSelf: 'flex-start',
  },

  eyeIcon: {
    padding: DESIGN.spacing.xs,
  },

  buttonContainer: {
    width: "100%",
    marginTop: DESIGN.spacing.sm,
  },

  loadingButton: {
    backgroundColor: DESIGN.colors.primary,
    borderRadius: DESIGN.borderRadius.lg,
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    ...DESIGN.shadows.medium,
  },

  loadingText: {
    color: DESIGN.colors.surface,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: DESIGN.spacing.sm,
  },

  submitButton: {
    backgroundColor: DESIGN.colors.primary,
    borderRadius: DESIGN.borderRadius.lg,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    ...DESIGN.shadows.medium,
  },

  submitButtonText: {
    color: DESIGN.colors.surface,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: DESIGN.spacing.lg,
  },

  footerText: {
    fontSize: 14,
    color: DESIGN.colors.textSecondary,
    fontWeight: "400",
  },

  createAccountText: {
    fontSize: 14,
    color: DESIGN.colors.primary,
    fontWeight: "600",
  },
});