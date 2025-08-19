import axios from "axios";
import { useEffect, useRef, useState } from "react";
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
  const cancelTokenRef = useRef(null);

  const getInpunchId = async () => {
    try {
      const id1 = await storage.get("id");
      const id2 = await storage.get("punchId");
      return id1 || id2 || null;
    } catch (error) {
      console.error("Error retrieving inpunch id:", error);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const getData = async () => {
      const inpunchId = await getInpunchId();
      if (isMounted) setPunchId(inpunchId);
    };

    getData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenForm = async () => {
    const startTime = Date.now();
    
    if (__DEV__) {
      console.log("🏪 [Dealer] Starting handleOpenForm...");
    }
    
    setLoading(true);
    try {
      setDealerForm(true);
      
      const locationStart = Date.now();
      const { latitude, longitude, address } =
        await Location.getCurrentLocationDetails();
      const locationTime = Date.now() - locationStart;

      if (__DEV__) {
        console.log(`🏪 [Dealer] Location acquisition in handleOpenForm took: ${locationTime}ms`);
      }

      if (latitude && longitude && address) {
        setLocation(address);
      } else {
        throw new Error("Invalid location data");
      }
    } catch (error) {
      if (__DEV__) {
        console.error("🏪 [Dealer] handleOpenForm failed:", error);
      }
      Alert.alert("Error", "Failed to fetch location");
    } finally {
      setLoading(false);
      const totalTime = Date.now() - startTime;
      if (__DEV__) {
        console.log(`🏪 [Dealer] handleOpenForm total time: ${totalTime}ms`);
      }
    }
  };

  const fetchDealers = async () => {
    const startTime = Date.now();
    
    if (__DEV__) {
      console.log("🏪 [Dealer] Starting fetchDealers...");
    }
    
    setDealerListLoading(true);

    try {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel("Cancelled due to new request");
      }

      cancelTokenRef.current = axios.CancelToken.source();

      const locationStart = Date.now();
      const { latitude, longitude } =
        await Location.getCurrentLocationDetails();
      const locationTime = Date.now() - locationStart;

      if (__DEV__) {
        console.log(`🏪 [Dealer] Location acquisition in fetchDealers took: ${locationTime}ms`);
      }

      if (!latitude || !longitude) throw new Error("Invalid location");

      const payload = {
        lat: Number(latitude.toFixed(6)),
        lon: Number(longitude.toFixed(6)),
      };

      const apiStart = Date.now();
      const response = await apiClient.post("track/nearby-dealers/", payload, {
        cancelToken: cancelTokenRef.current.token,
        timeout: 5000,
      });
      const apiTime = Date.now() - apiStart;

      if (__DEV__) {
        console.log(`🏪 [Dealer] API call took: ${apiTime}ms`);
      }

      if (__DEV__) {
        console.log("🏪 [Dealer] Dealer Data:", response.data);
      }

      const dealerList = response.data?.dealers || [];
      setDealerData(dealerList);
    } catch (error) {
      if (__DEV__) {
        console.error("🏪 [Dealer] fetchDealers failed:", error);
      }
      Alert.alert("Error", "Dealer not found");
    } finally {
      setDealerListLoading(false);
      const totalTime = Date.now() - startTime;
      if (__DEV__) {
        console.log(`🏪 [Dealer] fetchDealers total time: ${totalTime}ms`);
      }
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  return (
    <View style={{ flex:1,paddingBottom: insets.bottom  }}>
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
