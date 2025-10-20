import Swal from "sweetalert2";
import { Categoria } from "../../interfaces/Categoria"
import { supabase } from "../../services/supabase"
import { useCategoryState } from "../../store/useCategoryStore";

export const useCategory = () => {
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
        const { data, error } = await supabase
            .from('categories')
            .insert(category)
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
        const { data, error } = await supabase
            .from('categories')
            .select()

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