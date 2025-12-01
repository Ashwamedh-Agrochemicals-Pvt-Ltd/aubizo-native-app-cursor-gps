import { Alert, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import * as Yup from "yup";
import { useCallback, useRef, useState, useEffect } from "react";
import apiClient from "../../api/client";
import { navigation } from "../../../navigation/NavigationService";
import storage from "../../utility/storage";
import AppForm from "../form/appComponents/AppForm";
import SubmitButton from "../form/appComponents/SubmitButton";
import InputFormField from "../form/appComponents/InputFormText";
import DESIGN from "../../theme";
import logger from "../../utility/logger";
import AppDropDownPicker from "../form/appComponents/AppDropDownPicker";
import showToast from "../../utility/showToast";

const validationSchema = Yup.object().shape({
  visit_purpose: Yup.string().required("Visit purpose is required"),
  remark: Yup.string()
    .notRequired()
    .trim()
    .min(5, "Remark must be at least 5 characters")
    .max(500, "Remark must be less than 500 characters"),
});

const VisitForm = ({ storageKey, navigateTo }) => {
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef(null);

  const handleSubmit = useCallback(
    async (values, { resetForm }) => {
      if (loading) return;

      setLoading(true);
      abortControllerRef.current = new AbortController();

      try {
        const visitId = await storage.get(storageKey);

        if (!visitId) {
          Alert.alert("Error", "Please start a new visit.");
          return;
        }

        const payload = {
          remark: values.remark.trim(),
          visit_purpose: values.visit_purpose,
        };

        console.log("Visit End", payload);

        const response = await apiClient.patch(
          `track/end-visit/${visitId}/`,
          payload,
          { signal: abortControllerRef.current.signal }
        );

        if (!(response.status === 200 || response.status === 204)) {
          Alert.alert("Error", "Failed to end visit. Please try again.");
          return;
        }

        // Clear form & reset visit storage
        resetForm();
        await storage.remove(storageKey);
        await storage.remove(storageKey.replace("VISIT", "START"));

        navigation.reset({
          index: 1,
          routes: [{ name: "Dashboard" }, { name: navigateTo }],
        });

        showToast.success("Visit ended successfully.", "Success", "top", 2000);

      } catch (error) {
        if (error.name === "AbortError") return;

        if (__DEV__) logger.error("Visit end error:", error);

        if (error?.response?.status === 401) {
          Alert.alert("Session Expired", "Please log in again.");
          return;
        }

        Alert.alert("Error", "Something went wrong. Please try again later.");
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    },
    [loading, storageKey, navigateTo]
  );


  const [purposes, setPurposes] = useState([]);
  const [openPurpose, setOpenPurpose] = useState(false);

  useEffect(() => {
    const fetchPurposes = async () => {
      try {
        const url = storageKey.includes("Dealer")
          ? "/track/dealer-visit-purposes/"
          : "/track/farmer-visit-purposes/";

        const response = await apiClient.get(url);
        if (response.data?.purposes) setPurposes(response.data.purposes);
      } catch (err) {
        Alert.alert("Error", "Failed to load visit purposes");
      }
    };
    fetchPurposes();
  }, []);

  return (
    <View style={modernStyles.container}>
      <View style={modernStyles.formContainer}>
        <AppForm
          initialValues={{ remark: "", visit_purpose: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue, errors, touched }) => (
            <>
              <View style={modernStyles.inputSection}>
                <Text style={modernStyles.inputLabel}>Visit Purpose</Text>

                <AppDropDownPicker
                  open={openPurpose}
                  setOpen={setOpenPurpose}
                  items={purposes}
                  value={values.visit_purpose}
                  setValue={(val) => setFieldValue("visit_purpose", val)}
                  placeholder="Select visit purpose"
                  searchable={false}
                  maxHeight={180}
                  zIndex={3000}
                  error={touched.visit_purpose && errors.visit_purpose}
                />
              </View>


              <View style={[modernStyles.inputSection, { marginBottom: DESIGN.spacing.sm }]}>
                <Text style={modernStyles.inputLabel}>Visit Remarks</Text>

                <InputFormField
                  name="remark"
                  placeholder="Enter your remarks about this visit..."
                  multiline
                  numberOfLines={4}
                  style={modernStyles.remarkInput}
                />
              </View>

              <View style={modernStyles.submitSection}>
                <SubmitButton
                  title={loading ? "Completing..." : "Complete Visit"}
                />

              </View>
            </>
          )}
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
  },
  formContainer: {
    padding: DESIGN.spacing.md,
  },

  inputLabel: {
    ...DESIGN.typography.subtitle,
    color: DESIGN.colors.textPrimary,
  },
  remarkInput: {
    minHeight: 50,
    backgroundColor: DESIGN.colors.background,
    borderColor: DESIGN.colors.border,
  },
  submitSection: {
    marginTop: DESIGN.spacing.sm,
  },

});

export default VisitForm;
