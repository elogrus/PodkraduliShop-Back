import express from "express";
import { UserService } from "services/UserService";
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
        getResult: UserService.register,
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
        getResult: UserService.updateToken,
        args: [req.cookies.refresh],
        middleware: (result) => {
            res.setHeader(
                "Set-Cookie",
                `refresh=${result?.data?.refresh}; HttpOnly`
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
        getResult: UserService.login,
        args: [name, password],
        middleware: (result) => {
            res.setHeader(
                "Set-Cookie",
                `refresh=${result?.data?.refresh}; HttpOnly`
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

AuthRouter.post("/logout", async function (req, res, next) {
    res.clearCookie("refresh");
    res.statusCode = 200;
    res.send();
});

export { AuthRouter };

