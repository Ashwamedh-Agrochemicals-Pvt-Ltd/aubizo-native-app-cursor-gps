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
  TextInput,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import * as Yup from "yup";
import apiClient from "../src/api/client";
import AppButton from "../src/components/form/appComponents/AppButton";
import DESIGN from "../src/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STATE_URL = process.env.EXPO_PUBLIC_STATE_URL;
const DISTRICT_URL = process.env.EXPO_PUBLIC_DISTRICT_URL;
const TALUKA_URL = process.env.EXPO_PUBLIC_TALUKA_URL;

const dealerSchema = Yup.object().shape({
  shopeName: Yup.string().required("Shope name is required"),
  ownerName: Yup.string().required("Owner name is required"),
  mobile: Yup.string()
    .matches(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits")
    .required("Mobile number is required"),
  remark: Yup.string().required("Remark is required"),
});

const DealerUpdateScreen = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation();
  const dealerId = route.params?.id;
  const abortControllerRef = useRef(null);

  const [dealer, setDealer] = useState(null);
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState({ latitude: 0, longitude: 0 });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [dropdowns, setDropdowns] = useState({
    state: false,
    district: false,
    taluka: false,
    agreement_status: false,
  });

  const [formState, setFormState] = useState({
    state: null,
    district: null,
    taluka: null,
    agreement_status: null,
  });

  const [stateItems, setStateItems] = useState([]);
  const [districtItems, setDistrictItems] = useState([]);
  const [talukaItems, setTalukaItems] = useState([]);

  const selectedState = useRef(null);
  const selectedDistrict = useRef(null);
  const selectedTaluka = useRef(null);

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
        setLocation(data.billing_address);
        setCoordinates({
          latitude: parseFloat(data.location_latitude),
          longitude: parseFloat(data.location_longitude),
        });

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

        setFormState({
          state: selectedState.current?.value || null,
          district: selectedDistrict.current?.value || null,
          taluka: selectedTaluka.current?.value || null,
          agreement_status: data.agreement_status || "active",
        });
      } catch (error) {
        if (error.name === "AbortError") {
          // Request was cancelled, do nothing
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


  const handleSubmit = useCallback(async (values) => {
    if (updating) return;

    try {
      setUpdating(true);

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      const payload = {
        shop_name: values.shopeName.trim(),
        owner_name: values.ownerName.trim(),
        phone: values.mobile.trim(),
        gst_number: values.gst_number || "",
        remark: values.remark.trim(),
        agreement_status: formState.agreement_status,
        billing_address: location.trim(),
        shipping_address: location.trim(),
        state_id: formState.state,
        district_id: formState.district,
        taluka_id: formState.taluka,
        location_latitude: coordinates.latitude,
        location_longitude: coordinates.longitude,
      };

      await apiClient.patch(`dealer/${dealerId}/`, payload, {
        signal: abortControllerRef.current.signal,
        timeout: 10000 // 10 second timeout
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
        // Request was cancelled, do nothing
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
        // Validation error
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

      // Generic error
      Alert.alert("Error", "Something went wrong while updating dealer.");

    } finally {
      setUpdating(false);
      abortControllerRef.current = null;
    }
  }, [dealer, formState, location, coordinates, dealerId, navigation, updating]);

  // Memoized form data for FlatList
  const formData = useMemo(() => [{ key: "form" }], []);

  // Memoized render item for FlatList
  const renderFormItem = useCallback(({ item }) => (
    <View style={modernStyles.formWrapper}>
      <Formik
        initialValues={{
          shopeName: dealer.shop_name || "",
          ownerName: dealer.owner_name || "",
          mobile: dealer.phone || "",
          gst_number: dealer.gst_number || "",
          remark: dealer.remark || "",
        }}
        validationSchema={dealerSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
        validateOnChange={true}
        validateOnBlur={true}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, dirty }) => {
          const canSubmit = dirty && !updating;

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
                  <TextInput
                    style={modernStyles.input}
                    placeholder="Shop Name *"
                    onChangeText={handleChange("shopeName")}
                    onBlur={handleBlur("shopeName")}
                    value={values.shopeName}
                    accessibilityLabel="Shop name input"
                    accessibilityHint="Enter the shop name"
                  />
                  {touched.shopeName && errors.shopeName && (
                    <Text style={modernStyles.error}>{errors.shopeName}</Text>
                  )}
                </View>

                <View style={modernStyles.inputContainer}>
                  <TextInput
                    style={modernStyles.input}
                    placeholder="Owner Name *"
                    onChangeText={handleChange("ownerName")}
                    onBlur={handleBlur("ownerName")}
                    value={values.ownerName}
                    accessibilityLabel="Owner name input"
                    accessibilityHint="Enter the owner's name"
                  />
                  {touched.ownerName && errors.ownerName && (
                    <Text style={modernStyles.error}>{errors.ownerName}</Text>
                  )}
                </View>

                <View style={modernStyles.inputContainer}>
                  <TextInput
                    style={[modernStyles.input, modernStyles.disabledInput]}
                    placeholder="Phone *"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={values.mobile}
                    editable={false}  // 👈 makes it read-only
                    accessibilityLabel="Phone number display"
                    accessibilityHint="Shows the phone number (read-only)"
                  />

                  {touched.mobile && errors.mobile && (
                    <Text style={modernStyles.error}>{errors.mobile}</Text>
                  )}
                </View>
                <View style={modernStyles.inputContainer}>
                  <TextInput
                    placeholder="GST Number"
                    value={values.gst_number}
                    style={modernStyles.input}
                    onChangeText={handleChange("gst_number")}   // 👈 updates form state
                    onBlur={handleBlur("gst_number")}           // 👈 triggers validation on blur
                    editable={true}                             // 👈 makes it editable
                    accessibilityLabel="GST number input"
                    accessibilityHint="Enter the GST number"
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
                  <TextInput
                    style={[modernStyles.input, modernStyles.locationInput]}
                    placeholder="Current Location"
                    value={location}
                    editable={false}
                    multiline
                    accessibilityLabel="Location display"
                    accessibilityHint="Shows the current location"
                  />
                </View>

                {/* State */}
                <View style={modernStyles.dropdownContainer}>
                  <DropDownPicker
                    open={dropdowns.state}
                    value={formState.state}
                    items={stateItems}
                    setOpen={(open) =>
                      setDropdowns((prev) => ({
                        ...prev,
                        state: open,
                        district: false,
                        taluka: false,
                        agreement_status: false,
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
                    }}
                    placeholder="Select State *"
                    searchable={true}
                    searchablePlaceholder="Search State"
                    listMode="SCROLLVIEW"
                    maxHeight={200}
                    searchableError={() => "State not found"}
                    style={modernStyles.dropdown}
                    zIndex={1000}
                    accessibilityLabel="State selection dropdown"
                  />
                </View>

                {/* District */}
                <View style={modernStyles.dropdownContainer}>
                  <DropDownPicker
                    open={dropdowns.district}
                    value={formState.district}
                    items={districtItems}
                    setOpen={(open) =>
                      setDropdowns((prev) => ({
                        ...prev,
                        district: open,
                        taluka: false,
                        state: false,
                        agreement_status: false,
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
                    }}
                    placeholder="Select District *"
                    searchable={true}
                    searchablePlaceholder="Search District"
                    listMode="SCROLLVIEW"
                    maxHeight={200}
                    searchableError={() => "District not found"}
                    style={modernStyles.dropdown}
                    zIndex={900}
                    accessibilityLabel="District selection dropdown"
                  />
                </View>

                {/* Taluka */}
                <View style={modernStyles.dropdownContainer}>
                  <DropDownPicker
                    open={dropdowns.taluka}
                    value={formState.taluka}
                    items={talukaItems}
                    setOpen={(open) =>
                      setDropdowns((prev) => ({
                        ...prev,
                        taluka: open,
                        district: false,
                        state: false,
                        agreement_status: false,
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
                    placeholder="Select Taluka *"
                    searchable={true}
                    searchablePlaceholder="Search Taluka"
                    listMode="SCROLLVIEW"
                    maxHeight={200}
                    searchableError={() => "Taluka not found"}
                    style={modernStyles.dropdown}
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
                  <DropDownPicker
                    open={dropdowns.agreement_status}
                    value={formState.agreement_status}
                    items={[
                      { label: "Active", value: "active" },
                      { label: "Inactive", value: "inactive" },
                    ]}
                    setOpen={(open) =>
                      setDropdowns((prev) => ({
                        ...prev,
                        agreement_status: open,
                        state: false,
                        district: false,
                        taluka: false,
                      }))
                    }
                    setValue={(callback) => {
                      const newValue = callback(formState.agreement_status);
                      setFormState((prev) => ({
                        ...prev,
                        agreement_status: newValue,
                      }));
                    }}
                    placeholder="Agreement Status"
                    style={modernStyles.dropdown}
                    zIndex={700}
                    accessibilityLabel="Agreement status selection dropdown"
                  />
                </View>

                <View style={modernStyles.inputContainer}>
                  <TextInput
                    style={modernStyles.input}
                    placeholder="Remark *"
                    multiline
                    numberOfLines={3}
                    onChangeText={handleChange("remark")}
                    onBlur={handleBlur("remark")}
                    value={values.remark}
                    accessibilityLabel="Remark input"
                    accessibilityHint="Enter additional remarks about the dealer"
                  />
                  {touched.remark && errors.remark && (
                    <Text style={modernStyles.error}>{errors.remark}</Text>
                  )}
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
                    <ActivityIndicator size="small" color={DESIGN.colors.surface} />
                  ) : (
                    <>
                      <MaterialCommunityIcons
                        name="check"
                        size={24}
                        color={DESIGN.colors.surface}
                      />
                      <Text style={modernStyles.submitButtonText}>
                        Update Dealer
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
  ), [dealer, dropdowns, formState, stateItems, districtItems, talukaItems, handleSubmit, location, updating]);

  if (loading) {
    return (
      <View style={modernStyles.loadingContainer}>
        <ActivityIndicator size="large" color={DESIGN.colors.primary} />
        <Text style={modernStyles.loadingText}>Loading dealer data...</Text>
      </View>
    );
  }

  if (!dealer) {
    return (
      <View style={modernStyles.loadingContainer}>
        <Text style={modernStyles.errorText}>No dealer data found</Text>
        <AppButton
          title="Go Back"
          onPress={() => navigation.goBack()}
        />
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
    </View>
  );
};

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
  input: {
    backgroundColor: DESIGN.colors.surface,
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
    borderRadius: DESIGN.borderRadius.sm,
    paddingHorizontal: DESIGN.spacing.md,
    paddingVertical: DESIGN.spacing.sm,
    ...DESIGN.typography.body,
    color: DESIGN.colors.textPrimary,
    minHeight: 44, // Accessibility minimum touch target
  },
  disabledInput: {
    backgroundColor: DESIGN.colors.surfaceElevated,
    borderColor: DESIGN.colors.borderLight,
    fontStyle: "italic",
    color: DESIGN.colors.textSecondary,
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
  dropdown: {
    backgroundColor: DESIGN.colors.surface,
    borderColor: DESIGN.colors.border,
    borderRadius: DESIGN.borderRadius.sm,
    minHeight: 50,
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
  loadingContainer: {
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
