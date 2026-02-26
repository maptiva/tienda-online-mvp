import Swal from "sweetalert2";
import { Categoria } from "../../interfaces/Categoria"
import { supabase } from "../../services/supabase"
import { useCategoryState } from "../../store/useCategoryStore";
import { useAuth } from "../../context/AuthContext";

export const useCategory = () => {
    const { user, impersonatedUser } = useAuth();
    const { categories, categoryActive, getCategories, activeCategory, limpiarCategories, clearCategoryActive, addCategory, deleteCategory, updateCategory } = useCategoryState();

    // Determinar el ID objetivo (Usuario impersonado o logueado)
    const targetId = impersonatedUser?.id || user?.id;

    const limpiarCategoryActive = async () => {
        clearCategoryActive()
    };

    const startActiveCategory = async (id: number) => {
        const category = categories.find(elem => elem.id === id);

        if (category) {
            activeCategory(category)
        }
    };

    const startAddCategory = async (category: Omit<Categoria, 'id'>) => {
        // Agregar user_id al crear categoría (respetando impersonación)
        const categoryWithUser = {
            ...category,
            user_id: targetId
        };

        const { data, error } = await supabase
            .from('categories')
            .insert(categoryWithUser)
            .select()
            .single();

        if (error) return await Swal.fire('Error al cargar la categoria', error.message, 'error');
        addCategory(data)

        return data;
    };


    const startDeleteCategory = async (id: number) => {
        const { data, error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) return await Swal.fire('Error al eliminar categoria', error.message, 'error');

        deleteCategory(id);
    };

    const startGetCategories = async () => {
        if (!targetId) return;

        let query = supabase.from('categories').select();

        // Filtrar por user_id (puede ser el real o el impersonado)
        query = query.eq('user_id', targetId);

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching categories:', error);
            return;
        }

        getCategories(data as Categoria[])
    };


    const startUpdateCategory = async (category: Categoria) => {
        const { data, error } = await supabase
            .from('categories')
            .update(category)
            .eq('id', category.id);

        if (error) return await Swal.fire('Error al modificar la categoria', error.message, 'error');

        updateCategory(category)
    };



    return {
        //atributos
        categories,
        categoryActive,

        //metodos
        limpiarCategoryActive,
        startActiveCategory,
        startAddCategory,
        startDeleteCategory,
        startGetCategories,
        startUpdateCategory
    }
}