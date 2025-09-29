export type LoginErrorField = 'email' | 'password';

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


export interface FunctionPermission {
    functionId: {
        _id: string;
        functionName: string;
        urlFunction: string;
    };
    action: PermissionAction[];
}


export interface ModulePermission {
    moduleId: {
        _id: string;
        moduleName: string;
    };
    functionList: FunctionPermission[];
}

export interface UserWithPermissions {
    id: string;
    email: string;
    roleList: string[];
    permissionListAll: {
        permissionList: ModulePermission[];
    }[];
}


export interface AuthContextType {
    user: UserWithPermissions | null;
    isLoginPending: boolean;
    isLogoutPending: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    hasRole: (role: string) => boolean;
    hasModule: (moduleName: string) => boolean;
    hasFunction: (urlFunction: string) => boolean;
    canAction: (urlFunction: string, actionName: string) => boolean;
}

export interface AuthState {
    user: UserWithPermissions | null;
    isLoginPending: boolean;
    isLogoutPending: boolean;
    loginError?: { errorField?: "email" | "password"; message: string };
    moduleMenu: ModuleMenu[];
    functionItem: FunctionItem[];
    isInitializing: boolean;
}

export const initialState: AuthState = {
    user: null,
    isLoginPending: false,
    isLogoutPending: false,
    moduleMenu: [],
    functionItem: [],
    isInitializing: true,
};

export interface PermissionAction {
    name: string;
    allowed: boolean;
}

export interface FunctionItem {
    functionId: {
        _id: string;
        functionName: string;
        urlFunction: string;
    };
    action: PermissionAction[];
}

export interface ModuleMenu {
    moduleName: string;
    functions: {
        name: string;
        url: string;
    }[];
}



