import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Formik } from "formik";
import { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import apiClient from "../src/api/client";
import AppButton from "../src/components/form/appComponents/AppButton";
import { FarmerSchema } from "../src/validations/FarmerSchema";
import useMasterData from "../src/hooks/useMasterData";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DESIGN from "../src/theme";

function FarmerUpdateScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation();
  const farmerId = route.params?.id;
  const abortControllerRef = useRef(null);

  const [farmerData, setFarmerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedCrops, setSelectedCrops] = useState([]);
  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [cropOptions, setCropOptions] = useState([]);

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

  const [dropdowns, setDropdowns] = useState({
    state: false,
    district: false,
    taluka: false,
    irrigation: false,
    recommendedProduct: false,
  });

  const [formState, setFormState] = useState({
    state: null,
    district: null,
    taluka: null,
    irrigation: null,
    recommendedProduct: null,
  });

  useEffect(() => {
    fetchFarmerData();
    
    // Cleanup function to abort any pending requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [farmerId]);

  const fetchFarmerData = async () => {
    try {
      setLoading(true);
      
      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      // Load crop options first
      await loadCrops(setCropOptions);

      // Load other dropdowns
      await loadStates();
      await loadIrrigation();
      await loadProducts();

      const response = await apiClient.get(`farmer/${farmerId}/`, {
        signal: abortControllerRef.current.signal,
        timeout: 10000 // 10 second timeout
      });
      const data = response.data;

      setFarmerData(data);

      // Load dependent dropdowns
      if (data.state?.id) {
        await loadDistricts(data.state.id);
      }

      if (data.district?.id) {
        await loadTalukas(data.district.id);
      }

      setFormState({
        state: data.state?.id || null,
        district: data.district?.id || null,
        taluka: data.taluka?.id || null,
        irrigation: data.crop_details?.[0]?.irrigation || null,
        recommendedProduct: data.crop_details[0].recommend?.id || null
      });

      if (data.crop_details && data.crop_details.length > 0) {
        const crops = data.crop_details.map(cd => ({
          label: cropOptions.find(c => c.id === cd.crop.id)?.name || cd.crop.name,
          value: cd.crop.id,
          acre: cd.acre ? cd.acre.toString() : "0"
        }));

        setSelectedCrops(crops);

        const firstCrop = data.crop_details[0];

        setFormState(prev => ({
          ...prev,
          irrigation: firstCrop.irrigation || null,
          recommendedProduct: firstCrop.recommend?.id || null,
        }));
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        // Request was cancelled, do nothing
        return;
      }
      
      if (error.response) {
        const { status } = error.response;
        
        if (status === 401) {
          Alert.alert("Session Expired", "Please log in again.");
          return;
        }
        
        if (status === 404) {
          Alert.alert("Error", "Farmer not found");
          navigation.goBack();
          return;
        }
      }
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        Alert.alert("Connection Timeout", "Can't reach server. Please check your connection and try again.");
        navigation.goBack();
        return;
      }
      
      if (!error.response) {
        Alert.alert("Network Error", "Can't reach server. Please check your internet connection.");
        navigation.goBack();
        return;
      }
      
      Alert.alert("Error", "Failed to load farmer data");
      navigation.goBack();
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleSubmit = async (values) => {
    // Prevent double submission
    if (updating) return;
    
    try {
      setUpdating(true);
      
      // Create abort controller for this request
      abortControllerRef.current = new AbortController();
      
      // Validation checks
      if (selectedCrops.length === 0) {
        Alert.alert("Validation Error", "Please select at least one crop.");
        return;
      }

      const invalidCrops = selectedCrops.filter(
        (crop) =>
          !crop.value ||
          !crop.acre ||
          crop.acre.trim() === "" ||
          parseFloat(crop.acre) <= 0
      );
      if (invalidCrops.length > 0) {
        Alert.alert(
          "Validation Error",
          "Please ensure all selected crops have valid crop type and acre values greater than 0."
        );
        return;
      }

      if (!formState.state || !formState.district || !formState.taluka) {
        Alert.alert(
          "Validation Error",
          "Please select State, District, and Taluka."
        );
        return;
      }

      const payload = {
        id: farmerId,
        farmer_name: values.name?.trim(),
        mobile_no: values.mobile?.trim(),
        city: values.city?.trim(),
        total_acre: parseFloat(values.acre),
        state: {
          id: formState.state,
          name: states.find((s) => s.value === formState.state)?.label || "",
        },
        district: {
          id: formState.district,
          name:
            districts.find((d) => d.value === formState.district)?.label || "",
        },
        taluka: {
          id: formState.taluka,
          name: talukas.find((t) => t.value === formState.taluka)?.label || "",
        },
        location_latitude: farmerData.location_latitude || 0,
        location_longitude: farmerData.location_longitude || 0,
        crop_details: selectedCrops.map((crop) => ({
          crop: crop.value,
          acre: parseFloat(crop.acre).toFixed(2),
          irrigation: formState.irrigation || "",
          current_product_used: values.Current_Product?.trim() || "",
          recommend: formState.recommendedProduct || "",
        })),
        remark: values.remark?.trim() || "",
      };

      const response = await apiClient.patch(`farmer/${farmerId}/`, payload, {
        signal: abortControllerRef.current.signal,
        timeout: 10000 // 10 second timeout
      });

      // Success - show alert and navigate back
      Alert.alert("Success", "Farmer updated successfully", [
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
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 401) {
          Alert.alert("Session Expired", "Please log in again.");
          return;
        }
        
        if (status >= 400 && status < 500) {
          // Validation error
          const errorMessage = data?.detail || data?.message || "Please fix the highlighted fields.";
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
      Alert.alert("Error", "Something went wrong while updating farmer.");
      
    } finally {
      setUpdating(false);
      abortControllerRef.current = null;
    }
  };

  if (loading) {
    return (
      <View style={modernStyles.loadingContainer}>
        <ActivityIndicator size="large" color={DESIGN.colors.primary} />
        <Text>Loading farmer data...</Text>
      </View>
    );
  }

  if (!farmerData) {
    return (
      <View style={modernStyles.loadingContainer}>
        <Text>No farmer data found</Text>
        <AppButton
          title="Go Back"
          onPress={() => {
            navigation.goBack();
          }}
        />
      </View>
    );
  }

  return (
    <>
      <View style={{ flex: 1, paddingBottom: insets.bottom }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
          <View style={modernStyles.formWrapper}>
            <Formik
              initialValues={{
                name: farmerData.farmer_name || "",
                mobile: farmerData.mobile_no || "",
                city: farmerData.city || "",
                acre: farmerData.total_acre
                  ? farmerData.total_acre.toString()
                  : "",
                Current_Product: farmerData.crop_details?.[0]?.current_product_used || "",
                remark: farmerData.remark || "",
              }}
              validationSchema={FarmerSchema}
              onSubmit={handleSubmit}
              enableReinitialize={true}
              validateOnChange={true}
              validateOnBlur={true}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
                isSubmitting,
              }) => {
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
                        <TextInput
                          style={modernStyles.input}
                          placeholder="Name *"
                          onChangeText={(text) => {
                            handleChange("name")(text);
                          }}
                          onBlur={handleBlur("name")}
                          value={values.name}
                          accessibilityLabel="Farmer name input"
                          accessibilityHint="Enter the farmer's full name"
                        />
                        {touched.name && errors.name && (
                          <Text style={modernStyles.error}>{errors.name}</Text>
                        )}
                      </View>

                      <View style={modernStyles.inputContainer}>
                        <TextInput
                          style={modernStyles.input}
                          placeholder="Mobile *"
                          keyboardType="numeric"
                          maxLength={10}
                          onChangeText={(text) => {
                            handleChange("mobile")(text);
                          }}
                          onBlur={handleBlur("mobile")}
                          value={values.mobile}
                          accessibilityLabel="Mobile number input"
                          accessibilityHint="Enter 10-digit mobile number"
                        />
                        {touched.mobile && errors.mobile && (
                          <Text style={modernStyles.error}>{errors.mobile}</Text>
                        )}
                      </View>

                      <View style={modernStyles.inputContainer}>
                        <TextInput
                          style={modernStyles.input}
                          placeholder="City *"
                          onChangeText={(text) => {
                            handleChange("city")(text);
                          }}
                          onBlur={handleBlur("city")}
                          value={values.city}
                          accessibilityLabel="City input"
                          accessibilityHint="Enter the city name"
                        />
                        {touched.city && errors.city && (
                          <Text style={modernStyles.error}>{errors.city}</Text>
                        )}
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
                        <DropDownPicker
                          open={dropdowns.state}
                          setOpen={async (open) => {
                            setDropdowns((prev) => ({
                              ...prev,
                              state: open,
                              district: false,
                              taluka: false,
                            }));
                            if (open && states.length === 0) {
                              await loadStates();
                            }
                          }}
                          value={formState.state}
                          setValue={(callback) => {
                            const newStateValue =
                              typeof callback === "function"
                                ? callback(formState.state)
                                : callback;
                            setFormState((prev) => ({
                              ...prev,
                              state: newStateValue,
                              district: null,
                              taluka: null,
                            }));
                            if (newStateValue) {
                              loadDistricts(newStateValue);
                            }
                          }}
                          items={states}
                          placeholder="Select State *"
                          searchable={true}
                          searchablePlaceholder="Search State"
                          listMode="SCROLLVIEW"
                          maxHeight={200}
                          searchableError={() => "State not found"}
                          style={modernStyles.dropdown}
                          zIndex={1000}
                        />
                      </View>

                      <View style={modernStyles.dropdownContainer}>
                        <DropDownPicker
                          open={dropdowns.district}
                          setOpen={async (open) => {
                            setDropdowns((prev) => ({
                              ...prev,
                              district: open,
                              state: false,
                              taluka: false,
                            }));
                            if (
                              open &&
                              formState.state &&
                              districts.length === 0
                            ) {
                              await loadDistricts(formState.state);
                            }
                          }}
                          value={formState.district}
                          setValue={(callback) => {
                            const newDistrictValue =
                              typeof callback === "function"
                                ? callback(formState.district)
                                : callback;

                            setFormState((prev) => ({
                              ...prev,
                              district: newDistrictValue,
                              taluka: null,
                            }));
                            if (newDistrictValue) {
                              loadTalukas(newDistrictValue);
                            }
                          }}
                          items={districts}
                          placeholder="Select District *"
                          searchable={true}
                          searchablePlaceholder="Search District"
                          listMode="SCROLLVIEW"
                          maxHeight={200}
                          searchableError={() => "District not found"}
                          style={modernStyles.dropdown}
                          zIndex={900}
                        />
                      </View>

                      <View style={modernStyles.dropdownContainer}>
                        <DropDownPicker
                          open={dropdowns.taluka}
                          setOpen={async (open) => {
                            setDropdowns((prev) => ({
                              ...prev,
                              taluka: open,
                              district: false,
                              state: false,
                            }));
                            if (
                              open &&
                              formState.district &&
                              talukas.length === 0
                            ) {
                              await loadTalukas(formState.district);
                            }
                          }}
                          value={formState.taluka}
                          setValue={(callback) => {
                            const newTalukaValue =
                              typeof callback === "function"
                                ? callback(formState.taluka)
                                : callback;
                            setFormState((prev) => ({
                              ...prev,
                              taluka: newTalukaValue,
                            }));
                          }}
                          items={talukas}
                          placeholder="Select Taluka *"
                          searchable={true}
                          searchablePlaceholder="Search Taluka"
                          listMode="SCROLLVIEW"
                          maxHeight={200}
                          searchableError={() => "Taluka not found"}
                          style={modernStyles.dropdown}
                          zIndex={800}
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
                        <TextInput
                          style={modernStyles.input}
                          placeholder="Total Acre *"
                          keyboardType="numeric"
                          onChangeText={(text) => {
                            handleChange("acre")(text);
                          }}
                          onBlur={handleBlur("acre")}
                          value={values.acre}
                          accessibilityLabel="Total acre input"
                          accessibilityHint="Enter the total acreage"
                        />
                        {touched.acre && errors.acre && (
                          <Text style={modernStyles.error}>{errors.acre}</Text>
                        )}
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
                            setDropdowns((prev) => ({
                              ...prev,
                              irrigation: open,
                              recommendedProduct: false,
                            }));
                          }}
                          value={formState.irrigation}
                          setValue={(callback) => {
                            const newValue =
                              typeof callback === "function"
                                ? callback(formState.irrigation)
                                : callback;
                            setFormState((prev) => ({
                              ...prev,
                              irrigation: newValue,
                            }));
                          }}
                          items={irrigationTypes}
                          placeholder="Select Irrigation Type"
                          searchable={true}
                          searchablePlaceholder="Search Irrigation"
                          listMode="SCROLLVIEW"
                          maxHeight={200}
                          searchableError={() => "Irrigation not found"}
                          style={modernStyles.dropdown}
                          zIndex={700}
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
                        <TextInput
                          style={modernStyles.input}
                          placeholder="Current Product *"
                          onChangeText={(text) => {
                            handleChange("Current_Product")(text);
                          }}
                          onBlur={handleBlur("Current_Product")}
                          value={values.Current_Product}
                          accessibilityLabel="Current product input"
                          accessibilityHint="Enter the current product being used"
                        />
                        {touched.Current_Product && errors.Current_Product && (
                          <Text style={modernStyles.error}>{errors.Current_Product}</Text>
                        )}
                      </View>

                      <View style={modernStyles.dropdownContainer}>
                        <DropDownPicker
                          open={dropdowns.recommendedProduct}
                          setOpen={(open) => {
                            if (open) loadProducts();
                            setDropdowns((prev) => ({
                              ...prev,
                              recommendedProduct: open,
                              irrigation: false,
                            }));
                          }}
                          value={formState.recommendedProduct}
                          setValue={(callback) => {
                            const newValue =
                              typeof callback === "function"
                                ? callback(formState.recommendedProduct)
                                : callback;

                            setFormState((prev) => ({
                              ...prev,
                              recommendedProduct: newValue,
                            }));
                          }}
                          items={products}
                          placeholder="Recommended Product"
                          searchable={true}
                          searchablePlaceholder="Search Recommended Product"
                          listMode="SCROLLVIEW"
                          maxHeight={200}
                          searchableError={() => "Recommended Product not found"}
                          style={modernStyles.dropdown}
                          zIndex={500}
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
                        <TextInput
                          style={modernStyles.input}
                          placeholder="Remark"
                          multiline
                          numberOfLines={3}
                          onChangeText={(text) => {
                            handleChange("remark")(text);
                          }}
                          value={values.remark}
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
                          updating && modernStyles.submitButtonDisabled
                        ]}
                        onPress={handleSubmit}
                        disabled={updating}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                        accessibilityLabel="Update farmer details"
                        accessibilityHint="Submits the farmer update form"
                        accessibilityState={{ disabled: updating }}
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
                              Update Farmer
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
      </View>

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
                (c) => c.value === crop.value
              );

              return (
                <View key={index} style={modernStyles.cropItem}>
                  <TouchableOpacity
                    onPress={() => {
                      if (selected) {
                        setSelectedCrops((prev) =>
                          prev.filter((c) => c.value !== crop.value)
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
                        placeholder="Acre"
                        keyboardType="numeric"
                        value={selected.acre}
                        onChangeText={(text) => {
                          setSelectedCrops((prev) =>
                            prev.map((c) =>
                              c.value === crop.value ? { ...c, acre: text } : c
                            )
                          );
                        }}
                        accessibilityLabel={`Acre input for ${crop.label}`}
                        accessibilityHint="Enter acre value for this crop"
                      />
                    </View>
                  )}
                </View>
              );
            })}

            <View style={modernStyles.modalButtons}>
              <AppButton
                title="Cancel"
                style={[modernStyles.modalButton, modernStyles.cancelButton]}
                onPress={() => {
                  setCropModalVisible(false);
                }}
              />
              <AppButton
                title="Done"
                style={[modernStyles.modalButton, modernStyles.doneButton]}
                onPress={() => {
                  const isValid = selectedCrops.every(
                    (crop) =>
                      crop.acre &&
                      crop.acre.trim() !== "" &&
                      parseFloat(crop.acre) > 0
                  );

                  if (!isValid) {
                    Alert.alert(
                      "Validation Error",
                      "Please enter valid acre value (greater than 0) for all selected crops."
                    );
                    return;
                  }

                  setCropModalVisible(false);
                }}
              />
            </View>
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

  error: {
    ...DESIGN.typography.caption,
    color: DESIGN.colors.error,
    marginTop: DESIGN.spacing.xs,
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

  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: DESIGN.spacing.lg,
  },

  modalButton: {
    flex: 1,
    marginHorizontal: DESIGN.spacing.sm,
  },

  cancelButton: {
    backgroundColor: DESIGN.colors.textTertiary,
  },

  doneButton: {
    backgroundColor: DESIGN.colors.primary,
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

  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default FarmerUpdateScreen;






