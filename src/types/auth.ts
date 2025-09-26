export enum LoginErrorField {
    EMAIL = 'email',
    PASSWORD = 'password',
}

export type LoginRequest = {
    email: string;
    password: string;
};

export type LoginResponse = {
    token?: string;
    userId?: string;
    error?: {
        errorField?: LoginErrorField;
        message: string;
    };
};
