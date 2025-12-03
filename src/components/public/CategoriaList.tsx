import React, { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";
import { useCategory } from "../../hooks/categoria/useCategory";
import { useCategoryState } from "../../store/useCategoryStore";
import styles from "./CategoriaList.module.css";

interface Category {
  id: number;
  name: string;
  user_id: string;
}

const CategoriaList = ({ userId }: { userId: string }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const { categoryActive, limpiarCategoryActive } = useCategory();
  const { activeCategory, getCategories } = useCategoryState();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 150) {
        setIsScrolled(true);
      }

      if (window.scrollY < 50) {
        setIsScrolled(false);
      }
    };

    // Usar requestAnimationFrame para suavizar la detección
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .eq("user_id", userId);

        if (error) throw error;
        const fetchedCategories = (data as Category[]) || [];
        setCategories(fetchedCategories);
        // Actualizar el store global para que el filtrado funcione
        getCategories(fetchedCategories);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const activarCategoria = (id: number) => {
    console.log("Activando categoría:", id);
    if (id === 0) {
      limpiarCategoryActive();
      return;
    }

    // Buscar la categoría en el array local
    const category = categories.find((cat) => cat.id === id);
    if (category) {
      console.log("Categoría encontrada:", category);
      activeCategory(category);
    }
  };

  return (
    <div
      className={`sticky z-40 py-0.5 transition-all duration-300 ${isScrolled ? "top-[72px]" : "top-[72px]"
        }`}
      style={{ willChange: "top" }}
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
            const walk = (x - startX) * 2; // Velocidad del scroll
            slider.scrollLeft = scrollLeft - walk;
          };

          const handleMouseUp = () => {
            isDown = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };

          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
      >
        <div
          onClick={(e) => activarCategoria(0)}
          key={0}
          className={`${styles.categoryItem} ${!categoryActive ? styles.active : ""
            }`}
        >
          <h3 className="text-lg font-semibold text-white m-0">Todos</h3>
        </div>
        {categories.map((elem) => (
          <div
            onClick={(e) => activarCategoria(elem.id)}
            key={elem.id}
            className={`${styles.categoryItem} ${categoryActive?.id === elem.id ? styles.active : ""
              }`}
          >
            <h3 className="text-lg font-semibold text-white m-0">
              {elem.name}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriaList;
