import { create } from "zustand";
import { Categoria } from "../interfaces/Categoria";

interface CategoryState {
    categories: Categoria[],
    categoryActive: Categoria | null,

    activeCategory: (category: Categoria) => void;
    clearCategoryActive: () => void;
    getCategories: (nuevos: Categoria[]) => void;
    limpiarCategories: () => void;
    addCategory: (category: Categoria) => void;
    deleteCategory: (id: number) => void;
    updateCategory: (category: Categoria) => void;

}

export const useCategoryState = create<CategoryState>((set) => ({

    categories: [],
    categoryActive: null,

    activeCategory: (category) => set({ categoryActive: category }),
    clearCategoryActive: () => set({ categoryActive: null }),
    getCategories: (nuevos) => set({ categories: nuevos }),
    limpiarCategories: () => set({ categories: [] }),
    addCategory: (category) => set((state) => {
        return { categories: [...state.categories, category] }
    }),
    deleteCategory: (id) => set((state) => {
        return {
            categories: state.categories.filter(elem => elem.id !== id)
        }
    }),
    updateCategory: (category) => set((state) => {
        return {
            categories: state.categories.map(elem => {
                if (elem.id === category.id) {
                    return category
                };
                return elem
            })
        }
    })
}));