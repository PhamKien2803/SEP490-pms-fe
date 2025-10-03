interface SimpleRole {
    _id: string;
    roleCode: string;
    roleName: string;
}

interface SimpleStaff {
    _id: string;
    staffCode: string;
    fullName: string;
}

export interface AccountListItem {
    _id: string;
    email: string;
    roleList: SimpleRole[];
    isAdmin?: boolean;
    staff?: SimpleStaff;
    createdBy: string;
    updatedBy: string;
}

export interface AccountsListResponse {
    data: AccountListItem[];
    page: {
        totalCount: number;
        limit: number;
        page: number;
    };
}

export interface UpdateAccountDto {
    email: string;
    password?: string;
    roleList: string[];
    isAdmin: boolean;
    updatedBy: string;
}

export interface RoleNameItem {
    _id: string;
    roleCode: string;
    roleName: string;
}