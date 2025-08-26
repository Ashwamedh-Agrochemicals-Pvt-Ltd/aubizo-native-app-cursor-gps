import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import apiClient from "../src/api/client";
import DESIGN from "../src/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProductDetailScreen({ route }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const insets = useSafeAreaInsets();

  const fetchProduct = async () => {
    try {
      setError(null);
      setLoading(true);

      const response = await apiClient.get(`product/products/${productId}/`);
      const productData = response.data;
      setProduct(productData);

      // Fetch category name
      const categoryResponse = await apiClient.get("product/categories/");
      const categories = categoryResponse.data || [];
      const category = categories.find(
        (cat) => cat.id === productData.category
      );
      setCategoryName(category ? category.name : "No Category");
    } catch (err) {
      console.error("Error fetching product details:", err);
      setError("Failed to load product details.");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={DESIGN.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loader}>
        <Text style={styles.notFound}>{error}</Text>
        <TouchableOpacity onPress={fetchProduct} style={{ marginTop: 12 }}>
          <Text style={{ color: DESIGN.colors.primary }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.loader}>
        <Text style={styles.notFound}>Product not found.</Text>
      </View>
    );
  }

  // Build fields array
  const fields = [
    { label: "Active Ingredients", value: product.active_ingredients },
    { label: "Crop Recommendation", value: product.crop_recommendation },
    { label: "Mode of Action", value: product.mode_of_action },
    { label: "Application Method", value: product.application_method },
    { label: "Application Rate", value: product.application_rate },
    { label: "Application Stage", value: product.application_stage },
    { label: "Compatibility", value: product.compatibility },
    { label: "Benefits", value: product.benefits },
    { label: "Presentation", value: product.presentation },
    { label: "Min. Viable Cell Count", value: product.min_viable_cell_count },
  ].filter((item) => item.value); // remove empty ones

  return (
    <View style={{ flex: 1, paddingBottom: insets.bottom }}>
      <FlatList
        data={fields}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: DESIGN.spacing.lg }}
        ListHeaderComponent={
          <View>
            <Image
              source={
                product.image
                  ? { uri: product.image }
                  : require("../assets/images/placeholder.jpg")
              }
              style={styles.image}
              resizeMode="cover"
            />

            <View style={styles.content}>
              <Text style={styles.title}>{product.name}</Text>
              <Text style={styles.category}>{categoryName}</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.field, DESIGN.shadows.subtle]}>
            <Text style={styles.fieldLabel}>{item.label}</Text>
            <Text style={styles.fieldValue}>{item.value}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN.colors.background,
    margin:DESIGN.spacing.md
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: DESIGN.spacing.md,
  },
  notFound: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textSecondary,
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: 250,
    backgroundColor: DESIGN.colors.surfaceElevated,
  },
  content: {
    padding: DESIGN.spacing.md,
  },
  title: {
    ...DESIGN.typography.title,
    color: DESIGN.colors.textPrimary,
  },
  category: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textSecondary,
    marginTop: DESIGN.spacing.xs,
    marginBottom: DESIGN.spacing.md,
  },
  field: {
    marginBottom: DESIGN.spacing.md,
    backgroundColor: DESIGN.colors.surface,
    padding: DESIGN.spacing.sm,
    borderRadius: DESIGN.borderRadius.md,
  },
  fieldLabel: {
    ...DESIGN.typography.subtitle,
    color: DESIGN.colors.textPrimary,
    marginBottom: DESIGN.spacing.xs,
  },
  fieldValue: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textSecondary,
    lineHeight: 20,
  },
});
