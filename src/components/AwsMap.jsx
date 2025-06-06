import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const apiKey = process.env.REACT_APP_AWS_MAP_API_KEY;
const region = process.env.REACT_APP_AWS_REGION;
const style = process.env.REACT_APP_AWS_MAP_STYLE;
const colorScheme = process.env.REACT_APP_AWS_COLOR_SCHEME;
const routeIndexName = process.env.REACT_APP_AWS_ROUTE_INDEX_NAME;


const Map = ({ pharmacies }) => {
  
  const [userLocation, setUserLocation] = useState({});
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]); // Guardar referencia a los marcadores de farmacias

  // Obtener ubicación del usuario
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
        }
      );
    }
  }, []);

  
  // Inicializar mapa
  useEffect(() => {
    if (!mapContainer.current || !userLocation.lat || !userLocation.lng) return;

    
    
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://maps.geo.${region}.amazonaws.com/v2/styles/${style}/descriptor?key=${apiKey}&color-scheme=${colorScheme}`,
      center: [userLocation.lng, userLocation.lat],
      zoom: 15,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    // Marcador del usuario
    new maplibregl.Marker({ color: "#FF0000" })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map);

    mapRef.current = map;

    return () => map.remove();
  }, [userLocation]);

  // Añadir marcadores de farmacias
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !pharmacies || pharmacies.length === 0) return;

    // Eliminar marcadores anteriores
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    pharmacies.forEach((pharmacy) => {
      const marker = new maplibregl.Marker({ color: "#007BFF" })
        .setLngLat([pharmacy.coordinates.lng, pharmacy.coordinates.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(`
            <div style="font-family: Arial, sans-serif; padding: 10px; max-width: 200px;">
              <h3 style="margin: 0 0 5px; font-size: 16px; color: #2c3e50;">${pharmacy.name}</h3>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Dirección:</strong> ${pharmacy.address}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Teléfono:</strong> ${pharmacy.phone}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Horario:</strong> ${pharmacy.schedule}</p>
              <button onclick="window.getRoute(${pharmacy.coordinates.lng}, ${pharmacy.coordinates.lat})" style="display:block; margin-top: 10px; font-size: 14px; background-color: #3498db; color: white; padding: 8px; border: none; border-radius: 4px;">Ver ruta</button>
            </div>
          `)
        )
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [pharmacies, userLocation]);

  // Obtener la ruta desde la ubicación del usuario a la farmacia seleccionada
  const getRoute = async (destinationLng, destinationLat) => {
    const requestBody = {
      DeparturePosition: [userLocation.lng, userLocation.lat],
      DestinationPosition: [destinationLng, destinationLat],
      TravelMode: "Walking", // o "Driving"
      LegGeometryFormat: "GeoJson",
    };
  
    const apiUrl = `https://routes.geo.${region}.amazonaws.com/routes/v0/calculators/${routeIndexName}/calculate-route`;
  
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Amz-Api-Key": apiKey,
          "Cors": "*",
        },
        body: JSON.stringify(requestBody),
      });
  
      const data = await response.json();
      console.log("Route data:", data);
  
      if (data.Legs && data.Legs.length > 0) {
        const lineString = {
          type: "Feature",
          geometry: data.Legs[0].Geometry,
        };
  
        const map = mapRef.current;
  
        if (map.getSource("route")) {
          map.removeLayer("route");
          map.removeSource("route");
        }
  
        map.addSource("route", {
          type: "geojson",
          data: lineString,
        });
  
        map.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#3498db",
            "line-width": 6,
          },
        });
      }
    } catch (error) {
      console.error("Error obteniendo la ruta:", error);
    }
  };
  

  // Hacer que getRoute esté disponible globalmente para el botón
  window.getRoute = getRoute;

  return <div ref={mapContainer} style={{ height: "100vh", width: "100%" }} />;
};

export default Map;
