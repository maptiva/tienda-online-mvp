import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { formConfig } from '../config/productFormConfig';
import { Categoria } from '../interfaces/Categoria';
import { useCategories } from '../hooks/categoria/useCategories';
import { useProductById } from '../hooks/useProductById';
import { useForm } from '../hooks';
import { Product } from '../interfaces/Producto';

const initialState: Product = {
  name: '',
  price: 0,
  description: '',
  image_url: '',
  category_id: 0,
  img: null // initial state para img de tipo file
}

function ProductForm() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const { categories } = useCategories();
  const { product, loading } = useProductById(productId);
  const { name, description, price, image_url, category_id, onInputChange, formState, onResetForm } = useForm(product ?? initialState)

  const [formData, setFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState(null);
  const [originalImageUrl, setOriginalImageUrl] = useState(null);

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
    }
  };


  if (loading) {
    return <div>Cargando formulario...</div>;
  };

  return (
    <div className="flex justify-center items-start min-h[calc(100vh - 60px)] p-5 bg-white">
      <div className="bg-white p-7 rounded-lg shadow-2xl w-full max-w[600px]">
        <h1 className='font-black text-2xl'>{productId ? 'Editar Producto' : 'Añadir Nuevo Producto'}</h1>
        {error && <p className="text-red-500 mb-4 font-bold text-center">{error}</p>}

        <form onSubmit={handleSubmit} >
          <div className="flex flex-col mb-4 gap-8">
            <div>
              <label className='font-bold mb-2 text-[#555]' htmlFor='nombre'>Nombre del Producto</label>
              <input className='w-full p-2 border border-[#ddd] text-lg rounded-sm box-border'
                type='text'
                id='name'
                name='name'
                value={name}
                onChange={onInputChange}
                required={true}
              />
            </div>

            <div>
              <label className='font-bold mb-2 text-[#555]' htmlFor='descripcion'>Descripcion del Producto</label>
              <textarea className='w-full p-2 border border-[#ddd] text-lg rounded-sm box-border'
                id='description'
                name='description'
                value={description}
                rows={3}
                onChange={onInputChange}
              />
            </div>

            <div>
              <label className='font-bold mb-2 text-[#555]' htmlFor='importe'>Importe</label>
              <input className='w-full p-2 border border-[#ddd] text-lg rounded-sm box-border'
                type='number'
                id='price'
                name='price'
                value={price}
                onChange={onInputChange}
                required={true}
              />

            </div>


            <div>
              <label className='font-bold mb-2 text-[#555]' htmlFor='category_id'>Categoria</label>
              <select className='border rounded-sm w-full p-2 border-[#ddd] text-lg box-border' id='category_id' name='category_id' value={category_id} onChange={handleChange} >
                <option value="">Seleccione una categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>


          </div>
          <button type="submit" disabled={loading} className="w-full p-3 bg-[#007bff] text-white border-none rounded-sm text-lg cursor-pointer transition-all mt-5 hover:bg-[#0056b3]">
            {loading ? 'Guardando...' : 'Guardar Producto'}
          </button>
        </form>
      </div >
    </div >
  );
}

export default ProductForm;