import { CgLaptop } from "react-icons/cg";
import { supabase } from "../services/supabase";

export const useProductDelete = async (id: string): Promise<Boolean> => {
    let bandera = true;

    try {
        const { data, error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) bandera = false;
    } catch (error) {
        console.log(error);
        bandera = false
    }

    return bandera
};