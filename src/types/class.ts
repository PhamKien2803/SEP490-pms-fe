export interface ClassListItem {
    _id: string;
    classCode: string;
    className: string;
    age: string;
    numberStudent: number;
    numberTeacher: number;
    room: string;
    schoolYear: string;
}

export interface ClassListResponse {
    data: ClassListItem[];
    page: {
        totalCount: number;
        limit: number;
        page: number;
    };
}

export interface StudentInClass {
    _id: string;
    studentCode: string;
    fullName: string;
    dob: string;
    gender: string;
}

export interface TeacherInClass {
    _id: string;
    staffCode: string;
    fullName: string;
    email: string;
    phoneNumber: string;
}

export interface ClassDetail {
    _id: string;
    classCode: string;
    className: string;
    age: string;
    active: boolean;
    students: StudentInClass[];
    teachers: TeacherInClass[];
    room: string;
    schoolYear: string;
}

export interface UpdateClassDto {
    className: string;
    age: string;
    room?: string;
    students?: string[];
    teachers?: string[];
}

export interface CreateClassDto {
    className: string;
    age: string;
    room?: string;
    students?: string[];
    teachers?: string[];
}

export interface AvailableRoom {
    _id: string;
    roomName: string;
    roomType: string;
    capacity: number;
}