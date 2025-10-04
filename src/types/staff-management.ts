import dayjs from "dayjs";

export type GenderType = 'Nam' | 'Nữ' | 'Khác' | string;

export interface StaffRecord {
    _id: string;
    staffCode: string; 
    fullName: string;
    dob: dayjs.Dayjs | null; 
    email: string;
    IDCard: string; 
    gender: GenderType;
    phoneNumber: string;
    address: string;
    nation: string;
    religion: string;
    isTeacher: boolean; 
    active: boolean; 
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
}

export interface PaginationInfo {
    totalCount: number;
    limit: number;
    page: number;
}

export interface StaffResponse {
    data: StaffRecord[];
    page: PaginationInfo;
}

export interface CreateStaffData {
    fullName: string;
    dob: string;
    email: string;
    IDCard: string;
    gender: GenderType;
    phoneNumber: string;
    address: string;
    nation: string;
    religion: string;
    isTeacher: boolean;
}

export type UpdateStaffData = CreateStaffData 