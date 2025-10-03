import { useEffect, useState, useCallback } from "react";
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import apiClient from "../src/api/client";
import { useNavigation } from "@react-navigation/native";
import DESIGN from "../src/theme";

const PRODUCTELIST_URL = process.env.EXPO_PUBLIC_PRODUCTELIST_URL;

// Screen width and dynamic card sizing
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_MARGIN = 16;
const NUM_COLUMNS = SCREEN_WIDTH > 768 ? 3 : 2; // iPad > 768 width
const CARD_WIDTH = (SCREEN_WIDTH - (NUM_COLUMNS + 1) * CARD_MARGIN) / NUM_COLUMNS;

export default function ProductScreen() {
  const [groupedProducts, setGroupedProducts] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const navigation = useNavigation();

  const fetchProducts = async () => {
    try {
      setError(null);
      const response = await apiClient.get(PRODUCTELIST_URL);
      const productList = response?.data || [];

      const grouped = [];
      for (let i = 0; i < productList.length; i += NUM_COLUMNS) {
        grouped.push(productList.slice(i, i + NUM_COLUMNS));
      }
      setGroupedProducts(grouped);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products.");
      setGroupedProducts([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get("product/categories/");
      const categoryMap = {};
      res?.data?.forEach((cat) => {
        categoryMap[cat.id] = cat.name;
      });
      setCategories(categoryMap);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchProducts(), fetchCategories()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const renderRow = ({ item, index }) => (
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: CARD_MARGIN, paddingHorizontal: CARD_MARGIN }}>
      {item.map((product, i) => (
        <TouchableOpacity
          key={product.id || `${index}-${i}`}
          style={{ width: CARD_WIDTH }}
          onPress={() => navigation.navigate("Product Details", { productId: product.id })}
          activeOpacity={0.8}
        >
          <View style={{
            backgroundColor: "#fff",
            borderRadius: 8,
            overflow: "hidden",
            elevation: 3,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}>
            <View style={{ width: "100%", aspectRatio: 1 }}>
              <Image
                source={product.image ? { uri: product.image } : require("../assets/images/placeholder.jpg")}
                style={{ width: "100%", height: "100%", borderRadius: 8 }}
                resizeMode="cover"
              />
            </View>
            <View style={{ padding: 8 }}>
              <Text style={{ fontSize: 12, color: "#888" }} numberOfLines={1}>
                {categories[product.category] || "No Category"}
              </Text>
              <Text style={{ fontSize: 14, fontWeight: "bold" }} numberOfLines={2}>
                {product.title || product.name}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
      {item.length < NUM_COLUMNS &&
        Array.from({ length: NUM_COLUMNS - item.length }).map((_, i) => (
          <View key={`empty-${i}`} style={{ width: CARD_WIDTH }} />
        ))}
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color={DESIGN.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <TouchableOpacity
          onPress={loadData}
          style={{
            backgroundColor: DESIGN.colors.primary,
            paddingVertical: DESIGN.spacing.md,
            paddingHorizontal: DESIGN.spacing.lg,
            borderRadius: DESIGN.borderRadius.md,
            ...DESIGN.shadows.medium,
          }}
        >
          <Text style={{ color: DESIGN.colors.surface, fontSize: DESIGN.typography.body.fontSize, fontWeight: DESIGN.typography.subtitle.fontWeight, textAlign: "center" }}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (groupedProducts.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 16, color: "#555" }}>No products available</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={groupedProducts}
      renderItem={renderRow}
      keyExtractor={(_item, index) => `row-${index}`}
      contentContainerStyle={{ paddingVertical: CARD_MARGIN }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[DESIGN.colors.primary]}
          tintColor={DESIGN.colors.primary}
        />
      }
    />
  );
}
