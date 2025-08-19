import { useRoute } from "@react-navigation/native";
import VisitScreen from "../src/components/VisitHistory/VisitScreen";

function FarmerVisitScreen() {
  const route = useRoute();
  const { location_id } = route.params;
  return (
    <VisitScreen
      location_id={location_id}
      storageKey={"VISIT_ID_Farmer"}
      navigateTo={"Farmer"}
    />
  );
}

export default FarmerVisitScreen;
