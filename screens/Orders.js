import { StyleSheet, Text, View } from "react-native";

function OrderScreen() {
  return (
      <View style={styles.container}>
        <Text style={styles.title}>Orders</Text>
        <Text style={styles.message}>
          The Orders section is currently under development. Upcoming updates
          will include order placement, tracking, and order history details.
        </Text>
      </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    color: "gray",
  },
});
export default OrderScreen;
