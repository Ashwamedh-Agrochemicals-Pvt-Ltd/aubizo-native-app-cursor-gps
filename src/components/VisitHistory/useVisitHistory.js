import { useQuery } from "@tanstack/react-query";
import apiClient from "../../api/client";
import logger from "../../utility/logger";

const useVisitHistory = (location_id) => {
  const {
    data: remarksList = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['visit-history', location_id],
    queryFn: async () => {
      if (!location_id) return [];

      try {
        const response = await apiClient.get(
          `track/visit-history/${location_id}`,
          {
            timeout: 10000 // 10 second timeout
          }
        );

        if (__DEV__) {
          logger.info("Visit History Response:", response.data);
        }

        if (response.status==200 && response.data) {
          const sorted = [...response.data.visit_history].sort(
            (a, b) =>
              new Date(b.visit_start_time) - new Date(a.visit_start_time)
          );
          return sorted;
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
        throw err;
      }
    },
    enabled: !!location_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: 1000,
  });

  return {
    remarksList,
    isLoading,
    error,
    refetch
  };
};

export default useVisitHistory;
