// Distance ranges and their corresponding colors
export const DISTANCE_RANGES = [
  { 
    max: 0.5, 
    color: '%2322C55E', // green-600
    label: 'Muy cerca',
    bgClass: 'bg-green-50',
    textClass: 'text-green-600'
  },
  { 
    max: 1, 
    color: '%2365A30D', // lime-600
    label: 'Cerca',
    bgClass: 'bg-lime-50',
    textClass: 'text-lime-600'
  },
  { 
    max: 2, 
    color: '%23CA8A04', // yellow-600
    label: 'Distancia media',
    bgClass: 'bg-yellow-50',
    textClass: 'text-yellow-600'
  },
  { 
    max: 3, 
    color: '%23EA580C', // orange-600
    label: 'Lejos',
    bgClass: 'bg-orange-50',
    textClass: 'text-orange-600'
  },
  { 
    max: Infinity, 
    color: '%23DC2626', // red-600
    label: 'Muy lejos',
    bgClass: 'bg-red-50',
    textClass: 'text-red-600'
  }
];

// Get marker color based on distance
export const getMarkerColor = (distance) => {
  const range = DISTANCE_RANGES.find(r => distance <= r.max);
  return range ? range.color : DISTANCE_RANGES[DISTANCE_RANGES.length - 1].color;
};

// Get style classes based on distance
export const getDistanceStyles = (distance) => {
  const range = DISTANCE_RANGES.find(r => distance <= r.max);
  return range ? { bg: range.bgClass, text: range.textClass } : {
    bg: DISTANCE_RANGES[DISTANCE_RANGES.length - 1].bgClass,
    text: DISTANCE_RANGES[DISTANCE_RANGES.length - 1].textClass
  };
};

// Calculate distance between two coordinates
export const calculateDistance = (from, to) => {
  const lat1 = from.lat * Math.PI / 180;
  const lon1 = from.lng * Math.PI / 180;
  const lat2 = to.lat * Math.PI / 180;
  const lon2 = to.lng * Math.PI / 180;

  const dlat = lat2 - lat1;
  const dlon = lon2 - lon1;

  const a = Math.sin(dlat / 2) * Math.sin(dlat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dlon / 2) * Math.sin(dlon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = 6371 * c; // in kilometers

  return distance.toFixed(1);
};
