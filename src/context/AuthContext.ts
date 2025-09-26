import { constants } from '@/constants';
import { paths } from '@/routes/paths';
import { authApis, userApis } from '@/services/apiServices';
import { LoginResponse } from '@/types/auth';
import { CookieUtils } from '@/utils/cookies';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { notification } from 'antd';
import { createContext, useContext, ReactNode, useMemo } from 'react';

interface PermissionAction {
    name: string;
    allowed: boolean;
}

interface FunctionPermission {
    functionId: {
        _id: string;
        functionName: string;
        urlFunction: string;
    };
    action: PermissionAction[];
}

interface ModulePermission {
    moduleId: {
        _id: string;
        moduleName: string;
    };
    functionList: FunctionPermission[];
}

export interface UserWithPermissions {
    role: string;
    permissionListAll: { permissionList: ModulePermission[] }[];
    email?: string;
    name?: string;
}

interface AuthContextType {
    user: UserWithPermissions | null;
    isLoginPending: boolean;
    isLogoutPending: boolean;
    login: (email: string, password: string) => Promise<LoginResponse>;
    logout: () => Promise<void>;

    // helpers
    hasModule: (moduleName: string) => boolean;
    hasFunction: (urlFunction: string) => boolean;
    canAction: (urlFunction: string, actionName: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    // LOGIN
    const { mutateAsync: handleLogin, isPending: isLoginPending } = useMutation({
        mutationFn: authApis.login,
        onSuccess: (data: LoginResponse) => {
            if ('token' in data && data.token) {
                CookieUtils.setCookie(constants.TOKEN, data.token);
                refetch(); // ✅ fetch lại user/permission từ API /me
            }
        },
        onError: (error: LoginResponse | Error) => {
            if (error instanceof Error) {
                notification.error({ message: error.message });
            } else if (error.error?.message) {
                notification.error({ message: error.error.message });
            }
        },
    });

    // LOGOUT
    const { mutateAsync: handleLogout, isPending: isLogoutPending } = useMutation({
        mutationFn: authApis.logout,
        onSuccess: () => {
            CookieUtils.deleteCookie(constants.TOKEN);
            sessionStorage.clear();
            window.location.pathname = paths.LOGIN;
        },
    });

    // GET CURRENT USER
    const {
        data: user,
        isFetching,
        isRefetching,
        isFetched,
        refetch,
    } = useQuery<UserWithPermissions>({
        queryKey: ['current-user'],
        queryFn: async () => {
            const user = await userApis.getCurrentUser();
            return user as unknown as UserWithPermissions;
        },
        refetchOnReconnect: true,
        refetchOnWindowFocus: true,
        placeholderData: keepPreviousData,
    });

    // HELPER PERMISSION CHECK
    const permissionMap = useMemo(() => {
        const map = new Map<string, Record<string, boolean>>();

        (user as UserWithPermissions)?.permissionListAll?.forEach((roleBlock) => {
            roleBlock.permissionList.forEach((mod) => {
                mod.functionList.forEach((func) => {
                    const actions: Record<string, boolean> = {};
                    func.action.forEach((a) => {
                        actions[a.name] = a.allowed;
                    });
                    map.set(func.functionId.urlFunction, actions);
                });
            });
        });

        return map;
    }, [user]);

    const hasModule = (moduleName: string): boolean =>
        !!(user as UserWithPermissions)?.permissionListAll?.some((roleBlock) =>
            roleBlock.permissionList.some((m) => m.moduleId.moduleName === moduleName)
        );

    const hasFunction = (urlFunction: string): boolean =>
        permissionMap.has(urlFunction);

    const canAction = (urlFunction: string, actionName: string): boolean => {
        const actions = permissionMap.get(urlFunction);
        return actions?.[actionName] === true;
    };

    if (isFetching && !isRefetching && !isFetched) return null;

   return (
  <AuthContext.Provider
    value={{
      user: user ?? null,
      isLoginPending,
      isLogoutPending,
      login: (email, password) => handleLogin({ email, password }),
      logout: handleLogout,
      hasModule,
      hasFunction,
      canAction,
    }}
  >
    {children}
  </AuthContext.Provider>
);

};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
