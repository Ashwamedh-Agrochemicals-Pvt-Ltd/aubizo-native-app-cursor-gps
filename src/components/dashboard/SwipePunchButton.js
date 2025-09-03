// components/SwipePunchButton.js
import { forwardRef, useRef, useEffect, useImperativeHandle } from "react";
import { View, Text, Animated, PanResponder, ActivityIndicator, StyleSheet, TouchableHighlight } from "react-native";
import DESIGN from "../../theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";




const TRACK_WIDTH = 320;
const THUMB_SIZE = 60;
const SWIPE_THRESHOLD = (TRACK_WIDTH - THUMB_SIZE) * 0.6; // 60% of track




const SwipePunchButton = forwardRef(({ onSwipe, loading, hasInpunch }, ref) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const MAX_TRANSLATE = TRACK_WIDTH - THUMB_SIZE;




    // Expose reset() to parent
    useImperativeHandle(ref, () => ({
        reset(animated = true) {
            if (animated) {
                Animated.spring(translateX, {
                    toValue: 0,
                    useNativeDriver: true,
                }).start();
            } else {
                translateX.setValue(0);
            }
        },
    }), [translateX]);




    // When loading becomes false, animate the thumb back (smooth) — keeps UX consistent
    useEffect(() => {
        if (!loading) {
            Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true,
            }).start();
        }
    }, [loading, translateX]);




    const labelOpacity = translateX.interpolate({
        inputRange: [0, MAX_TRANSLATE * 0.6, MAX_TRANSLATE],
        outputRange: [1, 0.3, 0],
        extrapolate: "clamp",
    });




    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => !loading,
            onPanResponderMove: (_, g) => {
                if (!loading) {
                    // clamp between 0 and MAX_TRANSLATE
                    const newX = Math.max(0, Math.min(g.dx, MAX_TRANSLATE));
                    translateX.setValue(newX);
                }
            },
            onPanResponderRelease: (_, g) => {
                if (loading) return;




                if (g.dx > SWIPE_THRESHOLD) {
                    console.log("Swipe threshold reached, calling onSwipe");
                    onSwipe?.(); // Call parent function
                    // Reset to start position immediately after calling onSwipe
                    Animated.spring(translateX, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start();
                } else {
                    Animated.spring(translateX, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;








    return (
        <TouchableHighlight style={styles.container}>
            <View style={styles.track}>
                <Animated.Text style={[styles.trackLabel, { opacity: labelOpacity }]}>
                    {hasInpunch ? "Swipe to Punch Out" : "Swipe to Punch In"}
                </Animated.Text>
                <Animated.View
                    style={[
                        styles.thumb,
                        { transform: [{ translateX }] },
                    ]}
                    {...panResponder.panHandlers}
                >
                    {loading ? (
                        <ActivityIndicator size={24} color="#FFF" />
                    ) : (
                        <MaterialCommunityIcons name="chevron-right" size={45} color="#FFF" />
                    )}

                </Animated.View>
            </View>
        </TouchableHighlight>




    );
});




export default SwipePunchButton;




const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 20,              // distance from bottom
        left: 0,
        right: 0,
        alignItems: "center",
        paddingHorizontal: DESIGN.spacing.lg,
    },
    trackLabel: {
        ...DESIGN.typography.body,
        fontWeight: "600",
        color: DESIGN.colors.textSecondary,
        textAlign: "center",
        width: "100%",
    },
    track: {
        width: TRACK_WIDTH,
        height: THUMB_SIZE,
        backgroundColor: DESIGN.colors.surface,
        borderRadius: THUMB_SIZE / 2,
        justifyContent: "center",
    },
    thumb: {
        position: "absolute",
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        ...DESIGN.shadows.medium,
        backgroundColor: DESIGN.colors.primary,
    },
    thumbText: {
        color: DESIGN.colors.surface,
        fontSize: 22,
        fontWeight: "bold"
    },
});



