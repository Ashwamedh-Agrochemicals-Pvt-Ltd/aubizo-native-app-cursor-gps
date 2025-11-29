import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Formik } from "formik";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import apiClient from "../src/api/client";
import DESIGN from "../src/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import OTPModal from "../src/components/Farmer-Dealer/OTPModal";
import showToast from "../src/utility/showToast";
import AppDropDownPicker from "../src/components/form/appComponents/AppDropDownPicker";
import { DealerSchema } from "../src/validations/DealerSchema";
import InputFormField from "../src/components/form/appComponents/InputFormText";

const STATE_URL = process.env.EXPO_PUBLIC_STATE_URL;
const DISTRICT_URL = process.env.EXPO_PUBLIC_DISTRICT_URL;
const TALUKA_URL = process.env.EXPO_PUBLIC_TALUKA_URL;

const DealerUpdateScreen = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const phoneInputRef = useRef(null);
  const navigation = useNavigation();
  const dealerId = route.params?.id;
  const abortControllerRef = useRef(null);

  const [dealer, setDealer] = useState(null);
  const [originalPhone, setOriginalPhone] = useState("");
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState({ latitude: 0, longitude: 0 });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Separate OTP sending state for verify button
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(true);

  // OTP related states
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [phoneForOTP, setPhoneForOTP] = useState("");

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
  });

  // Store original form state for dropdown comparison
  const [originalFormState, setOriginalFormState] = useState({
    state: null,
    district: null,
    taluka: null,
  });

  const [stateItems, setStateItems] = useState([]);
  const [districtItems, setDistrictItems] = useState([]);
  const [talukaItems, setTalukaItems] = useState([]);

  const selectedState = useRef(null);
  const selectedDistrict = useRef(null);
  const selectedTaluka = useRef(null);

  // Track if PAN/GST are empty (editable)
  const [isPanEmpty, setIsPanEmpty] = useState(true);
  const [isGstEmpty, setIsGstEmpty] = useState(true);

  useEffect(() => {
    const fetchDealer = async () => {
      try {
        setLoading(true);

        if (!abortControllerRef.current) {
          abortControllerRef.current = new AbortController();
        }

        console.log("dealer ID", dealerId);

        const response = await apiClient.get(`dealer/${dealerId}/`);
        const data = response.data;
        setDealer(data);
        setOriginalPhone(data.phone);
        setLocation(data.billing_address);
        setCoordinates({
          latitude: parseFloat(data.location_latitude),
          longitude: parseFloat(data.location_longitude),
        });

        // Check if PAN/GST are empty
        const panEmpty = !data.pan_number || data.pan_number === "NA";
        const gstEmpty = !data.gst_number || data.gst_number === "NA";
        setIsPanEmpty(panEmpty);
        setIsGstEmpty(gstEmpty);

        const axiosConfig = {
          signal: abortControllerRef.current.signal,
          timeout: 10000,
        };

        const stateRes = await apiClient.get(`${STATE_URL}`, axiosConfig);
        const sortedStates = stateRes.data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        const stateList = sortedStates.map((item) => ({
          label: item.name,
          value: item.id,
        }));
        setStateItems(stateList);
        selectedState.current = stateList.find((s) => s.label === data.state.name);

        let selectedDistrictLocal;
        if (selectedState.current) {
          const districtRes = await apiClient.get(
            `${DISTRICT_URL}?state_id=${selectedState.current.value}`,
            axiosConfig
          );
          const sortedDistricts = districtRes.data.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          const districtList = sortedDistricts.map((item) => ({
            label: item.name,
            value: item.id,
          }));
          setDistrictItems(districtList);
          selectedDistrictLocal = districtList.find((d) => d.label === data.district.name);
          selectedDistrict.current = selectedDistrictLocal;

          if (selectedDistrictLocal) {
            const talukaRes = await apiClient.get(
              `${TALUKA_URL}?district_id=${selectedDistrictLocal.value}`,
              axiosConfig
            );
            const sortedTalukas = talukaRes.data.sort((a, b) =>
              a.name.localeCompare(b.name)
            );
            const talukaList = sortedTalukas.map((item) => ({
              label: item.name,
              value: item.id,
            }));
            setTalukaItems(talukaList);
            selectedTaluka.current = talukaList.find(
              (t) => t.label === data.taluka.name
            );
          }
        }

        const initialFormState = {
          state: selectedState.current?.value || null,
          district: selectedDistrict.current?.value || null,
          taluka: selectedTaluka.current?.value || null,
        };

        setFormState(initialFormState);
        setOriginalFormState(initialFormState); // Store original for comparison
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        if (__DEV__) {
          console.error("Error fetching dealer:", error);
        }

        if (error.response?.status === 401) {
          Alert.alert("Session Expired", "Please log in again.");
          return;
        }

        if (error.response?.status === 404) {
          Alert.alert("Error", "Dealer not found");
          navigation.goBack();
          return;
        }

        if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
          Alert.alert(
            "Connection Timeout",
            "Can't reach server. Please check your connection and try again."
          );
          navigation.goBack();
          return;
        }

        if (!error.response) {
          Alert.alert(
            "Network Error",
            "Can't reach server. Please check your internet connection."
          );
          navigation.goBack();
          return;
        }

        Alert.alert("Error", "Failed to load dealer data");
        navigation.goBack();
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    };

    fetchDealer();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [dealerId, navigation]);

  /**
   * Load districts when state changes
   */
  const loadDistricts = useCallback(async (stateId) => {
    try {
      const axiosConfig = {
        signal: abortControllerRef.current?.signal,
        timeout: 10000,
      };
      const districtRes = await apiClient.get(
        `${DISTRICT_URL}?state_id=${stateId}`,
        axiosConfig
      );
      const sortedDistricts = districtRes.data.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      const districtList = sortedDistricts.map((item) => ({
        label: item.name,
        value: item.id,
      }));
      setDistrictItems(districtList);
    } catch (error) {
      if (error.name !== "AbortError" && __DEV__) {
        console.error("Error loading districts:", error);
      }
    }
  }, []);

  /**
   * Load talukas when district changes
   */
  const loadTalukas = useCallback(async (districtId) => {
    try {
      const axiosConfig = {
        signal: abortControllerRef.current?.signal,
        timeout: 10000,
      };
      const talukaRes = await apiClient.get(
        `${TALUKA_URL}?district_id=${districtId}`,
        axiosConfig
      );
      const sortedTalukas = talukaRes.data.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      const talukaList = sortedTalukas.map((item) => ({
        label: item.name,
        value: item.id,
      }));
      setTalukaItems(talukaList);
    } catch (error) {
      if (error.name !== "AbortError" && __DEV__) {
        console.error("Error loading talukas:", error);
      }
    }
  }, []);

  /**
   * Send OTP for phone verification (separate from update)
   */
  const handleVerifyPhone = async (phone) => {
    try {
      setIsSendingOTP(true);

      if (!abortControllerRef.current) {
        abortControllerRef.current = new AbortController();
      }

      // Validate phone number
      if (!/^[0-9]{10}$/.test(phone.trim())) {
        Alert.alert("Invalid Phone", "Please enter a valid 10-digit phone number");
        return;
      }

      // First update the phone number
      const payload = { phone: phone.trim() };
      const resp = await apiClient.patch(
        `dealer/${dealerId}/`,
        payload,
        { signal: abortControllerRef.current.signal }
      );

      if (resp?.data?.phone) {
        setPhoneForOTP(resp.data.phone);
      }

      // Then send OTP
      await apiClient.post(`dealer/${dealerId}/send-otp/`, {}, {
        signal: abortControllerRef.current.signal,
        timeout: 10000,
      });

      setOtpModalVisible(true);
      showToast.success('OTP sent successfully!');
      phoneInputRef.current?.blur();


      if (__DEV__) {
        console.log('OTP sent successfully for phone verification');
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        return;
      }

      if (__DEV__) {
        console.error('Error sending OTP:', error);
      }

      Alert.alert("OTP Error", "Failed to send OTP. Please try again.");
    } finally {
      setIsSendingOTP(false);

    }
  };

  /**
   * Update dealer details
   */
  const updateDealer = async (payload) => {
    try {
      setUpdating(true);

      abortControllerRef.current = new AbortController();

      await apiClient.patch(`dealer/${dealerId}/`, payload, {
        signal: abortControllerRef.current.signal,
        timeout: 10000,
      });

      Alert.alert("Success", "Dealer updated successfully", [
        {
          text: "OK",
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);

    } catch (error) {
      if (error.name === 'AbortError') {
        return;
      }

      if (__DEV__) {
        console.error("Error updating dealer:", error);
      }

      if (error.response?.status === 401) {
        Alert.alert("Session Expired", "Please log in again.");
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

      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        Alert.alert("Connection Timeout", "Can't reach server. Please check your connection and try again.");
        return;
      }

      if (!error.response) {
        Alert.alert("Network Error", "Can't reach server. Please check your internet connection.");
        return;
      }

      Alert.alert("Error", "Something went wrong while updating dealer.");

    } finally {
      setUpdating(false);
      abortControllerRef.current = null;
    }
  };

  const handleSubmit = useCallback(async (values) => {
    if (updating) return;

    // Check if phone changed and not verified
    if (values.phone.trim() !== originalPhone && !isPhoneVerified) {
      Alert.alert(
        "Phone Verification Required",
        "Please verify the new phone number before updating dealer details.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      const payload = {
        shop_name: values.shop_name.trim(),
        owner_name: values.owner_name.trim(),
        phone: values.phone.trim(),
        secondary_phone: values.secondaryPhone ? values.secondaryPhone.trim() : "NA",
        pan_number: values.pan_number ? values.pan_number.trim() : "NA",
        gst_number: values.gst_number ? values.gst_number.trim() : "NA",
        billing_address: location.trim(),
        shipping_address: location.trim(),
        state_id: formState.state,
        district_id: formState.district,
        taluka_id: formState.taluka,
        location_latitude: coordinates.latitude,
        location_longitude: coordinates.longitude,
      };

      // Add secondary_phone_relation only if secondary phone is provided
      if (values.secondaryPhone && values.secondaryPhone.trim()) {
        payload.secondary_phone_relation = values.secondary_phone_relation;
      }

      console.log("Update Payload:", payload);

      await updateDealer(payload);

    } catch (error) {
      if (__DEV__) {
        console.error('Error in handleSubmit:', error);
      }
    }
  }, [updating, originalPhone, isPhoneVerified, formState, location, coordinates]);

  // Memoized form data for FlatList
  const formData = useMemo(() => [{ key: "form" }], []);

  // Memoized render item for FlatList
  const renderFormItem = useCallback(() => (
    <View style={modernStyles.formWrapper}>
      <Formik
        initialValues={{
          shop_name: dealer?.shop_name || "",
          owner_name: dealer?.owner_name || "",
          phone: dealer?.phone || "",
          secondaryPhone: dealer?.secondary_phone === "NA" ? "" : dealer?.secondary_phone || "",
          secondary_phone_relation: dealer?.secondary_phone_relation || "",
          pan_number: dealer?.pan_number === "NA" ? "" : dealer?.pan_number || "",
          gst_number: dealer?.gst_number === "NA" ? "" : dealer?.gst_number || "",      
        }}
        validationSchema={DealerSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
        validateOnChange={true}
        validateOnBlur={true}
      >
        {({ handleSubmit, values, errors, touched, dirty, setFieldValue }) => {
          // Check if phone changed
          const phoneChanged = values.phone.trim() !== originalPhone;

          // Check if dropdown values changed
          const dropdownChanged =
            formState.state !== originalFormState.state ||
            formState.district !== originalFormState.district ||
            formState.taluka !== originalFormState.taluka

          // Update verification status when phone changes
          React.useEffect(() => {
            if (phoneChanged) {
              setIsPhoneVerified(false);
            } else {
              setIsPhoneVerified(true);
            }
          }, [phoneChanged]);

          // Check if secondary phone relation should be shown
          const showSecondaryRelation = values.secondaryPhone.trim().length === 10;

          // Check if form can be submitted
          const locationFieldsValid = formState.state && formState.district && formState.taluka;
          const canSubmit = (dirty || dropdownChanged) && locationFieldsValid && !updating &&
            (!phoneChanged || (phoneChanged && isPhoneVerified));

          // Reset relation type when secondary phone is cleared
          React.useEffect(() => {
            if (values.secondaryPhone.trim().length < 10 && values.secondary_phone_relation) {
              setFieldValue("secondary_phone_relation", "");
            }
          }, [values.secondaryPhone]);

          return (
            <View style={modernStyles.formContent}>
              {/* Business Information */}
              <View style={modernStyles.section}>
                <View style={modernStyles.sectionHeader}>
                  <MaterialCommunityIcons
                    name="account-circle"
                    size={22}
                    color={DESIGN.colors.primary}
                  />
                  <Text style={modernStyles.sectionTitle}>
                    Dealer Information
                  </Text>
                </View>


                <View style={modernStyles.inputContainer}>
                  <Text style={modernStyles.fieldLabel}>Owner Name *</Text>
                  <InputFormField
                    name={"owner_name"}
                    style={modernStyles.input}
                    placeholder="Enter owner name"
                    accessibilityLabel="Owner name input"
                    accessibilityHint="Enter the owner's name"
                  />
                </View>

                <View style={modernStyles.inputContainer}>
                  <Text style={modernStyles.fieldLabel}>Shop Name *</Text>
                  <InputFormField
                    name={"shop_name"}
                    style={modernStyles.input}
                    placeholder="Enter shop name"
                    accessibilityLabel="Shop name input"
                    accessibilityHint="Enter the shop name"
                  />

                </View>

                {/* Phone Number with Inline Verify Button */}
                <View style={modernStyles.inputContainer}>
                  <Text style={modernStyles.fieldLabel}>Phone Number *</Text>
                  <View style={modernStyles.phoneRow}>
                    <InputFormField
                      name={"phone"}
                      style={[modernStyles.input, modernStyles.phoneInput]}
                      placeholder="Enter 10-digit phone number"
                      keyboardType="phone-pad"
                      maxLength={10}
                      accessibilityLabel="Phone number input"
                      accessibilityHint="Enter 10-digit phone number"
                    />
                    <TouchableOpacity
                      style={[
                        modernStyles.verifyButton,
                        (!phoneChanged || isSendingOTP || values.phone.trim().length !== 10) &&
                        modernStyles.verifyButtonDisabled
                      ]}
                      onPress={() => handleVerifyPhone(values.phone)}
                      disabled={!phoneChanged || isSendingOTP || values.phone.trim().length !== 10}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel="Verify phone number"
                      accessibilityHint="Sends OTP to verify phone number"
                    >
                      {isSendingOTP ? (
                        <ActivityIndicator size="small" color={DESIGN.colors.surface} />
                      ) : (
                        <>
                          <MaterialCommunityIcons
                            name="shield-check"
                            size={16}
                            color={DESIGN.colors.surface}
                          />
                          <Text style={modernStyles.verifyButtonText}>Verify</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                  {phoneChanged && !isPhoneVerified && (
                    <Text style={modernStyles.warningText}>
                      ⚠️ Phone number changed. Please verify to update.
                    </Text>
                  )}
                  {phoneChanged && isPhoneVerified && (
                    <Text style={modernStyles.successText}>
                      ✓ Phone number verified successfully!
                    </Text>
                  )}
                </View>
              </View>

              {/* Secondary Phone */}
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
                    name={"secondaryPhone"}
                    style={modernStyles.input}
                    placeholder="Enter secondary phone"
                    keyboardType="phone-pad"
                    maxLength={10}
 
                  />
                </View>

                {showSecondaryRelation && (
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
                      maxHeight={200}
                      style={modernStyles.dropdown}
                      zIndex={1200}
                      accessibilityLabel="Secondary phone relation selection dropdown"
                    />
                    {touched.secondary_phone_relation && errors.secondary_phone_relation && (
                      <Text style={modernStyles.error}>{errors.secondary_phone_relation}</Text>
                    )}
                  </View>
                )}
              </View>

              {/* Tax Information - Show if empty OR has value */}
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

                {/* PAN Number - Editable if empty, Read-only if has value */}
                <View style={modernStyles.inputContainer}>
                  <Text style={modernStyles.fieldLabel}>PAN Number</Text>
                  <InputFormField
                    name={"pan_number"}
                    style={modernStyles.input}
                    placeholder="Enter PAN number (optional)"
                    autoCapitalize="characters"
                    accessibilityLabel={isPanEmpty ? "PAN number input" : "PAN number display"}
                    accessibilityHint={isPanEmpty ? "Enter PAN number" : "Shows PAN number (read-only)"}
                  />
                </View>

                {/* GST Number - Editable if empty, Read-only if has value */}
                <View style={modernStyles.inputContainer}>
                  <Text style={modernStyles.fieldLabel}>GST Number</Text>
                  <InputFormField
                    name={"gst_number"}
                    style={modernStyles.input}
                    placeholder="Enter GST number (optional)"
                    autoCapitalize="characters"
                    accessibilityLabel={isGstEmpty ? "GST number input" : "GST number display"}
                    accessibilityHint={isGstEmpty ? "Enter GST number" : "Shows GST number (read-only)"}
                  />
                </View>
              </View>

              {/* Location Information */}
              <View style={modernStyles.section}>
                <View style={modernStyles.sectionHeader}>
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={22}
                    color={DESIGN.colors.primary}
                  />
                  <Text style={modernStyles.sectionTitle}>
                    Location Information
                  </Text>
                </View>

                <View style={modernStyles.inputContainer}>
                  <Text style={modernStyles.fieldLabel}>Current Location</Text>
                  <InputFormField
                    name={"location"}
                    style={[modernStyles.input, modernStyles.locationInput]}
                    placeholder="Current Location"
                    editable={false}
                    multiline
                    accessibilityLabel="Location display"
                    accessibilityHint="Shows the current location"
                  />
                </View>

                {/* State */}
                <View style={modernStyles.dropdownContainer}>
                  <Text style={modernStyles.fieldLabel}>State *</Text>
                  <AppDropDownPicker
                    open={dropdowns.state}
                    value={formState.state}
                    items={stateItems}
                    setOpen={(open) =>
                      setDropdowns((prev) => ({
                        ...prev,
                        state: open,
                        district: false,
                        taluka: false,
                        secondaryPhoneRelation: false,
                      }))
                    }
                    setValue={(callback) => {
                      const newValue = callback(formState.state);
                      setFormState((prev) => ({
                        ...prev,
                        state: newValue,
                        district: null,
                        taluka: null,
                      }));
                      selectedState.current = stateItems.find(s => s.value === newValue);
                      if (newValue) {
                        loadDistricts(newValue);
                      }
                    }}
                    placeholder="Select State"
                    searchable={true}
                    searchablePlaceholder="Search State"
                    translation={{ SEARCH_PLACEHOLDER: "Search State..." }}
                    searchableError={() => "State not found"}
                    style={modernStyles.dropdown}
                    zIndex={1100}
                    accessibilityLabel="State selection dropdown"
                  />
                </View>

                {/* District */}
                <View style={modernStyles.dropdownContainer}>
                  <Text style={modernStyles.fieldLabel}>District *</Text>
                  <AppDropDownPicker
                    open={dropdowns.district}
                    value={formState.district}
                    items={districtItems}
                    setOpen={(open) =>
                      setDropdowns((prev) => ({
                        ...prev,
                        district: open,
                        taluka: false,
                        state: false,
                        secondaryPhoneRelation: false,
                      }))
                    }
                    setValue={(callback) => {
                      const newValue = callback(formState.district);
                      setFormState((prev) => ({
                        ...prev,
                        district: newValue,
                        taluka: null,
                      }));
                      selectedDistrict.current = districtItems.find(d => d.value === newValue);
                      if (newValue) {
                        loadTalukas(newValue);
                      }
                    }}
                    placeholder="Select District"
                    searchable={true}
                    searchablePlaceholder="Search District"
                    translation={{ SEARCH_PLACEHOLDER: "Search District..." }}
                    searchableError={() => "District not found"}
                    style={modernStyles.dropdown}
                    zIndex={1000}
                    accessibilityLabel="District selection dropdown"
                  />
                </View>

                {/* Taluka */}
                <View style={modernStyles.dropdownContainer}>
                  <Text style={modernStyles.fieldLabel}>Taluka *</Text>
                  <AppDropDownPicker
                    open={dropdowns.taluka}
                    value={formState.taluka}
                    items={talukaItems}
                    setOpen={(open) =>
                      setDropdowns((prev) => ({
                        ...prev,
                        taluka: open,
                        district: false,
                        state: false,
                        secondaryPhoneRelation: false,
                      }))
                    }
                    setValue={(callback) => {
                      const newValue = callback(formState.taluka);
                      setFormState((prev) => ({
                        ...prev,
                        taluka: newValue,
                      }));
                      selectedTaluka.current = talukaItems.find(t => t.value === newValue);
                    }}
                    placeholder="Select Taluka"
                    searchable={true}
                    searchablePlaceholder="Search Taluka"
                    translation={{ SEARCH_PLACEHOLDER: "Search Taluka..." }}
                    searchableError={() => "Taluka not found"}
                    style={modernStyles.dropdown}
                    zIndex={900}
                    accessibilityLabel="Taluka selection dropdown"
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
                  accessibilityLabel="Update dealer details"
                  accessibilityHint="Submits the dealer update form"
                  accessibilityState={{ disabled: !canSubmit }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {updating ? (
                    <View style={modernStyles.loadingContainer}>
                      <ActivityIndicator size="small" color={DESIGN.colors.surface} />
                      <Text style={modernStyles.submitButtonText}>Updating...</Text>
                    </View>
                  ) : (
                    <View style={modernStyles.buttonContent}>
                      <MaterialCommunityIcons
                        name="content-save"
                        size={20}
                        color={DESIGN.colors.surface}
                      />
                      <Text style={modernStyles.submitButtonText}>
                        Update Dealer
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      </Formik>
    </View>
  ), [
    dealer,
    dropdowns,
    formState,
    originalFormState,
    stateItems,
    districtItems,
    talukaItems,
    handleSubmit,
    location,
    updating,
    isSendingOTP,
    originalPhone,
    loadDistricts,
    loadTalukas,
    isPanEmpty,
    isGstEmpty,
    isPhoneVerified
  ]);

  if (loading) {
    return (
      <View style={modernStyles.centeredContainer}>
        <ActivityIndicator size="large" color={DESIGN.colors.primary} />
        <Text style={modernStyles.loadingText}>Loading dealer data...</Text>
      </View>
    );
  }

  if (!dealer) {
    return (
      <View style={modernStyles.centeredContainer}>
        <Text style={modernStyles.errorText}>No dealer data found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingBottom: insets.bottom }}>
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
      </KeyboardAvoidingView>

      {/* OTP Modal for phone number verification */}
      <OTPModal
        visible={otpModalVisible}
        dealerId={dealerId}
        onClose={() => setOtpModalVisible(false)}
        phone={phoneForOTP}
        onVerified={() => {
          setOtpModalVisible(false);
          setOriginalPhone(phoneForOTP);
          setIsPhoneVerified(true);
          showToast.success('Phone number verified successfully!');
        }}
      />
    </View>
  );
};

const modernStyles = StyleSheet.create({
  container: {
    paddingBottom: 80,
  },
  formWrapper: {
    backgroundColor: DESIGN.colors.surface,
    marginHorizontal: DESIGN.spacing.xs,
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
  inputContainer: {
    marginBottom: DESIGN.spacing.md,
  },
  fieldLabel: {
    ...DESIGN.typography.label,
    color: DESIGN.colors.textPrimary,
    marginBottom: DESIGN.spacing.xs,
    fontWeight: "500",
  },
  input: {
    backgroundColor: DESIGN.colors.surface,
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
    borderRadius: DESIGN.borderRadius.sm,
    paddingHorizontal: DESIGN.spacing.md,
    paddingVertical: DESIGN.spacing.sm,
    ...DESIGN.typography.body,
    color: DESIGN.colors.textPrimary,
    minHeight: 50,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: DESIGN.spacing.sm,

  },
  phoneInput: {
    flex: 1,
    marginBottom: 0,
  },
  verifyButton: {
    backgroundColor: DESIGN.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: DESIGN.spacing.md,
    paddingVertical: DESIGN.spacing.sm,
    borderRadius: DESIGN.borderRadius.sm,
    minHeight: 50,
    minWidth: 90,
    gap: DESIGN.spacing.xs,
  },
  verifyButtonDisabled: {
    backgroundColor: DESIGN.colors.textTertiary,
    opacity: 0.5,
  },
  verifyButtonText: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.surface,
    fontWeight: "600",
    fontSize: 14,
  },
  disabledInput: {
    backgroundColor: DESIGN.colors.surfaceElevated,
    borderColor: DESIGN.colors.borderLight,
    color: DESIGN.colors.textSecondary,
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
    marginBottom: DESIGN.spacing.xs,
    position: "relative",
  },
  dropdown: {
    backgroundColor: DESIGN.colors.surface,
    borderColor: DESIGN.colors.border,
    borderRadius: DESIGN.borderRadius.sm,
    minHeight: 50,
  },
  error: {
    ...DESIGN.typography.caption,
    color: DESIGN.colors.error,
    marginTop: DESIGN.spacing.xs,
  },
  warningText: {
    ...DESIGN.typography.caption,
    color: DESIGN.colors.warning || "#FF9800",
    marginTop: DESIGN.spacing.xs,
    fontWeight: "500",
  },
  successText: {
    ...DESIGN.typography.caption,
    color: DESIGN.colors.success || "#4CAF50",
    marginTop: DESIGN.spacing.xs,
    fontWeight: "500",
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
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: DESIGN.spacing.lg,
  },
  loadingText: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textSecondary,
    marginTop: DESIGN.spacing.md,
  },
  errorText: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.error,
    marginBottom: DESIGN.spacing.lg,
  },
});

export default DealerUpdateScreen;