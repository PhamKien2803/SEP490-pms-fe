export interface IScheduleActivity {
    activity?: string | null;
    activityCode?: string;
    // activity: string;
    activityName: string;
    type: 'Cố định' | 'Bình thường' | 'Sự kiện' | null;
    startTime: number;
    category?: string | null;
    eventName?: string | null;
    endTime: number;
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
    activity?: string;
    date: string;
    dayName: string;
    isHoliday: boolean;
    notes: string;
    activities: IScheduleActivity[];
    schoolYear?: IScheduleSchoolYearRef;
    class?: IScheduleClassRef;
    status?: 'Dự thảo' | 'Xác nhận';
}


export interface ICreateSchedulePayload {
    schoolYear: string;
    class: string;
    month: string;
    scheduleDays: IDailySchedule[];
}


export interface TScheduleParamsResponse {
    _id: string;
    schoolYear: string;
    className: string;
    month: string;
    class?: IScheduleClassRef;
    status: 'Dự thảo' | 'Xác nhận';
    scheduleDays: IDailySchedule[];
}


export type IUpdateSchedulePayload = ICreateSchedulePayload;

export interface TScheduleByIdResponse {
    _id: string; // đây là ID của toàn bộ lịch
    schoolYear: string;
    class: string;
    month: string;
    status: 'Dự thảo' | 'Xác nhận';
    scheduleDays: IDailySchedule[];
}

export interface IPreviewScheduleResponse {
    _id: string;
    schoolYear: string;
    class: string;
    month: string;
    scheduleDays: IDailySchedule[];
}

export type TScheduleDetailResponse = IDailySchedule[];

export interface TCreateScheduleResponse extends TScheduleDetailResponse { }

// =============================
// 🎓 Class & School Year
// =============================

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
    schoolYear: string;
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
}

export interface SchoolYearsListResponse {
    data: SchoolYearListItem[];
    page: {
        totalCount: number;
        limit: number;
        page: number;
    };
}

export interface AvailableActivityItem {
    _id: string;
    activityCode: string;
    activityName: string;
    type: "Bình thường" | "Sự kiện";
    category: string | null;
    eventName: string | null;
}


export interface FixActivityResponseItem {
    date: string;
    dayName: string;
    isHoliday: boolean;
    notes: string;
    activities: {
        activity: string;
        activityName: string;
        type: 'Cố định' | 'Bình thường' | 'Sự kiện' | null;
        startTime: number;
        endTime: number;
        _justSwapped?: boolean;
    }[];
}

export interface IClassBySchoolYearItem {
    _id: string;
    age: string;
    classCode: string;
    className: string;
    schoolYear?: string;
}
