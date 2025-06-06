import { useState, useEffect } from 'react';
import Map from '../components/Map/Map';
import Sidebar from '../components/Sidebar';
import Search from '../components/Search';
import axios from 'axios';
import { MAP_CONFIG } from '../config/map';
import AllowLocation from '../components/AllowLocation';
import SelectedPharmacyDetail from '../components/SelectedPharmacyDetail';
import { motion, AnimatePresence } from "framer-motion";
import AwsMap from '../components/AwsMap';


const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en km
  const toRad = (angle) => (angle * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000; // Devuelve la distancia en metros
};

export default function MedicationDetails() {
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [realPharmacies, setRealPharmacies] = useState([]);
  const [loadingPharmacies, setLoadingPharmacies] = useState(true); // Estado de carga
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [searchRadius, setSearchRadius] = useState(MAP_CONFIG.searchRadius);
  const [isCentered, setIsCentered] = useState(false);
  const [allPharmacies, setAllPharmacies] = useState([]);
  const [prevPharmacies, setPrevPharmacies] = useState([]);
  const [selectedFromMap, setSelectedFromMap] = useState(null);

  const handleChangeSelectedMedicine = (medicine) => {
    if (selectedMedicine === medicine) {
      setIsCentered(false);
    }
    setSelectedMedicine(medicine);
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
          setUserLocation([-33.4489, -70.6693]); // Santiago, Chile
        }
      );
    }
  }, []);


  useEffect(() => {
  let retryTimeout;

  const fetchPharmacies = () => {
    if (!userLocation || realPharmacies.length > 0) return;

    setLoadingPharmacies(true);

    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="pharmacy"](around:${MAP_CONFIG.maxSearchRadius},${userLocation[0]},${userLocation[1]});
        way["amenity"="pharmacy"](around:${MAP_CONFIG.maxSearchRadius},${userLocation[0]},${userLocation[1]});
        relation["amenity"="pharmacy"](around:${MAP_CONFIG.maxSearchRadius},${userLocation[0]},${userLocation[1]});
      );
      out body;
      >;
      out skel qt;
    `;

    axios.post('https://overpass-api.de/api/interpreter', query)
      .then(response => {
        const elements = response?.data?.elements;
        if (Array.isArray(elements) && elements.length > 0) {
          const newPharmacies = elements
            .filter(el => el.type === 'node' && el.tags)
            .map(pharmacy => {
              const distance = getDistance(userLocation[0], userLocation[1], pharmacy.lat, pharmacy.lon);
              return {
                id: pharmacy.id,
                name: pharmacy.tags.name || 'Farmacia',
                address: pharmacy.tags['addr:street']
                  ? `${pharmacy.tags['addr:street']} ${pharmacy.tags['addr:housenumber'] || ''}`
                  : 'Dirección no disponible',
                coordinates: {
                  lat: pharmacy.lat,
                  lng: pharmacy.lon
                },
                phone: pharmacy.tags.phone || 'No disponible',
                hours: pharmacy.tags.opening_hours || 'Horario no disponible',
                distance: distance.toFixed(2)
              };
            });

          const filtered = newPharmacies.filter(p => {
            const d = getDistance(userLocation[0], userLocation[1], p.coordinates.lat, p.coordinates.lng);
            return d <= MAP_CONFIG.searchRadius;
          });

          if (filtered.length > 0) {
            setAllPharmacies(newPharmacies);
            setRealPharmacies(filtered);
            setPrevPharmacies(filtered);
          } else {
            console.warn("No se encontraron farmacias cercanas. Reintentando...");
            retryTimeout = setTimeout(fetchPharmacies, 3000); // Reintenta en 3s
          }
        } else {
          console.warn("Respuesta vacía de la API. Reintentando...");
          retryTimeout = setTimeout(fetchPharmacies, 3000); // Reintenta en 3s
        }
      })
      .catch(err => {
        console.error("Error al consultar farmacias:", err);
        retryTimeout = setTimeout(fetchPharmacies, 3000); // Reintenta en 3s
      })
      .finally(() => {
        setLoadingPharmacies(false);
      });
  };

  fetchPharmacies();

  return () => {
    clearTimeout(retryTimeout); // limpia si el componente se desmonta
  };
}, [userLocation, realPharmacies.length]);


  useEffect(() => {
    if (allPharmacies.length > 0 && searchRadius) {
      // Filtramos las farmacias dentro del radio de búsqueda
      const filteredPharmacies = allPharmacies.filter(pharmacy => {
        const distance = getDistance(userLocation[0], userLocation[1], pharmacy.coordinates.lat, pharmacy.coordinates.lng);
        return distance <= searchRadius;
      });

      setRealPharmacies(filteredPharmacies); // Mostramos las farmacias dentro del radio
    }
  }, [searchRadius, allPharmacies, userLocation]); // Se ejecuta cuando 'searchRadius', 'allPharmacies' o 'userLocation' cambian




  const handleSetSelectedPharmacy = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
  };

  console.log('Real Pharmacies:', realPharmacies);
  return (
    <div className="w-full h-screen bg-gray-100 flex overflow-hidden relative">
      {/* Cargando pantalla */}
      {!userLocation || loadingPharmacies || !realPharmacies.length ? (
        <div className="w-full h-full flex items-center justify-center">
          <AllowLocation userLocation={userLocation} setUserLocation={setUserLocation} />
        </div>

      ) : (
        <>
          {/* Main Content */}
            <>
              <AnimatePresence>
                <>
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Sidebar
                      userLocation={userLocation}
                      pharmacies={realPharmacies}
                      selectedPharmacy={selectedPharmacy}
                      setSelectedPharmacy={setSelectedPharmacy}
                      selectedFromMap={selectedFromMap}
                      setSelectedFromMap={setSelectedFromMap}
                    />
                  </motion.div>

                  <motion.main
                    className="flex-1 z-10 bg-transparent pointer-events-none relative"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className='p-4 mr-12 md:p-8'>
                      <Search
                        searchRadius={searchRadius}
                        setSearchRadius={setSearchRadius}
                        isCentered={isCentered}
                        setIsCentered={setIsCentered}
                        selectedMedicine={selectedMedicine}
                        setSelectedMedicine={handleChangeSelectedMedicine}
                        userLocation={userLocation}
                      />
                    </div>
                    <div className="p-4 z-10 pointer-events-auto">
                      {selectedPharmacy && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3 }}
                        >
                          <SelectedPharmacyDetail pharmacy={selectedPharmacy} />
                        </motion.div>
                      )}
                    </div>
                  </motion.main>
                </>
              </AnimatePresence>

              <div className="absolute inset-0 w-full z-0">
                {/* <AwsMap
              userLocation={userLocation}
              pharmacies={realPharmacies}
              selectedPharmacy={selectedPharmacy}
              onPharmacySelect={handleSetSelectedPharmacy}
            /> */}
                <Map
                  prevPharmacies={prevPharmacies}
                  loading={loadingPharmacies}
                  searchRadius={searchRadius}
                  center={selectedPharmacy ? selectedPharmacy.position : userLocation}
                  pharmacies={realPharmacies}
                  selectedPharmacy={selectedPharmacy}
                  onPharmacySelect={handleSetSelectedPharmacy}
                  userLocation={userLocation}
                  selectedFromMap={selectedFromMap}
                  setSelectedFromMap={setSelectedFromMap}
                />
              </div>
            </>
          {/* Mapa como fondo */}
          <></>
        </>
      )}
    </div>
  );
}
