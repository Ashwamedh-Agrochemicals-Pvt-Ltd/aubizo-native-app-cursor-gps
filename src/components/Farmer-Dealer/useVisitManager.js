import { useEffect, useState } from "react";
import { Alert } from "react-native";
import storage from "../../utility/storage";
import apiClient from "../../api/client";

function getVisitKey(type) {
  return {
    VISIT_ID_KEY: `VISIT_ID_${type}`,
    START_ID_KEY: `START_ID_${type}`,
  };
}

export default function useVisitManager(type) {
  const [activeStartId, setActiveStartId] = useState(null);

  const [activeVisitId, setActiveVisitId] = useState(null);
  const [visitStatusTrigger, setVisitStatusTrigger] = useState(0);

  const { VISIT_ID_KEY, START_ID_KEY } = getVisitKey(type);

  useEffect(() => {
    (async () => {
      try {
        const visitId = await storage.get(VISIT_ID_KEY);
        const startId = await storage.get(START_ID_KEY);

        console.log("Visit: ", visitId, "Start : ", startId);

        if (visitId && startId) {
          setActiveVisitId(visitId);
          setActiveStartId(Number(startId));
        } else {
          setActiveVisitId(null);
          setActiveStartId(null);
        }

        setVisitStatusTrigger((prev) => prev + 1);
      } catch (error) {
        console.error("Failed to refresh visit state:", error);
      }
    })();
  }, []);

  const startVisit = async (entityId, location_id, punch_id, endpoint) => {
    try {
      const existingFarmerVisit = await storage.get("VISIT_ID_Farmer");
      const existingDealerVisit = await storage.get("VISIT_ID_Dealer");
      const activeType = await storage.get("ACTIVE_TYPE_KEY");

      // Global check
      // if ((existingFarmerVisit || existingDealerVisit) && activeType !== type) {
      //   return Alert.alert(
      //     "Visit Already Active",
      //     `A ${activeType} visit is already active. Please end it before starting a ${type} visit.`
      //   );
      // }

      const existingVisitId = await storage.get(VISIT_ID_KEY);

      if (existingVisitId) {
        Alert.alert(
          "Visit Already Started",
          "You have already started a visit. Please end it before starting a new one."
        );
        return { error: "Visit already started." };
      }

      if (!punch_id) {
        Alert.alert(
          "Punch Required",
          "You must punch in before starting the visit."
        );
        return { error: "Punch required." };
      }

      const payload = { punch_id, location_id };
      const response = await apiClient.post(endpoint, payload);

      if ([200, 201].includes(response.status)) {
        const visit_id = String(response.data.visit_id);

        await storage.set(VISIT_ID_KEY, visit_id);
        await storage.set(START_ID_KEY, String(entityId));
        await storage.set("ACTIVE_TYPE_KEY", type);
        setActiveVisitId(visit_id);
        setActiveStartId(Number(entityId));

        setVisitStatusTrigger((prev) => prev + 1);

        Alert.alert(
          "Visit Started",
          "Your visit has been successfully started."
        );
        return { success: true };
      } else {
        Alert.alert("Error", "Unable to start visit. Please try again.");
        return { error: "Failed to start visit." };
      }
    } catch (error) {
      console.error("Start Visit Error:", error);
      Alert.alert("Error", "Something went wrong while starting the visit.");
      return { error: "Unexpected error." };
    }
  };

  const endVisit = async (entityId, onEndCallback) => {
    try {
      const visitId = await storage.get(VISIT_ID_KEY);
      const storedId = await storage.get(START_ID_KEY);

      if (!visitId || !storedId) {
        Alert.alert("Visit Not Started", "Start a visit before ending it.");
        return;
      }

      if (String(storedId) !== String(entityId)) {
        Alert.alert(
          "Access Denied",
          "You can only end the visit that you started."
        );
        return;
      }

      setActiveVisitId(null);

      setVisitStatusTrigger((prev) => prev + 1);

      if (onEndCallback) onEndCallback();
    } catch (error) {
      console.error("End Visit Error:", error);
      Alert.alert("Error", "Something went wrong while ending the visit.");
    }
  };

  return {
    startVisit,
    endVisit,
    activeStartId,
    activeVisitId,
    visitStatusTrigger,
  };
}
