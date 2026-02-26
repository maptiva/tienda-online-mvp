import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { compressLogo } from '../utils/imageCompression';
import { getStoragePath } from '../utils/storageUtils';
import StoreMap from '../components/StoreMap';
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
    short_description: '',
    latitude: null,
    longitude: null,
    city: '',
    category: '',
    show_map: false,
    discount_settings: {
      enabled: false,
      cash_discount: 0,
      transfer_discount: 0
    }
  });

  const [geocoding, setGeocoding] = useState(false);
  const [showMapPreview, setShowMapPreview] = useState(false);
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    const savedData = sessionStorage.getItem('storeSettingsForm');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      if (parsedData.user_id === user?.id) {
        setStoreData(parsedData);
        setLoading(false);
      } else {
        sessionStorage.removeItem('storeSettingsForm');
        loadStoreData();
      }
    } else if (user) {
      loadStoreData();
    }
  }, [user]);

  useEffect(() => {
    if (!loading && user) {
      const dataToStore = { ...storeData, user_id: user.id };
      sessionStorage.setItem('storeSettingsForm', JSON.stringify(dataToStore));
    }
  }, [storeData, loading, user]);

  const loadStoreData = async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setStoreData({
          ...data,
          latitude: data.latitude ? parseFloat(data.latitude) : null,
          longitude: data.longitude ? parseFloat(data.longitude) : null,
          show_map: data.show_map || false,
          city: data.city || '',
          category: (data.category === 'Veterinaria' || data.category === 'Petshop') ? 'Pet Shop' : (data.category || ''),
          discount_settings: data.discount_settings || { enabled: false, cash_discount: 0, transfer_discount: 0 }
        });
        if (data.latitude && data.longitude) setShowMapPreview(true);
      }
    } catch (error) {
      console.error('Error loading store data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeocode = async () => {
    if (!storeData.address) {
      Swal.fire('Error', 'Ingresa una dirección completa primero', 'warning');
      return;
    }
    setGeocoding(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(storeData.address)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setStoreData(prev => ({ ...prev, latitude: parseFloat(lat), longitude: parseFloat(lon) }));
        setShowMapPreview(true);
        Swal.fire({ icon: 'success', title: '¡Ubicación encontrada!', timer: 1500 });
      } else {
        Swal.fire('No encontrado', 'No pudimos encontrar esa dirección.', 'warning');
      }
    } catch (error) {
      Swal.fire('Error', 'Problema al buscar la dirección', 'error');
    } finally {
      setGeocoding(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStoreData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) setLogoFile(file);
  };

  const uploadLogo = async () => {
    if (!logoFile) return storeData.logo_url;
    try {
      if (storeData.logo_url) {
        const oldPath = getStoragePath(storeData.logo_url, 'store-logos');
        if (oldPath) await supabase.storage.from('store-logos').remove([oldPath]);
      }
      const compressedFile = await compressLogo(logoFile);
      const fileName = `${user.id}/logo-${Date.now()}.webp`;
      const { error } = await supabase.storage.from('store-logos').upload(fileName, compressedFile, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('store-logos').getPublicUrl(fileName);
      return publicUrl;
    } catch (error) {
      throw new Error(`Error al procesar el logo: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const logoUrl = await uploadLogo();
      const dataToSave = { ...storeData, logo_url: logoUrl, user_id: user.id };
      const { data: existingStore } = await supabase.from('stores').select('id').eq('user_id', user.id).single();

      let result;
      if (existingStore) {
        result = await supabase.from('stores').update(dataToSave).eq('user_id', user.id);
      } else {
        result = await supabase.from('stores').insert([dataToSave]);
      }
      if (result.error) throw result.error;
      sessionStorage.removeItem('storeSettingsForm');
      setStoreData(prev => ({ ...prev, logo_url: logoUrl }));
      Swal.fire({ icon: 'success', title: '¡Guardado!', timer: 2000 });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><p className="text-xl">Cargando...</p></div>;

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 bg-white p-0 rounded-xl shadow-xl overflow-hidden">
      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-4 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Configuración de Tienda</h2>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Nombre de la Tienda *</label>
            <input type="text" name="store_name" value={storeData.store_name} onChange={handleInputChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Logo de la Tienda</label>
            <input type="file" accept="image/*" onChange={handleLogoChange} className="w-full p-3 border border-gray-300 rounded-lg" />
            {storeData.logo_url && (
              <div className="mt-3">
                <img src={storeData.logo_url} alt="Logo" className="h-20 object-contain" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex justify-between">
              <span>Slogan / Breve Descripción</span>
              <span className="text-xs text-gray-400">{storeData.short_description?.length || 0}/50</span>
            </label>
            <input type="text" name="short_description" value={storeData.short_description || ''} onChange={handleInputChange} maxLength={50} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Domicilio</label>
            <input type="text" name="address" value={storeData.address} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Ciudad / Localidad</label>
            <input type="text" name="city" value={storeData.city || ''} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Categoría del Comercio</label>
            <select name="category" value={storeData.category || ''} onChange={handleInputChange} disabled={categoriesLoading} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">Selecciona una categoría</option>
              {shopCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
            </select>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold mb-4">📍 Ubicación en Mapa</h3>
            <button type="button" onClick={handleGeocode} className="bg-green-600 text-white px-4 py-2 rounded-lg mb-4">🔍 Buscar por dirección</button>
            {showMapPreview && storeData.latitude && storeData.longitude && (
              <div className="h-[300px] border border-gray-300 rounded-lg overflow-hidden">
                <StoreMap
                  latitude={storeData.latitude}
                  longitude={storeData.longitude}
                  storeName={storeData.store_name}
                  draggable={true}
                  onPositionChange={pos => setStoreData(p => ({ ...p, latitude: pos.lat, longitude: pos.lng }))}
                />
              </div>
            )}
            <div className="flex items-center mt-4">
              <input type="checkbox" id="show_map" checked={storeData.show_map} onChange={e => setStoreData(p => ({ ...p, show_map: e.target.checked }))} className="mr-2" />
              <label htmlFor="show_map">Mostrar mapa en el pie de página</label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Horarios de Atención</label>
            <input type="text" name="business_hours" value={storeData.business_hours} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Número de WhatsApp</label>
            <input type="text" name="whatsapp_number" value={storeData.whatsapp_number} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">URL de Instagram</label>
            <input type="url" name="instagram_url" value={storeData.instagram_url} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg" />
          </div>

          <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400">
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default StoreSettings;
