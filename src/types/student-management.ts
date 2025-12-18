
export interface StudentRecord {
  _id: string;
  studentCode: string;
  fullName: string;
  nickname?: string;
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
      dob: string;
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
      dob: string;
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

export interface UpdateUserData {
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

export interface CreateUserData {
  studentName: string;
  studentDob: string;
  studentIdCard: string;
  studentGender: "Nam" | "Nữ" | "Khác";
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

  imageStudent: string | null;
  birthCertId: string | null;
  healthCertId: string | null;
  relationship: string;
  state?: string;
  statePayment?: string;
  reason?: string;
  active?: boolean;
  createdBy?: string;
  updatedBy?: string;
}


// export type UpdateUserData = CreateUserData