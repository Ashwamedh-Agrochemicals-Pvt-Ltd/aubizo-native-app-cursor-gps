import { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import apiClient from "../src/api/client";
import EntityVisitList from "../src/components/Farmer-Dealer/EntityVisitList";
import FarmerForm from "../src/components/Farmer-Dealer/FarmerForm";
import styles from "../src/styles/farmer-dealer.style";
import Location from "../src/utility/location";
import storage from "../src/utility/storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FarmerScreen = () => {
  const insets = useSafeAreaInsets();
  const [farmerForm, setFarmerForm] = useState(false);
  const [farmerData, setFarmerData] = useState([]);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [farmerListLoading, setFarmerListLoading] = useState(false);
  const [punchId, setPunchId] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        await fetchFarmer();
        const id = await storage.get("punchId");
        setPunchId(id || null);
      } catch (error) {
        console.error("Error retrieving inpunch id:", error);
        setPunchId(null);
      }
    };

    getData();
  }, [fetchFarmer]);



  const fetchFarmer = async () => {
    setFarmerListLoading(true);

    try {
      const { latitude, longitude } = await Location.getCurrentLocationDetails();

      const payload = {
        lat: Number(latitude.toFixed(6)),
        lon: Number(longitude.toFixed(6)),
      };

      const response = await apiClient.post("track/nearby-farmers/", payload, {
        timeout: 2000,
      });

      const farmerList = response.data?.farmers || [];
      if (__DEV__) {
        console.log("Farmer list count:", farmerList.length);

        console.log("First farmer (if exists):", farmerList[0]);
      }

      setFarmerData(farmerList);
    } catch (error) {
      Alert.alert("No Farmers Found", "There are no farmers available near your area right now.");
    } finally {
      setFarmerListLoading(false);
    }
  };

  const handleOpenForm = async () => {
    setLoading(true);
    try {
      setFarmerForm(true);

      const { address } = await Location.getCurrentLocationDetails();

      if (address) {
        setLocation(address);
      } else {
        throw new Error("Invalid location data");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch location");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, paddingBottom: insets.bottom }}>
      {!farmerForm ? (
        <EntityVisitList
          type="Farmer"
          data={farmerData}
          loading={loading}
          punch_id={punchId}
          handleForm={handleOpenForm}
          endpoint="track/start-visit/"
          ScreenUpdate="FarmerUpdate"
          visitScreen="FarmerVisit"
          onRefresh={fetchFarmer}
          refreshing={farmerListLoading}
        />
      ) : (
        <View style={styles.virtualScreen}>
          <View style={styles.virtualHeader}>
            <Text style={styles.virtualTitle}>Add Farmer</Text>
            <Text
              onPress={() => setFarmerForm(false)}
              style={styles.virtualClose}
            >
              ← Back
            </Text>
          </View>
          <FarmerForm
            location={location}
            stateFarmerForm={setFarmerForm}
            setfetchFarmer={fetchFarmer}
          />
        </View>
      )}
    </View>
  );
};

export default FarmerScreen;
