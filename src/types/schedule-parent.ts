export interface Student {
    _id: string;
    fullName: string;
    studentCode?: string;
    gender?: string;
}
export interface SchoolYear {
    _id: string;
    schoolYear: string;
}
export interface ClassInfo {
    _id: string;
    classCode: string;
    className: string;
    room?: { roomName: string };
    students?: Student[];
    teachers?: any[];
    schoolYear?: SchoolYear;
    age?: string | number;
    active?: boolean;
}
export interface ClassDetailResponse {
    class: ClassInfo | null;
}