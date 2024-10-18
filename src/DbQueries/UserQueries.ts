export enum UserQueries {
    createUser = `INSERT INTO users (name, passwordHash) VALUES (?, ?);`,
    changePassword = `UPDATE users SET passwordHash=? WHERE id=?;`,
    changeName = `UPDATE users SET name=? WHERE id=?;`,
    changeAbout = `UPDATE users SET about=? WHERE id=?;`,
    delete = `DELETE FROM users WHERE id=?;`,
    getAllById = `SELECT * FROM users WHERE "id"=?;`,
    getPasswordById = `SELECT passwordHash FROM users WHERE "id"=?;`,
    getPasswordByName = `SELECT passwordHash FROM users WHERE "name"=?;`,
    getNameById = `SELECT name FROM users WHERE "id"=?;`,
    getAllByName = `SELECT * FROM users WHERE "name"=?;`,
}
