export interface CurriculumItem {
    _id: string;
    activityCode: string;
    activityName: string;
    type: "Cố định" | "Bình thường";
    active: boolean;
    createdBy: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
    age?: number;
    category?: string;
    startTime?: number;
    endTime?: number;
}


export interface GetCurriculumsParams {
    page: number;
    limit: number;
}


export interface CurriculumsListResponse {
    data: CurriculumItem[];
    page: {
        totalCount: number;
        limit: number;
        page: 1;
    };
}


export interface CreateCurriculumDto {
    activityName: string;
    type: "Cố định" | "Bình thường";
    active: boolean;
    createdBy: string;
    updatedBy: string;
    age?: number;
    category?: string;
    startTime?: number;
    endTime?: number;
}


export type UpdateCurriculumDto = Partial<CreateCurriculumDto>;