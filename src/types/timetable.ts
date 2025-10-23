export interface IScheduleActivity {
    activityCode: string;
    activityName: string;
    type: 'Cố định' | 'Bình thường' | 'Sự kiện';
    startTime: number;
    endTime: number;
    _id: string;
    _justSwapped?: boolean;
}

export interface IScheduleSchoolYearRef {
    _id: string;
    schoolYear: string;
}

export interface IScheduleClassRef {
    _id: string;
    className: string;
}

export interface IDailySchedule {
    date: string;
    dayName: string;
    schoolYear: IScheduleSchoolYearRef;
    class: IScheduleClassRef;
    isHoliday: boolean;
    notes: string;
    activities: IScheduleActivity[];
    status: 'Dự thảo' | 'Xác nhận';
}

export interface IPreviewScheduleResponse {
    schoolYear: string;
    class: string;
    month: string;
    scheduleDays: IDailySchedule[];
}

export type TScheduleDetailResponse = IDailySchedule[];

export interface ICreateSchedulePayload {
    year: string;
    month: string;
    age: string;
}

export type TCreateScheduleResponse = TScheduleDetailResponse;

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

export interface SchoolYearListItem {
    _id: string;
    schoolyearCode: string;
    startDate: string;
    endDate: string;
    numberTarget: number;
    state: string;
    active: boolean;
    enrollmentStartDate: string;
    enrollmentEndDate: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    schoolYear: string;
}

export interface SchoolYearsListResponse {
    data: SchoolYearListItem[];
    page: {
        totalCount: number;
        limit: number;
        page: number;
    };
}

