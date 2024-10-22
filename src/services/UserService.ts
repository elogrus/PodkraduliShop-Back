import { db } from "app";
import bcrypt from "bcrypt";
import { SALT } from "config/main";
import { UserQueries } from "DbQueries/UserQueries";
import { ReturnToController } from "types/requestTypes";
import { DBUser, User } from "types/User";
import { ProductService } from "./ProductService";
import { TokenService } from "./TokenService";

export class UserService {
    static getUser(id: number): ReturnToController<User> {
        const user = db.prepare<number, DBUser>(UserQueries.getAllById).get(id);
        if (!user)
            return {
                code: 400,
                error: "Такого пользователя не существует",
            };

        return {
            code: 200,
            data: {
                id: user.id,
                name: user.name,
                role: user.role,
                about: user.about,
            },
        };
    }

    static updateToken(
        refreshToken: string
    ): ReturnToController<{ access: string; refresh: string }> {
        const user = TokenService.validateRefreshToken(refreshToken);
        if (!user) {
            return {
                code: 401,
                error: "Недействительный JWT-Refresh",
            };
        }
        const token = TokenService.generateTokens({
            id: user.id,
            name: user.name,
            role: user.role,
            about: user.about,
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
        const existAuth = db.prepare(UserQueries.getAllByName).get(name);
        if (existAuth)
            return {
                code: 400,
                error: "Такой пользователь уже существует",
            };

        const passwordHash = bcrypt.hashSync(password, SALT);
        db.prepare(UserQueries.createUser).run(name, passwordHash);

        const createdUser = db
            .prepare<string, DBUser>(UserQueries.getAllByName)
            .get(name);
        const token = TokenService.generateTokens({
            //@ts-expect-error
            id: createdUser.id,
            //@ts-expect-error
            name: createdUser.name,
            //@ts-expect-error
            role: createdUser.role,
            //@ts-expect-error
            avatarURL: createdUser.avatarURL,
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
                UserQueries.getPasswordByName
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
            .prepare<string, DBUser>(UserQueries.getAllByName)
            .get(name);
        const tokens = TokenService.generateTokens({
            //@ts-expect-error
            id: user.id,
            //@ts-expect-error
            name: user.name,
            //@ts-expect-error
            role: user.role,
            //@ts-expect-error
            about: user.about,
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
        const user = db.prepare<number, DBUser>(UserQueries.getAllById).get(id);
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
        db.prepare(UserQueries.changePassword).run(newPasswordHash, id);
        const tokens = TokenService.generateTokens({
            id: id,
            name: user.name,
            role: user.role,
            about: user.about,
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
        const user = db.prepare<number, DBUser>(UserQueries.getAllById).get(id);
        if (!user) {
            return {
                code: 404,
                error: "Пользователя с таким ID не существует",
            };
        }

        const candidate = db
            .prepare<string, DBUser>(UserQueries.getAllByName)
            .get(newName);
        if (candidate) {
            return {
                code: 400,
                error: "Пользователя с таким именем уже существует",
            };
        }
        db.prepare(UserQueries.changeName).run(newName, id);
        const tokens = TokenService.generateTokens({
            id: id,
            name: newName,
            role: user.role,
            about: user.about,
        });
        return {
            code: 200,
            data: {
                access: tokens.accessToken,
                refresh: tokens.refreshToken,
            },
        };
    }

    static changeAbout(
        id: number,
        about: string
    ): ReturnToController<{ access: string; refresh: string }> {
        const user = db.prepare<number, DBUser>(UserQueries.getAllById).get(id);
        if (!user) {
            return {
                code: 404,
                error: "Пользователя с таким ID не существует",
            };
        }

        db.prepare(UserQueries.changeAbout).run(about, id);
        const tokens = TokenService.generateTokens({
            id: id,
            name: user.name,
            role: user.role,
            about: about,
        });
        return {
            code: 200,
            data: {
                access: tokens.accessToken,
                refresh: tokens.refreshToken,
            },
        };
    }

    static deleteUser(
        id: number,
        password: string
    ): ReturnToController<string> {
        const result = db
            .prepare<number, { passwordHash: string }>(
                UserQueries.getPasswordById
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

        ProductService.deleteById(id);
        db.prepare(UserQueries.delete).run(id);
        return {
            code: 200,
            data: "Пользователь и все его товары были удалены",
        };
    }
}
