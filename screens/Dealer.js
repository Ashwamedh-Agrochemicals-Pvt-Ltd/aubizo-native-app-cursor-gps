import { useCallback, useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import apiClient from "../src/api/client";
import DealerForm from "../src/components/Farmer-Dealer/DealerForm";
import EntityVisitList from "../src/components/Farmer-Dealer/EntityVisitList";
import styles from "../src/styles/farmer-dealer.style";
import Location from "../src/utility/location";
import storage from "../src/utility/storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DealerScreen = () => {
  const insets = useSafeAreaInsets();
  const [dealerForm, setDealerForm] = useState(false);
  const [dealerData, setDealerData] = useState([]);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [dealerListLoading, setDealerListLoading] = useState(false);
  const [punchId, setPunchId] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        await fetchDealers();
        const id = await storage.get("punchId");
        setPunchId(id || null);
      } catch (error) {
        console.error("Error retrieving inpunch id:", error);
        setPunchId(null);
      }
    };

    getData();
  }, [fetchDealers]);



  const fetchDealers = useCallback(async () => {
    if (__DEV__) console.log("🏪 [Dealer] fetchDealers started");

    setDealerListLoading(true);

    try {

      const { latitude, longitude } = await Location.getCurrentLocationDetails();

      const payload = {
        lat: Number(latitude.toFixed(6)),
        lon: Number(longitude.toFixed(6)),
      };

      const response = await apiClient.post("track/nearby-dealers/", payload, { timeout: 4000 });

      if (__DEV__) console.log("[Dealer] Dealer Data:", response.data);

      const dealerList = response.data?.dealers || [];
      setDealerData(dealerList);
    } catch (error) {
      if (__DEV__) console.error("[Dealer] fetchDealers failed:", error);
      Alert.alert("Error", "Dealer not found");
    } finally {
      setDealerListLoading(false);
    }
  }, []);

  const handleOpenForm = async () => {
    setLoading(true);

    try {
      setDealerForm(true);

      const { latitude, longitude, address } = await Location.getCurrentLocationDetails();

      if (!latitude || !longitude || !address) {
        throw new Error("Invalid location data");
      }

      setLocation(address);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch location");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, paddingBottom: insets.bottom }}>
      {!dealerForm ? (
        <EntityVisitList
          type="Dealer"
          data={dealerData}
          loading={loading}
          punch_id={punchId}
          handleForm={handleOpenForm}
          endpoint="track/start-visit/"
          ScreenUpdate="DealerUpdate"
          visitScreen="DealerVisit"
          onRefresh={fetchDealers}
          refreshing={dealerListLoading}
        />
      ) : (
        <View style={styles.virtualScreen}>
          <View style={styles.virtualHeader}>
            <Text style={styles.virtualTitle}>Add Dealer</Text>
            <Text
              onPress={() => setDealerForm(false)}
              style={styles.virtualClose}
            >
              ← Back
            </Text>
          </View>
          <DealerForm
            location={location}
            stateDealerForm={setDealerForm}
            setfetchDealer={fetchDealers}
          />
        </View>
      )}
    </View>
  );
};

export default DealerScreen;
