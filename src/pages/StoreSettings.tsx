import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { compressLogo } from '../utils/imageCompression';
import { getStoragePath } from '../utils/storageUtils';
import StoreMap from '../components/StoreMap'; // Import StoreMap component
import { useShopCategories } from '../hooks/useShopCategories';
import QRKit from '../components/dashboard/QRKit'; // Restaurar QRKit

interface StoreData {
  store_name: string;
  logo_url: string;
  address: string;
  business_hours: string;
  contact_phone: string;
  instagram_url: string;
  facebook_url: string;
  tiktok_url: string;
  whatsapp_number: string;
  whatsapp_message: string;
  short_description: string;
  latitude: number | null;
  longitude: number | null;
  city: string;
  category: string;
  show_map: boolean;
  about_text: string;
  store_slug?: string;
  id?: string | number;
}

function StoreSettings() {
  const { user, impersonatedUser } = useAuth() as any;
  const targetId = impersonatedUser?.id || user?.id;
  const { categories: shopCategories, loading: categoriesLoading } = useShopCategories() as any;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [storeData, setStoreData] = useState<StoreData>({
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
    short_description: '',
    latitude: null,
    longitude: null,
    city: '',
    category: '',
    show_map: false,
    about_text: ''
  });

  const [geocoding, setGeocoding] = useState(false);
  const [showMapPreview, setShowMapPreview] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    const savedData = sessionStorage.getItem('storeSettingsForm');

    if (savedData) {
      const parsedData = JSON.parse(savedData);
      if (parsedData.user_id === targetId) {
        setStoreData(parsedData);
        setLoading(false);
      } else {
        sessionStorage.removeItem('storeSettingsForm');
        loadStoreData();
      }
    } else if (targetId) {
      loadStoreData();
    }
  }, [targetId]);

  useEffect(() => {
    if (!loading && targetId) {
      const dataToStore = {
        ...storeData,
        user_id: targetId
      };
      sessionStorage.setItem('storeSettingsForm', JSON.stringify(dataToStore));
    }
  }, [storeData, loading, targetId]);

  const loadStoreData = async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', targetId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setStoreData({
          ...data,
          latitude: data.latitude ? parseFloat(data.latitude) : null,
          longitude: data.longitude ? parseFloat(data.longitude) : null,
          show_map: data.show_map || false,
          city: data.city || '',
          category: (data.category === 'Veterinaria' || data.category === 'Petshop') ? 'Pet Shop' : (data.category || ''),
          about_text: data.about_text || ''
        });

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

  const handleGeocode = async () => {
    if (!storeData.address) {
      Swal.fire('Error', 'Ingresa una dirección completa primero (Calle, Número, Ciudad)', 'warning');
      return;
    }

    setGeocoding(true);
    try {
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
        Swal.fire('No encontrado', 'No pudimos encontrar esa dirección.', 'warning');
      }
    } catch (error) {
      Swal.fire('Error', 'Problema al buscar la dirección', 'error');
    } finally {
      setGeocoding(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStoreData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
    }
  };

  const uploadLogo = async (): Promise<string> => {
    if (!logoFile) return storeData.logo_url;

    try {
      if (storeData.logo_url) {
        const oldPath = getStoragePath(storeData.logo_url, 'store-logos');
        if (oldPath) {
          await supabase.storage.from('store-logos').remove([oldPath]);
        }
      }

      const compressedFile = await compressLogo(logoFile);
      const fileName = `${targetId}/logo-${Date.now()}.webp`;

      const { error } = await supabase.storage
        .from('store-logos')
        .upload(fileName, compressedFile, {
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('store-logos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (compressionError: any) {
      throw new Error(`Error al procesar el logo: ${compressionError.message}`);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const logoUrl = await uploadLogo();

      const dataToSave = {
        ...storeData,
        logo_url: logoUrl,
        user_id: targetId
      };

      const { data: existingStore } = await supabase
        .from('stores')
        .select('id')
        .eq('user_id', targetId)
        .single();

      let result;
      if (existingStore) {
        result = await supabase.from('stores').update(dataToSave).eq('user_id', targetId);
      } else {
        result = await supabase.from('stores').insert([dataToSave]);
      }

      if (result.error) throw result.error;

      sessionStorage.removeItem('storeSettingsForm');
      setStoreData(prev => ({ ...prev, logo_url: logoUrl }));

      Swal.fire({
        icon: 'success',
        title: '¡Guardado!',
        text: 'Configuración de tienda actualizada correctamente',
        timer: 2000
      });

    } catch (error: any) {
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
    <div className="w-full flex-1 flex flex-col min-h-0 bg-white p-0 rounded-xl shadow-xl overflow-hidden border border-gray-100">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
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
          </div>

          {/* Store Story / About Us */}
          <div>
            <label className="block text-sm font-medium mb-2 flex justify-between">
              <span>Historia de la Tienda / Nosotros</span>
              <span className={`text-xs ${(storeData.about_text?.length || 0) >= 600 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                {storeData.about_text?.length || 0}/600
              </span>
            </label>
            <textarea
              name="about_text"
              value={storeData.about_text || ''}
              onChange={handleInputChange}
              rows={4}
              maxLength={600}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 custom-scrollbar"
              placeholder="Contanos sobre tu negocio, tu historia y qué te hace único..."
            />
            <p className="text-xs text-gray-400 mt-1 italic">
              * Este texto aparecerá cuando los clientes hagan clic en el icono de información (i) en tu tienda.
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

          {/* City */}
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
            />
          </div>

          {/* Category */}
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
              {shopCategories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Geolocation Section */}
          <div className="border-t border-gray-200 pt-6">
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
            </div>

            {/* Map Preview */}
            {showMapPreview && storeData.latitude && storeData.longitude && (
              <div className="mb-4">
                <div className="h-[300px] w-full border border-gray-300 rounded-lg overflow-hidden">
                  <StoreMap
                    latitude={storeData.latitude}
                    longitude={storeData.longitude}
                    storeName={storeData.store_name}
                    address={storeData.address}
                    draggable={true}
                    onPositionChange={(newPos: any) => {
                      setStoreData(prev => ({
                        ...prev,
                        latitude: newPos.lat,
                        longitude: newPos.lng
                      }));
                    }}
                  />
                </div>
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

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Teléfono de Contacto
              </label>
              <input
                type="text"
                name="contact_phone"
                value={storeData.contact_phone || ''}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: 11 1234-5678"
              />
            </div>
          </div>

          {/* Social Media */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Instagram
              </label>
              <input
                type="url"
                name="instagram_url"
                value={storeData.instagram_url}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Facebook
              </label>
              <input
                type="url"
                name="facebook_url"
                value={storeData.facebook_url}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                TikTok
              </label>
              <input
                type="url"
                name="tiktok_url"
                value={storeData.tiktok_url}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
              rows={2}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </form>

        {/* QR Diffusion Kit Section */}
        {!loading && storeData.store_name && (
          <div className="mt-8">
            <QRKit
              storeName={storeData.store_name}
              logoUrl={storeData.logo_url}
              storeSlug={storeData.store_slug || String(storeData.id || '')}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default StoreSettings;
