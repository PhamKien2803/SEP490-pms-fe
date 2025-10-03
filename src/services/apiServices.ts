import { apiEndPoint } from "./api";
import axiosAuth from "./axiosAuth";
import { AxiosError } from "axios";
import type { CreateFunctionDto, CreateParentDto, Functions, FunctionsResponse, LoginRequest, LoginResponse, Parent, ParentsResponse, UpdateFunctionDto, UpdateParentDto } from "../types/auth";
import type { User } from "../types/user";
import { messages } from "../constants/message";
import { CreateRoleDto, RoleDetails, RoleFunctionItem, RoleModuleItem, RolesListResponse, UpdateRoleDto } from "../types/role";
import { CreateUserData, StudentRecord, StudentResponse, UpdateUserData } from "../types/student-management";

export const authApis = {
    login: async (body: LoginRequest): Promise<LoginResponse> => {
        try {
            const response = await axiosAuth.post<LoginResponse>(apiEndPoint.LOGIN, body);
            return response.data;
        } catch (err: AxiosError | unknown) {
            if (err instanceof AxiosError) {
                const errorResponse = err.response?.data;
                return errorResponse;
            }

            return {
                error: {
                    message: messages.AN_UNKNOWN_ERROR_OCCURRED,
                },
            };
        }
    },

    logout: async (): Promise<void> => {
        const response = await axiosAuth.post(apiEndPoint.LOGOUT);
        return response.data;
    },
};

export const userApis = {
    getCurrentUser: async (): Promise<User> => {
        const response = await axiosAuth.get<User>(apiEndPoint.CURRENT_USER);
        return response.data;
    },
}

export const functionsApis = {
    getFunctions: async (params: { page: number, limit: number }): Promise<FunctionsResponse> => {
        const response = await axiosAuth.get<FunctionsResponse>(apiEndPoint.GET_FUNCTION, { params });
        return response.data;
    },

    createFunction: async (body: CreateFunctionDto): Promise<Functions> => {
        const response = await axiosAuth.post<Functions>(apiEndPoint.CREATE_FUNTION, body);
        return response.data;
    },

    updateFunction: async (id: string, body: UpdateFunctionDto): Promise<Functions> => {
        const response = await axiosAuth.put<Functions>(apiEndPoint.UPDATE_FUNCTION(id), body);
        return response.data;
    },

    deleteFunction: async (id: string): Promise<void> => {
        await axiosAuth.post(apiEndPoint.DELETE_FUNCTION(id));
    },
}

export const parentsApis = {
    getParents: async (params: { page: number, limit: number }): Promise<ParentsResponse> => {
        const response = await axiosAuth.get<ParentsResponse>(apiEndPoint.GET_PARENT, { params });
        return response.data;
    },

    createParents: async (body: CreateParentDto): Promise<Parent> => {
        const response = await axiosAuth.post<Parent>(apiEndPoint.CREATE_PARENT, body);
        return response.data;
    },

    updateParents: async (id: string, body: UpdateParentDto): Promise<Parent> => {
        const response = await axiosAuth.put<Parent>(apiEndPoint.UPDATE_PARENT(id), body);
        return response.data;
    },

    deleteParents: async (id: string): Promise<void> => {
        await axiosAuth.delete(apiEndPoint.DELETE_PARENT(id));
    },
}
export const rolesApis = {
    getRolesList: async (params: { page: number, limit: number, query?: string }): Promise<RolesListResponse> => {
        const response = await axiosAuth.get<RolesListResponse>(apiEndPoint.GET_ROLE_LIST, { params });
        return response.data;
    },

    getListFunction: async (): Promise<RoleFunctionItem[]> => {
        const response = await axiosAuth.get<RoleFunctionItem[]>(apiEndPoint.GET_LIST_FUNCTION);
        return response.data;
    },

    getListModule: async (): Promise<RoleModuleItem[]> => {
        const response = await axiosAuth.get<RoleModuleItem[]>(apiEndPoint.GET_LIST_MODULE);
        return response.data;
    },

    getRoleById: async (id: string): Promise<RoleDetails> => {
        const response = await axiosAuth.get<RoleDetails>(apiEndPoint.GET_ROLE_BY_ID(id));
        return response.data;
    },

    createRole: async (body: CreateRoleDto): Promise<RoleDetails> => {
        const response = await axiosAuth.post<RoleDetails>(apiEndPoint.CREATE_ROLE, body);
        return response.data;
    },

    updateRole: async (id: string, body: UpdateRoleDto): Promise<RoleDetails> => {
        const response = await axiosAuth.put<RoleDetails>(apiEndPoint.UPDATE_ROLE(id), body);
        return response.data;
    },

    deleteRole: async (id: string): Promise<void> => {
        await axiosAuth.post(apiEndPoint.DELETE_ROLE(id));
    },
};

export const studentApis = {
    getListStudent: async (params: { page: number, limit: number }): Promise<StudentResponse> => {
        const response = await axiosAuth.get<StudentResponse>(apiEndPoint.GET_LIST_STUDENT, { params });
        return response.data;
    },

    createStudent: async (body: CreateUserData): Promise<StudentRecord> => {
        const response = await axiosAuth.post<StudentRecord>(apiEndPoint.CREATE_STUDENT, body);
        return response.data;
    },

    updateStudent: async (id: string, body: UpdateUserData): Promise<StudentRecord> => {
        const response = await axiosAuth.put<StudentRecord>(apiEndPoint.UPDATE_STUDENT(id), body);
        return response.data;
    },

    deleteStudent: async (id: string): Promise<void> => {
        await axiosAuth.post(apiEndPoint.DELETE_STUDENT(id));
    },
}

