// Map configuration
import { Plus, Minus } from "lucide-react";
export const MAP_CONFIG = {
  defaultCenter: [-33.4489, -70.6693], // Santiago, Chile
  defaultZoom: 16,
  tileLayer: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  zoomControl: {
    position: "topright",
    zoomInText: "+",
    zoomOutText: "-",
    zoomInIcon: <Plus className="h-5 w-5" />,
    zoomOutIcon: <Minus className="h-5 w-5" />,
    zoomInClass: "bg-gray-100 dark:bg-gray-800",
    zoomOutClass: "bg-gray-100 dark:bg-gray-800",
  },
  searchRadius: 2000,
  maxSearchRadius: 10000
};
