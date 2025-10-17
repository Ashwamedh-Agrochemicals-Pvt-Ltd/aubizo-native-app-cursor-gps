import React, { useEffect, useRef } from 'react';
import {
  View,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import DESIGN from '../theme';

const { width: screenWidth } = Dimensions.get('window');
const DRAWER_WIDTH = screenWidth * 0.8; // 80% of screen width

const DrawerOverlay = ({ visible, onClose, children }) => {
  const translateX = useRef(new Animated.Value(DRAWER_WIDTH)).current; // Start from right (off-screen)
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset position before animating in
      translateX.setValue(DRAWER_WIDTH);
      overlayOpacity.setValue(0);
      
      // Animate drawer sliding in from right
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0, // Slide to final position
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate drawer sliding out to right
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: DRAWER_WIDTH, // Slide back off-screen to right
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Reset position after animation completes
        translateX.setValue(DRAWER_WIDTH);
        overlayOpacity.setValue(0);
      });
    }
  }, [visible, translateX, overlayOpacity]);

  const handleOverlayPress = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none" // Disable modal animation, use custom
      onRequestClose={onClose}
    
    >
      <View style={styles.container}>
        {/* Animated Overlay */}
        <TouchableWithoutFeedback onPress={handleOverlayPress}>
          <Animated.View
            style={[
              styles.overlay,
              {
                opacity: overlayOpacity,
              },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Drawer - Slides from Right */}
        <Animated.View
          style={[
            styles.drawer,
            {
              width: DRAWER_WIDTH,
              transform: [{ translateX }],
            },
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0, // Position at right edge
    height: '100%',
    backgroundColor: DESIGN.colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 }, // Shadow pointing left
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 1000,
  },
});

export default DrawerOverlay;
