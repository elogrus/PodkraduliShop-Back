export interface User {
    id: number;
    name: string;
    role: string;
}

export interface DBUser extends User {
    passwordHash: string;
}
