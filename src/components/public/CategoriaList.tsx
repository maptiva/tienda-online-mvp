import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./CategoriaList.module.css";
import { supabase } from "../../services/supabase";
import { useCategoryState } from "../../store/useCategoryStore";

interface Category {
  id: number;
  name: string;
  description: string | null;
}

interface CategoriaListProps {
  userId: string;
}

const CategoriaList: React.FC<CategoriaListProps> = ({ userId }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const { categoryActive, activeCategory, clearCategoryActive } = useCategoryState();
  const containerRef = useRef<HTMLDivElement>(null);

  // Sincronizar estado inicial desde la URL (Hidratación)
  useEffect(() => {
    if (categories.length > 0) {
      const categoryNameFromUrl = searchParams.get('categoria');
      if (categoryNameFromUrl) {
        const categoryToActivate = categories.find(
          c => c.name.toLowerCase() === categoryNameFromUrl.toLowerCase()
        );
        if (categoryToActivate && (!categoryActive || categoryActive.id !== categoryToActivate.id)) {
          activeCategory(categoryToActivate);
        }
      } else if (categoryActive) {
        // Si no hay parámetro en la URL pero hay categoría activa (y no es por interacción fresca), 
        // podríamos decidir qué hacer. Por ahora respetamos el estado o lo limpiamos.
      }
    }
  }, [categories, searchParams]);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", userId)
        .order("name");

      if (error) {
        console.error("Error al cargar categorías:", error);
      } else {
        setCategories(data || []);
      }
    };

    fetchCategories();
  }, [userId]);

  // Detectar overflow y ajustar alineación dinámicamente
  useEffect(() => {
    const checkOverflow = () => {
      if (!containerRef.current) return;
      const hasOverflow = containerRef.current.scrollWidth > containerRef.current.clientWidth;
      containerRef.current.style.justifyContent = hasOverflow ? 'flex-start' : 'center';
    };

    // Ejecutar después de que se rendericen las categorías
    const timer = setTimeout(checkOverflow, 100);
    checkOverflow();

    window.addEventListener('resize', checkOverflow);
    return () => {
      window.removeEventListener('resize', checkOverflow);
      clearTimeout(timer);
    };
  }, [categories]);

  const handleCategoryClick = (category: Category | null) => {
    // Scroll al inicio de la página al cambiar de categoría
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const newParams = new URLSearchParams(searchParams);

    if (category === null) {
      clearCategoryActive();
      newParams.delete('categoria');
    } else {
      activeCategory(category);
      newParams.set('categoria', category.name);
    }

    setSearchParams(newParams, { replace: true });
  };

  return (
    <nav
      className="sticky z-40 py-1.5 top-[112px]"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: `1px solid var(--color-border)`,
        willChange: 'top'
      }}
    >
      <div
        ref={containerRef}
        className={styles.categoryContainer}
        onMouseDown={(e) => {
          const slider = e.currentTarget;
          const startX = e.pageX - slider.offsetLeft;
          const scrollLeft = slider.scrollLeft;
          let isDown = true;

          const handleMouseMove = (e: MouseEvent) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2;
            slider.scrollLeft = scrollLeft - walk;
          };

          const handleMouseUp = () => {
            isDown = false;
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
          };

          document.addEventListener("mousemove", handleMouseMove);
          document.addEventListener("mouseup", handleMouseUp);
        }}
      >
        {/* Botón "Todos" */}
        <div
          className={`${styles.categoryItem} ${!categoryActive ? styles.active : ""}`}
          onClick={() => handleCategoryClick(null)}
        >
          Todos
        </div>

        {/* Categorías dinámicas */}
        {categories.map((category) => (
          <div
            key={category.id}
            className={`${styles.categoryItem} ${categoryActive?.id === category.id ? styles.active : ""}`}
            onClick={() => handleCategoryClick(category)}
          >
            {category.name}
          </div>
        ))}
      </div>
    </nav>
  );
};

export default CategoriaList;
