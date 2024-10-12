import { NextFunction, Request, Response } from "express";
import { ReturnToController } from "types/requestTypes";

interface Args<T, N> {
    zodSchema?: Zod.ZodSchema;
    getResult: (...args: any[]) => ReturnToController<T>;
    args: any[];
    middleware?: (data: ReturnToController<T>) => ReturnToController<N>;
    req: Request<any, any, any, any>;
    res: Response;
    next: NextFunction;
    validators?: boolean[];
}

export function defaultResponseHandler<T, N>(options: Args<T, N>) {
    const { zodSchema, getResult, args, middleware, req, res, next } = options;
    try {
        if (zodSchema) {
            const validationResult = zodSchema.safeParse(req);
            if (!validationResult.success) {
                res.statusCode = 422;
                res.send({
                    error: "Invalid data",
                });
            }
        }
        const result = getResult(...args);
        res.statusCode = result.code;
        if (result.error) {
            res.send({
                error: result.error,
            });
            return;
        }
        if (middleware) {
            const middlewareResult = middleware(result);
            res.send({
                data: middlewareResult.data,
            });
            return;
        } else {
            res.send({
                data: result.data,
            });
        }
        next();
    } catch (error) {
        console.error(error);
        res.statusCode = 500;
        res.send({
            error: "Произошла ошибка",
        });
    }
}
