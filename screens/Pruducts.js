import { useEffect, useState, useCallback } from "react";
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import apiClient from "../src/api/client";
import styles from "../src/styles/products.style";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SafeAreaView } from "react-native";
import DESIGN from "../src/theme";

const PRODUCTELIST_URL = process.env.EXPO_PUBLIC_PRODUCTELIST_URL;

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
      for (let i = 0; i < productList.length; i += 2) {
        grouped.push(productList.slice(i, i + 2));
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
    <View style={styles.row}>
      {item.map((product, i) => (
        <TouchableOpacity
          key={product.id || `${index}-${i}`}
          style={styles.cardContainer}
          onPress={() =>
            navigation.navigate("Product Details", { productId: product.id })
          }
          activeOpacity={0.8}
        >
          <View style={styles.productCard}>
            <View style={styles.imageContainer}>
              <Image
                source={
                  product.image
                    ? { uri: product.image }
                    : require("../assets/images/placeholder.jpg") // fallback image
                }
                style={styles.productImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.categoryText} numberOfLines={1}>
                {categories[product.category] || "No Category"}
              </Text>
              <Text style={styles.productTitle} numberOfLines={2}>
                {product.title || product.name}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
      {item.length === 1 && <View style={styles.cardContainer} />}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.listContainer, { flex: 1, justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }
  if (error) {
    return (
      <View
        style={[
          styles.listContainer,
          { flex: 1, justifyContent: "center", alignItems: "center" },
        ]}
      >
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
          <Text
            style={{
              color: DESIGN.colors.surface,
              fontSize: DESIGN.typography.body.fontSize,
              fontWeight: DESIGN.typography.subtitle.fontWeight,
              textAlign: "center",
            }}
          >
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }


  if (groupedProducts.length === 0) {
    return (
      <View style={[styles.listContainer, { flex: 1, justifyContent: "center" }]}>
        <Text style={{ fontSize: 16, color: "#555" }}>No products available</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>

      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Our Products</Text>
        <Text style={styles.headerSubtitle}>
          Discover our range of agricultural solutions
        </Text>
      </View>

      <FlatList
        data={groupedProducts}
        renderItem={renderRow}
        keyExtractor={(_item, index) => `row-${index}`}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

    </SafeAreaView>
  );
}
