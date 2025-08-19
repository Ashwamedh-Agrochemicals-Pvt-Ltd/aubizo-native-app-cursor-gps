import apiClient from "./client";

const STATE_URL = process.env.EXPO_PUBLIC_STATE_URL;
const DISTRICT_URL = process.env.EXPO_PUBLIC_DISTRICT_URL;  
const TALUKA_URL = process.env.EXPO_PUBLIC_TALUKA_URL;
const IRRIGATIONTYPE_URL = process.env.EXPO_PUBLIC_IRRIGATIONTYPE_URL;
const PRODUCTELIST_URL = process.env.EXPO_PUBLIC_PRODUCTELIST_URL;
const CROPSLIST_URL = process.env.EXPO_PUBLIC_CROPSLIST_URL;

// Fetch sorted list of states
export const getStates = async () => {
  const { data } = await apiClient.get(STATE_URL);
  return data.sort((a, b) => a.name.localeCompare(b.name));
};

// Fetch sorted list of districts for a given state
export const getDistricts = async (stateId) => {
  const { data } = await apiClient.get(`${DISTRICT_URL}?state_id=${stateId}`);
  return data.sort((a, b) => a.name.localeCompare(b.name));
};

// Fetch sorted list of talukas for a given district
export const getTalukas = async (districtId) => {
  const { data } = await apiClient.get(`${TALUKA_URL}?district_id=${districtId}`);
  return data.sort((a, b) => a.name.localeCompare(b.name));
};

// Fetch irrigation types (key-value pairs)
export const getIrrigationTypes = async () => {
  const { data } = await apiClient.get(IRRIGATIONTYPE_URL);
  return data; // expected to be in format: [{ key: "Drip", value: "drip" }, ...]
};

// Fetch product list
export const getProducts = async () => {
  const { data } = await apiClient.get(PRODUCTELIST_URL);
  return data; // expected format: [{ id, name }, ...]
};

// Fetch crop list
export const getCrops = async () => {
  const { data } = await apiClient.get(CROPSLIST_URL);
  console.log("Crops data:", data);
  return data;
};

// Create a new farmer entry
export const createFarmer = async (payload) => {
  return apiClient.post(`farmer/create/`, payload);
};

// Get nearby farmers by location
export const getNearbyFarmers = async (payload) => {
  return apiClient.post(`track/nearby-farmers/`, { payload });
};
