import L from "leaflet";
import { useEffect } from "react";

export default function PharmacyMarkers({ map, pharmacies, selectedPharmacy, onPharmacySelect }) {
  useEffect(() => {
    if (!map || !pharmacies) return;

    const markers = pharmacies.map((pharmacy) => {
      const position = [pharmacy.coordinates.lat, pharmacy.coordinates.lng];
      const isSelected = selectedPharmacy && selectedPharmacy.id === pharmacy.id;

      const pharmacyIcon = L.divIcon({
        html: `<div class="relative w-10 h-10 transition-all duration-300 rounded-full shadow-lg flex items-center justify-center border p-1 border-gray-300
          ${isSelected ? "w-12 h-12 bg-red-500 border-red-500 z-20" : "hover:scale-110 bg-white border-gray-200 z-0"}">
          <div class="w-8 h-8 flex items-center justify-center ${isSelected ? "" : "bg-green-500"} rounded-full">
            ${!isSelected
            ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pill-icon lucide-pill"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>'
            : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin-icon lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>'}
          </div>
        </div>`,
        className: isSelected ? "z-20" : "z-0",
        iconSize: isSelected ? [48, 48] : [40, 40],
        iconAnchor: isSelected ? [24, 24] : [20, 20],
      });

      const marker = L.marker(position, { icon: pharmacyIcon, zIndexOffset: isSelected ? 1000 : 0 }).addTo(map);

      marker.bindTooltip(
        `<div class="flex flex-col gap-1 p-2 bg-white text-sm text-gray-800 pointer-events-none">
          <div class="font-semibold text-gray-900">${pharmacy.name}</div>
          <div class="text-xs text-gray-500">${pharmacy.distance} m</div>
        </div>`,
        {
          permanent: false,
          direction: "top",
          className: "leaflet-tooltip pointer-events-none",
          offset: [0, -10],
          opacity: 1,
        }
      );

      marker.on("click", () => {
        onPharmacySelect(pharmacy);
      });

      return marker;
    });

    return () => {
      markers.forEach((marker) => map.removeLayer(marker));
    };
  }, [map, pharmacies, selectedPharmacy, onPharmacySelect]);

  return null;
}
