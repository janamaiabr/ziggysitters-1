import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Star } from 'lucide-react';
import SitterVerificationBadge from '@/components/sitter/SitterVerificationBadge';

// Fix leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface SitterMapItem {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  avatar_url?: string | null;
  baseRate: number;
  verified: boolean;
  golden_badge: boolean;
  suburb?: string;
  services: string[];
}

interface SitterMapProps {
  sitters: SitterMapItem[];
  onSitterClick?: (sitterId: string) => void;
  className?: string;
  center?: [number, number];
}

function FitBounds({ sitters }: { sitters: SitterMapItem[] }) {
  const map = useMap();
  useEffect(() => {
    if (sitters.length > 0) {
      const bounds = L.latLngBounds(sitters.map(s => [s.latitude, s.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [sitters, map]);
  return null;
}

export default function SitterMap({ sitters, onSitterClick, className, center }: SitterMapProps) {
  const defaultCenter: [number, number] = center || [-36.8485, 174.7633]; // Auckland
  const sittersWithLocation = sitters.filter(s => s.latitude && s.longitude);

  if (sittersWithLocation.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-xl border border-border ${className}`} style={{ minHeight: '400px' }}>
        <div className="text-center p-8">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No sitters with map locations yet</p>
          <p className="text-sm text-muted-foreground">Sitters are adding their locations — check back soon!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl overflow-hidden border border-border shadow-lg ${className}`} style={{ height: '500px' }}>
      <MapContainer
        center={defaultCenter}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds sitters={sittersWithLocation} />
        
        {sittersWithLocation.map((sitter) => (
          <Circle
            key={sitter.id}
            center={[sitter.latitude, sitter.longitude]}
            radius={500}
            pathOptions={{
              color: sitter.golden_badge ? '#f59e0b' : sitter.verified ? '#22c55e' : '#7c3aed',
              fillColor: sitter.golden_badge ? '#f59e0b' : sitter.verified ? '#22c55e' : '#7c3aed',
              fillOpacity: 0.15,
              weight: 2,
            }}
          >
            <Popup>
              <div className="flex items-center gap-3 min-w-[200px]">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={sitter.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {sitter.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{sitter.name}</p>
                  <p className="text-xs text-muted-foreground">{sitter.suburb}</p>
                  <p className="text-xs font-medium text-primary">${sitter.baseRate}/day</p>
                </div>
              </div>
              <Button
                size="sm"
                className="w-full mt-2 text-xs"
                onClick={() => onSitterClick?.(sitter.id)}
              >
                View Profile
              </Button>
            </Popup>
          </Circle>
        ))}
      </MapContainer>
    </div>
  );
}
