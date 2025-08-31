import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  ScrollView,
  Alert,
} from "react-native";
import apiClient from "../../api/client";




// ================= DiscountPriceInput Component =================
function DiscountPriceInput({ dealerPriceNoGst, value, onChange }) {
  const [localPrice, setLocalPrice] = useState(value.price ?? "");
  const [localDiscount, setLocalDiscount] = useState(value.discount ?? "");
  const [note, setNote] = useState("");




  useEffect(() => {
    setLocalPrice(value.price ?? "");
    setLocalDiscount(value.discount ?? "");
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




    if (p !== num) setNote(`Price must be between 0 and ${dealerPriceNoGst}`);
    else setNote("");




    setLocalDiscount(String(newDiscount));
    onChange({ price: p, discount: newDiscount });
  };




  return (
    <View style={{ marginBottom: 15 }}>
      <View style={styles.inputWithIcon}>
     
       <TextInput
         style={[styles.input, styles.inputWithIconText]}
         placeholder="Enter Discount"
         keyboardType="numeric"
         value={localDiscount ? `${localDiscount}%` : ""}
         onChangeText={handleDiscountChange}
       />
     </View>




      <TextInput
        style={styles.input}
        placeholder="Enter Price ₹"
        keyboardType="numeric"
        value={localPrice.toString()}
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
        style={[styles.input, { flex: 1 }]}
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
                  {schemes.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.item}
                      onPress={() => handleSelectScheme(item)}
                    >
                      <Text style={styles.text}>{item.name}</Text>
                      <Text style={styles.subtext}>
                        {item.from_date} → {item.to_date}
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
  const [dealerQuery, setDealerQuery] = useState("");
  const [dealers, setDealers] = useState([]);
  const [loadingDealer, setLoadingDealer] = useState(false);
  const [showDealerList, setShowDealerList] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState(null);




  // Product State
  const [productQuery, setProductQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [showProductList, setShowProductList] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);




  // Packing State
  const [packings, setPackings] = useState([]);
  const [loadingPacking, setLoadingPacking] = useState(false);
  const [selectedPacking, setSelectedPacking] = useState(null);
  const [showPackingList, setShowPackingList] = useState(false);




  // Price State
  const [price, setPrice] = useState("");
  const [dealerPriceNoGst, setDealerPriceNoGst] = useState("");
  const [gstRate, setGstRate] = useState("");
  const [discount, setDiscount] = useState("");
  const [caseSize, setCaseSize] = useState("");
  const [itemTotal, setItemTotal] = useState("0.00");




   




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
    const delayDebounce = setTimeout(() => {
      fetchDealers(dealerQuery);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [dealerQuery]);




  const handleSelectDealer = (dealer) => {
    setDealerQuery(dealer.shop_name);
    setSelectedDealer(dealer);
    setShowDealerList(false);
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
    const delayDebounce = setTimeout(() => {
      fetchProducts(productQuery);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [productQuery]);




  const handleSelectProduct = async (product) => {
    setProductQuery(product.name);
    setSelectedProduct(product);
    setShowProductList(false);
    setSelectedPacking(null);
    setDealerPriceNoGst("");
    setGstRate(""); // reset dealer price
    Keyboard.dismiss();




    try {
      setLoadingPacking(true);
      const response = await apiClient.get(
        `/order/api/products/${product.id}/packings/`
      );
      if (response.data.success) {
        setPackings(response.data.data);
        setShowPackingList(true);
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
        setDealerPriceNoGst(response.data.data.dealer_price_per_unit_no_gst);
        setGstRate(response.data.data.gst_rate);
        setCaseSize(response.data.data.units_per_case || 0);
      } else {
        setDealerPriceNoGst("");
        setGstRate("");
        setCaseSize(0);
      }
    } catch (error) {
      console.log("Error fetching packing details", error);
      setDealerPriceNoGst("");
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


      // Debug logging
      console.log("Selected dealer:", selectedDealer);
      console.log("Dealer ID:", selectedDealer.id);


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


      console.log("Order data being sent:", JSON.stringify(orderData, null, 2));


      const response = await apiClient.post("/order/api/orders/create/", orderData);


      if (response.data.success) {
        Alert.alert(
          "Success",
          `Order ${response.data.data.order_number} created successfully!\nExpected Delivery: ${response.data.data.expected_delivery_date}`,
          [{ text: "OK", onPress: resetForm }]
        );
      } else {
        console.log("Order creation failed:", response.data);
        Alert.alert("Error", response.data.error || "Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
     
      // Handle API error response
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        console.log("API Error Details:", errorData);
       
        if (errorData.errors) {
          // Handle validation errors
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('\n');
          Alert.alert("Validation Error", errorMessages);
        } else {
          Alert.alert("Error", errorData.error || errorData.message || "Failed to create order");
        }
      } else {
        Alert.alert("Error", "Failed to create order. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  const resetForm = () => {
    setOrderItems([]);
    setOrderRemark("");
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
      const gstRateForItem = parseFloat(gstRate) || 5; // fallback to 5%
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


  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create Order</Text>
        {selectedDealer && (
          <Text style={styles.selectedDealer}>
            For: {selectedDealer.shop_name}
          </Text>
        )}
      </View>


      {/* Dealer Search */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Dealer</Text>
        <TextInput
          style={styles.input}
          placeholder="Search dealer..."
          value={dealerQuery}
          onChangeText={setDealerQuery}
        />
        {loadingDealer && <ActivityIndicator style={{ marginVertical: 8 }} />}
        {showDealerList && dealers.length > 0 && (
          <View style={styles.list}>
            {dealers.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.item}
                onPress={() => handleSelectDealer(item)}
              >
                <Text style={styles.text}>{item.shop_name}</Text>
                <Text style={styles.subtext}>{item.owner_name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>


      {/* Current Order Items */}
      {orderItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items ({orderItems.length})</Text>
          {orderItems.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.orderItemHeader}>
                <Text style={styles.orderItemName}>{item.product_name}</Text>
                <TouchableOpacity
                  onPress={() => removeItemFromOrder(index)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.orderItemDetails}>
                {item.packing_size} • {item.quantity} {item.quantity_unit} • ₹{item.price}
                {item.discount > 0 && ` • ${item.discount}% off`} • Total: ₹{item.item_total}
              </Text>
              <Text style={styles.orderItemType}>Type: {item.product_order_type}</Text>
            </View>
          ))}
         
          {/* Order Totals */}
          {(() => {
            const totals = calculateOrderTotals();
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
      )}


      {/* Add New Item Section */}
      {selectedDealer && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add New Item</Text>
         
          {/* Product Search */}
          <TextInput
            style={styles.input}
            placeholder="Search product..."
            value={productQuery}
            onChangeText={setProductQuery}
          />
          {loadingProduct && <ActivityIndicator style={{ marginVertical: 8 }} />}
          {showProductList && products.length > 0 && (
            <View style={styles.list}>
              {products.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.item}
                  onPress={() => handleSelectProduct(item)}
                >
                  <Text style={styles.text}>{item.name}</Text>
                  <Text style={styles.subtext}>{item.category_name}</Text>
                </TouchableOpacity>
              ))}
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
          {selectedProduct && (
            <OrderTypePicker
              productId={selectedProduct.id}
              value={orderType}
              onChange={setOrderType}
            />
          )}


          {/* Quantity Input */}
          {selectedProduct && (
            <QuantityInput value={quantity} onChange={setQuantity} />
          )}


          {/* Dealer Price Display */}
          {selectedPacking && (
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              value={dealerPriceNoGst ? `₹ ${dealerPriceNoGst} (No GST)` : ""}
              editable={false}
              placeholder="Dealer price (No GST)"
            />
          )}


          {/* Tax Rate Display */}
          {selectedPacking && (
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              value={gstRate ? `${gstRate}% GST` : ""}
              editable={false}
              placeholder="Tax Rate"
            />
          )}


          {/* Price & Discount Input */}
          {selectedPacking && (
            <DiscountPriceInput
              dealerPriceNoGst={Number(dealerPriceNoGst)}
              value={{ price, discount }}
              onChange={({ price, discount }) => {
                setPrice(price?.toString() ?? "");
                setDiscount(discount?.toString() ?? "");
              }}
            />
          )}


          {/* Case Size Warning */}
          {selectedPacking && quantity.quantity_unit === "case" && (!caseSize || caseSize <= 0) && (
            <Text style={{ color: "red", fontSize: 12, marginBottom: 10 }}>
              ⚠️ No case size available for this product
            </Text>
          )}


          {/* Item Total Display */}
          {selectedPacking && (
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              value={`₹${itemTotal} (Item Total)`}
              editable={false}
              placeholder="Item Total"
            />
          )}


          {/* Add Item Button */}
          {selectedProduct &&
           selectedPacking &&
           quantity.quantity &&
           price &&
           (quantity.quantity_unit === "units" || (quantity.quantity_unit === "case" && caseSize > 0)) &&
           itemTotal !== "0.00" && (
            <TouchableOpacity
              style={styles.addItemButton}
              onPress={addItemToOrder}
            >
              <Text style={styles.addItemButtonText}>Add Item to Order</Text>
            </TouchableOpacity>
          )}
        </View>
      )}


      {/* Order Remarks */}
      {orderItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Remarks (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter any remarks for this order..."
            value={orderRemark}
            onChangeText={setOrderRemark}
            multiline
            numberOfLines={3}
          />
        </View>
      )}


      {/* Submit Order Button */}
      {orderItems.length > 0 && (
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={submitOrder}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                Create Order ({orderItems.length} items)
              </Text>
            )}
          </TouchableOpacity>
         
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetForm}
          >
            <Text style={styles.resetButtonText}>Reset Form</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5"
  },
  header: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  selectedDealer: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  section: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  readOnlyInput: {
    backgroundColor: "#f9f9f9",
    color: "#666",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  placeholder: {
    color: "#999",
  },
  list: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    maxHeight: 200,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  text: {
    fontSize: 16,
    color: "#333",
  },
  subtext: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },
 
  // Order Items Styles
  orderItem: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#007bff",
  },
  orderItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  removeButton: {
    backgroundColor: "#ff4757",
    borderRadius: 15,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  orderItemDetails: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  orderItemType: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
    fontStyle: "italic",
  },


  // Totals Styles
  totalsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: "#666",
  },
  totalValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 8,
    marginTop: 8,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007bff",
  },


  // Button Styles
  addItemButton: {
    backgroundColor: "#28a745",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  addItemButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#007bff",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  resetButton: {
    backgroundColor: "#6c757d",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 16,
  },
 
  // Existing styles
  dropdown: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  option: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 6,
    marginRight: 8,
  },
  optionSelected: {
    backgroundColor: "#e0f7fa",
    borderColor: "#00796b",
  },
  optionDisabled: {
    backgroundColor: "#f5f5f5",
    borderColor: "#ddd",
    opacity: 0.6,
  },
  optionDisabledText: {
    color: "#999",
  },
  noSchemesNote: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginTop: 5,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  inputWithIconText: {
    flex: 1,
    borderWidth: 0,
    marginBottom: 0,
    padding: 12,
  },
});



























