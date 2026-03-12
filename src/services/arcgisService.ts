import { MapMarker } from '../components/ui/CityMap';

const ARCGIS_API_URL = 'https://services.arcgis.com/v4003S3sANlD0M3Y/arcgis/rest/services/Active_Calls_for_Service/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json';

// Standardized incident structure per requirements
export interface StandardizedIncident {
  id: string;
  type: string;
  location: { lat: number; lng: number };
  description: string;
  priority: string;
  timestamp: string;
}

// Loosen the interface to prevent type errors from unexpected API responses
export interface ArcGISFeature {
  attributes?: {
    ObjectId?: number;
    OBJECTID?: number; // Handle potential all-caps casing
    call_type?: string;
    location?: string;
    priority?: string;
    call_time?: number;
  };
  geometry?: {
    x: number;
    y: number;
  };
}

export const arcgisService = {
  getIncidents: async (): Promise<MapMarker[]> => {
    try {
      const response = await fetch(ARCGIS_API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // 1. Safety: Use optional chaining (`?.`) and nullish coalescing (`??`) to prevent crashes.
      const markers = (data?.features ?? []).map((feature: ArcGISFeature) => {
        const attrs = feature?.attributes;
        const geom = feature?.geometry;

        // 2. Casing: Safely access ObjectId, checking for both casings.
        const objectId = attrs?.OBJECTID ?? attrs?.ObjectId;
        const callType = attrs?.call_type ?? 'Unknown Incident';

        // 3. Leaflet Mapping: Ensure geometry exists before creating a marker.
        if (!objectId || !geom?.y || !geom?.x || isNaN(geom.x) || isNaN(geom.y)) {
          return null; // Skip this record if essential data is missing
        }

        // 4. Validate against StandardizedIncident structure
        const incident: StandardizedIncident = {
          id: `incident_${objectId}`,
          type: callType,
          location: { lat: geom.y, lng: geom.x },
          description: attrs?.location || 'No location details',
          priority: attrs?.priority || 'Normal',
          timestamp: new Date(attrs?.call_time || Date.now()).toISOString()
        };

        return {
          id: incident.id,
          name: incident.type,
          position: [incident.location.lat, incident.location.lng] as [number, number],
          isAmbient: true,
        };
      });
      
      // Remove any nulls that resulted from bad data
      return markers.filter((marker): marker is MapMarker => marker !== null);

    } catch (error) {
      // 4. Resilience: The catch block correctly returns an empty array on fetch failure.
      console.error("Failed to fetch incidents from ArcGIS:", error);
      return [];
    }
  },
};
