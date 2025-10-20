export interface Product {
    id: string;
    name: string;
    price: number;
    category_id: number;
    image_url: string;
    categories: { name: string };
}