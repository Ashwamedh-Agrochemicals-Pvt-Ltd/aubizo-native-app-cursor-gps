import { useState, useEffect, useCallback } from "react";
import apiClient from "../../api/client";
import logger from "../../utility/logger";

const useVisitHistory = (location_id) => {
  const [remarksList, setRemarksList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVisitHistory = useCallback(async () => {
    if (!location_id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(
        `track/visit-history/${location_id}/`,
        { timeout: 10000 }
      );

      if (__DEV__) {
        logger.info("Visit History Response:", response.data);
      }

      if (response.status === 200 && response.data) {
        const sorted = [...response.data.visit_history].sort(
          (a, b) => new Date(b.visit_start_time) - new Date(a.visit_start_time)
        );
        setRemarksList(sorted);
      } else {
        if (__DEV__) {
          logger.error("Fetch failed:", response.problem);
        }
        throw new Error("Failed to fetch visit history");
      }
    } catch (err) {
      if (__DEV__) {
        logger.error("Visit history error:", err);
      }
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [location_id]);

  useEffect(() => {
    if (location_id) {
      
      fetchVisitHistory();
    }
  }, [location_id, fetchVisitHistory]);

  return {
    remarksList,
    isLoading,
    error,
    refetch: fetchVisitHistory,
  };
};

export default useVisitHistory;
