import React, { useState } from 'react';
import { useStores } from '../hooks/useStores';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

// Componente para manejar cada marcador individualmente con su popup
const StoreMarker = ({ store, isSelected, onSelect }) => {
    const markerRef = useRef(null);

    useEffect(() => {
        if (isSelected && markerRef.current) {
            markerRef.current.openPopup();
        }
    }, [isSelected]);

    return (
        <Marker
            position={[store.latitude, store.longitude]}
            icon={getCategoryIcon(store.category)}
            ref={markerRef}
            eventHandlers={{
                click: onSelect
            }}
        >
            <Popup>
                <div className="text-center p-1">
                    <img src={store.logo_url} className="h-10 mx-auto mb-2" alt="" />
                    <p className="font-bold">{store.store_name}</p>
                    <Link
                        to={`/${store.store_slug}`}
                        className="text-blue-600 text-xs font-bold block mt-2"
                    >
                        Visitar Tienda →
                    </Link>
                </div>
            </Popup>
        </Marker>
    );
};

// Componente para recentrar el mapa suavemente
const MapRecenter = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.flyTo([lat, lng], 15, { duration: 1.5 });
        }
    }, [lat, lng, map]);
    return null;
};
import Header from '../components/Header'; // Opcional, o un header simplificado

// Mapeo detallado de rubros a colores e iconos
const categoryMeta = {
    'Comida': { color: 'orange', emoji: '🍔', marker: 'orange' },
    'Gastronomía': { color: 'orange', emoji: '🍔', marker: 'orange' },
    'Ropa': { color: 'violet', emoji: '👕', marker: 'violet' },
    'Indumentaria': { color: 'violet', emoji: '👕', marker: 'violet' },
    'Almacén': { color: 'green', emoji: '🛒', marker: 'green' },
    'Supermercado': { color: 'green', emoji: '🛒', marker: 'green' },
    'Bazar': { color: 'yellow', emoji: '🏠', marker: 'yellow' },
    'Hogar': { color: 'yellow', emoji: '🏠', marker: 'yellow' },
    'Servicios': { color: 'blue', emoji: '🛠️', marker: 'blue' },
    'Electrónica': { color: 'blue', emoji: '💻', marker: 'blue' },
    'Default': { color: 'gray', emoji: '🏪', marker: 'blue' }
};

const getCategoryIcon = (category) => {
    const meta = categoryMeta[category] || categoryMeta['Default'];
    const iconUrl = `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${meta.marker}.png`;

    return new L.Icon({
        iconUrl,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
};

const ExploreMap = () => {
    const navigate = useNavigate();
    const { stores, loading, error } = useStores();
    const [selectedStore, setSelectedStore] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

    // Extraer opciones únicas para los filtros dinámicamente
    const categories = [...new Set(stores.map(s => s.category).filter(Boolean))].sort();
    const cities = [...new Set(stores.map(s => s.city).filter(Boolean))].sort();

    const filteredStores = stores.filter(store => {
        const matchesSearch = store.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            store.address?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || store.category === selectedCategory;
        const matchesCity = !selectedCity || store.city === selectedCity;

        return matchesSearch && matchesCategory && matchesCity;
    });

    // Efecto para centrar el mapa cuando se selecciona una ciudad
    useEffect(() => {
        if (selectedCity && filteredStores.length > 0) {
            // Buscamos la primera tienda de esa ciudad para centrar
            const cityStore = filteredStores.find(s => s.city === selectedCity);
            if (cityStore) {
                setSelectedStore(cityStore);
            }
        }
    }, [selectedCity, filteredStores]);

    if (loading) return <div className="h-screen flex items-center justify-center">Cargando mapa de tiendas...</div>;

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
            {/* Header / Search bar superior (Estilo MODO) */}
            <div className="bg-white border-b p-4 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-4 flex-1">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                        title="Volver"
                    >
                        <FaArrowLeft size={18} />
                    </button>
                    <Link to="/" className="text-2xl font-bold text-blue-600 mr-4">Clicando</Link>
                    <div className="relative max-w-sm w-full">
                        <input
                            type="text"
                            placeholder="Buscar tiendas..."
                            className="w-full pl-4 pr-10 py-2 border rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    <select
                        className="p-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="">Rubros (Todos)</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>
                                {(categoryMeta[cat] || categoryMeta['Default']).emoji} {cat}
                            </option>
                        ))}
                    </select>

                    <select
                        className="p-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                    >
                        <option value="">Ciudades (Todas)</option>
                        {cities.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative">

                {/* Sidebar Izquierda (Lista de tiendas) */}
                <aside className="w-full md:w-[350px] lg:w-[400px] bg-white border-r overflow-y-auto z-10 shadow-lg">
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                        <h2 className="font-bold text-gray-700">{filteredStores.length} Comercios encontrados</h2>
                    </div>

                    <div className="divide-y">
                        {filteredStores.map(store => {
                            const meta = categoryMeta[store.category] || categoryMeta['Default'];
                            return (
                                <div
                                    key={store.id}
                                    className={`p-4 cursor-pointer hover:bg-blue-50 transition-colors ${selectedStore?.id === store.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                                    onClick={() => setSelectedStore(store)}
                                >
                                    <div className="flex gap-4">
                                        <div className="relative">
                                            <img
                                                src={store.logo_url || 'https://via.placeholder.com/60'}
                                                alt={store.store_name}
                                                className="w-12 h-12 rounded-full object-contain border bg-white shadow-sm"
                                            />
                                            <span className="absolute -bottom-1 -right-1 bg-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-sm border">
                                                {meta.emoji}
                                            </span>
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-gray-900 truncate">{store.store_name}</h3>
                                            <p className="text-sm text-gray-500 truncate">{store.address}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                                    {meta.emoji} {store.category || 'Tienda'}
                                                </span>
                                                <span className="text-xs text-blue-600 font-medium">
                                                    {store.city}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        <Link
                                            to={`/${store.store_slug}`}
                                            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-blue-700 shadow-sm"
                                        >
                                            Ver Catálogo
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </aside>

                {/* Mapa (Derecha) */}
                <main className="flex-1 relative z-0">
                    <MapContainer
                        center={[-30.75, -57.98]} // Chajarí, Entre Ríos
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {selectedStore && (
                            <MapRecenter lat={selectedStore.latitude} lng={selectedStore.longitude} />
                        )}
                        {filteredStores.map(store => (
                            <StoreMarker
                                key={store.id}
                                store={store}
                                isSelected={selectedStore?.id === store.id}
                                onSelect={() => setSelectedStore(store)}
                            />
                        ))}
                    </MapContainer>
                </main>
            </div>
        </div>
    );
};

export default ExploreMap;
