/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { LoginRequest, LoginResponse, UserWithPermissions } from '../types/auth';
import { apiEndPoint } from '../services/api';
import axiosAuth from '../services/axiosAuth';

interface AuthState {
    user: UserWithPermissions | null;
    isLoginPending: boolean;
    isLogoutPending: boolean;
    loginError?: {
        errorField?: 'email' | 'password';
        message: string;
    };
    permissionMap: Record<string, Record<string, boolean>>;
}

const initialState: AuthState = {
    user: null,
    isLoginPending: false,
    isLogoutPending: false,
    permissionMap: {},
};

// LOGIN
export const login = createAsyncThunk<
    string,
    LoginRequest,
    { rejectValue: LoginResponse['error'] }
>('auth/login', async (credentials, { rejectWithValue }) => {
    try {
        const res = await axiosAuth.post<LoginResponse>(apiEndPoint.LOGIN, credentials);
        const { token, error } = res.data;

        if (error || !token) return rejectWithValue(error || { message: 'Đăng nhập thất bại' });

        localStorage.setItem('token', token);
        return token;
    } catch (err: any) {
        return rejectWithValue({ message: err.response?.data?.message || 'Lỗi kết nối server' });
    }
});

// GET CURRENT USER
export const getCurrentUser = createAsyncThunk<
    UserWithPermissions,
    void,
    { rejectValue: string }
>('auth/getCurrentUser', async (_, { rejectWithValue }) => {
    try {
        const res = await axiosAuth.get(apiEndPoint.CURRENT_USER, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });

        const { userProfile, permissionListAll } = res.data;

        const user: UserWithPermissions = {
            id: userProfile._id,
            email: userProfile.email,
            roleList: userProfile.roleList,
            permissionListAll,
        };

        return user;
    } catch (err: any) {
        return rejectWithValue('Không thể tải thông tin người dùng');
    }
});

//buildPermissionMap traversing permissionListAll properly
function buildPermissionMap(permissionListAll: any[]): Record<string, Record<string, boolean>> {
    const result: Record<string, Record<string, boolean>> = {};

    for (const block of permissionListAll) {
        for (const module of block.permissionList || []) {
            for (const func of module.functionList || []) {
                const url = func.functionId?.urlFunction;
                if (!url) continue;

                if (!result[url]) result[url] = {};

                for (const action of func.action || []) {
                    result[url][action.name] = action.allowed;
                }
            }
        }
    }

    return result;
}

// SLICE
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            localStorage.removeItem('token');
            state.user = null;
            state.permissionMap = {};
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.isLoginPending = true;
                state.loginError = undefined;
            })
            .addCase(login.fulfilled, (state) => {
                state.isLoginPending = false;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoginPending = false;
                state.loginError = action.payload || { message: 'Đăng nhập thất bại' };
            })
            .addCase(getCurrentUser.fulfilled, (state, action) => {
                state.user = action.payload;
                state.permissionMap = buildPermissionMap(action.payload.permissionListAll || []);
            })
            .addCase(getCurrentUser.rejected, (state) => {
                state.user = null;
                state.permissionMap = {};
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
