import dayjs from "dayjs";

export interface Item {
    name: string;
    label: string
}

export interface ParentInfo {
  _id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
}

export interface StudentListItem {
  _id: string;
  studentCode: string;
  fullName: string;
  dob: dayjs.Dayjs | null; 
  idCard: string;
  gender: 'Nam' | 'Nữ' | 'Khác' | string;
  nation: string;
  religion: string;
}

export interface ParentStudentsListResponse {
  success: boolean;
  parent: ParentInfo;
  students: StudentListItem[];
}


export interface ActivityDetail {
    _id: string;
    activityCode: string;
    activityName: string; 
    type: string;        
    startTime: number;   
    endTime: number;    
    age?: string;        
    category?: string;  
}

