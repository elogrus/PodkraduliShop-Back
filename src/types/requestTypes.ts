export interface ReturnToController<T> {
    code: number;
    error?: string;
    data?: T;
}
