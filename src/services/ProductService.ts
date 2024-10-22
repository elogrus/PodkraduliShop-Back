import { db } from "app";
import { LIMIT_GET_PRODUCTS_LIST } from "config/main";
import { ProductQueries } from "DbQueries/ProductQueries";
import { Product, ProductAttribute } from "types/Product";
import { ReturnToController } from "types/requestTypes";

export class ProductService {
    static createProduct(
        ownerId: number,
        title: string,
        description: string,
        price: number,
        currency: string,
        discount: number,
        attributes: ProductAttribute[],
        imagesCount: number
    ): ReturnToController<string> {
        db.prepare(ProductQueries.createProduct).run(
            ownerId,
            title,
            description,
            price,
            currency,
            discount,
            JSON.stringify(attributes),
            imagesCount
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
    static selectList(
        start: number,
        count: number
    ): ReturnToController<Product[]> {
        const result = db
            .prepare<[number, number], Product>(ProductQueries.getProductList)
            .all(start, count);

        if (count > LIMIT_GET_PRODUCTS_LIST)
            return {
                code: 400,
                error: `Слишком много товаров (максимум: ${LIMIT_GET_PRODUCTS_LIST})`,
            };

        return {
            code: 201,
            data: result,
        };
    }
    static update(
        id: number,
        ownerID: number,
        title: string,
        description: string,
        price: number,
        currency: string,
        discount: number,
        attributes: ProductAttribute[],
        imagesCount: number
    ): ReturnToController<string> {
        const result = db
            .prepare(ProductQueries.updateProduct)
            .run(
                title,
                description,
                price,
                currency,
                discount,
                JSON.stringify(attributes),
                imagesCount,
                id
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
}
