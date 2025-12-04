import React, { useEffect, useState } from "react";
import styles from "./CategoriaList.module.css";
import { supabase } from "../../services/supabase";
import { useCategoryState } from "../../store/useCategoryStore";

interface Category {
  id: number;
  name: string;
  description: string | null;
}

interface CategoriaListProps {
  userId: string; // ID del dueño de la tienda
}

const CategoriaList: React.FC<CategoriaListProps> = ({ userId }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const { categoryActive, activeCategory, clearCategoryActive } = useCategoryState();

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

  const handleCategoryClick = (category: Category | null) => {
    if (category === null) {
      clearCategoryActive();
    } else {
      activeCategory(category);
    }
  };

  return (
    <nav
      className="sticky z-40 py-1.5 top-[80px]"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: `1px solid var(--color-border)`,
        willChange: 'top'
      }}
    >
      <div
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
