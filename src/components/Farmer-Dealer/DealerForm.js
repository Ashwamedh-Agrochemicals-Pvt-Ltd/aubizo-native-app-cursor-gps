import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Formik } from "formik";
import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
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
import apiClient from "../../api/client";
import { DealerSchema } from "../../validations/DealerSchema";
import useMasterData from "../../hooks/useMasterData";
import DESIGN from "../../theme";
import AppDropDownPicker from "../form/appComponents/AppDropDownPicker";
import InputFormField from "../form/appComponents/InputFormText";
import OTPModal from "./OTPModal";
import logger from "../../utility/logger";
import LocationService from "../../utility/location";
import showToast from "../../utility/showToast";

function DealerForm({ location, stateDealerForm, setfetchDealer }) {
  const abortControllerRef = useRef(null);

  const { states, districts, talukas, loadStates, loadDistricts, loadTalukas } =
    useMasterData();

  const [phoneForOTP, setPhoneForOTP] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAutoFilled, setHasAutoFilled] = useState(false);


  const [dropdowns, setDropdowns] = useState({
    state: false,
    district: false,
    taluka: false,
    secondaryPhoneRelation: false,
  });

  const [formState, setFormState] = useState({
    state: null,
    district: null,
    taluka: null,
    secondaryPhoneRelation: null,
  });

  // Progressive form visibility states
  const [showSecondaryPhone, setShowSecondaryPhone] = useState(false);
  const [showPanGst, setShowPanGst] = useState(false);
  const [showLocation, setShowLocation] = useState(false);

  // Form values state to track changes
  const [formValues, setFormValues] = useState({
    phone: '',
    secondaryPhone: '',
    secondary_phone_relation: ''
  });

  // OTP related states
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [createdDealerId, setCreatedDealerId] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);

  // Loading states
  const [isCreatingDealer, setIsCreatingDealer] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);

  // Progressive form visibility effects
  // Show secondary phone after valid primary phone
  useEffect(() => {
    const length = formValues.phone.trim().length;

    if (length === 10) {
      if (!showSecondaryPhone) setShowSecondaryPhone(true);
      if (!showPanGst) setShowPanGst(true);
    } else {
      if (showSecondaryPhone) setShowSecondaryPhone(false);
      if (showPanGst) setShowPanGst(false);
    }
  }, [formValues.phone, showSecondaryPhone, showPanGst]);



  // Show location after PAN/GST section
  useEffect(() => {
    if (showPanGst && !showLocation) {
      setShowLocation(true);
    }
  }, [showPanGst, showLocation]);



  // Add a new state to track the location data to auto-fill
  const [pendingAutoFill, setPendingAutoFill] = useState(null);

  // First effect: Fetch location once
  useEffect(() => {
    let isMounted = true;

    const fetchLocationOnce = async () => {
      if (pendingAutoFill || !isMounted) return;

      try {
        console.log("🔄 Fetching location...");
        const result = await LocationService.getCurrentLocationDetails();
        console.log("📍 Location fetched result:", result);

        if (!isMounted) return;

        if (result?.googleResults) {

          // 👉 BEST RESULT FINDER (paste here)
          const best =
            result.googleResults.find((r) =>
              r.address_components.some((c) =>
                c.types.includes("administrative_area_level_4")
              )
            ) || result.googleResults[0];

          console.log("🌎 Google BEST result:", best);

          const get = (type) =>
            best.address_components.find((c) => c.types.includes(type))?.long_name || null;

          const autoFillData = {
            stateName: get("administrative_area_level_1"),
            districtName: get("administrative_area_level_3"),
            talukaName:
              get("administrative_area_level_4") ||
              get("locality") ||
              get("sublocality") ||
              null,
          };

          console.log("📌 Pending auto-fill data:", autoFillData);
          setPendingAutoFill(autoFillData);
        }
      } catch (error) {
        console.log("❌ Auto location failed:", error);
      }
    };

    fetchLocationOnce();

    return () => {
      isMounted = false;
    };
  }, []);


  // Second effect: Auto-fill state when data is ready
  useEffect(() => {
    console.log("👀 State effect triggered", { pendingAutoFill, hasAutoFilled });

    if (!pendingAutoFill || !pendingAutoFill.stateName || hasAutoFilled) return;

    const fillState = async () => {
      console.log("➡️ Filling State...");
      console.log("Current States:", states);

      if (states.length === 0) {
        console.log("⏳ Loading states first...");
        await loadStates();
        return;
      }

      const stateItem = states.find((s) => {
        const label = s.label || s.name;
        return label.toLowerCase().includes(pendingAutoFill.stateName.toLowerCase());
      });

      console.log("🧾 Matched State Item:", stateItem);

      if (stateItem) {
        const stateValue = stateItem.value || stateItem.id;
        console.log("✔ Setting State:", stateValue);
        setFormState((prev) => ({ ...prev, state: stateValue, district: null, taluka: null }));
        await loadDistricts(stateValue);
      }
    };

    fillState();
  }, [pendingAutoFill, states, hasAutoFilled]);

  // Third effect: Auto-fill district when districts are loaded
  useEffect(() => {
    console.log("👀 District effect triggered", { pendingAutoFill, districts, formState });

    if (!pendingAutoFill || !pendingAutoFill.districtName || !formState.state || hasAutoFilled)
      return;

    if (districts.length === 0) return;

    const districtItem = districts.find((d) => {
      const label = d.label || d.name;
      return label.toLowerCase().includes(pendingAutoFill.districtName.toLowerCase());
    });

    console.log("🧾 Matched District Item:", districtItem);

    if (districtItem) {
      const districtValue = districtItem.value || districtItem.id;
      console.log("✔ Setting District:", districtValue);
      setFormState((prev) => ({ ...prev, district: districtValue, taluka: null }));
      loadTalukas(districtValue);
    }
  }, [pendingAutoFill, formState.state, districts, hasAutoFilled]);

  // Fourth effect: Auto-fill taluka when talukas are loaded
  useEffect(() => {
    console.log("👀 Taluka effect triggered", { pendingAutoFill, talukas, formState });

    if (!pendingAutoFill || !pendingAutoFill.talukaName || !formState.district || hasAutoFilled)
      return;

    if (talukas.length === 0) return;

    const talukaItem = talukas.find((t) => {
      const label = t.label || t.name;
      return label.toLowerCase().includes(pendingAutoFill.talukaName.toLowerCase());
    });

    console.log("🧾 Matched Taluka Item:", talukaItem);

    if (talukaItem) {
      const talukaValue = talukaItem.value || talukaItem.id;
      console.log("✔ Setting Taluka:", talukaValue);

      setFormState((prev) => ({ ...prev, taluka: talukaValue }));
      setHasAutoFilled(true);
      setPendingAutoFill(null);

      console.log("🎉 Auto-fill completed!");
    }
  }, [pendingAutoFill, formState.district, talukas, hasAutoFilled]);


  // Remove the old autoFillLocation callback and its effect

  /**
   * Create dealer and handle success/error states
   */
  const createDealer = async (payload) => {
    try {
      setIsCreatingDealer(true);

      abortControllerRef.current = new AbortController();

      const response = await apiClient.post('dealer/', payload, {
        signal: abortControllerRef.current.signal,
        timeout: 0,
      });

      console.log("Dealer Response:", response.data);

      const dealerId = response.data?.id ?? response.data?.dealer_id ?? null;
      setCreatedDealerId(dealerId);

      if (__DEV__) {
        logger.info('Dealer created successfully:', { dealerId });
      }

      await sendOTP({ dealerId, phone: payload.phone });

    } catch (error) {
      if (error.name === 'AbortError') {
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
    } finally {
      setIsCreatingDealer(false);
    }
  };

  /**
   * Send OTP to dealer and handle success/error states
   */
  const sendOTP = async ({ dealerId, phone }) => {
    try {
      setIsSendingOTP(true);

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
        timeout: 10000,
      });

      setOtpModalVisible(true);
      if (__DEV__) {
        logger.info('OTP sent successfully');
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        return;
      }

      if (__DEV__) {
        logger.error('Error sending OTP:', error);
      }

      setOtpModalVisible(true);
      Alert.alert("OTP Error", "Failed to send OTP. You can try resending from the modal.");
    } finally {
      setIsSendingOTP(false);
    }
  };

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

    if (isSubmitting || isCreatingDealer || isSendingOTP) {
      return;
    }
    setIsSubmitting(true);

    try {
      if (createdDealerId) {
        await sendOTP({ dealerId: createdDealerId, phone: values.phone });
        return;
      }

      const { state, district, taluka } = formState;

      const locationStart = Date.now();
      const locationData = await getCurrentLocation();
      const locationTime = Date.now() - locationStart;

      if (__DEV__) {
        console.log(`🏪 [DealerForm] Location acquisition in handleSubmit took: ${locationTime}ms`);
      }

      // Build payload with conditional secondary phone relation
      const payload = {
        shop_name: values.shop_name.trim(),
        owner_name: values.owner_name.trim(),
        phone: values.phone.trim(),
        secondary_phone: values.secondaryPhone ? values.secondaryPhone.trim() : "NA",
        secondary_phone_relation: values.secondary_phone_relation,
        pan_number: values.pan_number ? values.pan_number.trim() : "NA",
        gst_number: values.gst_number ? values.gst_number.trim() : "NA",
        billing_address: (location || "").trim(),
        shipping_address: (location || "").trim(),
        state_id: state,
        district_id: district,
        taluka_id: taluka,
        latitude: locationData?.latitude ? Number(locationData.latitude.toFixed(6)) : null,
        longitude: locationData?.longitude ? Number(locationData.longitude.toFixed(6)) : null,
      };

      // Only add secondary_phone_relation if secondary phone is provided
      if (values.secondaryPhone && values.secondaryPhone.trim()) {
        payload.secondary_phone_relation = values.secondary_phone_relation;
      }

      console.log("Dealer Payload:", payload);
      const startTime = Date.now();
      setPhoneForOTP(payload.phone);
      await createDealer(payload);

      const totalTime = Date.now() - startTime;
      if (__DEV__) {
        console.log(`🏪 [DealerForm] handleSubmit total time: ${totalTime}ms`);
      }
    } catch (error) {
      if (__DEV__) {
        logger.error('Error in handleSubmit:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, createdDealerId, formState, location, getCurrentLocation, isCreatingDealer, isSendingOTP]);

  const formData = useMemo(() => [{ key: "form" }], []);

  const renderFormItem = useCallback(() => (
    <View style={modernStyles.formWrapper}>
      <Formik
        initialValues={{
          owner_name: "",
          shop_name: "",
          phone: "",
          secondaryPhone: "",
          pan_number: "",
          gst_number: "",
          state: "",
          secondary_phone_relation: "",
        }}
        validationSchema={DealerSchema}
        onSubmit={handleSubmit}
        validateOnChange={true}
        validateOnBlur={true}
      >
        {({ values, handleSubmit, setFieldValue, isValid }) => {
          // Update form values state for useEffect tracking (without causing re-render)
          React.useEffect(() => {
            // Update local form values
            setFormValues({
              phone: values.phone,
              secondaryPhone: values.secondaryPhone,
              secondary_phone_relation: values.secondary_phone_relation,
            });

            // Reset relation type when secondary phone is cleared
            if (values.secondaryPhone.trim().length <= 9 && values.secondary_phone_relation) {
              setFieldValue("secondary_phone_relation", "");
            }
          }, [
            values.phone,
            values.secondaryPhone,
            values.secondary_phone_relation,
          ]);


          // Location fields validation (not in schema since they're in formState)
          const locationFieldsValid = formState.state && formState.district && formState.taluka;

          // Form can be submitted when:
          // 1. Formik validation passes (isValid)
          // 2. Location fields are selected
          // 3. Not currently processing
          const canSubmit = isValid && locationFieldsValid && !isCreatingDealer && !isSendingOTP;

          return (
            <View style={modernStyles.formContent}>
              {/* Basic Information */}
              <View style={modernStyles.section}>
                <View style={modernStyles.sectionHeader}>
                  <MaterialCommunityIcons
                    name="account"
                    size={22}
                    color={DESIGN.colors.primary}
                  />
                  <Text style={modernStyles.sectionTitle}>
                    Dealer Information
                  </Text>
                </View>

                <View style={modernStyles.inputContainer}>
                  <Text style={modernStyles.fieldLabel}>Dealer Name *</Text>
                  <InputFormField
                    name="owner_name"
                    placeholder="Enter dealer name"
                    placeholderTextColor="#999"
                    accessibilityLabel="Dealer name input"
                    accessibilityHint="Enter the dealer's name"
                  />
                </View>

                <View style={modernStyles.inputContainer}>
                  <Text style={modernStyles.fieldLabel}>Shop Name *</Text>
                  <InputFormField
                    name="shop_name"
                    placeholder="Enter shop name"
                    placeholderTextColor="#999"
                    accessibilityLabel="Shop name input"
                    accessibilityHint="Enter the shop name"
                  />
                </View>

                <View style={modernStyles.inputContainer}>
                  <Text style={modernStyles.fieldLabel}>Phone Number *</Text>
                  <InputFormField
                    name="phone"
                    placeholder="Enter 10-digit phone number"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                    maxLength={10}
                    accessibilityLabel="Phone number input"
                    accessibilityHint="Enter 10-digit phone number"
                  />
                </View>
              </View>

              {/* Secondary Phone - Shows after primary phone is valid */}
              {showSecondaryPhone && (
                <View style={modernStyles.section}>
                  <View style={modernStyles.sectionHeader}>
                    <MaterialCommunityIcons
                      name="phone-plus"
                      size={22}
                      color={DESIGN.colors.secondary}
                    />
                    <Text style={modernStyles.sectionTitle}>
                      Secondary Contact
                    </Text>
                  </View>

                  <View style={modernStyles.inputContainer}>
                    <Text style={modernStyles.fieldLabel}>Secondary Phone *</Text>
                    <InputFormField
                      name="secondaryPhone"
                      placeholder="Enter secondary phone"
                      placeholderTextColor="#999"
                      keyboardType="phone-pad"
                      maxLength={10}
                      accessibilityLabel="Secondary phone number input"
                      accessibilityHint="Enter 10-digit secondary phone number"
                    />
                  </View>

                  {values.secondaryPhone.trim().length === 10 && (
                    <View style={modernStyles.dropdownContainer}>
                      <Text style={modernStyles.fieldLabel}>Relation Type *</Text>
                      <AppDropDownPicker
                        open={dropdowns.secondaryPhoneRelation}
                        value={values.secondary_phone_relation}
                        items={[
                          { label: "Owner", value: "owner" },
                          { label: "Office/Shop", value: "office" },
                          { label: "Spouse", value: "spouse" },
                          { label: "Father", value: "father" },
                          { label: "Son", value: "son" },
                          { label: "Relatives", value: "relatives" },
                        ]}
                        setOpen={(open) =>
                          setDropdowns((prev) => ({
                            ...prev,
                            secondaryPhoneRelation: open,
                            state: false,
                            district: false,
                            taluka: false,
                          }))
                        }
                        setValue={(callback) =>
                          setFieldValue("secondary_phone_relation", callback(values.secondary_phone_relation))
                        }
                        placeholder="Select relation type"
                        zIndex={1200}
                        accessibilityLabel="Secondary phone relation selection dropdown"
                      />
                    </View>
                  )}

                </View>
              )}

              {/* PAN & GST - Shows after secondary phone is handled */}
              {showPanGst && (
                <View style={modernStyles.section}>
                  <View style={modernStyles.sectionHeader}>
                    <MaterialCommunityIcons
                      name="file-document-outline"
                      size={22}
                      color={DESIGN.colors.accent}
                    />
                    <Text style={modernStyles.sectionTitle}>
                      Tax Information (Optional)
                    </Text>
                  </View>

                  <View style={modernStyles.inputContainer}>
                    <Text style={modernStyles.fieldLabel}>PAN Number</Text>
                    <InputFormField
                      name="pan_number"
                      placeholder="Enter PAN number (optional)"
                      placeholderTextColor="#999"
                      accessibilityLabel="PAN number input"
                      accessibilityHint="Enter PAN number (optional)"
                      autoCapitalize="characters"
                    />
                  </View>

                  <View style={modernStyles.inputContainer}>
                    <Text style={modernStyles.fieldLabel}>GST Number</Text>
                    <InputFormField
                      name="gst_number"
                      placeholder="Enter GST number (optional)"
                      placeholderTextColor="#999"
                      accessibilityLabel="GST number input"
                      accessibilityHint="Enter GST number (optional)"
                      autoCapitalize="characters"
                    />
                  </View>
                </View>
              )}

              {/* Location Information - Shows after PAN/GST */}
              {showLocation && (
                <View style={modernStyles.section}>
                  <View style={modernStyles.sectionHeader}>
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={22}
                      color={DESIGN.colors.primary}
                    />
                    <Text style={modernStyles.sectionTitle}>
                      Location Details
                    </Text>
                  </View>

                  <View style={modernStyles.inputContainer}>
                    <Text style={modernStyles.fieldLabel}>Current Location</Text>
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

                  <View style={modernStyles.dropdownContainer}>
                    <Text style={modernStyles.fieldLabel}>State *</Text>
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
                          secondaryPhoneRelation: false,
                        }));
                        if (open && states.length === 0) await loadStates();
                      }}
                      setValue={(callback) => {
                        const newState = callback(formState.state);
                        setFormState((prev) => ({
                          ...prev,
                          state: newState,
                          district: null,
                          taluka: null,
                        }));
                        if (newState) {
                          loadDistricts(newState);
                        }
                      }}
                      placeholder="Select state"
                      searchable={true}
                      searchablePlaceholder="Search state"
                      searchableError={() => "State not found"}
                      listMode="SCROLLVIEW"
                      maxHeight={200}
                      zIndex={1100}
                      accessibilityLabel="State selection dropdown"
                    />
                  </View>

                  <View style={modernStyles.dropdownContainer}>
                    <Text style={modernStyles.fieldLabel}>District *</Text>
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
                          secondaryPhoneRelation: false,
                        }));
                        if (open && formState.state && districts.length === 0) {
                          await loadDistricts(formState.state);
                        }
                      }}
                      setValue={(callback) => {
                        const newDistrict = callback(formState.district);
                        setFormState((prev) => ({
                          ...prev,
                          district: newDistrict,
                          taluka: null,
                        }));
                        if (newDistrict) {
                          loadTalukas(newDistrict);
                        }
                      }}
                      name={formState.district}
                      placeholder="Select district"
                      searchable={true}
                      searchablePlaceholder="Search district"
                      listMode="SCROLLVIEW"
                      maxHeight={200}
                      searchableError={() => "District not found"}
                      zIndex={1000}
                      accessibilityLabel="District selection dropdown"
                    />
                  </View>

                  <View style={modernStyles.dropdownContainer}>
                    <Text style={modernStyles.fieldLabel}>Taluka *</Text>
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
                          secondaryPhoneRelation: false,
                        }));
                        if (open && formState.district && talukas.length === 0)
                          await loadTalukas(formState.district);
                      }}
                      setValue={(callback) =>
                        setFormState((prev) => ({ ...prev, taluka: callback(prev.taluka) }))
                      }
                      placeholder="Select taluka"
                      searchable
                      searchablePlaceholder="Search taluka"
                      listMode="SCROLLVIEW"
                      maxHeight={200}
                      searchableError={() => "Taluka not found"}
                      zIndex={900}
                      accessibilityLabel="Taluka selection dropdown"
                    />
                  </View>



                </View>
              )}


              {/* Submit Button */}
              {showPanGst && (
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
                    {isSubmitting || isCreatingDealer || isSendingOTP ? (
                      <View style={modernStyles.loadingContainer}>
                        <ActivityIndicator size="small" color={DESIGN.colors.surface} />
                        <Text style={modernStyles.submitButtonText}>Processing...</Text>
                      </View>
                    ) : (
                      <View style={modernStyles.buttonContent}>
                        <MaterialCommunityIcons
                          name={createdDealerId ? "refresh" : ""}
                          size={20}
                          color={DESIGN.colors.surface}
                        />
                        <Text style={modernStyles.submitButtonText}>
                          {createdDealerId ? "Resend OTP" : "Generate OTP"}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>

          );
        }}
      </Formik>
    </View>
  ), [
    dropdowns,
    formState,
    states,
    districts,
    talukas,
    loadStates,
    loadDistricts,
    loadTalukas,
    handleSubmit,
    location,
    locationPermission,
    createdDealerId,
    isCreatingDealer,
    isSendingOTP,
    showSecondaryPhone,
    showPanGst,
    showLocation,
  ]);

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
          showToast.success('OTP Verified and Dealer created successfully!', "Success", "top", 3000);
        }}
        setfetchDealer={setfetchDealer}
      />
    </KeyboardAvoidingView>
  );
}

