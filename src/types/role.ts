
// Dữ liệu cho một item trong danh sách role
export interface RoleListItem {
    _id: string;
    roleCode: string;
    roleName: string;
}

// Cấu trúc response cho API lấy danh sách role
export interface RolesListResponse {
    data: RoleListItem[];
    page: {
        totalCount: number;
        limit: number;
        page: number;
    };
    createdBy: string;
    updatedBy: string;
}

// Cấu trúc chi tiết của một vai trò (Get By ID)
interface ActionPermissionRole {
    _id: string;
    name: 'view' | 'create' | 'update' | 'delete';
    allowed: boolean;
}

interface FunctionPermission {
    _id: string;
    functionId: string;
    action: ActionPermissionRole[];
}

interface ModulePermission {
    _id: string;
    moduleId: string;
    functionList: FunctionPermission[];
}

export interface RoleDetails extends RoleListItem {
    permissionList: ModulePermission[];
    // createdBy: string;
    // updatedBy: string;
}
// --- DTOs (Data Transfer Objects) cho Create/Update ---

interface ActionDto {
    name: string;
    allowed: boolean;
}

interface FunctionPermissionDto {
    functionId: string;
    action: ActionDto[];
}

interface ModulePermissionDto {
    moduleId: string;
    functionList: FunctionPermissionDto[];
}

export interface CreateRoleDto {
    roleName: string;
    permissionList: ModulePermissionDto[];
    createdBy: string;
}

export interface UpdateRoleDto {
    roleName: string;
    permissionList: ModulePermissionDto[];
    updatedBy: string;
}

export interface RoleListItem {
    _id: string;
    roleCode: string;
    roleName: string;
    createdBy: string;
    updatedBy: string;
}

export interface RoleFunctionItem {
    _id: string;
    functionCode: string;
    functionName: string;
    moduleId: string;
}

export interface RoleModuleItem {
    _id: string;
    moduleCode: string;
    moduleName: string;
}
