export interface SchoolYear {
    _id: string;
    schoolyearCode: string;
    schoolYear: string;
    startDate: string;
    endDate: string;
    state: string;
    isPublished: boolean;
    active: boolean;
}

export interface ClassStatisticsItem {
    totalClasses: number;
    totalStudents: number;
    schoolYearId: string;
    schoolYear: SchoolYear;
}

export interface GetClassStatisticsResponse {
    success: boolean;
    totalTeachers: number;
    staffCount: number;
    parentCount: number;
    data: ClassStatisticsItem[];
}
