import { useRoute } from "@react-navigation/native";
import VisitScreen from "../src/components/VisitHistory/VisitScreen";

function DealerVisitScreen() {
  const route = useRoute();
  const { location_id } = route.params;

  return (
    <VisitScreen
      location_id={location_id}
      storageKey={"VISIT_ID_Dealer"}
      navigateTo={"Dealer"}
    />
  );
}

export default DealerVisitScreen;
