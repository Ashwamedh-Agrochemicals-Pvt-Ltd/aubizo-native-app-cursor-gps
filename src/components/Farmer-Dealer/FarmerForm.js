import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Formik } from "formik";
import { useEffect, useState, useRef } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { FarmerSchema } from "../../validations/FarmerSchema";
import useMasterData from "../../hooks/useMasterData"
import AppDropDownPicker from "../form/appComponents/AppDropDownPicker"
import InputFormField from "../form/appComponents/InputFormText";
import apiClient from "../../api/client";
import Location from "../../utility/location";
import DESIGN from "../../theme";

export default function FarmerForm({
  location,
  stateFarmerForm,
  setfetchFarmer,
}) {
  const {
    states,
    districts,
    talukas,
    irrigationTypes,
    products,
    loadStates,
    loadDistricts,
    loadTalukas,
    loadIrrigation,
    loadProducts,
    loadCrops,
  } = useMasterData();
  
  const [loading, setLoading] = useState(false);
  const [cropOptions, setCropOptions] = useState([]);
  const [selectedCrops, setSelectedCrops] = useState([]);
  const [cropModalVisible, setCropModalVisible] = useState(false);
  const abortControllerRef = useRef(null);

  const [dropdowns, setDropdowns] = useState({
    state: false,
    district: false,
    taluka: false,
    crop: false,
    irrigation: false,
    recommendedProduct: false,
  });

  const [formState, setFormState] = useState({
    state: null,
    district: null,
    taluka: null,
    crop: false,
    irrigation: false,
    recommendedProduct: false,
  });

  // Load crops on component mount
  useEffect(() => {
    loadCrops(setCropOptions);
    
    // Cleanup function to abort any pending requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Validate form state for submit button
  const isFormValid = (values, touched, errors) => {
    // Check if all required form fields are filled and valid
    const requiredFields = ['name', 'mobile', 'city', 'acre', 'Current_Product'];
    const formFieldsValid = requiredFields.every(field => 
      values[field] && values[field].trim() && !errors[field]
    );
    
    // Check if location dropdowns are selected
    const locationValid = formState.state && formState.district && formState.taluka;
    
    // Check if irrigation and recommended product are selected
    const dropdownsValid = formState.irrigation && formState.recommendedProduct;
    
    // Check if crops are selected with acre values
    const cropsValid = selectedCrops.length > 0 && 
      selectedCrops.every(crop => crop.acre && crop.acre.trim() !== "");
    
    return formFieldsValid && locationValid && dropdownsValid && cropsValid;
  };

  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    const startTime = Date.now();
    
    if (__DEV__) {
      console.log("🌾 [FarmerForm] Starting handleSubmit...");
    }
    
    // Prevent double submission
    if (loading) return;
    
    setLoading(true);
    setSubmitting(true);
    
    // Create abort controller for this request
    abortControllerRef.current = new AbortController();
    
    try {
      // Get location - use passed location or fetch current
      let latitude, longitude;
      if (location) {
        // Parse location string if it's in "lat,lng" format
        const coords = location.split(',').map(coord => parseFloat(coord.trim()));
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          latitude = coords[0];
          longitude = coords[1];
        } else {
          const locationStart = Date.now();
          const locationDetails = await Location.getCurrentLocationDetails();
          const locationTime = Date.now() - locationStart;
          
          if (__DEV__) {
            console.log(`🌾 [FarmerForm] Location acquisition in handleSubmit took: ${locationTime}ms`);
          }
          
          latitude = locationDetails.latitude;
          longitude = locationDetails.longitude;
        }
      } else {
        const locationStart = Date.now();
        const locationDetails = await Location.getCurrentLocationDetails();
        const locationTime = Date.now() - locationStart;
        
        if (__DEV__) {
          console.log(`🌾 [FarmerForm] Location acquisition in handleSubmit took: ${locationTime}ms`);
        }
        
        latitude = locationDetails.latitude;
        longitude = locationDetails.longitude;
      }

      const cropDetails = selectedCrops.map((crop) => ({
        crop_id: crop.value || "Unknown Crop",
        acre: crop.acre ? parseFloat(crop.acre) : 0,
        irrigation: formState.irrigation || "Not specified",
        current_product_used: values.Current_Product?.trim() || "Not selected",
        recommend_id: formState.recommendedProduct || "Not selected",
      }));

      const payload = {
        farmer_name: values.name?.trim(),
        mobile_no: values.mobile?.trim(),
        location: location || "Current Location",
        city: values.city?.trim(),
        total_acre: parseFloat(values.acre?.trim()),
        state_id: formState.state,
        district_id: formState.district,
        taluka_id: formState.taluka,
        latitude: Number(latitude.toFixed(6)),
        longitude: Number(longitude.toFixed(6)),
        crop_details: cropDetails,
        remark: values.remark?.trim() || "",
      };

      const response = await apiClient.post(`farmer/create/`, payload, {
        signal: abortControllerRef.current.signal,
        timeout: 10000 // 10 second timeout for form submission
      });

      // Success - reset form and close
      Alert.alert(
        "Success", 
        "Farmer created successfully",
        [
          {
            text: "OK",
            onPress: () => {
              resetForm();
              setFormState({
                state: null,
                district: null,
                taluka: null,
                irrigation: false,
                recommendedProduct: false,
              });
              setSelectedCrops([]);
              stateFarmerForm(false);
              setfetchFarmer();
            }
          }
        ]
      );

    } catch (error) {
      // Handle different error types
      if (error.name === 'AbortError') {
        // Request was cancelled, do nothing
        return;
      }
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 401) {
          Alert.alert("Session Expired", "Please log in again.");
          return;
        }
        
        if (status >= 400 && status < 500) {
          // Validation error
          const errorMessage = data?.message || data?.error || "Please fix the highlighted fields.";
          Alert.alert("Validation Error", errorMessage);
          return;
        }
        
        if (status >= 500) {
          Alert.alert("Server Error", "Something went wrong. Please try again later.");
          return;
        }
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
      Alert.alert("Error", "Something went wrong. Please try again.");
      
    } finally {
      setLoading(false);
      setSubmitting(false);
      abortControllerRef.current = null;
      
      const totalTime = Date.now() - startTime;
      if (__DEV__) {
        console.log(`🌾 [FarmerForm] handleSubmit total time: ${totalTime}ms`);
      }
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 80 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={modernStyles.formWrapper}>
            <Formik
              initialValues={{
                name: "",
                mobile: "",
                remark: "",
                acre: "",
                city: "",
                Current_Product: ""
              }}
              validationSchema={FarmerSchema}
              onSubmit={handleSubmit}
              validateOnChange={true}
              validateOnBlur={true}
            >
              {({ handleSubmit, values, touched, errors, isSubmitting, dirty }) => {
                const canSubmit = isFormValid(values, touched, errors) && dirty && !isSubmitting && !loading;
                
                return (
                  <View style={modernStyles.formContent}>
                    {/* Personal Information Section */}
                    <View style={modernStyles.section}>
                      <View style={modernStyles.sectionHeader}>
                        <MaterialCommunityIcons
                          name="account"
                          size={20}
                          color={DESIGN.colors.primary}
                        />
                        <Text style={modernStyles.sectionTitle}>
                          Personal Information
                        </Text>
                      </View>

                      <View style={modernStyles.inputContainer}>
                        <InputFormField 
                          name="name" 
                          placeholder="Name *" 
                          accessibilityLabel="Farmer name input"
                          accessibilityHint="Enter the farmer's full name"
                        />
                      </View>

                      <View style={modernStyles.inputContainer}>
                        <InputFormField
                          name="location"
                          externalValue={location}
                          placeholder="Fetching current location..."
                          editable={false}
                          multiline
                          style={modernStyles.locationInput}
                          accessibilityLabel="Location display"
                          accessibilityHint="Shows the current location"
                        />
                      </View>

                      <View style={modernStyles.inputContainer}>
                        <InputFormField 
                          name="mobile" 
                          placeholder="Mobile *" 
                          keyboardType="phone-pad"
                          maxLength={10}
                          accessibilityLabel="Mobile number input"
                          accessibilityHint="Enter 10-digit mobile number"
                        />
                      </View>

                      <View style={modernStyles.inputContainer}>
                        <InputFormField 
                          name="city" 
                          placeholder="City *" 
                          accessibilityLabel="City input"
                          accessibilityHint="Enter the city name"
                        />
                      </View>
                    </View>

                    {/* Location Details Section */}
                    <View style={modernStyles.section}>
                      <View style={modernStyles.sectionHeader}>
                        <MaterialCommunityIcons
                          name="map-marker"
                          size={20}
                          color={DESIGN.colors.primary}
                        />
                        <Text style={modernStyles.sectionTitle}>
                          Location Details
                        </Text>
                      </View>

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
                              irrigation: false,
                              recommendedProduct: false,
                              crop: false,
                            }));

                            if (open && states.length === 0) {
                              await loadStates();
                            }
                          }}
                          setValue={(callback) =>
                            setFormState((prev) => ({
                              ...prev,
                              state: callback(prev.state),
                              district: null, // Reset dependent fields
                              taluka: null,
                            }))
                          }
                          name={formState.state}
                          placeholder="Select State *"
                          searchable={true}
                          searchablePlaceholder="Search State"
                          listMode="SCROLLVIEW"
                          maxHeight={200}
                          searchableError={() => "State not found"}
                          zIndex={1000}
                          accessibilityLabel="State selection dropdown"
                        />
                      </View>

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
                              irrigation: false,
                              recommendedProduct: false,
                              crop: false,
                            }));
                            if (
                              open &&
                              formState.state &&
                              districts.length === 0
                            ) {
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
                          searchable={true}
                          searchablePlaceholder="Search District"
                          listMode="SCROLLVIEW"
                          maxHeight={200}
                          searchableError={() => "District not found"}
                          placeholder="Select District *"
                          zIndex={900}
                          accessibilityLabel="District selection dropdown"
                        />
                      </View>

                      <View style={modernStyles.dropdownContainer}>
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
                              irrigation: false,
                              recommendedProduct: false,
                              crop: false,
                            }));
                            if (
                              open &&
                              formState.district &&
                              talukas.length === 0
                            ) {
                              await loadTalukas(formState.district);
                            }
                          }}
                          setValue={(callback) =>
                            setFormState((prev) => ({
                              ...prev,
                              taluka: callback(prev.taluka),
                            }))
                          }
                          name={formState.taluka}
                          searchable={true}
                          searchablePlaceholder="Search Taluka"
                          listMode="SCROLLVIEW"
                          maxHeight={200}
                          searchableError={() => "Taluka not found"}
                          placeholder="Select Taluka *"
                          zIndex={800}
                          accessibilityLabel="Taluka selection dropdown"
                        />
                      </View>
                    </View>

                    {/* Farm Information Section */}
                    <View style={modernStyles.section}>
                      <View style={modernStyles.sectionHeader}>
                        <MaterialCommunityIcons
                          name="leaf"
                          size={20}
                          color={DESIGN.colors.primary}
                        />
                        <Text style={modernStyles.sectionTitle}>
                          Farm Information
                        </Text>
                      </View>

                      <View style={modernStyles.inputContainer}>
                        <InputFormField
                          name="acre"
                          placeholder="Total Acre *"
                          keyboardType="numeric"
                          maxLength={6}
                          accessibilityLabel="Total acre input"
                          accessibilityHint="Enter the total acreage"
                        />
                      </View>

                      <View style={modernStyles.fieldContainer}>
                        <Text style={modernStyles.fieldLabel}>
                          Crop Details
                        </Text>
                        <TouchableOpacity
                          style={modernStyles.cropSelector}
                          onPress={() => setCropModalVisible(true)}
                          accessibilityRole="button"
                          accessibilityLabel="Select crops"
                          accessibilityHint="Opens crop selection modal"
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Text
                            style={[
                              modernStyles.cropSelectorText,
                              selectedCrops.length > 0 &&
                              modernStyles.cropSelectorTextActive,
                            ]}
                          >
                            {selectedCrops.length > 0
                              ? selectedCrops
                                .map((c) => `${c.label} (${c.acre})`)
                                .join(", ")
                              : "Select Crop"}
                          </Text>
                          <MaterialCommunityIcons
                            name="chevron-down"
                            size={24}
                            color={DESIGN.colors.textSecondary}
                          />
                        </TouchableOpacity>
                      </View>

                      <View style={modernStyles.dropdownContainer}>
                        <DropDownPicker
                          open={dropdowns.irrigation}
                          setOpen={(open) => {
                            if (open) loadIrrigation();
                            setDropdowns({
                              ...dropdowns,
                              irrigation: open,
                              recommendedProduct: false,
                              state: false,
                              district: false,
                              taluka: false,
                              crop: false,
                            });
                          }}
                          value={formState.irrigation}
                          setValue={(cb) =>
                            setFormState((prev) => ({
                              ...prev,
                              irrigation: cb(prev.irrigation),
                            }))
                          }
                          items={irrigationTypes}
                          placeholder="Select Irrigation Type *"
                          style={modernStyles.dropdown}
                          dropDownContainerStyle={modernStyles.dropdownList}
                          textStyle={modernStyles.dropdownText}
                          placeholderStyle={modernStyles.placeholderText}
                          searchable={true}
                          searchablePlaceholder="Search Irrigation"
                          listMode="SCROLLVIEW"
                          maxHeight={200}
                          searchableError={() => "Irrigation not found"}
                          zIndex={700}
                          accessibilityLabel="Irrigation type selection dropdown"
                        />
                      </View>
                    </View>

                    {/* Product Information Section */}
                    <View style={modernStyles.section}>
                      <View style={modernStyles.sectionHeader}>
                        <MaterialCommunityIcons
                          name="package-variant"
                          size={20}
                          color={DESIGN.colors.primary}
                        />
                        <Text style={modernStyles.sectionTitle}>
                          Product Information
                        </Text>
                      </View>

                      <View style={modernStyles.inputContainer}>
                        <InputFormField 
                          name="Current_Product" 
                          placeholder="Current Product *" 
                          accessibilityLabel="Current product input"
                          accessibilityHint="Enter the current product being used"
                        />
                      </View>

                      <View style={modernStyles.dropdownContainer}>
                        <DropDownPicker
                          open={dropdowns.recommendedProduct}
                          setOpen={(open) => {
                            if (open) loadProducts();
                            setDropdowns({
                              ...dropdowns,
                              recommendedProduct: open,
                              irrigation: false,
                              state: false,
                              district: false,
                              taluka: false,
                              crop: false,
                            });
                          }}
                          value={formState.recommendedProduct}
                          setValue={(cb) =>
                            setFormState((prev) => ({
                              ...prev,
                              recommendedProduct: cb(prev.recommendedProduct),
                            }))
                          }
                          items={products}
                          placeholder="Recommended Product *"
                          style={modernStyles.dropdown}
                          dropDownContainerStyle={modernStyles.dropdownList}
                          textStyle={modernStyles.dropdownText}
                          placeholderStyle={modernStyles.placeholderText}
                          zIndex={500}
                          searchable={true}
                          searchablePlaceholder="Search Recommended Product"
                          listMode="SCROLLVIEW"
                          maxHeight={200}
                          searchableError={() => "Recommended Product not found"}
                          accessibilityLabel="Recommended product selection dropdown"
                        />
                      </View>
                    </View>

                    {/* Additional Information Section */}
                    <View style={modernStyles.section}>
                      <View style={modernStyles.sectionHeader}>
                        <MaterialCommunityIcons
                          name="note-text"
                          size={20}
                          color={DESIGN.colors.primary}
                        />
                        <Text style={modernStyles.sectionTitle}>
                          Additional Information
                        </Text>
                      </View>

                      <View style={modernStyles.inputContainer}>
                        <InputFormField 
                          name="remark" 
                          placeholder="Remark" 
                          multiline
                          numberOfLines={3}
                          accessibilityLabel="Remark input"
                          accessibilityHint="Enter additional remarks about the farmer"
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
                        accessibilityLabel="Submit farmer details"
                        accessibilityHint="Submits the farmer form"
                        accessibilityState={{ disabled: !canSubmit }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        {loading ? (
                          <ActivityIndicator size="small" color={DESIGN.colors.surface} />
                        ) : (
                          <>
                            <Text style={modernStyles.submitButtonText}>
                              Submit Farmer Details
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
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Crop Selection Modal */}
      <Modal
        visible={cropModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={modernStyles.modalContainer}>
          {/* Modal Header */}
          <View style={modernStyles.modalHeader}>
            <Text style={modernStyles.modalTitle}>Select Crops</Text>
            <TouchableOpacity
              style={modernStyles.modalCloseButton}
              onPress={() => setCropModalVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Close crop selection"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={DESIGN.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={modernStyles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {cropOptions.map((crop, index) => {
              const selected = selectedCrops.find(
                (c) => c.label === crop.label
              );

              return (
                <View key={index} style={modernStyles.cropItem}>
                  <TouchableOpacity
                    onPress={() => {
                      if (selected) {
                        setSelectedCrops((prev) =>
                          prev.filter((c) => c.label !== crop.label)
                        );
                      } else {
                        setSelectedCrops((prev) => [
                          ...prev,
                          {
                            label: crop.label,
                            value: crop.value,
                            acre: "",
                          },
                        ]);
                      }
                    }}
                    style={modernStyles.cropCheckbox}
                    activeOpacity={0.7}
                    accessibilityRole="checkbox"
                    accessibilityLabel={`${selected ? 'Deselect' : 'Select'} ${crop.label}`}
                    accessibilityState={{ checked: !!selected }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <MaterialCommunityIcons
                      name={
                        selected ? "checkbox-marked" : "checkbox-blank-outline"
                      }
                      size={24}
                      color={
                        selected
                          ? DESIGN.colors.primary
                          : DESIGN.colors.textSecondary
                      }
                    />
                    <Text style={modernStyles.cropLabel}>{crop.label}</Text>
                  </TouchableOpacity>

                  {selected && (
                    <View style={modernStyles.acreInputContainer}>
                      <TextInput
                        style={modernStyles.acreInput}
                        placeholder="Acre *"
                        keyboardType="numeric"
                        value={selected.acre}
                        onChangeText={(text) =>
                          setSelectedCrops((prev) =>
                            prev.map((c) =>
                              c.label === crop.label ? { ...c, acre: text } : c
                            )
                          )
                        }
                        placeholderTextColor={DESIGN.colors.textTertiary}
                        accessibilityLabel={`Acre input for ${crop.label}`}
                        accessibilityHint="Enter acre value for this crop"
                      />
                    </View>
                  )}
                </View>
              );
            })}

            <TouchableOpacity
              style={modernStyles.doneButton}
              onPress={() => {
                const isValid = selectedCrops.every(
                  (crop) => crop.acre && crop.acre.trim() !== ""
                );

                if (!isValid) {
                  Alert.alert(
                    "Validation Error",
                    "Please enter acre value for all selected crops."
                  );
                  return;
                }

                setCropModalVisible(false);
              }}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Done selecting crops"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons
                name="check"
                size={24}
                color={DESIGN.colors.surface}
              />
              <Text style={modernStyles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const modernStyles = StyleSheet.create({
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
  },

  fieldContainer: {
    marginBottom: DESIGN.spacing.md,
  },

  fieldLabel: {
    ...DESIGN.typography.label,
    color: DESIGN.colors.textPrimary,
    marginBottom: DESIGN.spacing.sm,
  },

  cropSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: DESIGN.colors.surface,
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
    borderRadius: DESIGN.borderRadius.sm,
    paddingHorizontal: DESIGN.spacing.md,
    paddingVertical: DESIGN.spacing.md,
    minHeight: 50,
  },

  cropSelectorText: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textTertiary,
    flex: 1,
  },

  cropSelectorTextActive: {
    color: DESIGN.colors.textPrimary,
  },

  dropdownContainer: {
    marginBottom: DESIGN.spacing.md,
    position: "relative",
  },

  dropdown: {
    backgroundColor: DESIGN.colors.surface,
    borderColor: DESIGN.colors.border,
    borderRadius: DESIGN.borderRadius.sm,
    minHeight: 50,
  },

  dropdownList: {
    backgroundColor: DESIGN.colors.surface,
    borderColor: DESIGN.colors.border,
  },

  dropdownText: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textPrimary,
  },

  placeholderText: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textTertiary,
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

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: DESIGN.colors.background,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: DESIGN.colors.surface,
    paddingHorizontal: DESIGN.spacing.lg,
    paddingVertical: DESIGN.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN.colors.border,
    ...DESIGN.shadows.subtle,
  },

  modalTitle: {
    ...DESIGN.typography.title,
    color: DESIGN.colors.textPrimary,
  },

  modalCloseButton: {
    width: 44,
    height: 44,
    borderRadius: DESIGN.borderRadius.sm,
    backgroundColor: DESIGN.colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    padding: DESIGN.spacing.lg,
    paddingBottom: DESIGN.spacing.xl,
  },

  cropItem: {
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.borderRadius.md,
    marginBottom: DESIGN.spacing.md,
    padding: DESIGN.spacing.md,
    borderWidth: 1,
    borderColor: DESIGN.colors.borderLight,
    ...DESIGN.shadows.subtle,
  },

  cropCheckbox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: DESIGN.spacing.sm,
    minHeight: 44, // Accessibility minimum touch target
  },

  cropLabel: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textPrimary,
    marginLeft: DESIGN.spacing.sm,
    flex: 1,
  },

  acreInputContainer: {
    paddingLeft: DESIGN.spacing.xl,
  },

  acreInput: {
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

  doneButton: {
    backgroundColor: DESIGN.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: DESIGN.spacing.md,
    borderRadius: DESIGN.borderRadius.md,
    marginTop: DESIGN.spacing.lg,
    ...DESIGN.shadows.medium,
    minHeight: 44, // Accessibility minimum touch target
  },

  doneButtonText: {
    ...DESIGN.typography.subtitle,
    color: DESIGN.colors.surface,
    marginLeft: DESIGN.spacing.sm,
  },
});
