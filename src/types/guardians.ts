import dayjs from "dayjs";

export type GuardianRelationship = "Ông" | "Bà" | "Cô" | "Dì" | "Chú" | "Bác" | "Bạn bố mẹ" | "Anh" | "Chị" | "Khác";

export interface IGuardianForm {
    fullName: string;
    dob: dayjs.Dayjs | null; 
    phoneNumber: string;
    relationship: GuardianRelationship;
    relationshipDetail?: string;
    studentId: string;
    parentId?: string;
    pickUpDate: dayjs.Dayjs | null; 
    note?: string;
    createdBy?: string;
    updatedBy?: string;
    active?: boolean;
}

export interface IGuardianPayload {
    fullName: string;
    dob: dayjs.Dayjs | null; 
    phoneNumber: string;
    relationship: GuardianRelationship;
    relationshipDetail?: string;
    studentId: string; 
    parentId?: string; 
    pickUpDate: dayjs.Dayjs | null;
    note?: string;
    createdBy?: string;
    updatedBy?: string;
    active?: boolean;
}

export type CreateGuardianPayload = IGuardianPayload;

export type UpdateGuardianPayload = IGuardianPayload;

export interface IPopulatedParent {
    _id: string;
    fullName: string;
    phoneNumber: string;
}

export interface IPopulatedStudent {
    _id: string;
    fullName: string;
}

export interface IDelegationPeriod {
    fromDate: string; 
    toDate: string; 
}

export interface IGuardianRecord {
    _id: string;
    fullName: string;
    dob: dayjs.Dayjs | null; 
    studentId: IPopulatedStudent;
    parentId?: IPopulatedParent;
    delegationPeriod: IDelegationPeriod;
    phoneNumber: string;
    relationship: GuardianRelationship;
    relationshipDetail?: string;
    note?: string;
    status: string;
    active: boolean;
    createdBy: string;
    updatedBy?: string;
    createdAt: string; 
    updatedAt: string; 
}

export interface IGuardianListResponse {
    message: string;
    count: number;
    data: IGuardianRecord[];
}

export interface IGuardianByIdResponse {
    message: string;
    data: IGuardianRecord;
}