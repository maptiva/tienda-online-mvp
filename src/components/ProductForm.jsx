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
  const { user } = useAuth();
  const [formData, setFormData] = useState({});
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
      initialData[field.name] = field.required ? '' : null;
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

        // Filtrar categorías por user_id del usuario autenticado
        if (user) {
          query = query.eq('user_id', user.id);
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
      const newData = { ...formData, [name]: value };
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

      const dataToSave = productId ? updateData : { ...finalFormData, user_id: user.id };

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
    <div className={styles.formContainer}>
      <div className={styles.productFormBox}>
        <h1>{productId ? 'Editar Producto' : 'Añadir Nuevo Producto'}</h1>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          {formConfig.map((field) => (
            <div key={field.name} className={styles.formGroup}>
              <label htmlFor={field.name}>{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  required={field.required}
                />
              ) : field.type === 'file' ? (
                <>
                  <input
                    type="file"
                    id={field.name}
                    name={field.name}
                    onChange={handleChange}
                    accept="image/*"
                  />
                  {originalImageUrl && !imageFile && (
                    <div className="mt-2 text-sm text-gray-600">
                      Imagen actual: <a href={originalImageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Ver</a>
                    </div>
                  )}

                  {/* Sección de Galería Adicional */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium mb-2">Galería (Máx 4 extra)</label>
                    <input
                      type="file"
                      name="gallery_images"
                      onChange={handleChange}
                      multiple
                      accept="image/*"
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />

                    {/* Grid de Previsualización */}
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {/* Imágenes Existentes */}
                      {existingGalleryImages.map((url, idx) => (
                        <div key={`existing-${idx}`} className="relative group aspect-square">
                          <img src={url} alt="Galeria" className="w-full h-full object-cover rounded shadow-sm" />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(idx, true)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >✕</button>
                        </div>
                      ))}

                      {/* Nuevas Imágenes */}
                      {galleryPreviews.map((url, idx) => (
                        <div key={`new-${idx}`} className="relative group aspect-square">
                          <img src={url} alt="Nueva" className="w-full h-full object-cover rounded shadow-sm border-2 border-green-200" />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(idx, false)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : field.type === 'select' ? (
                <select
                  id={field.name}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  required={field.required}
                >
                  <option value="">Seleccione una categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  required={field.required}
                />
              )}
            </div>
          ))}
          <button type="submit" disabled={loading} className={styles.saveButton}>
            {loading ? 'Guardando...' : 'Guardar Producto'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProductForm;