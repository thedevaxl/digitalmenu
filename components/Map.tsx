import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface MapProps {
  address: string;
}

const Map: React.FC<MapProps> = ({ address }) => {
  const [location, setLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    const fetchCoordinates = async () => {
      if (address) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&addressdetails=1`
          );
          const data = await response.json();
          if (data && data.length > 0) {
            setLocation([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          } else {
            console.error('No results found for the address.');
          }
        } catch (error) {
          console.error('Failed to fetch coordinates:', error);
        }
      }
    };

    fetchCoordinates();
  }, [address]);

  const defaultIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  if (!location) {
    return <div>Loading map...</div>;
  }

  return (
    <MapContainer
      center={location}
      zoom={19} // High zoom level
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={location} icon={defaultIcon}>
        <Popup>{address}</Popup>
      </Marker>
    </MapContainer>
  );
};

export default Map;
