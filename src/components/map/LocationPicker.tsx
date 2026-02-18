import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Locate } from 'lucide-react';
import { Label } from '@/components/ui/label';

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LocationPickerProps {
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  onLocationChange: (lat: number, lng: number, address?: string) => void;
  className?: string;
}

function DraggableMarker({ position, onPositionChange }: { position: [number, number]; onPositionChange: (lat: number, lng: number) => void }) {
  const markerRef = useRef<L.Marker>(null);

  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return (
    <Marker
      draggable
      position={position}
      ref={markerRef}
      eventHandlers={{
        dragend() {
          const marker = markerRef.current;
          if (marker) {
            const pos = marker.getLatLng();
            onPositionChange(pos.lat, pos.lng);
          }
        },
      }}
    />
  );
}

function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

export default function LocationPicker({ latitude, longitude, address, onLocationChange, className }: LocationPickerProps) {
  // Default to Auckland CBD
  const defaultLat = -36.8485;
  const defaultLng = 174.7633;
  
  const [position, setPosition] = useState<[number, number]>([
    latitude || defaultLat,
    longitude || defaultLng,
  ]);
  const [searchQuery, setSearchQuery] = useState(address || '');
  const [isSearching, setIsSearching] = useState(false);
  const [displayAddress, setDisplayAddress] = useState(address || '');

  useEffect(() => {
    if (latitude && longitude) {
      setPosition([latitude, longitude]);
    }
  }, [latitude, longitude]);

  const handlePositionChange = async (lat: number, lng: number) => {
    setPosition([lat, lng]);
    // Reverse geocode
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`);
      const data = await res.json();
      const addr = data.display_name || '';
      setDisplayAddress(addr);
      setSearchQuery(addr);
      onLocationChange(lat, lng, addr);
    } catch {
      onLocationChange(lat, lng);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const query = searchQuery.includes('New Zealand') ? searchQuery : `${searchQuery}, New Zealand`;
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      const results = await res.json();
      if (results.length > 0) {
        const { lat, lon, display_name } = results[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        setPosition([newLat, newLng]);
        setDisplayAddress(display_name);
        onLocationChange(newLat, newLng, display_name);
      }
    } catch (e) {
      console.error('Geocoding error:', e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handlePositionChange(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => console.error('Geolocation error:', err),
        { enableHighAccuracy: true }
      );
    }
  };

  return (
    <div className={className}>
      <Label className="text-sm font-medium mb-2 block">
        <MapPin className="w-4 h-4 inline mr-1" />
        Set Your Location
      </Label>
      <p className="text-xs text-muted-foreground mb-3">
        Search your address or click the map to place your pin. We'll show pet owners an approximate area (~500m), not your exact address.
      </p>
      
      <div className="flex gap-2 mb-3">
        <Input
          placeholder="Search your address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button type="button" size="icon" variant="outline" onClick={handleSearch} disabled={isSearching}>
          <Search className="w-4 h-4" />
        </Button>
        <Button type="button" size="icon" variant="outline" onClick={handleLocateMe} title="Use my location">
          <Locate className="w-4 h-4" />
        </Button>
      </div>

      <div className="rounded-xl overflow-hidden border border-border shadow-sm" style={{ height: '300px' }}>
        <MapContainer
          center={position}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <DraggableMarker position={position} onPositionChange={handlePositionChange} />
          <MapRecenter lat={position[0]} lng={position[1]} />
        </MapContainer>
      </div>

      {displayAddress && (
        <p className="text-xs text-muted-foreground mt-2 truncate">
          📍 {displayAddress}
        </p>
      )}
    </div>
  );
}
