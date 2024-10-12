import { Request } from "express";

export type RequestWithParams<T> = Request<T>;
export type RequestWithQuery<T> = Request<unknown, unknown, unknown, T>;
export type RequestWithBody<T> = Request<unknown, unknown, T>;

export interface ReturnToController<T> {
    code: number;
    error?: string;
    data?: T;
}
