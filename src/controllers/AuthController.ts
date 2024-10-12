import express from "express";
import { AuthMiddleware } from "middlewares/AuthMiddleware";
import { AuthService, User } from "services/AuthService";
import { RequestWithBody } from "types/requestTypes";
import { defaultResponseHandler } from "utils/defaultResponseHandler";
import { validateVars } from "utils/validations";

export interface UserCreateBody {
    name: string;
    password: string;
}
export interface UserLoginBody {
    name: string;
    password: string;
}

export interface UserDeleteBody {
    user: User;
    password: string;
}

export interface UserChangePasswordBody {
    user: User;
    oldPassword: string;
    newPassword: string;
}
export interface UserChangeNameBody {
    user: User;
}

const AuthRouter = express.Router();
AuthRouter.post(
    "/register",
    async function (req: RequestWithBody<UserCreateBody>, res, next) {
        const { name, password } = req.body;
        defaultResponseHandler<
            { access: string; refresh: string },
            { access: string }
        >({
            getResult: AuthService.register,
            args: [name, password],
            middleware: (result) => {
                res.setHeader(
                    "Set-Cookie",
                    `refresh=${result.data.refresh}; HttpOnly`
                );
                delete result.data.refresh;
                return result;
            },
            res,
            next,
            validators: [validateVars([name, password], ["string", "string"])],
        });
    }
);

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
                `refresh=${result.data.refresh}; HttpOnly`
            );
            delete result.data.refresh;
            return result;
        },
        res,
        next,
    });
});

AuthRouter.post(
    "/changePassword",
    AuthMiddleware,
    async function (req: RequestWithBody<UserChangePasswordBody>, res, next) {
        const { user, oldPassword, newPassword } = req.body;
        defaultResponseHandler<
            { access: string; refresh: string },
            { access: string }
        >({
            getResult: AuthService.changePassword,
            args: [user.id, oldPassword, newPassword],
            middleware: (result) => {
                res.setHeader(
                    "Set-Cookie",
                    `refresh=${result.data.refresh}; HttpOnly`
                );
                delete result.data.refresh;
                return result;
            },
            res,
            next,
            validators: [
                validateVars(
                    [user.id, oldPassword, newPassword],
                    ["number", "string", "string"]
                ),
            ],
        });
    }
);

AuthRouter.post(
    "/changeName",
    AuthMiddleware,
    async function (req: RequestWithBody<UserChangeNameBody>, res, next) {
        const { user } = req.body;
        defaultResponseHandler<
            { access: string; refresh: string },
            { access: string }
        >({
            getResult: AuthService.changeName,
            args: [user.id, user.name],
            middleware: (result) => {
                res.setHeader(
                    "Set-Cookie",
                    `refresh=${result.data.refresh}; HttpOnly`
                );
                delete result.data.refresh;
                return result;
            },
            res,
            next,
            validators: [
                validateVars([user.id, user.name], ["number", "string"]),
            ],
        });
    }
);

AuthRouter.post(
    "/login",
    async function (req: RequestWithBody<UserLoginBody>, res, next) {
        const { name, password } = req.body;
        defaultResponseHandler<
            { access: string; refresh: string },
            { access: string }
        >({
            getResult: AuthService.login,
            args: [name, password],
            middleware: (result) => {
                res.setHeader(
                    "Set-Cookie",
                    `refresh=${result.data.refresh}; HttpOnly`
                );
                delete result.data.refresh;
                return result;
            },
            res,
            next,
            validators: [validateVars([name, password], ["string", "string"])],
        });
    }
);

AuthRouter.post(
    "/delete",
    AuthMiddleware,
    async function (req: RequestWithBody<UserDeleteBody>, res, next) {
        const { user, password } = req.body;
        defaultResponseHandler({
            getResult: AuthService.deleteUser,
            args: [user.id, password],
            res,
            next,
            validators: [
                validateVars([user.id, password], ["number", "string"]),
            ],
        });
    }
);

export { AuthRouter };
