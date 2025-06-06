import { Hospital, Phone, Clock, Navigation, X } from "lucide-react";
import { useState } from "react";

export default function SelectedPharmacyDetail({ pharmacy }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="absolute bottom-6 left-6 bg-gray-800 w-80 p-5 rounded-2xl shadow-lg border border-gray-700 transition-all">
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-3">
          <Hospital className="w-6 h-6 text-cyan-400 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-white">{pharmacy.name}</h3>
            <div className="mt-3 space-y-2">
              <div className="flex items-center text-sm text-gray-300">
                <Navigation className="w-4 h-4 mr-2 text-cyan-400" />
                <span>{pharmacy.distance} km</span>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Phone className="w-4 h-4 mr-2 text-cyan-400" />
                <span>{pharmacy.phone}</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 mr-2 text-green-400" />
                <span className="text-green-400">{pharmacy.hours}</span>
              </div>
              <p className="text-sm text-gray-300">{pharmacy.address}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-200 transition"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
