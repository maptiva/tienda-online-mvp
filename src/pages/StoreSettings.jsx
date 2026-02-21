import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { compressLogo } from '../utils/imageCompression';
import { getStoragePath } from '../utils/storageUtils';
import StoreMap from '../components/StoreMap'; // Import StoreMap component
import { useShopCategories } from '../hooks/useShopCategories';

function StoreSettings() {
  const { user } = useAuth();
  const { categories: shopCategories, loading: categoriesLoading } = useShopCategories();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [storeData, setStoreData] = useState({
    store_name: '',
    logo_url: '',
    address: '',
    business_hours: 'Lun-Sab: 9:00 - 20:00',
    contact_phone: '',
    instagram_url: '',
    facebook_url: '',
    tiktok_url: '',
    whatsapp_number: '',
    whatsapp_message: 'Hola, estoy interesado en sus productos.',
    short_description: '', // New field for Carousel
    latitude: null, // New field
    longitude: null, // New field
    city: '', // New field for GIS
    category: '', // New field for GIS
    show_map: false // New field
  });

  const [geocoding, setGeocoding] = useState(false); // State for map search loading
  const [showMapPreview, setShowMapPreview] = useState(false); // State to show/hide map preview

  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    // Al cargar, intentar recuperar desde sessionStorage
    const savedData = sessionStorage.getItem('storeSettingsForm');

    if (savedData) {
      const parsedData = JSON.parse(savedData);

      // Critical Security Check: Ensure the cached data belongs to the current user
      // If user_id is missing in cache or doesn't match, reload from DB
      if (parsedData.user_id === user.id) {
        setStoreData(parsedData);
        setLoading(false);
      } else {
        // Cache mismatch - clear it and load fresh data
        sessionStorage.removeItem('storeSettingsForm');
        loadStoreData();
      }
    } else if (user) {
      loadStoreData();
    }
  }, [user]);

  useEffect(() => {
    // Guardar en sessionStorage cada vez que storeData cambie
    if (!loading) {
      // Include user_id in the stored data for validation
      const dataToStore = {
        ...storeData,
        user_id: user.id
      };
      sessionStorage.setItem('storeSettingsForm', JSON.stringify(dataToStore));
    }
  }, [storeData, loading, user]); // Added user to dependency

  const loadStoreData = async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .single();


      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setStoreData({
          ...data,
          // Ensure numeric types for coordinates and boolean for show_map
          latitude: data.latitude ? parseFloat(data.latitude) : null,
          longitude: data.longitude ? parseFloat(data.longitude) : null,
          show_map: data.show_map || false,
          city: data.city || '',
          category: (data.category === 'Veterinaria' || data.category === 'Petshop') ? 'Pet Shop' : (data.category || '')
        });

        // Show map preview if coordinates exist
        if (data.latitude && data.longitude) {
          setShowMapPreview(true);
        }
      }
    } catch (error) {
      console.error('Error loading store data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to search coordinates from address (Geocoding)
  const handleGeocode = async () => {
    if (!storeData.address) {
      Swal.fire('Error', 'Ingresa una dirección completa primero (Calle, Número, Ciudad)', 'warning');
      return;
    }

    setGeocoding(true);
    try {
      // Use Nominatim API (OpenStreetMap) - Free
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(storeData.address)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setStoreData(prev => ({
          ...prev,
          latitude: parseFloat(lat),
          longitude: parseFloat(lon)
        }));
        setShowMapPreview(true);
        Swal.fire({
          icon: 'success',
          title: '¡Ubicación encontrada!',
          text: 'Verifica el marcador en el mapa',
          timer: 1500
        });
      } else {
        Swal.fire('No encontrado', 'No pudimos encontrar esa dirección. Intenta ser más específico o ingresa Ciudad y País.', 'warning');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      Swal.fire('Error', 'Problema al buscar la dirección', 'error');
    } finally {
      setGeocoding(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStoreData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
    }
  };

  const uploadLogo = async () => {
    if (!logoFile) return storeData.logo_url;

    try {
      // 1. Limpieza del logo antiguo si existe y es diferente al nuevo
      if (storeData.logo_url) {
        const oldPath = getStoragePath(storeData.logo_url, 'store-logos');
        if (oldPath) {
          console.log('[Storage] Intentando eliminar logo antiguo:', oldPath);
          const { error: removeError } = await supabase.storage
            .from('store-logos')
            .remove([oldPath]);

          if (removeError) {
            console.warn('[Storage] No se pudo borrar el logo antiguo (podría no existir):', removeError);
          } else {
            console.log('[Storage] Logo antiguo eliminado con éxito.');
          }
        }
      }

      // 2. Comprimir logo a WebP con calidad premium (90%)
      const compressedFile = await compressLogo(logoFile);

      // Usar extensión .webp para el archivo comprimido
      const fileName = `${user.id}/logo-${Date.now()}.webp`;

      const { data, error } = await supabase.storage
        .from('store-logos')
        .upload(fileName, compressedFile, {
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('store-logos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (compressionError) {
      console.error('Error compressing logo:', compressionError);
      throw new Error(`Error al procesar el logo: ${compressionError.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Upload logo if there's a new file
      const logoUrl = await uploadLogo();

      const dataToSave = {
        ...storeData,
        logo_url: logoUrl,
        user_id: user.id
      };

      // Check if store exists
      const { data: existingStore } = await supabase
        .from('stores')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let result;
      if (existingStore) {
        // Update existing store
        result = await supabase
          .from('stores')
          .update(dataToSave)
          .eq('user_id', user.id);
      } else {
        // Insert new store
        result = await supabase
          .from('stores')
          .insert([dataToSave]);
      }

      if (result.error) throw result.error;

      // Limpiar sessionStorage y actualizar estado local
      sessionStorage.removeItem('storeSettingsForm');
      setStoreData(prev => ({ ...prev, logo_url: logoUrl }));

      Swal.fire({
        icon: 'success',
        title: '¡Guardado!',
        text: 'Configuración de tienda actualizada correctamente',
        timer: 2000
      });

    } catch (error) {
      console.error('Error saving store:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo guardar la configuración'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-xl">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 bg-white p-0 rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-y-auto p-4 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Configuración de Tienda</h2>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* Store Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Nombre de la Tienda *
            </label>
            <input
              type="text"
              name="store_name"
              value={storeData.store_name}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Mi Tienda Online"
            />
            <p className="text-xs text-gray-500 mt-1">
              Este es el nombre que aparecerá en tu tienda (footer, header, etc.)
            </p>
            <p className="text-xs text-blue-600 mt-1">
              ℹ️ La URL de tu tienda se genera automáticamente la primera vez y no cambia aunque modifiques el nombre.
            </p>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Logo de la Tienda
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            {storeData.logo_url && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Logo actual:</p>
                <img
                  src={storeData.logo_url}
                  alt="Logo actual"
                  className="h-20 object-contain"
                />
              </div>
            )}
          </div>

          {/* Short Description (Slogan) */}
          <div>
            <label className="block text-sm font-medium mb-2 flex justify-between">
              <span>Slogan / Breve Descripción</span>
              <span className={`text-xs ${storeData.short_description?.length >= 50 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                {storeData.short_description?.length || 0}/50
              </span>
            </label>
            <input
              type="text"
              name="short_description"
              value={storeData.short_description || ''}
              onChange={handleInputChange}
              maxLength={50}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Los mejores budines caseros de la zona."
            />
            <p className="text-xs text-gray-500 mt-1">
              Esta frase aparecerá en el carrusel de la página principal.
            </p>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Domicilio
            </label>
            <input
              type="text"
              name="address"
              value={storeData.address}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Av. Ejemplo 1234, Ciudad"
            />
          </div>

          {/* City - New Field for GIS */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Ciudad / Localidad
            </label>
            <input
              type="text"
              name="city"
              value={storeData.city || ''}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Buenos Aires"
            />
          </div>

          {/* Category - New Field for GIS */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Categoría del Comercio
            </label>
            <select
              name="category"
              value={storeData.category || ''}
              onChange={handleInputChange}
              disabled={categoriesLoading}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">{categoriesLoading ? 'Cargando rubros...' : 'Selecciona una categoría'}</option>
              {shopCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Geolocation Section */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">📍 Ubicación en Mapa</h3>

            <div className="mb-4">
              <button
                type="button"
                onClick={handleGeocode}
                disabled={geocoding || !storeData.address}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
              >
                {geocoding ? 'Buscando...' : '🔍 Buscar ubicación por dirección'}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Ingresa tu domicilio arriba y pulsa este botón para ubicarte automáticamente.
              </p>
            </div>

            {/* Map Preview */}
            {showMapPreview && storeData.latitude && storeData.longitude && (
              <div className="mb-4 animate-fade-in">
                <p className="text-sm font-medium mb-2">Vista previa del mapa:</p>
                <div className="h-[300px] w-full border border-gray-300 rounded-lg overflow-hidden">
                  <StoreMap
                    latitude={storeData.latitude}
                    longitude={storeData.longitude}
                    storeName={storeData.store_name}
                    address={storeData.address}
                    draggable={true} // Allow dragging in settings
                    onPositionChange={(newPos) => {
                      setStoreData(prev => ({
                        ...prev,
                        latitude: newPos.lat,
                        longitude: newPos.lng
                      }));
                    }}
                  />
                </div>
                <p className="text-xs text-blue-600 mt-1 font-medium">
                  💡 Tip: Puedes arrastrar el marcador rojo para corregir la ubicación exacta.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Lat: {storeData.latitude.toFixed(6)}, Lng: {storeData.longitude.toFixed(6)}
                </p>
              </div>
            )}

            {/* Show Map Toggle */}
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="show_map"
                name="show_map"
                checked={storeData.show_map || false}
                onChange={(e) => setStoreData(prev => ({ ...prev, show_map: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="show_map" className="ml-2 block text-sm text-gray-900 cursor-pointer select-none">
                Mostrar el mapa de ubicación en el pie de página de mi tienda
              </label>
            </div>
          </div>

          {/* Business Hours */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Horarios de Atención
            </label>
            <input
              type="text"
              name="business_hours"
              value={storeData.business_hours}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Lun-Sab: 9:00 - 20:00"
            />
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Teléfono de Contacto
            </label>
            <input
              type="text"
              name="contact_phone"
              value={storeData.contact_phone}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="+54 9 11 1234-5678"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Número de WhatsApp
            </label>
            <input
              type="text"
              name="whatsapp_number"
              value={storeData.whatsapp_number}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="5491112345678"
            />
            <p className="text-xs text-gray-500 mt-1">
              Formato: código de país + código de área + número (sin espacios ni guiones)
            </p>
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-sm font-medium mb-2">
              URL de Instagram
            </label>
            <input
              type="url"
              name="instagram_url"
              value={storeData.instagram_url}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://instagram.com/mitienda"
            />
          </div>

          {/* Facebook */}
          <div>
            <label className="block text-sm font-medium mb-2">
              URL de Facebook
            </label>
            <input
              type="url"
              name="facebook_url"
              value={storeData.facebook_url}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://facebook.com/mitienda"
            />
          </div>

          {/* TikTok */}
          <div>
            <label className="block text-sm font-medium mb-2">
              URL de TikTok
            </label>
            <input
              type="url"
              name="tiktok_url"
              value={storeData.tiktok_url}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://www.tiktok.com/@mitienda"
            />
          </div>

          {/* WhatsApp Message */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Mensaje de WhatsApp
            </label>
            <textarea
              name="whatsapp_message"
              value={storeData.whatsapp_message}
              onChange={handleInputChange}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Hola, estoy interesado en sus productos."
            />
            <p className="text-xs text-gray-500 mt-1">
              Este mensaje aparecerá cuando los clientes hagan clic en el botón flotante de WhatsApp
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StoreSettings;
