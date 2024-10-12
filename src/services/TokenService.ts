import {
    JWT_ACCESS_EXPIRES,
    JWT_ACCESS_SECRET_KEY,
    JWT_REFRESH_EXPIRES,
    JWT_REFRESH_SECRET_KEY,
} from "config/main";
import jwt from "jsonwebtoken";

export type JwtPayload = {
    id: number;
    name: string;
    role: string;
};

export class TokenService {
    static generateTokens(payload: JwtPayload): {
        accessToken: string;
        refreshToken: string;
    } {
        const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET_KEY, {
            expiresIn: JWT_ACCESS_EXPIRES,
        });
        const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET_KEY, {
            expiresIn: JWT_REFRESH_EXPIRES,
        });
        return {
            accessToken,
            refreshToken,
        };
    }

    static validateAccessToken(token: string) {
        try {
            const userData = jwt.verify(
                token,
                JWT_ACCESS_SECRET_KEY
            ) as JwtPayload;
            return userData;
        } catch (e) {
            return null;
        }
    }

    static validateRefreshToken(token: string) {
        try {
            const userData = jwt.verify(
                token,
                JWT_REFRESH_SECRET_KEY
            ) as JwtPayload;
            return userData;
        } catch (e) {
            return null;
        }
    }
}
