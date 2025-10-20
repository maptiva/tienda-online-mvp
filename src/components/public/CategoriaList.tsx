import React, { useEffect } from 'react'
import { useCategory } from '../../hooks/categoria/useCategory'
import styles from './CategoriaList.module.css';

const CategoriaList = () => {

    const { categories, startGetCategories, startActiveCategory, categoryActive, limpiarCategoryActive } = useCategory();

    useEffect(() => {
        startGetCategories();
    }, [])

    const activarCategoria = (id: number) => {
        if (id === 0) {
            return limpiarCategoryActive()
        }
        startActiveCategory(id);
    };

    return (
        <div className={styles.categoryContainer}>
            <div
                onClick={(e) => activarCategoria(0)}
                key={0}
                className={`${styles.categoryItem} ${!categoryActive ? styles.active : ''}`}
            >
                <h3 className="text-lg font-semibold text-slate-800 m-0">Todos</h3>
            </div>
            {
                categories.map(elem => (
                    <div
                        onClick={(e) => activarCategoria(elem.id)}
                        key={elem.id}
                        className={`${styles.categoryItem} ${categoryActive?.id === elem.id ? styles.active : ''}`}
                    >
                        <h3 className="text-lg font-semibold text-slate-800 m-0">{elem.name}</h3>
                    </div>
                ))
            }
        </div>
    )
}

export default CategoriaList