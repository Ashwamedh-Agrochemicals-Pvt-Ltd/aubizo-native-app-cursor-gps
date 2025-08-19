import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import apiClient from "../src/api/client"
import styles from "../src/styles/products.style"
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


export default function ProductScreen() {
  const [groupedProducts, setGroupedProducts] = useState([]);
  const [categories, setCategories] = useState({});
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiClient.get("product/products/");
        const productList = response?.data || [];

        const grouped = [];
        for (let i = 0; i < productList.length; i += 2) {
          grouped.push(productList.slice(i, i + 2));
        }

        setGroupedProducts(grouped);
      } catch (err) {
        console.error("Error fetching products:", err);
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

    fetchProducts();
    fetchCategories();
  }, []);

  const renderRow = ({ item, index }) => (
    <View style={styles.row}>
      {item.map((product, i) => (
        <TouchableOpacity
          key={product.id || `${index}-${i}`}
          style={styles.cardContainer}
          onPress={() =>
            navigation.navigate('ProductDetail', { productId: product.id })
          }
          activeOpacity={0.8}
        >
          <View style={styles.productCard}>
            <View style={styles.imageContainer}>
              <Image
                source={
                  product.image_url
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

  return (

    <View style={{ flex: 1, paddingBottom: insets.bottom }}>
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
      />
    </View>

  );
}


