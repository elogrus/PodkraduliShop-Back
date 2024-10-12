import { NextFunction, Request, Response } from "express";
import { TokenService } from "services/TokenService";

export const AuthMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const jwt = req.headers["authorization"];
    if (!jwt) {
        res.statusCode = 401;
        res.send({
            error: "Не авторизирован",
        });
        return;
    }
    const user = TokenService.validateAccessToken(jwt);
    if (!user) {
        res.statusCode = 401;
        res.send({
            error: "Недействительный JWT",
        });
        return;
    }
    req.body.user = user;
    next();
};
