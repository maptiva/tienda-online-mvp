import React from 'react'
import { Categoria } from '../../../interfaces/Categoria'
import { RiPencilLine } from 'react-icons/ri';
import { MdOutlineDelete } from 'react-icons/md';
import Swal from 'sweetalert2';
import { useCategory } from '../../../hooks';
import { supabase } from '../../../services/supabase';
import { useAuth } from '../../../context/AuthContext';

interface Props {
    categoria: Categoria;
    isMobileView?: boolean;
};

export const CategoriaElement = ({ categoria, isMobileView = false }: Props) => {
    const { id, name } = categoria;
    const { startDeleteCategory, startUpdateCategory, categories, startGetCategories } = useCategory();
    const { user, impersonatedUser } = useAuth();

    // Obtener el ID objetivo (usuario real o impersonado)
    const targetId = impersonatedUser?.id || user?.id;

    const handleUpdate = async () => {
        const { isConfirmed, value } = await Swal.fire({
            title: `Modificar Categoria ${name}`,
            text: 'Nuevo Valor',
            input: 'text',
            showCancelButton: true,
            confirmButtonText: 'Aceptar'
        });

        if (isConfirmed) {
            startUpdateCategory({ id: id, name: value })
        }
    }

    // Función para verificar productos en la categoría
    const checkProductsInCategory = async () => {
        const { data, error } = await supabase
            .from('products')
            .select('id, name')
            .eq('category_id', id);

        if (error) return [];
        return data || [];
    }

    // Función para reasignar productos a otra categoría
    const reassignProducts = async (newCategoryId: number | null) => {
        const { error } = await supabase
            .from('products')
            .update({ category_id: newCategoryId })
            .eq('category_id', id);

        if (error) {
            await Swal.fire('Error', 'No se pudieron reasignar los productos', 'error');
            return false;
        }
        return true;
    }

    // Función para eliminar productos de la categoría
    const deleteProductsInCategory = async () => {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('category_id', id);

        if (error) {
            await Swal.fire('Error', 'No se pudieron eliminar los productos', 'error');
            return false;
        }
        return true;
    }

    const handleDelete = async () => {
        // Verificar si hay productos en esta categoría
        const products = await checkProductsInCategory();

        if (products.length > 0) {
            // Obtener otras categorías disponibles (excluyendo la actual)
            const otherCategories = categories.filter(c => c.id !== id);

            // Construir opciones para el select
            const categoryOptions = otherCategories
                .map(c => `<option value="${c.id}">${c.name}</option>`)
                .join('');

            const { isConfirmed, value } = await Swal.fire({
                title: `Eliminar Categoría "${name}"`,
                html: `
                    <p class="text-red-600 font-semibold mb-2">⚠️ Esta categoría tiene <strong>${products.length} producto(s)</strong> asociado(s).</p>
                    <p class="text-gray-600 mb-4">¿Qué deseas hacer con estos productos?</p>
                    <div class="flex flex-col gap-3">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="deleteOption" value="reassign" checked>
                            <span>Reasignar a otra categoría</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="deleteOption" value="delete">
                            <span>Eliminar también los productos</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="deleteOption" value="cancel">
                            <span>Cancelar (no eliminar)</span>
                        </label>
                    </div>
                    ${categoryOptions ? `
                        <div id="categorySelectContainer" class="mt-4" style="max-width: 100%; box-sizing: border-box;">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Seleccionar categoría destino:</label>
                            <select id="categorySelect" style="width: 100%; max-width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; background: white; box-sizing: border-box; overflow: hidden; text-overflow: ellipsis;">
                                <option value="">-- Seleccionar --</option>
                                ${categoryOptions}
                            </select>
                        </div>
                    ` : '<p class="text-yellow-600 mt-2 text-sm">No hay otras categorías disponibles.</p>'}
                `,
                showCancelButton: true,
                confirmButtonText: 'Continuar',
                cancelButtonText: 'Cancelar',
                width: window.innerWidth < 768 ? '95%' : '500px',
                preConfirm: () => {
                    const selectedOption = (document.querySelector('input[name="deleteOption"]:checked') as HTMLInputElement)?.value;
                    const categorySelect = document.getElementById('categorySelect') as HTMLSelectElement | null;
                    const newCategoryId = categorySelect?.value ? parseInt(categorySelect.value) : null;

                    if (selectedOption === 'cancel') {
                        return Swal.fire('Operación cancelada', '', 'info');
                    }

                    if (selectedOption === 'reassign' && categoryOptions && !newCategoryId) {
                        Swal.showValidationMessage('Por favor selecciona una categoría destino');
                        return false;
                    }

                    return { option: selectedOption, newCategoryId };
                }
            });

            if (!isConfirmed || !value || value.option === 'cancel') {
                return; // Cancelado por el usuario
            }

            // Procesar según la opción seleccionada
            if (value.option === 'delete') {
                // Eliminar productos y luego la categoría
                const productsDeleted = await deleteProductsInCategory();
                if (productsDeleted) {
                    await startDeleteCategory(id);
                    await Swal.fire('Eliminado', `La categoría y sus ${products.length} producto(s) han sido eliminados.`, 'success');
                }
            } else if (value.option === 'reassign') {
                // Reasignar productos y luego eliminar la categoría
                const productsReassigned = await reassignProducts(value.newCategoryId);
                if (productsReassigned) {
                    await startDeleteCategory(id);
                    await Swal.fire('Eliminado', `La categoría ha sido eliminada. Los productos fueron reasignados.`, 'success');
                }
            }
        } else {
            // No hay productos, eliminar directamente
            const { isConfirmed } = await Swal.fire({
                title: `Eliminar Categoría "${name}"`,
                text: '¿Estás seguro de que deseas eliminar esta categoría?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Aceptar',
                cancelButtonText: 'Cancelar'
            });

            if (isConfirmed) {
                await startDeleteCategory(id);
            }
        }
    };

    if (isMobileView) {
        return (
            <div className='flex gap-4 items-center justify-end'>
                <button
                    onClick={handleUpdate}
                    className="p-2.5 rounded-full bg-blue-50 text-blue-600 active:bg-blue-100 transition-colors shadow-sm border border-blue-100"
                >
                    <RiPencilLine size={20} />
                </button>
                <button
                    onClick={handleDelete}
                    className="p-2.5 rounded-full bg-red-50 text-red-500 active:bg-red-100 transition-colors shadow-sm border border-red-100"
                >
                    <MdOutlineDelete size={20} />
                </button>
            </div>
        )
    }

    return (
        <tr className='text-center border-b border-gray-200 hover:bg-gray-50 transition-colors'>
            <td className='py-3 text-lg font-mono text-gray-500'>{id}</td>
            <td className='py-3 text-lg font-medium text-gray-800 text-left px-4'>{name}</td>
            <td className='py-3'>
                <div className='flex gap-4 items-center justify-center'>
                    <button className='cursor-pointer text-gray-400 hover:text-blue-600 transition-all duration-300 outline-none' onClick={handleUpdate}>
                        <RiPencilLine size={22} />
                    </button>
                    <button className='cursor-pointer text-red-400 hover:text-red-600 transition-all duration-300 outline-none' onClick={handleDelete}>
                        <MdOutlineDelete size={22} />
                    </button>
                </div>
            </td>
        </tr>
    )
}
