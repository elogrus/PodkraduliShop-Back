import { PRODUCT_IMAGES_PATH } from "config/main";
import express from "express";
import fs from "fs";
import { AuthAdminMiddleware } from "middlewares/AuthMiddleware";
import path from "path";
import { ProductService } from "services/ProductService";
import { Stream } from "stream";
import { defaultResponseHandler } from "utils/defaultResponseHandler";
import { z } from "zod";

const ProductRouter = express.Router();
ProductRouter.post(
    "/create",
    AuthAdminMiddleware,
    async function (req, res, next) {
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
                            value: z.union([
                                z.string(),
                                z.number(),
                                z.boolean(),
                            ]),
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
    }
);

ProductRouter.get("/selectById/:id", async function (req, res, next) {
    const { id } = req.params;
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

ProductRouter.get(
    "/image/:type/:productId/:number",
    async function (req, res, next) {
        const { productId, type, number } = req.params;
        const zodSchema = z.object({
            params: z.object({
                productId: z.coerce.number().int(),
                type: z.literal("full").or(z.literal("mini")),
                number: z.coerce.number().int(),
            }),
        });
        if (zodSchema) {
            const validationResult = zodSchema.safeParse(req);
            if (!validationResult.success) {
                res.statusCode = 422;
                res.send({
                    error: "Invalid data",
                });
                return;
            }
        }
        try {
            const pathToImages = path.resolve(
                __dirname,
                "..",
                "..",
                PRODUCT_IMAGES_PATH,
                productId,
                number + "-" + type + ".png"
            );

            if (!fs.existsSync(pathToImages)) {
                res.statusCode = 404;
                res.send({
                    error: "Такой картинки нет",
                });
                return;
            }

            const r = fs.createReadStream(pathToImages); // or any other way to get a readable stream
            const ps = new Stream.PassThrough(); // <---- this makes a trick with stream error handling
            Stream.pipeline(
                r,
                ps, // <---- this makes a trick with stream error handling
                (err) => {
                    if (err) {
                        console.log(err); // No such file or any other kind of error
                        return res.sendStatus(400);
                    }
                }
            );
            ps.pipe(res); // <---- this makes a trick with stream error handling
        } catch (error) {
            console.error(error);
            res.statusCode = 500;
            res.send({
                error: "Произошла ошибка",
            });
        }
    }
);

ProductRouter.put(
    "/update",
    AuthAdminMiddleware,
    async function (req, res, next) {
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
                            value: z.union([
                                z.string(),
                                z.number(),
                                z.boolean(),
                            ]),
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
    }
);

ProductRouter.post(
    "/deleteById/:id",
    AuthAdminMiddleware,
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
