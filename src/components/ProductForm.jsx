import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { formConfig } from '../config/productFormConfig';
import styles from './ProductForm.module.css';

function ProductForm() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [originalImageUrl, setOriginalImageUrl] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const initialData = {};
    formConfig.forEach(field => {
      initialData[field.name] = field.required ? '' : null;
    });
    setFormData(initialData);

    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase.from('categories').select('*');
        if (error) throw error;
        setCategories(data);
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
  }, [productId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image_url' && files && files[0]) {
      setImageFile(files[0]);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let finalFormData = { ...formData };
    let newImageUrl = null;

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, imageFile);

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
    }

    if (productId && newImageUrl && originalImageUrl) {
      const oldImageName = originalImageUrl.split('/').pop();
      if (oldImageName) {
        const { error: removeError } = await supabase.storage
          .from('product-images')
          .remove([oldImageName]);
        if (removeError) {
          console.warn(`No se pudo eliminar la imagen antigua: ${removeError.message}`);
        }
      }
    }

    try {
      const { id, ...updateData } = finalFormData;
      let operation;

      if (productId) {
        operation = supabase.from('products').update(updateData).eq('id', id);
      } else {
        operation = supabase.from('products').insert(finalFormData);
      }

      const { error: dbError } = await operation;
      if (dbError) throw dbError;

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