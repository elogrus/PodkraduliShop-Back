import express from "express";
import { AuthMiddleware } from "middlewares/AuthMiddleware";
import path from "path";
import { UserService } from "services/UserService";
import { User } from "types/User";
import { defaultResponseHandler } from "utils/defaultResponseHandler";
import { z } from "zod";
import fs from "fs";
import { Stream } from "stream";

const UserRouter = express.Router();

UserRouter.post("/delete", AuthMiddleware, async function (req, res, next) {
    const { password } = req.body;
    const user = res.locals.user;
    defaultResponseHandler({
        zodSchema: z.object({
            query: z.object({
                password: z.string(),
            }),
        }),
        getResult: UserService.deleteUser,
        args: [user.id, password],
        req,
        res,
        next,
    });
});

UserRouter.post("/changeName", AuthMiddleware, async function (req, res, next) {
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
        getResult: UserService.changeName,
        args: [user.id, newName],
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

UserRouter.post(
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
            getResult: UserService.changePassword,
            args: [user.id, oldPassword, newPassword],
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
    }
);

UserRouter.get("/getUser/:userId", async function (req, res, next) {
    const { userId } = req.params;
    defaultResponseHandler<User, User>({
        zodSchema: z.object({
            params: z.object({
                userId: z.coerce.number().int(),
            }),
        }),
        getResult: UserService.getUser,
        args: [Number(userId)],
        req,
        res,
        next,
    });
});

UserRouter.get("/avatar/:userId", async function (req, res, next) {
    const { userId } = req.params;
    const zodSchema = z.object({
        params: z.object({
            userId: z.coerce.number().int(),
        }),
    });
    try {
        if (zodSchema) {
            const validationResult = zodSchema.safeParse(req);
            if (!validationResult.success) {
                res.statusCode = 422;
                res.send({
                    error: "Invalid data",
                });
            }
        }

        const r = fs.createReadStream(
            path.resolve(__dirname, "..", "..", "assets", "cat.jpg")
        ); // or any other way to get a readable stream
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
});

export { UserRouter };
