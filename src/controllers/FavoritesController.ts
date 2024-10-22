import express from "express";
import { AuthMiddleware } from "middlewares/AuthMiddleware";
import { FavoritesService } from "services/FavoritesService";
import { defaultResponseHandler } from "utils/defaultResponseHandler";
import { z } from "zod";

const FavoritesRouter = express.Router();
FavoritesRouter.post(
    "/create",
    AuthMiddleware,
    async function (req, res, next) {
        const { productID } = req.body;
        const user = res.locals.user;
        defaultResponseHandler({
            zodSchema: z.object({
                body: z.object({
                    productID: z.number(),
                }),
            }),
            getResult: FavoritesService.createFavorite,
            args: [productID, user.id],
            req,
            res,
            next,
        });
    }
);

FavoritesRouter.get("/list", AuthMiddleware, async function (req, res, next) {
    const { start, count } = req.query;
    const user = res.locals.user;
    defaultResponseHandler({
        zodSchema: z.object({
            query: z.object({
                start: z.coerce.number().int(),
                count: z.coerce.number().int(),
            }),
        }),
        getResult: FavoritesService.selectList,
        args: [user.id, Number(start), Number(count)],
        req,
        res,
        next,
    });
});

FavoritesRouter.get(
    "/check/:productID",
    AuthMiddleware,
    async function (req, res, next) {
        const { productID } = req.params;
        const user = res.locals.user;
        defaultResponseHandler({
            zodSchema: z.object({
                params: z.object({
                    productID: z.coerce.number().int(),
                }),
            }),
            getResult: FavoritesService.checkFavoriteByProductID,
            args: [user.id, Number(productID)],
            req,
            res,
            next,
        });
    }
);

FavoritesRouter.post(
    "/deleteById/:productID",
    AuthMiddleware,
    async function (req, res, next) {
        const { productID } = req.params;
        const user = res.locals.user;
        defaultResponseHandler({
            zodSchema: z.object({
                params: z.object({
                    productID: z.coerce.number().int(),
                }),
            }),
            getResult: FavoritesService.deleteById,
            args: [user.id, productID],
            req,
            res,
            next,
        });
    }
);

FavoritesRouter.post(
    "/deleteAll",
    AuthMiddleware,
    async function (req, res, next) {
        const user = res.locals.user;
        defaultResponseHandler({
            getResult: FavoritesService.deleteAll,
            args: [user.id],
            req,
            res,
            next,
        });
    }
);

export { FavoritesRouter };
