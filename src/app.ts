// DETAIL_PRODUCT_URL_WITHOUT_ID = "http://localhost:3000/",
// PRODUCTS_URL = "http://localhost:3000/products",

// LOGIN_URL = "http://localhost:3000/login",
// REGISTER_URL = "http://localhost:3001/register",

// USER_AVATAR_WITHOUT_ID = "https://static.vecteezy.com/system/resources/thumbnails/022/963/918/small_2x/ai-generative-cute-cat-isolated-on-solid-background-photo.jpg",
// USER_AVATAR_MINI_WITHOUT_ID = "https://static.vecteezy.com/system/resources/thumbnails/022/963/918/small_2x/ai-generative-cute-cat-isolated-on-solid-background-photo.jpg",
// USER_COMMON_INFO_WITHOUT_ID = "http://localhost:3000/userinfo",

import Database from "better-sqlite3";
import { CORS_ORIGIN, DB_PATH, SERVER_IP, SERVER_PORT } from "config/main";
import { AuthRouter } from "controllers/AuthController";
import { ProductRouter } from "controllers/ProductController";
import { UserRouter } from "controllers/UserController";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

const app = express();

// FOR DEBUG
// export const db = new Database(DB_PATH, { verbose: console.log });
export const db = new Database(DB_PATH);

app.use(
    cors({
        origin: CORS_ORIGIN,
        credentials: true,
    })
);
app.use((req, res, next) => {
    console.log(req.originalUrl);
    next();
});
app.use(express.json());

// JSON error handler
// @ts-ignore
app.use((err, req, res, next) => {
    // @ts-ignore
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        res.status(400).send({ error: "Bad JSON" });
        return;
    }
    next();
});
app.use(cookieParser());
app.use("/product", ProductRouter);
app.use("/auth", AuthRouter);
app.use("/user", UserRouter);

app.listen(SERVER_PORT, SERVER_IP, () => {
    console.log(`Приложение запущено на: ${SERVER_IP}:${SERVER_PORT}`);
});
