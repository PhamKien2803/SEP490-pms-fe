export interface IFileInfo {
    _id: string;
    length: number;
    chunkSize: number;
    uploadDate: string;
    filename: string;
}

export interface IStudent {
    _id: string;
    studentCode: string;
    fullName: string;
    dob: string;
    gender: string;
    address: string;
    birthCertId: string;
    healthCertId: string;
    healthCertFile: IFileInfo | null;
    birthCertFile: IFileInfo | null;
}

export interface IRoomFacility {
    facilityName: string;
    facilityType: string;
    quantity: number;
    quantityDefect: number;
    quantityMissing: number;
    notes: string;
}

export interface IRoom {
    _id: string;
    roomName: string;
    facilities: IRoomFacility[];
}

export interface IClassSchoolYear {
    _id: string;
    schoolYear: string;
    state: string;
}

export interface IClassInfo {
    _id: string;
    classCode: string;
    className: string;
    students: IStudent[];
    teachers: string[];
    room: IRoom;
    schoolYear: IClassSchoolYear;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    age: string;
}

interface ITeacherInfo {
    _id: string;
    fullName: string;
    email: string;
}

interface ISchoolYearInfo {
    _id: string;
    schoolYear: string;
    startDate: string;
    endDate: string;
}

export interface ITeacherClassStudentResponse {
    teacher: ITeacherInfo;
    schoolYear: ISchoolYearInfo;
    classes: IClassInfo[];
}