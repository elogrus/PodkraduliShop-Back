import { db } from "app";
import { LIMIT_GET_FAVORITES_LIST } from "config/main";
import { FavoritesQueries } from "DbQueries/FavoritesQueries";
import { Favorites } from "types/Favorites";
import { ReturnToController } from "types/requestTypes";

export class FavoritesService {
    static createFavorite(
        productID: number,
        userID: number
    ): ReturnToController<string> {
        const isFavorite = FavoritesService.checkFavoriteByProductID(
            userID,
            productID
        );
        if (isFavorite.data?.isFavorite) {
            return {
                code: 403,
                error: "Товар уже в избранном",
            };
        }
        db.prepare(FavoritesQueries.createFavorite).run(productID, userID);
        return {
            code: 200,
            data: "Товар был добавлен в избранное",
        };
    }

    static selectList(
        userID: number,
        start: number,
        count: number
    ): ReturnToController<Favorites[]> {
        if (count > LIMIT_GET_FAVORITES_LIST)
            return {
                code: 400,
                error: `Слишком много товаров (максимум: ${LIMIT_GET_FAVORITES_LIST})`,
            };
        const result = db
            .prepare<[number, number, number], Favorites>(
                FavoritesQueries.getFavoriteList
            )
            .all(userID, start, count);
        return {
            code: 201,
            data: result,
        };
    }

    static checkFavoriteByProductID(
        userID: number,
        productID: number
    ): ReturnToController<{ isFavorite: boolean }> {
        const result = db
            .prepare<[number, number], Favorites>(
                FavoritesQueries.getFavoriteByProductID
            )
            .all(userID, productID);
        return {
            code: 201,
            data: {
                isFavorite: result.length !== 0,
            },
        };
    }

    static deleteById(
        userID: number,
        productID: number
    ): ReturnToController<string> {
        const result = db
            .prepare(FavoritesQueries.deleteFavoriteById)
            .run(userID, productID);
        if (result.changes === 0)
            return {
                code: 404,
                data: "У вас нет избранного товара с таким ID",
            };

        return {
            code: 200,
            data: "Товар был удален из избранного",
        };
    }
    static deleteAll(userID: number): ReturnToController<string> {
        const result = db
            .prepare(FavoritesQueries.deleteAllFavorites)
            .run(userID);
        return {
            code: 200,
            data: "Все избранные товары были удалены",
        };
    }
}
