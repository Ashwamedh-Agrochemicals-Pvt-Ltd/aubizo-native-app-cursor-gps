import axios from "axios";
import * as Location from "expo-location";
import { Alert, BackHandler } from "react-native";

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
const GOOGLE_URL = process.env.EXPO_PUBLIC_GOOGLE_URL;

// Cache for GPS coordinates and geocoding results
let gpsCache = {
  coordinates: null,
  address: null,
  timestamp: null,
  maxAge: 1 * 60 * 1000, // 5 minutes cache
};

const getCurrentLocationDetails = async () => {
  const startTime = Date.now();
  
  if (__DEV__) {
    console.log("📍 [GPS] Starting location acquisition...");
  }

  try {
    // Step 1: Check cache first
    const now = Date.now();
    if (gpsCache.coordinates && gpsCache.timestamp && (now - gpsCache.timestamp) < gpsCache.maxAge) {
      if (__DEV__) {
        console.log("📍 [GPS] Using cached location data");
      }
      return {
        latitude: gpsCache.coordinates.latitude,
        longitude: gpsCache.coordinates.longitude,
        address: gpsCache.address,
      };
    }

    // Step 2: Permission Check/Request
    const permissionStart = Date.now();
    const { status } = await Location.requestForegroundPermissionsAsync();
    const permissionTime = Date.now() - permissionStart;
    
    if (__DEV__) {
      console.log(`📍 [GPS] Permission check took: ${permissionTime}ms (Status: ${status})`);
    }

    if (status !== "granted") {
      // Handle denied permission gracefully instead of throwing error
      Alert.alert(
        'Location Permission Required',
        'Location access is needed for this feature. You can enable it in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Settings', onPress: () => Location.openSettings() }
        ]
      );
      return {
        latitude: null,
        longitude: null,
        address: "Location permission denied",
      };
    }

    // Step 3: GPS Coordinates Acquisition with optimized settings
    const gpsStart = Date.now();
    
    // Try with faster settings first
    let location = null;
    try {
      // First attempt: Fast acquisition with lower accuracy
      location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low, // Lower accuracy for faster acquisition
        maximumAge: 60000, // Accept location up to 1 minute old
        timeout: 5000, // 5 second timeout for fast attempt
      });
      
      if (__DEV__) {
        console.log("📍 [GPS] Fast GPS acquisition successful");
      }
    } catch (fastError) {
      if (__DEV__) {
        console.log("📍 [GPS] Fast GPS failed, trying balanced accuracy...");
      }
      
      // Second attempt: Balanced accuracy with longer timeout
      try {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          maximumAge: 30000, // 30 seconds
          timeout: 10000, // 10 second timeout
        });
        
        if (__DEV__) {
          console.log("📍 [GPS] Balanced GPS acquisition successful");
        }
      } catch (balancedError) {
        if (__DEV__) {
          console.log("📍 [GPS] Balanced GPS failed, trying high accuracy...");
        }
        
        // Third attempt: High accuracy as last resort
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          maximumAge: 0, // Always get fresh location
          timeout: 15000, // 15 second timeout
        });
        
        if (__DEV__) {
          console.log("📍 [GPS] High accuracy GPS acquisition successful");
        }
      }
    }
    
    const gpsTime = Date.now() - gpsStart;
    const { latitude, longitude } = location.coords;

    if (__DEV__) {
      console.log(`📍 [GPS] GPS acquisition took: ${gpsTime}ms (Lat: ${latitude}, Lon: ${longitude})`);
    }

    // Step 4: Geocoding API Call (with caching)
    let address = "Address not found";
    
    // Check if we have cached address for nearby coordinates
    if (gpsCache.address && gpsCache.coordinates) {
      const latDiff = Math.abs(latitude - gpsCache.coordinates.latitude);
      const lonDiff = Math.abs(longitude - gpsCache.coordinates.longitude);
      
      // If coordinates are within ~100 meters, reuse cached address
      if (latDiff < 0.001 && lonDiff < 0.001) {
        address = gpsCache.address;
        if (__DEV__) {
          console.log("📍 [GPS] Using cached address (coordinates within 100m)");
        }
      }
    }
    
    // If no cached address, fetch from API
    if (address === "Address not found") {
      const geocodingStart = Date.now();
      const url = `${GOOGLE_URL}?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`;

      const response = await axios.get(url, {
        timeout: 5000 // 5 second timeout for geocoding
      });
      const geocodingTime = Date.now() - geocodingStart;
      
      const data = response.data;

      address = data.status === "OK" && data.results.length > 0
        ? data.results[0].formatted_address
        : "Address not found";

      if (__DEV__) {
        console.log(`📍 [GPS] Geocoding took: ${geocodingTime}ms (Address: ${address})`);
      }
    }

    // Update cache
    gpsCache = {
      coordinates: { latitude, longitude },
      address,
      timestamp: now,
      maxAge: 5 * 60 * 1000, // 5 minutes
    };

    const totalTime = Date.now() - startTime;
    
    if (__DEV__) {
      console.log(`📍 [GPS] Total location acquisition took: ${totalTime}ms`);
      console.log(`📍 [GPS] Breakdown: Permission(${permissionTime}ms) + GPS(${gpsTime}ms) + Geocoding(${geocodingTime || 0}ms) = ${totalTime}ms`);
    }

    return {
      latitude,
      longitude,
      address,
    };
  } catch (error) {
    const totalTime = Date.now() - startTime;
    
    if (__DEV__) {
      console.error(`📍 [GPS] Location acquisition failed after ${totalTime}ms:`, error.message);
    }
    
    // Return cached data if available, even if expired
    if (gpsCache.coordinates) {
      if (__DEV__) {
        console.log("📍 [GPS] Returning cached data as fallback");
      }
      return {
        latitude: gpsCache.coordinates.latitude,
        longitude: gpsCache.coordinates.longitude,
        address: gpsCache.address || "Cached location",
      };
    }
    
    Alert.alert(
      'Location Error',
      'Unable to get your location. Please try again.',
      [{ text: 'OK' }]
    );
    return {
      latitude: null,
      longitude: null,
      address: "Error fetching location",
    };
  }
};

