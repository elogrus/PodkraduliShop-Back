export enum ProductQueries {
    createProduct = `INSERT INTO products (ownerId, title, description, price, currency, discount, attributes, imagesCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    getProduct = `SELECT * FROM products WHERE id=?;`,
    getProductList = `select * from products limit ?,?;`,
    updateProduct = `UPDATE products SET 
        title=?,
        description=?,
        price=?,
        currency=?,
        discount=?,
        attributes=?,
        imagesCount=?
        WHERE id=?;`,
    deleteProductById = `DELETE FROM products WHERE id=?;`,
    deleteAllProducts = `DELETE FROM products WHERE ownerId=?;`,
}
