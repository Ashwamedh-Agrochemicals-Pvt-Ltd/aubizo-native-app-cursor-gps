import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Alert, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import * as Yup from "yup";
import { useCallback, useRef } from "react";
import apiClient from "../../api/client";
import { navigation } from "../../../navigation/NavigationService";
import storage from "../../utility/storage";
import AppForm from "../form/appComponents/AppForm";
import SubmitButton from "../form/appComponents/SubmitButton";
import InputFormField from "../form/appComponents/InputFormText";
import DESIGN from "../../theme";
import { useState } from "react";
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

  const handleSubmit = useCallback(async (values, { resetForm }) => {
    if (loading) return;
    
    try {
      setLoading(true);
      
      // Create abort controller for this request
      abortControllerRef.current = new AbortController();
      
      const visitId = await storage.get(storageKey);
      if (!visitId) {
        Alert.alert("Error", "Visit ID not found. Please start a new visit.");
        return;
      }

      const payload = { remark: values.remark.trim() };
      const response = await apiClient.patch(
        `track/end-visit/${visitId}/`,
        payload,
        {
          signal: abortControllerRef.current.signal,
          timeout: 10000 // 10 second timeout
        }
      );

      if (response.status === 200 || response.status === 204) {
        resetForm();
        await storage.remove(storageKey);
        await storage.remove(storageKey.replace("VISIT", "START"));
        Alert.alert("Success", "Visit ended successfully.");
        navigation.navigate(navigateTo);
      } else {
        Alert.alert("Error", "Failed to end visit. Please try again.");
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        // Request was cancelled, do nothing
        return;
      }
      
      if (__DEV__) {
        logger.error("Visit end error:", error);
      }
      
      if (error.response?.status === 401) {
        Alert.alert("Session Expired", "Please log in again.");
        return;
      }
      
      if (error.response?.status >= 400 && error.response?.status < 500) {
        // Validation error
        const errorMessage = error.response?.data?.detail || error.response?.data?.message || "Please check your input and try again.";
        Alert.alert("Validation Error", errorMessage);
        return;
      }
      
      if (error.response?.status >= 500) {
        Alert.alert("Server Error", "Something went wrong. Please try again later.");
        return;
      }
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
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
  }, [loading, storageKey, navigateTo]);

  return (
    <View style={modernStyles.container}>
      <View style={modernStyles.formContainer}>
        <AppForm
          initialValues={{ remark: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          validateOnChange={true}
          validateOnBlur={true}
        >
          <View style={modernStyles.inputSection}>
            <Text style={modernStyles.inputLabel}>{"Visit Remarks"}</Text>

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
            <TouchableOpacity
              style={modernStyles.submitButton}
              onPress={() => { }}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Complete visit"
              accessibilityHint="Submits the visit form to complete the visit"
              accessibilityState={{ disabled: loading }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {loading ? (
                <ActivityIndicator color={DESIGN.colors.surface} size="small" />
              ) : (
                <Text style={modernStyles.submitButtonText}>
                  {"Complete Visit"}
                </Text>
              )}
            </TouchableOpacity>

            {/* Hidden SubmitButton for Formik submission */}
            <View style={modernStyles.hiddenSubmit}>
              <SubmitButton title="Submit" style={modernStyles.xhiddenButton} />
            </View>
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

  header: {
    backgroundColor: DESIGN.colors.accent,
    padding: DESIGN.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN.colors.borderLight,
  },

  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: DESIGN.spacing.sm,
  },

  headerTitle: {
    ...DESIGN.typography.title,
    color: DESIGN.colors.textPrimary,
    marginLeft: DESIGN.spacing.sm,
  },

  headerSubtitle: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textSecondary,
    lineHeight: 18,
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

  submitButton: {
    backgroundColor: DESIGN.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: DESIGN.spacing.md,
    borderRadius: DESIGN.borderRadius.md,
    ...DESIGN.shadows.subtle,
    minHeight: 44, // Accessibility minimum touch target
  },

  submitButtonText: {
    ...DESIGN.typography.subtitle,
    color: DESIGN.colors.surface,
    marginLeft: DESIGN.spacing.sm,
  },

  hiddenSubmit: {
    position: "absolute",
    opacity: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  hiddenButton: {
    backgroundColor: "transparent",
    height: "100%",
  },
});

export default VisitForm;
