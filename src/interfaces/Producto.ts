export interface Product {
    id?: string;
    name: string;
    description: string;
    price: number;
    category_id: number;
    image_url: string;
    img?: string | null
    categories?: { name: string };
}