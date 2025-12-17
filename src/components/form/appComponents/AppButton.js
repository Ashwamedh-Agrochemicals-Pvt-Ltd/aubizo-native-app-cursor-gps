import { StyleSheet, TouchableOpacity, Text } from "react-native";
import DESIGN from "../../../theme";

function AppButton({ title, onPress, style, styleButtonText }) {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.5}
    >
      <Text style={[styles.text, styleButtonText]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    backgroundColor: DESIGN.colors.primary,
    justifyContent: "center",
    marginHorizontal: 15,
  },
  text: {
    textTransform: "capitalize",
    fontWeight: "bold",
    fontSize: 16,
    color: "#fff",
  },
});

export default AppButton;
