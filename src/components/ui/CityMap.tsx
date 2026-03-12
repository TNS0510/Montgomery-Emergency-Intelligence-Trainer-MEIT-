import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './CityMap.css'; // Import a new CSS file for custom styles

// --- LEAFLET ICON FIXES ---
// Fix for default marker icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom icon for ambient (live) incidents
const ambientIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
// --- END LEAFLET ICON FIXES ---

export interface MapMarker {
  id: string;
  name: string;
  position: [number, number]; // [latitude, longitude]
  isAmbient?: boolean; // Optional flag for styling
}

interface CityMapProps {
  markers: MapMarker[];
  ambientMarkers?: MapMarker[];
  zoom?: number;
  onAcceptIncident?: (id: string) => void; // Prop for the callback
}

const CityMap: React.FC<CityMapProps> = ({ markers, ambientMarkers = [], zoom = 13, onAcceptIncident }) => {
  const mapCenter: [number, number] = [32.3668, -86.3000];

  const handleAccept = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent map click events
    onAcceptIncident?.(id);
  };

  return (
    <MapContainer center={mapCenter} zoom={zoom} style={{ height: '400px', width: '100%', borderRadius: '0.75rem' }}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      {/* Render primary scenario markers (default icon) */}
      {markers.map((marker) => (
        <Marker key={`primary-${marker.id}`} position={marker.position}>
          <Popup>{marker.name}</Popup>
        </Marker>
      ))}

      {/* Render ambient live incident markers (custom blue icon) */}
      {ambientMarkers.map((marker) => (
        <Marker key={`ambient-${marker.id}`} position={marker.position} icon={ambientIcon}>
          <div className="pulsing-dot"></div>
          <Popup>
            <div className="popup-content">
              <strong>Live Incident</strong>
              <p>{marker.name}</p>
              {onAcceptIncident && (
                <button 
                  className="popup-button"
                  onClick={(e) => handleAccept(e, marker.id)}
                >
                  Accept Incident
                </button>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default React.memo(CityMap);
