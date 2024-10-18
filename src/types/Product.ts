export type Product = {
    id: number;
    title: string;
    description: string;
    price: number;
    currency: string;
    discount: number;
    attributes: ProductAttribute[];
    imageCount: number;
};

export interface ProductAttribute {
    title: string;
    value: string | number | boolean;
}
