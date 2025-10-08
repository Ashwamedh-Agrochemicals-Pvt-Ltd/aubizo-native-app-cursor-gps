import { useState } from "react";
import * as api from "../api/form";

const toDropdown = (data, labelKey = "name", valueKey = "id") =>
  data?.map((item) => ({
    label: item[labelKey],
    value: item[valueKey],
  })) || [];

export default function useMasterData() {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [irrigationTypes, setIrrigationTypes] = useState([]);
  const [products, setProducts] = useState([]);
  const [crops, setCrops] = useState([]);

  const loadStates = async () => {
    // Don't reload if already loaded
    if (states.length > 0) return;
    
    try {
      const data = await api.getStates();
      setStates(toDropdown(data));
    } catch (err) {
      if (__DEV__) {
        console.error("Failed to load states:", err);
      }
      // Keep existing data if available, don't clear on error
    }
  };

  const loadDistricts = async (stateId) => {
    // Clear existing data when loading new state's districts
    setDistricts([]);
    setTalukas([]); // Also clear talukas since they depend on districts
    
    try {
      const data = await api.getDistricts(stateId);
      setDistricts(toDropdown(data));
    } catch (err) {
      if (__DEV__) {
        console.error("Failed to load districts:", err);
      }
      // Keep districts empty on error for new state
      setDistricts([]);
    }
  };

  const loadTalukas = async (districtId) => {
    // Clear existing talukas when loading new district's talukas
    setTalukas([]);
    
    try {
      const data = await api.getTalukas(districtId);
      setTalukas(toDropdown(data));
    } catch (err) {
      if (__DEV__) {
        console.error("Failed to load talukas:", err);
      }
      // Keep talukas empty on error for new district
      setTalukas([]);
    }
  };

  const loadIrrigation = async () => {
    // Don't reload if already loaded
    if (irrigationTypes.length > 0) return;
    
    try {
      const data = await api.getIrrigationTypes();
      setIrrigationTypes(toDropdown(data, "key", "value"));
    } catch (err) {
      if (__DEV__) {
        console.error("Failed to load irrigation types:", err);
      }
      // Keep existing data if available, don't clear on error
    }
  };

  const loadProducts = async () => {
    // Don't reload if already loaded
    if (products.length > 0) return;
    
    try {
      const data = await api.getProducts();
      setProducts(toDropdown(data));
    } catch (err) {
      if (__DEV__) {
        console.error("Failed to load products:", err);
      }
      // Keep existing data if available, don't clear on error
    }
  };

  const loadCrops = async (setLocalState = null) => {
    try {
      const data = await api.getCrops();
      const formatted = toDropdown(data);

      if (setLocalState) setLocalState(formatted);
      else setCrops(formatted);

      return formatted;
    } catch (err) {
      if (__DEV__) {
        console.error("Failed to load crops:", err);
      }
      // Return empty array on error, don't crash
      return [];
    }
  };

  return {
    states,
    districts,
    talukas,
    irrigationTypes,
    products,
    crops,
    loadStates,
    loadDistricts,
    loadTalukas,
    loadIrrigation,
    loadProducts,
    loadCrops,
  };
}
