import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import apiClient from "../src/api/client";
import DESIGN from "../src/theme";

export default function ProductDetailScreen({ route }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await apiClient.get(`product/products/${productId}/`);
        const productData = response.data;
        setProduct(productData);

        // Fetch category name
        const categoryResponse = await apiClient.get("product/categories/");
        const categories = categoryResponse.data;
        const category = categories.find(
          (cat) => cat.id === productData.category
        );
        setCategoryName(category ? category.name : "No Category");
      } catch (err) {
        console.error("Error fetching product details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={DESIGN.colors.primary} />
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

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: product.image }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.category}>{categoryName}</Text>

        {renderField("Active Ingredients", product.active_ingredients)}
        {renderField("Crop Recommendation", product.crop_recommendation)}
        {renderField("Mode of Action", product.mode_of_action)}
        {renderField("Application Method", product.application_method)}
        {renderField("Application Rate", product.application_rate)}
        {renderField("Application Stage", product.application_stage)}
        {renderField("Compatibility", product.compatibility)}
        {renderField("Benefits", product.benefits)}
        {renderField("Presentation", product.presentation)}
        {renderField("Min. Viable Cell Count", product.min_viable_cell_count)}
      </View>
    </ScrollView>
  );
}

const renderField = (label, value) => {
  if (!value) return null;
  return (
    <View style={[styles.field, DESIGN.shadows.subtle]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN.colors.background,
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
