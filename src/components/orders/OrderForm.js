import { useState, useEffect, useRef } from "react";
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
  KeyboardAvoidingView, Platform,
} from "react-native";
import apiClient from "../../api/client";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DESIGN from "../../theme";
import { FontAwesome } from "@expo/vector-icons";

const DROPDOWN_ROW_HEIGHT = 56;
const MAX_DROPDOWN_HEIGHT = Math.round(Dimensions.get("window").height * 0.5);

// Helper to format money: prefer integer if whole number, otherwise two decimals
const formatMoney = (num) => {
  if (num === null || num === undefined || num === "") return "";
  const n = Number(num);
  if (isNaN(n)) return "";
  return Number.isInteger(n) ? `${n}` : n.toFixed(2);
};

// ================= DiscountPriceInput Component =================
function DiscountPriceInput({ dealerPriceNoGst,dealerPriceWithGST, value, onChange }) {
  const [localPrice, setLocalPrice] = useState(value.price ?? "");
  const [localDiscount, setLocalDiscount] = useState(value.discount ?? "");
  const [gstRate, setGstRate]=useState(value.gst_rate ?? "")
  const [note, setNote] = useState("");

  useEffect(() => {
    setLocalPrice(value.price ?? "");
    setLocalDiscount(value.discount ?? "");
    setGstRate(value.gst_rate)
  }, [value]);

  const round2 = (num) => Math.round(num * 100) / 100;

  const handleDiscountChange = (text) => {
    // Remove % symbol if user types it
    const cleanText = text.replace('%', '');
    const num = cleanText === "" ? "" : Number(cleanText);
    setLocalDiscount(cleanText);

    if (num === "" || isNaN(num)) {
      onChange({ price: null, discount: null });
      setNote("");
      return;
    }

    let d = Math.min(Math.max(num, 0), 100);
    let newPrice = round2(dealerPriceNoGst * (1 - d / 100));

    if (d !== num) setNote("Discount must be between 0% and 100%");
    else setNote("");

    setLocalPrice(String(newPrice));
    onChange({ price: newPrice, discount: d });
  };

  const gstMultiplier = 1 + gstRate / 100;

  const handleWithGSTPriceChange = (text) => {
    const num = text === "" ? "" : Number(text);
    setLocalPrice(text);

    if (num === "" || isNaN(num)) {
      onChange({ price: null, discount: null });
      setNote("");
      return;
    }

    // convert GST price to price without GST
    const priceWithoutGST = round2(num / gstMultiplier);

    // The dealer's maximum allowed without-GST price is dealerPriceNoGst
    const maxNoGst = Number(dealerPriceNoGst) || 0;

    let p = Math.min(Math.max(priceWithoutGST, 0), maxNoGst);
    let newDiscount = maxNoGst > 0 ? round2((1 - p / maxNoGst) * 100) : 0;

    if (p !== priceWithoutGST)
      setNote(`Price must be between 0 and ${round2(maxNoGst * gstMultiplier)} (with GST)`);
    else setNote("");

    setLocalDiscount(String(newDiscount));

    // Send **without GST price** in state
    onChange({ price: p, discount: newDiscount });
  };



  const handlePriceChange = (text) => {
    const num = text === "" ? "" : Number(text);
    setLocalPrice(text);

    if (num === "" || isNaN(num)) {
      onChange({ price: null, discount: null });
      setNote("");
      return;
    }

    let p = Math.min(Math.max(num, 0), dealerPriceNoGst);
    let newDiscount = round2((1 - p / dealerPriceNoGst) * 100);

    if (p !== num)
      setNote(`Price must be between 0 and ${dealerPriceNoGst}`);
    else setNote("");

    setLocalDiscount(String(newDiscount));
    onChange({ price: p, discount: newDiscount });
  };

  return (
    <View style={{ marginBottom: 15 }}>
      <View style={styles.inputWithIcon}>

        <TextInput
          style={[styles.input, styles.inputWithIconText]}
          placeholder="Enter Discount %"
          keyboardType="numeric"
          value={localDiscount ? `${localDiscount}` : ""}
          onChangeText={handleDiscountChange}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Enter Price With GST ₹"
        keyboardType="numeric"
        value={localPrice !== "" && !isNaN(Number(localPrice)) ? String(round2(Number(localPrice) * gstMultiplier)) : ""}
        onChangeText={handleWithGSTPriceChange}
      />
      {note !== "" && (
        <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>{note}</Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Enter Price Without GST ₹"
        keyboardType="numeric"
        value={localPrice !== null && localPrice !== undefined ? String(localPrice) : ""}
        onChangeText={handlePriceChange}
      />
      {note !== "" && (
        <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>{note}</Text>
      )}
    </View>
  );
}

// ================= QuantityInput Component =================
const QUANTITY_UNIT_CHOICES = ["units", "case"];

function QuantityInput({ value, onChange }) {
  const handleQuantityChange = (num) => {
    const parsed = num === "" ? null : Number(num);
    onChange({ ...value, quantity: parsed });
  };

  const handleUnitChange = (unit) => {
    onChange({ ...value, quantity_unit: unit });
  };

  return (

    <View style={styles.quantityRow}>

      <TextInput
        style={[styles.input, { flex: 1, marginRight: 8, marginBottom: 0 }]}
        placeholder="Quantity"
        keyboardType="numeric"
        value={value.quantity !== null ? String(value.quantity) : ""}
        onChangeText={handleQuantityChange}
      />

      {QUANTITY_UNIT_CHOICES.map((unit) => (
        <TouchableOpacity
          key={unit}
          style={[
            styles.option,
            value.quantity_unit === unit && styles.optionSelected,
          ]}
          onPress={() => handleUnitChange(unit)}
        >
          <Text>{unit}</Text>
        </TouchableOpacity>
      ))}
    </View>

  );
}

// ================= OrderTypePicker Component =================
const orderTypes = [
  { label: "Net Rate", value: "net-rate" },
  { label: "Scheme", value: "scheme" },
  { label: "Credit", value: "credit" },
  { label: "Other", value: "other" },
];

function OrderTypePicker({ productId, value, onChange }) {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSchemeList, setShowSchemeList] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchSchemes(productId);
    }
  }, [productId]);

  const fetchSchemes = async (id) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/order/api/products/${id}/schemes/`);
      if (response.data.success) {
        setSchemes(response.data.data);
      } else {
        setSchemes([]);
      }
    } catch (err) {
      console.log("Error fetching schemes", err);
      setSchemes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOrderType = (type) => {
    if (type === "scheme") {
      onChange({ order_type: "scheme", scheme_id: null });
    } else {
      onChange({ order_type: type, scheme_id: null });
    }
  };

  const handleSelectScheme = (scheme) => {
    onChange({ order_type: "scheme", scheme_id: scheme.id });
    setShowSchemeList(false);
  };

  return (
    <View style={{ marginBottom: 15 }}>
      {/* Order Type Picker */}
      <View style={styles.dropdown}>
        <View style={styles.orderTypeRow}>
          {orderTypes.map((t) => {
            const isSchemeDisabled =
              t.value === "scheme" && (!schemes || schemes.length === 0);
            return (
              <TouchableOpacity
                key={t.value}
                style={[
                  styles.option,
                  value?.order_type === t.value && styles.optionSelected,
                  isSchemeDisabled && styles.optionDisabled,
                ]}
                onPress={() => !isSchemeDisabled && handleSelectOrderType(t.value)}
                disabled={isSchemeDisabled}
              >
                <Text
                  style={isSchemeDisabled ? styles.optionDisabledText : {}}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Scheme Dropdown */}
      {value?.order_type === "scheme" && (
        <View style={{ marginTop: 10 }}>
          {loading && <ActivityIndicator />}
          {!loading && schemes.length > 0 && (
            <>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowSchemeList(!showSchemeList)}
              >
                <Text>
                  {value?.scheme_id
                    ? schemes.find((s) => s.id === value.scheme_id)?.name
                    : "Select Scheme"}
                </Text>
              </TouchableOpacity>
              {showSchemeList && (
                <View style={styles.list}>
                  {schemes.map((scheme) => (
                    <TouchableOpacity
                      key={scheme.id}
                      style={styles.item}
                      onPress={() => handleSelectScheme(scheme)}
                    >
                      <Text style={styles.text}>{scheme.name}</Text>
                      <Text style={styles.subtext}>
                        {scheme.from_date} → {scheme.to_date}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}
          {!loading && schemes.length === 0 && (
            <Text style={styles.noSchemesNote}>No schemes for this product</Text>
          )}
        </View>
      )}
    </View>
  );
}

// ================= Main OrderForm =================
export default function OrderForm() {
  // Order State
  const [orderItems, setOrderItems] = useState([]);
  const [orderRemark, setOrderRemark] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dealer State
  const [dealerDisplayValue, setDealerDisplayValue] = useState("");
  const [dealerQuery, setDealerQuery] = useState("");
  const [dealers, setDealers] = useState([]);
  const [loadingDealer, setLoadingDealer] = useState(false);
  const [showDealerList, setShowDealerList] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const suppressDealerFetchRef = useRef(false);

  // Product State
  const [productDisplayValue, setProductDisplayValue] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [showProductList, setShowProductList] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const suppressProductFetchRef = useRef(false);

  // Packing State
  const [packings, setPackings] = useState([]);
  const [loadingPacking, setLoadingPacking] = useState(false);
  const [selectedPacking, setSelectedPacking] = useState(null);
  const [showPackingList, setShowPackingList] = useState(false);

  // Price State
  const [price, setPrice] = useState("");
  const [dealerPriceNoGst, setDealerPriceNoGst] = useState("");
  const [dealerPriceWithGst, setDealerPriceWithGst] = useState("");
  const [gstRate, setGstRate] = useState("");
  const [discount, setDiscount] = useState("");
  const [caseSize, setCaseSize] = useState("");
  const [itemTotal, setItemTotal] = useState("0.00");
  const insets = useSafeAreaInsets();

  // Order Type State
  const [orderType, setOrderType] = useState({
    order_type: "net-rate",
    scheme_id: null,
  });

  // Quantity State
  const [quantity, setQuantity] = useState({
    quantity: null,
    quantity_unit: "units",
  });

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
      });
      if (response.data.success) {
        setDealers(response.data.data);
        setShowDealerList(true);
      } else {
        setDealers([]);
        setShowDealerList(false);
      }
    } catch (error) {
      console.log("Error fetching dealers", error);
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

    if (text === selectedDealer?.shop_name) {
      setDealerQuery("");
      setShowDealerList(false);
      return;
    }

    if (text.length < 2) {
      setDealers([]);
      setShowDealerList(false);
      return;
    }

    setDealerQuery(text);
  };


  const handleSelectDealer = (dealer) => {
    setDealerDisplayValue(dealer.shop_name);
    setSelectedDealer(dealer);
    setShowDealerList(false);
    setDealers([]); // Clear suggestions array
    setDealerQuery(""); // Clear query
    suppressDealerFetchRef.current = true;
    // Reset suppress flag after microtask
    setTimeout(() => {
      suppressDealerFetchRef.current = false;
    }, 0);
    Keyboard.dismiss();
  };

  // ========== Product Search ==========
  const fetchProducts = async (search) => {
    if (!search || search.length < 2) {
      setProducts([]);
      setShowProductList(false);
      return;
    }
    try {
      setLoadingProduct(true);
      const response = await apiClient.get("/order/api/product-search/", {
        params: { q: search, page: 1 },
      });
      if (response.data.success) {
        setProducts(response.data.data.products);
        setShowProductList(true);
      } else {
        setProducts([]);
        setShowProductList(false);
      }
    } catch (error) {
      console.log("Error fetching products", error);
    } finally {
      setLoadingProduct(false);
    }
  };

  useEffect(() => {
    if (suppressProductFetchRef.current) {
      return;
    }
    const delayDebounce = setTimeout(() => {
      fetchProducts(productQuery);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [productQuery]);

  const handleProductInputChange = (text) => {
    setProductDisplayValue(text);

    if (suppressProductFetchRef.current) {
      return;
    }

    if (text === selectedProduct?.name) {
      setProductQuery("");
      setShowProductList(false);
      return;
    }

    if (text.length < 2) {
      setProducts([]);
      setShowProductList(false);
      return;
    }

    setProductQuery(text);
  };


  const handleSelectProduct = async (product) => {
    setProductDisplayValue(product.name);
    setSelectedProduct(product);
    setShowProductList(false);
    setShowPackingList(false);
    setProducts([]); // Clear suggestions array
    setProductQuery(""); // Clear query
    setSelectedPacking(null);
    setDealerPriceNoGst("");
    setGstRate(""); // reset dealer price
    suppressProductFetchRef.current = true;
    // Reset suppress flag after microtask
    setTimeout(() => {
      suppressProductFetchRef.current = false;
    }, 0);
    Keyboard.dismiss();

    try {
      setLoadingPacking(true);
      const response = await apiClient.get(
        `/order/api/products/${product.id}/packings/`
      );
      if (response.data.success) {
        setPackings(response.data.data);
        setShowPackingList(false);
      } else {
        setPackings([]);
        setShowPackingList(false);
      }
    } catch (error) {
      console.log("Error fetching packings", error);
    } finally {
      setLoadingPacking(false);
    }
  };

  // ========== Packing Select ==========
  const handleSelectPacking = async (packing) => {
    setSelectedPacking(packing);
    setShowPackingList(false);

    try {
      const response = await apiClient.get(
        `/order/api/packings/${packing.id}/details/`
      );
      if (response.data.success) {
        // API returns:
        // - dealer_price_per_unit: price WITH GST
        // - dealer_price_per_unit_no_gst: price WITHOUT GST (use this directly when available)
        // - gst_rate: GST percentage
        const resp = response.data.data;
        const gst = parseFloat(resp.gst_rate ?? 0);

        // Use the no-GST price directly from API if available
        let priceNoGst = resp.dealer_price_per_unit_no_gst
          ? Number(resp.dealer_price_per_unit_no_gst)
          : null;

        // If no-GST price not in API, calculate it from the with-GST price
        if (priceNoGst === null || priceNoGst === undefined) {
          const priceWithGst = Number(resp.dealer_price_per_unit || 0);
          priceNoGst = gst !== 0 ? priceWithGst / (1 + gst / 100) : priceWithGst;
        }

        // Calculate with-GST price from no-GST
        const priceWithGst = gst !== 0
          ? priceNoGst * (1 + gst / 100)
          : priceNoGst;

        setDealerPriceNoGst(priceNoGst);
        setDealerPriceWithGst(priceWithGst);
        setGstRate(gst);
        setCaseSize(resp.units_per_case || 0);
      } else {
        setDealerPriceNoGst("");
        setDealerPriceWithGst("");
        setGstRate("");
        setCaseSize(0);
      }
    } catch (error) {
      console.log("Error fetching packing details", error);
      setDealerPriceNoGst("");
      setDealerPriceWithGst("");
      setGstRate("");
      setCaseSize(0);
    }
  };




  // ========== Item Total Calculation ==========
  const calculateItemTotal = () => {
    // Return 0.00 if any required input is missing/invalid
    if (!selectedProduct || !selectedPacking || !quantity.quantity || !price || !gstRate) {
      return "0.00";
    }




    // Case size validation for case quantity unit
    if (quantity.quantity_unit === "case" && (!caseSize || caseSize <= 0)) {
      return "0.00";
    }

    try {
      const quantityValue = parseFloat(quantity.quantity);
      const priceValue = parseFloat(price);
      const discountValue = parseFloat(discount) || 0;
      const gstRateValue = parseFloat(gstRate);
      const caseSizeValue = parseInt(caseSize) || 1;

      if (isNaN(quantityValue) || isNaN(priceValue) || isNaN(gstRateValue)) {
        return "0.00";
      }

      // Calculate total units
      let totalUnits = quantityValue;
      if (quantity.quantity_unit === "case") {
        totalUnits = quantityValue * caseSizeValue;
      }

      // Calculate per-unit gross price (price + GST)
      const perUnitGross = priceValue * (1 + gstRateValue / 100);

      // Calculate item total
      const itemTotal = perUnitGross * totalUnits;

      return itemTotal.toFixed(2);
    } catch (error) {
      console.log("Error calculating item total:", error);
      return "0.00";
    }
  };

  // Update item total whenever relevant values change
  useEffect(() => {
    const newItemTotal = calculateItemTotal();
    setItemTotal(newItemTotal);
  }, [selectedProduct, selectedPacking, quantity, price, discount, gstRate, caseSize]);

  // ========== Order Management Functions ==========
  // Add item to order
  const addItemToOrder = () => {
    if (!selectedDealer) {
      Alert.alert("Error", "Please select a dealer first");
      return;
    }

    if (!selectedProduct || !selectedPacking || !quantity.quantity || !price) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    // Validate order type and scheme
    if (!orderType.order_type) {
      Alert.alert("Error", "Please select an order type");
      return;
    }

    if (orderType.order_type === "scheme" && !orderType.scheme_id) {
      Alert.alert("Error", "Please select a scheme for scheme order type");
      return;
    }

    // Validate quantity
    const quantityValue = parseFloat(quantity.quantity);
    if (isNaN(quantityValue) || quantityValue <= 0) {
      Alert.alert("Error", "Please enter a valid quantity greater than 0");
      return;
    }

    // Validate case size for case quantity unit
    if (quantity.quantity_unit === "case" && (!caseSize || caseSize <= 0)) {
      Alert.alert("Error", "No case size available for this product. Please contact administrator.");
      return;
    }

    // Validate price and discount
    const priceValue = parseFloat(price);
    const discountValue = parseFloat(discount) || 0;
    const dealerPriceValue = parseFloat(dealerPriceNoGst);

    if (isNaN(priceValue) || priceValue < 0 || priceValue > dealerPriceValue) {
      Alert.alert("Error", `Price must be between 0 and ${dealerPriceValue}`);
      return;
    }

    if (discountValue < 0 || discountValue > 100) {
      Alert.alert("Error", "Discount must be between 0% and 100%");
      return;
    }

    const newItem = {
      product: selectedProduct.id,
      product_packing: selectedPacking.id,
      product_order_type: orderType.order_type,
      product_scheme: orderType.scheme_id,
      quantity: quantityValue,
      quantity_unit: quantity.quantity_unit,
      price: priceValue,
      discount: discountValue,
      item_total: parseFloat(itemTotal),
      remark: "",
      // For display purposes
      product_name: selectedProduct.name,
      packing_size: selectedPacking.packing_size,
    };

    setOrderItems([...orderItems, newItem]);

    // Reset current item fields
    resetCurrentItemFields();
  };

  const resetCurrentItemFields = () => {
    setProductDisplayValue("");
    setProductQuery("");
    setSelectedProduct(null);
    setSelectedPacking(null);
    setPackings([]);
    setDealerPriceNoGst("");
    setGstRate("");
    setCaseSize("");
    setPrice("");
    setDiscount("");
    setItemTotal("0.00");
    setOrderType({ order_type: "net-rate", scheme_id: null });
    setQuantity({ quantity: null, quantity_unit: "units" });
    setShowProductList(false);
    setShowPackingList(false);
  };

  const removeItemFromOrder = (index) => {
    const updatedItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(updatedItems);
  };

  // Submit order
  const submitOrder = async () => {
    if (!selectedDealer) {
      Alert.alert("Error", "Please select a dealer");
      return;
    }

    if (orderItems.length === 0) {
      Alert.alert("Error", "Please add at least one item to the order");
      return;
    }

    try {
      setIsSubmitting(true);

      const orderData = {
        dealer_id: selectedDealer.id,
        remark: orderRemark,
        order_items: orderItems.map(item => ({
          product: item.product,
          product_packing: item.product_packing,
          product_order_type: item.product_order_type,
          product_scheme: item.product_scheme,
          quantity: item.quantity,
          quantity_unit: item.quantity_unit,
          price: item.price,
          discount: item.discount,
          item_total: item.item_total,
          remark: item.remark,
        })),
      };

      const response = await apiClient.post("/order/api/orders/create/", orderData);

      console.log("Order: ", response.data);


      if (response.data.success) {
        Alert.alert(
          "Success",
          `Order ${response.data.data.dealer_owner} created successfully`,
          [{ text: "OK", onPress: resetForm }]
        );
      } else {
        Alert.alert("Error", "Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      Alert.alert("Error", "Failed to create order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setOrderItems([]);
    setOrderRemark("");
    setDealerDisplayValue("");
    setDealerQuery("");
    setSelectedDealer(null);
    setShowDealerList(false);
    resetCurrentItemFields();
  };

  // Calculate order totals for display
  const calculateOrderTotals = () => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    let grandTotal = 0;




    orderItems.forEach(item => {
      // Calculate based on actual item totals from backend logic
      const itemSubtotal = item.quantity * item.price;
      const discountAmount = itemSubtotal * (item.discount / 100);
      const taxableAmount = itemSubtotal - discountAmount;

      // Use dynamic GST rate from the item if available
      const gstRateForItem = parseFloat(gstRate) || 0; // fallback to 5%
      const taxAmount = taxableAmount * (gstRateForItem / 100);




      subtotal += itemSubtotal;
      totalDiscount += discountAmount;
      totalTax += taxAmount;

      // Use the calculated item_total if available, otherwise calculate
      if (item.item_total) {
        grandTotal += parseFloat(item.item_total);
      } else {
        grandTotal += taxableAmount + taxAmount;
      }
    });




    return {
      subtotal: subtotal.toFixed(2),
      totalDiscount: totalDiscount.toFixed(2),
      totalTax: totalTax.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
    };
  };




  // Create sections data for FlatList
  const renderSections = () => {
    const sections = [];


    // Header section
    sections.push({
      id: 'header',
      type: 'header',
      data: { selectedDealer }
    });


    // Dealer search section
    sections.push({
      id: 'dealer-search',
      type: 'dealer-search',
      data: {
        dealerDisplayValue,
        handleDealerInputChange,
        loadingDealer,
        showDealerList,
        dealers,
        handleSelectDealer
      }
    });


    // Order items section
    if (orderItems.length > 0) {
      sections.push({
        id: 'order-items',
        type: 'order-items',
        data: { orderItems, removeItemFromOrder, calculateOrderTotals }
      });
    }


    // Add new item section
    if (selectedDealer) {
      sections.push({
        id: 'add-item',
        type: 'add-item',
        data: {
          productDisplayValue,
          handleProductInputChange,
          loadingProduct,
          showProductList,
          products,
          handleSelectProduct,
          selectedProduct,
          packings,
          showPackingList,
          setShowPackingList,
          selectedPacking,
          handleSelectPacking,
          orderType,
          setOrderType,
          quantity,
          setQuantity,
          dealerPriceNoGst,
          dealerPriceWithGst,
          gstRate,
          price,
          discount,
          caseSize,
          itemTotal,
          addItemToOrder
        }
      });
    }


    // Order remarks section
    if (orderItems.length > 0) {
      sections.push({
        id: 'order-remarks',
        type: 'order-remarks',
        data: { orderRemark, setOrderRemark }
      });
    }


    // Submit button section
    if (orderItems.length > 0) {
      sections.push({
        id: 'submit-buttons',
        type: 'submit-buttons',
        data: { isSubmitting, submitOrder, resetForm, orderItems }
      });
    }


    return sections;
  };


  const renderSection = ({ item }) => {
    switch (item.type) {

      case 'dealer-search':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Dealer</Text>
            <TextInput
              style={styles.input}
              placeholder="Search dealer..."
              value={item.data.dealerDisplayValue}
              onChangeText={item.data.handleDealerInputChange}
            />
            {item.data.loadingDealer && <ActivityIndicator style={{ marginVertical: 8 }} />}
            {item.data.showDealerList && item.data.dealers.length > 0 && (
              <View
                style={[
                  styles.list,
                  {
                    maxHeight: Math.min(
                      item.data.dealers.length * DROPDOWN_ROW_HEIGHT,
                      MAX_DROPDOWN_HEIGHT
                    ),
                  },
                ]}
              >
                <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                  {item.data.dealers.map((dealer) => (
                    <TouchableOpacity
                      key={dealer.id}
                      style={styles.item}
                      onPress={() => item.data.handleSelectDealer(dealer)}
                    >
                      <Text style={styles.text}>{dealer.shop_name}</Text>
                      <Text style={styles.subtext}>{dealer.owner_name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

          </View>
        );


      case 'order-items':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Items ({item.data.orderItems.length})</Text>
            {item.data.orderItems.map((orderItem, index) => (
              <View key={index} style={styles.orderItem}>
                <View style={styles.orderItemHeader}>
                  <Text style={styles.orderItemName}>{orderItem.product_name}</Text>
                  <TouchableOpacity
                    onPress={() => item.data.removeItemFromOrder(index)}
                    style={styles.removeButton}
                  >
                    <FontAwesome name="times" size={20} color="white" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.orderItemDetails}>
                  {orderItem.packing_size} • {orderItem.quantity} {orderItem.quantity_unit} • ₹{formatMoney(orderItem.price)}
                  {orderItem.discount > 0 && ` • ${orderItem.discount}% off`} • Total: ₹{formatMoney(orderItem.item_total)}
                </Text>
                <Text style={styles.orderItemType}>Type: {orderItem.product_order_type}</Text>
              </View>
            ))}

            {/* Order Totals */}
            {(() => {
              const totals = item.data.calculateOrderTotals();
              return (
                <View style={styles.totalsContainer}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Subtotal:</Text>
                    <Text style={styles.totalValue}>₹{totals.subtotal}</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Discount:</Text>
                    <Text style={styles.totalValue}>-₹{totals.totalDiscount}</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Tax (5%):</Text>
                    <Text style={styles.totalValue}>₹{totals.totalTax}</Text>
                  </View>
                  <View style={[styles.totalRow, styles.grandTotalRow]}>
                    <Text style={styles.grandTotalLabel}>Total:</Text>
                    <Text style={styles.grandTotalValue}>₹{totals.grandTotal}</Text>
                  </View>
                </View>
              );
            })()}
          </View>
        );


      case 'add-item':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add New Item</Text>

            {/* Product Search */}
            <TextInput
              style={styles.input}
              placeholder="Search product..."
              value={item.data.productDisplayValue}
              onChangeText={item.data.handleProductInputChange}
            />
            {item.data.loadingProduct && <ActivityIndicator style={{ marginVertical: 8 }} />}
            {item.data.showProductList && item.data.products.length > 0 && (
              <View
                style={[
                  styles.list,
                  {
                    maxHeight: Math.min(
                      item.data.products.length * DROPDOWN_ROW_HEIGHT,
                      MAX_DROPDOWN_HEIGHT
                    ),
                  },
                ]}
              >
                <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                  {item.data.products.map((product) => (
                    <TouchableOpacity
                      key={product.id}
                      style={styles.item}
                      onPress={() => item.data.handleSelectProduct(product)}
                    >
                      <Text style={styles.text}>{product.name}</Text>
                      <Text style={styles.subtext}>{product.category_name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Packing Selection */}
            {selectedProduct && packings.length > 0 && (
              <View style={{ marginBottom: 10 }}>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowPackingList(!showPackingList)}
                >
                  <Text style={selectedPacking ? styles.text : styles.placeholder}>
                    {selectedPacking
                      ? `${selectedPacking.packing_size}`
                      : "Select packing"}
                  </Text>
                </TouchableOpacity>


                {showPackingList && (
                  <View style={styles.list}>
                    {packings.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.item}
                        onPress={() => handleSelectPacking(item)}
                      >
                        <Text style={styles.text}>{item.packing_size}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}



            {/* Order Type Picker */}
            {item.data.selectedProduct && (
              <OrderTypePicker
                productId={item.data.selectedProduct.id}
                value={item.data.orderType}
                onChange={item.data.setOrderType}
              />
            )}


            {/* Quantity Input */}
            {item.data.selectedProduct && (
              <QuantityInput value={item.data.quantity} onChange={item.data.setQuantity} />
            )}


            {/* Dealer Price Display */}
            {item.data.selectedPacking && (
              <>
                <TextInput
                  style={[styles.input, styles.readOnlyInput]}
                  value={item.data.dealerPriceNoGst !== "" && item.data.dealerPriceNoGst != null ? `₹ ${formatMoney(item.data.dealerPriceNoGst)} (Per unit, No GST)` : ""}
                  editable={false}
                  placeholder="Dealer price (No GST)"
                />
              </>
            )}


            {/* Tax Rate Display */}
            {item.data.selectedPacking && (
              <TextInput
                style={[styles.input, styles.readOnlyInput]}
                value={item.data.gstRate !== "" && item.data.gstRate != null ? `${item.data.gstRate}% GST` : ""}
                editable={false}
                placeholder="Tax Rate"
              />
            )}


            {/* Price & Discount Input */}
            {item.data.selectedPacking && (
              <DiscountPriceInput
                dealerPriceNoGst={Number(item.data.dealerPriceNoGst)}
                dealerPriceWithGST={Number(item.data.dealerPriceWithGst)}
                value={{ price: item.data.price, discount: item.data.discount, gst_rate: item.data.gstRate }}
                onChange={({ price, discount }) => {
                  setPrice(price?.toString() ?? "");
                  setDiscount(discount?.toString() ?? "");
                }}
              />
            )}


            {/* Case Size Warning */}
            {item.data.selectedPacking && item.data.quantity.quantity_unit === "case" && (!item.data.caseSize || item.data.caseSize <= 0) && (
              <Text style={{ color: "red", fontSize: 12, marginBottom: 10 }}>
                ⚠️ No case size available for this product
              </Text>
            )}


            {/* Item Total Display */}
            {item.data.selectedPacking && (
              <TextInput
                style={[styles.input, styles.readOnlyInput]}
                value={item.data.itemTotal ? `₹ ${formatMoney(item.data.itemTotal)} (Item Total)` : ""}
                editable={false}
                placeholder="Item Total"
              />
            )}


            {/* Add Item Button */}
            {item.data.selectedProduct &&
              item.data.selectedPacking &&
              item.data.quantity.quantity &&
              item.data.price &&
              (item.data.quantity.quantity_unit === "units" || (item.data.quantity.quantity_unit === "case" && item.data.caseSize > 0)) &&
              item.data.itemTotal !== "0.00" && (
                <TouchableOpacity
                  style={styles.addItemButton}
                  onPress={item.data.addItemToOrder}
                >
                  <Text style={styles.addItemButtonText}>Add Item to Order</Text>
                </TouchableOpacity>
              )}
          </View>
        );


      case 'order-remarks':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Remarks (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter any remarks for this order..."
              value={item.data.orderRemark}
              onChangeText={item.data.setOrderRemark}
              multiline
              numberOfLines={3}
            />
          </View>
        );


      case 'submit-buttons':
        return (
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.submitButton, item.data.isSubmitting && styles.submitButtonDisabled]}
              onPress={item.data.submitOrder}
              disabled={item.data.isSubmitting}
            >
              {item.data.isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  Create Order ({item.data.orderItems.length} items)
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={item.data.resetForm}
            >
              <Text style={styles.resetButtonText}>Reset Form</Text>
            </TouchableOpacity>
          </View>
        );


      default:
        return null;
    }
  };


  return (
    <View style={{ flex: 1, paddingBottom: insets.bottom }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0} // adjust offset as needed
      >
        <FlatList
          style={styles.container}
          data={renderSections()}
          keyExtractor={(item) => item.id}
          renderItem={renderSection}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }} // ensures last field isn't hidden
        />
      </KeyboardAvoidingView>
    </View>


  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN.colors.background,
  },
  header: {
    backgroundColor: DESIGN.colors.surface,
    padding: DESIGN.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN.colors.borderLight,
    marginBottom: DESIGN.spacing.sm,
  },
  headerTitle: {
    fontSize: DESIGN.typography.title.fontSize,
    fontWeight: DESIGN.typography.title.fontWeight,
    color: DESIGN.colors.textPrimary,
  },
  selectedDealer: {
    fontSize: DESIGN.typography.body.fontSize,
    color: DESIGN.colors.textSecondary,
    marginTop: DESIGN.spacing.xs,
  },
  section: {
    backgroundColor: DESIGN.colors.surface,
    margin: DESIGN.spacing.sm,
    padding: DESIGN.spacing.md,
    borderRadius: DESIGN.borderRadius.sm,
    ...DESIGN.shadows.medium,
  },
  sectionTitle: {
    fontSize: DESIGN.typography.subtitle.fontSize,
    fontWeight: DESIGN.typography.subtitle.fontWeight,
    color: DESIGN.colors.textPrimary,
    marginBottom: DESIGN.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: DESIGN.colors.borderLight,
    padding: DESIGN.spacing.sm,
    borderRadius: DESIGN.borderRadius.sm,
    marginBottom: DESIGN.spacing.sm,
    backgroundColor: DESIGN.colors.surface,
    fontSize: DESIGN.typography.body.fontSize,
    color: DESIGN.colors.textPrimary,
  },
  readOnlyInput: {
    backgroundColor: DESIGN.colors.surfaceElevated,
    color: DESIGN.colors.textSecondary,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  placeholder: {
    color: DESIGN.colors.textSecondary,
  },
  list: {
    marginTop: DESIGN.spacing.xs,
    borderWidth: 1,
    borderColor: DESIGN.colors.borderLight,
    borderRadius: DESIGN.borderRadius.sm,
    backgroundColor: DESIGN.colors.surface,
    marginBottom: DESIGN.spacing.sm,
    overflow: "hidden",
  },
  item: {
    padding: DESIGN.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN.colors.borderLight,
    minHeight: DROPDOWN_ROW_HEIGHT,
    justifyContent: "center",
  },

  text: {
    fontSize: DESIGN.typography.body.fontSize,
    color: DESIGN.colors.textPrimary,
  },
  subtext: {
    fontSize: DESIGN.typography.caption.fontSize,
    color: DESIGN.colors.textSecondary,
    marginTop: DESIGN.spacing.xs / 2,
  },
  // Order Items Styles
  orderItem: {
    backgroundColor: DESIGN.colors.surfaceElevated,
    padding: DESIGN.spacing.sm,
    borderRadius: DESIGN.borderRadius.sm,
    marginBottom: DESIGN.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: DESIGN.colors.primary,
  },
  orderItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderItemName: {
    fontSize: DESIGN.typography.body.fontSize,
    fontWeight: DESIGN.typography.subtitle.fontWeight,
    color: DESIGN.colors.textPrimary,
    flex: 1,
  },
  removeButton: {
    backgroundColor: DESIGN.colors.error,
    borderRadius: DESIGN.spacing.md,
    width: DESIGN.iconSize.md,
    height: DESIGN.iconSize.md,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: DESIGN.colors.surface,
    fontSize: DESIGN.typography.caption.fontSize,
    fontWeight: DESIGN.typography.subtitle.fontWeight,
  },
  orderItemDetails: {
    fontSize: DESIGN.typography.body.fontSize,
    color: DESIGN.colors.textSecondary,
    marginTop: DESIGN.spacing.xs,
  },
  orderItemType: {
    fontSize: DESIGN.typography.caption.fontSize,
    color: DESIGN.colors.textTertiary,
    marginTop: DESIGN.spacing.xs / 2,
    fontStyle: "italic",
  },




  // Totals Styles
  totalsContainer: {
    marginTop: DESIGN.spacing.md,
    paddingTop: DESIGN.spacing.md,
    borderTopWidth: 1,
    borderTopColor: DESIGN.colors.borderLight,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: DESIGN.spacing.sm,
  },
  totalLabel: {
    fontSize: DESIGN.typography.body.fontSize,
    color: DESIGN.colors.textSecondary,
  },
  totalValue: {
    fontSize: DESIGN.typography.body.fontSize,
    color: DESIGN.colors.textPrimary,
    fontWeight: DESIGN.typography.caption.fontWeight,
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: DESIGN.colors.borderLight,
    paddingTop: DESIGN.spacing.sm,
    marginTop: DESIGN.spacing.sm,
  },
  grandTotalLabel: {
    fontSize: DESIGN.typography.subtitle.fontSize,
    fontWeight: DESIGN.typography.subtitle.fontWeight,
    color: DESIGN.colors.textPrimary,
  },
  grandTotalValue: {
    fontSize: DESIGN.typography.subtitle.fontSize,
    fontWeight: DESIGN.typography.subtitle.fontWeight,
    color: DESIGN.colors.primary,
  },




  // Button Styles
  addItemButton: {
    backgroundColor: DESIGN.colors.success,
    padding: DESIGN.spacing.md,
    borderRadius: DESIGN.borderRadius.sm,
    alignItems: "center",
    marginTop: DESIGN.spacing.sm,
  },
  addItemButtonText: {
    color: DESIGN.colors.surface,
    fontSize: DESIGN.typography.body.fontSize,
    fontWeight: DESIGN.typography.subtitle.fontWeight,
  },
  submitButton: {
    backgroundColor: DESIGN.colors.primary,
    padding: DESIGN.spacing.md,
    borderRadius: DESIGN.borderRadius.sm,
    alignItems: "center",
    marginBottom: DESIGN.spacing.sm,
  },
  submitButtonDisabled: {
    backgroundColor: DESIGN.colors.textTertiary,
  },
  submitButtonText: {
    color: DESIGN.colors.surface,
    fontSize: DESIGN.typography.bodyLarge.fontSize,
    fontWeight: DESIGN.typography.subtitle.fontWeight,
  },
  resetButton: {
    backgroundColor: DESIGN.colors.textSecondary,
    padding: DESIGN.spacing.md,
    borderRadius: DESIGN.borderRadius.sm,
    alignItems: "center",
  },
  resetButtonText: {
    color: DESIGN.colors.surface,
    fontSize: DESIGN.typography.body.fontSize,
  },
  // Existing styles
  dropdown: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: DESIGN.spacing.sm,
  },
  option: {
    padding: DESIGN.spacing.sm,
    borderWidth: 1,
    borderColor: DESIGN.colors.borderLight,
    borderRadius: DESIGN.borderRadius.sm,
    marginRight: DESIGN.spacing.sm,
    backgroundColor: DESIGN.colors.surfaceElevated,
  },
  optionSelected: {
    backgroundColor: DESIGN.colors.primary + "20",
    borderColor: DESIGN.colors.primary,
  },
  optionDisabled: {
    backgroundColor: DESIGN.colors.surfaceElevated,
    borderColor: DESIGN.colors.borderLight,
    opacity: 0.6,
  },
  optionDisabledText: {
    color: DESIGN.colors.textTertiary,
  },
  noSchemesNote: {
    fontSize: DESIGN.typography.caption.fontSize,
    color: DESIGN.colors.textSecondary,
    fontStyle: "italic",
    marginTop: DESIGN.spacing.xs,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: DESIGN.spacing.sm,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: DESIGN.colors.borderLight,
    borderRadius: DESIGN.borderRadius.sm,
    marginBottom: DESIGN.spacing.sm,
    backgroundColor: DESIGN.colors.surface,
  },
  inputWithIconText: {
    flex: 1,
    borderWidth: 0,
    marginBottom: 0,
    padding: DESIGN.spacing.sm,
  },
  orderTypeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: DESIGN.spacing.sm,
  },
});



