import express from "express";
import { AuthMiddleware } from "middlewares/AuthMiddleware";
import { AuthService } from "services/AuthService";
import { ReturnToController } from "types/requestTypes";
import { defaultResponseHandler } from "utils/defaultResponseHandler";
import { z } from "zod";

const AuthRouter = express.Router();
AuthRouter.post("/register", async function (req, res, next) {
    const { name, password } = req.body;
    defaultResponseHandler<
        { access: string; refresh: string },
        { access: string }
    >({
        zodSchema: z.object({
            body: z.object({
                name: z.string(),
                password: z.string(),
            }),
        }),
        getResult: AuthService.register,
        args: [name, password],
        middleware: (result) => {
            res.setHeader(
                "Set-Cookie",
                `refresh=${result.data?.refresh}; HttpOnly`
            );
            return {
                code: result.code,
                data: {
                    // @ts-expect-error
                    access: result.data.access,
                },
            };
        },
        req,
        res,
        next,
    });
});

AuthRouter.post("/updateToken", async function (req, res, next) {
    defaultResponseHandler<
        { access: string; refresh: string },
        { access: string }
    >({
        getResult: AuthService.updateToken,
        args: [req.cookies.refresh],
        middleware: (result) => {
            res.setHeader(
                "Set-Cookie",
                // @ts-ignore
                `refresh=${result.data.refresh}; HttpOnly`
            );
            // @ts-ignore
            delete result.data.refresh;
            return result;
        },
        req,
        res,
        next,
    });
});

AuthRouter.post(
    "/changePassword",
    AuthMiddleware,
    async function (req, res, next) {
        const { oldPassword, newPassword } = req.body;
        const user = res.locals.user;
        defaultResponseHandler<
            { access: string; refresh: string },
            { access: string }
        >({
            zodSchema: z.object({
                body: z.object({
                    oldPassword: z.string(),
                    newPassword: z.string(),
                }),
            }),
            getResult: AuthService.changePassword,
            args: [user.id, oldPassword, newPassword],
            middleware: (result) => {
                res.setHeader(
                    "Set-Cookie",
                    // @ts-ignore
                    `refresh=${result.data.refresh}; HttpOnly`
                );
                // @ts-ignore
                delete result.data.refresh;
                return result;
            },
            req,
            res,
            next,
        });
    }
);

AuthRouter.post("/changeName", AuthMiddleware, async function (req, res, next) {
    const { newName } = req.body;
    const user = res.locals.user;
    defaultResponseHandler<
        { access: string; refresh: string },
        { access: string }
    >({
        zodSchema: z.object({
            body: z.object({
                newName: z.string(),
            }),
        }),
        getResult: AuthService.changeName,
        args: [user.id, newName],
        middleware: (result) => {
            res.setHeader(
                "Set-Cookie",
                // @ts-ignore
                `refresh=${result.data.refresh}; HttpOnly`
            );
            // @ts-ignore
            delete result.data.refresh;
            return result;
        },
        req,
        res,
        next,
    });
});

AuthRouter.post("/login", async function (req, res, next) {
    const { name, password } = req.body;
    defaultResponseHandler<
        { access: string; refresh: string },
        { access: string }
    >({
        zodSchema: z.object({
            body: z.object({
                name: z.string(),
                password: z.string(),
            }),
        }),
        getResult: AuthService.login,
        args: [name, password],
        middleware: (result) => {
            res.setHeader(
                "Set-Cookie",
                // @ts-ignore
                `refresh=${result.data.refresh}; HttpOnly`
            );
            // @ts-ignore
            delete result.data.refresh;
            return result;
        },
        req,
        res,
        next,
    });
});

AuthRouter.post("/delete", AuthMiddleware, async function (req, res, next) {
    const { password } = req.body;
    const user = res.locals.user;
    defaultResponseHandler({
        zodSchema: z.object({
            body: z.object({
                password: z.string(),
            }),
        }),
        getResult: AuthService.deleteUser,
        args: [user.id, password],
        req,
        res,
        next,
    });
});

export { AuthRouter };
