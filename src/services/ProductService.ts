import { db } from "app";
import { LIMIT_GET_PRODUCTS_LIST } from "config/main";
import { ReturnToController } from "types/requestTypes";

export type Product = {
    id: number;
    imageUrl: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    discount: number;
    ownerId: number;
};

enum ProductQueries {
    createProduct = `INSERT INTO products (imageURL,title,description,price,currency,discount,ownerId) VALUES (?, ?, ?, ?, ?, ?, ?);`,
    getProduct = `SELECT * FROM products WHERE id=?;`,
    getProductList = `select * from products limit ?,?;`,
    updateProduct = `UPDATE products SET 
        imageUrl=?,
        title=?,
        description=?,
        price=?,
        currency=?,
        discount=?
        WHERE id=? AND ownerId=?;`,
    deleteProductById = `DELETE FROM products WHERE id=?;`,
    deleteAllProducts = `DELETE FROM products WHERE ownerId=?;`,
}

export class ProductService {
    static createProduct(
        imageURL: string,
        title: string,
        description: string,
        price: number,
        currency: string,
        discount: number,
        ownerId: number
    ): ReturnToController<string> {
        db.prepare(ProductQueries.createProduct).run(
            imageURL,
            title,
            description,
            price,
            currency,
            discount,
            ownerId
        );
        return {
            code: 200,
            data: "Товар был создан",
        };
    }

    static selectById(id: number): ReturnToController<Product> {
        const result = db
            .prepare<number, Product>(ProductQueries.getProduct)
            .get(id);
        if (!result)
            return {
                code: 404,
                error: "Такого товара не существует",
            };

        return {
            code: 200,
            data: result,
        };
    }
    static selectList(start: number, count: number): ReturnToController<Product[]> {
        const result = db
            .prepare<[number, number], Product>(ProductQueries.getProductList)
            .all(start, count);

        if (count > LIMIT_GET_PRODUCTS_LIST)
            return {
                code: 400,
                error: "Слишком много товаров (максимум: 20)",
            };

        return {
            code: 201,
            data: result,
        };
    }
    static update(
        imageURL: string,
        title: string,
        description: string,
        price: number,
        currency: string,
        discount: number,
        id: number,
        ownerId: number
    ): ReturnToController<string> {
        const result = db
            .prepare(ProductQueries.updateProduct)
            .run(
                imageURL,
                title,
                description,
                price,
                currency,
                discount,
                id,
                ownerId
            );
        if (result.changes === 0)
            return {
                code: 404,
                data: "У вас нет товара с таким ID",
            };

        return {
            code: 200,
            data: "Товар был обновлен",
        };
    }
    static deleteById(id: number): ReturnToController<string> {
        const result = db.prepare(ProductQueries.deleteProductById).run(id);
        if (result.changes === 0)
            return {
                code: 404,
                data: "У вас нет товара с таким ID",
            };

        return {
            code: 200,
            data: "Товар был удален",
        };
    }
    static deleteAllByOwnerId(id: number): ReturnToController<string> {
        const result = db.prepare(ProductQueries.deleteAllProducts).run(id);
        return {
            code: 200,
            data: "Все товары пользователя были удалены",
        };
    }
}
