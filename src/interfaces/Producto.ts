export interface Product {
    id: string;
    sku?: string;
    name: string;
    price: number;
    category_id: number;
    image_url: string;
    categories: { name: string };
    price_on_request?: boolean;
}