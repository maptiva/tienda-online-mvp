import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { categorySchema } from '../schemas/category.schema';
import { safeValidate } from '../utils/zodHelpers';
import type { Category } from '../schemas/category.schema';

export const useShopCategories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const { data: rawCategories, error } = await supabase
                .from('shop_categories')
                .select('*')
                .order('label', { ascending: true });

            if (error) throw error;

            // Validar los datos con Zod
            const validatedCategories: Category[] = [];
            const categoryErrors: string[] = [];

            (rawCategories || []).forEach((rawCategory) => {
                const { data: validatedCategory, error: validationError } = safeValidate(categorySchema, rawCategory);
                if (validationError) {
                    categoryErrors.push(...validationError.issues.map(e => e.message));
                } else if (validatedCategory) {
                    validatedCategories.push(validatedCategory);
                }
            });

            if (categoryErrors.length > 0) {
                console.warn("Validation errors for categories:", categoryErrors);
            }

            setCategories(validatedCategories);
        } catch (err) {
            console.error('Error fetching shop categories:', err);
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return { categories, loading, error, refreshCategories: fetchCategories };
};
