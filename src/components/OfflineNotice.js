import { View, StyleSheet } from "react-native";
import { AppText } from "./form/appComponents";
import Constants from "expo-constants";
import { useNetInfo } from "@react-native-community/netinfo";

function OfflineNotice() {
  const netInfo = useNetInfo();
  if (netInfo.type === "none" && netInfo.isInternetReachable === false) {
    return (
      <View style={styles.container}>
        <AppText style={styles.text}>No Internet Connection</AppText>
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: Constants.statusBarHeight,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: "#f28b88",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    elevation: 10,
  },
  text: {
    color: "white",
  },
});

export default OfflineNotice;
