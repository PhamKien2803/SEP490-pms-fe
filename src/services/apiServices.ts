import { apiEndPoint } from "./api";
import axiosAuth from "./axiosAuth";
import { AxiosError } from "axios";
import type { CreateFunctionDto, CreateParentDto, Functions, FunctionsResponse, LoginRequest, LoginResponse, Parent, ParentsResponse, UpdateFunctionDto, UpdateParentDto } from "../types/auth";
import type { User } from "../types/user";
import { messages } from "../constants/message";

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
