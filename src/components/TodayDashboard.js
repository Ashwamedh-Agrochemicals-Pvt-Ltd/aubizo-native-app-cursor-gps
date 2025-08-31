// components/TodayDashboard.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";




const TodayDashboard = ({ dashboardData }) => {
 if (!dashboardData) return null;




 const {
   date,
   user_name,
   punch_status,
   visit_summary,
 } = dashboardData;




 const { punched_in, punched_out, punch_in_time, punch_out_time } = punch_status;




 return (
   <View style={styles.container}>
     {/* Date and User */}
     <View style={styles.header}>
       <Text style={styles.date}>{date}</Text>
       <Text style={styles.userName}>Hello, {user_name}</Text>
     </View>




     {/* Punch Status - show only if punched in or out */}
     {(punched_in || punched_out) && (
       <View style={styles.section}>
         <Text style={styles.sectionTitle}>Punch Status</Text>




         {/* Punch In */}
         {punched_in && (
           <View style={styles.punchRow}>
             <Text style={styles.punchLabel}>Punch In: </Text>
             <Text style={styles.punchTime}>{punch_in_time || "--:--"}</Text>
           </View>
         )}




         {/* Punch Out */}
         {punched_out && (
           <View style={styles.punchRow}>
             <Text style={styles.punchLabel}>Punch Out: </Text>
             <Text style={styles.punchTime}>{punch_out_time || "--:--"}</Text>
           </View>
         )}
       </View>
     )}




     {/* Visit Summary */}
     <View style={styles.section}>
       <Text style={styles.sectionTitle}>Visit Summary</Text>
       <View style={styles.visitRow}>
         <Text style={styles.visitItem}>
           Total Visits: {visit_summary.total_visits}
         </Text>
         <Text style={styles.visitItem}>
           Farmers: {visit_summary.farmer_visits}
         </Text>
         <Text style={styles.visitItem}>
           Dealers: {visit_summary.dealer_visits}
         </Text>
       </View>
     </View>








   </View>
 );
};




const styles = StyleSheet.create({
 container: {
   padding: 16,
   backgroundColor: "#F5F5F5",
   flex: 1,
 },
 header: {
   marginBottom: 20,
 },
 date: {
   fontSize: 16,
   color: "#757575",
 },
 userName: {
   fontSize: 20,
   fontWeight: "bold",
   color: "#212121",
   marginTop: 4,
 },
 section: {
   backgroundColor: "#FFFFFF",
   padding: 16,
   borderRadius: 12,
   marginBottom: 16,
   shadowColor: "#000",
   shadowOpacity: 0.05,
   shadowOffset: { width: 0, height: 2 },
   shadowRadius: 4,
   elevation: 2,
 },
 sectionTitle: {
   fontSize: 16,
   fontWeight: "bold",
   marginBottom: 12,
   color: "#00796B",
 },
 punchRow: {
   flexDirection: "row",
   alignItems: "center",
   marginBottom: 8,
 },
 punchLabel: {
   fontSize: 16,
   color: "#757575",
   marginRight: 8,
 },
 punchTime: {
   fontSize: 18,
   fontWeight: "bold",
   color: "#212121",
 },
 visitRow: {
   flexDirection: "row",
   justifyContent: "space-between",
 },
 visitItem: {
   fontSize: 14,
   color: "#212121",
 },
 workingHours: {
   fontSize: 18,
   fontWeight: "bold",
   color: "#212121",
   textAlign: "center",
   marginTop: 4,
 },
});




export default TodayDashboard;



