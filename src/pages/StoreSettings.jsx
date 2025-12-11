import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { compressLogo } from '../utils/imageCompression';

function StoreSettings() {
  const { user } = useAuth();
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
    whatsapp_number: '',
    whatsapp_message: 'Hola, estoy interesado en sus productos.'
  });

  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    // Al cargar, intentar recuperar desde sessionStorage
    const savedData = sessionStorage.getItem('storeSettingsForm');
    if (savedData) {
      setStoreData(JSON.parse(savedData));
      setLoading(false);
    } else if (user) {
      loadStoreData();
    }
  }, [user]);

  useEffect(() => {
    // Guardar en sessionStorage cada vez que storeData cambie
    if (!loading) { // Asegurarse de no guardar el estado inicial vacío
      sessionStorage.setItem('storeSettingsForm', JSON.stringify(storeData));
    }
  }, [storeData, loading]);

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
        setStoreData(data);
      }
    } catch (error) {
      console.error('Error loading store data:', error);
    } finally {
      setLoading(false);
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
      // Comprimir logo a WebP con calidad premium (90%)
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
    <div className="w-full bg-white p-8 rounded-xl shadow-xl">
      <h2 className="text-3xl font-bold mb-6">Configuración de Tienda</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
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
  );
}

export default StoreSettings;
