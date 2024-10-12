// DETAIL_PRODUCT_URL_WITHOUT_ID = "http://localhost:3000/",
// PRODUCTS_URL = "http://localhost:3000/products",

// LOGIN_URL = "http://localhost:3000/login",
// REGISTER_URL = "http://localhost:3001/register",

// USER_AVATAR_WITHOUT_ID = "https://static.vecteezy.com/system/resources/thumbnails/022/963/918/small_2x/ai-generative-cute-cat-isolated-on-solid-background-photo.jpg",
// USER_AVATAR_MINI_WITHOUT_ID = "https://static.vecteezy.com/system/resources/thumbnails/022/963/918/small_2x/ai-generative-cute-cat-isolated-on-solid-background-photo.jpg",
// USER_COMMON_INFO_WITHOUT_ID = "http://localhost:3000/userinfo",

import Database from "better-sqlite3";
import { DB_PATH, SERVER_IP, SERVER_PORT } from "config/main";
import { AuthRouter } from "controllers/AuthController";
import { ProductRouter } from "controllers/ProductController";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from "express";
const { json } = require("body-parser");

const app = express();

export const db = new Database(DB_PATH);
// FOR DEBUG
// export const db = new Database(DB_PATH, { verbose: console.log });
app.use(cors());
// app.use(express.json());
// JSON error handler
app.use(json());
app.use(cookieParser());
app.use("/product", ProductRouter);
app.use("/auth", AuthRouter);

app.listen(SERVER_PORT, SERVER_IP, () => {
    console.log(`Приложение запущено на: ${SERVER_IP}:${SERVER_PORT}`);
});
