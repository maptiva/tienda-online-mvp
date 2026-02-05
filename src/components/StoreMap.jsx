import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet not showing correctly
// This is a known issue with Leaflet and Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Internal component to handle marker dragging
function DraggableMarker({ position, onDragEnd, storeName, address, draggable = false }) {
    const [markerPosition, setMarkerPosition] = useState(position);
    const markerRef = useRef(null);

    // Update internal position if prop changes
    useEffect(() => {
        setMarkerPosition(position);
    }, [position]);

    const eventHandlers = {
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
    };

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

const StoreMap = ({ latitude, longitude, storeName, address, draggable = false, onPositionChange }) => {
    // Validate coordinates
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
        return (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg border border-gray-300">
                <p className="text-gray-500 text-sm p-4 text-center">
                    {draggable ? 'Selecciona una ubicación para ver el mapa' : 'Ubicación no disponible'}
                </p>
            </div>
        );
    }

    // Constraint logic: calculate small bounds around the point to allow enough room for popups
    const boundsOffset = 0.006; // ~600 meters, balanced to prevent losing marker but allow popups
    const bounds = [
        [lat - boundsOffset, lng - boundsOffset],
        [lat + boundsOffset, lng + boundsOffset]
    ];

    return (
        <div className="w-full h-full rounded-lg overflow-hidden shadow-sm border border-gray-200 z-0 relative">
            <MapContainer
                center={[lat, lng]}
                zoom={15}
                minZoom={!draggable ? 13 : 1} // Constraint only if not draggable
                maxBounds={!draggable ? bounds : null} // Constraint only if not draggable
                maxBoundsViscosity={1.0} // Hard limit at the edges
                scrollWheelZoom={draggable}
                dragging={true} // Keep dragging enabled as requested ("que se mueva")
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
