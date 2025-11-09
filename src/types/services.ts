export interface SchoolYearItem {
    _id: string;
    schoolyearCode: string;
    schoolYear: string;
    startDate: string;
    endDate: string;
    numberTarget: number;
    state: string;
    enrollmentStartDate: string;
    enrollmentEndDate: string;
    active: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface SchoolYearListResponse {
    data: SchoolYearItem[];
    page: {
        totalCount: number;
        limit: number;
        page: number;
    };
}

export interface PreviewServiceResponse {
    _id: string;
    schoolYearId: string;
    schoolYear: string;
    revenue: string;
    revenueName: string;
    amount: number;
    imageUniform: string;
}


export interface ServiceDetailResponse {
    _id: string;
    serviceCode: string;
    schoolYearId: string;
    student: string;
    revenue: string;
    imageUniform: string;
    qty: number;
    totalAmount: number;
    createdBy: string;
    updatedBy: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    revenueName: string;
    amount: number;
    unit: string;
}

export interface CreateOrUpdateServicePayload {
    schoolYearId: string;
    student: string;
    schoolYear: string;
    revenue: string;
    revenueName: string;
    amount: number;
    imageUniform: string;
    qty: number;
    totalAmount: number;
    createdBy?: string;
    updatedBy?: string;
}

export interface StudentItem {
    _id: string;
    studentCode: string;
    fullName: string;
    dob: string;
    idCard: string;
    gender: string;
    nation: string;
    religion: string;
}

export interface ParentInfo {
    _id: string;
    fullName: string;
    phoneNumber: string;
    email: string;
}

export interface StudentListByParentResponse {
    success: boolean;
    parent: ParentInfo;
    students: StudentItem[];
}
