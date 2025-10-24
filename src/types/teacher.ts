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


export interface ITeacherClassStudentResponse {
    teacher: ITeacherInfo;
    schoolYear: ISchoolYearInfo;
    classes: IClassInfo[];
}


//==============================ATTENDANCE=============================

export interface IAttendanceStudentPayload {
    student: string;
    status: 'Có mặt' | 'Vắng mặt có phép' | 'Vắng mặt không phép' | 'Đi muộn';
    note?: string;
}

export interface IAttendanceCreatePayload {
    class: string;
    schoolYear: string;
    date: string;
    students: IAttendanceStudentPayload[];
    takenBy: string;
    generalNote?: string;
}

export interface IAttendanceUpdatePayload {
    class: string;
    schoolYear: string;
    date: string;
    students: IAttendanceStudentPayload[];
    takenBy: string;
    generalNote?: string;
}

export interface IAttendanceDetailResponse {
    _id: string;
    class: {
        _id: string;
        classCode: string;
        className: string;
    };
    schoolYear: {
        _id: string;
        schoolyearCode: string;
        schoolYear: string;
    };
    date: string;
    students: {
        student: {
            _id: string;
            studentCode: string;
            fullName: string;
            dob: string;
            gender: string;
            address: string;
            classGroup: string;
        };
        status: string;
        note?: string;
    }[];
    takenBy: {
        _id: string;
        staffCode: string;
        fullName: string;
        email: string;
    };
    generalNote?: string;
    takenAt: string;
}

export type IAttendanceListResponse = IAttendanceDetailResponse[];

export interface IPaginatedResponse<T> {
  data: T;
  total: number;
  // Add other potential fields like page, limit if your API returns them
}