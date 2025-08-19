import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // ✅ import icon
import apiClient from "../../api/client";
import DESIGN from "../../theme";

function OTPModal({ visible, dealerId, onClose, onVerified }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(300);

  const inputsRef = useRef([]);

  // Countdown for resend
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Reset OTP when modal opens
  useEffect(() => {
    if (visible) {
      setOtp(["", "", "", "", "", ""]);
      setResendCooldown(300);
    }
  }, [visible]);

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text.slice(-1);
    setOtp(newOtp);

    if (text && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && otp[index] === "" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const sendOtp = async () => {
    if (!dealerId) {
      Alert.alert("Error", "Dealer ID missing. Cannot send OTP.");
      return;
    }
    try {
      setSending(true);
      await apiClient.post(`dealer/${dealerId}/send-otp/`);
      Alert.alert("Success", "OTP sent successfully to dealer's phone.");
      setResendCooldown(300);
    } catch (err) {
      console.error("Send OTP error:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to send OTP.");
    } finally {
      setSending(false);
    }
  };

  const verifyOtp = async (codeParam) => {
    if (!dealerId) {
      Alert.alert("Error", "Dealer ID missing. Cannot verify OTP.");
      return;
    }

    const code = codeParam || otp.join("");
    if (code.length !== 6) return;

    try {
      setVerifying(true);
      const resp = await apiClient.post(`dealer/${dealerId}/verify-otp/`, {
        otp: code,
      });

      if (resp?.data?.is_verified === true) {
        Alert.alert("Success", "OTP verified successfully.");
        if (typeof onVerified === "function") onVerified();
      } else {
        Alert.alert("Error", resp?.data?.message || "Invalid OTP");
      }
       if (typeof onVerified === "function") onVerified();
    } catch (err) {
      console.error("Verify OTP error:", err.response?.data || err.message);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Failed to verify OTP";
      Alert.alert("Error", msg);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          {/* 🔹 Close button */}
          <TouchableOpacity style={modalStyles.closeBtn} onPress={onClose}>
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={DESIGN.colors.textSecondary}
            />
          </TouchableOpacity>

          <Text style={modalStyles.title}>Verify Mobile Number</Text>
          <Text style={modalStyles.info}>
            Enter the 6-digit OTP sent to dealer's phone.
          </Text>

          <View style={modalStyles.otpRow}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                value={digit}
                onChangeText={(t) => handleChange(t, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                keyboardType="numeric"
                maxLength={1}
                style={modalStyles.otpBox}
              />
            ))}
          </View>

          <View style={modalStyles.row}>
            {/* Resend button */}
            <TouchableOpacity
              style={[
                modalStyles.btn,
                resendCooldown > 0
                  ? modalStyles.disabledBtn
                  : modalStyles.resendBtn,
              ]}
              onPress={sendOtp}
              disabled={resendCooldown > 0 || sending}
            >
              {sending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={modalStyles.btnText}>
                  {resendCooldown > 0
                    ? `Resend (${Math.floor(resendCooldown / 60)}:${String(
                        resendCooldown % 60
                      ).padStart(2, "0")})`
                    : "Resend"}
                </Text>
              )}
            </TouchableOpacity>

            {/* Verify button */}
            <TouchableOpacity
              style={[modalStyles.btn, modalStyles.resendBtn]}
              onPress={() => verifyOtp()}
              disabled={verifying || otp.join("").length !== 6}
            >
              {verifying ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={modalStyles.btnText}>Verify</Text>
              )}
            </TouchableOpacity>
          </View>

          {verifying && (
            <View style={{ marginTop: 10 }}>
              <ActivityIndicator size="large" color={DESIGN.colors.primary} />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

export default OTPModal;

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: DESIGN.spacing.md,
  },
  container: {
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.borderRadius.xl,
    padding: DESIGN.spacing.lg,
    width: "100%",
    maxWidth: 360,
    ...DESIGN.shadows.medium,
  },
  closeBtn: {
    position: "absolute",
    top: DESIGN.spacing.sm,
    right: DESIGN.spacing.sm,
    zIndex: 10,
    padding: 4,
  },
  title: {
    ...DESIGN.typography.title,
    color: DESIGN.colors.textPrimary,
    textAlign: "center",
    marginBottom: DESIGN.spacing.xs,
  },
  info: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textSecondary,
    textAlign: "center",
    marginBottom: DESIGN.spacing.lg,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: DESIGN.spacing.lg,
  },
  otpBox: {
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
    borderRadius: DESIGN.borderRadius.md,
    width: 45,
    height: 50,
    textAlign: "center",
    ...DESIGN.typography.subtitle,
    backgroundColor: DESIGN.colors.surfaceElevated,
    color: DESIGN.colors.textPrimary,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
  },
  btn: {
    padding: DESIGN.spacing.md,
    borderRadius: DESIGN.borderRadius.lg,
    alignItems: "center",
    marginHorizontal: DESIGN.spacing.xs,
    width: 140,
  },
  resendBtn: {
    backgroundColor: DESIGN.colors.secondary,
  },
  disabledBtn: {
    backgroundColor: DESIGN.colors.borderLight,
  },
  btnText: {
    ...DESIGN.typography.button,
    color: DESIGN.colors.surface,
  },
});
