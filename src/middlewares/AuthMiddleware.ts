import { RequestHandler } from "express";
import { TokenService } from "services/TokenService";
import { User } from "types/User";

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
