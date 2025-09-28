/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  LoginRequest,
  LoginResponse,
  UserWithPermissions,
} from "../types/auth";
import { apiEndPoint } from "../services/api";
import axiosAuth from "../services/axiosAuth";

interface AuthState {
  user: UserWithPermissions | null;
  isLoginPending: boolean;
  isLogoutPending: boolean;
  loginError?: { errorField?: "email" | "password"; message: string };
  moduleMenu: ModuleMenu[];
  functionItem: FunctionItem[];
  isInitializing: boolean;
}

const initialState: AuthState = {
  user: null,
  isLoginPending: false,
  isLogoutPending: false,
  moduleMenu: [],
  functionItem: [],
  isInitializing: true,
};

interface PermissionAction {
  name: string;
  allowed: boolean;
}

interface FunctionItem {
  functionId: {
    _id: string;
    functionName: string;
    urlFunction: string;
  };
  action: PermissionAction[];
}

interface ModuleMenu {
  moduleName: string;
  functions: {
    name: string;
    url: string;
  }[];
}

// LOGIN
export const login = createAsyncThunk<
  string,
  LoginRequest,
  { rejectValue: LoginResponse["error"] }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const res = await axiosAuth.post<LoginResponse>(
      apiEndPoint.LOGIN,
      credentials
    );
    const { token, error } = res.data;

    if (error || !token)
      return rejectWithValue(error || { message: "Đăng nhập thất bại" });

    localStorage.setItem("token", token);
    return token;
  } catch (err: any) {
    return rejectWithValue({
      message: err.response?.data?.message || "Lỗi kết nối server",
    });
  }
});

// GET CURRENT USER
export const getCurrentUser = createAsyncThunk<
  UserWithPermissions,
  void,
  { rejectValue: string }
>("auth/getCurrentUser", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosAuth.get(apiEndPoint.CURRENT_USER, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
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
    return rejectWithValue("Không thể tải thông tin người dùng");
  }
});

function buildModuleMenu(permissionListAll: { permissionList: any[] }[]): ModuleMenu[] {
  const map = new Map<string, ModuleMenu>();

  for (const block of permissionListAll) {
    for (const module of block.permissionList) {
      const moduleName = module.moduleId.moduleName;

      if (!map.has(moduleName)) {
        map.set(moduleName, { moduleName, functions: [] });
      }

      const menu = map.get(moduleName)!;

      for (const func of module.functionList) {
        if (!menu.functions.find(f => f.url === func.functionId.urlFunction)) {
          menu.functions.push({
            name: func.functionId.functionName,
            url: func.functionId.urlFunction,
          });
        }
      }
    }
  }

  return Array.from(map.values());
}


// SLICE
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem("token");
      state.user = null;
      state.moduleMenu = [];
      state.functionItem = [];
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
        state.loginError = action.payload || { message: "Đăng nhập thất bại" };
      })
      .addCase(getCurrentUser.pending, (state) => {
        state.isInitializing = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.moduleMenu = buildModuleMenu(action.payload.permissionListAll || []);
        state.isInitializing = false;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.user = null;
        state.isInitializing = false;
        localStorage.removeItem("token");
      })
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
