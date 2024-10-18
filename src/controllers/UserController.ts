import { AVATAR_PATH } from "config/main";
import express from "express";
import fs from "fs";
import { AuthMiddleware } from "middlewares/AuthMiddleware";
import path from "path";
import { ImageService } from "services/ImageService";
import { UserService } from "services/UserService";
import { Stream } from "stream";
import { User } from "types/User";
import { defaultResponseHandler } from "utils/defaultResponseHandler";
import { z } from "zod";

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
                `refresh=${result?.data?.refresh}; HttpOnly; SameSite=None; Secure`
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
    "/changeAbout",
    AuthMiddleware,
    async function (req, res, next) {
        const { newAbout } = req.body;
        const user = res.locals.user;
        defaultResponseHandler<
            { access: string; refresh: string },
            { access: string }
        >({
            zodSchema: z.object({
                body: z.object({
                    newAbout: z.string(),
                }),
            }),
            getResult: UserService.changeAbout,
            args: [user.id, newAbout],
            middleware: (result) => {
                res.setHeader(
                    "Set-Cookie",
                    `refresh=${result?.data?.refresh}; HttpOnly; SameSite=None; Secure`
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
                    `refresh=${result?.data?.refresh}; HttpOnly; SameSite=None; Secure`
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

UserRouter.get("/avatar/:type/:userId", async function (req, res, next) {
    const { userId, type } = req.params;
    const zodSchema = z.object({
        params: z.object({
            userId: z.coerce.number().int(),
            type: z.literal("full").or(z.literal("mini")),
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
        const pathToImages = fs.existsSync(AVATAR_PATH + userId)
            ? path.resolve(
                  __dirname,
                  "..",
                  "..",
                  AVATAR_PATH,
                  userId,
                  type + ".png"
              )
            : path.resolve(
                  __dirname,
                  "..",
                  "..",
                  AVATAR_PATH,
                  "default",
                  type + ".png"
              );
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
});

UserRouter.post(
    "/changeAvatar",
    AuthMiddleware,
    async function (req, res, next) {
        if (!req.files) {
            res.statusCode = 400;
            res.send({
                error: "Нет файла",
            });
            return;
        }
        //@ts-ignore
        const file = req.files.avatar as fileUpload.UploadedFile;
        if (!file) {
            res.statusCode = 400;
            res.send({
                error: "Нет файла",
            });
            return;
        }
        //@ts-ignore
        if (file.length > 1) {
            res.statusCode = 400;
            res.send({
                error: "Максимум можно передать только один файл",
            });
            return;
        }

        // isNotPng && isNotJpeg
        if (
            file.data.toString("hex", 0, 4) !== "89504e47" &&
            file.data.toString("hex", 0, 2) !== "ffd8"
        ) {
            res.statusCode = 400;
            res.send({
                error: "Неподдерживаемый формат",
            });
            return;
        }
        const user = res.locals.user;
        try {
            const result = await ImageService.saveAvatar(file, user.id);
            res.statusCode = result.code;
            if (result.error) {
                res.send({
                    error: result.error,
                });
                return;
            }
            res.send({
                data: result.data,
            });
        } catch (error) {
            console.error(error);
            res.statusCode = 500;
            res.send({
                error: "Произошла ошибка",
            });
        }
    }
);

export { UserRouter };

