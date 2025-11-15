import { useState, useCallback } from 'react';
import apiClient from '../api/client';
import showToast from '../utility/showToast';

const STATE_URL = process.env.EXPO_PUBLIC_STATE_URL;
const DISTRICT_URL = process.env.EXPO_PUBLIC_DISTRICT_URL;
const TALUKA_URL = process.env.EXPO_PUBLIC_TALUKA_URL;

export const useLocationData = () => {
  const [locations, setLocations] = useState({
    states: [],
    districts: [],
    talukas: [],
  });

  const [loading, setLoading] = useState({
    states: false,
    districts: false,
    talukas: false,
  });

  const [error, setError] = useState(null);

  const loadStates = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, states: true }));
      const response = await apiClient.get(STATE_URL);
      const sortedStates = response.data.sort((a, b) => 
        a.name.localeCompare(b.name)
      );
      setLocations(prev => ({ ...prev, states: sortedStates }));
    } catch (error) {
      console.error('Error loading states:', error);
      showToast('error', 'Failed to load states');
      setError('Failed to load states');
    } finally {
      setLoading(prev => ({ ...prev, states: false }));
    }
  }, []);

  const loadDistricts = useCallback(async (stateId) => {
    if (!stateId) return;
    
    try {
      setLoading(prev => ({ ...prev, districts: true }));
      const response = await apiClient.get(`${DISTRICT_URL}${stateId}/`);
      const sortedDistricts = response.data.sort((a, b) => 
        a.name.localeCompare(b.name)
      );
      setLocations(prev => ({ ...prev, districts: sortedDistricts }));
    } catch (error) {
      console.error('Error loading districts:', error);
      showToast('error', 'Failed to load districts');
      setError('Failed to load districts');
    } finally {
      setLoading(prev => ({ ...prev, districts: false }));
    }
  }, []);

  const loadTalukas = useCallback(async (districtId) => {
    if (!districtId) return;
    
    try {
      setLoading(prev => ({ ...prev, talukas: true }));
      const response = await apiClient.get(`${TALUKA_URL}${districtId}/`);
      const sortedTalukas = response.data.sort((a, b) => 
        a.name.localeCompare(b.name)
      );
      setLocations(prev => ({ ...prev, talukas: sortedTalukas }));
    } catch (error) {
      console.error('Error loading talukas:', error);
      showToast('error', 'Failed to load talukas');
      setError('Failed to load talukas');
    } finally {
      setLoading(prev => ({ ...prev, talukas: false }));
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    locations,
    loading,
    error,
    loadStates,
    loadDistricts,
    loadTalukas,
    clearError,
  };
};