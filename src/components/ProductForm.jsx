import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { formConfig } from '../config/productFormConfig';
import styles from './ProductForm.module.css';
import { compressImage } from '../utils/imageCompression';
import { getStoragePath } from '../utils/storageUtils';
import Swal from 'sweetalert2';


function ProductForm() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user, impersonatedUser } = useAuth();
  const [formData, setFormData] = useState({});

  // Determinar el ID objetivo (Usuario impersonado o logueado)
  const targetId = impersonatedUser || user?.id;
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [originalImageUrl, setOriginalImageUrl] = useState(null);
  const [categories, setCategories] = useState([]);

  const STORAGE_KEY = `product-form-draft-${productId || 'new'}`;


  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [existingGalleryImages, setExistingGalleryImages] = useState([]);
  const [galleryImagesToDelete, setGalleryImagesToDelete] = useState([]);

  useEffect(() => {
    // Intentar recuperar datos guardados de localStorage
    const savedData = localStorage.getItem(STORAGE_KEY);

    const initialData = {};
    formConfig.forEach(field => {
      // Si el campo es 'price', empezamos con 0 para evitar errores de tipo numeric
      if (field.name === 'price') {
        initialData[field.name] = 0;
      } else {
        initialData[field.name] = field.required ? '' : null;
      }
    });

    // Si hay datos guardados y no estamos editando, usarlos
    if (savedData && !productId) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData({ ...initialData, ...parsed });
      } catch (e) {
        setFormData(initialData);
      }
    } else {
      setFormData(initialData);
    }

    const fetchCategories = async () => {
      try {
        let query = supabase.from('categories').select('*');

        // Filtrar categorías por el ID objetivo (contempla impersonación)
        if (targetId) {
          query = query.eq('user_id', targetId);
        }

        const { data, error } = await query;
        if (error) throw error;
        setCategories(data || []);
      } catch (err) {
        setError(`Error al cargar categorías: ${err.message}`);
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();

    if (productId) {
      const fetchProduct = async () => {
        try {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', parseInt(productId, 10))
            .single();

          if (error) throw error;
          if (!data) throw new Error('Producto no encontrado');

          setFormData(data);
          setOriginalImageUrl(data.image_url);
          // Cargar galería existente si existe
          if (data.gallery_images && Array.isArray(data.gallery_images)) {
            setExistingGalleryImages(data.gallery_images);
          }
        } catch (err) {
          setError(`Error al cargar el producto: ${err.message}`);
          console.error('Error fetching product:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    } else {
      setLoading(false);
    }
  }, [productId, user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image_url' && files && files[0]) {
      setImageFile(files[0]);
    } else if (name === 'gallery_images' && files) {
      // Manejar selección múltiple
      const newFiles = Array.from(files);
      const totalImages = existingGalleryImages.length + galleryFiles.length + newFiles.length;

      if (totalImages > 4) {
        Swal.fire({
          icon: 'warning',
          title: 'Límite alcanzado',
          text: 'Solo puedes tener hasta 4 imágenes adicionales en la galería.',
          confirmButtonColor: 'var(--color-primary)'
        });
        return;
      }

      setGalleryFiles(prev => [...prev, ...newFiles]);

      // Generar previsualizaciones locales
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setGalleryPreviews(prev => [...prev, ...newPreviews]);

    } else {
      const { type, checked } = e.target;
      let val = type === 'checkbox' ? checked : value;

      let newData = { ...formData, [name]: val };

      // Lógica especial para "Consultar Precio"
      if (name === 'price_on_request') {
        if (checked) {
          // Si activa "Consultar Precio", respaldamos el precio actual
          newData.backup_price = formData.price;
          // Opcional: Podríamos resetear el precio a 0 si quisiéramos, 
          // pero el backup_price ya lo guarda para la restauración.
        } else {
          // Si desactiva, restauramos desde el backup si existe
          if (formData.backup_price !== undefined && formData.backup_price !== null) {
            newData.price = formData.backup_price;
          }
          newData.backup_price = null;
        }
      }

      setFormData(newData);
      if (!productId) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      }
    }
  };

  const removeGalleryImage = (index, isExisting) => {
    if (isExisting) {
      const imageUrl = existingGalleryImages[index];
      setGalleryImagesToDelete(prev => [...prev, imageUrl]);
      setExistingGalleryImages(prev => prev.filter((_, i) => i !== index));
      // Nota: La eliminación física del storage se hará al guardar para evitar errores si cancela
    } else {
      setGalleryFiles(prev => prev.filter((_, i) => i !== index));
      setGalleryPreviews(prev => {
        // Liberar URL objeto
        URL.revokeObjectURL(prev[index]);
        return prev.filter((_, i) => i !== index);
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let finalFormData = { ...formData };

    // Sanitización de campos numéricos para evitar errores de Supabase (PostgreSQL)
    // El tipo 'numeric' en DB no acepta strings vacíos ""
    if (finalFormData.price === '' || finalFormData.price === undefined) {
      finalFormData.price = 0;
    }
    if (finalFormData.backup_price === '' || finalFormData.backup_price === undefined) {
      finalFormData.backup_price = null;
    }

    let newImageUrl = null;
    let newGalleryUrls = [...existingGalleryImages];

    // 1. Subir imagen principal si cambió
    if (imageFile) {
      try {
        const compressedFile = await compressImage(imageFile);
        const fileName = `${Date.now()}-main-${Math.random().toString(36).substring(2, 9)}.webp`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, compressedFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(uploadData.path);

        newImageUrl = publicUrlData.publicUrl;
        finalFormData.image_url = newImageUrl;
      } catch (err) {
        setError(`Error al subir imagen principal: ${err.message}`);
        setLoading(false);
        return;
      }
    }

    // 2. Subir imágenes de galería nuevas
    if (galleryFiles.length > 0) {
      try {
        const uploadPromises = galleryFiles.map(async (file) => {
          const compressedFile = await compressImage(file);
          const fileName = `${Date.now()}-gallery-${Math.random().toString(36).substring(2, 9)}.webp`;
          const { data, error } = await supabase.storage
            .from('product-images')
            .upload(fileName, compressedFile);

          if (error) throw error;

          const { data: publicData } = supabase.storage
            .from('product-images')
            .getPublicUrl(data.path);

          return publicData.publicUrl;
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        newGalleryUrls = [...newGalleryUrls, ...uploadedUrls];

      } catch (err) {
        setError(`Error al subir galería: ${err.message}`);
        setLoading(false);
        return;
      }
    }

    finalFormData.gallery_images = newGalleryUrls;

    // 3. Limpieza de imágenes en Storage
    try {
      // 3a. Limpiar imagen principal antigua si cambió
      if (productId && newImageUrl && originalImageUrl) {
        const oldImagePath = getStoragePath(originalImageUrl, 'product-images');
        if (oldImagePath) {
          console.log('[Storage] Intentando eliminar imagen principal antigua:', oldImagePath);
          const { error: removeError } = await supabase.storage.from('product-images').remove([oldImagePath]);
          if (removeError) console.warn('[Storage] Error al borrar imagen principal antigua:', removeError);
          else console.log('[Storage] Imagen principal antigua eliminada.');
        }
      }

      // 3b. Limpiar imágenes de galería marcadas para borrar
      if (galleryImagesToDelete.length > 0) {
        const pathsToDelete = galleryImagesToDelete
          .map(url => getStoragePath(url, 'product-images'))
          .filter(Boolean);

        if (pathsToDelete.length > 0) {
          console.log('[Storage] Intentando eliminar imágenes de galería:', pathsToDelete);
          const { error: galleryRemoveError } = await supabase.storage.from('product-images').remove(pathsToDelete);
          if (galleryRemoveError) console.warn('[Storage] Error al borrar galería:', galleryRemoveError);
          else console.log('[Storage] Imágenes de galería eliminadas con éxito.');
        }
      }
    } catch (cleanupErr) {
      console.warn('[Storage] Error no crítico durante la limpieza:', cleanupErr);
      // No bloqueamos el flujo principal por errores de limpieza
    }

    try {
      const { id, ...updateData } = finalFormData;
      // Convertir gallery_images a formato PostgreSQL array si es necesario (supabase js suele manejar array js bien)

      const dataToSave = productId ? updateData : { ...finalFormData, user_id: targetId };

      let operation;
      if (productId) {
        operation = supabase.from('products').update(dataToSave).eq('id', id);
      } else {
        operation = supabase.from('products').insert(dataToSave);
      }

      const { error: dbError } = await operation;
      if (dbError) throw dbError;

      localStorage.removeItem(STORAGE_KEY);

      await Swal.fire({
        icon: 'success',
        title: '¡Guardado!',
        text: 'Producto guardado con éxito',
        timer: 2000,
        showConfirmButton: false
      });

      navigate('/admin');
    } catch (err) {
      setError(`Error al guardar: ${err.message}`);
      console.error('Database error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.name) {
    return <div>Cargando formulario...</div>;
  }

  return (
    <div className="w-full flex-1 flex flex-col items-center min-h-0 p-0 overflow-hidden">
      <div className="w-full max-w-2xl flex-1 flex flex-col bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden font-outfit my-2 md:my-4">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 border-b pb-4">{productId ? 'Editar Producto' : 'Añadir Nuevo Producto'}</h1>
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100 font-medium text-center">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {formConfig.map((field) => (
              <div key={field.name} className={styles.formGroup}>
                <label htmlFor={field.name} className="block text-sm font-bold text-gray-700 mb-2">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    required={field.required}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5FAFB8] outline-none transition-all min-h-[100px]"
                  />
                ) : field.type === 'file' ? (
                  <>
                    <input
                      type="file"
                      id={field.name}
                      name={field.name}
                      onChange={handleChange}
                      accept="image/*"
                      className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-[#5FAFB8] file:text-white hover:file:bg-[#4A9BA4] transition-all cursor-pointer"
                    />
                    {originalImageUrl && !imageFile && (
                      <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-200 inline-block">
                        Imagen actual: <a href={originalImageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-bold ml-1">Ver imagen</a>
                      </div>
                    )}

                    {/* Sección de Galería Adicional */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <label className="block text-sm font-bold text-gray-700 mb-3">Galería Adicional (Máx 4)</label>
                      <input
                        type="file"
                        name="gallery_images"
                        onChange={handleChange}
                        multiple
                        accept="image/*"
                        className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-[#5FAFB8] file:text-white hover:file:bg-[#4A9BA4] transition-all cursor-pointer"
                      />

                      {/* Grid de Previsualización */}
                      {(existingGalleryImages.length > 0 || galleryPreviews.length > 0) && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                          {/* Imágenes Existentes */}
                          {existingGalleryImages.map((url, idx) => (
                            <div key={`existing-${idx}`} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                              <img src={url} alt="Galeria" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                              <button
                                type="button"
                                onClick={() => removeGalleryImage(idx, true)}
                                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all shadow-md"
                                title="Eliminar imagen"
                              >✕</button>
                              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">Existente</div>
                            </div>
                          ))}

                          {/* Nuevas Imágenes */}
                          {galleryPreviews.map((url, idx) => (
                            <div key={`new-${idx}`} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-[#5FAFB8] shadow-sm">
                              <img src={url} alt="Nueva" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                              <button
                                type="button"
                                onClick={() => removeGalleryImage(idx, false)}
                                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all shadow-md"
                                title="Eliminar imagen"
                              >✕</button>
                              <div className="absolute bottom-0 left-0 right-0 bg-[#5FAFB8] text-white text-[10px] p-1 text-center font-bold">Nueva</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : field.type === 'select' ? (
                  <div className="relative">
                    <select
                      id={field.name}
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      required={field.required}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5FAFB8] outline-none appearance-none bg-white font-medium text-gray-700"
                    >
                      <option value="">Seleccione una categoría</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                    </div>
                  </div>
                ) : field.type === 'checkbox' ? (
                  <div className="flex items-start gap-3 mt-1 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => {
                    // Hack para permitir click en todo el contenedor
                    const checkbox = document.getElementById(field.name);
                    if (checkbox) checkbox.click();
                  }}>
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        id={field.name}
                        name={field.name}
                        checked={formData[field.name] || false}
                        onChange={handleChange}
                        onClick={(e) => e.stopPropagation()} // Evitar doble evento
                        className="w-5 h-5 text-[#5FAFB8] border-gray-300 rounded focus:ring-[#5FAFB8] cursor-pointer"
                      />
                    </div>
                    <div className="ml-2 text-sm">
                      <label htmlFor={field.name} className="font-bold text-gray-700 cursor-pointer select-none">{field.label}</label>
                      {field.name === 'price_on_request' && (
                        <p className="text-gray-500 text-xs mt-0.5">
                          {formData.price_on_request
                            ? "✅ El precio se ocultará. El cliente verá un botón de 'Consultar Precio'."
                            : "Si activas esto, el precio numérico se ignorará en la tienda."}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <input
                    type={field.type}
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    required={field.name === 'price' && formData.price_on_request ? false : field.required}
                    disabled={field.name === 'price' && formData.price_on_request}
                    placeholder={field.name === 'price' && formData.price_on_request ? "Precio oculto (Consultar Precio activo)" : ""}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#5FAFB8] outline-none transition-all ${field.name === 'price' && formData.price_on_request
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed italic'
                      : 'border-gray-300 font-medium'
                      }`}
                  />
                )}
              </div>
            ))}

            <div className="pt-4 border-t border-gray-100 mt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#5FAFB8] hover:bg-[#4A9BA4] text-white font-bold py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  <>{productId ? '💾 Guardar Cambios' : '✨ Crear Producto'}</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProductForm;