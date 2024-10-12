import express from "express";
import { AuthMiddleware } from "middlewares/AuthMiddleware";
import { User } from "services/AuthService";
import { ProductService } from "services/ProductService";
import { RequestWithBody, RequestWithQuery } from "types/requestTypes";
import { defaultResponseHandler } from "utils/defaultResponseHandler";
import { validateVars } from "utils/validations";
import validator from "validator";

export interface ProductCreateBody {
    imageURL: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    discount: number;
    user: User;
}

export interface ProductUpdateBody {
    id: number;
    imageURL: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    discount: number;
    productURL: string;
    user: User;
}

export interface ProductSelectQuery {
    id: string;
}
export interface ProductsSelectQuery {
    start: string;
    count: string;
}
export interface ProductDeleteBody {
    id: number;
}

const ProductRouter = express.Router();
ProductRouter.post(
    "/create",
    AuthMiddleware,
    async function (req: RequestWithBody<ProductCreateBody>, res, next) {
        const {
            imageURL,
            title,
            description,
            price,
            currency,
            discount,
            user,
        } = req.body;
        if (
            !validateVars(
                [
                    imageURL,
                    title,
                    description,
                    price,
                    currency,
                    discount,
                    user.id,
                ],
                [
                    "string",
                    "string",
                    "string",
                    "number",
                    "string",
                    "number",
                    "number",
                ]
            )
        ) {
            res.statusCode = 400;
            res.send("Invalid data");
            return;
        }

        try {
            const result = ProductService.createProduct(
                imageURL,
                title,
                description,
                price,
                currency,
                discount,
                user.id
            );
            res.statusCode = result.code;
            res.send(result.data);
            if (result.code < 400) {
                next();
            }
        } catch (error) {
            console.error(error);
            res.statusCode = 500;
            res.send("Произошла ошибка");
        }
    }
);

ProductRouter.get(
    "/selectById",
    async function (req: RequestWithQuery<ProductSelectQuery>, res, next) {
        const { id } = req.query;

        defaultResponseHandler({
            getResult: ProductService.selectById,
            args: [Number(id)],
            res,
            next,
            validators: [validator.isNumeric(id)],
        });
    }
);

ProductRouter.get(
    "/selectList",
    async function (req: RequestWithQuery<ProductsSelectQuery>, res, next) {
        const { start, count } = req.query;
        defaultResponseHandler({
            getResult: ProductService.selectList,
            args: [Number(start), Number(count)],
            res,
            next,
            validators: [
                validator.isNumeric(start),
                validator.isNumeric(count),
            ],
        });
    }
);

ProductRouter.put(
    "/update",
    AuthMiddleware,
    async function (req: RequestWithBody<ProductUpdateBody>, res, next) {
        const {
            imageURL,
            title,
            description,
            price,
            currency,
            discount,
            id,
            user,
        } = req.body;
        defaultResponseHandler({
            getResult: ProductService.update,
            args: [
                imageURL,
                title,
                description,
                price,
                currency,
                discount,
                id,
                user.id,
            ],
            res,
            next,
            validators: [
                validateVars(
                    [
                        imageURL,
                        title,
                        description,
                        price,
                        currency,
                        discount,
                        id,
                    ],
                    [
                        "string",
                        "string",
                        "string",
                        "number",
                        "string",
                        "number",
                        "number",
                    ]
                ),
            ],
        });
    }
);

ProductRouter.post(
    "/deleteById",
    AuthMiddleware,
    async function (req: RequestWithBody<ProductDeleteBody>, res, next) {
        const { id } = req.body;

        defaultResponseHandler({
            getResult: ProductService.deleteById,
            args: [id],
            res,
            next,
            validators: [validateVars([id], ["number"])],
        });
    }
);

export { ProductRouter };
