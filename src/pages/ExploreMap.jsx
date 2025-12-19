import React, { useState, useEffect, useRef } from 'react';
import { useStores } from '../hooks/useStores';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaFilter, FaList, FaMap, FaSearch, FaTimes } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import logoClicandoPng from '../assets/logo-clicando.png';

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

                    {store.is_demo && (
                        <span className="text-[10px] bg-yellow-400 text-black px-2 mt-1 rounded font-bold inline-block">DEMO</span>
                    )}

                    {store.coming_soon ? (
                        <div className="text-gray-400 text-xs font-bold mt-2 py-1 px-3 bg-gray-100 rounded-lg border border-gray-200">
                            PRÓXIMAMENTE
                        </div>
                    ) : (
                        <Link
                            to={`/${store.store_slug}`}
                            className="text-xs font-bold block mt-2 hover:underline"
                            style={{ color: 'var(--color-primary)' }}
                        >
                            Visitar Tienda →
                        </Link>
                    )}
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
    const { theme } = useTheme();
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
    }).sort((a, b) => {
        // Orden solicitado: 1. ACTIVAS, 2. DEMOS, 3. PROXIMAMENTE
        const getWeight = (s) => {
            if (s.coming_soon) return 3;
            if (s.is_demo) return 2;
            return 1; // Activas
        };
        return getWeight(a) - getWeight(b);
    });

    useEffect(() => {
        if (selectedCity && filteredStores.length > 0) {
            const cityStore = filteredStores.find(s => s.city === selectedCity);
            if (cityStore) setSelectedStore(cityStore);
        }
    }, [selectedCity]);

    if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50">Cargando mapa...</div>;

    const StoreList = ({ className = "" }) => (
        <div className={`flex flex-col min-h-0 ${className}`} style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="p-4 border-b flex justify-between items-center sticky top-0 z-10" style={{ backgroundColor: 'var(--color-background-light)', borderBottomColor: 'var(--color-border)' }}>
                <div className="flex flex-col">
                    <h2 className="font-bold text-lg" style={{ color: 'var(--color-text-main)' }}>{filteredStores.length} Comercios</h2>
                    <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-light)' }}>Toca para ver en el mapa</p>
                </div>
                {viewMode === 'list' && (
                    <button
                        onClick={() => setViewMode('map')}
                        className="md:hidden flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-lg active:scale-95 transition-all"
                        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-text)' }}
                    >
                        <FaMap /> Volver
                    </button>
                )}
            </div>
            <div className="flex-1 divide-y overflow-y-auto pb-24">
                {filteredStores.map(store => {
                    const meta = categoryMeta[store.category] || categoryMeta['Default'];
                    return (
                        <div
                            key={store.id}
                            className={`p-4 transition-colors ${store.coming_soon ? 'opacity-60 cursor-default' : 'cursor-pointer'}`}
                            style={{
                                backgroundColor: selectedStore?.id === store.id ? 'var(--color-background-light)' : 'transparent',
                                borderLeft: selectedStore?.id === store.id ? '4px solid var(--color-primary)' : 'none',
                                borderBottom: `1px solid var(--color-border)`
                            }}
                            onClick={() => {
                                if (store.coming_soon) return;
                                setSelectedStore(store);
                                if (window.innerWidth < 768) setViewMode('map');
                            }}
                        >
                            <div className="flex items-start gap-4">
                                <div className="relative">
                                    <img
                                        src={store.logo_url || 'https://via.placeholder.com/60'}
                                        alt={store.store_name}
                                        className="w-14 h-14 rounded-full object-contain border bg-white shadow-sm flex-shrink-0"
                                        style={{ borderColor: 'var(--color-border)' }}
                                    />
                                </div>
                                <div className="min-w-0 flex-1 flex flex-col min-h-[56px] justify-between">
                                    <div>
                                        <h3 className="font-bold truncate text-base leading-tight mb-0.5" style={{ color: 'var(--color-text-main)' }}>{store.store_name}</h3>
                                        <p className="text-xs truncate" style={{ color: 'var(--color-text-light)' }}>{store.address}</p>
                                    </div>
                                    <div className="flex items-end justify-between mt-1">
                                        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 uppercase tracking-tighter truncate"
                                                style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-light)', borderColor: 'var(--color-border)' }}>
                                                {meta.emoji} {store.category || 'Tienda'}
                                            </span>
                                            <span className="text-[10px] font-bold uppercase tracking-tighter truncate" style={{ color: 'var(--color-primary)' }}>
                                                {store.city}
                                            </span>
                                        </div>
                                        <div className="flex gap-1 flex-shrink-0 ml-1">
                                            {store.is_demo && (
                                                <span className="bg-yellow-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">
                                                    DEMO
                                                </span>
                                            )}
                                            {store.coming_soon && (
                                                <span className="bg-red-50 text-red-600 text-[9px] font-black px-1.5 py-0.5 rounded border border-red-100 shadow-sm">
                                                    PRÓXIMAMENTE
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {filteredStores.length === 0 && (
                    <div className="p-12 text-center">
                        <div className="text-4xl mb-4">🔍</div>
                        <p className="font-medium" style={{ color: 'var(--color-text-light)' }}>No encontramos tiendas con esos filtros.</p>
                        <button
                            onClick={() => {
                                setSelectedCategory('');
                                setSelectedCity('');
                                setSearchTerm('');
                            }}
                            className="mt-4 text-sm font-bold underline transition-opacity hover:opacity-80"
                            style={{ color: 'var(--color-primary)' }}
                        >
                            Limpiar todos los filtros
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="h-screen flex flex-col md:flex-row overflow-hidden font-sans" style={{ backgroundColor: 'var(--color-background-light)' }}>

            {/* Overlay Filters Modal (Mobile) */}
            {showFilters && (
                <div className="fixed inset-0 z-[1000] bg-black/50 md:hidden flex items-end">
                    <div className="w-full rounded-t-3xl p-6 animate-slide-up" style={{ backgroundColor: 'var(--color-surface)' }}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-main)' }}>Filtrar Comercios</h3>
                            <button onClick={() => setShowFilters(false)} className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-background-light)', color: 'var(--color-text-light)' }}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-main)' }}>Rubro</label>
                                <select
                                    className="w-full p-4 border-2 rounded-2xl outline-none transition-all focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                    style={{
                                        backgroundColor: 'var(--color-surface)',
                                        borderColor: 'var(--color-border)',
                                        color: 'var(--color-text-main)'
                                    }}
                                    onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
                                    onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
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
                                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-main)' }}>Ciudad</label>
                                <select
                                    className="w-full p-4 border-2 rounded-2xl outline-none transition-all focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                    style={{
                                        backgroundColor: 'var(--color-surface)',
                                        borderColor: 'var(--color-border)',
                                        color: 'var(--color-text-main)'
                                    }}
                                    onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
                                    onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
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
                                className="w-full py-4 font-bold border-2 rounded-2xl transition-opacity hover:opacity-80"
                                style={{
                                    borderColor: 'var(--color-primary)',
                                    color: 'var(--color-primary)'
                                }}
                            >
                                Limpiar Filtros
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-[350px] lg:w-[400px] border-r shadow-2xl z-20" style={{ backgroundColor: 'var(--color-surface)', borderRightColor: 'var(--color-border)' }}>
                <div className="p-4 border-b flex items-center gap-3" style={{ backgroundColor: 'var(--color-surface)', borderBottomColor: 'var(--color-border)' }}>
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors" style={{ color: 'var(--color-text-light)' }}>
                        <FaArrowLeft />
                    </button>
                    <div className="flex items-center gap-2">
                        <img src={logoClicandoPng} alt="Logo" className="w-8 h-8 rounded-lg shadow-sm" />
                        <Link to="/" className="text-2xl font-black tracking-tighter" style={{ color: 'var(--color-primary)' }}>Clicando</Link>
                    </div>
                </div>

                <div className="p-4 space-y-3" style={{ backgroundColor: 'var(--color-surface)' }}>
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-light)' }} />
                        <input
                            type="text"
                            placeholder="Buscar tiendas o rubros..."
                            className="w-full pl-10 pr-4 py-3 border-2 rounded-xl outline-none transition-all text-sm focus:ring-2 focus:ring-[var(--color-primary)]/20"
                            style={{
                                backgroundColor: 'var(--color-surface)',
                                borderColor: 'var(--color-border)',
                                color: 'var(--color-text-main)'
                            }}
                            onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
                            onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <select
                            className="p-2.5 border-2 rounded-xl text-xs font-bold outline-none"
                            style={{
                                backgroundColor: 'var(--color-surface)',
                                borderColor: 'var(--color-border)',
                                color: 'var(--color-text-main)'
                            }}
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">Todos los Rubros</option>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <select
                            className="p-2.5 border-2 rounded-xl text-xs font-bold outline-none"
                            style={{
                                backgroundColor: 'var(--color-surface)',
                                borderColor: 'var(--color-border)',
                                color: 'var(--color-text-main)'
                            }}
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                        >
                            <option value="">Todas las Ciudades</option>
                            {cities.map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                    </div>
                </div>

                <StoreList className="flex-1" />
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 relative h-full">

                {/* Floating Map Controls (Mobile Only) */}
                <div className="absolute top-4 left-4 right-4 z-[999] flex flex-col gap-3 md:hidden">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-3.5 shadow-xl rounded-2xl border active:scale-95 transition-transform"
                            style={{
                                backgroundColor: 'var(--color-surface)',
                                borderColor: 'var(--color-border)',
                                color: 'var(--color-text-main)'
                            }}
                        >
                            <FaArrowLeft />
                        </button>
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-light)' }} />
                            <input
                                type="text"
                                placeholder="Buscar en Clicando..."
                                className="w-full pl-11 pr-4 py-3.5 shadow-xl rounded-2xl border outline-none text-sm font-medium transition-all"
                                style={{
                                    backgroundColor: 'var(--color-surface)',
                                    borderColor: 'var(--color-border)',
                                    color: 'var(--color-text-main)'
                                }}
                                onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
                                onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(true)}
                            className={`p-3.5 shadow-xl rounded-2xl border transition-all active:scale-95`}
                            style={{
                                backgroundColor: selectedCategory || selectedCity ? 'var(--color-primary)' : 'var(--color-surface)',
                                color: selectedCategory || selectedCity ? 'var(--color-primary-text)' : 'var(--color-text-main)',
                                borderColor: 'var(--color-border)'
                            }}
                        >
                            <FaFilter />
                        </button>
                    </div>
                </div>

                {/* Bottom-Right Controls (Mobile Only) - REMOVED, moved near switcher */}

                {/* Switcher & GPS Buttons (Mobile Only) */}
                {!showFilters && (
                    <>
                        {/* GPS Button - Re-positioned to bottom-right for ergonomics */}
                        <div className="absolute bottom-6 right-4 z-[1200] md:hidden">
                            <button
                                onClick={() => {
                                    if (navigator.geolocation) {
                                        navigator.geolocation.getCurrentPosition((position) => {
                                            const { latitude, longitude } = position.coords;
                                            setSelectedStore({ latitude, longitude, isUserLocation: true });
                                        });
                                    }
                                }}
                                className="p-4 rounded-full shadow-2xl active:scale-95 transition-transform border"
                                style={{
                                    backgroundColor: 'var(--color-text-main)',
                                    color: 'var(--color-surface)',
                                    borderColor: 'var(--color-border)'
                                }}
                                title="Mi ubicación"
                            >
                                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle><line x1="12" y1="1" x2="12" y2="4"></line><line x1="12" y1="20" x2="12" y2="23"></line><line x1="1" y1="12" x2="4" y2="12"></line><line x1="20" y1="12" x2="23" y2="12"></line></svg>
                            </button>
                        </div>

                        {/* Switcher Button - Back to bottom-center */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1200] md:hidden">
                            <button
                                onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
                                className="px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 font-bold text-sm active:scale-95 transition-transform"
                                style={{ backgroundColor: 'var(--color-text-main)', color: 'var(--color-surface)' }}
                            >
                                {viewMode === 'map' ? (
                                    <><FaList /> Ver Lista</>
                                ) : (
                                    <><FaMap /> Ver Mapa</>
                                )}
                            </button>
                        </div>
                    </>
                )}

                {/* Mobile Store List View */}
                {viewMode === 'list' && (
                    <div className="absolute inset-0 z-[1100] md:hidden bg-white animate-fade-in">
                        <StoreList className="h-full" />
                    </div>
                )}

                {/* The Map itself */}
                <div className="h-full w-full grayscale-[0.1]">
                    <MapContainer
                        center={[-30.75, -57.98]}
                        zoom={14}
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
                    background: var(--color-surface);
                    color: var(--color-text-main);
                }
                .leaflet-popup-tip {
                    background: var(--color-surface);
                }
            `}</style>
        </div>
    );
};

export default ExploreMap;
