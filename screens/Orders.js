import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View,TouchableOpacity,Platform } from "react-native";
import DESIGN from "../src/theme";
import { navigation } from "../navigation/NavigationService";

function OrderScreen() {
  return (
     <View style={modernStyles.bottomButtonContainer}>
        <TouchableOpacity
          style={modernStyles.addButton}
          onPress={()=>navigation.navigate("OrderForm")}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="plus"
            size={24}
            color={DESIGN.colors.surface}
          />
        </TouchableOpacity>
      </View>
  );
}
const modernStyles = StyleSheet.create({
   bottomButtonContainer: {
  position: "absolute",
  bottom: Platform.OS === "ios" ? DESIGN.spacing.xl : DESIGN.spacing.lg,
  right: DESIGN.spacing.lg,
},
addButton: {
  backgroundColor: DESIGN.colors.primary,
  width: 56,
  height: 56,
  borderRadius: 28, // perfect circle
  alignItems: "center",
  justifyContent: "center",
  ...DESIGN.shadows.medium,
},

addButtonText: {
  display: "none", // FAB usually has only an icon
},
});
export default OrderScreen;
