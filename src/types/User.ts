export interface User {
    id: number;
    name: string;
    role: string;
    about: string;
}

export interface DBUser extends User {
    passwordHash: string;
}
