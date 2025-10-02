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


//Function type
export interface Functions {
    _id: string;
    functionCode: string;
    functionName: string;
    urlFunction: string;
    active?: boolean;
    createdBy: string;
    updateBy?: string;
}

export interface PaginationInfo {
    totalCount: number;
    limit: number;
    page: number;
}

export interface FunctionsResponse {
    data: Functions[];
    page: PaginationInfo;
}

export interface ParentsResponse {
    data: Parent[];
    page: PaginationInfo;
}

export interface CreateFunctionDto {
    functionName: string;
    urlFunction: string;
    createdBy: string;
}

export interface UpdateFunctionDto {
    functionName?: string;
    urlFunction?: string;
    updatedBy: string;
}

export interface Parent {
    _id: string;
    parentCode: string;
    fullName: string;
    dob: string; // ISO date string
    phoneNumber?: string;
    email?: string;
    IDCard: string;
    gender: "male" | "female" | "other";
    students: string[]; // mảng id của student
    address?: string;
    nation?: string;
    religion?: string;
    createdBy: string;
    updatedBy?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Parent2 {
    fullName?: string;
    dob?: string; // ISO date string
    phoneNumber?: string;
    email?: string;
    gender?: "male" | "female" | "other";
    students?: string[]; // mảng id của student
    address?: string;
    nation?: string;
    religion?: string;
    updatedBy: string;
}


export interface UpdateParentDto {
    fullName?: string;
    dob?: string; // ISO date string
    phoneNumber?: string;
    email?: string;
    gender?: "male" | "female" | "other";
    students?: string[]; // mảng id của student
    address?: string;
    nation?: string;
    religion?: string;
    updatedBy: string;
}

export interface CreateParentDto {
    fullName: string;
    dob: string;
    phoneNumber?: string;
    email?: string;
    IDCard: string;
    gender: "male" | "female" | "other";
    students?: string[];
    address?: string;
    nation?: string;
    religion?: string;
}
