export interface RegisterEnrollmentDto {
    studentName: string;
    studentDob: string;
    studentGender: "Nam" | "Nữ" | "Khác";
    studentIdCard: string;
    studentNation: string;
    studentReligion: string;
    nickname?: string;
    address: string;
    fatherName: string;
    fatherPhoneNumber: string;
    fatherEmail: string;
    fatherIdCard: string;
    fatherJob: string;
    fatherDob: string;
    motherName: string;
    motherPhoneNumber: string;
    motherEmail: string;
    motherIdCard: string;
    motherJob: string;
    motherDob: string;
    isCheck: boolean;
}

interface EnrollmentFile {
    _id: string;
    length: number;
    chunkSize: number;
    uploadDate: string;
    filename: string;
}

interface RevenueList {
    amount: string;
    revenueCode: number;
    revenueId: number;
    revenueName: string;
    source: string;
}

interface TuitionDetail {
    createdAt: string;
    month: string;
    receiptCode: number;
    receiptName: number;
    state: string;
    schoolYear: string;
    totalAmount: number;
    tuitionName: number;
    revenueList: RevenueList[];
}

export interface EnrollmentListItem {
    _id: string;
    enrollmentCode: string;
    studentName: string;
    studentDob: string;
    studentGender: "Nam" | "Nữ" | "Khác";
    studentIdCard: string;
    studentNation: string;
    studentReligion: string;
    address: string;
    fatherName: string;
    fatherPhoneNumber: string;
    fatherEmail: string;
    fatherIdCard: string;
    fatherJob: string;
    fatherDob: string;
    motherName: string;
    motherPhoneNumber: string;
    motherEmail: string;
    motherIdCard: string;
    motherJob: string;
    motherDob: string;
    state: string;
    statePayment: string;
    imageStudent: string;
    reason: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    birthCertId: string;
    healthCertId: string;
    birthCertFiles: EnrollmentFile;
    healthCertFiles: EnrollmentFile;
    createdBy: string;
    tuitionDetails: TuitionDetail[];
    totalAmountDue: number;
    nickname?: string;
    updatedBy: string
}

export interface EnrollmentsListResponse {
    data: EnrollmentListItem[];
    page: {
        totalCount: number;
        limit: number;
        page: number;
    };
}

export interface UploadPDFResponse {
    message: string;
    fileId: string;
    fileName: string;
}

export interface ApproveEnrollmentDto {
    _id: string;
    birthCertId: string;
    heathCertId: string;
    approvedBy: string;
}

export interface UpdateEnrollmentDto {
    _id: string;
    enrollmentCode: string;
    studentName: string;
    studentDob: string;
    studentGender: "Nam" | "Nữ" | "Khác";
    studentIdCard: string;
    studentNation: string;
    studentReligion: string;
    address: string;
    fatherName: string;
    fatherPhoneNumber: string;
    fatherEmail: string;
    fatherIdCard: string;
    fatherJob: string;
    fatherDob: string;
    motherName: string;
    motherPhoneNumber: string;
    motherEmail: string;
    motherIdCard: string;
    motherJob: string;
    motherDob: string;
    state: string;
    statePayment: string;
    imageStudent: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    birthCertId: string;
    healthCertId: string;
}

export interface RejectEnrollmentDto {
    _id: string;
    reason: string;
}

export interface UploadImageResponse {
    filename: string;
    url?: string;
    image: string;
}