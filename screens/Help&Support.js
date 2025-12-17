import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
} from "react-native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import DESIGN from "../src/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getBrandConfig } from '../src/config/appConfig'

const { brandName } = getBrandConfig();

const HelpSupport = () => {
    const insets = useSafeAreaInsets();
    const contactMethods = [
        {
            id: 1,
            title: "Call Support",
            description: "Speak directly with our support team",
            icon: "phone",
            color: DESIGN.colors.success,
            action: () => Linking.openURL("tel:8411887024"),
        },
        {
            id: 2,
            title: "Email Support",
            description: "Send us an email with your queries",
            icon: "envelope",
            color: DESIGN.colors.info,
            action: () => Linking.openURL("mailto:support@aubizo.com"),
        },
    ];

    const renderContactMethod = (method) => (
        <TouchableOpacity
            key={method.id}
            style={styles.contactCard}
            onPress={method.action}
            activeOpacity={0.8}
        >
            <View style={[styles.iconWrapper, { backgroundColor: method.color }]}>
                <FontAwesome name={method.icon} size={18} color="#fff" />
            </View>
            <View style={styles.textWrapper}>
                <Text style={styles.title}>{method.title}</Text>
                <Text style={styles.desc}>{method.description}</Text>
            </View>
            <MaterialIcons
                name="chevron-right"
                size={20}
                color={DESIGN.colors.textTertiary}
            />
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>
            <ScrollView
                style={styles.scroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {/* Get in Touch */}
                <Text style={styles.sectionTitle}>Get in Touch</Text>
                {contactMethods.map(renderContactMethod)}

                {/* App Info */}
                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
                    {brandName} App Info
                </Text>
                <View style={styles.infoCard}>
                    <Text style={styles.infoText}>Version: v1.0.0</Text>
                    <Text style={styles.infoText}>Developed by Aubizo Pvt. Ltd.</Text>
                    <TouchableOpacity
                        onPress={() => Linking.openURL("https://aubizo.com")}
                    >
                        <Text style={[styles.infoText, { color: DESIGN.colors.primary }]}>
                            www.aubizo.com
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Fixed Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    © {new Date().getFullYear()} Aubizo Pvt. Ltd.
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: DESIGN.colors.background,
    },
    scroll: { flex: 1 },
    content: {
        padding: DESIGN.spacing.lg,
        paddingBottom: 100,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: DESIGN.colors.textPrimary,
        marginBottom: 12,
    },
    contactCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: DESIGN.colors.surface,
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        borderWidth: 0.5,
        borderColor: DESIGN.colors.border,
    },
    iconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    textWrapper: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: "500",
        color: DESIGN.colors.textPrimary,
    },
    desc: {
        fontSize: 12,
        color: DESIGN.colors.textSecondary,
    },
    infoCard: {
        backgroundColor: DESIGN.colors.surface,
        borderRadius: 10,
        padding: 12,
        borderWidth: 0.5,
        borderColor: DESIGN.colors.border,
    },
    infoText: {
        fontSize: 13,
        color: DESIGN.colors.textSecondary,
        marginBottom: 4,
    },
    footer: {
        paddingVertical: 12,
        backgroundColor: DESIGN.colors.surface,
        borderTopWidth: 0.5,
        borderTopColor: DESIGN.colors.border,
        alignItems: "center",
    },
    footerText: {
        color: DESIGN.colors.textTertiary,
        fontSize: 12,
    },
});

export default HelpSupport;
