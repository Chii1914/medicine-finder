import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Plus,
  Hospital,
  MapPin,
  Clock,
  Navigation2,
  X,
  Navigation,
  BellRing, // Added for alert icon
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
// import run from "../images/run.png"; // Assuming this is not used or handled differently
import { io } from "socket.io-client"; // <-- IMPORT socket.io-client

export default function Sidebar({
  pharmacies,
  selectedPharmacy,
  setSelectedPharmacy,
  selectedFromMap,
  setSelectedFromMap,
}) {
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [expandedPharmacy, setExpandedPharmacy] = useState(null)
  const [navigatingToPharmacy, setNavigatingToPharmacy] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const pinnedCardRef = useRef(null)

  // NEW STATE: To hold the urgent alert received via WebSocket
  const [urgentAlert, setUrgentAlert] = useState(null);
  const alertTimeoutRef = useRef(null); // Ref to store the timeout ID

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Filtrar farmacias para no mostrar la que está seleccionada o en navegación
  const filteredPharmacies = pharmacies.filter(
    (pharmacy) => {
      // Si hay una farmacia en navegación, no mostrarla en la lista
      if (navigatingToPharmacy && pharmacy.id === navigatingToPharmacy.id) {
        return false;
      }
      // Si hay una farmacia seleccionada, no mostrarla en la lista
      if (selectedPharmacy && pharmacy.id === selectedPharmacy.id) {
        return false;
      }
      return true;
    }
  )

  const handlePharmacySelect = (pharmacy) => {
    // Si ya estamos navegando a una farmacia, no permitir seleccionar otra
    if (navigatingToPharmacy) {
      console.log("Ya estás navegando a una farmacia. Cancela la navegación actual primero.")
      return
    }

    // Si seleccionamos la misma farmacia, deseleccionarla
    if (selectedPharmacy?.id === pharmacy.id) {
      setSelectedPharmacy(null)
    } else {
      setSelectedPharmacy(pharmacy)
    }
  }

  const handleNavigate = (e, pharmacy) => {
    e.stopPropagation() // Evitar que se propague al onClick del div padre
    setIsAnimating(true)

    // Pequeño retraso para la animación
    setTimeout(() => {
      setNavigatingToPharmacy(pharmacy)
      // Primero notificar al componente padre sobre la selección
      setSelectedPharmacy(pharmacy)
      // Luego limpiar la selección local
      setExpandedPharmacy(null)
      setIsAnimating(false)
    }, 150)
  }

  const resetNavigation = () => {
    setIsAnimating(true)

    // Pequeño retraso para la animación
    setTimeout(() => {
      // Limpiar la farmacia en navegación
      setNavigatingToPharmacy(null)

      // Limpiar la farmacia seleccionada para quitar la ruta y el marcador rojo del mapa
      setSelectedPharmacy(null)

      // Limpiar otros estados
      setExpandedPharmacy(null)
      setIsAnimating(false)
    }, 150)
  }

  // Efecto para animar el scroll cuando se fija una farmacia
  useEffect(() => {
    if (pinnedCardRef.current && navigatingToPharmacy) {
      window.scrollTo({
        top: pinnedCardRef.current.offsetTop - 20,
        behavior: "smooth",
      })
    }
  }, [navigatingToPharmacy])

  // Efecto para sincronizar cuando se selecciona una farmacia desde el mapa
  useEffect(() => {
    // Si se selecciona una farmacia desde el mapa, actualizar el estado local
    if (selectedPharmacy && !navigatingToPharmacy) {
      // Expandir la farmacia seleccionada para mostrar el botón "Cómo llegar"
      setExpandedPharmacy(selectedPharmacy)
    }
  }, [selectedPharmacy])

  // --- NEW EFFECT FOR WEBSOCKET LISTENER ---
  useEffect(() => {
    // Connect to the WebSocket server (your pub-sub service's WS port)
    // Ensure this URL matches your docker-compose.yml port mapping for pub-sub WS
    const socket = io('http://localhost:3005');

    socket.on('connect', () => {
      console.log('WebSocket: Connected to pub-sub service!');
    });

    socket.on('disconnect', () => {
      console.log('WebSocket: Disconnected from pub-sub service.');
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket: Connection error:', error);
    });

    // Listen for the 'urgentMedAlert' event
    socket.on('urgentMedAlert', (alert) => {
      console.log('WebSocket: Received urgent medical alert:', alert);
      setUrgentAlert(alert); // Set the alert in state

      // Clear any existing timeout
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }

      // Set a timeout to clear the alert after 10 seconds (adjust as needed)
      alertTimeoutRef.current = setTimeout(() => {
        setUrgentAlert(null);
      }, 10000); // Alert will disappear after 10 seconds
    });

    // Cleanup function: Disconnect WebSocket when component unmounts
    return () => {
      socket.disconnect();
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
    };
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount
  // --- END WEBSOCKET EFFECT ---


  const renderPharmacyCard = (pharmacy, isPinned = false) => {

    const isExpanded = expandedPharmacy?.id === pharmacy.id
    const isSelected = selectedPharmacy?.id === pharmacy.id

    let cardClasses = "p-3 mx-3 my-2 rounded-xl transition-all duration-300 border "

    if (isPinned) {
      cardClasses += "bg-gray-700 border-emerald-600 shadow-lg shadow-emerald-900/30 transform scale-[1.02] "
    } else {
      cardClasses += "cursor-pointer "
      cardClasses += isExpanded
        ? "bg-gray-700 border-gray-500 shadow-md "
        : "bg-gray-800 border-gray-700 hover:bg-gray-700 hover:border-gray-600 "
    }

    return (
      <div
        className={cardClasses}
        onClick={() => {
          // No permitir expandir si hay una navegación activa
          if (navigatingToPharmacy) {
            return
          }

          // Permitir expandir/colapsar si no está fijada
          if (!isPinned) {
            setExpandedPharmacy(
              expandedPharmacy?.id === pharmacy.id ? null : pharmacy
            )
          }
        }}
        ref={isPinned ? pinnedCardRef : null}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={pharmacy.image || "https://upload.wikimedia.org/wikipedia/en/a/a6/Pharmacia_logo.gif"}
              alt={pharmacy.name}
              className={`w-14 h-14 rounded-lg object-cover border ${isPinned ? "border-emerald-700" : "border-gray-700"
                }`}
            />
          </div>

          <div className="flex-grow min-w-0">
            <div className="flex items-center">
              <h3 className="text-sm font-medium text-white truncate">{pharmacy.name}</h3>
              {isPinned && <CheckCircle2 className="w-4 h-4 ml-2 text-emerald-500" />}
            </div>

            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
              <MapPin className="w-3 h-3 text-gray-500 flex-shrink-0" />
              <span className="truncate">{pharmacy.address.split(",")[0]}</span>
            </div>

            <div className="flex justify-between items-center mt-1">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3 h-3 text-gray-500 flex-shrink-0" />
                <span>Hasta {pharmacy.openUntil}</span>
              </div>

              <div className={`flex items-center text-xs ${isPinned ? "text-emerald-400" : "text-gray-300"}`}>
                <Navigation2 className="w-3 h-3 mr-1" />
                <span className="font-medium">{pharmacy.distance} km</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mostrar botón "Cómo llegar" solo cuando corresponda */}
        {isExpanded && !isPinned && !navigatingToPharmacy && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <button
              className="w-full bg-gray-600 hover:bg-gray-500 text-white py-2 rounded-lg text-sm font-medium transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                // Iniciar la navegación a esta farmacia
                handleNavigate(e, pharmacy)
              }}
            >
              Cómo llegar
            </button>
          </div>
        )}

        {isPinned && (
          <div className="mt-3 pt-3 border-t border-emerald-800/30">
            <button
              onClick={(e) => {
                e.stopPropagation()
                // Limpiar todos los estados
                resetNavigation()
                setSelectedPharmacy(null)
                setExpandedPharmacy(null)
                setSelectedFromMap(null)
              }}
              className="w-full bg-gray-600 hover:bg-gray-500 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar navegación
            </button>
          </div>
        )}
      </div>
    )
  }



  // Efecto para detectar cuando se selecciona una farmacia desde el mapa
  useEffect(() => {
    if (selectedFromMap && !navigatingToPharmacy) {
      // Si hay una farmacia seleccionada desde el mapa, establecerla como farmacia de navegación
      setIsAnimating(true);
      setTimeout(() => {
        // Establecer la farmacia como la que estamos navegando
        setNavigatingToPharmacy(selectedFromMap);
        // Establecer la farmacia seleccionada para que aparezca fijada
        setSelectedPharmacy(selectedFromMap);
        // Limpiar la selección desde el mapa para evitar bucles
        setSelectedFromMap(null);
        setIsAnimating(false);
      }, 150);
    }
  }, [selectedFromMap]);

  return (
    <div className="flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-72 lg:w-[450px] h-screen bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 shadow-xl z-30 text-gray-200 ">
        <header className="px-6 py-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            Farmacias cercanas
          </h2>
        </header>

        {/* NEW: Urgent Alert Banner */}
        {urgentAlert && (
          <div className="bg-red-700 text-white p-3 mx-3 my-2 rounded-xl shadow-lg animate-pulse flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BellRing className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm">¡Alerta Médica Urgente!</p>
                <p className="text-xs">Tipo: {urgentAlert.type} | Severidad: {urgentAlert.severity}</p>
                <p className="text-xs">Precio: ${urgentAlert.price} | Notas: {urgentAlert.notes || 'N/A'}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setUrgentAlert(null);
                if (alertTimeoutRef.current) {
                  clearTimeout(alertTimeoutRef.current);
                }
              }}
              className="text-white hover:text-gray-200 ml-2"
              aria-label="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {/* END NEW: Urgent Alert Banner */}


        <div
          className={`overflow-hidden transition-all duration-300 ${selectedPharmacy ? "max-h-[250px] opacity-100" : "max-h-0 opacity-0"
            }`}
        >
          {selectedPharmacy && (
            <div
              className={`transform transition-all duration-300 ${isAnimating ? "translate-y-[-100%] opacity-0" : "translate-y-0 opacity-100"
                }`}
            >
              <div className="px-2 py-2 bg-gradient-to-r from-emerald-700 to-emerald-400 text-white rounded-xl text-sm font-medium mb-1 rounded-t-lg mx-3 relative overflow-hidden flex items-center gap-2 shadow-xl">
                {navigatingToPharmacy ? (
                  <>
                    <div className="flex items-center px-2">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <Navigation className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="whitespace-nowrap ml-2 font-medium" >Navegando</span>

                    </div>
                    <div className="relative w-full h-6 overflow-hidden">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-chevrons-right-icon lucide-chevrons-right absolute absolute top-1/2 -translate-y-1/2 w-6 h-6 fill-emerald-400 animate-moveArrow"><path d="m6 17 5-5-5-5" /><path d="m13 17 5-5-5-5" /></svg>
                    </div>
                  </>
                ) : (
                  "Farmacia seleccionada"
                )}

                <style jsx>{`
    @keyframes moveArrow {
      0% {
        left: -1.5rem;
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      90% {
        left: calc(100% - 1.5rem);
        opacity: 1;
      }
      100% {
        left: 100%;
        opacity: 0;
      }
    }
    .animate-moveArrow {
      animation: moveArrow 3s linear infinite;
      position: absolute;
    }
  `}</style>
              </div>

              {renderPharmacyCard(selectedPharmacy, true)}
            </div>
          )}
        </div>


        <div className="flex-1 overflow-y-auto my-scrollable-div">
          {filteredPharmacies.map((pharmacy) => (
            <div
              key={pharmacy.id}
              className={`transform transition-all duration-200 ${isAnimating && selectedPharmacy?.id === pharmacy.id
                ? "translate-y-[-20px] opacity-0"
                : "translate-y-0 opacity-100"
                }`}
            >
              {renderPharmacyCard(pharmacy)}
            </div>
          ))}
        </div>
      </aside>








      {/* Mobile Sidebar */}
      <div
        className={`md:hidden fixed bottom-0 left-0 w-full bg-gray-800 border-t border-gray-700 shadow-xl z-30 transition-all duration-300 ${isMobileSidebarOpen ? "h-[70vh]" : "h-16"
          }`}
      >
        <div className="px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Farmacias</h2>
          <button onClick={toggleMobileSidebar} className="text-gray-300 hover:text-white">
            {isMobileSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
          </button>
        </div>

        {/* NEW: Urgent Alert Banner for Mobile */}
        {urgentAlert && isMobileSidebarOpen && (
          <div className="bg-red-700 text-white p-3 mx-3 my-2 rounded-xl shadow-lg animate-pulse flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BellRing className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm">¡Alerta Médica Urgente!</p>
                <p className="text-xs">Tipo: {urgentAlert.type} | Severidad: {urgentAlert.severity}</p>
                <p className="text-xs">Precio: ${urgentAlert.price} | Notas: {urgentAlert.notes || 'N/A'}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setUrgentAlert(null);
                if (alertTimeoutRef.current) {
                  clearTimeout(alertTimeoutRef.current);
                }
              }}
              className="text-white hover:text-gray-200 ml-2"
              aria-label="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {/* END NEW: Urgent Alert Banner for Mobile */}


        {/* Sección de farmacia seleccionada/navegación (móvil) */}
        {selectedPharmacy && isMobileSidebarOpen && (
          <div className="px-3 mb-2">
            <div className="px-4 py-2 bg-emerald-900/30 text-emerald-400 text-sm font-medium mb-1 rounded-t-lg mx-3">
              {navigatingToPharmacy ? "Navegando a esta farmacia" : "Farmacia seleccionada"}
            </div>
            {renderPharmacyCard(selectedPharmacy, true)}
          </div>
        )}

        <div
          className={`overflow-y-auto px-3 transition-all duration-300 space-y-2 ${isMobileSidebarOpen ? "max-h-[60vh]" : "max-h-0 overflow-hidden"
            }`}
        >
          {/* Mostrar farmacias filtradas (sin la que está en navegación) */}
          {filteredPharmacies.map((pharmacy) => {
            const isExpanded = expandedPharmacy?.id === pharmacy.id;
            const isSelected = selectedPharmacy?.id === pharmacy.id;

            return (
              <div
                key={pharmacy.id}
                className={`rounded-xl p-3 flex flex-col border transition-all cursor-pointer
                    ${isExpanded
                    ? "bg-gray-700 border-gray-500 shadow-md"
                    : "bg-gray-800 border-gray-700 hover:bg-gray-700 hover:border-gray-600"
                  }
                  `}
                onClick={() => {
                  // No permitir expandir si hay navegación activa
                  if (navigatingToPharmacy) return;

                  setExpandedPharmacy(
                    expandedPharmacy?.id === pharmacy.id ? null : pharmacy
                  );
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <img
                      src={pharmacy.image || "https://upload.wikimedia.org/wikipedia/en/a/a6/Pharmacia_logo.gif"}
                      alt={pharmacy.name}
                      className="w-14 h-14 rounded-lg object-cover border border-gray-700"
                    />
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 bg-indigo-500 text-white rounded-full p-1">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="flex-grow min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">{pharmacy.name}</h3>

                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                      <MapPin className="w-3 h-3 text-gray-500 flex-shrink-0" />
                      <span className="truncate">{pharmacy.address.split(",")[0]}</span>
                    </div>

                    <div className="flex justify-between items-center mt-1">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3 text-gray-500 flex-shrink-0" />
                        <span>Hasta {pharmacy.openUntil || "20:00"}</span>
                      </div>

                      <div className="flex items-center text-xs text-gray-300">
                        <Navigation2 className="w-3 h-3 mr-1" />
                        <span className="font-medium">{pharmacy.distance} km</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botón "Cómo llegar" para móvil */}
                {isExpanded && !navigatingToPharmacy && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <button
                      className="w-full bg-gray-600 hover:bg-gray-500 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePharmacySelect(pharmacy);
                        handleNavigate(e, pharmacy);
                      }}
                    >
                      Cómo llegar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
