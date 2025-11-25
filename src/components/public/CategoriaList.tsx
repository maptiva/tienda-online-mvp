import React, { useEffect, useState } from 'react'
import { supabase } from '../../services/supabase';
import { useCategory } from '../../hooks/categoria/useCategory'
import { useCategoryState } from '../../store/useCategoryStore';
import styles from './CategoriaList.module.css';

interface Category {
    id: number;
    name: string;
    user_id: string;
}

const CategoriaList = ({ userId }: { userId: string }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const { categoryActive, limpiarCategoryActive } = useCategory();
    const { activeCategory, getCategories } = useCategoryState();

    useEffect(() => {
        const fetchCategories = async () => {
            if (!userId) return;

            try {
                const { data, error } = await supabase
                    .from('categories')
                    .select('*')
                    .eq('user_id', userId);

                if (error) throw error;
                const fetchedCategories = (data as Category[]) || [];
                setCategories(fetchedCategories);
                // Actualizar el store global para que el filtrado funcione
                getCategories(fetchedCategories);
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        };

        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const activarCategoria = (id: number) => {
        console.log('Activando categoría:', id);
        if (id === 0) {
            limpiarCategoryActive();
            return;
        }

        // Buscar la categoría en el array local
        const category = categories.find(cat => cat.id === id);
        if (category) {
            console.log('Categoría encontrada:', category);
            activeCategory(category);
        }
    };

    return (
        <div className={styles.categoryContainer}>
            <div
                onClick={(e) => activarCategoria(0)}
                key={0}
                className={`${styles.categoryItem} ${!categoryActive ? styles.active : ''}`}
            >
                <h3 className="text-lg font-semibold text-white m-0">Todos</h3>
            </div>
            {
                categories.map(elem => (
                    <div
                        onClick={(e) => activarCategoria(elem.id)}
                        key={elem.id}
                        className={`${styles.categoryItem} ${categoryActive?.id === elem.id ? styles.active : ''}`}
                    >
                        <h3 className="text-lg font-semibold text-white m-0">{elem.name}</h3>
                    </div>
                ))
            }
        </div>
    )
}

export default CategoriaList
