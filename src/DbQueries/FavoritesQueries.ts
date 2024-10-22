export enum FavoritesQueries {
    createFavorite = `INSERT INTO favorites (productID, userID) VALUES (?, ?);`,
    getFavoriteList = `SELECT favorites.*, products.title, products.description, products.price, products.discount,products.currency
            FROM favorites
            JOIN products 
            ON favorites.productID=products.id WHERE favorites.userID=? LIMIT ?,?;`,
    getFavoriteByProductID = `SELECT favorites.id 
            FROM favorites 
            JOIN products 
            ON favorites.productID=products.id WHERE favorites.userID=? AND favorites.productID=?;`,
    deleteFavoriteById = `DELETE FROM favorites WHERE userID=? AND productID=?;`,
    deleteAllFavorites = `DELETE FROM favorites WHERE userID=?;`,
}
