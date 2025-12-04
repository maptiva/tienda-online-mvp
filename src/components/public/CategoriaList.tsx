import React, { useEffect, useState, useRef } from "react";
import styles from "./CategoriaList.module.css";
import { supabase } from "../../services/supabase";

interface Category {
  id: number;
  name: string;
  description: string | null;
}

interface CategoriaListProps {
  activeCategory: (category: Category | null) => void;
  selectedCategory: Category | null;
}

const CategoriaList: React.FC<CategoriaListProps> = ({
  activeCategory,
  selectedCategory,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
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
  }, []);

  const handleCategoryClick = (id: number | null) => {
    if (id === null) {
      activeCategory(null);
      return;
    }

    const category = categories.find((cat) => cat.id === id);
    if (category) {
      activeCategory(category);
    }
  };

  return (
    <nav
      className="sticky z-40 py-3 top-[80px]"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: `1px solid var(--color-border)`,
        willChange: 'top'
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
            className={`${styles.categoryItem} ${!selectedCategory ? styles.active : ""}`}
            onClick={() => handleCategoryClick(null)}
          >
            Todos
          </div>

          {/* Categorías dinámicas */}
          {categories.map((category) => (
            <div
              key={category.id}
              className={`${styles.categoryItem} ${selectedCategory?.id === category.id ? styles.active : ""}`}
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.name}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default CategoriaList;
