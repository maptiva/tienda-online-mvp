import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { formConfig } from '../config/productFormConfig';
import styles from './ProductForm.module.css';
import { compressImage } from '../utils/imageCompression';
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
  }, [productId, user]); // Agregado user a las dependencias

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image_url' && files && files[0]) {
      setImageFile(files[0]);
    } else {
      const newData = { ...formData, [name]: value };
      setFormData(newData);

      // Auto-guardar en localStorage (solo para productos nuevos)
      if (!productId) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let finalFormData = { ...formData };
    let newImageUrl = null;

    if (imageFile) {
      try {
        // Comprimir imagen a WebP antes de subir
        const compressedFile = await compressImage(imageFile);

        // Usar extensión .webp para el archivo comprimido
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.webp`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, compressedFile);

        if (uploadError) {
          setError(`Error al subir la imagen: ${uploadError.message}`);
          setLoading(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(uploadData.path);

        newImageUrl = publicUrlData.publicUrl;
        finalFormData.image_url = newImageUrl;
      } catch (compressionError) {
        setError(`Error al procesar la imagen: ${compressionError.message}`);
        setLoading(false);
        return;
      }
    }

    if (productId && newImageUrl && originalImageUrl) {
      // Extraer la ruta del archivo desde la URL completa de Supabase
      // Ejemplo: https://xxx.supabase.co/storage/v1/object/public/product-images/1234567890-abc.webp
      // Resultado: 1234567890-abc.webp
      const urlParts = originalImageUrl.split('/product-images/');
      if (urlParts.length > 1) {
        const oldImagePath = urlParts[1];
        const { error: removeError } = await supabase.storage
          .from('product-images')
          .remove([oldImagePath]);
        if (removeError) {
          console.warn(`No se pudo eliminar la imagen antigua: ${removeError.message}`);
        } else {
          console.log(`✅ Imagen antigua eliminada: ${oldImagePath}`);
        }
      }
    }

    try {
      const { id, ...updateData } = finalFormData;

      // Agregar user_id al guardar
      const dataToSave = productId ? updateData : { ...finalFormData, user_id: user.id };

      let operation;

      if (productId) {
        operation = supabase.from('products').update(dataToSave).eq('id', id);
      } else {
        operation = supabase.from('products').insert(dataToSave);
      }

      const { error: dbError } = await operation;
      if (dbError) throw dbError;

      // Limpiar localStorage al guardar exitosamente
      localStorage.removeItem(STORAGE_KEY);

      // Mostrar mensaje de éxito
      await Swal.fire({
        icon: 'success',
        title: '¡Guardado!',
        text: productId ? 'Producto actualizado correctamente' : 'Producto creado correctamente',
        timer: 2000,
        showConfirmButton: false
      });

      navigate('/admin');
    } catch (err) {
      setError(`Error al guardar el producto: ${err.message}`);
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
                  />
                  {originalImageUrl && !imageFile && (
                    <p className={styles.currentImageText}>
                      Imagen actual: <a href={originalImageUrl} target="_blank" rel="noopener noreferrer">Ver Imagen</a>
                    </p>
                  )}
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