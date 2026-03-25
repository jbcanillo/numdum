import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue with webpack
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

const MapController = ({ target }) => {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo(target, 15, { duration: 1 });
    }
  }, [target, map]);
  return null;
};

const LocationPicker = ({ onConfirm, onCancel }) => {
  const [position, setPosition] = useState(null);

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const posLL = { lat: latitude, lng: longitude };
        setPosition(posLL);
      },
      (err) => {
        alert('Unable to retrieve your location: ' + err.message);
      }
    );
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
      },
    });
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg overflow-hidden max-w-4xl w-full h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-white">
          <h3 className="text-lg font-medium">Pick Location</h3>
          <div className="space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirm(position)}
              disabled={!position}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              Confirm
            </button>
          </div>
        </div>
        <div className="flex-1 relative">
          <MapContainer center={position || [20, 0]} zoom={position ? undefined : 2} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController target={position} />
            <MapClickHandler />
            {position && <Marker position={position} icon={icon} />}
          </MapContainer>
          <button
            type="button"
            onClick={handleUseGPS}
            className="absolute top-4 right-4 z-[400] bg-white px-3 py-1 rounded shadow text-sm hover:bg-gray-50"
          >
            Use current location
          </button>
        </div>
        {position && (
          <div className="p-2 bg-gray-100 text-sm border-t">
            Lat: {position.lat.toFixed(5)}, Lng: {position.lng.toFixed(5)}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationPicker;
