import { StyleSheet, TouchableOpacity, Text } from "react-native";

function AppButton({ title, onPress, style }) {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.5}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    backgroundColor: "#2E7D32", // Light blue
    justifyContent: "center",
    marginHorizontal: 15,
  },
  text: {
    textTransform: "uppercase",
    fontWeight: "bold",
    fontSize: 16,
    color: "#fff",
  },
});

export default AppButton;
