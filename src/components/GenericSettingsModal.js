import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import DESIGN from "../theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function GenericSettingsModal({ visible, onClose, title, message, primaryText, onPrimaryPress, secondaryText }) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, DESIGN.shadows.medium]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.icon}>⚠️</Text>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={DESIGN.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Message */}
          <View style={styles.messageContainer}>
            <Text style={[styles.message, { color: DESIGN.colors.textSecondary }]}>
              {message}
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: DESIGN.colors.primary }]}
              onPress={onClose}
            >
              <Text style={{ color: DESIGN.colors.primary, fontWeight: "500" }}>
                {secondaryText || "Cancel"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.openButton, { backgroundColor: DESIGN.colors.primary }]}
              onPress={onPrimaryPress}
            >
              <Text style={{ color: "white", fontWeight: "500" }}>
                {primaryText || "Open Settings"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "flex-end" },
  modalContainer: { width: "100%", backgroundColor: DESIGN.colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: DESIGN.spacing.sm },
  header: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: DESIGN.colors.border },
  icon: { fontSize: 16, marginRight: DESIGN.spacing.sm },
  title: { fontSize: DESIGN.spacing.md, fontWeight: "600" },
  messageContainer: { paddingHorizontal: 20, paddingTop: 10, borderBottomWidth: 1, borderBottomColor: DESIGN.colors.border },
  message: { fontSize: DESIGN.typography.caption.fontSize, lineHeight: 20, marginBottom: DESIGN.spacing.md },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 20 },
  cancelButton: { flex: 1, paddingVertical: DESIGN.spacing.sm, borderRadius: 8, borderWidth: 1, marginRight: DESIGN.spacing.sm, alignItems: "center" },
  openButton: { flex: 1, paddingVertical: DESIGN.spacing.sm, borderRadius: 8, alignItems: "center" },
  closeButton: {
    position: "absolute",
    right: DESIGN.spacing.sm,
    zIndex: 10,
    padding: 4,

  }

});
