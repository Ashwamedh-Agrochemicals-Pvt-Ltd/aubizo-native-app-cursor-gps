import React, { useEffect, useState } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { AppText } from "./form/appComponents";
import Constants from "expo-constants";
import { useNetInfo } from "@react-native-community/netinfo";

function OfflineNotice() {
  const netInfo = useNetInfo();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const slideAnim = useState(new Animated.Value(-60))[0];

  useEffect(() => {
    let msg = "";
    // Detect fully offline
    if (netInfo.type === "none" && netInfo.isInternetReachable === false) {
      msg = "No Internet Connection";
    }
    // Detect poor connection: only on 3G cellular or weak WiFi
    else if (
      netInfo.details?.cellularGeneration === "3g" ||
      (netInfo.details?.strength !== undefined && netInfo.details.strength <= 30)
    ) {
      msg = "Poor Internet Connection";
    }

    setMessage(msg);
    setVisible(msg !== "");

    // Animate banner sliding in/out
    Animated.timing(slideAnim, {
      toValue: msg ? Constants.statusBarHeight : -60,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [netInfo, slideAnim]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { top: slideAnim }]}>
      <AppText style={styles.text}>{message}</AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: "#f28b88",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    elevation: 10,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { height: 3, width: 0 },
  },
  text: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
});

export default OfflineNotice;
