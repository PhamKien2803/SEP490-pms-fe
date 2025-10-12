export interface SchoolYearListItem {
    _id: string;
    schoolyearCode: string;
    startDate: string;
    endDate: string;
    numberTarget: number;
    state: string;
    active: boolean;
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

export interface CreateSchoolYearDto {
    startDate: string;
    endDate: string;
    numberTarget: number;
    createdBy: string;
}

export interface UpdateSchoolYearDto {
    startDate?: string;
    endDate?: string;
    numberTarget?: number;
    createdBy?: string;
}