const modernStyles = StyleSheet.create({
  container: {
    paddingBottom: DESIGN.spacing.xxxl,
  },
  formWrapper: {
    backgroundColor: DESIGN.colors.surface,
    marginHorizontal: DESIGN.spacing.xs,
    borderRadius: DESIGN.borderRadius.lg,
    // ...DESIGN.shadows.medium,
    overflow: "hidden",
  },
  formContent: {
    padding: DESIGN.spacing.md,
  },
  section: {
    marginBottom: DESIGN.spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: DESIGN.spacing.md,
    paddingBottom: DESIGN.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN.colors.borderLight,
  },
  sectionTitle: {
    ...DESIGN.typography.subtitle,
    color: DESIGN.colors.textPrimary,
    marginLeft: DESIGN.spacing.sm,
    fontWeight: "600",
  },
  fieldLabel: {
    ...DESIGN.typography.label,
    color: DESIGN.colors.textPrimary,
    marginBottom: DESIGN.spacing.xs,
    fontWeight: "500",
  },
  locationInput: {
    backgroundColor: DESIGN.colors.surfaceElevated,
    borderColor: DESIGN.colors.borderLight,
    fontStyle: "italic",
    color: DESIGN.colors.textSecondary,
    minHeight: 60,
  },
  textArea: {
    minHeight: 75,
    textAlignVertical: "top",
  },
  dropdownContainer: {
    // marginBottom: DESIGN.spacing.md,
    position: "relative",

  },
  error: {
    ...DESIGN.typography.caption,
    color: DESIGN.colors.error,

  },

  submitButton: {
    backgroundColor: DESIGN.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: DESIGN.spacing.md,
    borderRadius: DESIGN.borderRadius.md,
    ...DESIGN.shadows.medium,
    minHeight: 50,
  },
  submitButtonDisabled: {
    backgroundColor: DESIGN.colors.textTertiary,
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: DESIGN.spacing.sm,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: DESIGN.spacing.sm,
  },
  submitButtonText: {
    ...DESIGN.typography.subtitle,
    color: DESIGN.colors.surface,
    fontWeight: "600",
  },
});

export default DealerForm;