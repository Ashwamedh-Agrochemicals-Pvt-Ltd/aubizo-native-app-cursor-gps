import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Formik } from "formik";
import { useState, useRef, useCallback, useMemo } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from "../../api/client";
import { DealerSchema } from "../../validations/DealerSchema";
import useMasterData from "../../hooks/useMasterData";
import DESIGN from "../../theme";
import AppDropDownPicker from "../form/appComponents/AppDropDownPicker";
import InputFormField from "../form/appComponents/InputFormText";
import OTPModal from "./OTPModal";
import logger from "../../utility/logger";
import LocationService from "../../utility/location";

function DealerForm({ location, stateDealerForm }) {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef(null);

  const { states, districts, talukas, loadStates, loadDistricts, loadTalukas } =
    useMasterData();

  const [phoneForOTP, setPhoneForOTP] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [dropdowns, setDropdowns] = useState({
    state: false,
    district: false,
    taluka: false,
    agreement: false,
  });

  const [formState, setFormState] = useState({
    state: null,
    district: null,
    taluka: null,
    agreement: null,
  });

  // OTP related states
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [createdDealerId, setCreatedDealerId] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);

  // React Query mutations
  const createDealerMutation = useMutation({
    mutationFn: async (payload) => {
      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      const response = await apiClient.post('dealer/create/', payload, {
        signal: abortControllerRef.current.signal,
        timeout: 0, // 10 second timeout
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      const dealerId = data?.id ?? data?.dealer_id ?? null;
      setCreatedDealerId(dealerId);

      if (__DEV__) {
        logger.info('Dealer created successfully:', { dealerId });
      }

      // Send OTP after successful creation with the current phone
      sendOTPMutation.mutate({ dealerId, phone: variables.phone });
    },
    onError: (error) => {
      if (error.name === 'AbortError') {
        // Request was cancelled, do nothing
        return;
      }

      if (__DEV__) {
        logger.error('Error creating dealer:', error);
      }

      if (error.response?.status === 401) {
        Alert.alert("Session Expired", "Please log in again.");
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

      if (error.response?.status >= 400 && error.response?.status < 500) {
        const errorMessage = error.response?.data?.detail || error.response?.data?.message || "Please fix the highlighted fields.";
        Alert.alert("Validation Error", errorMessage);
        return;
      }

      if (error.response?.status >= 500) {
        Alert.alert("Server Error", "Something went wrong. Please try again later.");
        return;
      }

      Alert.alert("Error", "Failed to create dealer. Please try again.");
    },
  });

  const sendOTPMutation = useMutation({
    mutationFn: async ({ dealerId, phone }) => {
      if (!abortControllerRef.current) {
        abortControllerRef.current = new AbortController();
      }

      if (phone) {
        const payload = { phone: phone.trim() };
        const resp = await apiClient.patch(
          `dealer/${dealerId}/`,
          payload,
          { signal: abortControllerRef.current.signal }
        );
        if (resp?.data?.phone) {
          setPhoneForOTP(resp.data.phone);
        }

      }

      await apiClient.post(`dealer/${dealerId}/send-otp/`, {}, {
        signal: abortControllerRef.current.signal,
        timeout: 10000, // 10 second timeout
      });
    },
    onSuccess: () => {
      setOtpModalVisible(true);
      if (__DEV__) {
        logger.info('OTP sent successfully');
      }
    },
    onError: (error) => {
      if (error.name === 'AbortError') {
        return;
      }
      if (__DEV__) {
        logger.error('Error sending OTP:', error);
      }
      setOtpModalVisible(true);
      Alert.alert("OTP Error", "Failed to send OTP. You can try resending from the modal.");
    },
  });


  // Get current location with proper error handling
  const getCurrentLocation = useCallback(async () => {
    const startTime = Date.now();
    if (__DEV__) console.log("🏪 [DealerForm] Starting getCurrentLocation...");

    try {
      const locationDetails = await LocationService.getCurrentLocationDetails();

      if (!locationDetails || !locationDetails.latitude) {
        return null;
      }

      const totalTime = Date.now() - startTime;
      if (__DEV__) {
        console.log(`🏪 [DealerForm] getCurrentLocation success in ${totalTime}ms`);
      }

      return {
        latitude: locationDetails.latitude,
        longitude: locationDetails.longitude,
        address: locationDetails.address,
      };
    } catch (error) {
      const totalTime = Date.now() - startTime;
      if (__DEV__) {
        console.error(`🏪 [DealerForm] getCurrentLocation failed after ${totalTime}ms:`, error.message);
      }
      return null;
    }
  }, []);
  const handleSubmit = useCallback(async (values) => {

    if (__DEV__) {
      console.log("🏪 [DealerForm] Starting handleSubmit...");
    }
    // Prevent double submission
    if (isSubmitting || createDealerMutation.isPending && sendOTPMutation.isPending) {
      return;
    }
      setIsSubmitting(true);
    // --- Case 1: Dealer already exists → Only resend OTP ---
    if (createdDealerId) {
      sendOTPMutation.mutate({ dealerId: createdDealerId, phone: values.phone },
        { onSettled: () => setIsSubmitting(false) } 
      );
      return;
    }
    // --- Case 2: First time dealer creation ---
    const { state, district, taluka } = formState;

    // Get location data
    const locationStart = Date.now();
    const locationData = await getCurrentLocation();
    const locationTime = Date.now() - locationStart;

    if (__DEV__) {
      console.log(`🏪 [DealerForm] Location acquisition in handleSubmit took: ${locationTime}ms`);
    }

    const payload = {
      shop_name: values.shop_name.trim(),
      owner_name: values.owner_name.trim(),
      phone: values.phone.trim(),
      gst_number: values.gst_number ? values.gst_number.trim() : "NA",
      remark: values.remark ? values.remark.trim() : "",
      agreement_status: values.agreement_status,
      billing_address: (location || "").trim(),
      shipping_address: (location || "").trim(),
      state_id: state,
      district_id: district,
      taluka_id: taluka,
      latitude: locationData?.latitude ? Number(locationData.latitude.toFixed(6)) : null,
      longitude: locationData?.longitude ? Number(locationData.longitude.toFixed(6)) : null,
    };



    const startTime = Date.now();
    setPhoneForOTP(payload.phone);
    createDealerMutation.mutate(payload,
      {
      onSettled: () => setIsSubmitting(false)
    });

    const totalTime = Date.now() - startTime;
    if (__DEV__) {
      console.log(`🏪 [DealerForm] handleSubmit total time: ${totalTime}ms`);
    }
  }, [isSubmitting,createdDealerId, formState, location, getCurrentLocation, createDealerMutation, sendOTPMutation]);

  // Cleanup on unmount

  // Memoized form data for FlatList
  const formData = useMemo(() => [{ key: "form" }], []);

  // Memoized render item for FlatList
  const renderFormItem = useCallback(() => (
    <View style={modernStyles.formWrapper}>
      <Formik
        initialValues={{
          shop_name: "",
          owner_name: "",
          phone: "",
          gst_number: "",
          state: "",
          remark: "",
          agreement_status: "active",
        }}
        validationSchema={DealerSchema}
        onSubmit={handleSubmit}
        validateOnChange={true}
        validateOnBlur={true}
      >
        {({ values, handleSubmit, setFieldValue, dirty }) => {
          const canSubmit = dirty && !createDealerMutation.isPending && !sendOTPMutation.isPending;

          return (
            <View style={modernStyles.formContent}>
              {/* Business Information */}
              <View style={modernStyles.section}>
                <View style={modernStyles.sectionHeader}>
                  <MaterialCommunityIcons
                    name="storefront"
                    size={20}
                    color={DESIGN.colors.primary}
                  />
                  <Text style={modernStyles.sectionTitle}>
                    Business Information
                  </Text>
                </View>

                <View style={modernStyles.inputContainer}>
                  <InputFormField
                    name="shop_name"
                    placeholder="Shop Name *"
                    accessibilityLabel="Shop name input"
                    accessibilityHint="Enter the shop name"
                  />
                </View>

                <View style={modernStyles.inputContainer}>
                  <InputFormField
                    name="owner_name"
                    placeholder="Owner Name *"
                    accessibilityLabel="Owner name input"
                    accessibilityHint="Enter the owner's name"
                  />
                </View>

                <View style={modernStyles.inputContainer}>
                  <InputFormField
                    name="phone"
                    placeholder="Phone *"
                    keyboardType="phone-pad"
                    maxLength={10}
                    accessibilityLabel="Phone number input"
                    accessibilityHint="Enter 10-digit phone number"
                  />
                </View>

                <View style={modernStyles.inputContainer}>
                  <InputFormField
                    name="gst_number"
                    placeholder="GST Number"
                    accessibilityLabel="GST number input"
                    accessibilityHint="Enter GST number (optional)"
                  />
                </View>
              </View>

              {/* Location Information */}
              <View style={modernStyles.section}>
                <View style={modernStyles.sectionHeader}>
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={20}
                    color={DESIGN.colors.primary}
                  />
                  <Text style={modernStyles.sectionTitle}>
                    Location Information
                  </Text>
                </View>

                <View style={modernStyles.inputContainer}>
                  <InputFormField
                    name="location"
                    externalValue={location}
                    placeholder={locationPermission === 'denied' ? "Location access denied" : "Fetching current location..."}
                    editable={false}
                    multiline
                    style={modernStyles.locationInput}
                    errorstyle={modernStyles.error}
                    accessibilityLabel="Location display"
                    accessibilityHint="Shows the current location"
                  />
                </View>

                {/* State */}
                <View style={modernStyles.dropdownContainer}>
                  <AppDropDownPicker
                    open={dropdowns.state}
                    value={formState.state}
                    items={states}
                    setOpen={async (open) => {
                      setDropdowns((prev) => ({
                        ...prev,
                        state: open,
                        district: false,
                        taluka: false,
                        agreement: false,
                      }));
                      if (open && states.length === 0) await loadStates();
                    }}
                    setValue={(callback) =>
                      setFormState((prev) => ({
                        ...prev,
                        state: callback(prev.state),
                        district: null, // Reset dependent fields
                        taluka: null,
                      }))
                    }
                    placeholder="Select State *"
                    searchable={true}
                    searchablePlaceholder="Search State"
                    searchableError={() => "State not found"}
                    listMode="SCROLLVIEW"
                    maxHeight={200}
                    zIndex={1000}
                    elevation={1000}
                    accessibilityLabel="State selection dropdown"
                  />
                </View>

                {/* District */}
                <View style={modernStyles.dropdownContainer}>
                  <AppDropDownPicker
                    open={dropdowns.district}
                    value={formState.district}
                    items={districts}
                    setOpen={async (open) => {
                      setDropdowns((prev) => ({
                        ...prev,
                        district: open,
                        taluka: false,
                        state: false,
                        agreement: false,
                      }));
                      if (open && formState.state && districts.length === 0) {
                        await loadDistricts(formState.state);
                      }
                    }}
                    setValue={(callback) =>
                      setFormState((prev) => ({
                        ...prev,
                        district: callback(prev.district),
                        taluka: null, // Reset dependent field
                      }))
                    }
                    name={formState.district}
                    placeholder="Select District *"
                    searchable={true}
                    searchablePlaceholder="Search District"
                    listMode="SCROLLVIEW"
                    maxHeight={200}
                    searchableError={() => "District not found"}
                    zIndex={900}
                    elevation={900}
                    accessibilityLabel="District selection dropdown"
                  />
                </View>

                {/* Taluka */}
                <View style={[modernStyles.dropdownContainer]}>
                  <AppDropDownPicker
                    open={dropdowns.taluka}
                    value={formState.taluka}
                    items={talukas}
                    setOpen={async (open) => {
                      setDropdowns((prev) => ({
                        ...prev,
                        taluka: open,
                        district: false,
                        state: false,
                        agreement: false,
                      }));
                      if (open && formState.district && talukas.length === 0)
                        await loadTalukas(formState.district);
                    }}
                    setValue={(callback) =>
                      setFormState((prev) => ({ ...prev, taluka: callback(prev.taluka) }))
                    }
                    placeholder="Select Taluka *"
                    searchable
                    searchablePlaceholder="Search Taluka"
                    listMode="SCROLLVIEW"
                    maxHeight={200}
                    searchableError={() => "Taluka not found"}
                    zIndex={800}
                    accessibilityLabel="Taluka selection dropdown"
                  />
                </View>
              </View>

              {/* Agreement & Additional Information */}
              <View style={modernStyles.section}>
                <View style={modernStyles.sectionHeader}>
                  <MaterialCommunityIcons
                    name="file-document"
                    size={20}
                    color={DESIGN.colors.primary}
                  />
                  <Text style={modernStyles.sectionTitle}>
                    Agreement & Additional Information
                  </Text>
                </View>

                <View style={modernStyles.dropdownContainer}>
                  <Text style={modernStyles.fieldLabel}>Agreement Status</Text>
                  <AppDropDownPicker
                    open={dropdowns.agreement}
                    value={values.agreement_status}
                    items={[
                      { label: "Active", value: "active" },
                      { label: "Inactive", value: "inactive" },
                    ]}
                    setOpen={(open) =>
                      setDropdowns((prev) => ({
                        ...prev,
                        agreement: open,
                        state: false,
                        district: false,
                        taluka: false,
                      }))
                    }
                    setValue={(callback) =>
                      setFieldValue("agreement_status", callback(values.agreement_status))
                    }
                    placeholder="Agreement Status"
                    zIndex={700}
                    accessibilityLabel="Agreement status selection dropdown"
                  />
                </View>

                <View style={modernStyles.inputContainer}>
                  <InputFormField
                    name="remark"
                    placeholder="Remark *"
                    multiline
                    numberOfLines={3}
                    accessibilityLabel="Remark input"
                    accessibilityHint="Enter additional remarks about the dealer"
                  />
                </View>
              </View>

              {/* Submit Button */}
              <View style={modernStyles.submitContainer}>
                <TouchableOpacity
                  style={[
                    modernStyles.submitButton,
                    !canSubmit && modernStyles.submitButtonDisabled
                  ]}
                  onPress={handleSubmit}
                  disabled={!canSubmit}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={createdDealerId ? "Resend OTP" : "Generate OTP"}
                  accessibilityHint="Submits the dealer form"
                  accessibilityState={{ disabled: !canSubmit }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {isSubmitting || createDealerMutation.isPending || sendOTPMutation.isPending ? (
                    <ActivityIndicator size="small" color={DESIGN.colors.surface} />
                  ) : (
                    <>
                      <Text style={modernStyles.submitButtonText}>
                        {createdDealerId ? "Resend OTP" : "Generate OTP"}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      </Formik>
    </View>
  ), [dropdowns, formState, states, districts, talukas, loadStates, loadDistricts, loadTalukas, handleSubmit, location, locationPermission, createdDealerId, createDealerMutation.isPending, sendOTPMutation.isPending]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <FlatList
        data={formData}
        keyExtractor={(item) => item.key}
        renderItem={renderFormItem}
        contentContainerStyle={modernStyles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        initialNumToRender={1}
        windowSize={3}
        bounces={false}
      />

      <OTPModal
        visible={otpModalVisible}
        dealerId={createdDealerId}
        onClose={() => setOtpModalVisible(false)}
        phone={phoneForOTP}
        onVerified={() => {
          setOtpModalVisible(false);
          stateDealerForm(false);
          setCreatedDealerId(null);

          // Invalidate related queries
          queryClient.invalidateQueries({ queryKey: ['dealers'] });
          queryClient.invalidateQueries({ queryKey: ['nearby-dealers'] });
        }}
      />
    </KeyboardAvoidingView>
  );
}

const modernStyles = StyleSheet.create({
  container: {
    paddingBottom: 80,
  },
  formWrapper: {
    backgroundColor: DESIGN.colors.surface,
    margin: DESIGN.spacing.lg,
    borderRadius: DESIGN.borderRadius.lg,
    ...DESIGN.shadows.medium,
    overflow: "hidden",
  },
  formContent: {
    padding: DESIGN.spacing.md,
  },
  section: {
    marginBottom: DESIGN.spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: DESIGN.spacing.md,
    paddingBottom: DESIGN.spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: DESIGN.colors.accent,
  },
  sectionTitle: {
    ...DESIGN.typography.subtitle,
    color: DESIGN.colors.textPrimary,
    marginLeft: DESIGN.spacing.sm,
  },
  inputContainer: {
    marginBottom: DESIGN.spacing.md,
  },
  locationInput: {
    backgroundColor: DESIGN.colors.surfaceElevated,
    borderColor: DESIGN.colors.borderLight,
    fontStyle: "italic",
    color: DESIGN.colors.textSecondary,
  },
  dropdownContainer: {
    marginBottom: DESIGN.spacing.sm,
    position: "relative",
  },
  fieldLabel: {
    ...DESIGN.typography.label,
    color: DESIGN.colors.textPrimary,
    marginBottom: DESIGN.spacing.sm,
  },
  error: {
    ...DESIGN.typography.caption,
    color: DESIGN.colors.error,
    marginTop: DESIGN.spacing.xs,
  },
  submitContainer: {
    marginTop: DESIGN.spacing.lg,
  },
  submitButton: {
    backgroundColor: DESIGN.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: DESIGN.spacing.md,
    borderRadius: DESIGN.borderRadius.md,
    ...DESIGN.shadows.medium,
    minHeight: 44, // Accessibility minimum touch target
  },
  submitButtonDisabled: {
    backgroundColor: DESIGN.colors.textTertiary,
    opacity: 0.6,
  },
  submitButtonText: {
    ...DESIGN.typography.subtitle,
    color: DESIGN.colors.surface,
    marginLeft: DESIGN.spacing.sm,
  },
});

export default DealerForm;
