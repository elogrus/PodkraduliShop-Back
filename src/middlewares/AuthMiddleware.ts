import { RequestHandler } from "express";
import { TokenService } from "services/TokenService";

export const AuthMiddleware: RequestHandler = (req, res, next) => {
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
    res.locals.user = user;
    next();
};

export const AuthAdminMiddleware: RequestHandler = (req, res, next) => {
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
    if (user.role !== "admin") {
        res.statusCode = 403;
        res.send({
            error: "У вас недостаточно прав",
        });
        return;
    }
    res.locals.user = user;
    next();
};
