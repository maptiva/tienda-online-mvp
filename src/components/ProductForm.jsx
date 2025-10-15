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

  useEffect(() => {
    // Inicializar formData con null para campos opcionales y cadenas vacías solo para requeridos
    const initialData = {};
    formConfig.forEach(field => {
      initialData[field.name] = field.required ? '' : null;
    });
    setFormData(initialData);

    if (productId) {
      const fetchProduct = async () => {
        try {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', parseInt(productId, 10))
            .single();
          
          console.log('Datos del producto recibidos de Supabase:', data);

          if (error) {
            setError(`Error al cargar el producto: ${error.message}`);
            console.error('Error fetching product:', error);
            return;
          }

          if (!data) {
            setError('Producto no encontrado');
            console.error('No product found for ID:', productId);
            return;
          }

          // Usar los datos directamente, preservando null para campos opcionales
          setFormData(data);
        } catch (err) {
          setError('Error inesperado al cargar el producto');
          console.error('Unexpected error:', err);
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
      setFormData((prevData) => ({
        ...prevData,
        [name]: value === '' && !formConfig.find(f => f.name === name).required ? null : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let finalFormData = { ...formData };

    // Convertir campos numéricos a números
    formConfig.forEach(field => {
      if (field.type === 'number' && finalFormData[field.name] !== null) {
        const numValue = parseFloat(finalFormData[field.name]);
        finalFormData[field.name] = isNaN(numValue) ? null : numValue;
      }
    });

    // Manejo de la subida de imágenes
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        setError(`Error al subir la imagen: ${uploadError.message}`);
        console.error('Error uploading image:', uploadError);
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      if (publicUrlData && publicUrlData.publicUrl) {
        finalFormData.image_url = publicUrlData.publicUrl;
      } else {
        setError('No se pudo obtener la URL pública de la imagen');
        console.error('No public URL for image');
        setLoading(false);
        return;
      }
    } else if (productId && !formData.image_url && !imageFile) {
      finalFormData.image_url = null;
    }

    try {
      let operation;
      if (productId) {
        // Actualizar producto existente
        const { id, ...updateData } = finalFormData;
        console.log('ID del producto a actualizar:', productId);
        console.log('Datos que se enviarán para actualizar:', updateData);
        console.log('Updating product with ID:', parseInt(productId, 10), 'Data:', updateData);
        operation = await supabase
          .from('products')
          .update(updateData)
          .eq('id', parseInt(productId, 10))
          .select(); // Usar select() para obtener las filas afectadas
      } else {
        // Insertar nuevo producto
        console.log('Inserting new product:', finalFormData);
        operation = await supabase
          .from('products')
          .insert(finalFormData)
          .select();
      }

      const { data, error: dbError } = operation;

      if (dbError) {
        setError(`Error al guardar el producto: ${dbError.message}`);
        console.error('Database error:', dbError);
        setLoading(false);
        return;
      }

      if (productId && (!data || data.length === 0)) {
        setError('No se encontró el producto para actualizar. Verifica el ID.');
        console.error('No rows updated for product ID:', productId);
        setLoading(false);
        return;
      }

      console.log('Operation successful:', data);
      navigate('/admin');
    } catch (err) {
      setError('Error inesperado al guardar el producto');
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
                    required={field.required && !formData.image_url && !imageFile}
                  />
                  {formData.image_url && (
                    <p className={styles.currentImageText}>
                      Imagen actual: <a href={formData.image_url} target="_blank" rel="noopener noreferrer">Ver Imagen</a>
                    </p>
                  )}
                </>
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