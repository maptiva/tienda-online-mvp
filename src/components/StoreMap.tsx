import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLng, LeafletMouseEvent } from 'leaflet';

// Fix for default marker icon in react-leaflet
// @ts-ignore
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface DraggableMarkerProps {
    position: [number, number] | LatLng;
    onDragEnd?: (pos: { lat: number; lng: number }) => void;
    storeName?: string;
    address?: string | null;
    draggable?: boolean;
}

// Componente interno para manejar el arrastre del marcador
const DraggableMarker: React.FC<DraggableMarkerProps> = ({ position, onDragEnd, storeName, address, draggable = false }) => {
    const [markerPosition, setMarkerPosition] = useState(position);
    const markerRef = useRef<L.Marker>(null);

    // Actualizar posición interna si cambia la prop
    useEffect(() => {
        setMarkerPosition(position);
    }, [position]);

    const eventHandlers = React.useMemo(() => ({
        dragend() {
            const marker = markerRef.current;
            if (marker != null) {
                const newPos = marker.getLatLng();
                setMarkerPosition(newPos);
                if (onDragEnd) {
                    onDragEnd({ lat: newPos.lat, lng: newPos.lng });
                }
            }
        },
    }), [onDragEnd]);

    return (
        <Marker
            draggable={draggable}
            eventHandlers={eventHandlers}
            position={markerPosition}
            ref={markerRef}
        >
            <Popup>
                <div className="text-center">
                    <p className="font-bold mb-1">{storeName || 'Mi Tienda'}</p>
                    {address && <p className="text-xs text-gray-600 m-0">{address}</p>}
                    {draggable && <p className="text-[10px] text-blue-600 mt-2 font-medium">⚠️ Arrastra para ajustar</p>}
                </div>
            </Popup>
        </Marker>
    );
}

interface StoreMapProps {
    latitude: string | number;
    longitude: string | number;
    storeName?: string;
    address?: string | null;
    draggable?: boolean;
    onPositionChange?: (pos: { lat: number; lng: number }) => void;
}

const StoreMap: React.FC<StoreMapProps> = ({ latitude, longitude, storeName, address, draggable = false, onPositionChange }) => {
    // Validar coordenadas
    const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
    const lng = typeof longitude === 'string' ? parseFloat(longitude) : longitude;

    if (isNaN(lat) || isNaN(lng)) {
        return (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg border border-gray-300">
                <p className="text-gray-500 text-sm p-4 text-center">
                    {draggable ? 'Selecciona una ubicación para ver el mapa' : 'Ubicación no disponible'}
                </p>
            </div>
        );
    }

    // Lógica de restricciones: calcular límites pequeños alrededor del punto
    const boundsOffset = 0.006; 
    const bounds: [number, number][] = [
        [lat - boundsOffset, lng - boundsOffset],
        [lat + boundsOffset, lng + boundsOffset]
    ];

    return (
        <div className="w-full h-full rounded-lg overflow-hidden shadow-sm border border-gray-200 z-0 relative">
            <MapContainer
                center={[lat, lng]}
                zoom={15}
                minZoom={!draggable ? 13 : 1}
                maxBounds={!draggable ? bounds as any : null}
                maxBoundsViscosity={1.0}
                scrollWheelZoom={draggable}
                dragging={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <DraggableMarker
                    position={[lat, lng]}
                    onDragEnd={onPositionChange}
                    storeName={storeName}
                    address={address}
                    draggable={draggable}
                />
            </MapContainer>
        </div>
    );
};

export default StoreMap;
