
import { Ionicons } from "@expo/vector-icons";
import { useContext, useEffect, useRef, useState, useCallback } from "react";
import { ActivityIndicator, Alert, Animated, Text, TouchableHighlight, View } from "react-native";
import apiClient from "../src/api/client"
import authContext from "../src/auth/context"
import authStorage from "../src/auth/storage";
import { navigation } from "../navigation/NavigationService"
import { styles } from "../src/styles/dashboard.style";
import Location from "../src/utility/location";
import storage from "../src/utility/storage";
import logger from "../src/utility/logger";
import SwipePunchButton from "../src/components/dashboard/SwipePunchButton";
import showToast from "../src/utility/showToast";
import TodayDashboard from "../src/components/TodayDashboard";






const INPUNCH_URL = process.env.EXPO_PUBLIC_INPUNCH_URL;
const OUTPUNCH_URL = process.env.EXPO_PUBLIC_OUTPUNCH_URL;


// Centralized messages
const MESSAGES = {
 SESSION_EXPIRED: "Session expired. Please login again.",
 NETWORK_ERROR: "Network error. Please check your connection.",
 PUNCH_IN_RESTRICTED: "You can only record one inpunch per day.",
 PUNCH_OUT_FAILED: "Failed to record outpunch. Please try again.",
 ACCESS_RESTRICTED: "You must be punched in to access",
 GENERIC_ERROR: "An error occurred. Please try again."
};




