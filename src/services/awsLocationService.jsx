import { LocationClient, CalculateRouteCommand } from "@aws-sdk/client-location";

const client = new LocationClient({
  region: env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
  }
});

export const calculateRoute = async (startPoint, endPoint) => {
  try {
    const command = new CalculateRouteCommand({
      CalculatorName: import.meta.env.VITE_AWS_ROUTE_INDEX_NAME,
      DeparturePosition: [startPoint[1], startPoint[0]], // [longitude, latitude]
      DestinationPosition: [endPoint[1], endPoint[0]], // [longitude, latitude]
      TravelMode: 'Walking'
    });

    const response = await client.send(command);
    return response.Legs?.[0].Steps || [];
  } catch (error) {
    console.error('Error calculating route:', error);
    return [];
  }
};