import React, { useState, useEffect, useRef } from 'react';
import { useStores } from '../hooks/useStores';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaFilter, FaList, FaMap, FaSearch, FaTimes } from 'react-icons/fa';

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

// Mapeo detallado de rubros a colores e iconos
const categoryMeta = {
    'Comida': { color: 'orange', emoji: '🍔', marker: 'orange' },
    'Gastronomía': { color: 'orange', emoji: '🍔', marker: 'orange' },
    'Ropa': { color: 'violet', emoji: '👕', marker: 'violet' },
    'Indumentaria': { color: 'violet', emoji: '👕', marker: 'violet' },
    'Almacén': { color: 'green', emoji: '🛒', marker: 'green' },
    'Supermercado': { color: 'green', emoji: '🛒', marker: 'green' },
    'Veterinaria': { color: 'red', emoji: '🐾', marker: 'red' },
    'Petshop': { color: 'red', emoji: '🐾', marker: 'red' },
    'Juguetería': { color: 'gold', emoji: '🧸', marker: 'gold' },
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
    const [viewMode, setViewMode] = useState('map'); // 'map' or 'list' for mobile
    const [showFilters, setShowFilters] = useState(false);

    // Extraer opciones únicas
    const categories = [...new Set(stores.map(s => s.category).filter(Boolean))].sort();
    const cities = [...new Set(stores.map(s => s.city).filter(Boolean))].sort();

    const filteredStores = stores.filter(store => {
        const matchesSearch = store.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            store.address?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || store.category === selectedCategory;
        const matchesCity = !selectedCity || store.city === selectedCity;
        return matchesSearch && matchesCategory && matchesCity;
    });

    useEffect(() => {
        if (selectedCity && filteredStores.length > 0) {
            const cityStore = filteredStores.find(s => s.city === selectedCity);
            if (cityStore) setSelectedStore(cityStore);
        }
    }, [selectedCity]);

    if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50">Cargando mapa de tiendas...</div>;

    const StoreList = ({ className = "" }) => (
        <div className={`flex flex-col h-full bg-white ${className}`}>
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center sticky top-0 z-10">
                <h2 className="font-bold text-gray-700">{filteredStores.length} Comercios encontrados</h2>
                {viewMode === 'list' && (
                    <button onClick={() => setViewMode('map')} className="md:hidden p-2 text-gray-500">
                        <FaTimes />
                    </button>
                )}
            </div>
            <div className="divide-y overflow-y-auto">
                {filteredStores.map(store => {
                    const meta = categoryMeta[store.category] || categoryMeta['Default'];
                    return (
                        <div
                            key={store.id}
                            className={`p-4 cursor-pointer hover:bg-blue-50 transition-colors ${selectedStore?.id === store.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                            onClick={() => {
                                setSelectedStore(store);
                                if (window.innerWidth < 768) setViewMode('map');
                            }}
                        >
                            <div className="flex items-start gap-4">
                                <img
                                    src={store.logo_url || 'https://via.placeholder.com/60'}
                                    alt={store.store_name}
                                    className="w-14 h-14 rounded-full object-contain border bg-white shadow-sm flex-shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-gray-900 truncate text-base mb-1">{store.store_name}</h3>
                                    <p className="text-xs text-gray-500 truncate mb-2">{store.address}</p>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 flex items-center gap-1 uppercase tracking-tight">
                                            {meta.emoji} {store.category || 'Tienda'}
                                        </span>
                                        <span className="text-[10px] text-blue-600 font-bold uppercase">
                                            {store.city}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {filteredStores.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No se encontraron tiendas con esos filtros.
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-gray-100 font-sans">

            {/* Overlay Filters Modal (Mobile) */}
            {showFilters && (
                <div className="fixed inset-0 z-[1000] bg-black/50 md:hidden flex items-end">
                    <div className="bg-white w-full rounded-t-3xl p-6 animate-slide-up">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Filtrar Comercios</h3>
                            <button onClick={() => setShowFilters(false)} className="p-2 bg-gray-100 rounded-full">
                                <FaTimes className="text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Rubro</label>
                                <select
                                    className="w-full p-4 border rounded-2xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={selectedCategory}
                                    onChange={(e) => {
                                        setSelectedCategory(e.target.value);
                                        setShowFilters(false);
                                    }}
                                >
                                    <option value="">Todos los rubros</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>
                                            {(categoryMeta[cat] || categoryMeta['Default']).emoji} {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Ciudad</label>
                                <select
                                    className="w-full p-4 border rounded-2xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={selectedCity}
                                    onChange={(e) => {
                                        setSelectedCity(e.target.value);
                                        setShowFilters(false);
                                    }}
                                >
                                    <option value="">Todas las ciudades</option>
                                    {cities.map(city => <option key={city} value={city}>{city}</option>)}
                                </select>
                            </div>

                            <button
                                onClick={() => {
                                    setSelectedCategory('');
                                    setSelectedCity('');
                                    setShowFilters(false);
                                }}
                                className="w-full py-4 text-blue-600 font-bold border-2 border-blue-600 rounded-2xl"
                            >
                                Limpiar Filtros
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-[350px] lg:w-[400px] border-r shadow-2xl z-20">
                <div className="p-4 border-b bg-white flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                        <FaArrowLeft />
                    </button>
                    <Link to="/" className="text-2xl font-black text-blue-600 tracking-tighter">CLICANDO</Link>
                </div>

                <div className="p-4 bg-white space-y-3">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar tiendas o rubros..."
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl bg-gray-50 focus:border-blue-500 focus:bg-white outline-none transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <select
                            className="p-2.5 border-2 border-gray-100 rounded-xl text-xs font-bold bg-white outline-none focus:border-blue-500"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">Todos los Rubros</option>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <select
                            className="p-2.5 border-2 border-gray-100 rounded-xl text-xs font-bold bg-white outline-none focus:border-blue-500"
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                        >
                            <option value="">Todas las Ciudades</option>
                            {cities.map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                    </div>
                </div>

                <StoreList />
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 relative h-full">

                {/* Floating Map Controls (Mobile Only) */}
                <div className="absolute top-4 left-4 right-4 z-[999] flex flex-col gap-3 md:hidden">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-white p-3.5 shadow-xl rounded-2xl text-gray-700 border border-gray-100 active:scale-95 transition-transform"
                        >
                            <FaArrowLeft />
                        </button>
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar en Clicando..."
                                className="w-full pl-11 pr-4 py-3.5 bg-white shadow-xl rounded-2xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(true)}
                            className={`p-3.5 shadow-xl rounded-2xl border border-gray-100 transition-all active:scale-95 ${selectedCategory || selectedCity ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                        >
                            <FaFilter />
                        </button>
                    </div>
                </div>

                {/* Bottom-Right Controls (Mobile Only) */}
                <div className="absolute bottom-24 right-4 z-[400] flex flex-col gap-2 md:hidden">
                    <button
                        onClick={() => {
                            if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition((position) => {
                                    const { latitude, longitude } = position.coords;
                                    setSelectedStore({ latitude, longitude, isUserLocation: true });
                                });
                            }
                        }}
                        className="bg-white p-4 shadow-2xl rounded-2xl text-gray-700 border border-gray-100 active:scale-95 transition-transform"
                        title="Mi ubicación"
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle><line x1="12" y1="1" x2="12" y2="4"></line><line x1="12" y1="20" x2="12" y2="23"></line><line x1="1" y1="12" x2="4" y2="12"></line><line x1="20" y1="12" x2="23" y2="12"></line></svg>
                    </button>
                </div>

                {/* Switcher Button (Mobile Only) */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] md:hidden">
                    <button
                        onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
                        className="bg-gray-900 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 font-bold text-sm active:scale-95 transition-transform"
                    >
                        {viewMode === 'map' ? (
                            <><FaList /> Ver Lista</>
                        ) : (
                            <><FaMap /> Ver Mapa</>
                        )}
                    </button>
                </div>

                {/* Mobile Store List View */}
                {viewMode === 'list' && (
                    <div className="absolute inset-0 z-[500] md:hidden bg-white animate-fade-in">
                        <StoreList />
                    </div>
                )}

                {/* The Map itself */}
                <div className="h-full w-full grayscale-[0.1]">
                    <MapContainer
                        center={[-30.75, -57.98]}
                        zoom={13}
                        zoomControl={false}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <div className="leaflet-bottom leaflet-right mb-40 mr-4 hidden md:block">
                            {/* Zoom controls for desktop only, mobile uses gestures and our custom buttons */}
                        </div>
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
                </div>
            </main>

            <style>{`
                @keyframes slide-up {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                
                .leaflet-popup-content-wrapper {
                    border-radius: 16px;
                    padding: 4px;
                }
                .leaflet-popup-tip-container {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default ExploreMap;
