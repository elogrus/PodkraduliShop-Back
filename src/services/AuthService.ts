import { db } from "app";
import bcrypt from "bcrypt";
import { SALT } from "config/main";
import { ReturnToController } from "types/requestTypes";
import { TokenService } from "./TokenService";
import { generateKey } from "crypto";
import { ProductService } from "./ProductService";

export type User = {
    id: number;
    name: string;
    passwordHash: string;
    role: string;
};

enum AuthQueries {
    createUser = `INSERT INTO users (name, passwordHash) VALUES (?, ?);`,
    changePassword = `UPDATE users SET passwordHash=? WHERE id=?;`,
    changeName = `UPDATE users SET name=? WHERE id=?;`,
    delete = `DELETE FROM users WHERE id=?;`,
    getAllById = `SELECT * FROM users WHERE "id"=?;`,
    getPasswordById = `SELECT passwordHash FROM users WHERE "id"=?;`,
    getPasswordByName = `SELECT passwordHash FROM users WHERE "name"=?;`,
    getNameById = `SELECT name FROM users WHERE "id"=?;`,
    getAllByName = `SELECT * FROM users WHERE "name"=?;`,
}

export class AuthService {
    static updateToken(
        refreshToken
    ): ReturnToController<{ access: string; refresh: string }> {
        const user = TokenService.validateRefreshToken(refreshToken);
        if (!user) {
            return {
                code: 401,
                error: "Недействительный JWT",
            };
        }
        const token = TokenService.generateTokens({
            id: user.id,
            name: user.name,
            role: user.role,
        });
        return {
            code: 201,
            data: {
                access: token.accessToken,
                refresh: token.refreshToken,
            },
        };
    }
    static register(
        name: string,
        password: string
    ): ReturnToController<{ access: string; refresh: string }> {
        const existAuth = db.prepare(AuthQueries.getAllByName).get(name);
        if (existAuth)
            return {
                code: 400,
                error: "Такой пользователь уже существует",
            };

        const passwordHash = bcrypt.hashSync(password, SALT);
        db.prepare(AuthQueries.createUser).run(name, passwordHash);

        const createdUser = db
            .prepare<string, User>(AuthQueries.getAllByName)
            .get(name);
        const token = TokenService.generateTokens({
            id: createdUser.id,
            name: createdUser.name,
            role: createdUser.role,
        });

        return {
            code: 201,
            data: {
                access: token.accessToken,
                refresh: token.refreshToken,
            },
        };
    }

    static login(
        name: string,
        password: string
    ): ReturnToController<{ access: string; refresh: string }> {
        const result = db
            .prepare<string, { passwordHash: string }>(
                AuthQueries.getPasswordByName
            )
            .get(name);

        if (!result)
            return {
                code: 404,
                error: "Такого пользователя не существует",
            };

        if (!bcrypt.compareSync(password, result.passwordHash))
            return {
                code: 403,
                error: "Неправильный пароль",
            };

        const user = db
            .prepare<string, User>(AuthQueries.getAllByName)
            .get(name);
        const tokens = TokenService.generateTokens({
            id: user.id,
            name: user.name,
            role: user.role,
        });

        return {
            code: 200,
            data: {
                access: tokens.accessToken,
                refresh: tokens.refreshToken,
            },
        };
    }

    static changePassword(
        id: number,
        oldPassword: string,
        newPassword: string
    ): ReturnToController<{ access: string; refresh: string }> {
        const user = db.prepare<number, User>(AuthQueries.getAllById).get(id);
        if (!user) {
            return {
                code: 404,
                error: "Пользователя с таким ID не существует",
            };
        }
        if (!bcrypt.compareSync(oldPassword, user.passwordHash))
            return {
                code: 403,
                error: "Неправильный пароль",
            };

        const newPasswordHash = bcrypt.hashSync(newPassword, SALT);
        db.prepare(AuthQueries.changePassword).run(newPasswordHash, id);
        const tokens = TokenService.generateTokens({
            id: id,
            name: user.name,
            role: user.role,
        });
        return {
            code: 200,
            data: {
                access: tokens.accessToken,
                refresh: tokens.refreshToken,
            },
        };
    }

    static changeName(
        id: number,
        newName: string
    ): ReturnToController<{ access: string; refresh: string }> {
        const user = db.prepare<number, User>(AuthQueries.getAllById).get(id);
        if (!user) {
            return {
                code: 404,
                error: "Пользователя с таким ID не существует",
            };
        }
        db.prepare(AuthQueries.changeName).run(newName, id);
        const tokens = TokenService.generateTokens({
            id: id,
            name: newName,
            role: user.role,
        });
        return {
            code: 200,
            data: {
                access: tokens.accessToken,
                refresh: tokens.refreshToken,
            },
        };
    }

    static deleteUser(id: number, password: string): ReturnToController<string> {
        const result = db
            .prepare<number, { passwordHash: string }>(
                AuthQueries.getPasswordById
            )
            .get(id);

        if (!result)
            return {
                code: 404,
                data: "Такого пользователя не существует",
            };
        if (!bcrypt.compareSync(password, result.passwordHash))
            return {
                code: 403,
                data: "Неправильный пароль",
            };

        ProductService.deleteAllByOwnerId(id);
        db.prepare(AuthQueries.delete).run(id);
        return {
            code: 200,
            data: "Пользователь и все его товары были удалены",
        };
    }
}
