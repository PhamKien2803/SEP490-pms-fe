export interface HealthCertFile {
    _id: string;
    length: number;
    chunkSize: number;
    uploadDate: string;
    filename: string;
}

export interface StudentInfo {
    _id: string;
    studentCode: string;
    fullName: string;
    dob: string;
    gender: 'Nam' | 'Nữ' | string;
    address: string;
    healthCertId: string;
}

export interface PhysicalDevelopment {
    height: number;
    weight: number;
    bodyMassIndex: number;
    evaluation: string;
}

export interface ComprehensiveExamination {
    mentalDevelopment: string;
    motorDevelopment: string;
    diseasesDetected: string[];
    abnormalSigns: string[];
    diseaseRisk: string[];
    notes: string;
}

export interface Conclusion {
    healthStatus: string;
    advice: string;
}

export interface HealthCertCreateData {
    class: string;
    schoolYear: string;
    student: string; 
    physicalDevelopment: PhysicalDevelopment;
    comprehensiveExamination: ComprehensiveExamination;
    conclusion: Conclusion;
    createdBy: string;
    updatedBy: string;
}

export type HealthCertUpdateData = HealthCertCreateData; 

export interface HealthCertRecord {
    _id: string;
    student: StudentInfo;
    physicalDevelopment: PhysicalDevelopment;
    comprehensiveExamination: ComprehensiveExamination;
    conclusion: Conclusion;
    createdBy: string;
    updatedBy: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
    healthCertFiles: HealthCertFile;
}

export interface PaginationInfo {
    totalCount: number;
    limit: number;
    page: number;
}

export interface HealthCertListResponse {
    data: HealthCertRecord[];
    page: PaginationInfo;
}