// Function to clear GPS cache (useful for testing or when user moves significantly)
const clearGPSCache = () => {
  gpsCache = {
    coordinates: null,
    address: null,
    timestamp: null,
    maxAge: 5 * 60 * 1000,
  };
  if (__DEV__) {
    console.log("📍 [GPS] Cache cleared");
  }
};

const getStrictLocation = async () => {
  const startTime = Date.now();
  
  if (__DEV__) {
    console.log("📍 [GPS] Starting strict location check...");
  }

  try {
    //Check existing permission
    const { status: existingStatus } = await Location.getForegroundPermissionsAsync();

    if (existingStatus !== 'granted') {
      //Request permission
      const { status: newStatus } = await Location.requestForegroundPermissionsAsync();

      if (newStatus !== 'granted') {
        Alert.alert(
          'Location Required',
          'Location permission is required to use this app.',
          [
            {
              text: 'Exit App',
              onPress: () => BackHandler.exitApp(),
              style: 'destructive',
            },
          ],
          { cancelable: false }
        );
        return null;
      }
    }

    const totalTime = Date.now() - startTime;
    if (__DEV__) {
      console.log(`📍 [GPS] Strict location check took: ${totalTime}ms`);
    }

  } catch (error) {
    const totalTime = Date.now() - startTime;
    
    if (__DEV__) {
      console.error(`📍 [GPS] Strict location check failed after ${totalTime}ms:`, error);
    }
    
    Alert.alert(
      'Location Error',
      'Unable to retrieve location. The app will now close.',
      [
        {
          text: 'Exit',
          onPress: () => BackHandler.exitApp(),
          style: 'destructive',
        },
      ],
      { cancelable: false }
    );
    return null;
  }
};

// New function to request location only when needed
const requestLocationWhenNeeded = async () => {
  const startTime = Date.now();
  
  if (__DEV__) {
    console.log("📍 [GPS] Checking location permission...");
  }

  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    
    if (status === 'granted') {
      const totalTime = Date.now() - startTime;
      if (__DEV__) {
        console.log(`📍 [GPS] Permission already granted, took: ${totalTime}ms`);
      }
      return true;
    }
    
    if (status === 'denied') {
      const totalTime = Date.now() - startTime;
      if (__DEV__) {
        console.log(`📍 [GPS] Permission denied, took: ${totalTime}ms`);
      }
      
      Alert.alert(
        'Location Permission',
        'This feature requires location access. Please enable it in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Settings', onPress: () => Location.openSettings() }
        ]
      );
      return false;
    }
    
    // Request permission
    const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
    const totalTime = Date.now() - startTime;
    
    if (__DEV__) {
      console.log(`📍 [GPS] Permission request took: ${totalTime}ms (Result: ${newStatus})`);
    }
    
    return newStatus === 'granted';
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    
    if (__DEV__) {
      console.error(`📍 [GPS] Permission request failed after ${totalTime}ms:`, error);
    }
    return false;
  }
};

export default {
  getCurrentLocationDetails,
  getStrictLocation,
  requestLocationWhenNeeded,
  clearGPSCache,
};





