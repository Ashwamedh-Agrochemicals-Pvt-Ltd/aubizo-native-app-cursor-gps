import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Alert, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import * as Yup from "yup";
import { useCallback, useRef, useState } from "react";
import apiClient from "../../api/client";
import { navigation } from "../../../navigation/NavigationService";
import storage from "../../utility/storage";
import AppForm from "../form/appComponents/AppForm";
import SubmitButton from "../form/appComponents/SubmitButton";
import InputFormField from "../form/appComponents/InputFormText";
import DESIGN from "../../theme";
import logger from "../../utility/logger";

const validationSchema = Yup.object().shape({
  remark: Yup.string()
    .trim()
    .required("Remark is required")
    .min(5, "Remark must be at least 5 characters")
    .max(500, "Remark must be less than 500 characters"),
});

const VisitForm = ({ storageKey, navigateTo }) => {
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef(null);

  const handleSubmit = useCallback(
    async (values, { resetForm }) => {
      if (loading) return;

      try {
        setLoading(true);

        // Create abort controller for this request
        abortControllerRef.current = new AbortController();

        const visitId = await storage.get(storageKey);
        console.log("Visit ID:", visitId);

        if (!visitId) {
          Alert.alert("Error", "Please start a new visit.");
          return;
        }

        const payload = { remark: values.remark.trim() };
        const response = await apiClient.patch(
          `track/end-visit/${visitId}/`, // ✅ removed trailing slash
          payload,
          { signal: abortControllerRef.current.signal }
        );

        if (response.status === 200 || response.status === 204) {
          resetForm();
          await storage.remove(storageKey);
          await storage.remove(storageKey.replace("VISIT", "START"));

          Alert.alert("Success", "Visit ended successfully.");

          if (navigation.isReady()) {
            navigation.reset({
              index: 1,
              routes: [
                { name: "Dashboard" },
                { name: navigateTo },
              ],
            });
          }
        } else {
          Alert.alert("Error", "Failed to end visit. Please try again.");
        }
      } catch (error) {
        if (error.name === "AbortError") return;

        if (__DEV__) {
          logger.error("Visit end error:", error);
        }

        if (error.response?.status === 401) {
          Alert.alert("Session Expired", "Please log in again.");
          return;
        }

        if (error.response?.status >= 400 && error.response?.status < 500) {
          const errorMessage =
            error.response?.data?.detail ||
            error.response?.data?.message ||
            "Please check your input and try again.";
          Alert.alert("Validation Error", errorMessage);
          return;
        }

        if (error.response?.status >= 500) {
          Alert.alert("Server Error", "Something went wrong. Please try again later.");
          return;
        }

        if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
          Alert.alert("Connection Timeout", "Can't reach server. Please check your connection and try again.");
          return;
        }

        if (!error.response) {
          Alert.alert("Network Error", "Can't reach server. Please check your internet connection.");
          return;
        }

        Alert.alert("Error", "Something went wrong while ending the visit.");
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    },
    [loading, storageKey, navigateTo]
  );

  return (
    <View style={modernStyles.container}>
      <View style={modernStyles.formContainer}>
        <AppForm
          initialValues={{ remark: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          validateOnChange
          validateOnBlur
        >
          <View style={modernStyles.inputSection}>
            <Text style={modernStyles.inputLabel}>Visit Remarks</Text>

            <InputFormField
              name="remark"
              placeholder="Enter your remarks about this visit..."
              multiline
              numberOfLines={4}
              style={modernStyles.remarkInput}
              accessibilityLabel="Visit remarks input"
              accessibilityHint="Enter your remarks about this visit"
            />
          </View>

          <View style={modernStyles.submitSection}>
            <SubmitButton
              title={loading ? "" : "Complete Visit"}
              disabled={loading}
              style={modernStyles.submitButton}
            >
              {loading && <ActivityIndicator color={DESIGN.colors.surface} size="small" />}
            </SubmitButton>
          </View>
        </AppForm>
      </View>
    </View>
  );
};

const modernStyles = StyleSheet.create({
  container: {
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.borderRadius.sm,
    marginHorizontal: DESIGN.spacing.md,
    marginBottom: DESIGN.spacing.sm,
    marginTop: DESIGN.spacing.md,
    ...DESIGN.shadows.medium,
    overflow: "hidden",
  },
  formContainer: {
    padding: DESIGN.spacing.lg,
  },
  inputSection: {
    marginBottom: DESIGN.spacing.sm,
  },
  inputLabel: {
    ...DESIGN.typography.subtitle,
    color: DESIGN.colors.textPrimary,
    marginBottom: DESIGN.spacing.md,
  },
  remarkInput: {
    minHeight: 70,
    textAlignVertical: "top",
    backgroundColor: DESIGN.colors.background,
    borderColor: DESIGN.colors.border,
    padding: DESIGN.spacing.md,
  },
  submitSection: {
    marginTop: DESIGN.spacing.md,
  },
  submitButton: {
    backgroundColor: DESIGN.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: DESIGN.spacing.md,
    borderRadius: DESIGN.borderRadius.md,
    ...DESIGN.shadows.subtle,
    minHeight: 44,
  },
});

export default VisitForm;
