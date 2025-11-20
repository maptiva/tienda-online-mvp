import Swal from "sweetalert2";
import { Categoria } from "../../interfaces/Categoria"
import { supabase } from "../../services/supabase"
import { useCategoryState } from "../../store/useCategoryStore";
import { useAuth } from "../../context/AuthContext";

export const useCategory = () => {
    const { user } = useAuth();
    const { categories, categoryActive, getCategories, activeCategory, limpiarCategories, clearCategoryActive, addCategory, deleteCategory, updateCategory } = useCategoryState();


    const limpiarCategoryActive = async () => {
        clearCategoryActive()
    };

    const startActiveCategory = async (id) => {
        const category = categories.find(elem => elem.id === id);

        if (category) {
            activeCategory(category)
        }
    };

    const startAddCategory = async (category: Omit<Categoria, 'id'>) => {
        // Agregar user_id al crear categoría
        const categoryWithUser = {
            ...category,
            user_id: user?.id
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
        let query = supabase.from('categories').select();

        // Filtrar por user_id si hay usuario autenticado
        if (user) {
            query = query.eq('user_id', user.id);
        }

        const { data, error } = await query;

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