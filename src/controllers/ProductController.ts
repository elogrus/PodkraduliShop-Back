import express from "express";
import { AuthMiddleware } from "middlewares/AuthMiddleware";
import { ProductService } from "services/ProductService";
import { defaultResponseHandler } from "utils/defaultResponseHandler";
import { z } from "zod";

const ProductRouter = express.Router();
ProductRouter.post("/create", AuthMiddleware, async function (req, res, next) {
    const {
        title,
        description,
        price,
        currency,
        discount,
        attributes,
        imagesURL,
    } = req.body;
    const user = res.locals.user;
    defaultResponseHandler({
        zodSchema: z.object({
            body: z.object({
                title: z.string(),
                description: z.string(),
                price: z.number(),
                currency: z.string(),
                discount: z.number().optional(),
                attributes: z
                    .object({
                        title: z.string(),
                        value: z.union([z.string(), z.number(), z.boolean()]),
                    })
                    .array(),
                imagesURL: z
                    .object({
                        imageURL: z.string(),
                        miniURL: z.string().optional(),
                    })
                    .array(),
            }),
        }),
        getResult: ProductService.createProduct,
        args: [
            user.id,
            title,
            description,
            price,
            currency,
            discount,
            attributes,
            imagesURL,
        ],
        req,
        res,
        next,
    });
});

ProductRouter.get("/selectById/:id", async function (req, res, next) {
    const { id } = req.params;
    console.log(id);
    defaultResponseHandler({
        zodSchema: z.object({
            params: z.object({
                id: z.coerce.number().int(),
            }),
        }),
        getResult: ProductService.selectById,
        args: [id],
        req,
        res,
        next,
    });
});

ProductRouter.get("/selectList", async function (req, res, next) {
    const { start, count } = req.query;
    defaultResponseHandler({
        zodSchema: z.object({
            query: z.object({
                start: z.coerce.number().int(),
                count: z.coerce.number().int(),
            }),
        }),
        getResult: ProductService.selectList,
        args: [Number(start), Number(count)],
        req,
        res,
        next,
    });
});

ProductRouter.put("/update", AuthMiddleware, async function (req, res, next) {
    const {
        id,
        title,
        description,
        price,
        currency,
        discount,
        attributes,
        imagesURL,
    } = req.body;
    const user = res.locals.user;
    defaultResponseHandler({
        zodSchema: z.object({
            body: z.object({
                id: z.number(),
                title: z.string(),
                description: z.string(),
                price: z.number(),
                currency: z.string(),
                discount: z.number().optional(),
                attributes: z
                    .object({
                        title: z.string(),
                        value: z.union([z.string(), z.number(), z.boolean()]),
                    })
                    .array(),
                imagesURL: z
                    .object({
                        imageURL: z.string(),
                        miniURL: z.string().optional(),
                    })
                    .array(),
            }),
        }),
        getResult: ProductService.update,
        args: [
            id,
            user.id,
            title,
            description,
            price,
            currency,
            discount,
            attributes,
            imagesURL,
        ],
        req,
        res,
        next,
    });
});

ProductRouter.post(
    "/deleteById/:id",
    AuthMiddleware,
    async function (req, res, next) {
        const { id } = req.params;

        defaultResponseHandler({
            zodSchema: z.object({
                params: z.object({
                    id: z.number(),
                }),
            }),
            getResult: ProductService.deleteById,
            args: [id],
            req,
            res,
            next,
        });
    }
);

export { ProductRouter };

