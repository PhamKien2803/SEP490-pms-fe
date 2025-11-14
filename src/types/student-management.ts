
export interface StudentRecord {
  _id: string;
  studentCode: string;
  fullName: string;
  dob: string;
  idCard: string;
  gender: 'Nam' | 'Nữ' | 'Khác' | string;
  address: string;
  relationship: string;
  nation: string;
  religion: string;
  active: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  birthCertId: string;
  healthCertId: string;
  imageStudent: string;
}

export interface StudentDetailResponses {
  student: StudentRecord;
  parents: {
    father: {
      _id: string;
      parentCode: string;
      fullName: string;
      phoneNumber: string;
      email: string;
      IDCard: string;
      gender: string;
      job: string;
    };
    mother: {
      _id: string;
      parentCode: string;
      fullName: string;
      phoneNumber: string;
      email: string;
      IDCard: string;
      gender: string;
      job: string;
    };
  };
}

export interface PaginationInfo {
  totalCount: number;
  limit: number;
  page: number;
}

export interface StudentResponse {
  data: StudentRecord[];
  page: PaginationInfo;
}

export interface CreateUserData {
  fullName: string;
  dob: string;
  idCard: string;
  gender: string;
  address: string;
  relationship: string;
  nation: string;
  religion: string;
  createdBy?: string;
  updatedBy?: string;
  imageStudent: string;
}

export type UpdateUserData = CreateUserData