// redux/authSlice.ts
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
}

const initialState: AuthState = {
    user: null,
    isLoginPending: false,
    isLogoutPending: false,
};

// LOGIN
export const login = createAsyncThunk<
    string, // trả về token
    LoginRequest,
    { rejectValue: LoginResponse['error'] }
>('auth/login', async (credentials, { rejectWithValue }) => {
    try {
        const res = await axiosAuth.post<LoginResponse>(apiEndPoint.LOGIN, credentials);
        const { token, error } = res.data;

        if (error || !token) return rejectWithValue(error || { message: 'Đăng nhập thất bại' });

        localStorage.setItem('token', token);
        return token;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        const res = await axiosAuth.get<UserWithPermissions>(apiEndPoint.CURRENT_USER, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });

        return res.data;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    } catch (err: any) {
        return rejectWithValue('Không thể tải thông tin người dùng');
    }
});

// SLICE
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            localStorage.removeItem('token');
            state.user = null;
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
            })
            .addCase(getCurrentUser.rejected, (state) => {
                state.user = null;
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
