export interface IRevenueItem {
    _id: string;
    revenueCode: string;
    revenueName: string;
    unit: string;
    amount: number;
    createdBy: string;
    updatedBy: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface RevenueListResponse {
    data: IRevenueItem[];
    page: {
        totalCount: number;
        limit: number;
        page: number;
    };
}

export interface RevenueDetailResponse extends IRevenueItem { }

export interface CreateRevenuePayload {
    revenueName: string;
    unit: string;
    amount: number;
    createdBy?: string;
    updatedBy?: string;
}

export interface UpdateRevenuePayload extends CreateRevenuePayload { }
