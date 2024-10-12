export type Product = {
    id: number;
    title: string;
    description: string;
    price: number;
    currency: string;
    discount: number;
    attributes: ProductAttribute[];
    imagesUrl: ProductImage[];
    ownerId: number;
};

export interface ProductAttribute {
    title: string;
    value: string | number | boolean;
}

export interface ProductImage {
    imageURL: string;
    miniURL?: string;
}