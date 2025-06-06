import L from 'leaflet';

// Marker icon configuration
export const createCustomIcon = (color, size = 32) => new L.Icon({
  iconUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='${color}' width='${size}' height='${size}'%3E%3Cpath d='M12 2C7.8 2 4.5 5.3 4.5 9.5c0 5.3 5.8 11.4 7.5 13.6 1.7-2.2 7.5-8.3 7.5-13.6C19.5 5.3 16.2 2 12 2zm0 10c-1.4 0-2.5-1.1-2.5-2.5S10.6 7 12 7s2.5 1.1 2.5 2.5S13.4 12 12 12z'/%3E%3C/svg%3E`,
  iconSize: [size, size],
  iconAnchor: [size/2, size],
  popupAnchor: [0, -size]
});

// Marker sizes
export const MARKER_SIZES = {
  DEFAULT: 38,
  LARGE: 42
};

// Marker colors (using Tailwind CSS colors)
export const MARKER_COLORS = {
  SELECTED: '%233B82F6', // blue-500
  USER_LOCATION: '%23FF0000', // Rojo puro
};