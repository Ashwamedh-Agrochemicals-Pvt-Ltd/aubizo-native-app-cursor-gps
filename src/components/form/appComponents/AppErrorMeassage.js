import AppText from "./AppText";
import { StyleSheet } from "react-native";
import DESIGN from "../../../theme";

function AppErrorMessage({ error, visible, errorStyle }) {
  if (!visible || !error) return null;

  return (
    <AppText style={[styles.text, errorStyle]}>
      {error}
    </AppText>
  );
}

const styles = StyleSheet.create({
  text: {
    color: DESIGN.colors.error || "red",
    fontSize: DESIGN.typography.fontSizeSm,

  },
});

export default AppErrorMessage;
