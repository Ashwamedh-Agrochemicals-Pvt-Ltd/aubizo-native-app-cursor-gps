import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRef, useEffect } from "react";
import {
    View,
    TouchableOpacity,
    TextInput,
    StyleSheet,
} from "react-native";
import DESIGN from "../theme";

const SearchBar = ({ searchQuery, setSearchQuery, onClose }) => {
    const inputRef = useRef(null);

    useEffect(() => {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    }, []);

    return (
        <View style={styles.searchContainer}>
            <MaterialCommunityIcons
                name="magnify"
                size={20}
                color={DESIGN.colors.textSecondary}
                style={{ marginRight: DESIGN.spacing.xs }}
            />
            <TextInput
                ref={inputRef}
                style={styles.searchInput}
                placeholder="Search by Dealer or Shop name..."
                placeholderTextColor={DESIGN.colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            <TouchableOpacity onPress={onClose}>
                <MaterialCommunityIcons
                    name="close-circle"
                    size={28}
                    color={DESIGN.colors.textPrimary}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: DESIGN.colors.surface,
        marginVertical: DESIGN.spacing.sm,
        borderRadius: DESIGN.borderRadius.sm,
        paddingHorizontal: DESIGN.spacing.sm,
        marginHorizontal: DESIGN.spacing.md,
    },
    searchInput: {
        flex: 1,
        height: 48,
        fontSize: DESIGN.typography.body.fontSize,
        paddingHorizontal: DESIGN.spacing.sm,
        color: DESIGN.colors.textPrimary,
    },
})

export default SearchBar;