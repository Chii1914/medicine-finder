// components/MapaConRuta.jsx
import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { LocationClient, CalculateRouteCommand } from "@aws-sdk/client-location";
import { credentials, REGION, ROUTE_INDEX } from "./awsConfig";
const MapaConRuta = () => {
  const mapContainer = useRef(null);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://maps.geo.${REGION}.amazonaws.com/v2/styles/Standard/descriptor?key=${process.env.REACT_APP_AWS_MAP_API_KEY}&color-scheme=Light`,
      center: [-73.9857, 40.7484],
      zoom: 14,
    });

    const fetchRoute = async () => {
      const client = new LocationClient({ region: REGION, credentials });


      const command = new CalculateRouteCommand({
        CalculatorName: ROUTE_INDEX,
        DeparturePosition: [-73.9857, 40.7484], // long, lat
        DestinationPosition: [-73.9780, 40.7527],
        TravelMode: "Car", // "Walking" | "Car" | "Truck"
      });

      try {
        const data = await client.send(command);
        const routeCoords = data.Legs.flatMap((leg) =>
          leg.Steps.map((step) => step.StartPosition)
        );

        // Add route to map
        map.addSource("aws-route", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: routeCoords,
            },
          },
        });

        map.addLayer({
          id: "aws-route-layer",
          type: "line",
          source: "aws-route",
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": "#0078ff",
            "line-width": 4,
          },
        });

        // Añade marcadores
        new maplibregl.Marker().setLngLat([-73.9857, 40.7484]).addTo(map); // Origen
        new maplibregl.Marker().setLngLat([-73.9780, 40.7527]).addTo(map); // Destino

      } catch (err) {
        console.error("Error calculando la ruta:", err);
      }
    };

    map.on("load", fetchRoute);

    return () => map.remove();
  }, []);

  return <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />;
};

export default MapaConRuta;
