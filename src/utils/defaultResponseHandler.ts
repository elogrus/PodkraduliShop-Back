import { NextFunction, Response } from "express";
import { ReturnToController } from "types/requestTypes";

interface Args<T, N> {
    getResult: (...args: any[]) => ReturnToController<any>;
    args: any[];
    middleware?: (data: ReturnToController<T>) => ReturnToController<N>;
    res: Response;
    next: NextFunction;
    validators?: boolean[];
}

export function defaultResponseHandler<T, N = T>(options: Args<T, N>) {
    const {
        getResult,
        args,
        middleware = null,
        res,
        next,
        validators = null,
    } = options;
    if (validators && validators.includes(false)) {
        res.statusCode = 400;
        res.send({
            errorMessage: "Invalid data",
        });
        return;
    }
    try {
        let result = getResult(...args);
        if (middleware && result.code < 400) {
            result = middleware(result);
        }
        res.statusCode = result.code;
        if (result.error) {
            res.send({
                error: result.error,
            });
            return;
        } 
        res.send({
            data: result.data,
        });
        next();
        
    } catch (error) {
        console.error(error);
        res.statusCode = 500;
        res.send({
            error: "Произошла ошибка",
        });
    }
}
