import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import MapControls from "./MapControls";


const MAP_STYLES = {
  standard: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  minimal: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
};


const userIcon = L.divIcon({
  html: `
   <div class='pin bounce'></div>
<div class='pulse'></div>
    `,
  className: "user-location-marker",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});


export default function Map({ loading, searchRadius, center, pharmacies, selectedPharmacy, onPharmacySelect, userLocation, prevPharmacies, newPharmacies, selectedFromMap, setSelectedFromMap }) {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const routeControlRef = useRef(null);
  const [mapStyle, setMapStyle] = useState("minimal");
  const [searchArea, setSearchArea] = useState(null);
  
  // Referencias para los marcadores
  const markersRef = useRef({
    user: null,
    pharmacies: {}
  });
  
  // Referencia para mantener un registro de las farmacias actualmente visibles
  // Esto nos permite saber cuáles farmacias están actualmente en el mapa
  const currentlyVisiblePharmaciesRef = useRef(new Set());

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() - 1);
    }
  };

  const handleCenterOnUser = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.setView(userLocation, 16, { animate: true });
    }
  };

  const handleLayerChange = (style) => {
    setMapStyle(style);
    if (mapRef.current) {
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          mapRef.current.removeLayer(layer);
        }
      });
      L.tileLayer(MAP_STYLES[style], {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
    }
  };

  // Inicializar el mapa solo una vez
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    
    // Inicializar el conjunto de farmacias visibles
    currentlyVisiblePharmaciesRef.current = new Set();
    
    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: 15,
      layers: [
        L.tileLayer(MAP_STYLES[mapStyle], {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }),
      ],
      zoomControl: false,
    });

    mapRef.current = map;
    
    // Añadir marcador de usuario inicial
    markersRef.current.user = L.marker(userLocation, { icon: userIcon })
      .addTo(map)
      .bindTooltip("Mi ubicación", { permanent: false, direction: "top" });
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Función para crear un icono de farmacia
  const createPharmacyIcon = (pharmacy, isSelected, withAnimation = false) => {
    return L.divIcon({
      html: `
      <div class="relative w-10 h-10 transition-all duration-300 rounded-full shadow-lg flex items-center justify-center border p-1 border-gray-300 ${withAnimation ? 'bounce' : ''}
        ${isSelected ? "w-12 h-12 bg-red-500 border-red-500 z-20" : "hover:scale-110 bg-white border-gray-200 z-0"} 
        transition-transform duration-200">
        <div class="w-8 h-8 flex items-center justify-center ${isSelected ? "" : "bg-green-500"} rounded-full text-white text-lg">
          💊
        </div>
      </div>
    `,
      className: isSelected ? "z-20" : "z-0",
      iconSize: isSelected ? [48, 48] : [40, 40],
      iconAnchor: isSelected ? [24, 24] : [20, 20],
    });
  };

  // Efecto para manejar el círculo de búsqueda
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;
    
    // Limpiar el círculo de búsqueda anterior si existe
    if (searchArea) {
      mapRef.current.removeLayer(searchArea);
    }

    // Crear nuevo círculo de búsqueda
    if (loading) {
      const radar = L.circle(userLocation, {
        color: 'transparent',
        fillColor: 'green',
        fillOpacity: 0.1,
        weight: 2,
        opacity: 0.5,
        radius: searchRadius,
      }).addTo(mapRef.current);

      if (radar._path) {
        radar._path.setAttribute('class', 'radar-effect');
      }
      setSearchArea(radar);
    } else if (searchRadius) {
      const circle = L.circle(userLocation, {
        color: 'transparent',
        fillColor: 'blue',
        fillOpacity: 0.05,
        radius: searchRadius,
      }).addTo(mapRef.current);
      setSearchArea(circle);
    }
  }, [loading, searchRadius, userLocation]);

  // Efecto para actualizar el marcador de usuario cuando cambia la ubicación
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;
    
    // Actualizar marcador de usuario
    if (markersRef.current.user) {
      mapRef.current.removeLayer(markersRef.current.user);
    }
    
    markersRef.current.user = L.marker(userLocation, { icon: userIcon })
      .addTo(mapRef.current)
      .bindTooltip("Mi ubicación", { permanent: false, direction: "top" });
  }, [userLocation]);
  
  // Efecto para gestionar los marcadores de farmacias - solo se ejecuta cuando cambia la lista de farmacias
  useEffect(() => {
    if (!mapRef.current || !pharmacies.length) return;
    
    // Obtener los IDs de las farmacias actuales como un conjunto para búsquedas rápidas
    const currentPharmacyIds = new Set(pharmacies.map(p => p.id.toString()));
    
    // Crear una copia del conjunto de farmacias visibles antes de actualizarlo
    // Esto nos permite saber qué farmacias estaban visibles en el render anterior
    const previouslyVisiblePharmacies = new Set([...currentlyVisiblePharmaciesRef.current]);
    
    // Eliminar marcadores de farmacias que ya no están en la lista actual
    Object.keys(markersRef.current.pharmacies).forEach(id => {
      if (!currentPharmacyIds.has(id)) {
        if (mapRef.current.hasLayer(markersRef.current.pharmacies[id])) {
          mapRef.current.removeLayer(markersRef.current.pharmacies[id]);
        }
        delete markersRef.current.pharmacies[id];
        
        // También eliminar de la lista de farmacias visibles
        currentlyVisiblePharmaciesRef.current.delete(id);
      }
    });
    
    // Limpiar el conjunto de farmacias visibles y volver a llenarlo
    currentlyVisiblePharmaciesRef.current.clear();
    
    // Añadir o actualizar marcadores de farmacias
    pharmacies.forEach(pharmacy => {
      const pharmacyId = pharmacy.id.toString();
      const position = [pharmacy.coordinates.lat, pharmacy.coordinates.lng];
      const isSelected = selectedPharmacy && selectedPharmacy.id === pharmacy.id;
      
      // Determinar si esta farmacia debe animarse:
      // - Si no estaba visible en el render anterior (es nueva o reapareció)
      const shouldAnimate = !previouslyVisiblePharmacies.has(pharmacyId);
      
      // Agregar esta farmacia al conjunto de farmacias actualmente visibles
      currentlyVisiblePharmaciesRef.current.add(pharmacyId);
      
      // Si el marcador ya existe, solo actualizamos su icono si es necesario
      if (markersRef.current.pharmacies[pharmacy.id]) {
        const existingMarker = markersRef.current.pharmacies[pharmacy.id];
        
        // Verificar si necesitamos actualizar el icono (si cambió el estado de selección)
        const markerIsSelected = existingMarker.options.zIndexOffset === 1000;
        if (markerIsSelected !== isSelected) {
          // Actualizar el icono sin animación
          existingMarker.setIcon(createPharmacyIcon(pharmacy, isSelected, false));
          existingMarker.setZIndexOffset(isSelected ? 1000 : 0);
        }
        
        // Asegurarse de que el marcador esté en el mapa
        if (!mapRef.current.hasLayer(existingMarker)) {
          existingMarker.addTo(mapRef.current);
        }
      } else {
        // Crear un nuevo marcador con animación bounce solo si debe animarse
        const pharmacyIcon = createPharmacyIcon(pharmacy, isSelected, shouldAnimate);
        const marker = L.marker(position, { 
          icon: pharmacyIcon, 
          zIndexOffset: isSelected ? 1000 : 0 
        });
        
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
          setSelectedFromMap(pharmacy);
        });
        
        marker.addTo(mapRef.current);
        markersRef.current.pharmacies[pharmacy.id] = marker;
      }
    });
  }, [pharmacies, prevPharmacies]);
  
  // Efecto para actualizar el estilo del marcador seleccionado
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Actualizar estilos de todos los marcadores de farmacias
    Object.entries(markersRef.current.pharmacies).forEach(([id, marker]) => {
      const pharmacy = pharmacies.find(p => p.id.toString() === id);
      if (pharmacy) {
        const isSelected = selectedPharmacy && selectedPharmacy.id === pharmacy.id;
        // Sin animación al actualizar, solo cambiar el estilo
        marker.setIcon(createPharmacyIcon(pharmacy, isSelected, false));
        marker.setZIndexOffset(isSelected ? 1000 : 0);
      }
    });
  }, [selectedPharmacy]);

  // Efecto para manejar la ruta
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;
    
    // Agregar o actualizar la ruta si hay una farmacia seleccionada
    if (selectedPharmacy) {
      const pharmacyPosition = [selectedPharmacy.coordinates.lat, selectedPharmacy.coordinates.lng];
      
      // Eliminar la ruta anterior si existe
      if (routeControlRef.current) {
        mapRef.current.removeControl(routeControlRef.current);
        routeControlRef.current = null;
      }
      
      // Crear una nueva ruta
      routeControlRef.current = L.Routing.control({
        waypoints: [
          userLocation,
          pharmacyPosition
        ],
        fitSelectedRoutes: false,
        routeWhileDragging: true,
        createMarker: () => null,
        lineOptions: {
          styles: [{ color: '#3388ff', weight: 4, opacity: 0.7 }]
        }
      }).addTo(mapRef.current);
      
      // Asegurarse de que los marcadores de farmacias permanezcan visibles
      Object.values(markersRef.current.pharmacies).forEach(marker => {
        if (!mapRef.current.hasLayer(marker)) {
          marker.addTo(mapRef.current);
        }
      });
    } else if (routeControlRef.current) {
      // Eliminar la ruta si no hay farmacia seleccionada
      mapRef.current.removeControl(routeControlRef.current);
      routeControlRef.current = null;
    }
  }, [selectedPharmacy, userLocation]);

  // Ajustar el mapa para mostrar la farmacia seleccionada y la ubicación del usuario
  useEffect(() => {
    if (!mapRef.current || !selectedPharmacy || !userLocation) return;
    
    // Asegurarse de que todos los marcadores estén en el mapa antes de hacer zoom
    Object.values(markersRef.current.pharmacies).forEach(marker => {
      if (!mapRef.current.hasLayer(marker)) {
        marker.addTo(mapRef.current);
      }
    });
    
    // Ajustar el mapa para mostrar la farmacia seleccionada y la ubicación del usuario
    const pharmacyPosition = [selectedPharmacy.coordinates.lat, selectedPharmacy.coordinates.lng];
    const bounds = L.latLngBounds([pharmacyPosition, userLocation]);
    
    mapRef.current.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 18,
      animate: true,
      duration: 0.5
    });
  }, [selectedPharmacy, userLocation]);


  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onLayerChange={handleLayerChange}
        onCenterOnUser={handleCenterOnUser}
        currentStyle={mapStyle}
      />
    </div>
  );
}
