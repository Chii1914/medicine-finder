import { MapPin, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

export default function AllowLocation({ userLocation, setUserLocation }) {
  const [permissionStatus, setPermissionStatus] = useState("requesting");
  const [isLoadingPharmacies, setIsLoadingPharmacies] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setPermissionStatus("denied");
      return;
    }

    navigator.permissions?.query({ name: "geolocation" }).then((result) => {
      if (result.state === "granted") {
        setPermissionStatus("granted");
        setIsLoadingPharmacies(true);
      } else if (result.state === "denied") {
        setPermissionStatus("denied");
      }
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setUserLocation(location);
        setPermissionStatus("granted");
        setIsLoadingPharmacies(true);
      },
      (error) => {
        setPermissionStatus("denied");
        console.error("Location error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, [setUserLocation]);

  const renderContent = () => {
    switch (permissionStatus) {
      case "requesting":
        return (
          <>
            <div className="relative mb-8">
              <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center">
                <MapPin className="text-blue-400 w-8 h-8" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-ping"></div>
            </div>
            <h2 className="text-white text-2xl font-light mb-3">Accediendo a tu ubicación</h2>
            <p className="text-gray-400 text-sm font-light">
              Necesitamos tu ubicación para encontrar farmacias cercanas
            </p>
          </>
        );

      case "granted":
        return (
          <>
            <div className="relative mb-8">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="text-green-400 w-8 h-8" />
              </div>
              {isLoadingPharmacies && (
                <div className="absolute inset-0 rounded-full border-2 border-green-400/30 animate-spin border-t-transparent"></div>
              )}
            </div>
            <h2 className="text-white text-2xl font-light mb-3">
              {isLoadingPharmacies ? "Buscando farmacias" : "Ubicación confirmada"}
            </h2>
            <p className="text-gray-400 text-sm font-light">
              {isLoadingPharmacies
                ? "Encontrando las mejores opciones cerca de ti"
                : "Listo para continuar"}
            </p>
          </>
        );

      case "denied":
        return (
          <>
            <div className="mb-8">
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
                <MapPin className="text-red-400 w-8 h-8" />
              </div>
            </div>
            <h2 className="text-white text-2xl font-light mb-3">Ubicación no disponible</h2>
            <p className="text-gray-400 text-sm font-light mb-8">
              Habilita la ubicación en tu navegador para continuar
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium transition-all duration-200 backdrop-blur-sm border border-white/20"
            >
              Intentar de nuevo
            </button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-screen h-screen bg-gray-900 flex items-center justify-center">
      <div className="flex flex-col items-center text-center max-w-xs">{renderContent()}</div>
    </div>
  );
}
