import { Permission } from "./permission";

export type User = {
    id: string;
    name: string;
    email: string;
    status: AccountStatus;
    role: Role;
    branch: string;
    permissions: Permission[];
};

export enum AccountStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export enum Role {
    Administrator = 'Administrator',
    Accountant = 'Accountant',
    Teacher = 'Teacher',
    Parent = 'Parent',
    Administrative_staff = 'Administrative staff',
}
