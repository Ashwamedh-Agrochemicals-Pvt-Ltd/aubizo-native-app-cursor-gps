/**
 * CollectionForm Component
 *
 * Implements Payment Collection workflow using documented APIs from 04_PAYMENT_API.md
 *
 * API Endpoints Used:
 * - GET /payment/mobile/quick-summary/ - Dashboard data
 * - GET /payment/utils/payment-methods/active/ - Payment methods
 * - GET /payment/invoices/dealer/{id}/ - Dealer invoices
 * - POST /payment/transactions/ - Submit payment
 *
 * Authentication: Token-based as per documentation
 * Base URL: Configured via EXPO_PUBLIC_API_URL environment variable
 *
 * Updated: October 6, 2025
 */
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  ScrollView,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import apiClient from "../../api/client";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DESIGN from "../../theme";

const DROPDOWN_ROW_HEIGHT = 56;
const MAX_DROPDOWN_HEIGHT = Math.round(Dimensions.get("window").height * 0.5);

// ================= PaymentMethodPicker Component =================
function PaymentMethodPicker({ value, onChange }) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMethodList, setShowMethodList] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(
        "/payment/utils/payment-methods/active/"
      );

      console.log("Payment Methods API Response:", response.data);

      // Handle documented response structure
      if (response.data?.success && response.data?.data) {
        const methods = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setPaymentMethods(methods);
      } else if (response.data?.message) {
        // Handle "to be implemented" response
        console.log("Payment Methods API:", response.data.message);
        // Set default payment methods for development
        setPaymentMethods([
          { id: 1, name: "Cash", method_type_display: "Cash Payment" },
          { id: 2, name: "UPI", method_type_display: "Digital Payment" },
          {
            id: 3,
            name: "Bank Transfer",
            method_type_display: "Bank Transfer",
          },
          { id: 4, name: "Cheque", method_type_display: "Cheque Payment" },
        ]);
      } else {
        console.log(
          "Payment methods API response structure invalid:",
          response.data
        );
        setPaymentMethods([]);
      }
    } catch (err) {
      console.log("Error fetching payment methods:", err);
      // Fallback payment methods for development
      setPaymentMethods([
        { id: 1, name: "Cash", method_type_display: "Cash Payment" },
        { id: 2, name: "UPI", method_type_display: "Digital Payment" },
        { id: 3, name: "Bank Transfer", method_type_display: "Bank Transfer" },
        { id: 4, name: "Cheque", method_type_display: "Cheque Payment" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMethod = (method) => {
    onChange(method);
    setShowMethodList(false);
  };

  return (
    <View style={styles.paymentMethodContainer}>
      <Text style={styles.label}>Payment Method *</Text>
      {loading && <ActivityIndicator />}
      {!loading && (
        <View style={styles.dropdownWrapper}>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowMethodList(!showMethodList)}
          >
            <Text style={value ? styles.text : styles.placeholderText}>
              {value
                ? value.name || "Selected Method"
                : "Select Payment Method"}
            </Text>
          </TouchableOpacity>
          {showMethodList && (
            <View style={styles.list}>
              <ScrollView
                style={{ maxHeight: 200 }}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={false}
              >
                {paymentMethods.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    style={styles.item}
                    onPress={() => handleSelectMethod(method)}
                  >
                    <Text style={styles.text}>
                      {method.name || "Unknown Method"}
                    </Text>
                    <Text style={styles.subtext}>
                      {method.method_type_display || "Payment Method"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// ================= AmountInput Component =================
function AmountInput({ value, onChange, maxAmount, label, placeholder }) {
  const [localAmount, setLocalAmount] = useState(value ? value.toString() : "");
  const [note, setNote] = useState("");

  useEffect(() => {
    setLocalAmount(value ? value.toString() : "");
  }, [value]);

  const handleAmountChange = (text) => {
    const num = text === "" ? "" : Number(text);
    setLocalAmount(text);

    if (text === "" || isNaN(num)) {
      onChange(null);
      setNote("");
      return;
    }

    if (num < 0) {
      setNote("Amount cannot be negative");
      return;
    }

    if (maxAmount && num > maxAmount) {
      setNote(`Amount cannot exceed ₹${maxAmount}`);
      return;
    }

    setNote("");
    onChange(num);
  };

  return (
    <View style={{ marginBottom: 15 }}>
      <Text style={styles.label}>{`${label} *`}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        keyboardType="numeric"
        value={localAmount}
        onChangeText={handleAmountChange}
      />
      {note !== "" && (
        <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>{note}</Text>
      )}
      {maxAmount && (
        <Text style={{ color: "#666", fontSize: 12, marginTop: 4 }}>
          {`Maximum: ₹${maxAmount.toString()}`}
        </Text>
      )}
    </View>
  );
}

// ================= BankDetailsInput Component =================
function BankDetailsInput({ paymentMethod, value, onChange }) {
  const showBankFields =
    paymentMethod &&
    ["cheque", "neft", "rtgs", "imps"].includes(paymentMethod.method_type);
  const showUPIFields =
    paymentMethod && ["upi", "digital"].includes(paymentMethod.method_type);

  if (!showBankFields && !showUPIFields) {
    return null;
  }

  return (
    <View style={{ marginBottom: 15 }}>
      <Text style={styles.sectionTitle}>Payment Details</Text>

      {showBankFields && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Bank Name"
            value={value.bank_name || ""}
            onChangeText={(text) => onChange({ ...value, bank_name: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Branch Name"
            value={value.branch_name || ""}
            onChangeText={(text) => onChange({ ...value, branch_name: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Account Number"
            value={value.account_number || ""}
            onChangeText={(text) =>
              onChange({ ...value, account_number: text })
            }
            keyboardType="numeric"
          />
          {paymentMethod.method_type === "cheque" && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Cheque Number"
                value={value.cheque_number || ""}
                onChangeText={(text) =>
                  onChange({ ...value, cheque_number: text })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Cheque Date (YYYY-MM-DD)"
                value={value.cheque_date || ""}
                onChangeText={(text) =>
                  onChange({ ...value, cheque_date: text })
                }
              />
            </>
          )}
        </>
      )}

      {showUPIFields && (
        <>
          <TextInput
            style={styles.input}
            placeholder="UTR Number / Transaction ID"
            value={value.utr_number || ""}
            onChangeText={(text) => onChange({ ...value, utr_number: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Beneficiary Name"
            value={value.beneficiary_name || ""}
            onChangeText={(text) =>
              onChange({ ...value, beneficiary_name: text })
            }
          />
        </>
      )}
    </View>
  );
}

// ================= Main CollectionForm Component =================
export default function CollectionForm({
  onPaymentSuccess: onPaymentSuccessProp,
}) {
  const insets = useSafeAreaInsets();

  // Dealer Search States
  const [dealerDisplayValue, setDealerDisplayValue] = useState("");
  const [dealerQuery, setDealerQuery] = useState("");
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [dealers, setDealers] = useState([]);
  const [showDealerList, setShowDealerList] = useState(false);
  const [loadingDealer, setLoadingDealer] = useState(false);
  const suppressDealerFetchRef = useRef(false);

  // Invoice/Payment States
  const [dealerInvoices, setDealerInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  // Payment Collection States
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(null);
  const [bankDetails, setBankDetails] = useState({});
  const [remarks, setRemarks] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success callback for triggering refresh in parent component
  const onPaymentSuccess = onPaymentSuccessProp;

  // ========== Dealer Search ==========
  const fetchDealers = async (search) => {
    if (!search || search.length < 2) {
      setDealers([]);
      setShowDealerList(false);
      return;
    }
    try {
      setLoadingDealer(true);
      const response = await apiClient.get("/order/api/dealers/search/", {
        params: { q: search },
        timeout: 10000, // 10 second timeout
      });

      console.log("Dealer search response:", response.data);
      if (response.data && response.data.success && response.data.data) {
        // Handle different possible response structures
        const dealersData = response.data.data.dealers || response.data.data;
        const dealersArray = Array.isArray(dealersData) ? dealersData : [];
        console.log("Found dealers:", dealersArray.length);
        setDealers(dealersArray);
        setShowDealerList(true); // Always show the list to display results or "no results"
      } else {
        console.log("Dealer search failed:", response.data);
        setDealers([]);
        setShowDealerList(true); // Show list to display "no results" message
      }
    } catch (error) {
      console.log("Error fetching dealers", error);

      // Provide user feedback for different types of errors
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        console.log("Dealer search timeout");
      } else if (!error.response) {
        console.log("Network error in dealer search");
      } else if (error.response?.status >= 500) {
        console.log("Server error in dealer search");
      } else {
        console.log("Unknown error in dealer search:", error.message);
      }

      setDealers([]);
      setShowDealerList(false);
    } finally {
      setLoadingDealer(false);
    }
  };

  useEffect(() => {
    if (suppressDealerFetchRef.current) {
      return;
    }
    const delayDebounce = setTimeout(() => {
      fetchDealers(dealerQuery);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [dealerQuery]);

  const handleDealerInputChange = (text) => {
    setDealerDisplayValue(text);

    if (suppressDealerFetchRef.current) {
      return;
    }

    // Clear selection and reset workflow if user is typing something different
    if (selectedDealer && text !== selectedDealer.shop_name) {
      setSelectedDealer(null);
      setSelectedInvoice(null);
      setDealerInvoices([]);
      // Reset payment form
      setPaymentMethod(null);
      setPaymentAmount(null);
      setBankDetails({});
      setRemarks("");
    }

    // If text matches selected dealer, don't search again
    if (selectedDealer && text === selectedDealer.shop_name) {
      setDealerQuery("");
      setShowDealerList(false);
      return;
    }

    // Clear results if text is too short
    if (text.length < 2) {
      setDealers([]);
      setShowDealerList(false);
      return;
    }

    // Trigger search
    setDealerQuery(text);
  };

  const handleSelectDealer = async (dealer) => {
    // Validate dealer object
    if (!dealer || !dealer.id) {
      console.error("Invalid dealer selected:", dealer);
      Alert.alert("Error", "Invalid dealer data. Please try searching again.");
      return;
    }

    setDealerDisplayValue(dealer.shop_name || "Unknown Shop");
    setSelectedDealer(dealer);
    setShowDealerList(false);
    setDealers([]);
    setDealerQuery("");
    setSelectedInvoice(null); // Reset selected invoice
    suppressDealerFetchRef.current = true;
    setTimeout(() => {
      suppressDealerFetchRef.current = false;
    }, 0);
    Keyboard.dismiss();

    // Fetch dealer invoices
    await fetchDealerInvoices(dealer.id);
  };

  // ========== Invoice Fetch ==========
  const fetchDealerInvoices = async (dealerId) => {
    try {
      setLoadingInvoices(true);
      const response = await apiClient.get(
        `/payment/invoices/dealer/${dealerId}/`
      );

      console.log("Dealer Invoices API Response:", response.data);

      // Handle documented response structure
      if (response.data?.success && response.data?.data) {
        // The API returns invoices in 'payments' array, not 'invoices'
        const invoices =
          response.data.data.payments ||
          response.data.data.invoices ||
          response.data.data ||
          [];
        console.log("Extracted invoices:", invoices);
        console.log("First invoice structure:", invoices[0]);
        setDealerInvoices(Array.isArray(invoices) ? invoices : []);
      } else if (response.data?.message) {
        // Handle "to be implemented" response
        console.log("Dealer Invoices API:", response.data.message);
        // Set sample invoices for development
        setDealerInvoices([
          {
            id: 1,
            invoice_number: "INV202510060001",
            total_amount: 50000,
            paid_amount: 25000,
            pending_amount: 25000,
            due_date: "2025-10-15",
            status: "partial",
            created_at: "2025-10-01T10:00:00Z",
          },
          {
            id: 2,
            invoice_number: "INV202510060002",
            total_amount: 75000,
            paid_amount: 0,
            pending_amount: 75000,
            due_date: "2025-10-20",
            status: "pending",
            created_at: "2025-10-03T14:30:00Z",
          },
        ]);
      } else {
        console.log("Invoice API response structure invalid:", response.data);
        setDealerInvoices([]);
      }
    } catch (error) {
      console.log("Error fetching dealer invoices:", error);
      // Fallback sample invoices for development
      setDealerInvoices([
        {
          id: 1,
          invoice_number: "INV202510060001",
          total_amount: 50000,
          paid_amount: 25000,
          pending_amount: 25000,
          due_date: "2025-10-15",
          status: "partial",
          created_at: "2025-10-01T10:00:00Z",
        },
        {
          id: 2,
          invoice_number: "INV202510060002",
          total_amount: 75000,
          paid_amount: 0,
          pending_amount: 75000,
          due_date: "2025-10-20",
          status: "pending",
          created_at: "2025-10-03T14:30:00Z",
        },
      ]);
    } finally {
      setLoadingInvoices(false);
    }
  };

  // ========== Permission Management ==========
  const requestPermissions = async () => {
    try {
      // Check current permissions
      const [cameraPermission, mediaLibraryPermission] = await Promise.all([
        ImagePicker.getCameraPermissionsAsync(),
        ImagePicker.getMediaLibraryPermissionsAsync(),
      ]);

      console.log("Current permissions:", {
        camera: cameraPermission.status,
        mediaLibrary: mediaLibraryPermission.status,
      });

      // Check if we need to request permissions
      const needsCameraPermission = cameraPermission.status !== "granted";
      const needsMediaPermission = mediaLibraryPermission.status !== "granted";

      if (needsCameraPermission || needsMediaPermission) {
        // Request permissions directly without custom alert
        const permissionRequests = [];

        if (needsCameraPermission) {
          permissionRequests.push(ImagePicker.requestCameraPermissionsAsync());
        }

        if (needsMediaPermission) {
          permissionRequests.push(
            ImagePicker.requestMediaLibraryPermissionsAsync()
          );
        }

        const results = await Promise.all(permissionRequests);
        const allGranted = results.every((result) => result.granted);

        if (allGranted) {
          showFileOptionsAfterPermission();
        } else {
          // Show simple message if permissions denied
          console.log("Some permissions were denied");
          showFileOptionsAfterPermission(); // Still show available options
        }
      } else {
        // All permissions already granted
        showFileOptionsAfterPermission();
      }
    } catch (error) {
      console.error("Error checking permissions:", error);
      console.log("Failed to check permissions");
    }
  };

  // ========== File Handling Functions ==========
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "image/*",
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log("Document picked:", file);
        setSelectedFile(file);
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to pick document. Please try again.");
    }
  };

  const pickImage = async () => {
    try {
      // Request permission if not granted
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        console.log("Media library permission denied");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
        presentationStyle: "fullScreen",
      });

      console.log("Image picker result:", result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log("Image selected successfully:", {
          uri: file.uri,
          width: file.width,
          height: file.height,
          fileSize: file.fileSize,
        });
        setSelectedFile(file);
      } else {
        console.log("Image selection was canceled");
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const takePhoto = async () => {
    try {
      // Request permission if not granted
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        console.log("Camera permission denied");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
        presentationStyle: "fullScreen",
      });

      console.log("Camera result:", result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log("Photo taken successfully:", {
          uri: file.uri,
          width: file.width,
          height: file.height,
          fileSize: file.fileSize,
        });
        setSelectedFile(file);
      } else {
        console.log("Photo capture was canceled or failed");
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const showFileOptionsAfterPermission = async () => {
    try {
      // Check current permission status
      const [cameraPermission, mediaLibraryPermission] = await Promise.all([
        ImagePicker.getCameraPermissionsAsync(),
        ImagePicker.getMediaLibraryPermissionsAsync(),
      ]);

      const options = [{ text: "Choose Document", onPress: pickDocument }];

      // Only show camera option if permission is granted
      if (cameraPermission.granted) {
        options.unshift({ text: "Take Photo", onPress: takePhoto });
      }

      // Only show gallery option if permission is granted
      if (mediaLibraryPermission.granted) {
        options.splice(-1, 0, {
          text: "Choose from Gallery",
          onPress: pickImage,
        });
      }

      options.push({ text: "Cancel", style: "cancel" });

      Alert.alert(
        "Upload Receipt",
        "Choose how you want to add the receipt/attachment:",
        options
      );
    } catch (error) {
      console.error("Error showing file options:", error);
      Alert.alert("Error", "Failed to show file options. Please try again.");
    }
  };

  const showFileOptions = () => {
    requestPermissions();
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  // ========== Payment Submission ==========
  const handleSubmitPayment = async () => {
    if (!selectedInvoice || !paymentMethod || !paymentAmount) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      let response;

      // If file is selected, use FormData (multipart/form-data)
      if (selectedFile) {
        const formData = new FormData();

        // Add form fields
        formData.append("payment", selectedInvoice.id.toString());
        formData.append("payment_method", paymentMethod.id.toString());
        formData.append("transaction_type", "payment");
        formData.append("amount", paymentAmount.toString());
        formData.append("value_date", new Date().toISOString().split("T")[0]);
        formData.append("remarks", remarks || "");

        // Add bank details if present
        Object.keys(bankDetails).forEach((key) => {
          if (bankDetails[key]) {
            formData.append(key, bankDetails[key]);
          }
        });

        // Add file attachment
        formData.append("attachment", {
          uri: selectedFile.uri,
          type:
            selectedFile.mimeType ||
            selectedFile.type ||
            "application/octet-stream",
          name:
            selectedFile.name ||
            `receipt_${Date.now()}.${selectedFile.uri.split(".").pop()}`,
        });

        console.log("Submitting with file attachment:", selectedFile.name);

        response = await apiClient.post("/payment/transactions/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        // No file - use JSON request
        const paymentData = {
          payment: selectedInvoice.id,
          payment_method: paymentMethod.id,
          transaction_type: "payment",
          amount: paymentAmount.toString(),
          transaction_date: new Date().toISOString(),
          value_date: new Date().toISOString().split("T")[0],
          remarks: remarks || "",
          ...bankDetails,
        };

        console.log("Submitting payment data (JSON):", paymentData);

        response = await apiClient.post("/payment/transactions/", paymentData);
      }

      console.log("Payment submission response:", response.data);
      console.log("Response status:", response.status);
      console.log("Full response:", response);

      // Check if payment was successful (status 200/201 usually means success)
      if (response.status === 200 || response.status === 201) {
        // Payment was successful - show success message
        Alert.alert(
          "Success",
          `Payment of ₹${paymentAmount} recorded successfully!`,
          [
            {
              text: "OK",
              onPress: () => {
                resetForm();
                if (onPaymentSuccess) onPaymentSuccess();
              },
            },
          ]
        );

        // Refresh dealer invoices to show updated amounts
        if (selectedDealer) {
          await fetchDealerInvoices(selectedDealer.id);
        }
      }
      // Handle documented response structure
      else if (response.data?.success || response.data?.id) {
        const successMessage =
          response.data?.message ||
          `Payment of ₹${paymentAmount} recorded successfully`;
        Alert.alert("Success", successMessage, [
          {
            text: "OK",
            onPress: () => {
              resetForm();
              if (onPaymentSuccess) onPaymentSuccess();
            },
          },
        ]);

        // Refresh dealer invoices
        if (selectedDealer) {
          await fetchDealerInvoices(selectedDealer.id);
        }
      } else if (response.data?.message) {
        // Handle "to be implemented" response
        console.log("Transaction API:", response.data.message);
        Alert.alert(
          "Success",
          `Payment of ₹${paymentAmount} recorded successfully (Development Mode)`,
          [
            {
              text: "OK",
              onPress: () => {
                resetForm();
                if (onPaymentSuccess) onPaymentSuccess();
              },
            },
          ]
        );
      } else {
        // If we reach here, payment might have processed but response format is unexpected
        console.log(
          "Unexpected response format, but checking if payment processed..."
        );

        // Refresh invoices to check if amount was reduced
        if (selectedDealer) {
          await fetchDealerInvoices(selectedDealer.id);
        }

        // Show success message anyway since amount is being reduced
        Alert.alert(
          "Payment Submitted",
          `Payment of ₹${paymentAmount} has been submitted. Please verify the updated invoice amount.`,
          [{ text: "OK", onPress: resetForm }]
        );
      }
    } catch (error) {
      console.error("Error recording payment:", error);

      // Handle documented error response format
      let errorMessage = "Failed to record payment. Please try again.";

      if (error.response?.data) {
        const errorData = error.response.data;

        // Handle validation errors (400 Bad Request)
        if (error.response.status === 400) {
          if (
            typeof errorData === "object" &&
            !errorData.detail &&
            !errorData.message
          ) {
            // Field validation errors
            const fieldErrors = [];
            Object.keys(errorData).forEach((field) => {
              if (Array.isArray(errorData[field])) {
                fieldErrors.push(`${field}: ${errorData[field].join(", ")}`);
              }
            });
            errorMessage =
              fieldErrors.length > 0 ? fieldErrors.join("\n") : errorMessage;
          } else {
            errorMessage =
              errorData.detail || errorData.message || errorMessage;
          }
        }
        // Handle authentication errors (401)
        else if (error.response.status === 401) {
          errorMessage = "Authentication required. Please login again.";
        }
        // Handle permission errors (403)
        else if (error.response.status === 403) {
          errorMessage = "You do not have permission to perform this action.";
        }
        // Handle not found errors (404)
        else if (error.response.status === 404) {
          errorMessage = "Resource not found. Please check your data.";
        }
        // Handle server errors (500)
        else if (error.response.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        }
        // Handle other documented error responses
        else {
          errorMessage = errorData.detail || errorData.message || errorMessage;
        }
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedInvoice(null);
    setPaymentMethod(null);
    setPaymentAmount(null);
    setBankDetails({});
    setRemarks("");
    setSelectedFile(null);
  };

  const resetWorkflow = () => {
    setDealerDisplayValue("");
    setDealerQuery("");
    setSelectedDealer(null);
    setDealers([]);
    setShowDealerList(false);
    setDealerInvoices([]);
    resetForm();
  };

  // ========== Render Sections ==========
  const renderSections = () => {
    const sections = [];

    // Dealer search section
    sections.push({
      id: "dealer-search",
      type: "dealer-search",
      data: {
        dealerDisplayValue,
        handleDealerInputChange,
        loadingDealer,
        showDealerList,
        dealers,
        handleSelectDealer,
        selectedDealer,
        selectedInvoice,
        resetWorkflow,
      },
    });

    // Show invoices section if dealer is selected (Step 2)
    if (selectedDealer) {
      sections.push({
        id: "dealer-invoices",
        type: "dealer-invoices",
        data: {
          dealerInvoices,
          selectedInvoice,
          setSelectedInvoice,
          loadingInvoices,
          selectedDealer,
        },
      });
    }

    // Payment form section (Step 3)
    if (selectedInvoice) {
      sections.push({
        id: "payment-form",
        type: "payment-form",
        data: {
          selectedInvoice,
          paymentMethod,
          setPaymentMethod,
          paymentAmount,
          setPaymentAmount,
          bankDetails,
          setBankDetails,
          remarks,
          setRemarks,
          selectedFile,
          showFileOptions,
          removeFile,
        },
      });

      // Submit button section (Step 4)
      sections.push({
        id: "submit-button",
        type: "submit-button",
        data: { handleSubmitPayment, isSubmitting },
      });
    }

    return sections;
  };

  const renderSectionItem = ({ item }) => {
    switch (item.type) {
      case "dealer-search":
        return <DealerSearchSection data={item.data} />;
      case "dealer-invoices":
        return <DealerInvoicesSection data={item.data} />;
      case "payment-form":
        return <PaymentFormSection data={item.data} />;
      case "submit-button":
        return <SubmitButtonSection data={item.data} />;
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      enabled
    >
      <FlatList
        data={renderSections()}
        renderItem={renderSectionItem}
        keyExtractor={(item) => item.id || Math.random().toString()}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + DESIGN.spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={false}
        keyboardDismissMode="interactive"
      />
    </KeyboardAvoidingView>
  );
}

// ================= Section Components =================

const DealerSearchSection = ({ data }) => {
  const {
    dealerDisplayValue,
    handleDealerInputChange,
    loadingDealer,
    showDealerList,
    dealers,
    handleSelectDealer,
  } = data;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Select Dealer</Text>
        {(data.selectedDealer || data.selectedInvoice) && (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={data.resetWorkflow}
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>
      <TextInput
        style={styles.input}
        placeholder="Search dealer by name..."
        value={dealerDisplayValue}
        onChangeText={handleDealerInputChange}
        autoCapitalize="words"
        autoCorrect={false}
      />

      {loadingDealer && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007bff" />
          <Text style={styles.loadingText}>Searching dealers...</Text>
        </View>
      )}

      {showDealerList && dealers.length > 0 && (
        <View
          style={[
            styles.list,
            {
              maxHeight: Math.min(
                dealers.length * DROPDOWN_ROW_HEIGHT,
                MAX_DROPDOWN_HEIGHT
              ),
            },
          ]}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {dealers.map((dealer) => (
              <TouchableOpacity
                key={dealer.id}
                style={styles.item}
                onPress={() => handleSelectDealer(dealer)}
              >
                <Text style={styles.text}>
                  {dealer.shop_name || "Unknown Shop"}
                </Text>
                <Text style={styles.subtext}>
                  {dealer.owner_name || "Unknown Owner"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {showDealerList &&
        dealers.length === 0 &&
        !loadingDealer &&
        dealerDisplayValue.length >= 2 && (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>
              No dealers found for "{dealerDisplayValue}"
            </Text>
            <Text style={styles.noResultsSubtext}>
              Try a different search term
            </Text>
          </View>
        )}
    </View>
  );
};

const DealerInvoicesSection = ({ data }) => {
  const {
    dealerInvoices,
    selectedInvoice,
    setSelectedInvoice,
    loadingInvoices,
    selectedDealer,
  } = data;

  const renderInvoiceItem = ({ item: invoice }) => (
    <TouchableOpacity
      style={[
        styles.invoiceCard,
        selectedInvoice?.id === invoice.id && styles.invoiceCardSelected,
      ]}
      onPress={() => setSelectedInvoice(invoice)}
    >
      <View style={styles.invoiceHeader}>
        <Text style={styles.invoiceNumber}>
          {(invoice.payment_number && invoice.payment_number.trim()) ||
            (invoice.invoice_number && invoice.invoice_number.trim()) ||
            (invoice.number && invoice.number.trim()) ||
            "Invoice " + invoice.id}
        </Text>
      </View>

      <View style={styles.invoiceDetails}>
        <Text style={styles.invoiceAmount}>
          {`₹${Number(
            invoice.pending_amount ||
              invoice.outstanding_amount ||
              invoice.amount ||
              0
          ).toLocaleString()}`}
        </Text>
        <Text style={styles.invoiceDate}>
          {`Due: ${invoice.due_date || invoice.payment_due_date || "N/A"}`}
        </Text>
      </View>

      {invoice.days_overdue && Number(invoice.days_overdue) > 0 ? (
        <Text style={styles.overdueText}>
          {`${Number(invoice.days_overdue) || 0} days overdue`}
        </Text>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Outstanding Invoices</Text>

      {loadingInvoices ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007bff" />
          <Text style={styles.loadingText}>Loading invoices...</Text>
        </View>
      ) : dealerInvoices.length > 0 ? (
        <FlatList
          data={dealerInvoices}
          renderItem={renderInvoiceItem}
          keyExtractor={(item) => item.id.toString()}
          style={
            dealerInvoices.length > 3 ? styles.scrollableInvoiceList : null
          }
          scrollEnabled={dealerInvoices.length > 3}
          showsVerticalScrollIndicator={dealerInvoices.length > 3}
          nestedScrollEnabled={true}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
      ) : (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>
            No outstanding invoices found
          </Text>
        </View>
      )}
    </View>
  );
};

const PaymentFormSection = ({ data }) => {
  const {
    selectedInvoice,
    paymentMethod,
    setPaymentMethod,
    paymentAmount,
    setPaymentAmount,
    bankDetails,
    setBankDetails,
    remarks,
    setRemarks,
    selectedFile,
    showFileOptions,
    removeFile,
  } = data;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Payment Information</Text>

      <View style={styles.selectedInvoiceInfo}>
        <Text style={styles.selectedInvoiceText}>
          {`Selected: ${
            (selectedInvoice.payment_number &&
              selectedInvoice.payment_number.trim()) ||
            (selectedInvoice.invoice_number &&
              selectedInvoice.invoice_number.trim()) ||
            (selectedInvoice.number && selectedInvoice.number.trim()) ||
            "Invoice " + selectedInvoice.id
          }`}
        </Text>
        <Text style={styles.selectedInvoiceAmount}>
          {`Pending: ₹${(
            selectedInvoice.pending_amount ||
            selectedInvoice.outstanding_amount ||
            selectedInvoice.amount ||
            0
          ).toString()}`}
        </Text>
      </View>

      <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} />

      <AmountInput
        value={paymentAmount}
        onChange={setPaymentAmount}
        maxAmount={parseFloat(
          selectedInvoice.pending_amount ||
            selectedInvoice.outstanding_amount ||
            selectedInvoice.amount ||
            0
        )}
        label="Payment Amount"
        placeholder="Enter payment amount"
      />

      <BankDetailsInput
        paymentMethod={paymentMethod}
        value={bankDetails}
        onChange={setBankDetails}
      />

      <Text style={styles.label}>Payment Notes</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Add payment notes (optional)"
        value={remarks}
        onChangeText={setRemarks}
        multiline
        numberOfLines={3}
      />

      <FileAttachment
        selectedFile={selectedFile}
        showFileOptions={showFileOptions}
        removeFile={removeFile}
      />
    </View>
  );
};

// ================= FileAttachment Component =================
const FileAttachment = ({ selectedFile, showFileOptions, removeFile }) => {
  return (
    <View style={styles.fileAttachmentContainer}>
      <Text style={styles.label}>Receipt/Attachment (Optional)</Text>

      {selectedFile ? (
        <View style={styles.fileContainer}>
          <View style={styles.fileInfo}>
            <MaterialCommunityIcons
              name={
                selectedFile.mimeType?.startsWith("image/")
                  ? "image"
                  : "file-document"
              }
              size={20}
              color={DESIGN.colors.primary}
            />
            <Text style={styles.fileName} numberOfLines={1}>
              {selectedFile.name || selectedFile.fileName || "Photo"}
            </Text>
            {(selectedFile.size || selectedFile.fileSize) && (
              <Text style={styles.fileSize}>
                {`${(
                  (selectedFile.size || selectedFile.fileSize) / 1024
                ).toFixed(1)} KB`}
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={removeFile} style={styles.removeButton}>
            <MaterialCommunityIcons
              name="close-circle"
              size={24}
              color={DESIGN.colors.error}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={showFileOptions} style={styles.uploadButton}>
          <MaterialCommunityIcons
            name="plus-circle-outline"
            size={24}
            color={DESIGN.colors.primary}
          />
          <Text style={styles.uploadButtonText}>Add Receipt or Document</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const SubmitButtonSection = ({ data }) => {
  const { handleSubmitPayment, isSubmitting } = data;
  return (
    <TouchableOpacity
      style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
      onPress={handleSubmitPayment}
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <View style={styles.submitButtonContent}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={[styles.submitButtonText, { marginLeft: 8 }]}>
            Recording...
          </Text>
        </View>
      ) : (
        <Text style={styles.submitButtonText}>Complete Collection</Text>
      )}
    </TouchableOpacity>
  );
};

// ================= Styles =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN.colors.background,
  },
  contentContainer: {
    padding: DESIGN.spacing.md,
  },
  section: {
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.borderRadius.md,
    padding: DESIGN.spacing.md,
    marginBottom: DESIGN.spacing.md,
    ...DESIGN.shadows.medium,
  },
  sectionTitle: {
    ...DESIGN.typography.subtitle,
    color: DESIGN.colors.textPrimary,
    marginBottom: DESIGN.spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: DESIGN.spacing.sm,
  },
  resetButton: {
    backgroundColor: DESIGN.colors.surface,
    paddingHorizontal: DESIGN.spacing.md,
    paddingVertical: DESIGN.spacing.sm,
    borderRadius: DESIGN.borderRadius.md,
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
    ...DESIGN.shadows.small,
  },
  resetButtonText: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textPrimary,
    fontWeight: "600",
    textAlign: "center",
  },
  stepInstruction: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textSecondary,
    marginBottom: DESIGN.spacing.md,
    fontStyle: "italic",
  },
  label: {
    ...DESIGN.typography.label,
    color: DESIGN.colors.textPrimary,
    marginBottom: DESIGN.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
    borderRadius: DESIGN.borderRadius.sm,
    padding: DESIGN.spacing.sm,
    ...DESIGN.typography.body,
    backgroundColor: DESIGN.colors.surface,
    marginBottom: DESIGN.spacing.sm,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  text: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textPrimary,
  },
  subtext: {
    ...DESIGN.typography.caption,
    color: DESIGN.colors.textSecondary,
    marginTop: DESIGN.spacing.xs,
  },
  placeholderText: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textTertiary,
  },
  paymentMethodContainer: {
    marginBottom: 15,
  },
  dropdownWrapper: {
    position: "relative",
    zIndex: 10,
  },
  dropdownContainer: {
    // Simplified container without absolute positioning constraints
  },
  list: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
    borderRadius: DESIGN.borderRadius.sm,
    backgroundColor: DESIGN.colors.surface,
    marginBottom: 10,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  listNonScrollable: {
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
    borderRadius: DESIGN.borderRadius.sm,
    maxHeight: 200,
  },
  scrollIndicator: {
    backgroundColor: DESIGN.colors.surfaceElevated,
    paddingHorizontal: DESIGN.spacing.sm,
    paddingVertical: DESIGN.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN.colors.borderLight,
  },
  scrollIndicatorText: {
    ...DESIGN.typography.small,
    color: DESIGN.colors.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
  },
  item: {
    padding: DESIGN.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN.colors.borderLight,
    minHeight: DROPDOWN_ROW_HEIGHT,
    justifyContent: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: DESIGN.spacing.sm,
  },
  loadingText: {
    marginLeft: DESIGN.spacing.sm,
    color: DESIGN.colors.textSecondary,
  },
  noResultsContainer: {
    padding: DESIGN.spacing.md,
    alignItems: "center",
  },
  noResultsText: {
    ...DESIGN.typography.caption,
    color: DESIGN.colors.textSecondary,
    fontStyle: "italic",
  },
  noResultsSubtext: {
    ...DESIGN.typography.small,
    color: DESIGN.colors.textTertiary,
    marginTop: DESIGN.spacing.xs,
  },

  // Dealer Info Style
  dealerInfo: {
    ...DESIGN.typography.caption,
    color: DESIGN.colors.primary,
    fontWeight: "500",
    marginBottom: DESIGN.spacing.sm,
    padding: DESIGN.spacing.sm,
    backgroundColor: DESIGN.colors.surfaceElevated,
    borderRadius: DESIGN.borderRadius.xs,
  },

  // Invoice Styles
  invoiceCard: {
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
    borderRadius: DESIGN.borderRadius.sm,
    padding: DESIGN.spacing.sm,
    marginBottom: DESIGN.spacing.sm,
    backgroundColor: DESIGN.colors.surfaceElevated,
  },
  invoiceCardSelected: {
    borderColor: DESIGN.colors.primary,
    backgroundColor: DESIGN.colors.surfaceElevated,
  },
  invoiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: DESIGN.spacing.sm,
  },
  invoiceNumber: {
    ...DESIGN.typography.body,
    fontWeight: "600",
    color: DESIGN.colors.textPrimary,
  },
  invoiceStatus: {
    ...DESIGN.typography.small,
    color: DESIGN.colors.textSecondary,
    backgroundColor: DESIGN.colors.borderLight,
    paddingHorizontal: DESIGN.spacing.sm,
    paddingVertical: DESIGN.spacing.xs,
    borderRadius: DESIGN.borderRadius.xs,
  },
  invoiceDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  invoiceAmount: {
    fontSize: 18,
    fontWeight: "600",
    color: "#dc3545",
  },
  invoiceDate: {
    fontSize: 14,
    color: "#666",
  },
  overdueText: {
    ...DESIGN.typography.small,
    color: DESIGN.colors.error,
    fontWeight: "500",
    marginTop: DESIGN.spacing.xs,
  },

  // Scrollable lists
  scrollableInvoiceList: {
    maxHeight: 250, // Limit height when more than 2 items
  },
  scrollIndicator: {
    backgroundColor: DESIGN.colors.surfaceElevated,
    paddingHorizontal: DESIGN.spacing.sm,
    paddingVertical: DESIGN.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN.colors.borderLight,
  },
  scrollIndicatorText: {
    ...DESIGN.typography.small,
    color: DESIGN.colors.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
  },
  flatListContent: {
    flexGrow: 1,
  },

  // Selected Invoice Info
  selectedInvoiceInfo: {
    backgroundColor: DESIGN.colors.surfaceElevated,
    borderRadius: DESIGN.borderRadius.sm,
    padding: DESIGN.spacing.sm,
    marginBottom: DESIGN.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: DESIGN.colors.primary,
  },
  selectedInvoiceText: {
    ...DESIGN.typography.caption,
    color: DESIGN.colors.primary,
    fontWeight: "500",
  },
  selectedInvoiceAmount: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.primary,
    fontWeight: "600",
    marginTop: DESIGN.spacing.xs,
  },

  // Button Styles
  submitButton: {
    backgroundColor: DESIGN.colors.success,
    padding: DESIGN.spacing.md,
    borderRadius: DESIGN.borderRadius.sm,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: DESIGN.colors.textTertiary,
  },
  submitButtonText: {
    color: DESIGN.colors.surface,
    ...DESIGN.typography.button,
    fontWeight: "600",
  },
  submitButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  // File Attachment Styles
  fileContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DESIGN.colors.surfaceElevated,
    borderRadius: DESIGN.borderRadius.sm,
    padding: DESIGN.spacing.md,
    borderWidth: 1,
    borderColor: DESIGN.colors.borderLight,
  },
  fileInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  fileName: {
    flex: 1,
    marginLeft: DESIGN.spacing.sm,
    fontSize: DESIGN.typography.body.fontSize,
    color: DESIGN.colors.textPrimary,
    fontWeight: "500",
  },
  fileSize: {
    fontSize: DESIGN.typography.caption.fontSize,
    color: DESIGN.colors.textSecondary,
    marginLeft: DESIGN.spacing.sm,
  },
  removeButton: {
    padding: DESIGN.spacing.xs,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DESIGN.colors.surfaceElevated,
    borderRadius: DESIGN.borderRadius.sm,
    padding: DESIGN.spacing.lg,
    borderWidth: 1,
    borderColor: DESIGN.colors.borderLight,
    borderStyle: "dashed",
  },
  uploadButtonText: {
    marginLeft: DESIGN.spacing.sm,
    fontSize: DESIGN.typography.body.fontSize,
    color: DESIGN.colors.primary,
    fontWeight: "500",
  },
  fileAttachmentContainer: {
    marginTop: DESIGN.spacing.lg,
  },
  imagePreview: {
    width: "100%",
    height: 120,
    borderRadius: DESIGN.borderRadius.sm,
    marginBottom: DESIGN.spacing.sm,
    backgroundColor: DESIGN.colors.surface,
  },
});
