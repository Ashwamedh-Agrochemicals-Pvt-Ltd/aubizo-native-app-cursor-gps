import { StyleSheet, Platform } from "react-native";
import DESIGN from "../theme";

export default StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },

  logo: {
    width: 320,
    height: 200,
    alignSelf: "center",
  },

  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: DESIGN.spacing.md,
    paddingVertical: DESIGN.spacing.md,
  },

  loginCard: {
    paddingHorizontal: DESIGN.spacing.md,
  },

  welcomeSection: {
    alignItems: "center",
    marginBottom: DESIGN.spacing.md,
  },

  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: DESIGN.colors.textPrimary,
    marginBottom: DESIGN.spacing.xs,
    textAlign: "center",
  },

  welcomeSubtitle: {
    fontSize: 16,
    color: DESIGN.colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    fontWeight: '400',
    textShadowColor: DESIGN.colors.textSecondary,
    textShadowRadius: 0.6,
  },

  formSection: {
    width: "100%",
  },

  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: DESIGN.colors.textPrimary,
    marginBottom: DESIGN.spacing.sm,
  },

  inputContainer: {
    backgroundColor: null,
    borderRadius: null,
    borderWidth: null,
    borderColor: null,
    borderBottomWidth: 0.5,
    borderBottomColor: "#007955",
  },

  eyeIcon: {
    padding: DESIGN.spacing.xs,
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

  buttonContainer: {
    paddingBottom: DESIGN.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN.colors.border,
  },

  submitButton: {
    backgroundColor: "#007955",
    alignItems: "center",
    ...DESIGN.shadows.medium,
    ...Platform.select({
      ios: {
        shadowColor: DESIGN.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 10,
      },
    }),
  },

  submitButtonText: {
    color: DESIGN.colors.surface,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1,
  },

  ssoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: DESIGN.spacing.lg,
    gap: 5,
  },

  ssoText: {
    fontSize: 14,
    color: "#007955",
    fontWeight: "500",
  },

  formError: {
    color: DESIGN.colors.error,
  },

});