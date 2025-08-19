// Coordinate utility functions for consistent formatting

/**
 * Formats latitude and longitude to 6 decimal places for accuracy
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Object} Formatted coordinates
 */
export const formatCoordinates = (latitude, longitude) => {
  if (latitude == null || longitude == null) {
    return {
      latitude: null,
      longitude: null,
    };
  }

  return {
    latitude: Number(parseFloat(latitude).toFixed(6)),
    longitude: Number(parseFloat(longitude).toFixed(6)),
  };
};

/**
 * Formats coordinates for API payload with specific field names
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {string} prefix - Field name prefix (e.g., 'inpunch_', 'outpunch_')
 * @returns {Object} Formatted coordinates for API
 */
export const formatCoordinatesForAPI = (latitude, longitude, prefix = '') => {
  if (latitude == null || longitude == null) {
    return {};
  }

  const formatted = formatCoordinates(latitude, longitude);
  
  return {
    [`${prefix}latitude`]: formatted.latitude,
    [`${prefix}longitude`]: formatted.longitude,
  };
};

/**
 * Validates if coordinates are within valid ranges
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {boolean} True if coordinates are valid
 */
export const validateCoordinates = (latitude, longitude) => {
  if (latitude == null || longitude == null) {
    return false;
  }

  // Latitude: -90 to 90
  // Longitude: -180 to 180
  return (
    latitude >= -90 && latitude <= 90 &&
    longitude >= -180 && longitude <= 180
  );
};

/**
 * Gets distance between two coordinate points in kilometers
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {number} Distance in kilometers
 */
export const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Number(distance.toFixed(2));
};