function Dashboard() {
 const [hasInpunch, setHasInpunch] = useState(false);
 const [inpunchId, setInpunchId] = useState(null);
 const [isPunchInLoading, setIsPunchInLoading] = useState(false);
 const [isPunchOutLoading, setIsPunchOutLoading] = useState(false);
 const { user, setUser } = useContext(authContext);
 const swipeRef = useRef(null);
 const [dashboardData, setDashboardData] = useState(null);
  // Use ref to track current hasInpunch state
 const hasInpunchRef = useRef(false);
 // Use ref to track current inpunchId state
 const inpunchIdRef = useRef(null);

 // Create stable function reference for onSwipe
 const onSwipeHandler = useCallback(() => {
   // Use ref to get the most current state value
   const currentHasInpunch = hasInpunchRef.current;
  
   if (currentHasInpunch) {
     handleOutpunch();
   } else {
     handleInpunch();
   }
 }, [handleOutpunch, handleInpunch]);






 const checkPunchStatus = useCallback(async () => {
   try {
 
     const response = await apiClient.get("track/dashboard/today/");
     setDashboardData(response.data);
     const { punched_in, punched_out, punch_id } = response.data.punch_status;
     if (punched_in== true && punched_out == false) {
       const punchId = String(punch_id);

      
       // Sync local storage with server state
       await storage.set("punchId", punchId);
       setInpunchId(punchId);
       inpunchIdRef.current = punchId; // Update ref
       setHasInpunch(true);
       hasInpunchRef.current = true; // Update ref


       // Ensure user stays logged in
       const token = await authStorage.getUser();
       if (token) {
         setUser(token);
       }
     } else if (punched_in == true && punched_out == true) {
       setHasInpunch(false);
       hasInpunchRef.current = false; // Update ref
       setInpunchId(null);
       inpunchIdRef.current = null; // Update ref
       // Clear storage after punch out - user should not have access
       await storage.remove("punchId");
     } else {
       setHasInpunch(false);
       hasInpunchRef.current = false; // Update ref
       setInpunchId(null);
       inpunchIdRef.current = null; // Update ref
       // Clear storage when no punch record exists
       await storage.remove("punchId");
     }
   } catch (error) {
     logger.error("Error checking punch status:", error);


     if (error.response?.status === 401) {
       Alert.alert("Session Expired", MESSAGES.SESSION_EXPIRED);
     } else if (!error.response) {
       Alert.alert("Network Error", MESSAGES.NETWORK_ERROR);
     } else {
       Alert.alert("Error", MESSAGES.GENERIC_ERROR);
     }
   }
 }, [setUser, hasInpunch]);


 // Initial mount and auth changes trigger
 useEffect(() => {
   if (user) {
     checkPunchStatus();
   } else {
     // Clear state when user logs out
     setHasInpunch(false);
     setInpunchId(null);
     storage.remove("punchId");
   }
 }, [user, checkPunchStatus]);


 const handleInpunch = useCallback(() => {
   if (isPunchInLoading) return; // Prevent double-clicks


   Alert.alert(
     "Confirm Punch In",
     "Are you sure you want to punch in?",
     [
       {
         text: "Cancel",
         style: "cancel",
         onPress: () => {
           swipeRef.current?.reset();
         },
       },
       {
         text: "Yes",
         onPress: async () => {
           setIsPunchInLoading(true);
           try {
             const { latitude, longitude } = await Location.getCurrentLocationDetails();


             const payload = {
               latitude: Number(latitude.toFixed(6)),
               longitude: Number(longitude.toFixed(6)),
             };


             const response = await apiClient.post(INPUNCH_URL, payload);
             const id = String(response.data.data.id);
    


             // Store punch ID with correct key
             await storage.set("punchId", id);
             setInpunchId(id);
             inpunchIdRef.current = id; // Update ref
           
             // Refresh status from server to ensure state consistency
             await checkPunchStatus();
            
             // ✅ Success toast (same style as outpunch)
             showToast.success(
               "Punch In Successful",
               "Your inpunch was recorded successfully"
             );
             // Remove manual state setting - let checkPunchStatus handle it
           } catch (error) {
             logger.error("Punch in error:", error);
             Alert.alert("Punch In Restricted", "You can only record one inpunch per day");


           } finally {
             setIsPunchInLoading(false);
           }
         },
       },
     ],
     {
       cancelable: true,
       // onDismiss: () => {
       //   swipeRef.current?.reset(); // reset if dismissed by tapping outside
       // },
     }
   );
 }, [isPunchInLoading, swipeRef, checkPunchStatus]);








 const handleOutpunch = useCallback(() => {
   if (isPunchOutLoading) return; // Prevent double-clicks


   Alert.alert(
     "Confirm Punch Out",
     "Are you sure you want to punch out?",
     [
       {
         text: "Cancel",
         style: "cancel",
         onPress: () => {
           // Reset swipe thumb if cancelled
           swipeRef.current?.reset();
         },
       },
       {
         text: "Yes",
         onPress: async () => {
           setIsPunchOutLoading(true);
           try {
             const { latitude, longitude } = await Location.getCurrentLocationDetails();


             const payload = {
               latitude: Number(latitude.toFixed(6)),
               longitude: Number(longitude.toFixed(6)),
             };



            
             await apiClient.patch(`${OUTPUNCH_URL}${inpunchIdRef.current}/`, payload);


             // Refresh status from server to ensure consistency
             await checkPunchStatus();


             // ✅ Success Toast instead of Alert
             showToast.success(


               "Punch Out Successful",
               "Your outpunch was recorded successfully",
             );
           } catch (error) {
             logger.error("Punch out error:", error);


             if (error.response?.status === 401) {
               Alert.alert("Session Expired", MESSAGES.SESSION_EXPIRED);
             } else if (!error.response) {
               Alert.alert("Network Error", MESSAGES.NETWORK_ERROR);
             } else if (error.response?.status === 404) {
               Alert.alert("API Error", "Punch out endpoint not found. Please check the API configuration.");
             } else {
               Alert.alert("Error", MESSAGES.PUNCH_OUT_FAILED);
             }
           } finally {
             setIsPunchOutLoading(false);
           }
         },
       },
     ],
     {
       cancelable: true,
     }
   );
 }, [isPunchOutLoading, swipeRef, checkPunchStatus, inpunchId]);




 return (


   <>


     <TodayDashboard dashboardData={dashboardData} />
     {/* Main Content */}
     <View style={styles.mainContent}>


       {/* Action Cards Grid */}
       <View style={styles.actionsGrid}>
     
           <TouchableHighlight
             style={[
               styles.actionCard,
               !hasInpunch && styles.actionCardDisabled,
             ]}
             onPress={() => {
               if (!hasInpunch) {
                 Alert.alert(
                   "Access Restricted",
                   `${MESSAGES.ACCESS_RESTRICTED} Farmer Enquiry.`
                 );
                 return;
               }
               navigation.navigate("Farmer", { inpunch_id: inpunchId });
             }}
             underlayColor="#F5F5F5"
             activeOpacity={hasInpunch ? 0.7 : 1}
           >
             <View style={{ alignItems: "center" }}>
               <Ionicons
                 name="leaf-outline"
                 size={32}
                 color={hasInpunch ? "#2E7D32" : "#757575"}
                 style={styles.actionIcon}
               />
               <Text
                 style={[
                   styles.actionTitle,
                   !hasInpunch && styles.actionTitleDisabled,
                 ]}
               >
                 Farmer Enquiry
               </Text>
             </View>
           </TouchableHighlight>
       


     
           <TouchableHighlight
             style={[
               styles.actionCard,
               !hasInpunch && styles.actionCardDisabled,
             ]}
             onPress={() => {
               if (!hasInpunch) {
                 Alert.alert(
                   "Access Restricted",
                   `${MESSAGES.ACCESS_RESTRICTED} Dealer Enquiry.`
                 );
                 return;
               }
               navigation.navigate("Dealer");
             }}
             underlayColor="#F5F5F5"
             activeOpacity={hasInpunch ? 0.7 : 1}
           >
             <View style={{ alignItems: "center" }}>
               <Ionicons
                 name="storefront-outline"
                 size={32}
                 color={hasInpunch ? "#FF8F00" : "#757575"}
                 style={styles.actionIcon}
               />
               <Text
                 style={[
                   styles.actionTitle,
                   !hasInpunch && styles.actionTitleDisabled,
                 ]}
               >
                 Dealer Enquiry
               </Text>
             </View>
           </TouchableHighlight>
     
       </View>
     </View>
     {/* Punch Button Section */}


     <SwipePunchButton
       ref={swipeRef}
       hasInpunch={hasInpunch}
       loading={isPunchInLoading || isPunchOutLoading}
       onSwipe={onSwipeHandler}
     />


   </>
 );
}


export default Dashboard;





