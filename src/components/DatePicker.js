// components/ReusableDatePicker.js   ← Recommended: create this file
import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Platform,
    StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DESIGN from "../theme";

/**
 * Reusable DatePicker – Works for Forms & Filters
 *
 * @param {string} label             - Label text (e.g. "Cheque Date *")
 * @param {string|null} value        - "YYYY-MM-DD" or null
 * @param {function} onChange        - Returns "YYYY-MM-DD"
 * @param {string} placeholder      - Text when no date selected
 * @param {Date} maximumDate         - Optional max date
 * @param {Date} minimumDate         - Optional min date
 * @param {boolean} showClear        - Show [X] button? (great for filters)
 * @param {object} style             - Extra container style
 */
const DatePicker = ({
    value,
    onChange,
    placeholder = "Select date",
    maximumDate,
    minimumDate,
    showClear = false,
    style,
}) => {
    const [show, setShow] = useState(false);

    const displayText = value
        ? new Date(value).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
        : placeholder;

    const handleChange = (event, selectedDate) => {
        setShow(false);
        if (selectedDate) {
            onChange(selectedDate.toISOString().split("T")[0]); // YYYY-MM-DD
        }
    };

    const clearDate = (e) => {
        e.stopPropagation();
        onChange(null);
    };

    return (
        <View style={style}>

            <TouchableOpacity
                style={localStyles.pickerButton}
                onPress={() => setShow(true)}
                activeOpacity={0.7}
            >
                {/* Left Icon + Text */}
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <MaterialCommunityIcons
                        name={showClear ? "calendar-range" : "calendar-month"}
                        size={20}
                        color={DESIGN.colors.primary}
                    />
                    <Text
                        style={[
                            localStyles.displayText,
                            !value && localStyles.placeholder,
                        ]}
                        numberOfLines={1}
                    >
                        {displayText}
                    </Text>
                </View>

                {/* Clear Button (only if showClear=true and has value) */}
                {showClear && value && (
                    <TouchableOpacity onPress={clearDate}>
                        <MaterialCommunityIcons name="close-circle" size={20} color="#999" />
                    </TouchableOpacity>
                )}

                {/* Default calendar icon if no clear button */}
                {!showClear && (
                    <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
                )}
            </TouchableOpacity>

            {/* Native Date Picker */}
            {show && (
                <DateTimePicker
                    value={value ? new Date(value) : new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleChange}
                    maximumDate={maximumDate}
                    minimumDate={minimumDate}
                />
            )}
        </View>
    );
};

const localStyles = StyleSheet.create({
    pickerButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: DESIGN.colors.border,
        borderRadius: 10,
        paddingVertical: 11,
        paddingHorizontal: 10
    },
    displayText: {
        marginLeft: 10,
        fontSize: DESIGN.spacing.md
    },
    placeholder: {
        color: DESIGN.colors.textSecondary,
        fontSize: DESIGN.spacing.md
    },
});

export default DatePicker;