
import { StyleSheet } from "react-native";

export default StyleSheet.create({
   virtualScreen: {
     flexGrow: 1,
     backgroundColor: "#fff",
   },
   virtualHeader: {
     flexDirection: "row",
     justifyContent: "space-between",
     alignItems: "center",
     marginBottom: 15,
     borderBottomWidth: 1,
     borderColor: "#ddd",
     paddingBottom: 10,
   },
   virtualTitle: {
     fontSize: 18,
     fontWeight: "bold",
     marginLeft: 20,
   },
   virtualClose: {
     fontSize: 17,
     color: "#007AFF",
     paddingHorizontal: 10,
     paddingVertical: 5,
   },
});
