export interface User {
    id: number;
    name: string;
    email: string;
}

export interface AuthResponse {
    message: string;
    user: User;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}